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

const SELECTED_BOOKS = [KitabAlGhaybaFirst, KitabAlGhaybaSecond, ThawabAlAmalWaIqabAlAmal, KamilAlZiyarat, FadailAlShia, SifatAlShia, MaaniAlAkhbar, KitabAlMumin, KitabAlZuhd];

// [AlKafi, MujamAlAhadithAlMutabara, AlKhisal, UyunAkhbarAlRida, AlAmali, AlTawhid, KitabAlDuafa, KitabAlGhaybaFirst, KitabAlGhaybaSecond, ThawabAlAmalWaIqabAlAmal, KamilAlZiyarat, FadailAlShia, SifatAlShia, MaaniAlAkhbar, KitabAlMumin, KitabAlZuhd, NahjAlBalagha];

const WAIT_TIME = 1500;

// If you don't want gradings, set to 1. If you want to properly get gradings, set to 1500. If you scrape books like Nahj al-Balagha with no grading, it'll take a longer time to finish, as it won't find a grading.
// Do Books with no grading separately, then you won't have to wait.

const MAX_RETRIES = 3;

const SLEEP_TIME = 500;

module.exports = { SELECTED_BOOKS, WAIT_TIME, MAX_RETRIES, SLEEP_TIME };