const { extractHadithInfo } = require('./hadithProcessing');
const { processGrading } = require('./gradingProcessing');
const { initializeVolumeStructure, pushHadithToVolumes } = require('./volumeManipulation');

exports.processGroupDiv = async (groupDiv, volumes, volume, book, chapter, chapterTitle) => {
  const gradingDiv = await groupDiv.waitForSelector('div[style="opacity: 1; height: auto;"] > div.overflow-none', { timeout: 1500 }).catch(() => null);
  const hadith = await extractHadithInfo(groupDiv);

  if (!gradingDiv) {
    initializeVolumeStructure(volumes.noGradings, volume, book, chapter, chapterTitle);
    volumes.noGradings[volume][book][chapter][chapterTitle].push(hadith);
    initializeVolumeStructure(volumes.allAhadith, volume, book, chapter, chapterTitle);
    volumes.allAhadith[volume][book][chapter][chapterTitle].push(hadith);

    return;
  }

  const gradingList = await gradingDiv.$$("li > div");
  const uniqueColorTypes = await processGrading(gradingList, hadith, volumes, volume, book, chapter, chapterTitle);
  pushHadithToVolumes(volumes, volume, book, chapter, chapterTitle, hadith, uniqueColorTypes);
};
