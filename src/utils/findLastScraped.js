const findLastScraped = (allAhadith) => {
  if (typeof allAhadith !== "object" || allAhadith === null) {
    throw new TypeError("Input must be an object");
  }

  let lastVolume = 1;
  let lastBook = 0;
  let lastChapter = 0;

  console.log(allAhadith); // Debugging log

  Object.keys(allAhadith).forEach((volume) => {
    const volumeNumber = Number(volume);
    lastVolume = Math.max(lastVolume, volumeNumber);

    Object.keys(allAhadith[volume]).forEach((book) => {
      const bookNumber = Number(book);
      lastBook = Math.max(lastBook, bookNumber);

      Object.keys(allAhadith[volume][book]).forEach((chapter) => {
        lastChapter = Math.max(lastChapter, Number(chapter));
      });
    });
  });

  return { lastVolume, lastBook, lastChapter };
};


module.exports = findLastScraped;
