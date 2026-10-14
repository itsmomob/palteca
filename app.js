/* ============================================================
   Flow — app.js
   Contextual language learning: sentence + word selection
   ============================================================ */

/* ---------- REGISTRY ---------- */
const topics = window.__topics || [];
const grammarPoints = window.__grammar || [];

topics.sort((a, b) => a.title.localeCompare(b.title));
grammarPoints.sort((a, b) => a.title.localeCompare(b.title));

/* Flatten sectioned topics into flat vocab */
function flattenTopic(topic) {
  topic.vocabulary = topic.vocabulary || [];
  topic.idioms = topic.idioms || [];

  if (!topic.sections || !topic.sections.length) return topic;

  topic.sections.forEach((section) => {
    (section.questions || []).forEach((q) => {
      (q.vocab || []).forEach((v) =>
        topic.vocabulary.push({
          ...v,
          exKo: v.exKo || q.modelKo || "",
          exEn: v.exEn || q.model || "",
          source: topic.id,
          sourceLabel: topic.title,
        })
      );
      (q.phrasalVerbs || []).forEach((p) =>
        topic.idioms.push({
          ...p,
          exKo: p.exKo || q.modelKo || "",
          exEn: p.exEn || q.model || "",
          register: p.register || "neutral",
          source: topic.id,
          sourceLabel: topic.title,
        })
      );
    });
  });

  return topic;
}

topics.forEach(flattenTopic);

/* ---------- STATE ---------- */
const state = {
  studyExpanded: {},   // per-topic: { sentenceIndex: bool }
  grammarFilter: "all",
  session: null,       // active practice session
};

const SESSION_SIZE = 12;

