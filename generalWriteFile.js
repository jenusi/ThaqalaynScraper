const fs = require("fs").promises;
const path = require("path");

async function ensureDirExists(directory) {
    try {
        await fs.access(directory);
    } catch (error) {
        await fs.mkdir(directory, { recursive: true });
    }
}

async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
}

function createHadithObject(params, gradingGeneral) {
    const { pageVolume, pageBook, pageChapter, hadithNumber, title, href, arabicText, englishText, gradingText, authorText, bookText } = params;
    let hadithObj = {
        Title: title,
        Link: href,
        "Arabic Text": arabicText,
        "English Text": englishText,
    };

    if (gradingGeneral) {
        hadithObj.Grading = {
            "English Grade": gradingGeneral,
            "Arabic Grade": gradingText,
            Scholar: authorText,
            Book: bookText,
        };
    }

    return {
        [`Volume #${pageVolume}`]: {
            [`Book #${pageBook}`]: {
                [`Chapter #${pageChapter}`]: {
                    [hadithNumber]: hadithObj,
                },
            },
        },
    };
}

async function generalWriteFile(...args) {
    try {
        const [
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
        ] = args;

        const params = {
            pageVolume,
            pageBook,
            pageChapter,
            hadithNumber,
            title,
            href,
            arabicText,
            englishText,
            gradingText,
            authorText,
            bookText,
        };

        const gradingFolder = gradingGeneral ? gradingGeneral : 'no-grading';
        const filePath = path.join('.', 'ahadith', bookName, pageVolume.toString(), `${gradingFolder}.json`);
        const filePathAll = path.join('.', 'ahadith', bookName, pageVolume.toString(), 'all-ahadith.json');

        await ensureDirExists(path.dirname(filePath));
        await ensureDirExists(path.dirname(filePathAll));

        const existingData = await readJsonFile(filePath);
        const existingDataAll = await readJsonFile(filePathAll);

        const hadithObject = createHadithObject(params, gradingGeneral);

        const mergeObjects = [existingData, existingDataAll];

        for (const obj of mergeObjects) {
            let volumeData = obj;

            for (const key of [`Volume #${pageVolume}`, `Book #${pageBook}`, `Chapter #${pageChapter}`]) {
                volumeData[key] = volumeData[key] || {};
                volumeData = volumeData[key];
            }

            if (volumeData[hadithNumber]) {
                // Hadith already exists
                if (Array.isArray(volumeData[hadithNumber]['Grading'])) {
                    volumeData[hadithNumber]['Grading'].push(hadithObject[`Volume #${pageVolume}`][`Book #${pageBook}`][`Chapter #${pageChapter}`][hadithNumber]['Grading']);
                } else {
                    // Convert existing grading to array and add the new one
                    volumeData[hadithNumber]['Grading'] = [volumeData[hadithNumber]['Grading'], hadithObject[`Volume #${pageVolume}`][`Book #${pageBook}`][`Chapter #${pageChapter}`][hadithNumber]['Grading']];
                }
            } else {
                volumeData[hadithNumber] = hadithObject[`Volume #${pageVolume}`][`Book #${pageBook}`][`Chapter #${pageChapter}`][hadithNumber];
            }
        }

        await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
        await fs.writeFile(filePathAll, JSON.stringify(existingDataAll, null, 2), 'utf-8');
    } catch (error) {
        console.error(`An error occurred: ${error}`);
    }
}


module.exports = generalWriteFile;
