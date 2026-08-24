# Learner's Test Practice — Local Quiz App

A self-contained, offline quiz app for practicing the learner's licence test
(877 questions, including traffic-sign recognition questions with images).

## How to run it

This app loads `data.json` via `fetch()`, so it must be served by a local
web server — opening `index.html` directly by double-clicking it will not
work (browsers block `fetch` on `file://` pages).

**Easiest option — Python (most computers already have this):**

1. Open a terminal / command prompt in this folder.
2. Run:
   ```
   python3 -m http.server 8000
   ```
   (On Windows, if `python3` isn't recognized, try `python`.)
3. Open your browser to: **http://localhost:8000**

**Alternative — Node.js:**
```
npx serve .
```
then open the URL it prints.

**Alternative — VS Code:**
Install the "Live Server" extension, right-click `index.html`, choose
"Open with Live Server".

## What's inside

- `index.html` — page structure (start screen, setup, quiz, results, review)
- `style.css` — all styling
- `app.js` — all app logic (no external JS libraries, no build step)
- `data.json` — the 877 parsed questions
- `images/` — traffic-sign icons and illustration images referenced by the questions

## Features

- **Start Learning** — pick 10 / 25 / 50 / all 877 questions, shuffled each time
- **Take Mock Test** — 30 random questions, 30 seconds each. A countdown
  shows on the left of the quiz header and your live score on the right.
  If time runs out on a question it's marked as unanswered and the quiz
  auto-advances. The test stops immediately and shows **PASSED** the
  moment you reach 18 correct answers.
- Tap an answer to see it turn green (correct) or red (wrong) instantly.
- Results screen shows time taken, correct/wrong counts, score %, and
  compares your attempt against your personal best for that quiz length.
- Every attempt (practice or mock) is saved to your browser's local
  storage, so history and best-score comparisons persist across visits —
  as long as you use the same browser on the same computer.
- "Quit" is available at any time during a quiz, with a confirmation prompt.
- "Review Answers" after a quiz lets you see every question with your
  answer vs. the correct one.

## Security PIN

The app now opens to a PIN entry screen before showing any content.
The PIN is **22032007**. It's checked entirely in the browser (this is a
simple access gate for casual privacy, not bank-grade security — anyone
who opens `app.js` in a text editor could read the PIN, and a determined
visitor could bypass it via browser dev tools). It's enough to stop
random visitors or search engines from casually browsing the quiz, but
don't use it to protect anything sensitive.

You'll be asked for the PIN once per browser tab/session — closing and
reopening the browser will ask again.

## Putting it on the internet (so anyone with a link can open it)

Right now this only runs on your own laptop at `localhost`, which no one
else can reach. To get a real shareable link, you need to upload these
files to a static file host. All of the options below are free and take
a few minutes. Pick whichever feels easiest:

### Option A — Netlify Drop (fastest, no account strictly required)
1. Go to **https://app.netlify.com/drop** in your browser.
2. Drag the whole `quizapp` folder (the one containing `index.html`)
   straight onto that page.
3. It uploads and gives you a live link like
   `https://random-name-12345.netlify.app` within a few seconds.
4. That link works for anyone, anywhere — share it as-is.
   (Sign up for a free account if you want to keep the link permanently
   and be able to update it later; without an account it may expire.)

### Option B — GitHub Pages (free, permanent, best if you're comfortable with GitHub)
1. Create a free account at **https://github.com** if you don't have one.
2. Create a new repository (e.g. `learners-test-quiz`), set it to Public.
3. Upload all the files inside `quizapp` (index.html, app.js, style.css,
   data.json, images/, README.md) to that repository — GitHub's web
   interface lets you drag-and-drop files in, no command line needed.
4. Go to the repository's **Settings → Pages**, set the source branch to
   `main` and folder to `/ (root)`, then save.
5. After a minute or two, GitHub gives you a link like
   `https://yourusername.github.io/learners-test-quiz/` — share that.

### Option C — Vercel or Cloudflare Pages
Similar drag-and-drop or GitHub-connected deployment flows to Netlify.
Any of these three work equally well for a static site like this one.

All three options are free for a small site like this (a few MB total).

## Notes on the question data

The questions were extracted from a PDF study guide. A handful (well
under 1% of 877) had minor inconsistencies in the source document — a
couple of questions had no marked correct answer at all, and one had two
answers marked correct. These were manually resolved using standard
driving-rule knowledge; they're flagged internally as `answer_inferred`
in the extraction script if you ever want to double check them yourself.
