import readlinePackage from "node:readline";
const readline = readlinePackage.createInterface({
    input: process.stdin,
    output: process.stdout,
});

import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";


let driver = null;

// Utility I use while writing tests. 
function fetchEnter() { return new Promise(resolve => {
        readline.question("Press enter key to continue.", resolve);
    })
}

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



const SERVER_URL = "http://localhost:3000";

const screen = {
    width: 640,
    height: 480
};



async function test_e2e_login() {
    const endpoint = SERVER_URL + '/login';
    console.debug("Get", endpoint);
    await driver.get(endpoint);
    console.debug("Fill in username");
    await driver.findElement(By.id('text-username')).sendKeys('mpeschel');
    console.debug("Fill in password");
    await driver.findElement(By.id('password-password')).sendKeys('mpeschel_password');
}

async function test_e2e_upload() {
    const endpoint = SERVER_URL + '/home';
    console.debug("Get", endpoint);
    await driver.get(endpoint);
    console.debug("Click link to new progress report");
    await driver.findElement(By.id('a-progress-new')).click();
    
    await fetchEnter();

    // I would expect something like, eight placeholder images (sketches) to indicate appearence.
    // Then you click on each of them and you do the picture.
}

async function main() {
    parser.namespace.headless = false;
    parser.actions["--headless"] = () => { parser.namespace.headless = true; };
    
    parser.namespace.full = false;
    parser.actions["--full"] = () => { parser.namespace.full = true; };
    
    console.log("Raw arguments: ", process.argv);
    const args = parser.parse_args();
    console.log("Parsed arguments: ", args);
    console.log(args.headless);
    console.log(args.full);
    
    let driverPromise = new Builder().forBrowser("firefox");
    if (args.headless) {
        driverPromise = driverPromise
            .setFirefoxOptions(new firefox.Options().headless().windowSize(screen));
    }
    console.info("Getting driver...");
    driver = await driverPromise.build();
    
    try {
        let tests = [
            test_e2e_login,
            test_e2e_upload,
        ];
        
        if (!args.full) {
            tests = [ test_e2e_upload ];
        }
        
        for (const test_method of tests) {
            console.debug("Begin test method", test_method.name);
            await test_method();
            console.info("Finished test method", test_method.name);
        }
    } finally {
        await driver.quit();
    }
    
    process.exit();
}

main();
