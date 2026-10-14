/* ============================================================
   data/adapter.js — bridges old Palteca data → new Flow app
   Prints a full diagnostic log to the console.
   Type __adapterLog to see it again.
   ============================================================ */

(function () {
  const log = [];
  function note(msg) { log.push(msg); console.log("[adapter]", msg); }
  function warn(msg) { log.push("⚠️ " + msg); console.warn("[adapter]", msg); }

  function slug(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-|-$/g, "") || "item-" + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- 1. DETECT ---------- */
  note("Scanning window for data...");
  const found = [];
  ["vocabularyData","vocabulary","vocab","vocabData","koreanVocabulary",
   "grammarData","grammar","grammarPoints",
   "sentenceData","sentences","exerciseData","exercises","textsData","texts","textData",
   "levelData","levels"].forEach((k) => {
    if (window[k] !== undefined) {
      const v = window[k];
      const desc = Array.isArray(v) ? "Array(" + v.length + ")"
                 : typeof v === "object" ? "Object(" + Object.keys(v).length + " keys: " + Object.keys(v).slice(0,6).join(", ") + ")"
                 : typeof v;
      found.push(k + "=" + desc);
    }
  });
  note("Found: " + (found.join(" | ") || "(nothing)"));

  /* ---------- 2. HELPERS ---------- */
  function pick(obj, ...keys) {
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
    }
    return "";
  }

  function extractWord(item) {
    if (!item || typeof item !== "object") return null;
    const ko = pick(item, "ko","korean","hangul","word","term","kr","korean_word");
    const en = pick(item, "en","english","meaning","translation","definition","def","english_word");
    if (!ko || !en) return null;
    return {
      ko: String(ko),
      en: String(en),
      exKo: String(pick(item, "exKo","exampleKo","koreanExample","example_kr","example","korean_example") || ""),
      exEn: String(pick(item, "exEn","exampleEn","englishExample","example_en","english_example") || ""),
      level: String(pick(item, "level","topik","grade","lvl") || ""),
      category: String(pick(item, "category","topic","theme","section") || "")
    };
  }

  function extractWords(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(extractWord).filter(Boolean);
  }

  function levelLabel(key) {
    const m = String(key).match(/TOPIK\s*(\d)/i);
    if (m) return "TOPIK " + m[1];
    return String(key);
  }

  function levelName(key) {
    const m = String(key).match(/(\d)/);
    const n = m ? parseInt(m[1], 10) : 3;
    return n <= 2 ? "Beginner" : n === 3 ? "Intermediate" : "Advanced";
  }

  /* ---------- 3. VOCABULARY ---------- */
  const vocabData = window.vocabularyData || window.vocabulary || window.vocab || window.vocabData;

  if (vocabData) {
    if (Array.isArray(vocabData)) {
      const words = extractWords(vocabData);
      note("Vocabulary: flat array with " + words.length + " valid words");
      if (words.length) {
        registerTopic({
          id: "vocab-all",
          title: "Vocabulary", titleKo: "어휘",
          category: "Vocabulary", level: "Intermediate", emoji: "📖",
          summary: "All vocabulary", summaryKo: "전체 어휘",
          vocabulary: words, idioms: [], discussionQuestions: [], grammarSpotlight: []
        });
      } else {
        warn("Vocabulary array found but no items matched {ko,en}");
        if (vocabData[0]) note("First item keys: " + Object.keys(vocabData[0]).join(", "));
      }
    } else if (typeof vocabData === "object") {
      const keys = Object.keys(vocabData);
      note("Vocabulary: object with keys → " + keys.join(", "));

      keys.forEach((key) => {
        const arr = vocabData[key];
        if (!Array.isArray(arr)) {
          note("  skipping " + key + " (not an array)");
          return;
        }
        const words = extractWords(arr);
        if (!words.length) {
          warn("  " + key + ": no valid words. First item keys: " +
               (arr[0] ? Object.keys(arr[0]).join(", ") : "(empty)"));
          return;
        }
        const label = levelLabel(key);
        registerTopic({
          id: "vocab-" + slug(key),
          title: label, titleKo: label,
          category: "Vocabulary", level: levelName(key), emoji: "📖",
          summary: "Vocabulary — " + label,
          summaryKo: label + " 어휘",
          vocabulary: words, idioms: [], discussionQuestions: [], grammarSpotlight: []
        });
        note("  ✔ registered " + label + " (" + words.length + " words)");
      });
    }
  } else {
    warn("No vocabulary data found. Did you change 'export const' to 'window.'?");
  }

  /* ---------- 4. GRAMMAR ---------- */
  const grammarData = window.grammarData || window.grammar || window.grammarPoints;

  if (grammarData) {
    if (Array.isArray(grammarData)) {
      note("Grammar: flat array with " + grammarData.length + " items");
      grammarData.forEach((g) => registerOne(g));
    } else if (typeof grammarData === "object") {
      const keys = Object.keys(grammarData);
      note("Grammar: object with keys → " + keys.join(", "));
      keys.forEach((key) => {
        const arr = grammarData[key];
        if (!Array.isArray(arr)) return;
        note("  " + key + ": " + arr.length + " grammar points");
        arr.forEach((g) => registerOne(g, key));
      });
    }
  } else {
    warn("No grammar data found. Did you change 'export const' to 'window.'?");
  }

  function registerOne(g, groupKey) {
    if (!g || typeof g !== "object") return;
    const title = pick(g, "title","name","pattern","grammar","point");
    if (!title) return;
    registerGrammar({
      id: g.id || slug(title),
      title: String(title),
      titleKo: String(pick(g, "titleKo","korean","titleKo","ko") || title),
      level: String(pick(g, "level") || levelName(groupKey || "")),
      category: String(pick(g, "category","type") || groupKey || "Grammar"),
      explanationKo: String(pick(g, "explanationKo","koreanExplanation","description","explanation") || ""),
      explanationEn: String(pick(g, "explanationEn","englishExplanation") || ""),
      structure: String(pick(g, "structure","pattern") || ""),
      examples: Array.isArray(g.examples) ? g.examples : [],
      commonMistakes: Array.isArray(g.commonMistakes) ? g.commonMistakes
                    : Array.isArray(g.mistakes) ? g.mistakes : [],
      tips: Array.isArray(g.tips) ? g.tips : [],
      related: Array.isArray(g.related) ? g.related : []
    });
  }

  /* ---------- 5. DONE ---------- */
  window.__adapterLog = log;
  const t = window.__topics.length;
  const g = window.__grammar.length;
  console.log("%c[adapter] ✅ Complete — " + t + " topics, " + g + " grammar points",
              "color:#10b981; font-weight:bold;");
  console.log("[adapter] Full log: type __adapterLog");
})();
