const getHadithValues = require("./getHadithValues");
const { WAIT_TIME, MAX_RETRIES, SLEEP_TIME } = require("./const.js");

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function navigateWithRetries(page, URL) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            await page.goto(URL, { waitUntil: "networkidle2", timeout: 10000 });
            return true;
        } catch (error) {
            console.log(`Retrying URL: ${URL}. Attempt: ${attempt + 1}`);
            await sleep(SLEEP_TIME);
        }
    }
    return false;
}

async function getRoleGroup(browser, book) {
    let currentVolume = book.number;
    let currentBook = 0;
    let currentChapter = 1;
    let consecutiveFailures = 0;
    let URL;

    const page = await browser.newPage();

    await page.evaluateOnNewDocument(() => {
        localStorage.setItem("expandAllGradings", "true");
    });

    while (consecutiveFailures < 5) {
        URL = `https://thaqalayn.net/chapter/${currentVolume}/${currentBook}/${currentChapter}`;

        const navigationSuccess = await navigateWithRetries(page, URL);
        if (!navigationSuccess) {
            console.error(`Failed to navigate to URL after ${MAX_RETRIES} retries: ${URL}`);
            break;
        }

        try {
            const roleGroupElements = await page.$$('div[role="group"]');

            if (roleGroupElements.length === 0) {
                consecutiveFailures++;
                console.log(`Didn't find it. Incrementing currentBook from ${currentBook} to ${currentBook + 1}. Current URL: ${URL}`);
                currentChapter = 1;
                currentBook++;
            } else {
                consecutiveFailures = 0;

                for (const group of roleGroupElements) {
                    try {
                        await group.waitForSelector('ul[class="m-4"]', { timeout: WAIT_TIME, visible: true });

                        const gradings = await group.$$('ul[class="m-4"]');

                        await getHadithValues(group, page, currentVolume, currentBook, currentChapter, book.book.name, gradings);
                    } catch (error) {
                        console.debug(`Error in grading: ${error}`);
                        await getHadithValues(group, page, currentVolume, currentBook, currentChapter, book.book.name);
                    }
                }

                currentChapter++;
            }
        } catch (error) {
            console.log(`An error occurred while processing URL: ${URL}. Error: ${error}`);
            consecutiveFailures++;
        }
        await sleep(SLEEP_TIME);
    }

    console.log("Finished for URL: ", URL);
    await page.close();
}

module.exports = getRoleGroup;
