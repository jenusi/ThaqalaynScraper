const getHadithValues = require("./getHadithValues");

async function getRoleGroup(browser, book) {
    let pageVolume = book.number;
    let pageBook = 1;
    let pageChapter = 1;
    let didntFind = 0;
    let URL;

    const page = await browser.newPage();

    await page.evaluateOnNewDocument(() => {
        localStorage.setItem("expandAllGradings", "true");
    });

    while (didntFind < 5) {
        URL = `https://thaqalayn.net/chapter/${pageVolume}/${pageBook}/${pageChapter}`;

        try {
            await page.goto(URL, { waitUntil: "networkidle2", timeout: 10000 });

            const roleGroup = await page.$$('div[role="group"]');

            if (roleGroup.length === 0) {
                console.log(`Didn't find it. Incrementing pageBook from ${pageBook} to ${pageBook + 1}. The Current URL is: ${URL}`);
                didntFind++;
                pageChapter = 1;
                pageBook++;
            } else {
                didntFind = 0;

                for (const group of roleGroup) {
                    let grading;

                    try {
                        grading = await group.waitForSelector('ul[class="m-4"]', { timeout: 2500, visible: true });
                    } catch (error) {
                        console.log(`Couldn't find grading for group. Error: ${error}`);
                    }

                    await getHadithValues(group, page, pageVolume, pageBook, pageChapter, book.book.name, grading);
                }

                pageChapter++;
            }
        } catch (error) {
            console.log(`An error occurred while processing URL: ${URL}. Error: ${error}`);
            didntFind++;
        }
    }

    console.log("Finished for URL: ", URL);
    await page.close();
}

module.exports = getRoleGroup;
