import path from "node:path";
import fs from "node:fs";

import { UPLOADS_DIR } from "../../../../constants/index.js";

export const dynamic = "force-dynamic" // defaults to auto
// I have no idea what this does --Mark

export async function GET(request, paramsWrapper) {
    const {params} = paramsWrapper;
    const {imageName} = params;
    
    console.log("GET ", request.url);
    const filePath = path.join(UPLOADS_DIR, imageName);
    const stat = fs.statSync(filePath);

    const nodeStream = fs.createReadStream(filePath);
    const ecmaStream = ReadableStream.from(nodeStream);
    const response = new Response(
        ecmaStream,
        {
            status: 200,
            headers: {
                "Content-Type": "image/jpeg",
                "Content-Length": stat.size
            },
        }
    );

    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response;
}

