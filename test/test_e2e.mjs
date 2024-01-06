import readlinePackage from "node:readline";
const readline = readlinePackage.createInterface({
    input: process.stdin,
    output: process.stdout,
});

import { Builder, By } from "selenium-webdriver";

// Utility I use while writing my code. 
function fetchEnter() { return new Promise(resolve => {
        readline.question("Press enter key to continue.", resolve);
    })
}

const SERVER_URL = "http://localhost:3000";

async function test_e2e_login() {
    await driver.get(SERVER_URL + '/login');
    await driver.findElement(By.id('text-username')).sendKeys('mpeschel');
    await driver.findElement(By.id('password-password')).sendKeys('mpeschel_password');
}

const driver = await new Builder().forBrowser("firefox").build();
try {
    const tests = [test_e2e_login];
    for (const test_method of tests) {
        await test_method();
    }
} finally {
    await driver.quit();
}

process.exit();
