const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const htmlText = (text) => text.replaceAll('&', '&amp;');

function loadQuiz(hash = '') {
  const handlers = {};
  const app = {
    innerHTML: '',
    addEventListener: (name, handler) => { handlers[name] = handler; },
    querySelector: () => null,
  };
  const location = new URL(`https://strategy.thepraxiscenter.com/?utm_source=ig&utm_medium=social${hash}`);
  const window = {
    location,
    history: { replaceState: (_, __, url) => { window.location = new URL(url); } },
    requestAnimationFrame: (callback) => callback(),
    matchMedia: () => ({ matches: true }),
    scrollTo: () => {},
  };
  const document = {
    readyState: 'complete',
    body: { dataset: {} },
    getElementById: (id) => id === 'app' ? app : { textContent: '' },
    querySelector: () => null,
  };
  const context = vm.createContext({ window, document, URL, URLSearchParams });
  for (const file of ['content.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
  }
  return {
    app, window,
    view: () => document.body.dataset.view,
    click(action) {
      handlers.click({ target: { closest: () => ({ dataset: { action } }) } });
    },
    answer(value) {
      handlers.change({ target: { matches: () => true, value } });
    },
    submit(signup = false) {
      let prevented = false;
      handlers.submit({
        target: { matches: (selector) => selector === (signup ? '[data-signup-form]' : '[data-question-form]') },
        preventDefault: () => { prevented = true; },
      });
      return prevented;
    },
    complete(result) {
      this.click('start');
      for (const question of window.PraxisQuizContent.questions) {
        this.answer(result);
        this.submit();
      }
    },
  };
}

for (const result of ['gallery', 'collector', 'funded', 'independent']) {
  test(`${result}: signup precedes result, and AWeber returns to the same path`, () => {
    const quiz = loadQuiz();
    quiz.complete(result);
    assert.equal(quiz.view(), 'signup');
    assert.match(quiz.app.innerHTML, /action="https:\/\/www.aweber.com\/scripts\/addlead.pl"/);
    for (const [name, value] of Object.entries({
      meta_web_form_id: '438465428', listname: 'awlist4417398',
      meta_adtracking: 'Praxis_Quiz', meta_required: 'name,email', meta_message: '1',
    })) {
      assert.ok(quiz.app.innerHTML.includes(`name="${name}" value="${value}"`));
    }
    assert.match(quiz.app.innerHTML, /name="email"[^>]*required/);
    assert.match(quiz.app.innerHTML, /name="name"[^>]*required/);
    for (const field of ['redirect', 'meta_redirect_onlist']) {
      const encoded = quiz.app.innerHTML.match(new RegExp(`name="${field}" value="([^"]+)"`))[1];
      const redirect = new URL(encoded.replaceAll('&amp;', '&'));
      assert.equal(redirect.searchParams.get('utm_source'), 'ig');
      assert.equal(redirect.searchParams.get('utm_medium'), 'social');
      assert.equal(redirect.hash, `#quiz-result=${result}`);
      assert.equal(redirect.origin, 'https://strategy.thepraxiscenter.com');
      assert.equal(loadQuiz(redirect.hash).view(), 'result');
      assert.ok(loadQuiz(redirect.hash).app.innerHTML.includes(htmlText(quiz.window.PraxisQuizContent.paths[result].title)));
    }
    // Native submission must reach AWeber, rather than being swallowed by
    // the question form handler or pretending that signup succeeded.
    assert.equal(quiz.submit(true), false);
    assert.equal(quiz.view(), 'signup');
    quiz.click('skip-signup');
    assert.equal(quiz.view(), 'result');
    assert.ok(quiz.app.innerHTML.includes(htmlText(quiz.window.PraxisQuizContent.paths[result].title)));
  });
}

test('back retains the final answer and allows the result to be revised', () => {
  const quiz = loadQuiz();
  quiz.complete('gallery');
  quiz.click('signup-back');
  assert.equal(quiz.view(), 'question');
  assert.match(quiz.app.innerHTML, /value="gallery"\s+checked/);
  quiz.submit();
  assert.equal(quiz.view(), 'signup');
});

test('unanswered questions cannot advance', () => {
  const quiz = loadQuiz();
  quiz.click('start');
  quiz.submit();
  assert.match(quiz.app.innerHTML, /Question 1 of/);
});

test('invalid result URLs are ignored', () => {
  assert.equal(loadQuiz('#quiz-result=unknown').view(), 'intro');
  assert.equal(loadQuiz('#quiz-result=__proto__').view(), 'intro');
});

test('retaking after an AWeber return clears the old result and retains campaign parameters', () => {
  const quiz = loadQuiz('#quiz-result=gallery');
  quiz.click('restart');
  assert.equal(quiz.view(), 'intro');
  assert.equal(quiz.window.location.hash, '');
  assert.equal(quiz.window.location.searchParams.get('utm_source'), 'ig');
  quiz.complete('independent');
  quiz.click('skip-signup');
  assert.ok(quiz.app.innerHTML.includes(quiz.window.PraxisQuizContent.paths.independent.title));
});
