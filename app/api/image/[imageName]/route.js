import path from "node:path";

import jsonwebtoken from "jsonwebtoken";

import { UPLOADS_DIR } from "@/constants/index.js";

import { pool } from "@/lib/database";
import { response200File, response401NoToken, response401BadToken } from "@/lib/responses";

export const dynamic = "force-dynamic" // defaults to auto
// I have no idea what this does --Mark

function chompLeft(s, format) {
    if (!s.startsWith(format)) return null;
    return s.substring(format.length);
}

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
        return response403Forbidden(`User ${token.username} is not allowed to access ${imageName}`);
    
    return response200File(filePath);
}