/* ---------- UTILS ---------- */
function esc(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getTopic(id) { return topics.find((t) => t.id === id); }
function getGrammar(id) { return grammarPoints.find((g) => g.id === id); }
function levelClass(level) { return "level-" + String(level || "").toLowerCase(); }

function setAppBarTitle(title) {
  document.getElementById("appBarTitle").textContent = title || "Flow";
}
function showBackButton(show) {
  document.getElementById("backBtn").hidden = !show;
}

/* Detect the learning language for a topic */
function topicLang(topic) {
  if (topic.category === "TOPIK 1" || topic.category === "TOPIK 2") return "ko";
  return "en";
}

/* ---------- ROUTER ---------- */
function router() {
  const hash = window.location.hash.slice(1) || "/";
  const parts = hash.split("/").filter(Boolean);
  const view = parts[0] || "home";
  const id = parts[1];

  document.querySelectorAll(".tab-bar__item").forEach((a) => {
    const isActive =
      a.dataset.nav === view ||
      (view === "study" && a.dataset.nav === "study") ||
      (view === "topic" && a.dataset.nav === "study") ||
      (view === "session" && a.dataset.nav === "practice") ||
      (view === "grammar" && a.dataset.nav === "more");
    a.classList.toggle("active", isActive);
  });

  showBackButton(view !== "home");

  switch (view) {
    case "home":      renderHome(); break;
    case "study":     renderStudy(); break;
    case "topic":     renderTopicDetail(id); break;
    case "practice":  renderPracticeStart(); break;
    case "session":   /* handled by startSession flow */ break;
    case "grammar":   id ? renderGrammarDetail(id) : renderGrammarList(); break;
    case "discussion": renderDiscussion(); break;
    case "crossword": renderCrosswordRoute(id); break;
    case "more":      renderMore(); break;
    default:          renderHome();
  }

  window.scrollTo({ top: 0, behavior: "instant" });
}

/* ============================================================
   HOME
   ============================================================ */
function renderHome() {
  setAppBarTitle("Flow");
  const app = document.getElementById("app");

  const featured = topics.find(
    (t) => (t.vocabulary && t.vocabulary.length) || (t.sections && t.sections.length)
  ) || topics[0];

  if (!featured) {
    app.innerHTML = `<div class="empty"><h2>아직 준비 중이에요</h2><p>곧 학습 자료가 추가됩니다.</p></div>`;
    return;
  }

  const lang = topicLang(featured);

  app.innerHTML = `
    <div class="home-greeting">오늘의 학습</div>
    <section class="home-hero">
      <h1>${esc(featured.title)}</h1>
      <p>${esc(featured.summaryKo || featured.titleKo || "")}</p>
      <a href="#/topic/${featured.id}" class="btn">시작하기 →</a>
    </section>

    <div class="home-stat">
      <div class="stat-card">
        <div class="stat-card__value">${topics.length}</div>
        <div class="stat-card__label">학습 주제</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value">${topics.reduce((s, t) => s + (t.vocabulary?.length || 0), 0)}</div>
        <div class="stat-card__label">문장 카드</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value">${grammarPoints.length}</div>
        <div class="stat-card__label">문법</div>
      </div>
    </div>

    <h2>바로 시작</h2>
    <a href="#/practice" class="quick-link">
      <div class="quick-link__icon">🎯</div>
      <div class="quick-link__text">
        <h3>오늘의 연습</h3>
        <p>문맥 속에서 단어를 골라보세요</p>
      </div>
      <span class="quick-link__arrow">→</span>
    </a>
    <a href="#/study" class="quick-link">
      <div class="quick-link__icon">📚</div>
      <div class="quick-link__text">
        <h3>주제별 학습</h3>
        <p>상황 속에서 단어 익히기</p>
      </div>
      <span class="quick-link__arrow">→</span>
    </a>
  `;
}

/* ============================================================
   STUDY (topic list)
   ============================================================ */
function renderStudy() {
  setAppBarTitle("학습");
  const app = document.getElementById("app");

  app.innerHTML = `
    <h1>학습</h1>
    <p class="subtitle">상황 속에서 단어를 익혀보세요.</p>
    <div class="topic-list">
      ${topics.map(topicCardHTML).join("")}
    </div>
  `;
}

function topicCardHTML(t) {
  const count = (t.vocabulary?.length || 0) + (t.idioms?.length || 0);
  const sample = t.vocabulary?.[0];
  const preview = sample ? (sample.ko || sample.en || "") : "";

  return `
    <a href="#/topic/${t.id}" class="topic-card">
      <div class="topic-card__badges">
        <span class="badge cat">${esc(t.category)}</span>
        <span class="badge ${levelClass(t.level)}">${esc(t.level)}</span>
      </div>
      <h3>${esc(t.titleKo || t.title)}</h3>
      <div class="meta">
        <span>📖 ${count}개 표현</span>
        ${preview ? `<span>예: ${esc(preview)}</span>` : ""}
      </div>
    </a>
  `;
}

/* ============================================================
   TOPIC DETAIL — Study mode (sentence cards)
   ============================================================ */
function renderTopicDetail(id) {
  const topic = getTopic(id);
  const app = document.getElementById("app");

  if (!topic) {
    setAppBarTitle("찾을 수 없음");
    app.innerHTML = `<div class="empty"><h2>주제를 찾을 수 없습니다</h2><a href="#/study" class="btn">돌아가기</a></div>`;
    return;
  }

  setAppBarTitle(topic.titleKo || topic.title);
  const lang = topicLang(topic);
  const items = [...topic.vocabulary, ...topic.idioms];
  const usable = items.filter((v) => {
    const s = lang === "ko" ? v.exKo : v.exEn;
    const w = lang === "ko" ? v.ko : v.en;
    return s && w && s.includes(w);
  });

  if (!usable.length) {
    app.innerHTML = `
      <header class="study-header">
        <h1>${esc(topic.titleKo || topic.title)}</h1>
        <div class="sub">${esc(topic.summaryKo || "")}</div>
      </header>
      <div class="empty">
        <h2>문장이 없어요</h2>
        <p>이 주제에는 아직 예문이 없습니다.</p>
      </div>
      <a href="#/session/${topic.id}" class="btn" style="margin-top:20px;">그래도 연습하기</a>
    `;
    return;
  }

  app.innerHTML = `
    <header class="study-header">
      <h1>${esc(topic.titleKo || topic.title)}</h1>
      <div class="sub">${esc(topic.summaryKo || "")}</div>
      <div class="study-progress">
        <div class="study-progress__bar">
          <div class="study-progress__fill" style="width:100%"></div>
        </div>
        <div class="study-progress__label">${usable.length}개 문장</div>
      </div>
    </header>

    <p class="subtitle">문장을 읽고, 굵은 단어에 집중하세요.</p>

    <div id="sentenceList">
      ${usable.map((v, i) => sentenceCardHTML(v, i, lang)).join("")}
    </div>

    <a href="#/session/${topic.id}" class="btn" style="margin-top:24px;">
      이 주제로 연습하기 →
    </a>
  `;

  // Tap card to reveal meaning
  app.querySelectorAll(".sentence-card").forEach((card) => {
    card.addEventListener("click", () => {
      const meaning = card.querySelector(".sentence-card__meaning");
      if (!meaning) return;
      meaning.classList.toggle("hidden");
      const toggle = card.querySelector(".sentence-card__toggle");
      if (toggle) {
        toggle.textContent = meaning.classList.contains("hidden") ? "힌트 보기" : "숨기기";
      }
    });
  });
}

function sentenceCardHTML(v, i, lang) {
  const sentence = lang === "ko" ? v.exKo : v.exEn;
  const word = lang === "ko" ? v.ko : v.en;
  const meaning = lang === "ko" ? v.en : v.ko;

  // Bold the target word
  const highlighted = sentence.replace(
    word,
    `<mark>${esc(word)}</mark>`
  );

  return `
    <div class="sentence-card">
      <div class="sentence-card__text">${highlighted}</div>
      <div class="sentence-card__word-row">
        <div>
          <div class="sentence-card__word">${esc(word)}</div>
          <div class="sentence-card__meaning hidden">${esc(meaning)}</div>
        </div>
        <span class="sentence-card__toggle">힌트 보기</span>
      </div>
    </div>
  `;
}

/* ============================================================
   PRACTICE — Start screen
   ============================================================ */
function renderPracticeStart() {
  setAppBarTitle("연습");
  const app = document.getElementById("app");

  // Pick topics that have usable sentences
  const available = topics.filter((t) => {
    const lang = topicLang(t);
    return [...(t.vocabulary || []), ...(t.idioms || [])].some((v) => {
      const s = lang === "ko" ? v.exKo : v.exEn;
      const w = lang === "ko" ? v.ko : v.en;
      return s && w && s.includes(w);
    });
  });

  app.innerHTML = `
    <div class="session-intro">
      <div class="session-intro__icon">🎯</div>
      <h1>문맥 연습</h1>
      <p>빈칸에 들어갈 단어를 골라보세요.<br>번역 없이 상황만으로 익힙니다.</p>
    </div>

    <h2>전체 연습</h2>
    <a href="#/session/__all__" class="quick-link">
      <div class="quick-link__icon">🎲</div>
      <div class="quick-link__text">
        <h3>전체 섞기</h3>
        <p>모든 주제에서 무작위 ${SESSION_SIZE}문제</p>
      </div>
      <span class="quick-link__arrow">→</span>
    </a>

    <h2>주제별 연습</h2>
    <div class="topic-list">
      ${available.map((t) => `
        <a href="#/session/${t.id}" class="topic-card">
          <div class="topic-card__badges">
            <span class="badge cat">${esc(t.category)}</span>
            <span class="badge ${levelClass(t.level)}">${esc(t.level)}</span>
          </div>
          <h3>${esc(t.titleKo || t.title)}</h3>
          <div class="meta"><span>🎯 ${SESSION_SIZE}문제</span></div>
        </a>
      `).join("")}
    </div>
  `;
}

/* ============================================================
   SESSION — fill-in-the-blank flow
   ============================================================ */
function renderSession(topicId) {
  setAppBarTitle("연습");
  const app = document.getElementById("app");

  // Gather items
  let items = [];
  let title = "";
  let lang = "ko";
  let sessionBack = "#/practice";

  if (topicId === "__all__") {
    items = [];
    topics.forEach((t) => {
      const l = topicLang(t);
      [...(t.vocabulary || []), ...(t.idioms || [])].forEach((v) => {
        items.push({ ...v, _lang: l });
      });
    });
    title = "전체 섞기";
  } else {
    const topic = getTopic(topicId);
    if (!topic) {
      app.innerHTML = `<div class="empty"><h2>주제를 찾을 수 없습니다</h2><a href="#/practice" class="btn">돌아가기</a></div>`;
      return;
    }
    lang = topicLang(topic);
    items = [...topic.vocabulary, ...topic.idioms].map((v) => ({ ...v, _lang: lang }));
    title = topic.titleKo || topic.title;
    sessionBack = `#/topic/${topic.id}`;
  }

  // For mixed mode, we can only use one language at a time
  // Group by language and pick the one with more items
  let pool = items.filter((i) => i._lang === "ko");
  let sessionLang = "ko";
  if (pool.length < 6) {
    pool = items.filter((i) => i._lang === "en");
    sessionLang = "en";
  }

  const exercises = ExerciseEngine.buildSession({
    lang: sessionLang,
    count: SESSION_SIZE,
    items: pool,
  });

  if (!exercises.length) {
    app.innerHTML = `
      <div class="empty">
        <h2>연습할 문장이 없어요</h2>
        <p>이 주제에는 아직 예문이 부족합니다.</p>
        <a href="#/practice" class="btn">돌아가기</a>
      </div>`;
    return;
  }

  state.session = {
    topicId,
    title,
    exercises,
    index: 0,
    correct: 0,
    wrong: 0,
    answered: false,
    picked: null,
    back: sessionBack,
  };

  renderExercise();
}

function renderExercise() {
  const app = document.getElementById("app");
  const s = state.session;
  if (!s) { renderHome(); return; }

  if (s.index >= s.exercises.length) {
    renderSessionComplete();
    return;
  }

  const ex = s.exercises[s.index];
  const progress = ((s.index) / s.exercises.length) * 100;
  const isAnswered = s.answered;
  const picked = s.picked;
  const isCorrect = picked === ex.answer;

  // Build sentence HTML with blank or filled word
  let sentenceHTML;
  if (isAnswered) {
    sentenceHTML = ex.fullSentence.replace(
      ex.answerForm || ex.answer,
      `<span class="blank filled">${esc(ex.answer)}</span>`
    );
  } else {
    sentenceHTML = ex.prompt.replace("____", `<span class="blank">____</span>`);
  }

  app.innerHTML = `
    <div class="exercise">
      <div class="exercise-top">
        <div class="exercise-progress">
          <div class="exercise-progress__fill" style="width:${progress}%"></div>
        </div>
        <div class="exercise-progress__count">${s.index + 1} / ${s.exercises.length}</div>
      </div>

      <div class="exercise-card">
        <div class="exercise-card__hint">빈칸에 알맞은 단어를 고르세요</div>
        <div class="exercise-card__sentence">${sentenceHTML}</div>
      </div>

      <div class="exercise-options">
        ${ex.options.map((opt) => {
          let cls = "exercise-option";
          if (isAnswered) {
            if (opt === ex.answer) cls += " correct";
            else if (opt === picked) cls += " wrong";
            else cls += " dim";
          }
          return `<button class="${cls}" data-opt="${esc(opt)}" ${isAnswered ? "disabled" : ""}>${esc(opt)}</button>`;
        }).join("")}
      </div>

      ${isAnswered ? `
        <div class="exercise-feedback ${isCorrect ? "correct" : "wrong"}">
          <div class="exercise-feedback__header">
            <span class="icon">${isCorrect ? "✓" : "✕"}</span>
            <span>${isCorrect ? "정답이에요" : "다시 한번 기억해요"}</span>
          </div>
          <div class="exercise-feedback__sentence">
            ${ex.fullSentence.replace(
              ex.answerForm || ex.answer,
              `<strong>${esc(ex.answer)}</strong>`
            )}
          </div>
        </div>
        <button class="btn" id="nextBtn">계속 →</button>
      ` : ""}
    </div>
  `;

  // Wire up options (only if not answered)
  if (!isAnswered) {
    app.querySelectorAll(".exercise-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const picked = btn.dataset.opt;
        state.session.picked = picked;
        state.session.answered = true;
        if (picked === ex.answer) state.session.correct++;
        else state.session.wrong++;
        renderExercise();
      });
    });
  } else {
    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        state.session.index++;
        state.session.answered = false;
        state.session.picked = null;
        renderExercise();
      });
    }
  }
}

