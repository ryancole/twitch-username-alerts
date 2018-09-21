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
  await page.type("div[data-a-target='login-username-input'] input", "foo");
  await page.type("div[data-a-target='login-password-input'] input", "bar");

  // press the login button
  await page.click("button[data-a-target='passport-login-button']");

  // submit the form
  await page.click("button[data-a-target='passport-login-button']")

  // wait for captcha to appear
  await page.waitForSelector("#recaptcha-element-container iframe");

  const captchaContainer = await page.$("#recaptcha-element-container");

  // get the coordinates of the captcha container
  const coordinates = await page.evaluate(el => {
    const {top, left, bottom, right} = el.getBoundingClientRect();
	return {top, left, bottom, right};
  }, captchaContainer);

  // move mouse to the captcha box
  // await page.

  await page.screenshot({path: 'example.png'});
}

async function main() {
  await init();
  await login();
}

main();


// NOTE TO SELF: make workflow be: open page to logins/new page, if redirect occurs we need to login so perform login for that execution, otherwise perform username checks - loop around that workflow