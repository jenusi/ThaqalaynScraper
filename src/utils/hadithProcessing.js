exports.extractHadithInfo = async (groupDiv) => {
  return await groupDiv.$eval(
    'div',
    (div) => {
      const h1 = div.querySelector("h1");
      const a = div.querySelector("a");
      const arabicTextP = div.querySelector('p[dir="rtl"]');
      const englishTranslationP = div.querySelector('p[class="text-lg font-sans"]');

      return {
        number: h1 ? h1.textContent.trim() : null,
        url: a ? a.href : null,
        arabicText: arabicTextP ? arabicTextP.textContent.trim() : null,
        englishTranslation: englishTranslationP ? englishTranslationP.textContent.trim() : null,
        gradings: [],
      };
    }
  );
};
