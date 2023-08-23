exports.findGroupDiv = async (page) => {
  let attempts = 0;
  let groupDiv = null;

  while (attempts < 3 && !groupDiv) {
    try {
      groupDiv = await page.$('div[role="group"]');
    } catch (error) {
      console.error(`Error: ${error}`);
    }

    attempts++;
    if (attempts > 1) {
    }
  }

  return groupDiv;
};
