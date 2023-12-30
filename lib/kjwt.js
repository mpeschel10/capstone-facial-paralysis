import { sign, verify } from "jsonwebtoken";

import { response401BadToken, response401NoToken } from "@/lib/responses";
import { chompLeft } from "@/lib/utils";

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
    const authHeader = request.headers.get("Authorization");
    if (authHeader === null) return [response401NoToken(), null];

    const jwt = chompLeft(authHeader, "Bearer ");
    if (jwt === null) return [response401BadToken(authHeader, "Bearer ${jwt}"), null]

    const payload = verify(jwt, process.env.FA_TEST_JWT_SECRET);
    return [null, payload];
}

