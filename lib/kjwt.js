import { cookies } from "next/headers";

import { sign, verify } from "jsonwebtoken";

import { response401NoToken } from "@/lib/responses";

export function signUser(user_id, username, kind) {
    return sign(
        { user_id, username, kind },
        process.env.FA_TEST_JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: "2h",
        }
    );
}

export function requestToPayload(request) {
    let jwt = cookies().get('fa-test-session-jwt')?.value;
    if (jwt === undefined) return [response401NoToken(), null];

    const payload = verify(jwt, process.env.FA_TEST_JWT_SECRET);
    return [null, payload];
}

