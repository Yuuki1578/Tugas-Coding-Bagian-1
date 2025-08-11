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
const featuresAssertion = {
  title: "Indonesia Indicator",
  absoluteWaitDuration: 5000,
  buttonText: "Learn More",
  isJavascriptSupported: true,
};

const AutomataError = 0x00;
const AutomataWarn = 0x01;
const AutomataInfo = 0x02;

const loggerAutomata = {
  writer: fs.createWriteStream("automata.log", {
    encoding: "utf-8",
    flags: "a",
    mode: 0o644,
  }),

  prefix: function(logLevel) {
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

  log: function(logLevel, message) {
    const logMessage = `${this.prefix(logLevel)} ${new Date().toLocaleString()}: ${message}\n`;
    this.writer.write(logMessage);
  }
};

async function assertTimeout(driver, timeout) {
  driver
    .manage()
    .setTimeouts({ implicit: timeout })
    .catch(_ => loggerAutomata.log(AutomataError, "Driver loading is timed out"));
}

async function assertTitle(driver, expectedTitle) {
  let runtimeTitle = await driver.getTitle();
  if (runtimeTitle !== expectedTitle) {
    loggerAutomata.log(AutomataError, `Expected title: "${expectedTitle}", got: "${runtimeTitle}"`);
  } else {
    loggerAutomata.log(AutomataInfo, `Assertion success: "${expectedTitle}" EQ "${runtimeTitle}"`);
  }
}

async function assertButtonText(driver, expectedText) {
  const buttonElement = await driver.findElement(By.tagName('button'));
  const buttonText = await buttonElement.getText();

  if (buttonText === expectedText) {
    loggerAutomata.log(AutomataInfo, `Assertion success: "${expectedText}" EQ "${buttonText}"`);
  } else {
    loggerAutomata.log(AutomataError, `Assertion failed: expected "${expectedText}", found "${buttonText}"`);
  }
}

async function assertJavascriptCapability(driver) {
  const pageSource = await driver.getPageSource();
  const occurence = pageSource.indexOf("noscript");

  if (occurence >= 0) {
    loggerAutomata.log(AutomataInfo, `Assertion success: JavaScript is supported in current environment`);
    featuresAssertion.isJavascriptSupported = true;
  } else {
    loggerAutomata.log(AutomataError, `Assertion failed: <noscript> tags found, fallback`);
    featuresAssertion.isJavascriptSupported = false;
  }
}

(async function main() {
  let driver = new Builder().forBrowser(Browser.FIREFOX).build();
  await driver.get(targetUrl);

  // Assertion 1
  await assertTimeout(driver, featuresAssertion.absoluteWaitDuration);

  // Assertion 2
  await assertTitle(driver, featuresAssertion.title);

  // Assertion 3
  await assertButtonText(driver, featuresAssertion.buttonText);

  // Assertion 4
  await assertJavascriptCapability(driver, featuresAssertion.buttonText);
})();
