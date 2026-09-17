/* ============================================================
   English Mastery Hub — app.js
   Includes: topics, grammar, discussion, practice hub, crossword
   ============================================================ */

/* ---------- ASSEMBLE FROM REGISTRY ---------- */
const topics = window.__topics || [];
const grammarPoints = window.__grammar || [];

topics.sort((a, b) => a.title.localeCompare(b.title));
grammarPoints.sort((a, b) => a.title.localeCompare(b.title));

/* ---------- FLATTEN SECTIONED TOPICS ---------- */
function flattenTopic(topic) {
  topic.vocabulary = topic.vocabulary || [];
  topic.idioms = topic.idioms || [];
  topic.discussionQuestions = topic.discussionQuestions || [];

  if (!topic.sections || !topic.sections.length) return topic;

  topic.sections.forEach((section) => {
    (section.questions || []).forEach((q) => {
      if (q.q) topic.discussionQuestions.push(q.q);
      (q.vocab || []).forEach((v) =>
        topic.vocabulary.push({ ...v, source: topic.id, sourceLabel: topic.title })
      );
      (q.phrasalVerbs || []).forEach((p) =>
        topic.idioms.push({
          ...p,
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
  practice: {
    deckLabel: "",
    cards: [],
    index: 0,
    direction: "ko-en",
    revealed: false,
    correct: 0,
    wrong: 0,
    answered: [],
    finished: false,
    showDirection: true,
  },
  grammarFilter: "all",
};

const SESSION_SIZE = 20;

/* ---------- UTILS ---------- */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
  document.getElementById("appBarTitle").textContent = title || "English Mastery Hub";
}
function showBackButton(show) {
  document.getElementById("backBtn").hidden = !show;
}

/* ============================================================
   ROUTER
   ============================================================ */
function router() {
  const hash = window.location.hash.slice(1) || "/";
  const parts = hash.split("/").filter(Boolean);
  const view = parts[0] || "home";
  const id = parts[1];

  document.querySelectorAll(".tab-bar__item").forEach((a) => {
    const isActive =
      a.dataset.nav === view ||
      (view === "topic" && a.dataset.nav === "topics") ||
      (view === "crossword" && a.dataset.nav === "practice") ||
      (view === "practice" && a.dataset.nav === "practice");
    a.classList.toggle("active", isActive);
  });

  showBackButton(view !== "home");

  if (view === "home") renderHome();
  else if (view === "topics") renderTopics();
  else if (view === "topic") renderTopicDetail(id);
  else if (view === "grammar") id ? renderGrammarDetail(id) : renderGrammarList();
  else if (view === "discussion") renderDiscussion();
  else if (view === "practice") renderPracticeRoute(id);
  else if (view === "crossword") renderCrosswordRoute(id);
  else renderHome();

  window.scrollTo({ top: 0, behavior: "instant" });
}

/* ============================================================
   HOME
   ============================================================ */
function renderHome() {
  setAppBarTitle("English Mastery Hub");
  const app = document.getElementById("app");

  const featured =
    topics.find(
      (t) => (t.vocabulary && t.vocabulary.length) || (t.sections && t.sections.length)
    ) || topics[0];

  if (!featured) {
    app.innerHTML = `
      <div class="empty">
        <h2>주제가 아직 없습니다</h2>
        <p>data/topics/ 폴더에 파일을 추가하세요.</p>
      </div>`;
    return;
  }

  const recent = topics.filter((t) => t.id !== featured.id).slice(0, 3);

  app.innerHTML = `
    <section class="hero">
      <h1>영어로 자신 있게 말하세요</h1>
      <p class="subtitle">수업 전후로 언제든 복습하세요.</p>
      <div class="featured-topic">
        <div class="label">오늘의 주제</div>
        <h3>${esc(featured.title)}</h3>
        <div class="meta">${esc(featured.titleKo)} · ${esc(featured.level)}</div>
        <a href="#/topic/${featured.id}" class="btn">학습하기</a>
      </div>
    </section>

    <h2>빠른 이동</h2>
    <div class="quick-links">
      <a href="#/practice" class="quick-link">
        <div class="quick-link__icon">🎯</div>
        <div class="quick-link__text">
          <h3>플래시카드 연습</h3>
          <p>어휘와 문법을 문제로 풀어보세요</p>
        </div>
        <span class="quick-link__arrow">→</span>
      </a>
      <a href="#/crossword" class="quick-link">
        <div class="quick-link__icon">🧩</div>
        <div class="quick-link__text">
          <h3>십자말풀이</h3>
          <p>문맥으로 단어를 맞춰보세요</p>
        </div>
        <span class="quick-link__arrow">→</span>
      </a>
      <a href="#/grammar" class="quick-link">
        <div class="quick-link__icon">📝</div>
        <div class="quick-link__text">
          <h3>문법 가이드</h3>
          <p>쉽게 설명한 핵심 문법</p>
        </div>
        <span class="quick-link__arrow">→</span>
      </a>
    </div>

    <h2>최근 주제</h2>
    <div class="topic-list">
      ${recent.map(topicCardHTML).join("")}
    </div>
  `;
}

function topicCardHTML(t) {
  const vocabCount = t.vocabulary ? t.vocabulary.length : 0;
  const idiomCount = t.idioms ? t.idioms.length : 0;
  return `
    <a href="#/topic/${t.id}" class="topic-card">
      <div class="topic-card__badges">
        <span class="badge">${esc(t.category)}</span>
        <span class="badge ${levelClass(t.level)}">${esc(t.level)}</span>
      </div>
      <h3>${esc(t.title)}</h3>
      <p class="ko">${esc(t.titleKo)}</p>
      <div class="topic-card__meta">
        <span>📖 ${vocabCount}개 어휘</span>
        <span>💬 ${idiomCount}개 표현</span>
      </div>
    </a>
  `;
}

/* ============================================================
   TOPICS LIST
   ============================================================ */
function renderTopics() {
  setAppBarTitle("주제별 어휘");
  const app = document.getElementById("app");
  app.innerHTML = `
    <h1>주제별 어휘</h1>
    <p class="subtitle">수업 주제를 선택해 복습하세요.</p>
    <div class="topic-list">
      ${topics.map(topicCardHTML).join("")}
    </div>
  `;
}

/* ============================================================
   TOPIC DETAIL
   ============================================================ */
function renderTopicDetail(id) {
  const topic = getTopic(id);
  const app = document.getElementById("app");

  if (!topic) {
    setAppBarTitle("찾을 수 없음");
    app.innerHTML = `<div class="empty"><h2>주제를 찾을 수 없습니다</h2><a href="#/topics" class="btn">주제 목록으로</a></div>`;
    return;
  }

  setAppBarTitle(topic.title);

  if (topic.sections && topic.sections.length) {
    renderSectionedTopicDetail(topic);
  } else {
    renderFlatTopicDetail(topic);
  }
}

function renderSectionedTopicDetail(topic) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <header class="topic-header">
      <div class="topic-header__badges">
        <span class="badge">${esc(topic.category)}</span>
        <span class="badge ${levelClass(topic.level)}">${esc(topic.level)}</span>
      </div>
      <h1>${esc(topic.title)}</h1>
      <div class="ko-title">${esc(topic.titleKo)}</div>
      <p class="summary">${esc(topic.summaryKo || "")}</p>
    </header>

    ${topic.sections.map((section, si) => `
      <div class="accordion ${si === 0 ? "open" : ""}">
        <button class="accordion__header">
          <span class="accordion__title">
            <span class="section-number">${si + 1}</span>
            ${esc(section.title)}
          </span>
          <span class="accordion__chevron">▼</span>
        </button>
        <div class="accordion__body">
          ${(section.questions || []).map(renderQuestionBlock).join("")}
        </div>
      </div>
    `).join("")}

    ${renderGrammarSpotlight(topic)}

    <a href="#/crossword/${topic.id}" class="grammar-link" style="margin-bottom:12px;">
      <div>
        <strong>🧩 십자말풀이</strong>
        <div class="ko">이 주제로 단어 맞추기</div>
      </div>
      <span style="color:var(--text-muted);">→</span>
    </a>

    <a href="#/practice/${topic.id}" class="fab">
      <span class="fab__icon">🎯</span>
      <span>연습 시작</span>
    </a>
  `;

  app.querySelectorAll(".accordion__header").forEach((header) => {
    header.addEventListener("click", () => {
      header.closest(".accordion").classList.toggle("open");
    });
  });
}

function renderQuestionBlock(q) {
  return `
    <div class="question-block">
      <div class="question-block__q">
        <div class="question-block__en">${esc(q.q)}</div>
        ${q.qKo ? `<div class="question-block__ko">${esc(q.qKo)}</div>` : ""}
      </div>

      ${q.vocab && q.vocab.length ? `
      <div class="question-block__section">
        <div class="question-block__label">📖 어휘</div>
        ${q.vocab.map((v) => `
          <div class="mini-vocab">
            <span class="mini-vocab__en">${esc(v.en)}</span>
            <span class="mini-vocab__ko">${esc(v.ko)}</span>
          </div>
        `).join("")}
      </div>` : ""}

      ${q.phrasalVerbs && q.phrasalVerbs.length ? `
      <div class="question-block__section">
        <div class="question-block__label">🔗 구동사 & 표현</div>
        ${q.phrasalVerbs.map((p) => `
          <div class="mini-vocab">
            <span class="mini-vocab__en">${esc(p.en)}</span>
            <span class="mini-vocab__ko">${esc(p.ko)}</span>
          </div>
        `).join("")}
      </div>` : ""}

      ${q.model ? `
      <div class="question-block__model">
        <div class="question-block__label">💡 모범 답안</div>
        <div class="model-en">"${esc(q.model)}"</div>
        ${q.modelKo ? `<div class="model-ko">${esc(q.modelKo)}</div>` : ""}
      </div>` : ""}
    </div>
  `;
}

function renderFlatTopicDetail(topic) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <header class="topic-header">
      <div class="topic-header__badges">
        <span class="badge">${esc(topic.category)}</span>
        <span class="badge ${levelClass(topic.level)}">${esc(topic.level)}</span>
      </div>
      <h1>${esc(topic.title)}</h1>
      <div class="ko-title">${esc(topic.titleKo)}</div>
      <p class="summary">${esc(topic.summaryKo || "")}</p>
    </header>

    ${topic.vocabulary.length ? `
    <div class="accordion open">
      <button class="accordion__header">
        <span class="accordion__title">
          📖 핵심 어휘
          <span class="accordion__count">${topic.vocabulary.length}</span>
        </span>
        <span class="accordion__chevron">▼</span>
      </button>
      <div class="accordion__body">
        ${topic.vocabulary.map((v) => vocabItemHTML(v)).join("")}
      </div>
    </div>` : ""}

    ${topic.idioms.length ? `
    <div class="accordion">
      <button class="accordion__header">
        <span class="accordion__title">
          💬 관용 표현
          <span class="accordion__count">${topic.idioms.length}</span>
        </span>
        <span class="accordion__chevron">▼</span>
      </button>
      <div class="accordion__body">
        ${topic.idioms.map((i) => vocabItemHTML(i, true)).join("")}
      </div>
    </div>` : ""}

    ${topic.discussionQuestions.length ? `
    <div class="accordion">
      <button class="accordion__header">
        <span class="accordion__title">
          🗣️ 토론 질문
          <span class="accordion__count">${topic.discussionQuestions.length}</span>
        </span>
        <span class="accordion__chevron">▼</span>
      </button>
      <div class="accordion__body">
        ${topic.discussionQuestions.map((q) => `<div class="question-item">${esc(q)}</div>`).join("")}
      </div>
    </div>` : ""}

    ${renderGrammarSpotlight(topic)}

    <a href="#/crossword/${topic.id}" class="grammar-link" style="margin-bottom:12px;">
      <div>
        <strong>🧩 십자말풀이</strong>
        <div class="ko">이 주제로 단어 맞추기</div>
      </div>
      <span style="color:var(--text-muted);">→</span>
    </a>

    <a href="#/practice/${topic.id}" class="fab">
      <span class="fab__icon">🎯</span>
      <span>연습 시작</span>
    </a>
  `;

  app.querySelectorAll(".accordion__header").forEach((header) => {
    header.addEventListener("click", () => {
      header.closest(".accordion").classList.toggle("open");
    });
  });
}

function vocabItemHTML(v, isIdiom = false) {
  const hasExample = v.exEn || v.exKo;
  return `
    <div class="vocab-item">
      <div class="vocab-item__head">
        <span class="vocab-item__en">${esc(v.en)}</span>
        <span class="vocab-item__ko">${esc(v.ko)}${v.register ? `<span class="register ${v.register}">${esc(v.register)}</span>` : ""}</span>
      </div>
      ${hasExample ? `
      <div class="vocab-item__ex">
        ${v.exEn ? `<div class="ex-en">${esc(v.exEn)}</div>` : ""}
        ${v.exKo ? `<div>${esc(v.exKo)}</div>` : ""}
      </div>` : ""}
    </div>
  `;
}

function renderGrammarSpotlight(topic) {
  if (!topic.grammarSpotlight || !topic.grammarSpotlight.length) return "";

  const links = topic.grammarSpotlight
    .map((g) => {
      const gp = getGrammar(g.grammarId);
      if (!gp) return "";
      return `
        <a href="#/grammar/${gp.id}" class="grammar-link" style="margin-bottom:8px;">
          <div>
            <strong>${esc(gp.title)}</strong>
            <div class="ko">${esc(gp.titleKo)}</div>
          </div>
          <span style="color:var(--text-muted);">→</span>
        </a>
      `;
    })
    .join("");

  if (!links) return "";
  return `
    <div class="accordion">
      <button class="accordion__header">
        <span class="accordion__title">📌 문법 포인트</span>
        <span class="accordion__chevron">▼</span>
      </button>
      <div class="accordion__body">${links}</div>
    </div>
  `;
}

/* ============================================================
   GRAMMAR LIST
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
    <p class="subtitle">한국인 학습자를 위한 핵심 문법</p>
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
          <h3>${esc(g.title)}</h3>
          <div class="ko">${esc(g.titleKo)}</div>
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

/* ============================================================
   GRAMMAR DETAIL
   ============================================================ */
function renderGrammarDetail(id) {
  const g = getGrammar(id);
  const app = document.getElementById("app");

  if (!g) {
    setAppBarTitle("찾을 수 없음");
    app.innerHTML = `<div class="empty"><h2>문법 항목을 찾을 수 없습니다</h2><a href="#/grammar" class="btn">문법 목록으로</a></div>`;
    return;
  }

  setAppBarTitle(g.title);
  app.innerHTML = `
    <header class="topic-header">
      <div class="topic-header__badges">
        <span class="badge ${levelClass(g.level)}">${esc(g.level)}</span>
        <span class="badge">${esc(g.category)}</span>
      </div>
      <h1>${esc(g.title)}</h1>
      <div class="ko-title">${esc(g.titleKo)}</div>
    </header>

    <div class="grammar-block">
      <h2>📘 설명</h2>
      <p>${esc(g.explanationKo)}</p>
      <p class="strong">${esc(g.explanationEn)}</p>
    </div>

    ${g.structure ? `
    <div class="grammar-block">
      <h2>🧩 구조</h2>
      <div class="structure-box">${esc(g.structure)}</div>
    </div>` : ""}

    ${g.examples && g.examples.length ? `
    <div class="grammar-block">
      <h2>✅ 예문</h2>
      <div class="example-list">
        ${g.examples.map((e) => `
          <div class="example-item">
            <div class="en">${esc(e.en)}</div>
            <div class="ko">${esc(e.ko)}</div>
          </div>`).join("")}
      </div>
    </div>` : ""}

    ${g.commonMistakes && g.commonMistakes.length ? `
    <div class="grammar-block">
      <h2>❌ 자주 하는 실수</h2>
      ${g.commonMistakes.map((m) => `
        <div class="mistake-item">
          <div class="wrong">${esc(m.wrong)}</div>
          <div class="right">${esc(m.right)}</div>
          <div class="note">${esc(m.note)}</div>
        </div>`).join("")}
    </div>` : ""}

    ${g.tips && g.tips.length ? `
    <div class="grammar-block">
      <h2>💡 팁</h2>
      <ul class="tip-list">
        ${g.tips.map((t) => `<li>${esc(t)}</li>`).join("")}
      </ul>
    </div>` : ""}

    ${g.related && g.related.length ? `
    <div class="grammar-block">
      <h2>🔗 관련 문법</h2>
      <div class="related-links">
        ${g.related.map((rid) => {
          const rg = getGrammar(rid);
          return rg ? `<a href="#/grammar/${rg.id}">${esc(rg.title)}</a>` : "";
        }).join("")}
      </div>
    </div>` : ""}

    <a href="#/practice/grammar/${g.id}" class="fab">
      <span class="fab__icon">🎯</span>
      <span>연습 시작</span>
    </a>
  `;
}

/* ============================================================
   DISCUSSION
   ============================================================ */
function renderDiscussion() {
  setAppBarTitle("토론 표현");
  const app = document.getElementById("app");

  const categories = [
    {
      icon: "💭", title: "의견 말하기", titleEn: "Giving Opinions",
      phrases: [
        { en: "In my opinion, ...", ko: "제 의견으로는, ...", ex: "In my opinion, we should wait." },
        { en: "I think / I believe ...", ko: "저는 ~라고 생각해요", ex: "I think this is the best option." },
        { en: "From my perspective, ...", ko: "제 관점에서는, ...", ex: "From my perspective, it's too risky." },
        { en: "As far as I'm concerned, ...", ko: "제가 보기에는, ...", ex: "As far as I'm concerned, it's a win-win." },
      ],
    },
    {
      icon: "✅", title: "동의하기", titleEn: "Agreeing",
      phrases: [
        { en: "I completely agree.", ko: "전적으로 동의합니다.", ex: "I completely agree with your point." },
        { en: "That's a good point.", ko: "좋은 지적이에요.", ex: "That's a good point. I hadn't thought of that." },
        { en: "I see it the same way.", ko: "저도 같은 생각이에요.", ex: "I see it the same way." },
        { en: "Exactly.", ko: "바로 그거예요.", ex: "Exactly. That's what I meant." },
      ],
    },
    {
      icon: "🤔", title: "정중하게 반대하기", titleEn: "Disagreeing Politely",
      phrases: [
        { en: "I see your point, but ...", ko: "말씀은 이해하지만, ...", ex: "I see your point, but I think we need more data." },
        { en: "I'm not sure I agree.", ko: "동의하기 어렵네요.", ex: "I'm not sure I agree with that." },
        { en: "I understand where you're coming from, however ...", ko: "말씀하시는 취지는 알겠지만, ...", ex: "I understand where you're coming from, however, we have limited time." },
        { en: "That's one way to look at it, but ...", ko: "그렇게 볼 수도 있지만, ...", ex: "That's one way to look at it, but there's another side." },
      ],
    },
    {
      icon: "❓", title: "질문 & 명확히 하기", titleEn: "Asking & Clarifying",
      phrases: [
        { en: "Could you elaborate on that?", ko: "좀 더 자세히 설명해 주시겠어요?", ex: "Could you elaborate on that point?" },
        { en: "What do you mean by ...?", ko: "...이 무슨 뜻이에요?", ex: "What do you mean by 'risky'?" },
        { en: "Can you give an example?", ko: "예를 들어 주시겠어요?", ex: "Can you give an example of that?" },
        { en: "Just to clarify, ...", ko: "명확히 하자면, ...", ex: "Just to clarify, you're saying we should wait?" },
      ],
    },
    {
      icon: "⏸️", title: "시간 벌기", titleEn: "Buying Time",
      phrases: [
        { en: "That's an interesting question.", ko: "흥미로운 질문이네요.", ex: "That's an interesting question. Let me think." },
        { en: "Let me think for a moment.", ko: "잠시 생각해 볼게요.", ex: "Let me think for a moment." },
        { en: "How should I put this ...", ko: "뭐라고 표현해야 할까요 ...", ex: "How should I put this ... it's complicated." },
        { en: "That's a tough one.", ko: "어려운 질문이네요.", ex: "That's a tough one. I'd need to check." },
      ],
    },
    {
      icon: "📝", title: "요약하기", titleEn: "Summarizing",
      phrases: [
        { en: "So, to sum up, ...", ko: "정리하자면, ...", ex: "So, to sum up, we need more time." },
        { en: "In other words, ...", ko: "다시 말해, ...", ex: "In other words, we can't afford it." },
        { en: "What I'm trying to say is ...", ko: "제가 말하고 싶은 건 ...", ex: "What I'm trying to say is we need a new plan." },
        { en: "The main point is ...", ko: "핵심은 ...", ex: "The main point is we have to decide today." },
      ],
    },
    {
      icon: "✋", title: "정중하게 끼어들기", titleEn: "Interrupting Politely",
      phrases: [
        { en: "Sorry to interrupt, but ...", ko: "끼어들어 죄송하지만, ...", ex: "Sorry to interrupt, but I have a quick question." },
        { en: "Can I just add something?", ko: "한 가지만 덧붙여도 될까요?", ex: "Can I just add something here?" },
        { en: "If I may, ...", ko: "실례지만, ...", ex: "If I may, I'd like to share my view." },
        { en: "Before we move on, ...", ko: "넘어가기 전에, ...", ex: "Before we move on, can we revisit the budget?" },
      ],
    },
  ];

  app.innerHTML = `
    <h1>토론 표현</h1>
    <p class="subtitle">영어 토론·회의에서 바로 쓰는 표현</p>
    ${categories.map((cat) => `
      <section class="discussion-category">
        <h2>
          <span>${cat.icon}</span>
          ${esc(cat.title)}
          <span class="en-sub">${esc(cat.titleEn)}</span>
        </h2>
        <div class="phrase-list">
          ${cat.phrases.map((p) => `
            <div class="phrase-item">
              <div class="en">${esc(p.en)}</div>
              <div class="ko">${esc(p.ko)}</div>
              <div class="ex">${esc(p.ex)}</div>
            </div>`).join("")}
        </div>
      </section>`).join("")}
  `;
}

/* ============================================================
   PRACTICE ROUTER
   ============================================================ */
function renderPracticeRoute(id) {
  if (!id) { renderPracticeHub(); return; }

  if (id === "all-vocab") { startPractice("전체 어휘", buildAllVocabDeck(), true); return; }
  if (id === "grammar")   { startPractice("전체 문법", buildAllGrammarDeck(), false); return; }
  if (id === "mixed")     { startPractice("전체 섞기", buildMixedDeck(), true); return; }

  const hash = window.location.hash.slice(1);
  const parts = hash.split("/").filter(Boolean);

  if (parts[0] === "practice" && parts[1] === "grammar" && parts[2]) {
    const g = getGrammar(parts[2]);
    if (!g) {
      document.getElementById("app").innerHTML = `<div class="empty"><h2>문법을 찾을 수 없습니다</h2><a href="#/practice" class="btn">연습으로</a></div>`;
      return;
    }
    startPractice(g.title, grammarToCards(g), false);
    return;
  }

  const topic = getTopic(id);
  if (!topic) {
    document.getElementById("app").innerHTML = `<div class="empty"><h2>주제를 찾을 수 없습니다</h2><a href="#/practice" class="btn">연습으로</a></div>`;
    return;
  }

  const cards = [
    ...topic.vocabulary.map((v) => vocabToCard(v, "vocab")),
    ...topic.idioms.map((i) => vocabToCard(i, "idiom")),
  ];

  startPractice(topic.title, cards, true);
}

/* ============================================================
   DECK BUILDERS
   ============================================================ */
function vocabToCard(v, type) {
  return {
    kind: "vocab",
    type,
    en: v.en,
    ko: v.ko,
    exEn: v.exEn || "",
    exKo: v.exKo || "",
    source: v.source || "",
    sourceLabel: v.sourceLabel || "",
  };
}

function grammarToCards(g) {
  const cards = [];

  cards.push({
    kind: "grammar",
    subtype: "name",
    prompt_ko: g.titleKo,
    prompt_en: g.title,
    answer_ko: g.titleKo,
    answer_en: g.title,
    hint: g.category || "문법",
    source: g.id,
    sourceLabel: g.title,
  });

  if (g.structure) {
    cards.push({
      kind: "grammar",
      subtype: "structure",
      prompt_ko: `${g.titleKo} 구조는?`,
      prompt_en: `${g.title} — structure?`,
      answer_ko: g.structure,
      answer_en: g.structure,
      hint: "구조 · Structure",
      source: g.id,
      sourceLabel: g.title,
    });
  }

  (g.commonMistakes || []).forEach((m) => {
    if (!m.wrong || !m.right) return;
    cards.push({
      kind: "grammar",
      subtype: "mistake",
      prompt_ko: m.wrong,
      prompt_en: m.wrong,
      answer_ko: m.right,
      answer_en: m.right,
      hint: m.note || "올바르게 고쳐 보세요",
      source: g.id,
      sourceLabel: g.title,
    });
  });

  return cards;
}

function sample(arr, n) {
  if (arr.length <= n) return shuffle(arr);
  return shuffle(arr).slice(0, n);
}

function buildAllVocabDeck() {
  const all = [];
  topics.forEach((t) => {
    t.vocabulary.forEach((v) => all.push(vocabToCard(v, "vocab")));
    t.idioms.forEach((i) => all.push(vocabToCard(i, "idiom")));
  });
  return all;
}

function buildAllGrammarDeck() {
  const all = [];
  grammarPoints.forEach((g) => {
    grammarToCards(g).forEach((c) => all.push(c));
  });
  return all;
}

function buildMixedDeck() {
  return [...buildAllVocabDeck(), ...buildAllGrammarDeck()];
}

/* ============================================================
   PRACTICE HUB
   ============================================================ */
function renderPracticeHub() {
  setAppBarTitle("연습");
  const app = document.getElementById("app");

  const totalVocab = topics.reduce((s, t) => s + (t.vocabulary?.length || 0), 0);
  const totalIdioms = topics.reduce((s, t) => s + (t.idioms?.length || 0), 0);
  const totalGrammar = grammarPoints.reduce((s, g) => s + grammarToCards(g).length, 0);

  app.innerHTML = `
    <h1>연습</h1>
    <p class="subtitle">플래시카드와 십자말풀이로 복습하세요.</p>

    <h2>전체 연습</h2>
    <div class="topic-list">
      <a href="#/practice/mixed" class="topic-card practice-card">
        <div class="practice-card__icon">🎯</div>
        <div>
          <h3>전체 섞기</h3>
          <p class="ko">어휘 + 문법 랜덤 ${SESSION_SIZE}문제</p>
        </div>
      </a>
      <a href="#/practice/all-vocab" class="topic-card practice-card">
        <div class="practice-card__icon">📖</div>
        <div>
          <h3>전체 어휘</h3>
          <p class="ko">${totalVocab + totalIdioms}개 중 ${SESSION_SIZE}개</p>
        </div>
      </a>
      <a href="#/practice/grammar" class="topic-card practice-card">
        <div class="practice-card__icon">📝</div>
        <div>
          <h3>전체 문법</h3>
          <p class="ko">${totalGrammar}개 카드 중 ${SESSION_SIZE}개</p>
        </div>
      </a>
      <a href="#/crossword" class="topic-card practice-card">
        <div class="practice-card__icon">🧩</div>
        <div>
          <h3>십자말풀이</h3>
          <p class="ko">문맥으로 단어 맞추기</p>
        </div>
      </a>
    </div>

    <h2>주제별 연습</h2>
    <div class="topic-list">
      ${topics.map((t) => {
        const count = (t.vocabulary?.length || 0) + (t.idioms?.length || 0);
        if (!count) return "";
        return `
          <a href="#/practice/${t.id}" class="topic-card">
            <div class="topic-card__badges">
              <span class="badge">${esc(t.category)}</span>
              <span class="badge ${levelClass(t.level)}">${esc(t.level)}</span>
            </div>
            <h3>${esc(t.title)}</h3>
            <p class="ko">${esc(t.titleKo)} · ${Math.min(count, SESSION_SIZE)}개 카드</p>
          </a>`;
      }).join("")}
    </div>

    <h2>문법별 연습</h2>
    <div class="topic-list">
      ${grammarPoints.map((g) => {
        const count = grammarToCards(g).length;
        if (!count) return "";
        return `
          <a href="#/practice/grammar/${g.id}" class="topic-card">
            <div class="topic-card__badges">
              <span class="badge ${levelClass(g.level)}">${esc(g.level)}</span>
              <span class="badge">${esc(g.category)}</span>
            </div>
            <h3>${esc(g.title)}</h3>
            <p class="ko">${esc(g.titleKo)} · ${count}개 카드</p>
          </a>`;
      }).join("")}
    </div>
  `;
}

/* ============================================================
   PRACTICE SESSION
   ============================================================ */
function startPractice(label, cards, showDirection) {
  if (!cards.length) {
    setAppBarTitle("연습");
    document.getElementById("app").innerHTML = `
      <div class="empty">
        <h2>연습할 카드가 없습니다</h2>
        <a href="#/practice" class="btn">연습으로 돌아가기</a>
      </div>`;
    return;
  }

  const sessionCards = sample(cards, SESSION_SIZE);

  state.practice = {
    deckLabel: label,
    cards: sessionCards,
    index: 0,
    direction: "ko-en",
    revealed: false,
    correct: 0,
    wrong: 0,
    answered: new Array(sessionCards.length).fill(null),
    finished: false,
    showDirection,
  };

  setAppBarTitle("연습 · " + label);
  renderSession();
}

function renderSession() {
  const app = document.getElementById("app");
  const s = state.practice;

  if (s.finished) { renderSessionComplete(); return; }

  const card = s.cards[s.index];
  const isKoEn = s.direction === "ko-en";

  let prompt, answer, example, hint;
  if (card.kind === "vocab") {
    prompt = isKoEn ? card.ko : card.en;
    answer = isKoEn ? card.en : card.ko;
    example = card.exEn || card.exKo
      ? `${card.exEn ? `<div class="ex-en">${esc(card.exEn)}</div>` : ""}${card.exKo ? `<div>${esc(card.exKo)}</div>` : ""}`
      : "";
    hint = card.type === "idiom" ? "관용 표현" : "어휘";
  } else {
    prompt = isKoEn ? card.prompt_ko : card.prompt_en;
    answer = isKoEn ? card.answer_en : card.answer_ko;
    example = "";
    hint = card.hint || "문법";
  }

  const showToggle = s.showDirection;

  app.innerHTML = `
    <div class="practice-header">
      ${showToggle ? `
        <div class="direction-toggle">
          <button data-dir="ko-en" class="${s.direction === "ko-en" ? "active" : ""}">한국어 → 영어</button>
          <button data-dir="en-ko" class="${s.direction === "en-ko" ? "active" : ""}">영어 → 한국어</button>
        </div>
      ` : ""}
    </div>

    <div class="flashcard">
      <div class="flashcard__hint">${esc(hint)}</div>
      <div class="flashcard__prompt">${esc(prompt)}</div>
      <div class="flashcard__answer ${s.revealed ? "" : "hidden"}">${esc(answer)}</div>
      <div class="flashcard__example ${s.revealed && example ? "" : "hidden"}">${example}</div>
      ${card.sourceLabel ? `<div class="flashcard__source">${esc(card.sourceLabel)}</div>` : ""}
    </div>

    <div class="answer-input-row">
      <input type="text" id="practiceInput" placeholder="답변을 입력하세요" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
      <div class="answer-input-row__buttons">
        <button class="btn" id="verifyBtn">${s.revealed ? "다음 →" : "확인"}</button>
        <button class="btn btn-outline" id="showBtn">정답 보기</button>
      </div>
    </div>

    <div class="feedback" id="practiceFeedback"></div>

    <div class="session-stats">
      <span class="stat-correct">✓ ${s.correct}</span>
      <span class="stat-wrong">✗ ${s.wrong}</span>
    </div>

    <div class="practice-nav">
      <button class="btn btn-outline" id="prevBtn">←</button>
      <span class="progress-text" id="progressText">${s.index + 1} / ${s.cards.length}</span>
      <button class="btn btn-outline" id="nextBtn">→</button>
    </div>
  `;

  document.querySelectorAll(".direction-toggle button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.practice.direction = btn.dataset.dir;
      state.practice.revealed = false;
      renderSession();
    });
  });

  document.getElementById("verifyBtn").addEventListener("click", verifyAnswer);
  document.getElementById("showBtn").addEventListener("click", showAnswer);
  document.getElementById("prevBtn").addEventListener("click", () => move(-1));
  document.getElementById("nextBtn").addEventListener("click", () => move(1));
  document.getElementById("practiceInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (state.practice.revealed) move(1);
      else verifyAnswer();
    }
  });

  if (window.innerWidth >= 640) {
    document.getElementById("practiceInput").focus();
  }
}

