const path = require("path");
const fs = require("fs");
const mergeData = require("./mergeData");

const writeFiles = (volumes, existingAuthors, existingSahih, existingMajhul, existingDaif, existingNoGradings, existingAllAhadith, existingDidNotInclude) => {
  const ahadithPath = path.join(__dirname, "./../ahadith");
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
  mergeData(existingDidNotInclude, volumes.didNotInclude);

  // Save the merged general data
  fs.writeFileSync(path.join(generalPath, "sahih.json"), JSON.stringify(existingSahih, null, 2));
  fs.writeFileSync(path.join(generalPath, "majhul.json"), JSON.stringify(existingMajhul, null, 2));
  fs.writeFileSync(path.join(generalPath, "daif.json"), JSON.stringify(existingDaif, null, 2));
  fs.writeFileSync(path.join(generalPath, "no-gradings.json"), JSON.stringify(existingNoGradings, null, 2));
  fs.writeFileSync(path.join(generalPath, "all-ahadith.json"), JSON.stringify(existingAllAhadith, null, 2));
  fs.writeFileSync(path.join(generalPath, "did-not-include.json"), JSON.stringify(existingDidNotInclude, null, 2));

  // Merge new data into existing data for authors
  for (const [authorFolder, authorVolumes] of Object.entries(volumes.authors)) {
    if (!existingAuthors[authorFolder]) {
      existingAuthors[authorFolder] = {
        sahih: {},
        majhul: {},
        daif: {},
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

module.exports = writeFiles;