function renderSessionComplete() {
  const app = document.getElementById("app");
  const s = state.session;
  const total = s.exercises.length;
  const pct = total ? Math.round((s.correct / total) * 100) : 0;

  let message = "잘했어요!";
  if (pct === 100) message = "완벽해요! 🎉";
  else if (pct >= 80) message = "훌륭해요!";
  else if (pct >= 60) message = "좋아요!";

  setAppBarTitle("연습 완료");

  app.innerHTML = `
    <div class="complete-screen">
      <div class="complete-screen__icon">${pct === 100 ? "🎉" : pct >= 80 ? "🌟" : pct >= 60 ? "💪" : "📚"}</div>
      <h1>${message}</h1>
      <div class="score">${pct}%</div>
      <div class="complete-screen__stats">
        <div class="stat-card">
          <div class="stat-card__value correct">${s.correct}</div>
          <div class="stat-card__label">정답</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value wrong">${s.wrong}</div>
          <div class="stat-card__label">오답</div>
        </div>
      </div>
      <a href="#/practice" class="btn">다른 연습</a>
      <a href="${s.back}" class="btn btn-outline" style="margin-top:10px;">학습으로 돌아가기</a>
    </div>
  `;

  state.session = null;
}

/* ============================================================
   MORE
   ============================================================ */