function verifyAnswer() {
  const s = state.practice;
  if (s.revealed) { move(1); return; }

  const input = document.getElementById("practiceInput").value.trim().toLowerCase();
  if (!input) {
    setFeedback("답변을 입력해 주세요.", "incorrect");
    return;
  }

  const card = s.cards[s.index];
  const isKoEn = s.direction === "ko-en";

  let target;
  if (card.kind === "vocab") {
    target = isKoEn ? card.en : card.ko;
  } else {
    target = isKoEn ? card.answer_en : card.answer_ko;
  }

  const variants = String(target).split("/").map((x) => x.trim().toLowerCase());
  const cleanVariants = variants.flatMap((v) => {
    const clean = v.replace(/\s*\(.*?\)\s*/g, "").trim();
    return [v, clean];
  });

  const isCorrect = cleanVariants.some(
    (v) => input === v || (v.length > 3 && input.includes(v))
  );

  if (isCorrect) {
    if (s.answered[s.index] === null) {
      s.answered[s.index] = "correct";
      s.correct++;
    }
    s.revealed = true;
    renderSession();
    setFeedback("✅ 정답입니다!", "correct");
  } else {
    if (s.answered[s.index] === null) {
      s.answered[s.index] = "wrong";
      s.wrong++;
    }
    setFeedback("❌ 틀렸습니다. 다시 시도하세요.", "incorrect");
    const statEl = document.querySelector(".session-stats");
    if (statEl) statEl.innerHTML = `<span class="stat-correct">✓ ${s.correct}</span><span class="stat-wrong">✗ ${s.wrong}</span>`;
    document.getElementById("practiceInput").value = "";
    document.getElementById("practiceInput").focus();
  }
}

