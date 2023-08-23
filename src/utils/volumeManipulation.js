exports.initializeVolumeStructure = (target, volume, book, chapter, chapterTitle) => {
  target[volume] = target[volume] || {};
  target[volume][book] = target[volume][book] || {};
  target[volume][book][chapter] = target[volume][book][chapter] || {};
  target[volume][book][chapter][chapterTitle] = target[volume][book][chapter][chapterTitle] || [];
};

exports.pushHadithToVolumes = (volumes, volume, book, chapter, chapterTitle, hadith, uniqueColorTypes) => {
  this.initializeVolumeStructure(volumes["allAhadith"], volume, book, chapter, chapterTitle);
  volumes.allAhadith[volume][book][chapter][chapterTitle].push(hadith);

  for (const colorType of uniqueColorTypes) {
    this.initializeVolumeStructure(volumes[colorType], volume, book, chapter, chapterTitle);
    volumes[colorType][volume][book][chapter][chapterTitle].push(hadith);
  }
};
