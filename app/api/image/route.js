import { saveRequest } from '../../../lib/kmulter.js'; // This "relative path stuff" is a little upsetting.

export const dynamic = 'force-dynamic' // defaults to auto
// I have no idea what this does --Mark

const failureResponse = new Response(
    null, { status: 500, }
);

export async function GET(request) {
    console.debug("GET", request.url);
    
    const response = new Response(null, {
        status: 501, // Method not implemented.
    });

    console.debug("Respond:", response.status, response.body);
    return response;
}

export async function POST(request) {
    console.debug("POST", request.url);

    let response = failureResponse;
    
    try {
        const uploadPaths = await saveRequest(request);
        response = Response.json(uploadPaths, {status: 200});
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
            console.log("/api/Unknown error:");
            console.debug("POST", request.url);
            console.debug(request);
            response = failureResponse;
        }
    }
    
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response;
}