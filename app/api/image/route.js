import { Readable } from 'node:stream';
import busboy from 'busboy';

export const dynamic = 'force-dynamic' // defaults to auto
// I have no idea what this does --Mark

export async function GET(request) {
    // If you have a file named route.js,
    //  then any request for that file's parent folder (in this case, /api)
    //  will be treated as GET/POST/WHATEVER calls to route.js
    console.log('GET', request);

    const data = ['Example: GET requests to /api will receive this JSON object.'];
     
    return Response.json({ data });
}

export async function POST(request) {
    const headers = Object.fromEntries(request.headers);
    // console.debug("/api/image POST headers:", headers);
    const bb = busboy({ headers });
    
    // From https://github.com/mscdex/busboy examples.
    bb.on('file', (name, file, info) => {
        const { filename, encoding, mimeType } = info;
        console.log(
        `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
        filename,
        encoding,
        mimeType
        );
        file.on('data', (data) => {
        console.log(`File [${name}] got ${data.length} bytes`);
        }).on('close', () => {
        console.log(`File [${name}] done`);
        });
    });
    bb.on('field', (name, val, info) => {
        console.log(`Field [${name}]: value: %j`, val);
    });
    bb.on('close', () => {
        console.log('Done parsing form!');
    });
    
    // In next.js, request.body is the ECMA standard "ReadableStream",
    //  https://developer.mozilla.org/en-US/docs/Web/API/Request/body
    //  which is not directly compatible with the Node.js "stream.Writeable"
    //  https://nodejs.org/api/stream.html#readablepipedestination-options
    //  which busboy accepts pipe from.
    // We can use stream.Readable.from to convert,
    //  since ReadableStream is an asyncIterator or something:
    //  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols
    const bodyReadable = Readable.from(request.body);
    
    // If we respond to the client before bb consumes the body,
    //  the body will be discarded and we'll get "unexpected end of form" errors.
    // Therefore, we must await the stream's "close" event before responding.
    const bodyConsumedPromise = new Promise(
        (resolve, reject) => bodyReadable.on("close", resolve)
    );
    bodyReadable.pipe(bb);
    await bodyConsumedPromise;
    
    const data = ['Example: POST requests to /api will receive this JSON object.'];
    return Response.json({ data });
}