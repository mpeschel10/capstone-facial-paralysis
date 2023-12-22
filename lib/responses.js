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
