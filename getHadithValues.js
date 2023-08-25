const generalWriteFile = require("./generalWriteFile.js");
const authorSpecificWriteFile = require("./authorSpecificWriteFile.js");

const writeMethodMapping = {
    general: generalWriteFile,
    author: authorSpecificWriteFile,
};

async function write(type, ...args) {
    const method = writeMethodMapping[type];
    if (!method) throw new Error(`Invalid argument: ${type}`);
    await method(...args);
}

async function getTextContent(element, selector) {
    const elem = await element.$(selector);
    return elem ? await elem.evaluate((el) => el.textContent) : null;
}

async function evaluateElements(badgeElement, bookElement, authorElement) {
    const gradingText = await badgeElement.evaluate((el) => el.textContent);
    const className = await badgeElement.evaluate((el) => el.className);
    const bookText = bookElement ? await bookElement.evaluate((el) => el.textContent) : null;
    const authorText = authorElement ? await authorElement.evaluate((el) => el.textContent) : null;

    return { gradingText, className, bookText, authorText };
}

async function processGradingElements(gradingElements, writeData) {
    for (const gradingElement of gradingElements) {
        const badgeElements = await gradingElement.$$("span.nextui-badge");
        let bookElements = await gradingElement.$$(".text-center.my-auto.h-full.md\\:text-base.text-sm");
        const authorElements = await gradingElement.$$(".sm\\:text-right.text-center.font-semibold.my-auto.h-full.md\\:text-base.text-sm");

        bookElements = bookElements.filter((_, index) => index % 2 === 0);

        for (let i = 0; i < badgeElements.length; i++) {
            const { gradingText, className, bookText, authorText } = await evaluateElements(badgeElements[i], bookElements[i], authorElements[i]);
            let gradingGeneral;

            if (className.includes("color-default")) {
                gradingGeneral = "Acceptable";
            } else if (className.includes("color-success")) {
                gradingGeneral = "Sahih";
            } else if (className.includes("color-warning")) {
                gradingGeneral = "Majhul";
            } else if (className.includes("color-error")) {
                gradingGeneral = gradingText === "لم يخرجه" ? "Did not Include" : "Daif";
            }

            await write("author", ...writeData, gradingGeneral, gradingText, bookText, authorText);
            await write("general", ...writeData, gradingGeneral, gradingText, bookText, authorText);
        }
    }
}

async function getHadithValues(group, page, pageVolume, pageBook, pageChapter, bookName, grading = []) {
    try {
        const link = await group.$("a[href]");
        if (!link) throw new Error("No link found");

        const href = await link.getProperty("href").then((h) => h.jsonValue());
        if (!href) throw new Error("No href found");

        const title = (await page.title()).slice(0, -12);

        const arabicText = await getTextContent(group, "p.tracking-arabic");
        const englishText = await getTextContent(group, "p.text-lg.font-sans");
        const hadithNumber = await getTextContent(group, "h1.pt-5.pl-5.text-xl.font-bold");

        const writeData = [bookName, href, title, arabicText, englishText, hadithNumber, pageVolume, pageBook, pageChapter];

        if (grading && grading.length > 0) {
            await processGradingElements(grading, writeData);
        } else {
            await write("general", ...writeData);
        }
    } catch (error) {
        console.error(`An error occurred in getHadithValues: ${error.message}`);
    }
}

module.exports = getHadithValues;