function renderMore() {
  setAppBarTitle("더보기");
  const app = document.getElementById("app");

  app.innerHTML = `
    <h1>더보기</h1>
    <p class="subtitle">참고 자료와 부가 기능</p>

    <div class="more-list">
      <a href="#/grammar" class="quick-link">
        <div class="quick-link__icon">📝</div>
        <div class="quick-link__text">
          <h3>문법 가이드</h3>
          <p>핵심 문법 정리</p>
        </div>
        <span class="quick-link__arrow">→</span>
      </a>
      <a href="#/discussion" class="quick-link">
        <div class="quick-link__icon">💬</div>
        <div class="quick-link__text">
          <h3>토론 표현</h3>
          <p>의견·동의·반대 표현 모음</p>
        </div>
        <span class="quick-link__arrow">→</span>
      </a>
      <a href="#/crossword" class="quick-link">
        <div class="quick-link__icon">🧩</div>
        <div class="quick-link__text">
          <h3>십자말풀이</h3>
          <p>문맥으로 단어 맞추기</p>
        </div>
        <span class="quick-link__arrow">→</span>
      </a>
    </div>
  `;
}

/* ============================================================
   GRAMMAR
   ============================================================ */
function renderGrammarList() {
  setAppBarTitle("문법 가이드");
  const app = document.getElementById("app");
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];
  const filtered = state.grammarFilter === "all"
    ? grammarPoints
    : grammarPoints.filter((g) => g.level === state.grammarFilter);

  app.innerHTML = `
    <h1>문법 가이드</h1>
    <p class="subtitle">핵심 문법을 쉽게 정리했습니다.</p>
    <div class="grammar-filters">
      ${levels.map((l) => `
        <button class="filter-pill ${state.grammarFilter === l ? "active" : ""}" data-level="${l}">
          ${l === "all" ? "전체" : l}
        </button>`).join("")}
    </div>
    <div>
      ${filtered.map((g) => `
        <a href="#/grammar/${g.id}" class="grammar-card">
          <div class="grammar-card__badges">
            <span class="badge ${levelClass(g.level)}">${esc(g.level)}</span>
            <span class="badge">${esc(g.category)}</span>
          </div>
          <h3>${esc(g.titleKo || g.title)}</h3>
          <div class="ko">${esc(g.title)}</div>
        </a>`).join("")}
    </div>
  `;

  app.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.grammarFilter = btn.dataset.level;
      renderGrammarList();
    });
  });
}

