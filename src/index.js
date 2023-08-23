const puppeteer = require("puppeteer");
const path = require("path");

const loadExistingAuthorData = require("./utils/loadExistingAuthorData");
const loadExistingData = require("./utils/loadExistingData");
const findLastScraped = require("./utils/findLastScraped");
const processBook = require("./utils/processBook");

const STOP_AT_VOLUME = 9;

const browserLaunchOptions = {
  headless: "new",
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu'
  ],
};

async function initializeData() {
  const existingAuthors = await loadExistingAuthorData();
  const existingSahih = await loadExistingData(path.join(__dirname, "ahadith", "general", "sahih.json"));
  const existingMajhul = await loadExistingData(path.join(__dirname, "ahadith", "general", "majhul.json"));
  const existingDaif = await loadExistingData(path.join(__dirname, "ahadith", "general", "daif.json"));
  const existingNoGradings = await loadExistingData(path.join(__dirname, "ahadith", "general", "no-gradings.json"));
  const existingAllAhadith = await loadExistingData(path.join(__dirname, "ahadith", "general", "all-ahadith.json"));
  const existingDidNotInclude = await loadExistingData(path.join(__dirname, "ahadith", "general", "all-ahadith.json"));

  return {
    existingAuthors,
    existingSahih,
    existingMajhul,
    existingDaif,
    existingNoGradings,
    existingAllAhadith,
    existingDidNotInclude
  };
}

async function main() {
  const {
    existingAuthors,
    existingSahih,
    existingMajhul,
    existingDaif,
    existingNoGradings,
    existingAllAhadith,
    existingDidNotInclude
  } = await initializeData();

  const { lastVolume, lastBook, lastChapter } = findLastScraped(existingAllAhadith);
  console.log(lastVolume, lastBook, lastChapter);

  const browser = await puppeteer.launch(browserLaunchOptions);
  const volumes = {
    sahih: existingSahih,
    majhul: existingMajhul,
    daif: existingDaif,
    noGradings: existingNoGradings,
    allAhadith: existingAllAhadith,
    authors: existingAuthors,
    didNotInclude: existingDidNotInclude
  };
  const existingData = [existingAuthors, existingSahih, existingMajhul, existingDaif, existingNoGradings, existingAllAhadith, existingDidNotInclude];

  await processBook(browser, volumes, lastVolume, lastBook, lastChapter, STOP_AT_VOLUME, existingData);
}

main().catch((error) => {
  console.error(`An error occurred: ${error}`);
  process.exit(1);
});