function showAnswer() {
  const s = state.practice;
  if (s.answered[s.index] === null) {
    s.answered[s.index] = "wrong";
    s.wrong++;
  }
  s.revealed = true;
  renderSession();
  setFeedback("👀 정답을 확인하세요.", "incorrect");
}

function move(dir) {
  const s = state.practice;
  const next = s.index + dir;

  if (next < 0) return;

  if (next >= s.cards.length) {
    s.finished = true;
    renderSessionComplete();
    return;
  }

  s.index = next;
  s.revealed = false;
  renderSession();
}

function setFeedback(msg, cls) {
  const el = document.getElementById("practiceFeedback");
  if (!el) return;
  el.textContent = msg;
  el.className = "feedback " + cls;
}

function renderSessionComplete() {
  setAppBarTitle("연습 완료");
  const app = document.getElementById("app");
  const s = state.practice;
  const total = s.cards.length;
  const pct = total ? Math.round((s.correct / total) * 100) : 0;

  app.innerHTML = `
    <div class="session-complete">
      <h2>세션 완료! 🎉</h2>
      <p class="subtitle">${esc(s.deckLabel)}</p>
      <div class="score">${pct}%</div>
      <p class="score-detail">
        정답 <strong>${s.correct}</strong> · 오답 <strong>${s.wrong}</strong> · 총 ${total}문제
      </p>
      <a href="#/practice" class="btn">새 세션 시작</a>
    </div>
    <div style="text-align:center; margin-top:16px;">
      <button class="btn btn-outline" id="retryBtn" style="width:auto;">같은 문제 다시 풀기</button>
    </div>
  `;

  document.getElementById("retryBtn").addEventListener("click", () => {
    const { deckLabel, cards, showDirection } = state.practice;
    startPractice(deckLabel, cards, showDirection);
  });
}

