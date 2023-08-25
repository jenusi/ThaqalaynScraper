const puppeteer = require("puppeteer");
const getRoleGroup = require("./getRoleGroup.js");

const browserLaunchOptions = {
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-accelerated-2d-canvas", "--disable-gpu"],
};

async function sendBookToCheck(book) {
    let browser;

    try {
        browser = await puppeteer.launch(browserLaunchOptions);

        await getRoleGroup(browser, book);
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = sendBookToCheck;
