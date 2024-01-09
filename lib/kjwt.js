import { cookies } from "next/headers";

import { sign, verify } from "jsonwebtoken";

import { response401NoCookie } from "@/lib/responses";

export function signUser(user) {
    return sign(
        user,
        process.env.FA_TEST_JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: "2h",
        }
    );
}

export function requestToPayload(request) {
    let jwt = cookies().get('fa-test-session-jwt')?.value;
    if (jwt === undefined) return [response401NoCookie(), null];

    const payload = verify(jwt, process.env.FA_TEST_JWT_SECRET);
    return [null, payload];
}

export function makeLoginCookie(user) {
    const token = signUser(user);
    const expireTime = verify(token, process.env.FA_TEST_JWT_SECRET).exp;
    const expireString = new Date(expireTime * 1000).toUTCString();
    return `fa-test-session-jwt=${token}; Expires ${expireString}; Secure; HttpOnly; Path=/`;
}

