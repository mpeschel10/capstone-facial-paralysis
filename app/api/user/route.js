import argon2 from "argon2";

import { pool } from "@/lib/database";
import { parseRequest } from "@/lib/kmulter";
import { response200JSON, response400MissingParameter, response403Forbidden, response409UserExists, response500InternalServerError } from "@/lib/responses";
import { requestToPayload } from "@/lib/kjwt";

export const dynamic = true;

export async function GET(request) {
    console.debug("GET /api/user", request.url);
    
    const [rows, fields] = await pool.promise().query("SELECT id, username, kind, clinician_id FROM user LEFT OUTER JOIN patient ON user.id = patient.patient_id");
    const response = Response.json(rows);
    
    console.debug("Respond", response.status, Object.fromEntries(response.headers));
    return response;
}

export async function POST(request) {
    console.debug("POST /api/user");
    const [errorResponse, payload] = requestToPayload(request);
    if (errorResponse !== null) return errorResponse;
    if (payload.kind !== "ADMIN") return response403Forbidden(`User ${payload.username} is not allowed to create users.`);

    const {username, password, kind} = await parseRequest(request);
    if (username === undefined || password === undefined || kind == undefined)
        return response400MissingParameter({username, password, kind});
    
    const hash = await argon2.hash(password);
    const query = "INSERT INTO user (username, password, kind) VALUES (?, ?, ?)";
    const query_parameters = [username, hash, kind];
    try {
        const [rows, _] = await pool.promise().execute(query, query_parameters);
        return response200JSON({user_id: rows.insertId, username, kind});
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
