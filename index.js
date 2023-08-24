const sendBookToCheck = require("./sendBookToCheck.js");
const fs = require("fs");

const {
    AlKafi,
    MujamAlAhadithAlMutabara,
    AlKhisal,
    UyunAkhbarAlRida,
    AlAmali,
    AlTawhid,
    KitabAlDuafa,
    KitabAlGhaybaFirst,
    KitabAlGhaybaSecond,
    ThawabAlAmalWaIqabAlAmal,
    KamilAlZiyarat,
    FadailAlShia,
    SifatAlShia,
    MaaniAlAkhbar,
    KitabAlMumin,
    KitabAlZuhd,
    NahjAlBalagha,
} = require("./books.js");

const SELECTED_BOOKS = [AlKafi, MujamAlAhadithAlMutabara];

async function main() {
    fs.rmSync('./ahadith', { recursive: true, force: true });
    const selectedBooks = SELECTED_BOOKS.flatMap((book) => book.numbers.map((number) => ({ number, book })));
    await Promise.all(selectedBooks.map(sendBookToCheck));
}

main().catch((error) => {
    console.error(`An error occurred: ${error}`);
    process.exit(1);
});
