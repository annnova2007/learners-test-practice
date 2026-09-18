# Learner's Test Practice

A self-contained, offline-friendly quiz application for practicing the learner's licence test. The app contains **877 questions**, including traffic-sign recognition questions with images, and provides both practice and mock-test modes.

## Overview

**Learner's Test Practice** is a browser-based quiz application designed to make learner's licence preparation simple and interactive.

It runs entirely on the client side using **HTML, CSS, and JavaScript**, with question data stored locally in `data.json`. No external JavaScript libraries or backend server are required.

### Key Highlights

* 877 learner's licence practice questions
* Traffic-sign questions with images
* Practice mode with customizable question counts
* Timed 30-question mock tests
* Instant answer feedback
* Automatic scoring and results
* Personal best tracking using browser local storage
* Answer review after each attempt
* Session-based PIN access
* No database or backend required

## Features

### Start Learning

Choose from:

* 10 questions
* 25 questions
* 50 questions
* All 877 questions

Questions are shuffled for each attempt.

### Take Mock Test

The mock test contains **30 random questions** with a **30-second timer per question**.

The interface displays:

* Countdown timer
* Live score
* Current question
* Answer options
* Automatic progression when time expires

The test ends immediately when the passing threshold of **18 correct answers** is reached.

### Instant Feedback

After selecting an answer, the application immediately indicates whether the selected answer is correct or incorrect.

### Results & Performance Tracking

The results screen displays:

* Time taken
* Correct answers
* Incorrect answers
* Unanswered questions
* Score percentage
* Personal best comparison

Attempts are stored in the browser's local storage, allowing previous performance to persist when using the same browser and device.

### Answer Review

After completing a quiz, users can review every question and compare:

* Their selected answer
* The correct answer

### Quit Anytime

Users can exit an active quiz at any time after confirming the action.

## Tech Stack

| Technology            | Purpose                                  |
| --------------------- | ---------------------------------------- |
| HTML5                 | Page structure                           |
| CSS3                  | Styling and responsive interface         |
| JavaScript            | Quiz logic and application functionality |
| JSON                  | Question data storage                    |
| Browser Local Storage | Attempt history and personal bests       |

No external JavaScript libraries or build tools are required.

## Project Structure

```text
learners-test-practice/
│
├── index.html
├── style.css
├── app.js
├── data.json
├── images/
│   └── traffic-signs and other question images
├── README.md
└── .gitignore
```

### File Description

* `index.html` — Application structure and screens
* `style.css` — Styling and responsive design
* `app.js` — Quiz logic, scoring, timers, storage and navigation
* `data.json` — 877 quiz questions and answer data
* `images/` — Traffic-sign icons and other images referenced by questions

## How to Run Locally

Because the application loads `data.json` using `fetch()`, it should be served through a local web server rather than opened directly using `file://`.

### Option 1 — Python

Open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

On systems where `python` is not recognized, try:

```bash
python3 -m http.server 8000
```

### Option 2 — Node.js

If Node.js is installed:

```bash
npx serve .
```

Open the local URL displayed in the terminal.

### Option 3 — VS Code

Install the **Live Server** extension, then:

1. Open the project in VS Code.
2. Right-click `index.html`.
3. Select **Open with Live Server**.

## Access Gate

The application includes a simple browser-side PIN screen before the quiz content is displayed.

This is intended only as a **casual access gate**, not as a security mechanism. Because the application runs entirely in the browser, the PIN and related logic can be inspected or bypassed by someone with access to the source code.

The PIN itself is intentionally not documented in this public repository.

## Question Data

The application currently contains **877 questions** extracted from a learner's licence study guide.

A small number of questions in the original source material contained inconsistencies, including missing or multiple marked answers. These cases were manually reviewed and resolved using standard learner's-licence and traffic-rule references.

Where applicable, inferred answers are marked internally as `answer_inferred`.

## Demo

A short demonstration video showing the application interface and quiz flow is included with this project.

**▶️ [Watch the project demo](#)**

> Replace the link above with the GitHub video attachment URL after uploading the demo video.

## Deployment

The application is a static client-side website and can be deployed using services such as:

* Netlify
* GitHub Pages
* Vercel
* Cloudflare Pages

No backend server is required for the core application.

## Future Improvements

Potential improvements include:

* More comprehensive question categorization
* Progress dashboards
* Topic-wise practice
* Improved accessibility
* Mobile UI refinements
* Additional traffic-sign explanations
* Cloud-based progress synchronization
* Expanded question bank

## Project Status

**Status:** Completed / Functional

The current version supports practice quizzes, timed mock tests, scoring, answer review, local performance tracking, and traffic-sign questions with images.

## Author

**Ann Nova**

GitHub: [@annnova2007](https://github.com/annnova2007)

## License

This project is intended for educational and practice purposes.

Please verify learner's licence rules and regulations against the latest official transport authority resources before relying on the information for an actual examination.

