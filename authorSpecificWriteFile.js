const fs = require("fs").promises;
const path = require("path");

async function ensureDirExists(dirPath) {
    try {
        await fs.access(dirPath);
    } catch (error) {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function authorSpecificWriteFile(
    bookName,
    href,
    title,
    arabicText,
    englishText,
    hadithNumber,
    pageVolume,
    pageBook,
    pageChapter,
    gradingGeneral,
    gradingText,
    bookText,
    authorText,
) {
    try {
        const filePath = path.join(".", "ahadith", bookName, pageVolume.toString(), authorText, `${gradingGeneral}.json`);
        const dirPath = path.dirname(filePath);

        await ensureDirExists(dirPath);
        const existingData = await readJsonFile(filePath);

        const volumeKey = `Volume #${pageVolume}`;
        const bookKey = `Book #${pageBook}`;
        const chapterKey = `Chapter #${pageChapter}`;
        const hadithObject = {
            [volumeKey]: {
                [bookKey]: {
                    [chapterKey]: {
                        [hadithNumber]: {
                            Title: title,
                            Link: href,
                            "Arabic Text": arabicText,
                            "English Text": englishText,
                            Grading: {
                                "English Grade": gradingGeneral,
                                "Arabic Grade": gradingText,
                                Scholar: authorText,
                                Book: bookText,
                            },
                        },
                    },
                },
            },
        };

        // Merge the existing and new data
        existingData[volumeKey] = existingData[volumeKey] || {};
        existingData[volumeKey][bookKey] = existingData[volumeKey][bookKey] || {};
        existingData[volumeKey][bookKey][chapterKey] = existingData[volumeKey][bookKey][chapterKey] || {};

        existingData[volumeKey][bookKey][chapterKey][hadithNumber] = hadithObject[volumeKey][bookKey][chapterKey][hadithNumber];

        await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), "utf-8");
    } catch (error) {
        console.error(`An error occurred: ${error}`);
    }
}

module.exports = authorSpecificWriteFile;
