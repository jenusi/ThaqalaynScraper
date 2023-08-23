const fs = require('fs').promises;
const path = require('path');
const loadExistingData = require('./loadExistingData');

const loadExistingAuthorData = async () => {
  try {
    const authors = {};
    const ahadithPath = path.join(__dirname, "ahadith");
    try {
      await fs.access(ahadithPath);
    } catch {
      await fs.mkdir(ahadithPath, { recursive: true });
    }
    const authorFolders = (await fs.readdir(ahadithPath)).filter(folder => folder !== 'general');

    for (const authorFolder of authorFolders) {
      const authorPath = path.join(ahadithPath, authorFolder);
      authors[authorFolder] = {
        sahih: await loadExistingData(path.join(authorPath, "sahih.json")),
        majhul: await loadExistingData(path.join(authorPath, "majhul.json")),
        daif: await loadExistingData(path.join(authorPath, "daif.json")),
      };
    }
    return authors;
  } catch (err) {
    console.error('An error occurred:', err);
    throw err; // or return some default value
  }
};

module.exports = loadExistingAuthorData;
