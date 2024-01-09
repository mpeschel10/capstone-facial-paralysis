import { testPostApiLoginJson } from "./test_unit.mjs";

(async () => {
    console.info("Start of tests.");

    const testMethods = [testPostApiLoginJson];
    for (const testMethod of testMethods) {
        console.debug("Begin test method", testMethod.name);
        const ok = testMethod();
        if (ok) {
            console.info("Test method OK", testMethod.name);
        } else {
            console.error("Test method ERROR", testMethod.name);
            break;
        }
    }

    process.exit();
})();
