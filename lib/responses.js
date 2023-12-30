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

export function response200JSON(object) {
    const response = Response.json(object, {status: 200});
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

export function response401NoToken() {
    const response = Response.json([
        "Error: No authorization token",
        "To access this resource, you must provide a JWT string in the Authorization header, like:",
        "Authorization: Bearer ${token}",
        "You can get a JWT string by POSTing to /api/login and stripping the quotes off the response body.",
    ].join("\r\n"), {status:401});
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response;
}

export function response401BadToken(observed, expected="Bearer ${jwt}") {
    if (observed === undefined || expected === undefined) {
        throw new Error("Called response401BadToken with observed or expected undefined.");
    }
    const response = Response.json([
        "Error: Bad authorization token",
        "To access this resource, you must provide a JWT string formated like this:",
        expected,
        "You provided this:",
        observed,
        "You can get a JWT string by POSTing to /api/login and stripping the quotes off the response body.",
    ].join("\r\n"), {status:401});
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response;

}

export function response403WrongPassword(username) {
    const response = Response.json(`Error: Wrong password\r\nWrong password for account ${username}`, {status:403});
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response
}

export function response403Forbidden(reason) {
    const response = Response.json(`Error: Unauthorized\r\n${reason}`, {status:403});
    console.debug("Respond:", response.status, Object.fromEntries(response.headers));
    return response
}

