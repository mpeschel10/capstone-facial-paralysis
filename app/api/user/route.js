import argon2 from "argon2";

import { signUser } from "@/lib/kjwt";
import { pool } from "@/lib/database";
import { parseRequest } from "@/lib/kmulter";

export const dynamic = true;

const failureResponse = new Response(
    null, { status: 500, }
);

export async function GET(request) {
    console.debug('GET /api/user', request.url);
    
    const [rows, fields] = await pool.promise().query('SELECT id, username, kind, clinician_id FROM user LEFT OUTER JOIN patient ON user.id = patient.patient_id');
    const response = Response.json(rows);
    
    console.debug('Respond', response.status, Object.fromEntries(response.headers));
    return response;
}

export async function POST(request) {
    console.debug('POST /api/user');

    let response = failureResponse;
    const {username, password, kind} = await parseRequest(request);
    if (username !== undefined && password !== undefined && kind !== undefined) {
        const hash = await argon2.hash(password);
        const query = 'INSERT INTO user (username, password, kind) VALUES (?, ?, ?)';
        const query_parameters = [username, hash, kind];
        try {
            const [rows, _] = await pool.promise().execute(query, query_parameters);
            const token = signUser(rows.insertId, username, kind);
            response = Response.json(token, {status: 200});
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                const responseBody = `Error: Duplicate username\r\nThe username "${username}" is already taken.\r\nPlease choose another.`;
                response = Response.json(responseBody, {status:409});
            } else {
                console.error("Unhandled error!");
                console.log(error.code);
                console.error(error);
            }
        }
    } else {
        const messageParts = [
            "Error: Missing parameter",
            "You must define username, password, and kind. You gave:",
            `username: ${username}`,
            `password: ${password}`,
            `kind: ${kind}`
        ];
        response = Response.json(messageParts.join("\n"), {status: 400});
}
    
    console.debug('Respond', response.status, Object.fromEntries(response.headers));
    return response;
}
