/* ============================================================
   Pradeep Institute — Learner's Test Practice Quiz
   Vanilla JS, no build step. Runs entirely from a local folder.
   ============================================================ */

(function () {
  'use strict';

  const HISTORY_KEY = 'pradeep_quiz_history_v1';
  const MAX_HISTORY = 50;
  const MOCK_TOTAL = 30;
  const MOCK_PASS_THRESHOLD = 18;
  const MOCK_SECONDS_PER_Q = 30;
  const APP_PIN = '22032007';
  const PIN_SESSION_KEY = 'pradeep_quiz_unlocked_v1';

  // ---------- State ----------
  let ALL_QUESTIONS = [];
  let quiz = null; // active quiz state
  let timerInterval = null;
  let mockQTimerInterval = null;

  // ---------- Elements ----------
  const el = (id) => document.getElementById(id);
  const screens = {
    pin: el('screen-pin'),
    start: el('screen-start'),
    setup: el('screen-setup'),
    quiz: el('screen-quiz'),
    results: el('screen-results'),
    review: el('screen-review'),
  };

  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove('active'));
    screens[name].classList.add('active');
    window.scrollTo(0, 0);
  }

  // ---------- Load data ----------
  function loadData() {
    return fetch('data.json')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load data.json (' + r.status + ')');
        return r.json();
      })
      .then((data) => {
        ALL_QUESTIONS = data;
        renderBestScore();
      })
      .catch((err) => {
        document.querySelector('.start-wrap').innerHTML =
          '<h1>Could not load question data</h1>' +
          '<p class="tagline">Make sure you are running this via a local server (not opening index.html directly), ' +
          'and that data.json sits alongside index.html.</p>' +
          '<p class="tagline">Error: ' + err.message + '</p>';
      });
  }

  // ---------- Utilities ----------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return m + ':' + s;
  }

  // ---------- History (localStorage) ----------
  function getHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveAttempt(attempt) {
    const hist = getHistory();
    hist.unshift(attempt);
    if (hist.length > MAX_HISTORY) hist.length = MAX_HISTORY;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  }

  function bestAttemptFor(total) {
    const hist = getHistory().filter((h) => h.total === total);
    if (!hist.length) return null;
    return hist.reduce((best, h) => {
      if (!best) return h;
      if (h.pct > best.pct) return h;
      if (h.pct === best.pct && h.timeSeconds < best.timeSeconds) return h;
      return best;
    }, null);
  }

  function renderBestScore() {
    const hist = getHistory();
    const box = el('best-score-box');
    const content = el('best-score-content');
    if (!hist.length) {
      box.classList.add('hidden');
      return;
    }
    const best = hist.reduce((b, h) => {
      if (!b) return h;
      if (h.pct > b.pct) return h;
      if (h.pct === b.pct && h.timeSeconds < b.timeSeconds) return h;
      return b;
    }, null);
    content.textContent =
      best.pct + '% (' + best.correct + '/' + best.total + ') in ' +
      formatTime(best.timeSeconds) + ' — ' + best.dateLabel;
    box.classList.remove('hidden');
  }

  // ---------- Setup screen ----------
  let chosenLength = null;

  el('btn-start').addEventListener('click', () => {
    showScreen('setup');
  });

  el('btn-mock').addEventListener('click', () => {
    startMockTest();
  });

  el('btn-back-start').addEventListener('click', () => {
    showScreen('start');
  });

  document.querySelectorAll('#length-options .option-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#length-options .option-card').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      chosenLength = parseInt(btn.dataset.len, 10);
      el('btn-begin-quiz').disabled = false;
    });
  });

  el('btn-begin-quiz').addEventListener('click', () => {
    startQuiz(chosenLength);
  });

  // ---------- Quiz flow ----------
  function startQuiz(length) {
    const n = Math.min(length, ALL_QUESTIONS.length);
    const chosen = shuffle(ALL_QUESTIONS).slice(0, n);
    quiz = {
      mode: 'practice',
      questions: chosen,
      index: 0,
      total: n,
      correct: 0,
      wrong: 0,
      startTime: Date.now(),
      elapsedSeconds: 0,
      answers: [], // {question, selectedIndex, correctIndex, isCorrect}
      answeredCurrent: false,
    };
    el('qtotal-label').textContent = n;
    el('mock-countdown').classList.add('hidden');
    el('mock-score').classList.add('hidden');
    el('timer').classList.remove('hidden');
    startTimer();
    showScreen('quiz');
    renderQuestion();
  }

  function startMockTest() {
    const n = Math.min(MOCK_TOTAL, ALL_QUESTIONS.length);
    const chosen = shuffle(ALL_QUESTIONS).slice(0, n);
    quiz = {
      mode: 'mock',
      questions: chosen,
      index: 0,
      total: n,
      correct: 0,
      wrong: 0,
      unanswered: 0,
      startTime: Date.now(),
      elapsedSeconds: 0,
      answers: [],
      answeredCurrent: false,
      passed: false,
    };
    el('qtotal-label').textContent = n;
    el('mock-countdown').classList.remove('hidden');
    el('mock-score').classList.remove('hidden');
    el('timer').classList.add('hidden');
    el('mock-score-num').textContent = '0';
    startTimer(); // still track overall elapsed time for the results screen
    showScreen('quiz');
    renderQuestion();
  }

  function startTimer() {
    stopTimer();
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      quiz.elapsedSeconds = Math.floor((Date.now() - quiz.startTime) / 1000);
      updateTimerDisplay();
    }, 500);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    el('timer').textContent = formatTime(quiz.elapsedSeconds);
  }

  function renderQuestion() {
    const q = quiz.questions[quiz.index];
    quiz.answeredCurrent = false;

    el('qnum-label').textContent = quiz.index + 1;
    el('progress-fill').style.width = ((quiz.index) / quiz.total * 100) + '%';
    el('question-text').textContent = q.text;
    el('feedback-msg').textContent = '';
    el('feedback-msg').className = 'feedback-msg';
    el('btn-next').disabled = true;
    el('btn-next').textContent = (quiz.index === quiz.total - 1) ? 'Finish Test' : 'Next Question';

    // illustration
    const illWrap = el('illustration-wrap');
    if (q.illustration) {
      el('illustration-img').src = q.illustration;
      illWrap.classList.remove('hidden');
    } else {
      illWrap.classList.add('hidden');
    }

    const textBox = el('options-text');
    const imgBox = el('options-image');
    textBox.innerHTML = '';
    imgBox.innerHTML = '';

    if (q.type === 'image') {
      textBox.classList.add('hidden');
      imgBox.classList.remove('hidden');
      q.options.forEach((src, i) => {
        const b = document.createElement('button');
        b.className = 'opt-img-btn';
        b.innerHTML = '<img src="' + src + '" alt="Option ' + (i + 1) + '">';
        b.addEventListener('click', () => selectAnswer(i, b));
        imgBox.appendChild(b);
      });
    } else {
      imgBox.classList.add('hidden');
      textBox.classList.remove('hidden');
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      q.options.forEach((optText, i) => {
        const b = document.createElement('button');
        b.className = 'opt-btn';
        b.innerHTML = '<span class="opt-marker">' + letters[i] + '</span><span>' + escapeHtml(optText) + '</span>';
        b.addEventListener('click', () => selectAnswer(i, b));
        textBox.appendChild(b);
      });
    }

    if (quiz.mode === 'mock') {
      startMockQuestionTimer();
    }
  }

  function startMockQuestionTimer() {
    stopMockQuestionTimer();
    quiz.qTimeLeft = MOCK_SECONDS_PER_Q;
    updateMockCountdownDisplay();
    mockQTimerInterval = setInterval(() => {
      quiz.qTimeLeft--;
      updateMockCountdownDisplay();
      if (quiz.qTimeLeft <= 0) {
        stopMockQuestionTimer();
        handleQuestionTimeout();
      }
    }, 1000);
  }

  function stopMockQuestionTimer() {
    if (mockQTimerInterval) {
      clearInterval(mockQTimerInterval);
      mockQTimerInterval = null;
    }
  }

  function updateMockCountdownDisplay() {
    const cd = el('mock-countdown');
    cd.textContent = quiz.qTimeLeft;
    cd.classList.toggle('low', quiz.qTimeLeft <= 10);
  }

  function handleQuestionTimeout() {
    if (quiz.answeredCurrent) return;
    quiz.answeredCurrent = true;

    const q = quiz.questions[quiz.index];
    quiz.wrong++;
    quiz.unanswered++;

    const allBtns = document.querySelectorAll(
      q.type === 'image' ? '.opt-img-btn' : '.opt-btn'
    );
    allBtns.forEach((b, i) => {
      b.disabled = true;
      if (i === q.correct) b.classList.add('correct');
      else b.classList.add('dimmed');
    });

    const fb = el('feedback-msg');
    fb.textContent = '⏱ Time\'s up — correct answer highlighted';
    fb.classList.add('wrong');

    quiz.answers.push({
      id: q.id, text: q.text, type: q.type, options: q.options,
      illustration: q.illustration || null,
      selectedIndex: -1, correctIndex: q.correct,
      isCorrect: false, isTimeout: true,
    });

    // auto-advance shortly after showing the correct answer
    setTimeout(() => {
      quiz.index++;
      if (quiz.index >= quiz.total) {
        finishQuiz();
      } else {
        renderQuestion();
      }
    }, 1100);
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function selectAnswer(selectedIndex, btnEl) {
    if (quiz.answeredCurrent) return;
    quiz.answeredCurrent = true;
    if (quiz.mode === 'mock') stopMockQuestionTimer();

    const q = quiz.questions[quiz.index];
    const isCorrect = selectedIndex === q.correct;

    const allBtns = document.querySelectorAll(
      q.type === 'image' ? '.opt-img-btn' : '.opt-btn'
    );
    allBtns.forEach((b, i) => {
      b.disabled = true;
      if (i === q.correct) {
        b.classList.add('correct');
      } else if (i === selectedIndex) {
        b.classList.add('wrong');
      } else {
        b.classList.add('dimmed');
      }
    });

    const fb = el('feedback-msg');
    if (isCorrect) {
      quiz.correct++;
      fb.textContent = '✓ Correct';
      fb.classList.add('correct');
    } else {
      quiz.wrong++;
      fb.textContent = '✕ Wrong — correct answer highlighted';
      fb.classList.add('wrong');
    }

    quiz.answers.push({
      id: q.id,
      text: q.text,
      type: q.type,
      options: q.options,
      illustration: q.illustration || null,
      selectedIndex: selectedIndex,
      correctIndex: q.correct,
      isCorrect: isCorrect,
    });

    if (quiz.mode === 'mock') {
      el('mock-score-num').textContent = quiz.correct;
      if (quiz.correct >= MOCK_PASS_THRESHOLD) {
        quiz.passed = true;
        fb.textContent = isCorrect ? '✓ Correct — passing score reached!' : fb.textContent;
        el('btn-next').disabled = true;
        setTimeout(() => finishQuiz(), 900);
        return;
      }
    }

    el('btn-next').disabled = false;
  }

  el('btn-next').addEventListener('click', () => {
    if (!quiz.answeredCurrent) return; // must answer first
    quiz.index++;
    if (quiz.index >= quiz.total) {
      finishQuiz();
    } else {
      renderQuestion();
    }
  });

  // ---------- Quit ----------
  el('btn-quit').addEventListener('click', () => {
    el('modal-quit').classList.remove('hidden');
  });
  el('btn-quit-cancel').addEventListener('click', () => {
    el('modal-quit').classList.add('hidden');
  });
  el('btn-quit-confirm').addEventListener('click', () => {
    el('modal-quit').classList.add('hidden');
    stopTimer();
    stopMockQuestionTimer();
    quiz = null;
    showScreen('start');
    renderBestScore();
  });

  // ---------- Finish & Results ----------
  function finishQuiz() {
    stopTimer();
    stopMockQuestionTimer();
    quiz.elapsedSeconds = Math.floor((Date.now() - quiz.startTime) / 1000);
    el('progress-fill').style.width = '100%';

    const pct = Math.round((quiz.correct / quiz.total) * 100);
    const now = new Date();
    const dateLabel = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ' ' + now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    const priorBest = bestAttemptFor(quiz.total);

    const attempt = {
      date: now.toISOString(),
      dateLabel: dateLabel,
      total: quiz.total,
      correct: quiz.correct,
      wrong: quiz.wrong,
      pct: pct,
      timeSeconds: quiz.elapsedSeconds,
      mode: quiz.mode,
      passed: quiz.mode === 'mock' ? quiz.passed : undefined,
      answeredCount: quiz.answers.length,
    };
    saveAttempt(attempt);

    renderResults(attempt, priorBest);
    showScreen('results');
  }

  function renderResults(attempt, priorBest) {
    const badge = el('results-badge');
    const title = el('results-title');
    const passBanner = el('pass-banner');
    const passBannerSub = el('pass-banner-sub');

    if (attempt.mode === 'mock') {
      if (attempt.passed) {
        passBanner.classList.remove('hidden');
        badge.classList.add('hidden');
        title.textContent = '';
        passBannerSub.textContent = 'Reached ' + MOCK_PASS_THRESHOLD + ' correct answers after ' +
          attempt.answeredCount + ' of ' + attempt.total + ' questions — test stopped automatically';
      } else {
        passBanner.classList.add('hidden');
        badge.classList.remove('hidden');
        badge.textContent = '📘';
        title.textContent = 'Not Passed — ' + attempt.correct + '/' + MOCK_PASS_THRESHOLD + ' needed';
      }
    } else {
      passBanner.classList.add('hidden');
      badge.classList.remove('hidden');
      if (attempt.pct >= 90) { badge.textContent = '🏆'; title.textContent = 'Excellent Work'; }
      else if (attempt.pct >= 70) { badge.textContent = '✅'; title.textContent = 'Good Job'; }
      else if (attempt.pct >= 50) { badge.textContent = '📘'; title.textContent = 'Keep Practising'; }
      else { badge.textContent = '🔁'; title.textContent = 'Test Complete'; }
    }

    el('stat-correct').textContent = attempt.correct;
    el('stat-wrong').textContent = attempt.wrong;
    el('stat-pct').textContent = attempt.pct + '%';
    el('stat-time').textContent = formatTime(attempt.timeSeconds);

    const cmpBox = el('compare-box');
    if (priorBest) {
      const pctDiff = attempt.pct - priorBest.pct;
      const timeDiff = attempt.timeSeconds - priorBest.timeSeconds;
      let pctLine, timeLine;
      if (pctDiff > 0) pctLine = '<span class="cmp-up">▲ ' + pctDiff + '% better than your previous best (' + priorBest.pct + '%)</span>';
      else if (pctDiff < 0) pctLine = '<span class="cmp-down">▼ ' + Math.abs(pctDiff) + '% below your previous best (' + priorBest.pct + '%)</span>';
      else pctLine = 'Matched your previous best score (' + priorBest.pct + '%)';

      if (timeDiff < 0) timeLine = '<span class="cmp-up">' + formatTime(Math.abs(timeDiff)) + ' faster than last time</span>';
      else if (timeDiff > 0) timeLine = '<span class="cmp-down">' + formatTime(timeDiff) + ' slower than last time</span>';
      else timeLine = 'Same time as last attempt';

      cmpBox.innerHTML = '<div>' + pctLine + '</div><div style="margin-top:6px">' + timeLine + '</div>';
      cmpBox.classList.remove('hidden');
    } else {
      cmpBox.classList.add('hidden');
    }

    renderHistoryList();
  }

  function renderHistoryList() {
    const hist = getHistory();
    const list = el('history-list');
    list.innerHTML = '';
    if (!hist.length) {
      list.innerHTML = '<div class="history-empty">No previous attempts yet.</div>';
      return;
    }
    hist.slice(0, 15).forEach((h) => {
      const row = document.createElement('div');
      row.className = 'history-row';
      const modeTag = h.mode === 'mock'
        ? ('<span style="color:' + (h.passed ? 'var(--safety-green)' : 'var(--caution-red)') + '">' + (h.passed ? 'MOCK ✓' : 'MOCK ✕') + '</span>')
        : '<span style="color:var(--ink-soft)">PRACTICE</span>';
      row.innerHTML =
        '<span>' + h.dateLabel + '</span>' +
        modeTag +
        '<span>' + h.correct + '/' + h.total + '</span>' +
        '<span>' + formatTime(h.timeSeconds) + '</span>' +
        '<span class="h-pct">' + h.pct + '%</span>';
      list.appendChild(row);
    });
  }

  el('btn-clear-history').addEventListener('click', () => {
    if (confirm('Clear all saved attempt history? This cannot be undone.')) {
      clearHistory();
      renderHistoryList();
      renderBestScore();
    }
  });

  el('btn-retry').addEventListener('click', () => {
    showScreen('start');
    renderBestScore();
  });

  // ---------- Review ----------
  el('btn-review').addEventListener('click', () => {
    renderReview();
    showScreen('review');
  });
  el('btn-review-back').addEventListener('click', () => {
    showScreen('results');
  });

  function renderReview() {
    const list = el('review-list');
    list.innerHTML = '';
    quiz.answers.forEach((a, idx) => {
      const item = document.createElement('div');
      item.className = 'review-item ' + (a.isCorrect ? 'item-correct' : 'item-wrong');

      let optsHtml = '';
      if (a.type === 'image') {
        const correctImg = a.options[a.correctIndex];
        optsHtml += '<div class="review-answer-row"><span class="tag tag-correct">Correct</span></div>' +
          '<img class="review-img" src="' + correctImg + '">';
        if (!a.isCorrect) {
          const label = a.isTimeout ? 'Time\'s up' : 'Your answer';
          optsHtml += '<div class="review-answer-row" style="margin-top:8px"><span class="tag tag-wrong">' + label + '</span></div>';
          if (!a.isTimeout) {
            const selectedImg = a.options[a.selectedIndex];
            optsHtml += '<img class="review-img" src="' + selectedImg + '">';
          }
        }
      } else {
        optsHtml += '<div class="review-answer-row"><span class="tag tag-correct">Correct</span>' +
          '<span>' + escapeHtml(a.options[a.correctIndex]) + '</span></div>';
        if (!a.isCorrect) {
          const label = a.isTimeout ? 'Time\'s up' : 'Your answer';
          const text = a.isTimeout ? '(no answer selected)' : escapeHtml(a.options[a.selectedIndex]);
          optsHtml += '<div class="review-answer-row"><span class="tag tag-wrong">' + label + '</span>' +
            '<span>' + text + '</span></div>';
        }
      }

      let illHtml = '';
      if (a.illustration) {
        illHtml = '<img class="review-img" style="margin-bottom:8px" src="' + a.illustration + '">';
      }

      item.innerHTML =
        '<div class="review-qtext">Q' + (idx + 1) + '. ' + escapeHtml(a.text) + '</div>' +
        illHtml + optsHtml;
      list.appendChild(item);
    });
  }

  // ---------- PIN Lock ----------
  let pinBuffer = '';

  function renderPinDots() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((d, i) => {
      d.classList.toggle('filled', i < pinBuffer.length);
    });
  }

  function pinPress(digit) {
    if (pinBuffer.length >= APP_PIN.length) return;
    pinBuffer += digit;
    renderPinDots();
    if (pinBuffer.length === APP_PIN.length) {
      checkPin();
    }
  }

  function pinDelete() {
    pinBuffer = pinBuffer.slice(0, -1);
    renderPinDots();
    el('pin-error').classList.add('hidden');
  }

  function checkPin() {
    if (pinBuffer === APP_PIN) {
      try { sessionStorage.setItem(PIN_SESSION_KEY, '1'); } catch (e) {}
      unlockApp();
    } else {
      el('pin-error').classList.remove('hidden');
      const dotsWrap = el('pin-dots');
      dotsWrap.classList.add('shake');
      setTimeout(() => {
        dotsWrap.classList.remove('shake');
        pinBuffer = '';
        renderPinDots();
      }, 400);
    }
  }

  document.querySelectorAll('.pin-key[data-k]').forEach((btn) => {
    btn.addEventListener('click', () => pinPress(btn.dataset.k));
  });
  el('pin-del').addEventListener('click', pinDelete);

  // allow physical keyboard entry too
  const pinInput = el('pin-input');
  document.addEventListener('keydown', (e) => {
    if (!screens.pin.classList.contains('active')) return;
    if (/^[0-9]$/.test(e.key)) pinPress(e.key);
    else if (e.key === 'Backspace') pinDelete();
  });
  screens.pin.addEventListener('click', () => pinInput.focus());

  function unlockApp() {
    showScreen('start');
    loadData();
  }

  function isUnlocked() {
    try { return sessionStorage.getItem(PIN_SESSION_KEY) === '1'; } catch (e) { return false; }
  }

  // ---------- Init ----------
  if (isUnlocked()) {
    unlockApp();
  } else {
    showScreen('pin');
  }
})();
