/* ============================================================
   data/adapter.js
   Bridges old Palteca data → new Flow app.
   Prints a diagnostic log to the console: type __adapterLog
   ============================================================ */

(function () {
  const log = [];
  function note(msg) { log.push(msg); console.log("[adapter]", msg); }
  function slug(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-|-$/g, "") || "item-" + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- 1. DETECT WHICH GLOBALS EXIST ---------- */
  const allGlobals = Object.keys(window);
  const interesting = allGlobals.filter((k) =>
    /vocabulary|vocab|grammar|sentence|exercise|text|level|topik|data/i.test(k)
  );
  note("Found global variables: " + (interesting.join(", ") || "(none)"));

  /* ---------- 2. HELPERS ---------- */
  function extractWord(item) {
    if (!item || typeof item !== "object") return null;
    const ko = item.ko || item.korean || item.hangul || item.word || item.term || item.kr || "";
    const en = item.en || item.english || item.meaning || item.translation || item.definition || item.def || "";
    if (!ko || !en) return null;
    return {
      ko,
      en,
      exKo: item.exKo || item.exampleKo || item.koreanExample || item.example_kr || "",
      exEn: item.exEn || item.exampleEn || item.englishExample || item.example_en || "",
      level: item.level || item.topik || item.grade || "",
      category: item.category || item.topic || ""
    };
  }

  function extractWords(data) {
    if (!Array.isArray(data)) return [];
    return data.map(extractWord).filter(Boolean);
  }

  function levelToNumber(level) {
    const m = String(level).match(/\d/);
    return m ? parseInt(m[0], 10) : 3;
  }

  function levelToString(n) {
    return n <= 2 ? "Beginner" : n === 3 ? "Intermediate" : "Advanced";
  }

  /* ---------- 3. VOCABULARY ---------- */
  const vocabCandidates = [
    window.vocabularyData,
    window.vocabulary,
    window.vocab,
    window.vocabData,
    window.koreanVocabulary
  ].filter(Boolean);

  if (vocabCandidates.length) {
    const vocabData = vocabCandidates[0];
    note("Found vocabulary data. Type: " + (Array.isArray(vocabData) ? "array" : typeof vocabData));

    // Case A: array of words
    if (Array.isArray(vocabData)) {
      const words = extractWords(vocabData);
      note("Extracted " + words.length + " words from flat array");

      if (words.length) {
        // Group by level if levels are present, otherwise one topic
        const hasLevels = words.some((w) => w.level);
        if (hasLevels) {
          const byLevel = {};
          words.forEach((w) => {
            const lvl = w.level || "General";
            if (!byLevel[lvl]) byLevel[lvl] = [];
            byLevel[lvl].push(w);
          });
          Object.keys(byLevel).forEach((lvl) => {
            const n = levelToNumber(lvl);
            registerTopic({
              id: "vocab-" + slug(lvl),
              title: lvl,
              titleKo: lvl,
              category: "Vocabulary",
              level: levelToString(n),
              emoji: "📖",
              summary: "Vocabulary — " + lvl,
              summaryKo: lvl + " 어휘",
              vocabulary: byLevel[lvl],
              idioms: [],
              discussionQuestions: [],
              grammarSpotlight: []
            });
            note("Registered topic: " + lvl + " (" + byLevel[lvl].length + " words)");
          });
        } else {
          registerTopic({
            id: "vocab-all",
            title: "Vocabulary",
            titleKo: "어휘",
            category: "Vocabulary",
            level: "Intermediate",
            emoji: "📖",
            summary: "All vocabulary",
            summaryKo: "전체 어휘",
            vocabulary: words,
            idioms: [],
            discussionQuestions: [],
            grammarSpotlight: []
          });
          note("Registered single vocabulary topic (" + words.length + " words)");
        }
      }
    }

    // Case B: object keyed by level
    else if (typeof vocabData === "object") {
      let total = 0;
      Object.keys(vocabData).forEach((key) => {
        const words = extractWords(vocabData[key]);
        if (!words.length) return;
        total += words.length;
        const n = levelToNumber(key);
        registerTopic({
          id: "vocab-" + slug(key),
          title: key,
          titleKo: key,
          category: "Vocabulary",
          level: levelToString(n),
          emoji: "📖",
          summary: "Vocabulary — " + key,
          summaryKo: key + " 어휘",
          vocabulary: words,
          idioms: [],
          discussionQuestions: [],
          grammarSpotlight: []
        });
        note("Registered topic: " + key + " (" + words.length + " words)");
      });
      note("Total vocabulary words registered: " + total);
    }
  } else {
    note("⚠️ No vocabulary data found in window");
  }

  /* ---------- 4. GRAMMAR ---------- */
  const grammarCandidates = [
    window.grammarData,
    window.grammar,
    window.grammarPoints
  ].filter(Boolean);

  if (grammarCandidates.length) {
    const grammarData = grammarCandidates[0];
    note("Found grammar data. Type: " + (Array.isArray(grammarData) ? "array" : typeof grammarData));

    let items = [];
    if (Array.isArray(grammarData)) items = grammarData;
    else if (typeof grammarData === "object") {
      Object.keys(grammarData).forEach((key) => {
        const v = grammarData[key];
        if (Array.isArray(v)) {
          v.forEach((g) => { if (g && typeof g === "object") items.push(g); });
        } else if (v && typeof v === "object") {
          items.push({ ...v, id: v.id || key });
        }
      });
    }

    items.forEach((g) => {
      if (!g) return;
      registerGrammar({
        id: g.id || slug(g.title || g.name || g.pattern),
        title: g.title || g.name || g.pattern || g.grammar || "",
        titleKo: g.titleKo || g.korean || g.title || g.pattern || "",
        level: g.level || "Intermediate",
        category: g.category || g.type || "Grammar",
        explanationKo: g.explanationKo || g.koreanExplanation || g.description || g.explanation || "",
        explanationEn: g.explanationEn || g.englishExplanation || g.explanationEn || "",
        structure: g.structure || g.pattern || "",
        examples: Array.isArray(g.examples) ? g.examples : [],
        commonMistakes: Array.isArray(g.commonMistakes) ? g.commonMistakes
                      : Array.isArray(g.mistakes) ? g.mistakes : [],
        tips: Array.isArray(g.tips) ? g.tips : [],
        related: Array.isArray(g.related) ? g.related : []
      });
    });
    note("Registered " + items.length + " grammar points");
  } else {
    note("⚠️ No grammar data found in window");
  }

  /* ---------- 5. SENTENCES / TEXTS (for examples) ---------- */
  const sentenceCandidates = [
    window.sentenceData,
    window.sentences,
    window.textData,
    window.texts
  ].filter(Boolean);

  if (sentenceCandidates.length) {
    note("Found sentence/text data (not used yet — logged for reference)");
  }

  /* ---------- 6. DONE ---------- */
  window.__adapterLog = log;
  console.log(
    "[adapter] Complete. Registered " +
    (window.__topics?.length || 0) + " topics and " +
    (window.__grammar?.length || 0) + " grammar points."
  );
  console.log("[adapter] Full log: type __adapterLog in the console.");
})();
