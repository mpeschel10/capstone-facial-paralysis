import { makeLoginCookie } from "@/lib/kjwt";
import { ERROR_RESPONSE } from "@/constants";
import fs from "node:fs";

const listFormatter = new Intl.ListFormat("en");

export function response200File(filePath) {
    const stat = fs.statSync(filePath);

    const nodeStream = fs.createReadStream(filePath);
    const ecmaStream = ReadableStream.from(nodeStream);
    const response = new Response(
        ecmaStream,
        {
            status: 200,
            headers: {
                "Content-Type": "image/jpeg",
                "Content-Length": stat.size
            },
        }
    );

    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response;
}

export function response200JSON(object, headers=undefined) {
    const response = Response.json(object, {status: 200, headers: headers});
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response;
}

export function response200Login(user_id, username, kind) {
    return Response.json(
        {user_id, username, kind},
        { headers: {"Set-Cookie": makeLoginCookie(user_id, username, kind)}}
    );
}

export function response400Custom(message) {
    const response = Response.json(message, {status: 400});
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response;
}

export function response400MissingContentType(endpoint) {
    const messageParts = [
        "Error: Missing Content-Type",
        `The ${endpoint} endpoint expects a multipart/form-data encoded message.`,
        "You must include an appropriate Content-Type header.",
    ];
    const response = Response.json(messageParts.join("\n"), {status: 400});
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response;
}

export function response400MissingParameter(parameters) {
    const parameterNames = listFormatter.format(Object.keys(parameters));
    const messageParts = [
        "Error: Missing parameter",
        `You must define ${parameterNames}. You gave:`,
    ].concat(
        Object.entries(parameters).map(([key, value]) => `${key}: ${value}`)
    );
    const response = Response.json(messageParts.join("\r\n"), {status:400});
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response;
}

export function response401NoCookie() {
    const response = Response.json([
        "Error: No authorization token",
        "To access this resource, you must provide a JWT string in the fa-test-session-jwt cookie, like:",
        "Cookie: fa-test-session-jwt=${jwt}",
        "You can get a JWT string by POSTing to /api/login.",
    ].join("\r\n"), {status:401});
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response;
}

export function response401BadAuthorization(observed, expected) {
    if (observed === undefined || expected === undefined) {
        throw new Error("Called response401BadAuthorization with observed or expected undefined.");
    }
    const response = Response.json([
        "Error: Bad authorization header",
        "To access this resource, you must provide an Authorization header formatted like this:",
        expected,
        "You provided this:",
        observed,
    ].join("\r\n"), {status:401});
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response;
}

export function response401WrongPassword(username) {
    const response = Response.json(`Error: Wrong password\r\nWrong password for account ${username}`, {status:401});
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response
}

export function response403Forbidden(reason) {
    const response = Response.json(`Error: Forbidden\r\n${reason}`, {status:403});
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response
}

export function response409UserExists(username) {
    const response = Response.json(
        `Error: Duplicate username\r\nThe username "${username}" is already taken.\r\nPlease choose another.`,
        {status:409}
    );
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response
}

export function response500InternalServerError() {
    const response = ERROR_RESPONSE;
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response;
}
