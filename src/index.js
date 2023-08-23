const puppeteer = require("puppeteer");
const path = require("path");

const { processBook } = require("./utils/processBook");
const {
  AlKafi,
  MujamAlAhadithAlMutabara,
  AlKhisal,
  UyunAkhbarAlRida,
  AlAmali,
  AlTawhid,
  KitabAlDuafa,
  KitabAlGhaybaFirst,
  KitabAlGhaybaSecond,
  ThawabAlAmalWaIqabAlAmal,
  KamilAlZiyarat,
  FadailAlShia,
  SifatAlShia,
  MaaniAlAkhbar,
  KitabAlMumin,
  KitabAlZuhd,
  NahjAlBalagha,
} = require("./utils/books");

const SELECTED_BOOKS = [AlKafi, MujamAlAhadithAlMutabara];

const browserLaunchOptions = {
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-accelerated-2d-canvas", "--disable-gpu"],
};

async function main() {
  const browser = await puppeteer.launch(browserLaunchOptions);
  const volumes = {
    sahih: [],
    majhul: [],
    daif: [],
    noGradings: [],
    allAhadith: [],
    authors: [],
    didNotInclude: [],
  };
  const selectedVolumesAndBooks = SELECTED_BOOKS.flatMap((book) => book.numbers.map((number) => ({ number, book })));
  await processBook(browser, volumes, selectedVolumesAndBooks);
}

main().catch((error) => {
  console.error(`An error occurred: ${error}`);
  process.exit(1);
});
