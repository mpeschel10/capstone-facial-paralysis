import jwt from "jsonwebtoken";
import argon2 from "argon2";

import { ERROR_RESPONSE } from "@/constants";

import { parseRequest } from "@/lib/kmulter";
import { response400MissingParameter, response403WrongPassword } from "@/lib/responses";
import { pool } from "@/lib/database";

export async function POST(request) {
    console.debug("POST /api/login");
    let response = ERROR_RESPONSE;

    const { username, password } = await parseRequest(request);
    if ([username, password].some(v => v === undefined)) {

        response = response400MissingParameter({ username, password});
        console.debug("Respond", response.status, Object.fromEntries(response.headers));
        return response;
    }

    const [[row], _] = await pool.promise().execute(
        "SELECT id, password FROM user WHERE username = ?",
        [username]
    );
    const expectedHash = row.password;
    console.debug("Comparing ", expectedHash, " with", password)
    if (!await argon2.verify(expectedHash, password))
    {
        response = response403WrongPassword({ username });
        console.debug("Respond", response.status, Object.fromEntries(response.headers));
        return response;
    }
    
    const token = jwt.sign(
        { user_id: row.id, username },
        process.env.FA_TEST_JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: "2h",
        }
    );
    response = Response.json(token, {status:200});
    console.debug("Respond", response.status, Object.fromEntries(response.headers));
    return response;
}