function renderGrammarDetail(id) {
  const g = getGrammar(id);
  const app = document.getElementById("app");
  if (!g) { app.innerHTML = `<div class="empty"><h2>찾을 수 없습니다</h2><a href="#/grammar" class="btn">돌아가기</a></div>`; return; }
  setAppBarTitle(g.titleKo || g.title);

  app.innerHTML = `
    <header class="study-header">
      <h1>${esc(g.titleKo || g.title)}</h1>
      <div class="sub">${esc(g.title)}</div>
    </header>

    <div class="grammar-block">
      <h2>📘 설명</h2>
      <p>${esc(g.explanationKo)}</p>
      <p class="strong">${esc(g.explanationEn)}</p>
    </div>

    ${g.structure ? `<div class="grammar-block"><h2>🧩 구조</h2><div class="structure-box">${esc(g.structure)}</div></div>` : ""}

    ${g.examples?.length ? `
      <div class="grammar-block">
        <h2>✅ 예문</h2>
        <div class="example-list">
          ${g.examples.map((e) => `<div class="example-item"><div class="en">${esc(e.en)}</div><div class="ko">${esc(e.ko)}</div></div>`).join("")}
        </div>
      </div>` : ""}

    ${g.commonMistakes?.length ? `
      <div class="grammar-block">
        <h2>❌ 자주 하는 실수</h2>
        ${g.commonMistakes.map((m) => `
          <div class="mistake-item">
            <div class="wrong">${esc(m.wrong)}</div>
            <div class="right">${esc(m.right)}</div>
            <div class="note">${esc(m.note)}</div>
          </div>`).join("")}
      </div>` : ""}

    ${g.tips?.length ? `
      <div class="grammar-block">
        <h2>💡 팁</h2>
        <ul class="tip-list">${g.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>` : ""}
  `;
}

/* ============================================================
   DISCUSSION (compact)
   ============================================================ */
function renderDiscussion() {
  setAppBarTitle("토론 표현");
  const app = document.getElementById("app");

  const categories = [
    { icon: "💭", title: "의견 말하기", phrases: [
      { en: "In my opinion, ...", ko: "제 의견으로는, ..." },
      { en: "I think / I believe ...", ko: "저는 ~라고 생각해요" },
      { en: "From my perspective, ...", ko: "제 관점에서는, ..." },
      { en: "As far as I'm concerned, ...", ko: "제가 보기에는, ..." },
    ]},
    { icon: "✅", title: "동의하기", phrases: [
      { en: "I completely agree.", ko: "전적으로 동의합니다." },
      { en: "That's a good point.", ko: "좋은 지적이에요." },
      { en: "I see it the same way.", ko: "저도 같은 생각이에요." },
      { en: "Exactly.", ko: "바로 그거예요." },
    ]},
    { icon: "🤔", title: "정중하게 반대하기", phrases: [
      { en: "I see your point, but ...", ko: "말씀은 이해하지만, ..." },
      { en: "I'm not sure I agree.", ko: "동의하기 어렵네요." },
      { en: "That's one way to look at it, but ...", ko: "그렇게 볼 수도 있지만, ..." },
    ]},
    { icon: "❓", title: "질문 & 명확히 하기", phrases: [
      { en: "Could you elaborate on that?", ko: "좀 더 자세히 설명해 주시겠어요?" },
      { en: "Can you give an example?", ko: "예를 들어 주시겠어요?" },
      { en: "Just to clarify, ...", ko: "명확히 하자면, ..." },
    ]},
    { icon: "⏸️", title: "시간 벌기", phrases: [
      { en: "That's an interesting question.", ko: "흥미로운 질문이네요." },
      { en: "Let me think for a moment.", ko: "잠시 생각해 볼게요." },
    ]},
    { icon: "📝", title: "요약하기", phrases: [
      { en: "So, to sum up, ...", ko: "정리하자면, ..." },
      { en: "In other words, ...", ko: "다시 말해, ..." },
    ]},
  ];

  app.innerHTML = `
    <h1>토론 표현</h1>
    <p class="subtitle">회의와 토론에서 바로 쓰는 표현</p>
    ${categories.map((cat) => `
      <section style="margin-bottom:24px;">
        <h2>${cat.icon} ${esc(cat.title)}</h2>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${cat.phrases.map((p) => `
            <div class="grammar-block" style="padding:14px;">
              <div style="font-weight:700; color:var(--accent); font-size:0.95rem;">${esc(p.en)}</div>
              <div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">${esc(p.ko)}</div>
            </div>`).join("")}
        </div>
      </section>`).join("")}
  `;
}

/* ============================================================
   CROSSWORD ROUTE
   ============================================================ */
function renderCrosswordRoute(id) {
  const app = document.getElementById("app");
  setAppBarTitle("십자말풀이");
  const lang = window.CROSSWORD_LANG || "ko";

  let items = [], title = "", backHref = "#/more";

  if (id && id !== "all") {
    const topic = getTopic(id);
    if (!topic) { app.innerHTML = `<div class="empty"><h2>찾을 수 없습니다</h2><a href="#/more" class="btn">돌아가기</a></div>`; return; }
    items = [...topic.vocabulary, ...topic.idioms];
    title = topic.titleKo || topic.title;
    backHref = `#/topic/${topic.id}`;
  } else {
    topics.forEach((t) => { items.push(...(t.vocabulary || []), ...(t.idioms || [])); });
    title = "전체 주제";
  }

  if (typeof CrosswordPage === "undefined") {
    app.innerHTML = `<div class="empty"><h2>엔진을 불러올 수 없습니다</h2><a href="#/more" class="btn">돌아가기</a></div>`;
    return;
  }

  const entries = CrosswordPage.prepareEntries(items, lang);
  CrosswordPage.render(app, { entries, title, backHref, lang });
}

/* ============================================================
   INIT
   ============================================================ */
document.getElementById("backBtn").addEventListener("click", () => {
  if (window.history.length > 1) window.history.back();
  else window.location.hash = "#/";
});

/* Route handler that runs the session flow */
window.addEventListener("hashchange", () => {
  const hash = window.location.hash.slice(1) || "/";
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "session") {
    renderSession(parts[1] || "__all__");
    return;
  }
  router();
});
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.slice(1) || "/";
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "session") {
    renderSession(parts[1] || "__all__");
    return;
  }
  router();
});
