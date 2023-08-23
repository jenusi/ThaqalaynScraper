const findGroupDiv = require("./findGroupDiv");
const processChapter = require("./processChapter");

async function processBook(browser, volumes, volume, book, chapter, STOP_AT_VOLUME, existingData) {
  let consecutiveBookFailures = 0;

  let page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (["image", "stylesheet", "font"].includes(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.setCacheEnabled(true);

  while (true) {
    if (volume === STOP_AT_VOLUME) {
      console.log(`Stopping at book ${STOP_AT_VOLUME}.`);
      break;
    }
    chapter++;
    const url = `https://thaqalayn.net/chapter/${volume}/${book}/${chapter}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.setItem("expandAllGradings", "true"));

    const foundGroupDiv = await findGroupDiv(page);

    if (foundGroupDiv) {
      await processChapter(page, volumes, volume, book, chapter, existingData);
      consecutiveBookFailures = 0;
    } else {
      consecutiveBookFailures++;
      if (consecutiveBookFailures >= 3) {
        consecutiveBookFailures = 0;
        book = 0;
        volume++;
      } else {
        book++;
      }
      chapter = 0;
    }
  }

  await page.close();
  await browser.close();
}

module.exports = processBook;
