# Atelier Noor: The Books

The accounts edition of Atelier Noor. A browser game that teaches ACC40630 (Accounting Information for Managers) with the same fashion house, cast and engine as the finance game in `../../Finance/atelier-noor/`.

The two games are separate. Each has its own save (`atelier-noor-accounts/save/v1` here), and neither story depends on the other, so they can be played side by side or one after the other.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # solver, content and engine tests
npm run build    # static site in dist/
```

## What's in it

| Ch | Title | Topic | Source used |
|---|---|---|---|
| I | Who reads the books | 1 Intro (refresher) | Topic 1 slides |
| II | What we own, what we owe | 2 Balance sheet (refresher) | Topic 2 slides, worked examples |
| III | Theo's record year | 3 Income statement (refresher) | Topic 3 slides, Examples 3.2/3.4/3.6/3.8, Bull and Bear |
| IV | Profitable, but where's the cash? | 4 Cash flow, **built from first principles** | Topic 4 slides, class example, Frozen Ltd and its worked solution |
| V | Aoife wants ratios | 5 Financial analysis, liquidity management | Topic 5 slides, Apex, Week 5 question bank answers, past paper Q2 |
| VI | How many scarves? | 6 CVP | Topic 6 slides, Cottage Industries, past paper Q1 |
| VII | The Christmas crunch | 7 Budgeting | Topic 7 slides: planning cycle, benefits, setting process, types, the slides' six-month cash budget, behaviour, criticisms, ZBB/ABB/beyond budgeting |
| VIII | Silk cost more | 8 Variance analysis | Variance slides, the Beltra class question, Week 10 bank (all nine variances, the profit bridge, working backwards, idle time), past paper Q3A |
| IX | More than money | 11 Non-financial info | **No slides yet**: past paper Q3C; one extra written question for the choose-one Q4 |
| X | The sustainability report | 12 Sustainability | Placeholder: needs the slides and the Quattrone (2021) reading |

Chapters I–III are marked as refreshers. Every chapter is open from the start; episodes inside a chapter unlock in order. The map's "Start here" button points at Chapter IV.

Chapter IV starts from what usually goes wrong: treating profit or total assets as cash. It runs profit v. cash → the jar rule (start + in − out = end) → what counts as cash and cash equivalents → the three buckets → interest, tax and dividends → the indirect method and working capital signs → every working (depreciation, additions, disposals, tax, dividends) → the full statement. The boss uses the Frozen Ltd numbers exactly.

## Layout

- `src/engine/accounting.ts`: every calculation. All numbers shown in the game come from here.
- `src/engine/grading.ts`: step marking (2 points a move, tips halve it, error carried forward), plus marking for the statement builder and the budget grid.
- `src/engine/types.ts`: the content contract. Round types:
  - `calc`: up to five moves. The first ("spot it") is optional, and move names change per problem (`stepNames`).
  - `statement`: the statement builder. Place each line, optionally add or deduct it, then subtotals, bottom line and the call.
  - `grid`: the month-by-month budget.
  - `classify`, `brief` and `table` work as in the finance game.
- `src/content/act-N-{concepts,problems}.ts`, `acts.ts`: the chapters.
- `src/content/methods.ts`: the key ratios sheet word for word (the **ƒ Formulas** button), the methods and the cast. Niamh Deasy, the auditor, is new.
- `tests/accounting.test.ts`: solvers against the course's worked answers (class cash flow example, Frozen W1–W13, Apex 1–4, LM1–LM12, Overload, Cottage Industries, Knotted, Onesale, Example 3.8).
- `tests/variance.test.ts` and `tests/bank.test.ts`: the class question, Big Change, Tricky, the transactions question and the cash budget question reproduced from their worked answers; the profit bridge lands on actual profit for 300 random sets; the balance sheet balances for 300 random businesses.
- `tests/papers.test.ts`: every mock paper builds and adds to 25 a question; the cash flow clinic's statement reconciles to its target; written-answer caps; glossary and everyday coverage; the drill picker.
- `tests/render.test.tsx`: every problem mounts at every level of help; a perfect script under exam conditions earns full marks for every calculation, statement and budget grid, with no feedback shown.
- `tests/content.test.ts`: every problem built with 200 random parameter sets; story numbers checked against the worked answers; no course references in player-facing text.

## Revising with it

- **Notes** (nav): every idea, readable without playing, searchable, plus a jargon buster of 58 terms.
- **Daily drill** (map): six quick questions on what needs it most: pop quizzes that are due, then the shakiest ideas, then what's gone longest unseen.
- **Mock exams** (nav): the real Autumn 2025 paper (4 questions, 100 marks, 120 minutes, real numbers); a fresh paper with the same shape and new numbers each time; and a 60-minute cash flow clinic. One clock, no tips, no feedback until the end, parts can be skipped and come back at the end, pens down when time's up. Written answers are typed and marked by you against the mark scheme. The report shows your marked script for every part, marks by question, and a list of weak spots with a cheat card and practice button each. Attempts are saved.

## Plain English

- **In real life:** every idea has an everyday picture (`src/content/everyday.ts`), shown at the top of its cheat card and as Margaux's first line.
- **Tap for meaning:** terms in speech bubbles and cheat cards are underlined; tapping opens a plain-English definition with an everyday example (`src/content/glossary.ts`). Switched off under exam conditions, as there's no glossary on the day.

## How the help fades

Every round is played at one of three levels:

| Level | What changes |
|---|---|
| **Guided** | Every move, a formula menu, a "spot it" move, tips (which halve that move's points), and Margaux after each move. |
| **On your own** | No formula menu, spot move or tips. You choose the method and type your workings; Margaux still reacts after each move. Written answers don't say how many points earn marks. |
| **Exam conditions** | As above, plus no feedback until the end. The summary then shows your script marked line by line. In the statement builder, slips aren't corrected along the way: they carry through and are marked from your own lines. |

What sets the level:
- **Mastery:** new ideas are guided; practising ideas are played on your own; common knowledge is played under exam conditions. The finance game's "Margaux does the sums for you" mode is gone.
- **Episode:** later rounds that repeat a pattern are marked `tier: 'unguided'` in `acts.ts`.
- **Chapter:** refresher chapters (I–III) never start fully guided.
- **Pop quizzes:** at least "on your own".
- **Boss rounds:** always exam conditions, with one clock for the whole paper (about 4 minutes a calculation, 12 for a statement). At pens down, any part not reached scores nothing.
- **Practice from the ledger:** the player picks the level.

## More than one right answer

- **Judgement rounds** (`judgement` kind): Bull and Bear Ltd has five open calls. Each treatment is marked **best** (2), **defensible** (1.5), **a stretch** (0.5) or **not allowed** (0). The profit is marked from your own choices. The end shows the defensible range (€16.8m–€18.95m) next to what each director would push for (Bill €22m, Ben just over €8m).
- **Defensible decisions** (`alsoAccept` on a decision): a reasonable alternative call and reason earns part or full marks, with Margaux's comment. Used for:
  - liquidity proposals (loses profit, but helps cash);
  - creditor days (either reading, full marks);
  - current ratio and P/E (opposite readings);
  - dropping a loss-making line whose fixed costs stay anyway;
  - a price cut taken for market share.

## Definitions to know

- Ratios follow the **exam sheet**. Where the slides differ (creditor days over credit purchases), the game uses the sheet and says so in the lesson.
- Liquidity management follows the Week 5 answers. Saving = days saved ÷ 365 × credit sales × cost of funds. Invoice discounting saving = amount borrowed × (cost of funds − facility rate), less the fee.
- Cash flow uses the indirect method from operating profit. Interest and dividends: the class example puts interest in financing, while the Frozen solution puts interest, tax and dividends in operating. Both are accepted where IFRS allows the choice.

## To do

- Chapters IX and X: check against the slides when they're added to the folder (X needs the slides and the Quattrone reading).
- Q4's sustainability option needs Chapter X; until then the written question offers the discretion question or non-financial measurement.

## The exam format (from the variance slides)

Four questions of 25 marks in 120 minutes (about a mark a minute). Three are computational with some written analysis, drawn
from preparing accounts, liquidity and ratios, CVP, cash budgeting and variances. The fourth is written, with a choice of two
(accounting theory, non-financial measurement, sustainability). The sheet gives the ratios and the variances, **not** CVP.

The mock exams follow that format (`src/content/papers.ts`): "A mixed mock" draws three of the five computational topics at random;
Mock A, B and C are fixed combinations; every sitting has new numbers, and question 4 asks the player to choose A or B before
answering (`choice` on `PaperQuestion`; the unchosen option isn't marked). The real Autumn 2025 paper and the cash flow clinic remain.
The exam day (Friday 11 December, 1–3pm, Blackrock) is the default exam date.

## Questions from the folder

The class question and the weekly answer banks are meant to be done by hand, so the game never uses their numbers: it uses
similar questions with fresh figures, and the Exam page lists the real ones to try on paper. `tests/variance.test.ts` and
`tests/bank.test.ts` rebuild the real questions as data and check the solvers give the worked answers (Beltra, Big Change,
Tricky, the accounts-preparation question, the Week 9 cash budget, and the CVP and liquidity questions).

Answer-sheet slips found while doing this (the game follows the correct arithmetic):
- Accounts preparation (DEF Limited): the loan is €100,000 in the question, but the answer sheet uses €120,000 for both the cash
  and the long-term liability. The two errors cancel, so net assets and equity (153,500) are right, but the cash should be 107,500.
- Variance Analysis 2, VA15: the working multiplies by 4,900 (units, not hours) and arrives at a rate of 16.50, which doesn't follow
  from VA13 (15.60). It looks inconsistent, so the game's "idle time" question is built on the logic of VA14 only.
- VA12 and VA14 write the efficiency formula with the actual rate (AR); the arithmetic uses the standard rate, which is correct.

## Test out of a chapter

Every chapter on the map has an "Already know this?" button. It builds a test with one question on every idea in the
chapter (new numbers each time) and runs it under mock-exam conditions: one clock, no tips, no feedback until the end.
Score 75% and the chapter's episodes and boss are ticked off ("Tested out"), the ideas the player showed they know move up
to Practising, and the pop quizzes confirm them over later days. Miss it and nothing is lost; the report lists what to
revisit. The code is `chapterTest` in `src/content/papers.ts` and `testOutChapter` in `src/engine/mastery.ts`; it reuses
`PaperPlayer`.

## Keeping the figures on screen

- Statement builder: the subtotals move no longer prints the totals it asks for; the bottom-line and decision moves keep
  the statement on screen with the player's own subtotals.
- Calculations and statements re-show the accounts and the numbers from the question ("The figures") from the second move
  on, so nothing needs scrolling back for.
- Guided level only: figures the question simply states are filled in (`src/engine/given.ts`), and "Plug in" asks only for
  figures that have to be worked out. Set `given: false` on an input where an automatic match is a coincidence.
