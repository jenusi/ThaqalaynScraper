const fs = require("fs");
const path = require("path");

function createDirIfNotExistent(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
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
    gradingText,
    gradingTextText,
    bookText,
    authorText,
) {
    let authorName = authorText.split(" ");
    authorName = authorName[authorName.length - 1];
    authorName = authorName.replace(/[^a-zA-Z ]/g, "");
    createDirIfNotExistent(`ahadith/${bookName}/${pageVolume}/${authorName}`);
    const filePath = path.join(__dirname, `ahadith/${bookName}/${pageVolume}/${authorName}/${gradingText}.json`);
    const newData = {
        [pageBook]: {
            [pageChapter]: {
                [hadithNumber]: {
                    title: title,
                    arabicText: arabicText,
                    englishText: englishText,
                    href: href,
                    grading: {
                        gradeEnglish: gradingText,
                        gradeArabic: gradingTextText.trim(),
                        book: bookText,
                        author: authorText,
                    },
                },
            },
        },
    };

    if (fs.existsSync(filePath)) {
        const existingData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        existingData.push(newData);

        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 4), "utf8");
    } else {
        fs.writeFileSync(filePath, JSON.stringify([newData], null, 4), "utf8");
    }
    return;
}

module.exports = authorSpecificWriteFile;
