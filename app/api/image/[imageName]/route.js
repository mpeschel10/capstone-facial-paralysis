// import { saveRequest } from '../../../lib/kmulter.js'; // This "relative path stuff" is a little upsetting.

import path from "node:path";
import fs from "node:fs";

import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'


export const dynamic = 'force-dynamic' // defaults to auto
// I have no idea what this does --Mark

export async function GET(request, paramsWrapper) {
    const {params} = paramsWrapper;
    const {imageName} = params;
    console.log(paramsWrapper);
    console.log(params);
    console.log(imageName);
    console.log("/api/image GET ", request);
    console.log("/api/image GET ", imageName);
    const filePath = path.join("public/uploads", imageName);
    const stat = fs.statSync(filePath);
    // console.log(stat);

    const nodeStream = fs.createReadStream(filePath);
    const ecmaStream = ReadableStream.from(nodeStream);
    const response = new Response(
        ecmaStream,
        {
            status: 200,
            headers: {
                'Content-Type': 'image/jpeg',
                'Content-Length': stat.size
            },
        }
    );

    return response;
}

