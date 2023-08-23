async function findGroupDiv(page) {
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
    }
  
    return foundGroupDiv;
  }

  module.exports = findGroupDiv;
