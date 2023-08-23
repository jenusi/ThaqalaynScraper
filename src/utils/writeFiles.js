const path = require("path");
const fs = require("fs").promises;

exports.writeFiles = async (volumes, selectedBook) => {
  const ahadithPath = path.join(__dirname, `./../ahadith/${selectedBook.name}`);
  try {
    await fs.access(ahadithPath);
  } catch {
    await fs.mkdir(ahadithPath, { recursive: true });
  }

  const generalPath = path.join(ahadithPath, "general");
  try {
    await fs.access(generalPath);
  } catch {
    await fs.mkdir(generalPath);
  }

  const alBehbudiPath = path.join(ahadithPath, "albehbudi");
  try {
    await fs.access(alBehbudiPath);
  } catch {
    await fs.mkdir(alBehbudiPath);
  }

  // Save the data without merging
  await fs.writeFile(path.join(generalPath, "sahih.json"), JSON.stringify(volumes.sahih, null, 2));
  await fs.writeFile(path.join(generalPath, "majhul.json"), JSON.stringify(volumes.majhul, null, 2));
  await fs.writeFile(path.join(generalPath, "daif.json"), JSON.stringify(volumes.daif, null, 2));
  await fs.writeFile(path.join(generalPath, "no-gradings.json"), JSON.stringify(volumes.noGradings, null, 2));
  await fs.writeFile(path.join(generalPath, "all-ahadith.json"), JSON.stringify(volumes.allAhadith, null, 2));
  await fs.writeFile(path.join(alBehbudiPath, "did-not-include.json"), JSON.stringify(volumes.didNotInclude, null, 2));

  // Write author data
  for (const [authorFolder, authorVolumes] of Object.entries(volumes.authors)) {
    const authorPath = path.join(ahadithPath, authorFolder);
    try {
      await fs.access(authorPath);
    } catch {
      await fs.mkdir(authorPath);
    }

    await fs.writeFile(path.join(authorPath, "sahih.json"), JSON.stringify(authorVolumes.sahih, null, 2));
    await fs.writeFile(path.join(authorPath, "majhul.json"), JSON.stringify(authorVolumes.majhul, null, 2));
    await fs.writeFile(path.join(authorPath, "daif.json"), JSON.stringify(authorVolumes.daif, null, 2));
  }
};
