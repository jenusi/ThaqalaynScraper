exports.processGrading = async (gradingList, hadith, volumes, volume, book, chapter, chapterTitle) => {
  const uniqueColorTypes = new Set();

  const ensurePathExists = (authorFolder, colorType) => {
    const authorRef = (volumes.authors[authorFolder] ??= { sahih: {}, majhul: {}, daif: {} });
    const colorRef = (authorRef[colorType] ??= {});
    const volumeRef = (colorRef[volume] ??= {});
    const bookRef = (volumeRef[book] ??= {});
    return (bookRef[chapter] ??= {});
  };

  for (const gradingElement of gradingList) {
    const [grade, classString] = await Promise.all([
      gradingElement.$eval("span.nextui-badge", (span) => span.textContent.trim()),
      gradingElement.$eval("span.nextui-badge", (span) => span.className),
    ]);

    let colorType;
    if (classString.includes("color-success") || classString.includes("color-default")) {
      colorType = "sahih";
    } else {
      colorType = classString.includes("color-warning") ? "majhul" : "daif";
      if (grade === "لم يخرجه") {
        colorType = "didNotInclude";
      }
    }

    const author = await gradingElement.$eval("div.font-semibold", (div) => div.textContent.trim());
    const authorFolder = author.split(" ").pop().replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    const bookName = await gradingElement.$eval("div.text-center", (div) => div.textContent.trim());

    hadith.gradings.push({
      grade,
      book: bookName,
      author,
    });

    const filteredHadith = { ...hadith, gradings: [hadith.gradings[hadith.gradings.length - 1]] };

    if (colorType !== "didNotInclude") {
      const chapterRef = ensurePathExists(authorFolder, colorType);
      const chapterTitleRef = (chapterRef[chapterTitle] ??= []);
      chapterTitleRef.push(filteredHadith);
    }

    uniqueColorTypes.add(colorType);
  }

  return uniqueColorTypes;
};
