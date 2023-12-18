import { saveRequest } from '../../../lib/kmulter.js'; // This "relative path stuff" is a little upsetting.

export const dynamic = 'force-dynamic' // defaults to auto
// I have no idea what this does --Mark

export async function GET(request) {
    console.log(request);
    return Response.json({ failure: "Failrure"});
}

export async function POST(request) {
    const uploadPaths = await saveRequest(request);
    
    const response = new Response(new Blob(), {
        status: 303,
        headers: {
            Location: "/",
        },
    });
    return response;
}