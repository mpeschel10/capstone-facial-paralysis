import { requestToUser } from "@/lib/login.js";
import { response200LoginJson } from "@/lib/responses";

export async function POST(request) {
    console.debug("POST /api/login.json");

    const [errorResponse, user] = await requestToUser(request);
    if (errorResponse !== null) return errorResponse;
    
    return response200LoginJson(user);
}