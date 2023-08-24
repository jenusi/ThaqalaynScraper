const SELECTED_BOOKS = [AlKafi, MujamAlAhadithAlMutabara, NahjAlBalagha];

// [AlKafi, MujamAlAhadithAlMutabara, AlKhisal, UyunAkhbarAlRida, AlAmali, AlTawhid, KitabAlDuafa, KitabAlGhaybaFirst, KitabAlGhaybaSecond, ThawabAlAmalWaIqabAlAmal, KamilAlZiyarat, FadailAlShia, SifatAlShia, MaaniAlAkhbar, KitabAlMumin, KitabAlZuhd, NahjAlBalagha];

const WAIT_TIME = 1;

// If you don't want gradings, set to 1. If you want to properly get gradings, set to 1500. If you scrape books like Nahj al-Balagha with no grading, it'll take a longer time to finish, as it won't find a grading.
// Do Books with no grading separately, then you won't have to wait.