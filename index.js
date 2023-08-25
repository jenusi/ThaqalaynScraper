const sendBookToCheck = require("./sendBookToCheck.js");
const fs = require("fs").promises; // Use promises API for fs
const { SELECTED_BOOKS } = require("./const.js");

async function main() {
    try {
        await fs.rm("./ahadith", { recursive: true, force: true });

        const selectedBooks = SELECTED_BOOKS.flatMap((book) => book.numbers.map((number) => ({ number, book })));

        const results = await Promise.allSettled(selectedBooks.map(sendBookToCheck));

        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(`Error in task ${index}: ${result.reason}`);
            }
        });
    } catch (error) {
        console.error(`An error occurred: ${error}`);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(`An error occurred: ${error}`);
    process.exit(1);
});
