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
let driverPromise = null;
export async function open({headless}) {
    console.debug("Setting driver options:", {headless});
    driverPromise = new Builder().forBrowser("firefox");
    if (headless) {
        driverPromise = driverPromise
            .setFirefoxOptions(new firefox.Options().headless().windowSize(screen));
    }
}

export async function getDriver() {
    if (driver === null) {
        if (driverPromise === null) {
            open({headless:false});
        }
        console.info("Getting driver...");
        driver = await driverPromise.build();
    }
    return driver;
}

export async function close() {
    if (driver !== null) {
        logging.debug("Closing driver...");
        await driver.quit();
        driver = null;
    }
}

// Utility I use while writing tests. 
function fetchEnter() { return new Promise(resolve => {
        readline.question("Press enter key to continue.", resolve);
    })
}




export async function testE2eLogin() {
    const driver = await getDriver();

    const endpoint = SERVER_URL + "/login";
    console.debug("Get", endpoint);
    await driver.get(endpoint);
    console.debug("Fill in username");
    await driver.findElement(By.id("text-username")).sendKeys("mpeschel");
    console.debug("Fill in password");
    await driver.findElement(By.id("password-password")).sendKeys("mpeschel_password");
    console.debug("Click submit button");
    await driver.findElement(By.id("submit-login")).click();
    
    const jwtCookie = await driver.manage().getCookie("fa-test-session-jwt");
    if (jwtCookie === undefined || jwtCookie === null) {
        console.warn("Failure on test test_e2e_login: cookie fa-test-session-jwt not set despite logging in.");
        return false;
    } else {
        console.debug("Got login cookie of some kind OK");
    }
    
    const url = await driver.getCurrentUrl();
    const pathname = new URL(url).pathname;
    const ok = pathname === "/dashboard"; // Admin home page
    console.debug("Was redirected to path", pathname, ok ? "OK" : "Error: expected /dashboard but got " + pathname);
    return ok;
}

export async function testE2eUpload() {
    const driver = await getDriver();
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
    return true;
}
