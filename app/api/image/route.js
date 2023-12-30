import { requestToPayload } from "@/lib/kjwt.js";
import { ERROR_RESPONSE } from "@/constants/index.js";
import { saveRequest } from "@/lib/kmulter.js";
import { response200JSON } from "@/lib/responses";
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

    let response = ERROR_RESPONSE;
    try {
        const {fields, paths} = await saveRequest(request);
        return response200JSON(paths);
    } catch (error) {
        if (error.message === "Missing Content-Type") {
            const messageParts = [
                "Error: " + error.message,
                "The /api/image endpoint expects a multipart/form-data encoded message.",
                "You must include an appropriate Content-Type header.",
                "Field name does not matter. You can upload multiple files at a time.",
            ];
            response = Response.json(messageParts.join("\n"), {status: 400});
        } else {
            console.error("/api/Unknown error:");
            console.error("POST", request.url);
            console.error(request);
            console.error(error);
        }
    }
    
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response;
}