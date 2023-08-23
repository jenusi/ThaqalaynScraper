const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const STOP_AT_BOOK = 9;

const processGroupDiv = async (groupDiv, volumes, volume, book, chapter, chapterTitle) => {
  const gradingDiv = await groupDiv.waitForSelector('div[style="opacity: 1; height: auto;"] > div.overflow-none', { timeout: 1750 }).catch(() => null);

  const hadith = {
    number: await groupDiv.$eval("h1", (h1) => h1.textContent.trim()),
    url: await groupDiv.$eval("a", (a) => a.href),
    arabicText: await groupDiv.$eval('p[dir="rtl"]', (p) => p.textContent.trim()),
    englishTranslation: await groupDiv.$eval('p[class="text-lg font-sans"]', (p) => p.textContent.trim()),
    gradings: [],
  };

  if (!gradingDiv) {
    const noGradingsHadith = {
      number: hadith.number,
      url: hadith.url,
      arabicText: hadith.arabicText,
      englishTranslation: hadith.englishTranslation,
    };

    if (!volumes.noGradings[volume]) volumes.noGradings[volume] = {};
    if (!volumes.noGradings[volume][book]) volumes.noGradings[volume][book] = {};
    if (!volumes.noGradings[volume][book][chapter]) volumes.noGradings[volume][book][chapter] = {};
    if (!volumes.noGradings[volume][book][chapter][chapterTitle]) volumes.noGradings[volume][book][chapter][chapterTitle] = [];
    if (!volumes.allAhadith[volume]) volumes.allAhadith[volume] = {};
    if (!volumes.allAhadith[volume][book]) volumes.allAhadith[volume][book] = {};
    if (!volumes.allAhadith[volume][book][chapter]) volumes.allAhadith[volume][book][chapter] = {};
    if (!volumes.allAhadith[volume][book][chapter][chapterTitle]) volumes.allAhadith[volume][book][chapter][chapterTitle] = [];

    volumes.noGradings[volume][book][chapter][chapterTitle].push(noGradingsHadith);
    volumes.allAhadith[volume][book][chapter][chapterTitle].push(noGradingsHadith);

    return;
  }

  const gradingList = await gradingDiv.$$("li > div");
  const uniqueColorTypes = new Set();

  let colorType;

  for (const gradingElement of gradingList) {
    const grade = await gradingElement.$eval("span.nextui-badge", (span) => span.textContent.trim());
    const classString = await gradingElement.$eval("span.nextui-badge", (span) => span.className);
    if (classString.includes("color-success") || classString.includes("color-default")) {
      colorType = "sahih";
    } else if (classString.includes("color-warning")) {
      colorType = "majhul";
    } else {
      colorType = "daif";
    }
    if (classString.includes("color-default")) {
      console.log("Found color-default!");
    }
    const author = await gradingElement.$eval("div.font-semibold", (div) => div.textContent.trim());
    const authorFolder = author
      .split(" ")
      .pop()
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();

    hadith.gradings.push({
      grade,
      book: await gradingElement.$eval("div.text-center", (div) => div.textContent.trim()),
      author: await gradingElement.$eval("div.font-semibold", (div) => div.textContent.trim()),
    });

    // Create a new hadith object with only the current grading
    const filteredGradings = [hadith.gradings[hadith.gradings.length - 1]];
    const filteredHadith = { ...hadith, gradings: filteredGradings };

    // Make sure the structure is initialized
    if (!volumes.authors[authorFolder]) volumes.authors[authorFolder] = { sahih: {}, majhul: {}, daif: {} };
    if (!volumes.authors[authorFolder][colorType][volume]) volumes.authors[authorFolder][colorType][volume] = {};
    if (!volumes.authors[authorFolder][colorType][volume][book]) volumes.authors[authorFolder][colorType][volume][book] = {};
    if (!volumes.authors[authorFolder][colorType][volume][book][chapter]) volumes.authors[authorFolder][colorType][volume][book][chapter] = {};
    if (!volumes.authors[authorFolder][colorType][volume][book][chapter][chapterTitle])
      volumes.authors[authorFolder][colorType][volume][book][chapter][chapterTitle] = [];

    uniqueColorTypes.add(colorType); // Add this colorType to our set
    volumes.authors[authorFolder][colorType][volume][book][chapter][chapterTitle].push(filteredHadith);
  }

  // Now that we've processed all gradings, push the hadith to allAhadith and colorType
  if (!volumes["allAhadith"][volume]) volumes["allAhadith"][volume] = {};
  if (!volumes["allAhadith"][volume][book]) volumes["allAhadith"][volume][book] = {};
  if (!volumes["allAhadith"][volume][book][chapter]) volumes["allAhadith"][volume][book][chapter] = {};
  if (!volumes["allAhadith"][volume][book][chapter][chapterTitle]) volumes["allAhadith"][volume][book][chapter][chapterTitle] = [];
  volumes.allAhadith[volume][book][chapter][chapterTitle].push(hadith);

  // Add the hadith to the corresponding colorType volumes
  for (const colorType of uniqueColorTypes) {
    if (!volumes[colorType][volume]) volumes[colorType][volume] = {};
    if (!volumes[colorType][volume][book]) volumes[colorType][volume][book] = {};
    if (!volumes[colorType][volume][book][chapter]) volumes[colorType][volume][book][chapter] = {};
    if (!volumes[colorType][volume][book][chapter][chapterTitle]) volumes[colorType][volume][book][chapter][chapterTitle] = [];
    volumes[colorType][volume][book][chapter][chapterTitle].push(hadith);
  }
};

