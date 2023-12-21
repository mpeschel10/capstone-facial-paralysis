import { ERROR_RESPONSE } from "@/constants";

import { parseRequest } from "@/lib/kmulter";
import { response400MissingParameter } from "@/lib/responses";

export async function POST(request) {
    console.debug("POST /api/login");
    let response = ERROR_RESPONSE;

    const { username, password } = await parseRequest(request);
    if ([username, password].some(v => v === undefined)) {

        response = response400MissingParameter({ username, password});
    }
    
    console.debug("Respond", response.status, Object.fromEntries(response.headers));
    return response;
}