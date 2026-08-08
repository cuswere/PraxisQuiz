(function () {
  "use strict";

  const content = window.PraxisQuizContent;

  function scoreAnswers(answers, quizContent = content) {
    const scores = Object.fromEntries(
      quizContent.pathOrder.map((pathId) => [pathId, 0]),
    );

    quizContent.questions.forEach((question) => {
      const selectedPath = answers[question.id];
      if (selectedPath && Object.hasOwn(scores, selectedPath)) {
        scores[selectedPath] += question.weight;
      }
    });

    return scores;
  }

  function determinePath(answers, quizContent = content) {
    const scores = scoreAnswers(answers, quizContent);
    const highestScore = Math.max(...Object.values(scores));
    const tiedPaths = quizContent.pathOrder.filter(
      (pathId) => scores[pathId] === highestScore,
    );

    if (tiedPaths.length === 1) {
      return tiedPaths[0];
    }

    for (const questionId of quizContent.tieBreakQuestionIds) {
      const selectedPath = answers[questionId];
      if (tiedPaths.includes(selectedPath)) {
        return selectedPath;
      }
    }

    return tiedPaths[0];
  }

  // Exposed for small dependency-free verification scripts.
  window.PraxisQuizScoring = { scoreAnswers, determinePath };

  const state = {
    view: "intro",
    questionIndex: 0,
    answers: {},
  };

  let app;
  let announcer;

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  function announce(message) {
    announcer.textContent = "";
    window.requestAnimationFrame(() => {
      announcer.textContent = message;
    });
  }

  function focusPrimaryHeading() {
    window.requestAnimationFrame(() => {
      const heading = app.querySelector("[data-focus-heading]");
      heading?.focus({ preventScroll: true });
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion || window.scrollY === 0) {
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      // Mirrors --motion-standard: 4 frames on the 24fps grid, linear so every
      // frame covers the same whole-pixel distance, and the first painted frame
      // already moves (the jump-start equivalent).
      const startY = window.scrollY;
      const frameInterval = 1000 / 24;
      const duration = frameInterval * 4;
      const startTime = performance.now();
      let lastPaint = -frameInterval;

      function scrollFrame(now) {
        const elapsed = Math.min(now - startTime, duration);

        if (now - lastPaint >= frameInterval || elapsed === duration) {
          const progress = Math.min((elapsed + frameInterval) / duration, 1);
          window.scrollTo(0, Math.round(startY * (1 - progress)));
          lastPaint = now;
        }

        if (elapsed < duration) {
          window.requestAnimationFrame(scrollFrame);
        }
      }

      window.requestAnimationFrame(scrollFrame);
    });
  }

  function renderIntro() {
    const { intro, questions } = content;
    app.innerHTML = `
      <div class="intro-layout view-enter">
        <section class="intro-copy">
          <p class="eyebrow">${escapeHtml(intro.eyebrow)}</p>
          <h1 data-focus-heading tabindex="-1">${escapeHtml(intro.title)}</h1>
          <p class="lede">${escapeHtml(intro.description)}</p>
          <div class="intro-actions">
            <button class="button button-primary" type="button" data-action="start">
              Find my path
              <span aria-hidden="true">→</span>
            </button>
            <span class="duration">${questions.length} questions · about 4 minutes</span>
          </div>
        </section>

        <aside class="path-preview" aria-label="Four possible career paths">
          <p class="preview-label">Four career paths</p>
          <ol>
            ${content.pathOrder
              .map((pathId, index) => {
                const path = content.paths[pathId];
                return `
                  <li class="preview-path preview-${escapeHtml(path.accent)}">
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <strong>${escapeHtml(path.shortTitle)}</strong>
                  </li>
                `;
              })
              .join("")}
          </ol>
        </aside>
      </div>
    `;
  }

  function renderQuestion() {
    const question = content.questions[state.questionIndex];
    const selectedPath = state.answers[question.id] || "";
    const number = state.questionIndex + 1;
    const progress = (number / content.questions.length) * 100;

    app.innerHTML = `
      <div class="question-view view-enter">
        <div class="progress-region" aria-label="Quiz progress">
          <div class="progress-copy">
            <span>Question ${number} of ${content.questions.length}</span>
            <span>${Math.round(progress)}% complete</span>
          </div>
          <div
            class="progress-track"
            style="--progress-steps: ${content.questions.length}"
            role="progressbar"
            aria-valuemin="1"
            aria-valuemax="${content.questions.length}"
            aria-valuenow="${number}"
            aria-label="Question ${number} of ${content.questions.length}"
          >
            <span style="width: ${progress}%"></span>
          </div>
        </div>

        <form class="question-card" data-question-form>
          <fieldset>
            <legend data-focus-heading tabindex="-1" class="question-title">
              ${escapeHtml(question.prompt)}
            </legend>
            <div class="answer-grid">
              ${question.answers
                .map(
                  (answer, index) => `
                    <label class="answer-option">
                      <input
                        type="radio"
                        name="answer"
                        value="${escapeHtml(answer.path)}"
                        ${selectedPath === answer.path ? "checked" : ""}
                      />
                      <span class="option-content">
                        <span class="option-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
                        <span>${escapeHtml(answer.label)}</span>
                      </span>
                    </label>
                  `,
                )
                .join("")}
            </div>
          </fieldset>

          <div class="question-actions">
            <button class="button button-quiet" type="button" data-action="back">
              <span aria-hidden="true">←</span>
              ${state.questionIndex === 0 ? "Introduction" : "Back"}
            </button>
            <button
              class="button button-primary"
              type="submit"
              ${selectedPath ? "" : "disabled"}
            >
              ${state.questionIndex === content.questions.length - 1 ? "See my path" : "Continue"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  function renderVideo(path) {
    if (path.videoEmbedUrl) {
      return `
        <div class="video-frame">
          <iframe
            src="${escapeHtml(path.videoEmbedUrl)}"
            title="An introduction to the ${escapeHtml(path.title)} path"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }

    return `
      <div class="video-placeholder" role="img" aria-label="Video introduction coming soon">
        <span class="play-mark" aria-hidden="true"></span>
        <div>
          <strong>Your path, explained</strong>
          <span>Video introduction coming soon</span>
        </div>
      </div>
    `;
  }

  function renderResult() {
    const resultId = determinePath(state.answers);
    const path = content.paths[resultId];
    const firstCourse = path.courses[0];

    app.innerHTML = `
      <article class="result-view result-${escapeHtml(path.accent)} view-enter">
        <header class="result-hero">
          <div class="result-kicker">
            <span class="result-symbol" aria-hidden="true"></span>
            <p>Your recommended career path</p>
          </div>
          <h1 data-focus-heading tabindex="-1">${escapeHtml(path.title)}</h1>
          <p class="result-description">${escapeHtml(path.description)}</p>
        </header>

        <div class="result-story-grid">
          ${renderVideo(path)}
          <section class="fit-card" aria-labelledby="why-heading">
            <p class="section-number">01 / Your direction</p>
            <h2 id="why-heading">Why this path fits your answers</h2>
            <p>${escapeHtml(path.why)}</p>
            <ul>
              ${path.takeaways
                .map((takeaway) => `<li>${escapeHtml(takeaway)}</li>`)
                .join("")}
            </ul>
          </section>
        </div>

        <section class="roadmap-section" aria-labelledby="roadmap-heading">
          <div class="section-heading-row">
            <div>
              <p class="section-number">02 / Your Praxis roadmap</p>
              <h2 id="roadmap-heading">Take these courses in order</h2>
            </div>
          </div>

          <ol class="course-roadmap" style="--course-count: ${path.courses.length}">
            ${path.courses
              .map(
                (item, index) => `
                  <li>
                    <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                      <span class="course-number">${String(index + 1).padStart(2, "0")}</span>
                      <span class="course-title">${escapeHtml(item.title)}</span>
                      <span class="course-link-label">Open course <span aria-hidden="true">↗</span></span>
                    </a>
                  </li>
                `,
              )
              .join("")}
          </ol>

          <div class="result-actions">
            <a class="button button-primary" href="${escapeHtml(firstCourse.url)}" target="_blank" rel="noopener noreferrer">
              Start with course 1
              <span aria-hidden="true">↗</span>
            </a>
            <a class="membership-link" href="${escapeHtml(content.membershipUrl)}" target="_blank" rel="noopener noreferrer">
              Not yet a member? Explore Praxis Membership
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <footer class="result-footer">
          <button class="button button-quiet" type="button" data-action="restart">
            <span aria-hidden="true">↺</span>
            Retake the quiz
          </button>
        </footer>
      </article>
    `;

    announce(`Your recommended path is ${path.title}.`);
  }

  // Fills the two mobile-only brandbar slots. Both are hidden above 700px, but
  // they're kept in sync regardless so a resize never shows stale content.
  function updateBrandbar() {
    const progress = document.querySelector("[data-brandbar-progress]");
    if (progress) {
      // One cell per question, filled up to the current one. Decorative: the
      // question view's own progressbar stays the accessible source of truth.
      progress.innerHTML =
        state.view === "question"
          ? content.questions
              .map((_, index) => `<i${index <= state.questionIndex ? ' class="is-done"' : ""}></i>`)
              .join("")
          : "";
    }

    const pathSlot = document.querySelector("[data-brandbar-path]");
    if (pathSlot) {
      pathSlot.textContent =
        state.view === "result" ? content.paths[determinePath(state.answers)].shortTitle : "";
    }
  }

  function render({ focus = false } = {}) {
    document.body.dataset.view = state.view;
    updateBrandbar();

    if (state.view === "intro") {
      renderIntro();
    } else if (state.view === "question") {
      renderQuestion();
    } else {
      renderResult();
    }

    if (focus) {
      focusPrimaryHeading();
    }
  }

  function startQuiz() {
    state.view = "question";
    state.questionIndex = 0;
    announce(`Question 1 of ${content.questions.length}.`);
    render({ focus: true });
  }

  function goBack() {
    if (state.questionIndex === 0) {
      state.view = "intro";
    } else {
      state.questionIndex -= 1;
    }
    render({ focus: true });
  }

  function restartQuiz() {
    state.view = "intro";
    state.questionIndex = 0;
    state.answers = {};
    announce("Quiz restarted. Your previous answers have been cleared.");
    render({ focus: true });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const question = content.questions[state.questionIndex];
    if (!state.answers[question.id]) return;

    if (state.questionIndex < content.questions.length - 1) {
      state.questionIndex += 1;
      announce(`Question ${state.questionIndex + 1} of ${content.questions.length}.`);
      render({ focus: true });
    } else {
      state.view = "result";
      render({ focus: true });
    }
  }

  function handleChange(event) {
    if (!event.target.matches('input[name="answer"]')) return;
    const question = content.questions[state.questionIndex];
    state.answers[question.id] = event.target.value;
    const submitButton = app.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = false;
  }

  function handleClick(event) {
    const control = event.target.closest("[data-action]");
    if (!control) return;

    const action = control.dataset.action;
    if (action === "start") startQuiz();
    if (action === "back") goBack();
    if (action === "restart") restartQuiz();
  }

  function init() {
    app = document.getElementById("app");
    announcer = document.getElementById("announcer");
    if (!app || !announcer || !content) return;

    app.addEventListener("click", handleClick);
    app.addEventListener("change", handleChange);
    app.addEventListener("submit", handleSubmit);
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
