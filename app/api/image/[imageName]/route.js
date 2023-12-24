import path from "node:path";

import { ERROR_RESPONSE, UPLOADS_DIR } from "@/constants/index.js";

import { pool } from "@/lib/database";
import { response200File, response401NoToken } from "@/lib/responses";

export const dynamic = "force-dynamic" // defaults to auto
// I have no idea what this does --Mark

export async function GET(request, paramsWrapper) {
    const {params} = paramsWrapper;
    const {imageName} = params;
    
    console.log("GET ", request.url);

    const filePath = path.join(UPLOADS_DIR, imageName);
    
    // TODO: make this debug/testing only.
    if (imageName === "cat.jpg") {
        return response200File(filePath);
    }

    const authorization = request.headers.get('Authorization');
    if (authorization === null) {
        return response401NoToken();
    }
    
    return ERROR_RESPONSE;
}

