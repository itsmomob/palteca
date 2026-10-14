/* ============================================================
   data/adapter.js v3 — matches Palteca field names
   Vocabulary: { id, korean, reading, meaning_en, part_of_speech, collocations }
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
  ["vocabularyData","vocabulary","vocab","vocabData",
   "grammarData","grammar","grammarPoints",
   "sentenceData","sentences","exerciseData","exercises","textsData","texts","textData",
   "levelData","levels"].forEach((k) => {
    if (window[k] !== undefined) {
      const v = window[k];
      const d = Array.isArray(v) ? "Array(" + v.length + ")"
              : typeof v === "object" ? "Object(" + Object.keys(v).join(",") + ")"
              : typeof v;
      note("  " + k + " → " + d);
    }
  });

  /* ---------- 2. HELPERS ---------- */
  function pick(obj, ...keys) {
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
    }
    return "";
  }

  /* Match every possible spelling of "the Korean word" and "the English meaning" */
  function extractWord(item) {
    if (!item || typeof item !== "object") return null;

    const ko = pick(item,
      "korean","ko","hangul","kr","word","term","korean_word","한국어");
    const en = pick(item,
      "meaning_en","en","english","meaning","translation","definition",
      "def","english_word","영어","meaning_english");

    if (!ko || !en) return null;

    // Examples can live in several places
    const exKo = pick(item,
      "example_ko","exampleKo","example","example_kr","korean_example","koreanExample");
    const exEn = pick(item,
      "example_en","exampleEn","example_english","english_example","englishExample");

    // Collocations are also examples
    let collocKo = "", collocEn = "";
    if (Array.isArray(item.collocations) && item.collocations.length) {
      const first = item.collocations[0];
      if (typeof first === "string") collocKo = first;
      else if (first && typeof first === "object") {
        collocKo = pick(first, "ko","korean","phrase");
        collocEn = pick(first, "en","english","translation","meaning_en");
      }
    }

    return {
      ko: String(ko),
      en: String(en),
      reading: String(pick(item, "reading","romanization") || ""),
      pos: String(pick(item, "part_of_speech","pos","type") || ""),
      exKo: String(exKo || collocKo || ""),
      exEn: String(exEn || collocEn || ""),
      level: String(pick(item, "level","topik","grade") || ""),
      category: String(pick(item, "category","topic","theme") || "")
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
      note("Vocabulary: array with " + words.length + " valid words");
      if (words.length) {
        registerTopic({
          id: "vocab-all", title: "Vocabulary", titleKo: "어휘",
          category: "Vocabulary", level: "Intermediate", emoji: "📖",
          summary: "All vocabulary", summaryKo: "전체 어휘",
          vocabulary: words, idioms: [], discussionQuestions: [], grammarSpotlight: []
        });
      }
    } else if (typeof vocabData === "object") {
      const keys = Object.keys(vocabData);
      note("Vocabulary: object with keys → " + keys.join(", "));

      keys.forEach((key) => {
        const arr = vocabData[key];
        if (!Array.isArray(arr)) { note("  skip " + key + " (not array)"); return; }

        const words = extractWords(arr);
        if (!words.length) {
          warn("  " + key + ": 0 valid. First item keys: " +
               (arr[0] ? Object.keys(arr[0]).join(", ") : "(empty)"));
          return;
        }
        const label = levelLabel(key);
        registerTopic({
          id: "vocab-" + slug(key),
          title: label, titleKo: label,
          category: "Vocabulary", level: levelName(key), emoji: "📖",
          summary: "Vocabulary — " + label, summaryKo: label + " 어휘",
          vocabulary: words, idioms: [], discussionQuestions: [], grammarSpotlight: []
        });
        note("  ✔ " + label + " → " + words.length + " words");
      });
    }
  } else {
    warn("No vocabulary data found.");
  }

  /* ---------- 4. GRAMMAR ---------- */
  const grammarData = window.grammarData || window.grammar || window.grammarPoints;

  if (grammarData) {
    let firstGrammarSeen = false;

    function registerOne(g, groupKey) {
      if (!g || typeof g !== "object") return false;

      const title = pick(g,
        "grammar","title","name","pattern","point","structure",
        "rule","korean","topic");

      if (!title) {
        if (!firstGrammarSeen) {
          firstGrammarSeen = true;
          warn("Grammar item has no recognizable title. Keys: " +
               Object.keys(g).join(", "));
        }
        return false;
      }

      registerGrammar({
        id: g.id || slug(title),
        title: String(title),
        titleKo: String(pick(g, "titleKo","korean","ko","title") || title),
        level: String(pick(g, "level") || levelName(groupKey || "")),
        category: String(pick(g, "category","type") || (groupKey ? levelLabel(groupKey) : "Grammar")),
        explanationKo: String(pick(g,
          "explanation","description","meaning","explanationKo","koreanExplanation",
          "notes","note") || ""),
        explanationEn: String(pick(g, "explanationEn","englishExplanation","meaning_en") || ""),
        structure: String(pick(g, "structure","pattern","form") || ""),
        examples: Array.isArray(g.examples) ? g.examples
                : Array.isArray(g.sentences) ? g.sentences : [],
        commonMistakes: Array.isArray(g.commonMistakes) ? g.commonMistakes
                      : Array.isArray(g.mistakes) ? g.mistakes : [],
        tips: Array.isArray(g.tips) ? g.tips : [],
        related: Array.isArray(g.related) ? g.related : []
      });
      return true;
    }

    if (Array.isArray(grammarData)) {
      let ok = 0;
      grammarData.forEach((g) => { if (registerOne(g)) ok++; });
      note("Grammar: array, registered " + ok + " of " + grammarData.length);
    } else if (typeof grammarData === "object") {
      const keys = Object.keys(grammarData);
      note("Grammar: object keys → " + keys.join(", "));

      keys.forEach((key) => {
        const arr = grammarData[key];
        if (!Array.isArray(arr)) return;
        let ok = 0;
        arr.forEach((g) => { if (registerOne(g, key)) ok++; });
        note("  " + key + ": " + ok + " of " + arr.length + " registered");
      });
    }
  } else {
    warn("No grammar data found.");
  }

  /* ---------- 5. DONE ---------- */
  window.__adapterLog = log;
  const t = window.__topics.length;
  const g = window.__grammar.length;
  console.log("%c[adapter] ✅ Complete — " + t + " topics, " + g + " grammar points",
              "color:#10b981;font-weight:bold;font-size:14px;");
})();
