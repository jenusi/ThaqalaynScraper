const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const STOP_AT_BOOK = 12;

const loadExistingData = (filePath) => {
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (err) {
    return {};
  }
};


const loadExistingAuthorData = () => {
  const authors = {};
  const ahadithPath = path.join(__dirname, "ahadith");
  const authorFolders = fs.readdirSync(ahadithPath).filter(folder => folder !== 'general');

  for (const authorFolder of authorFolders) {
    authors[authorFolder] = {
      sahih: loadExistingData(path.join(ahadithPath, authorFolder, "sahih.json")),
      majhul: loadExistingData(path.join(ahadithPath, authorFolder, "majhul.json")),
      daif: loadExistingData(path.join(ahadithPath, authorFolder, "daif.json")),
    };
  }
  return authors;
};

const mergeData = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object) {
      if (!target[key]) target[key] = {};
      mergeData(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
};

const existingAuthors = loadExistingAuthorData();

const existingSahih = loadExistingData(path.join(__dirname, "ahadith", "general", "sahih.json"));
const existingMajhul = loadExistingData(path.join(__dirname, "ahadith", "general", "majhul.json"));
const existingDaif = loadExistingData(path.join(__dirname, "ahadith", "general", "daif.json"));
const existingNoGradings = loadExistingData(path.join(__dirname, "ahadith", "general", "no-gradings.json"));
const existingAllAhadith = loadExistingData(path.join(__dirname, "ahadith", "general", "all-ahadith.json"));


const findLastScraped = (allAhadith) => {
  let lastVolume = 0;
  let lastBook = 0;
  let lastChapter = 0;

  for (const [volume, books] of Object.entries(allAhadith)) {
    lastVolume = Math.max(lastVolume, Number(volume));
    for (const [book, chapters] of Object.entries(books)) {
      if (Number(volume) === lastVolume) {
        lastBook = Math.max(lastBook, Number(book));
      }
      for (const [chapter, _] of Object.entries(chapters)) {
        if (Number(volume) === lastVolume && Number(book) === lastBook) {
          lastChapter = Math.max(lastChapter, Number(chapter));
        }
      }
    }
  }

  return { lastVolume, lastBook, lastChapter };
};
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

  // Merge new data into existing general data
  mergeData(existingSahih, volumes.sahih);
  mergeData(existingMajhul, volumes.majhul);
  mergeData(existingDaif, volumes.daif);
  mergeData(existingNoGradings, volumes.noGradings);
  mergeData(existingAllAhadith, volumes.allAhadith);

  // Save the merged general data
  fs.writeFileSync(path.join(generalPath, "sahih.json"), JSON.stringify(existingSahih, null, 2));
  fs.writeFileSync(path.join(generalPath, "majhul.json"), JSON.stringify(existingMajhul, null, 2));
  fs.writeFileSync(path.join(generalPath, "daif.json"), JSON.stringify(existingDaif, null, 2));
  fs.writeFileSync(path.join(generalPath, "no-gradings.json"), JSON.stringify(existingNoGradings, null, 2));
  fs.writeFileSync(path.join(generalPath, "all-ahadith.json"), JSON.stringify(existingAllAhadith, null, 2));

  // Merge new data into existing data for authors
  for (const [authorFolder, authorVolumes] of Object.entries(volumes.authors)) {
    if (!existingAuthors[authorFolder]) {
      existingAuthors[authorFolder] = {
        sahih: {},
        majhul: {},
        daif: {}
      };
    }

    mergeData(existingAuthors[authorFolder].sahih, authorVolumes.sahih);
    mergeData(existingAuthors[authorFolder].majhul, authorVolumes.majhul);
    mergeData(existingAuthors[authorFolder].daif, authorVolumes.daif);

    const authorPath = path.join(ahadithPath, authorFolder);
    if (!fs.existsSync(authorPath)) {
      fs.mkdirSync(authorPath);
    }

    fs.writeFileSync(path.join(authorPath, "sahih.json"), JSON.stringify(existingAuthors[authorFolder].sahih, null, 2));
    fs.writeFileSync(path.join(authorPath, "majhul.json"), JSON.stringify(existingAuthors[authorFolder].majhul, null, 2));
    fs.writeFileSync(path.join(authorPath, "daif.json"), JSON.stringify(existingAuthors[authorFolder].daif, null, 2));
  }
};

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const existingAllAhadith = loadExistingData(path.join(__dirname, "ahadith", "general", "all-ahadith.json"));
  const { lastVolume, lastBook, lastChapter } = findLastScraped(existingAllAhadith);

  let volume = lastVolume || 1;
  let book = lastBook || 0;
  let chapter = lastChapter || 0;
  let consecutiveBookFailures = 0;
  const volumes = {
    sahih: existingSahih,
    majhul: existingMajhul,
    daif: existingDaif,
    noGradings: existingNoGradings,
    allAhadith: existingAllAhadith,
    authors: existingAuthors
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
