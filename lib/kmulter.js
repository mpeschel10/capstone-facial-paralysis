import fs from "node:fs";
import { Readable } from "node:stream";

import busboy from "busboy";

import { UPLOADS_DIR } from "@/constants/index.js";

function saveFile(fieldName, stream, info, uploadsDir=UPLOADS_DIR) { return new Promise((resolve, reject) => {
	const { filename, encoding, mimeType } = info;
	console.log(`kmulter: File [${fieldName}]: filename: ${filename}, encoding: ${encoding}, mimeType: ${mimeType}`);

	const destName = filename;
	const destPath = uploadsDir + "/" + destName;
	
	fs.writeFile(destPath, "", error => error && reject(error));

	stream.on("data", (data) => {
		fs.appendFile(destPath, data, error => error && reject(error));
	}).on("close", () => {
		console.log(`kmulter: File [${fieldName}] done`);
		resolve(`api/image/${destName}`);
	});
})}

// If you respond to the client before bb consumes the body,
//  the body will be discarded and you'll get "unexpected end of form" errors.
// Therefore, when you call saveRequest, you must always await it
//  before returning so Next.js does not discard your body early.
export function saveRequest(request, uploadsDir=UPLOADS_DIR) { return new Promise((resolve, reject) => {
    const headers = Object.fromEntries(request.headers);
    // console.debug("/api/image POST headers:", headers);
    const bb = busboy({ headers });

    const pathPromises = [];
    const fields = {};
    
    // Based on the https://github.com/mscdex/busboy examples.
    bb.on("file", (fieldName, stream, info) => {
        pathPromises.push(
            saveFile(fieldName, stream, info, uploadsDir)
        );
    });
    bb.on("field", (fieldName, value, _) => {
        console.log(`kmulter: bb field: ${fieldName}: ${value}`);
        fields[fieldName] = value;
    });
    bb.on("close", () => {
        Promise.all(pathPromises)
            .then(paths => resolve({fields, paths}));
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
    bodyReadable.pipe(bb);
});}


export function parseRequest(request) { return new Promise((resolve, reject) => {
    const bb = busboy({headers: Object.fromEntries(request.headers)});
    const fields = {};
    bb.on("field", (fieldName, value, info) => {
        fields[fieldName] = value;
    });
    bb.on("error", (error) => { reject(error); });
    bb.on("close", () => { resolve(fields); });

    const nodeBody = Readable.from(request.body);
    nodeBody.pipe(bb);
});}