/* ============================================================
   CROSSWORD ROUTE
   ============================================================ */
function renderCrosswordRoute(id) {
  const app = document.getElementById("app");
  setAppBarTitle("십자말풀이");

  const lang = window.CROSSWORD_LANG || "en";

  let items = [];
  let title = "";
  let backHref = "#/practice";

  if (id && id !== "all") {
    const topic = getTopic(id);
    if (!topic) {
      app.innerHTML = `<div class="empty"><h2>주제를 찾을 수 없습니다</h2><a href="#/practice" class="btn">연습으로</a></div>`;
      return;
    }
    items = [...topic.vocabulary, ...topic.idioms];
    title = topic.titleKo || topic.title;
    backHref = `#/topic/${topic.id}`;
  } else {
    topics.forEach((t) => {
      items.push(...t.vocabulary);
      items.push(...t.idioms);
    });
    title = "전체 주제";
    backHref = "#/practice";
  }

  if (typeof CrosswordPage === "undefined") {
    app.innerHTML = `<div class="empty"><h2>십자말풀이 엔진을 불러올 수 없습니다</h2><p>crossword.js가 로드되었는지 확인하세요.</p><a href="${backHref}" class="btn">돌아가기</a></div>`;
    return;
  }

  const entries = CrosswordPage.prepareEntries(items, lang);
  CrosswordPage.render(app, { entries, title, backHref, lang });
}

/* ============================================================
   BACK BUTTON + INIT
   ============================================================ */
document.getElementById("backBtn").addEventListener("click", () => {
  if (window.history.length > 1) window.history.back();
  else window.location.hash = "#/";
});

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
