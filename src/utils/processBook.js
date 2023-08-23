const { findGroupDiv } = require("./findGroupDiv");
const { processChapter } = require("./processChapter");
const { writeFiles } = require("./writeFiles");

const setupPage = async (browser) => {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (["image", "stylesheet", "font"].includes(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  });
  await page.setCacheEnabled(false);
  return page;
};

const processVolume = async (browser, page, volume, selectedBook, volumes) => {
  let consecutiveBookFailures = 0;
  let book = 0;
  let chapter = 0;

  while (true) {
    chapter++;
    const url = `https://thaqalayn.net/chapter/${volume}/${book}/${chapter}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.setItem("expandAllGradings", "true"));

    const foundGroupDiv = await findGroupDiv(page);

    if (foundGroupDiv) {
      await processChapter(page, volumes, volume, book, chapter, foundGroupDiv);
      consecutiveBookFailures = 0;
    } else {
      consecutiveBookFailures++;
      if (consecutiveBookFailures >= 3) break;
      book++;
      chapter = 0;
    }
  }
  writeFiles(volumes, selectedBook);
  console.log(`Wrote Volume: ${volume}\n To the Book: ${selectedBook.name}\n`);
};

exports.processBook = async (browser, volumes, selectedVolumesAndBooks) => {
  try {
    for (const { number: volume, book: selectedBook } of selectedVolumesAndBooks) {
      console.log(`Processing Volume ${volume}`);
      let page = await setupPage(browser);
      await processVolume(browser, page, volume, selectedBook, volumes);
      await page.close();
    }
  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await browser.close();
  }
};
