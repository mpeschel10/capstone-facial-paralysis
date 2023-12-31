import path from "node:path";

import { UPLOADS_DIR } from "@/constants/index.js";

import { pool } from "@/lib/database";
import { response200File, response403Forbidden } from "@/lib/responses";
import { requestToPayload } from "@/lib/kjwt";

export const dynamic = "force-dynamic" // defaults to auto
// I have no idea what this does --Mark

export async function GET(request, paramsWrapper) {
    const {params} = paramsWrapper;
    const {imageName} = params;
    
    console.log("GET ", request.url);

    const filePath = path.join(UPLOADS_DIR, imageName);
    
    const [errorResponse, payload] = requestToPayload(request);
    if (errorResponse !== null) return errorResponse;
    
    if (payload.kind !== "ADMIN")
    {
        const target = new URL(request.url).pathname;
        const params = [ target, payload.user_id ];
        console.log(params);
        const [rows, _] = await pool.promise().execute(
            "SELECT file_visibility.user_id FROM file_visibility JOIN file ON file_visibility.file_id = file.id WHERE file.url = ? AND file_visibility.user_id = ?",
            params
        );
        console.log(rows);
        if (rows.length === 0) return response403Forbidden(`User ${payload.username} is not allowed to access ${target}`);
    }
    
    return response200File(filePath);
}

