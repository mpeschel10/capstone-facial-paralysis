import readlinePackage from "node:readline";
const readline = readlinePackage.createInterface({
    input: process.stdin,
    output: process.stdout,
});

import path from "node:path";
const rootDir = path.resolve(".");
const resourcesDir = path.join(rootDir, "test", "resources");

import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";


const SERVER_URL = "http://localhost:3000";

const screen = {
    width: 640,
    height: 480
};

let driver = null;
function getDriver({headless}) {
    let driverPromise = new Builder().forBrowser("firefox");
    if (headless) {
        driverPromise = driverPromise
            .setFirefoxOptions(new firefox.Options().headless().windowSize(screen));
    }
    console.info("Getting driver...");
    return driverPromise.build();
}

async function login(driver, username, password) {
    // TODO
}


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



async function test_e2e_login() {
    const endpoint = SERVER_URL + '/login';
    console.debug("Get", endpoint);
    await driver.get(endpoint);
    console.debug("Fill in username");
    await driver.findElement(By.id('text-username')).sendKeys('mpeschel');
    console.debug("Fill in password");
    await driver.findElement(By.id('password-password')).sendKeys('mpeschel_password');
    console.debug("Cookies:", await driver.manage().getCookies());
}

async function test_e2e_upload() {
    await login(driver, "mpeschel", "mpeschel_password");
    
    const endpoint = SERVER_URL + "/home";
    console.debug("Get", endpoint);
    await driver.get(endpoint);
    console.debug("Click link to new progress report");
    await driver.findElement(By.id("a-progress-new")).click();
    
    const reportParts = [
        ["at", "rest"], ["big", "smile"], ["eyebrows", "up"], ["eyes", "closed"],
        ["lips", "puckered"], ["lower", "teeth", "bared"], ["nose", "wrinkle"],
    ];

    console.debug("Attach images to form.")
    for (const reportPart of reportParts) {
        const inputId = "file-" + reportPart.join("-");
        const imagePath = path.join(resourcesDir, `mpeschel_${reportPart.join("_")}.jpg`);
        await driver.findElement(By.id(inputId)).sendKeys(imagePath);
    }
    
    console.debug("Click submit");
    await driver.findElement(By.id("submit-message")).click();

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
    
    driver = await getDriver(args);
    
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
