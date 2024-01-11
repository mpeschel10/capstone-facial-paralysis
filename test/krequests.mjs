// Knockoff of the requests module from Python.
// All this does is follow the Set-Cookie header.

import needle from "needle";

export class Session {
    cookies = {};

    post(url, options) { return this.do("POST", url, options); }
    get(url, options) { return this.do("GET", url, options); }

    async do(method, url, options={}) {
        options.cookies = Object.assign({}, this.cookies, options.cookies);
        const response = await needle(method, url, null, options);
        // Unfortunately, this approach discards the time of the cookie and all the security stuff as well.
        Object.assign(this.cookies, response.cookies);
        return response;
    }

}

