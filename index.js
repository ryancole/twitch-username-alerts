const puppeteer = require("puppeteer");

// our global browser instance
let browser;

async function init() {
  browser = await puppeteer.launch();
}

async function login() {
  // open new tab
  const page = await browser.newPage();

  // navigate to the twitch login page
  await page.goto("https://www.twitch.tv/login");

  // write in our username and password
  await page.type("div[data-a-target='login-username-input'] input", "test");
  await page.type("div[data-a-target='login-password-input'] input", "test");

  // press the login button
  await page.click("button[data-a-target='passport-login-button']");

  // submit the form
  await page.click("button[data-a-target='passport-login-button']")

  await page.screenshot({path: 'example.png'});
}

async function main() {
  await init();
  await login();
}

main();