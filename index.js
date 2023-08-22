const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();

  let volume = 1;
  let book = 0;
  let chapter = 0;
  let consecutiveBookFailures = 0;

  while (true) {
    chapter++;
    const url = `https://thaqalayn.net/chapter/${volume}/${book}/${chapter}`;
    await page.goto(url);

    let attempts = 0;
    let foundGroupDiv = false;

    while (attempts < 3) {
      const groupDiv = await page.$('div[role="group"]');

      if (groupDiv) {
        foundGroupDiv = true;
        break;
      }

      attempts++;
      console.log(`Retrying... (${attempts} attempts)`);
      await page.reload();
    }

    if (!foundGroupDiv) {
      consecutiveBookFailures++;

      if (consecutiveBookFailures >= 3) {
        consecutiveBookFailures = 0;
        book = 1;
        volume++;
      } else {
        book++;
      }
      chapter = 0;
      continue;
    } else {
      consecutiveBookFailures = 0;
    }

    console.log(`Could have successfully scraped ${url}`);
  }

  await browser.close();
})();
