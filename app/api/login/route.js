import { requestToUser } from "@/lib/login";
import { response303Login } from "@/lib/responses";

export async function POST(request) {
    console.debug("POST /api/login");

    const [errorResponse, user] = await requestToUser(request);
    if (errorResponse !== null) return errorResponse;
    
    return response303Login(user);
}