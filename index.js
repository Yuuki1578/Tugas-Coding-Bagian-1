/* 

========== Copyright (c) 2025 Awang ==========
This file is licensed under the MIT License (MIT).

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 

*/

"use strict";

const { By, Key, Builder, Browser } = require('selenium-webdriver');
const fs = require("node:fs");

const targetUrl = "https://indonesiaindicator.com/home";
const absoluteWaitDuration = 5000;
const featuresAssertion = {
    title: "Indonesia Indicator",
};

const AutomataError = 0x00;
const AutomataWarn = 0x01;
const AutomataInfo = 0x02;

const loggerAutomata = {
    prefix: function (logLevel) {
        switch (logLevel) {
            case AutomataError:
                return "[ERROR]";
            case AutomataWarn:
                return "[WARN]";
            case AutomataInfo:
                return "[INFO]";
            default:
                throw new Error("Invalid log level");
        }
    },

    writer: "log.txt",

    log: function (logLevel, message) {
        const logMessage = `${this.prefix(logLevel)} ${new Date().toISOString()}: ${message}\n`;
        fs.appendFile(this.writer, logMessage, (err) => {
            if (err) {
                console.error("Internal error: failed to write log:", err);
                throw err;
            }
        });
    }
};

async function assertTitle(driver, expectedTitle) {
    let runtimeTitle = await driver.getTitle();
    if (runtimeTitle !== expectedTitle) {
        loggerAutomata.log(AutomataError, `Expected title: "${expectedTitle}", got: "${runtimeTitle}"`);
    } else {
        loggerAutomata.log(AutomataInfo, `Assertion success: "${expectedTitle}" === "${runtimeTitle}"`);
    }
}

(async function main() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    await driver.get(targetUrl);
    driver.manage().setTimeouts({ implicit: absoluteWaitDuration });

    await assertTitle(driver, featuresAssertion.title);
    let title = driver.findElement(By.className("title")).then(element => element.getText());
    console.log(title);

    driver.quit();
})();