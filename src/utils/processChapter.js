const { processGroupDiv } = require("./processGroupDiv");

exports.processChapter = async (page, volumes, volume, book, chapter, groupDiv) => {
  const chapterTitle = await page.title();
  const groupDivs = groupDiv ? [groupDiv] : await page.$$('div[role="group"]');

  for (const groupDiv of groupDivs) {
    await processGroupDiv(groupDiv, volumes, volume, book, chapter, chapterTitle.slice(0, -12));
  }
  console.log(`Current Volume: ${volume}\nCurrent Book: ${book}\nCurrent Chapter: ${chapter}\nCurrent Chapter Title: ${chapterTitle}\n`);
};
