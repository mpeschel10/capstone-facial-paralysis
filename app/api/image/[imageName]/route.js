import path from "node:path";

import jsonwebtoken from "jsonwebtoken";

import { UPLOADS_DIR } from "@/constants/index.js";

import { pool } from "@/lib/database";
import { response200File, response401NoToken, response401BadToken, response403Forbidden } from "@/lib/responses";
import { chompLeft } from "@/lib/utils";

export const dynamic = "force-dynamic" // defaults to auto
// I have no idea what this does --Mark

export async function GET(request, paramsWrapper) {
    const {params} = paramsWrapper;
    const {imageName} = params;
    
    console.log("GET ", request.url);

    const filePath = path.join(UPLOADS_DIR, imageName);
    // TODO: make this debug/testing only.
    if (imageName === "cat.jpg") return response200File(filePath);
    
    const authorization = request.headers.get('Authorization');
    if (authorization === null) return response401NoToken();
    
    const jwt = chompLeft(authorization, "Bearer ");
    if (jwt === null) return response401BadToken(authorization, "Bearer ${jwt}");
    
    const token = jsonwebtoken.verify(jwt, process.env.FA_TEST_JWT_SECRET);
    if (token.kind !== "ADMIN")
    {
        const target = new URL(request.url).pathname;
        const params = [ target, token.user_id ];
        console.log(params);
        const [rows, _] = await pool.promise().execute(
            "SELECT file_visibility.user_id FROM file_visibility JOIN file ON file_visibility.file_id = file.id WHERE file.url = ? AND file_visibility.user_id = ?",
            params
        );
        console.log(rows);
        if (rows.length === 0) return response403Forbidden(`User ${token.username} is not allowed to access ${target}`);
    }
    
    return response200File(filePath);
}

