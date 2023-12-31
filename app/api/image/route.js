import { requestToPayload } from "@/lib/kjwt.js";
import { ERROR_RESPONSE } from "@/constants/index.js";
import { saveRequest } from "@/lib/kmulter.js";
import { response200JSON, response400MissingContentType, response500InternalServerError } from "@/lib/responses";
import { pool } from "@/lib/database";

export const dynamic = "force-dynamic" // defaults to auto
// I have no idea what this does --Mark


export async function GET(request) {
    console.debug("GET", request.url);
    
    const [errorResponse, payload] = requestToPayload(request);
    if (errorResponse !== null) return errorResponse;

    if (payload.kind === "ADMIN") {
        const [rows, _] = await pool.promise().execute(
            "SELECT id, url FROM file"
        );
        return response200JSON(rows);
    }

    const [rows, _] = await pool.promise().execute(
        "SELECT file.id, file.url FROM file JOIN file_visibility ON file.id = file_visibility.file_id WHERE file_visibility.user_id = ?",
        [payload.user_id]
    );
    return response200JSON(rows);
}


export async function POST(request) {
    console.debug("POST", request.url);
    
    const [errorResponse, payload] = requestToPayload(request);
    if (errorResponse !== null) return errorResponse;
    // At this time, all users are allowed to upload images without limit,
    //  so no further verification of the token is needed.

    try {
        const {fields, paths} = await saveRequest(request);
        for (const path of paths) {
            const [insertResult, _] = await pool.promise().execute(
                "INSERT INTO file (url, owner_id) VALUES (?, ?);",
                ["/" + path, payload.user_id]
            );
            await pool.promise().execute(
                "INSERT INTO file_visibility (file_id, user_id) VALUES (?, ?);",
                [insertResult.insertId, payload.user_id]
            );
        }
        return response200JSON(paths);
    } catch (error) {
        if (error.message === "Missing Content-Type") {
            return response400MissingContentType("/api/image POST");
        } else {
            console.error("/api/Unknown error:");
            console.error("POST", request.url);
            console.error(request);
            console.error(error);
            return response500InternalServerError();
        }
    }
}