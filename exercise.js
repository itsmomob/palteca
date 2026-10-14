/* ============================================================
   exercise.js — Contextual word selection engine
   - No translation exercises
   - Sentence with blank + 4 word options
   - Distractors from same topic
   - Language-agnostic (Korean or English)
   ============================================================ */

window.ExerciseEngine = (function () {

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function detectLang(word) {
    if (!word) return "en";
    for (const ch of word) {
      const c = ch.charCodeAt(0);
      if (c >= 0xAC00 && c <= 0xD7A3) return "ko";
    }
    return "en";
  }

  /* Find and blank the target word in a sentence.
     Tries exact match first, then a loose stem match for
     English conjugated forms ("planning" → "plan"). */
  function blankWord(sentence, word) {
    if (!sentence || !word) return null;

    // Exact match
    if (sentence.includes(word)) {
      return {
        text: sentence.replace(word, "____"),
        form: word,
      };
    }

    // English stem match
    if (detectLang(word) === "en" && word.length >= 4) {
      const stem = word.slice(0, Math.max(4, word.length - 3)).toLowerCase();
      const re = new RegExp("\\b" + stem + "\\w*\\b", "i");
      const m = sentence.match(re);
      if (m && m[0].length >= 3 && m[0].length <= word.length + 5) {
        return {
          text: sentence.replace(re, "____"),
          form: m[0],
        };
      }
    }

    // Korean: word stem match (strip trailing particles)
    if (detectLang(word) === "ko" && word.length >= 2) {
      const stem = word.slice(0, Math.max(2, word.length - 1));
      if (sentence.includes(stem)) {
        return {
          text: sentence.replace(stem, "____"),
          form: stem,
        };
      }
    }

    return null;
  }

  /* Pick N distractor words from a pool.
     Prefers words from same topic with similar length. */
  function pickDistractors(correctWord, correctItem, pool, count, lang) {
    const correctLength = correctWord.length;

    const candidates = pool
      .filter((item) => item !== correctItem)
      .map((item) => ({
        word: lang === "ko" ? item.ko : item.en,
        item,
      }))
      .filter((c) => {
        if (!c.word) return false;
        if (c.word === correctWord) return false;
        if (detectLang(c.word) !== lang) return false;
        // Reject if the distractor also fits the blank (would be ambiguous)
        // We don't know the sentence here, so we skip this check.
        return true;
      });

    // Sort by similarity of length and whether same topic
    const scored = candidates.map((c) => {
      const lengthDiff = Math.abs(c.word.length - correctLength);
      const sameTopic = c.item.source === correctItem.source ? 1 : 0;
      return {
        ...c,
        score: sameTopic * 10 - lengthDiff,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    // Take a slightly wider net then shuffle, so it's not always the same
    const top = scored.slice(0, count * 4);
    const shuffled = shuffle(top);
    const picked = [];
    const seen = new Set([correctWord]);

    for (const c of shuffled) {
      if (seen.has(c.word)) continue;
      seen.add(c.word);
      picked.push(c.word);
      if (picked.length >= count) break;
    }

    return picked;
  }

  /* Build one exercise from a vocab item + pool */
  function createExercise(item, pool, lang) {
    const word = lang === "ko" ? item.ko : item.en;
    const sentence = lang === "ko" ? item.exKo : item.exEn;

    if (!word || !sentence) return null;

    const blanked = blankWord(sentence, word);
    if (!blanked) return null;

    const distractors = pickDistractors(word, item, pool, 3, lang);
    if (distractors.length < 3) return null;

    return {
      prompt: blanked.text,
      answer: word,
      answerForm: blanked.form,
      options: shuffle([word, ...distractors]),
      fullSentence: sentence,
      sentenceLang: lang,
      meaning: lang === "ko" ? item.en : item.ko,
      source: item.sourceLabel || item.source || "",
    };
  }

  /* Build a full session.
     opts = { lang: "ko"|"en", count: 12, items: [...], pool: [...] } */
  function buildSession(opts) {
    const { lang = "ko", count = 12, items } = opts;

    // Dedupe items
    const unique = [];
    const seen = new Set();
    for (const item of items) {
      const key = (item.ko || "") + "|" + (item.en || "");
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
    }

    const shuffled = shuffle(unique);
    const exercises = [];

    for (const item of shuffled) {
      if (exercises.length >= count) break;
      const ex = createExercise(item, unique, lang);
      if (ex) exercises.push(ex);
    }

    return exercises;
  }

  return {
    buildSession,
    createExercise,
    detectLang,
    blankWord,
  };
})();
