import argon2 from "argon2";

import { ERROR_RESPONSE } from "@/constants";

import { signUser } from "@/lib/kjwt";
import { parseRequest } from "@/lib/kmulter";
import { response200JSON, response400MissingParameter, response401WrongPassword } from "@/lib/responses";
import { pool } from "@/lib/database";

export async function POST(request) {
    console.debug("POST /api/login");
    let response = ERROR_RESPONSE;

    const { username, password } = await parseRequest(request);
    if (username === undefined || password === undefined) return response400MissingParameter({ username, password});

    const [[row], _] = await pool.promise().execute(
        "SELECT id, password, kind FROM user WHERE username = ?",
        [username]
    );
    const expectedHash = row.password;
    if (!await argon2.verify(expectedHash, password)) return response401WrongPassword({ username });
    
    const token = signUser(row.id, username, row.kind);
    return response200JSON(token, {status:200});
}