import argon2 from "argon2";

import { ERROR_RESPONSE } from "@/constants";

import { signUser } from "@/lib/kjwt";
import { parseRequest } from "@/lib/kmulter";
import {
    response200JSON, response400Custom, response400MissingParameter,
    response401BadAuthorization, response401WrongPassword
} from "@/lib/responses";
import { pool } from "@/lib/database";
import { chompLeft } from "@/lib/utils";
import { verify } from "jsonwebtoken";

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
    
    try {
        const {username, password} = await parseRequest(request);
        if (username === undefined || password === undefined) return [
            response400MissingParameter({ username, password}), null
        ];
        return [null, {username, password}];
    } catch (error) {
        console.error(error.message);
        if (error.message === "Missing Content-Type") {
            return [response400Custom(
                "Error: No arguments\r\n" + 
                "The /api/login POST endpoint expects a username, password pair.\r\n" +
                "Either send an Authorization: Basic header, an x-www-form-urlencoded body, or a multipart/form-data encoded body.",
            ), null];
        } else {
            throw error;
        }
    }
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
    const expireTime = verify(token, process.env.FA_TEST_JWT_SECRET).exp;
    const expireString = new Date(expireTime * 1000).toUTCString();
    const cookie = `fa-test-session-jwt=${token}; Expires ${expireString}; Secure; HttpOnly`;
    
    return response200JSON(token, {"Set-Cookie": cookie});
}