import child_process from "node:child_process";

import { testPostApiLoginJson, testOld, testGetApiImage } from "./test_unit.mjs";
import * as test_e2e from "./test_e2e.mjs";
const { testE2eLogin, testE2eUpload, testE2eViewExistingImage } = test_e2e;


const parser = {
    namespace: {},
    actions: {},

    parse_args() {
        for (const argument of process.argv)
            if (this.actions[argument] !== undefined)
            this.actions[argument]();
        return this.namespace;
    }
}

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
    
    parser.namespace.headless = false;
    parser.actions["--headless"] = () => { parser.namespace.headless = true; };
    
    parser.namespace.full = false;
    parser.actions["--full"] = () => { parser.namespace.full = true; };
    
    parser.namespace.quiet = false;
    parser.actions["--quiet"] = () => { parser.namespace.quiet = true; };
    
    const args = parser.parse_args();
    // console.log("Raw arguments: ", process.argv);
    // console.log("Parsed arguments: ", args);

    test_e2e.open({headless: args.headless});

    let testMethods = [
        testPostApiLoginJson,
        testOld,
        testGetApiImage,
        
        testE2eLogin,
        // testE2eViewExistingImage,
        // testE2eUpload,
    ];
    if (!args.full) testMethods = [ testE2eViewExistingImage ];

    if (args.quiet) {
        console.debug = () => {};
        console.log = () => {};
    }

    // TODO: Something about launching the driver and the server simultaneously, then await Promise.all. Faster.
    // TODO: Use an actual selenium framework or selenium server or whatever.
    await untilServerUp();
    let allOk = true;
    try {
        console.info("Start of tests.");
        for (const testMethod of testMethods) {
            console.debug("Begin test method", testMethod.name);
            try {
                allOk = allOk && await testMethod();
                if(allOk) {
                    console.info("Test method OK", testMethod.name);
                } else {
                    console.error("Test method ERROR", testMethod.name);
                    break;
                }
            } catch(error) {
                allOk = false;
                console.error("Test method ERROR", testMethod.name);
                console.error(error);
                break;
            }
        }
    } finally {
        await test_e2e.close();
    }

    if(allOk) {
        console.info("Tests complete OK");
    } else {
        console.error("Tests complete some ERRORS");
    }

    process.exit();
}

main();

