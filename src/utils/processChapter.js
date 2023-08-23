const processGroupDiv = require("./processGroupDiv");
const writeFiles = require("./writeFiles");

async function processChapter(page, volumes, volume, book, chapter, existingData) {
    const chapterTitle = await page.title();
    const groupDivs = await page.$$('div[role="group"]');
  
    for (const groupDiv of groupDivs) {
      await processGroupDiv(groupDiv, volumes, volume, book, chapter, chapterTitle.slice(0, -12));
    }
  
    writeFiles(volumes, ...existingData);
  
    console.log(`Chapter Title: ${chapterTitle.slice(0, -12)}\n`);
  }

  module.exports = processChapter;