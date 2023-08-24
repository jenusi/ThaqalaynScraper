const puppeteer = require("puppeteer");
const getRoleGroup = require("./getRoleGroup.js");

async function sendBookToCheck(book) {
    const browserLaunchOptions = {
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-accelerated-2d-canvas", "--disable-gpu"],
    };
    const browser = await puppeteer.launch(browserLaunchOptions);

    try {
        await getRoleGroup(browser, book);
    } finally {
        await browser.close();
    }
}

module.exports = sendBookToCheck;
