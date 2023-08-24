const fs = require("fs");
const path = require("path");

function createDirIfNotExistent(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function generalWriteFile(
    bookName,
    href,
    title,
    arabicText,
    englishText,
    hadithNumber,
    pageVolume,
    pageBook,
    pageChapter,
    gradingArray,
    gradingTextArray,
    bookArray,
    authorArray,
) {
    createDirIfNotExistent(`ahadith/${bookName}/${pageVolume}`);

    if (gradingArray) {
        for (let i = 0; i < gradingArray.length; i++) {
            const filePath = path.join(__dirname, `ahadith/${bookName}/${pageVolume}/${gradingArray[i]}.json`);
            const newData = {
                [pageBook]: {
                    [pageChapter]: {
                        [hadithNumber]: {
                            title: title,
                            arabicText: arabicText,
                            englishText: englishText,
                            href: href,
                            grading: {
                                gradeEnglish: gradingArray[i],
                                gradeArabic: gradingTextArray[i].trim(),
                                book: bookArray[i],
                                author: authorArray[i],
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
        }
        return;
    } else {
        const filePath = path.join(__dirname, `ahadith/${bookName}/${pageVolume}/general.json`);
        const newData = {
            [pageBook]: {
                [pageChapter]: {
                    hadithNumber: hadithNumber,
                    title: title,
                    arabicText: arabicText,
                    englishText: englishText,
                    href: href,
                    gradings: {},
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
    }
}

module.exports = generalWriteFile;
