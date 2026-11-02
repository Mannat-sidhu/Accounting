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
| VII | The Christmas crunch | 9 Budgeting | **No slides yet**: past paper Q3B and standard cash budgets |
| VIII | Silk cost more | 10 Variances | **No slides yet**: exam formula sheet and past paper Q3A |
| IX | More than money | 11 Non-financial info | **No slides yet**: past paper Q3C |
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
- `tests/content.test.ts`: every problem built with 200 random parameter sets; story numbers checked against the worked answers; no course references in player-facing text.

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

- Chapters VII–IX: check against the slides when they're added to the folder.
- Chapter X: needs the slides and reading.
- Chapters VII–X in timed, mixed exam style once their slides are in.
