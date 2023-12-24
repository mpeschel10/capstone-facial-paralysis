import fs from "node:fs";

const listFormatter = new Intl.ListFormat("en");

export function response400MissingParameter(parameters) {
    const parameterNames = listFormatter.format(Object.keys(parameters));
    const messageParts = [
        "Error: Missing parameter",
        `You must define ${parameterNames}. You gave:`,
    ].concat(
        Object.entries(parameters).map(([key, value]) => `${key}: ${value}`)
    );
    return Response.json(messageParts.join("\r\n"), {status:400});
}

export function response403WrongPassword(username) {
    return Response.json(`Error: Wrong password\r\nWrong password for account ${username}`, {status:403});
}

export function response401NoToken() {
    return Response.json([
        "Error: No authorization token",
        "To access this resource, you must provide a JWT string in the Authorization header, like:",
        "Authorization: Bearer ${token}",
        "You can get a JWT string by POSTing to /api/login and stripping the quotes off the response body.",
    ].join("\r\n"), {status:401});
}

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
