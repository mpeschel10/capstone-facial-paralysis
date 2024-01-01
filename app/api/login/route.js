import argon2 from "argon2";

import { ERROR_RESPONSE } from "@/constants";

import { signUser } from "@/lib/kjwt";
import { parseRequest } from "@/lib/kmulter";
import { response200JSON, response400MissingParameter, response401BadAuthorization, response401WrongPassword } from "@/lib/responses";
import { pool } from "@/lib/database";
import { chompLeft } from "@/lib/utils";

async function requestToUsernamePassword(request) {
    const authorizationHeader = request.headers.get("Authorization");
    if (authorizationHeader !== null) {
        const usernamePassword = chompLeft(authorizationHeader, "Basic ");
        if (usernamePassword !== null) {
            const [username, password] = atob(usernamePassword).split(":");
            if (password === undefined) return [
                response401BadAuthorization(`Basic btoa(${atob(usernamePassword)})`, "Basic btoa(username + ':' + password)"), null
            ];
            return [null, {username, password}];
        }
    }
    const {username, password} = await parseRequest(request);
    if (username === undefined || password === undefined) return [
        response400MissingParameter({ username, password}), null
    ];
    return [null, {username, password}];
}

export async function POST(request) {
    console.debug("POST /api/login");

    const [errorResponse, usernamePassword] = await requestToUsernamePassword(request);
    if (errorResponse !== null) return errorResponse;
    const { username, password } = usernamePassword;

    const [[row], _] = await pool.promise().execute(
        "SELECT id, password, kind FROM user WHERE username = ?",
        [username]
    );
    const expectedHash = row.password;
    if (!await argon2.verify(expectedHash, password)) return response401WrongPassword({ username });
    
    const token = signUser(row.id, username, row.kind);
    return response200JSON(token, {status:200});
}