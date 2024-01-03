import argon2 from "argon2";

import { pool } from "@/lib/database";
import { parseRequest } from "@/lib/kmulter";
import { response200Login, response400MissingParameter, response409UserExists, response500InternalServerError } from "@/lib/responses";

export const dynamic = true;

export async function GET(request) {
    console.debug('GET /api/user', request.url);
    
    const [rows, fields] = await pool.promise().query('SELECT id, username, kind, clinician_id FROM user LEFT OUTER JOIN patient ON user.id = patient.patient_id');
    const response = Response.json(rows);
    
    console.debug('Respond', response.status, Object.fromEntries(response.headers));
    return response;
}

export async function POST(request) {
    console.debug('POST /api/user');

    const {username, password, kind} = await parseRequest(request);
    if (username === undefined || password === undefined || kind == undefined)
        return response400MissingParameter({username, password, kind});
    
    const hash = await argon2.hash(password);
    const query = 'INSERT INTO user (username, password, kind) VALUES (?, ?, ?)';
    const query_parameters = [username, hash, kind];
    try {
        const [rows, _] = await pool.promise().execute(query, query_parameters);
        return response200Login(rows.insertId, username, kind);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return response409UserExists(username);
        } else {
            console.error("Unhandled error!");
            console.log(error.code);
            console.error(error);
            return response500InternalServerError();
        }
    }
    
}