const writeFiles = (volumes) => {
  const ahadithPath = path.join(__dirname, "ahadith");
  if (!fs.existsSync(ahadithPath)) {
    fs.mkdirSync(ahadithPath);
  }

  const generalPath = path.join(ahadithPath, "general");
  if (!fs.existsSync(generalPath)) {
    fs.mkdirSync(generalPath);
  }

  fs.writeFileSync(path.join(generalPath, "sahih.json"), JSON.stringify(volumes.sahih, null, 2));
  fs.writeFileSync(path.join(generalPath, "majhul.json"), JSON.stringify(volumes.majhul, null, 2));
  fs.writeFileSync(path.join(generalPath, "daif.json"), JSON.stringify(volumes.daif, null, 2));
  fs.writeFileSync(path.join(generalPath, "no-gradings.json"), JSON.stringify(volumes.noGradings, null, 2));
  fs.writeFileSync(path.join(generalPath, "all-ahadith.json"), JSON.stringify(volumes.allAhadith, null, 2));

  for (const [authorFolder, authorVolumes] of Object.entries(volumes.authors)) {
    const authorPath = path.join(ahadithPath, authorFolder);
    if (!fs.existsSync(authorPath)) {
      fs.mkdirSync(authorPath);
    }
    fs.writeFileSync(path.join(authorPath, "sahih.json"), JSON.stringify(authorVolumes.sahih, null, 2));
    fs.writeFileSync(path.join(authorPath, "majhul.json"), JSON.stringify(authorVolumes.majhul, null, 2));
    fs.writeFileSync(path.join(authorPath, "daif.json"), JSON.stringify(authorVolumes.daif, null, 2));
  }
};

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  let volume = 1;
  let book = 0;
  let chapter = 0;
  let consecutiveBookFailures = 0;
  const volumes = {
    sahih: {},
    majhul: {},
    daif: {},
    noGradings: {},
    allAhadith: {},
    authors: {},
  };

  while (true) {
    if (book === STOP_AT_BOOK) {
      console.log(`Stopping at book ${STOP_AT_BOOK}.`);
      break;
    }

    let page = await browser.newPage();
    chapter++;
    const url = `https://thaqalayn.net/chapter/${volume}/${book}/${chapter}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    let attempts = 0;
    let foundGroupDiv = false;

    while (attempts < 3 && !foundGroupDiv) {
      try {
        const groupDivs = await page.$$('div[role="group"]');
        if (groupDivs.length > 0) {
          foundGroupDiv = true;
        }
      } catch (error) {
        console.error(`Error: ${error}`);
      }

      attempts++;
      if (attempts > 1) {
        console.log(`Retrying... (${attempts} attempts)`);
      }
      await page.reload({ waitUntil: "domcontentloaded" });
    }

    if (foundGroupDiv) {
      await page.evaluate(() => localStorage.setItem("expandAllGradings", "true"));
      const chapterTitle = await page.$eval("div.text-3xl", (div) => div.textContent.trim());
      const groupDivs = await page.$$('div[role="group"]');

      for (const groupDiv of groupDivs) {
        await processGroupDiv(groupDiv, volumes, volume, book, chapter, chapterTitle);
      }

      writeFiles(volumes);

      console.log(`Chapter Title: ${chapterTitle}\n`);
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

    await page.close();
  }

  await browser.close();
})();
