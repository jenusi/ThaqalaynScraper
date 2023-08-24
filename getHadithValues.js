const generalWriteFile = require("./generalWriteFile.js");
const authorSpecificWriteFile = require("./authorSpecificWriteFile.js");

async function getHadithValues(group, page, pageVolume, pageBook, pageChapter, bookName, grading) {
    const link = await group.$("a[href]");
    const href = await (await link.getProperty("href")).jsonValue();

    const title = (await page.title()).slice(0, -12);
    const getTextContent = async (selector) => {
        const element = await group.$(selector);
        return element ? await element.evaluate((el) => el.textContent) : null;
    };

    const arabicText = await getTextContent("p.tracking-arabic");
    const englishText = await getTextContent("p.text-lg.font-sans");
    const hadithNumber = await getTextContent("h1.pt-5.pl-5.text-xl.font-bold");

    if (grading) {
        const badgeElements = await grading.$$("span.nextui-badge", { timeout: 10000, visible: true });
        const bookElements = await grading.$$(".text-center.my-auto.h-full.md\\:text-base.text-sm:nth-child(2n)");
        const authorElements = await grading.$$(".sm\\:text-right.text-center.font-semibold.my-auto.h-full.md\\:text-base.text-sm");

        let gradingTextArray = [];
        let gradingArray = [];
        let bookArray = [];
        let authorArray = [];

        for (let i = 0; i < badgeElements.length; i++) {
            const badgeElement = badgeElements[i];
            const bookElement = bookElements[i];
            const authorElement = authorElements[i];

            if (badgeElement) {
                const gradingText = await badgeElement.evaluate((gr) => gr.textContent);
                const className = await badgeElement.evaluate((cl) => cl.className);

                const bookText = bookElement ? await bookElement.evaluate((bo) => bo.textContent) : null;
                const authorText = authorElement ? await authorElement.evaluate((au) => au.textContent) : null;

                gradingTextArray.push(gradingText);
                console.log(pageVolume, pageBook, pageChapter)
                console.log(`Total badge elements: ${badgeElements.length}`);
                console.log(`Total book elements: ${bookElements.length}`);
                console.log(`Total author elements: ${authorElements.length}`);                
                console.log(bookText, authorText, gradingText)
                bookArray.push(bookText);
                authorArray.push(authorText);

                if (className.search("color-default") !== -1) {
                    await authorSpecificWriteFile(
                        bookName,
                        href,
                        title,
                        arabicText,
                        englishText,
                        hadithNumber,
                        pageVolume,
                        pageBook,
                        pageChapter,
                        "Acceptable",
                        gradingText,
                        bookText,
                        authorText,
                    );
                    gradingArray.push("Acceptable");
                } else if (className.search("color-success") !== -1) {
                    await authorSpecificWriteFile(
                        bookName,
                        href,
                        title,
                        arabicText,
                        englishText,
                        hadithNumber,
                        pageVolume,
                        pageBook,
                        pageChapter,
                        "Sahih",
                        gradingText,
                        bookText,
                        authorText,
                    );
                    gradingArray.push("Sahih");
                } else if (className.search("color-warning") !== -1) {
                    await authorSpecificWriteFile(
                        bookName,
                        href,
                        title,
                        arabicText,
                        englishText,
                        hadithNumber,
                        pageVolume,
                        pageBook,
                        pageChapter,
                        "Majhul",
                        gradingText,
                        bookText,
                        authorText,
                    );
                    gradingArray.push("Majhul");
                } else if (className.search("color-error") !== -1) {
                    if (gradingText === "لم يخرجه") {
                        await authorSpecificWriteFile(
                            bookName,
                            href,
                            title,
                            arabicText,
                            englishText,
                            hadithNumber,
                            pageVolume,
                            pageBook,
                            pageChapter,
                            "Not Included",
                            gradingText,
                            bookText,
                            authorText,
                        );
                        gradingArray.push("Not Included");
                    } else {
                        await authorSpecificWriteFile(
                            bookName,
                            href,
                            title,
                            arabicText,
                            englishText,
                            hadithNumber,
                            pageVolume,
                            pageBook,
                            pageChapter,
                            "Daif",
                            gradingText,
                            bookText,
                            authorText,
                        );
                        gradingArray.push("Daif");
                    }
                }
            }
        }
        await generalWriteFile(
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
        );

        return;
    }

    await generalWriteFile(
        bookName,
        href,
        title,
        arabicText,
        englishText,
        hadithNumber,
        pageVolume,
        pageBook,
        pageChapter,
    );

    return;
}

module.exports = getHadithValues;
