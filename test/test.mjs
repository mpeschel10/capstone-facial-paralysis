import child_process from "node:child_process";

import { testPostApiLoginJson } from "./test_unit.mjs";

async function untilServerUp() {
    const endpoint = "http://127.0.0.1:3000";

    const waitRatio = 1.5;
    let waitTime = 200;
    while (true) {
        try {
            // console.debug("Checking if server is up...");
            const response = await fetch(endpoint);
            return;
        } catch (error) {
            // console.debug("Server not up; waiting", waitTime);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            waitTime *= waitRatio;
        }
    }
}

async function main() {
    child_process.exec("test/ensure_server_up.sh");
    await untilServerUp();
    
    // Start up the server
    console.info("Start of tests.");

    const testMethods = [testPostApiLoginJson];
    for (const testMethod of testMethods) {
        console.debug("Begin test method", testMethod.name);
        const ok = await testMethod();
        if (ok) {
            console.info("Test method OK", testMethod.name);
        } else {
            console.error("Test method ERROR", testMethod.name);
            break;
        }
    }

    process.exit();
}

main();
