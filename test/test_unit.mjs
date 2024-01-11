import child_process from "node:child_process";

const SERVER_URL = "http://127.0.0.1:3000";

import { decode } from "urlsafe-base64";

import { resetUploads, resetDb } from "./test_lib.mjs";
import * as requests from "./krequests.mjs";

function eq(expected, observed) {
    // Awful hack that works well enough for now.
    return JSON.stringify(observed) === JSON.stringify(expected);
}

export async function testPostApiLoginJson() {
    const endpoint = SERVER_URL + "/api/login.json";
    
    const username = "jmiranda";
    const password = "jmiranda_password";
    const Authorization = `Basic ${btoa(username + ":" + password)}`;

    try {
        const result = await fetch(endpoint,
            {
                method: "POST",
                headers: {Authorization},
            }
        );
        
        // If response.status === 401, then authentication failed e.g. wrong username or password.
        // In this case, I assume response.status === 200
        
        const jwt = await result.json();
        const payloadString = decode(jwt.split(".")[1]).toString("utf-8");
        const payload = JSON.parse(payloadString);
        console.debug("Got payload as user", payload.username);
        
        return payload.username === "jmiranda" && payload.user_id === 3 && payload.kind === "ADMIN";
    } catch (error) {
        // Error may be thrown if server is not up.
        console.error("Error:", error);
    }
    return false;
    
}

export async function testOld() {
    const result = await new Promise(
        resolve => child_process.exec("python test/test.py", (error, stdout, stderr) => resolve([error, stdout, stderr]))
    );
    const [error, stdout, stderr] = result;
    console.log(stdout);
    console.log(stderr);
    
    return error === null;
}

const loginEndpoint = SERVER_URL + "/api/login";
async function login(session, username, password) {
    const Authorization = `Basic ${btoa(username + ":" + password)}`;
    await session.post(
        loginEndpoint,
        {
            headers: {Authorization},
            follow_max: 0,
        }
    );
}

function logout(session) {
    delete session.cookies["fa-test-session-jwt"];
}

export async function testGetApiImage() {
    await resetUploads();
    await resetDb();

    let allOk = true;
    const s = new requests.Session();
    
    let testName = "GET /api/image admin";
    await login(s, "mpeschel", "mpeschel_password") // badger beaver dog owl
    console.debug(`Begin test ${testName}`);
    let expected = [
        {'id': 1, 'url': '/api/image/badger.jpg'},
        {'id': 2, 'url': '/api/image/beaver.jpg'},
        {'id': 3, 'url': '/api/image/dog.jpg'},
        {'id': 4, 'url': '/api/image/owl.jpg'},
    ];
    let observed = (await s.get(SERVER_URL + "/api/image")).body;
    if (!eq(expected, observed)) {
        console.warn(`Test ${testName} failed: Expected\n(await s.get(SERVER_URL + "/api/image")).body ===\n${JSON.stringify(expected)} but got\n${JSON.stringify(observed)}`);
        allOk = false;
    }

    
    testName = "GET /api/image rculling beaver owl";
    await login(s, "rculling", "rculling_password") // beaver owl
    console.debug(`Begin test ${testName}`);
    expected = [
        {'id': 2, 'url': '/api/image/beaver.jpg'},
        {'id': 4, 'url': '/api/image/owl.jpg'},
    ];
    observed = (await s.get(SERVER_URL + "/api/image")).body;
    if (!eq(expected, observed)) {
        console.warn(`Test ${testName} failed: Expected\n(await s.get(SERVER_URL + "/api/image")).body ===\n${JSON.stringify(expected)} but got\n${JSON.stringify(observed)}`);
        allOk = false;
    }
    
    
    await login(s, "radler", "radler_password") // dog owl
    testName = "GET /api/image radler dog owl";
    console.debug(`Begin test ${testName}`);
    expected = [
        {'id': 3, 'url': '/api/image/dog.jpg'},
        {'id': 4, 'url': '/api/image/owl.jpg'},
    ];
    observed = (await s.get(SERVER_URL + "/api/image")).body;
    if (!eq(expected, observed)) {
        console.warn(`Test ${testName} failed: Expected\n(await s.get(SERVER_URL + "/api/image")).body ===\n${JSON.stringify(expected)} but got\n${JSON.stringify(observed)}`);
        allOk = false;
    }
    
    logout(s); // 401 Unauthorized
    testName = "GET /api/image unauthorized";
    console.debug(`Begin test ${testName}`);
    expected = 401;
    observed = (await s.get(SERVER_URL + "/api/image")).statusCode;
    // Why do all these libraries have to set their own names for these things?
    // PHP http_response_code.
    // (await fetch(...)).status)
    // Python requests.get(...).status_code
    // Can't you just pick an existing library to copy?
    
    if (!eq(expected, observed)) {
        console.warn(`Test ${testName} failed: Expected\n(await s.get(SERVER_URL + "/api/image")).status ===\n${JSON.stringify(expected)} but got\n${JSON.stringify(observed)}`);
        allOk = false;
    }

    return allOk
}
