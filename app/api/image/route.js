import jsonwebtoken from "jsonwebtoken";

import { requestToPayload } from "@/lib/kjwt.js";
import { ERROR_RESPONSE } from "@/constants/index.js";
import { saveRequest } from "@/lib/kmulter.js";

export const dynamic = "force-dynamic" // defaults to auto
// I have no idea what this does --Mark


export async function GET(request) {
    console.debug("GET", request.url);
    
    const [errorResponse, payload] = requestToPayload(request);
    if (errorResponse !== null) return errorResponse;

    // console.debug("Respond:", response.status, response.body);
    return ERROR_RESPONSE;
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
        response = Response.json(paths, {status: 200});
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