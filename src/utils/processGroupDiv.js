const processGroupDiv = async (groupDiv, volumes, volume, book, chapter, chapterTitle) => {
  const gradingDiv = await groupDiv.waitForSelector('div[style="opacity: 1; height: auto;"] > div.overflow-none', { timeout: 1500 }).catch(() => null);

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
      if (grade == "لم يخرجه") {
        console.log(grade)
        colorType = "didNotInclude";
      }
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

    // Make sure the structure is initialized and make sure that it's not didNotInclude
    if(colorType != "didNotInclude") {
    if (!volumes.authors[authorFolder]) volumes.authors[authorFolder] = { sahih: {}, majhul: {}, daif: {} };
    if (!volumes.authors[authorFolder][colorType][volume]) volumes.authors[authorFolder][colorType][volume] = {};
    if (!volumes.authors[authorFolder][colorType][volume][book]) volumes.authors[authorFolder][colorType][volume][book] = {};
    if (!volumes.authors[authorFolder][colorType][volume][book][chapter]) volumes.authors[authorFolder][colorType][volume][book][chapter] = {};
    if (!volumes.authors[authorFolder][colorType][volume][book][chapter][chapterTitle])
      volumes.authors[authorFolder][colorType][volume][book][chapter][chapterTitle] = [];
    volumes.authors[authorFolder][colorType][volume][book][chapter][chapterTitle].push(filteredHadith);
    }

    uniqueColorTypes.add(colorType); // Add this colorType to our set
  }

  // Now that we've processed all gradings, push the hadith to allAhadith and colorType
  if (!volumes["allAhadith"][volume]) volumes["allAhadith"][volume] = {};
  if (!volumes["allAhadith"][volume][book]) volumes["allAhadith"][volume][book] = {};
  if (!volumes["allAhadith"][volume][book][chapter]) volumes["allAhadith"][volume][book][chapter] = {};
  if (!volumes["allAhadith"][volume][book][chapter][chapterTitle]) volumes["allAhadith"][volume][book][chapter][chapterTitle] = [];
  volumes.allAhadith[volume][book][chapter][chapterTitle].push(hadith);

  // Add the hadith to the corresponding colorType volumes
  for (const colorType of uniqueColorTypes) {
    console.log(colorType);
    if (!volumes[colorType][volume]) volumes[colorType][volume] = {};
    if (!volumes[colorType][volume][book]) volumes[colorType][volume][book] = {};
    if (!volumes[colorType][volume][book][chapter]) volumes[colorType][volume][book][chapter] = {};
    if (!volumes[colorType][volume][book][chapter][chapterTitle]) volumes[colorType][volume][book][chapter][chapterTitle] = [];
    volumes[colorType][volume][book][chapter][chapterTitle].push(hadith);
  }
};

module.exports = processGroupDiv;
