// Real company check-ins. After building a statement or a ratio on Atelier Noor's own books, the player makes the same
// move on a real listed company's published accounts. Every figure is copied from the audited consolidated statements
// named in each source line (Games Workshop's results announcement, B&M's annual report, tonies' annual report).
// These are fixed figures, so a replay shows the same company: `vary` returns the published numbers.
import type { CalcProblem, ProblemInstance } from '../engine/types';
import { defineCalc, table, w0, w2, whys } from './helpers';

export const SOURCES = {
  gw: 'Source: Games Workshop Group PLC, audited results for the 52 weeks ended 31 May 2026 (£m).',
  bm: 'Source: B&M European Value Retail, Annual Report and Accounts 2026, 52 weeks ended 28 March 2026 (£m).',
  tonies: 'Source: tonies SE, Annual Report 2025, consolidated statement of cash flows, year to 31 December 2025 (€’000).',
} as const;

const fixed = <P,>(p: Omit<CalcProblem<P>, 'vary' | 'kind' | 'host'> & { build: (p: P) => ProblemInstance }) =>
  defineCalc<P>({ kind: 'calc', host: 'margaux', vary: () => p.base, ...p });

// ---------------------------------------------------------------- B&M: gross margin (Chapter III)

interface BmMarginP {
  revenue: number;
  cos: number;
  lastRevenue: number;
}

export const realBmMargin = fixed<BmMarginP>({
  id: 'real-bm-margin',
  title: 'Real company check-in: B&M',
  concept: 'is-layout',
  uses: ['cost-of-sales'],
  base: { revenue: 5775, cos: 3670, lastRevenue: 5571 },
  build: ({ revenue, cos, lastRevenue }) => {
    const gp = revenue - cos;
    const m = (gp / revenue) * 100;
    return {
      prompt: [
        { who: 'margaux', text: 'Now the same top half of an income statement, for a real business. B&M is a discount chain in the UK and France: biscuits, garden chairs, paint, toys, all cheap, all piled high.' },
        { who: 'theo', text: 'Our gross margin is 40%. Theirs must be better. They’re enormous.' },
      ],
      ask: 'What was B&M’s gross profit margin?',
      data: table('B&M: income statement, top lines (£m)', ['', '52 weeks to 28 Mar 2026', '52 weeks to 29 Mar 2025'], [
        ['Revenue', w0(revenue), w0(lastRevenue)],
        ['Cost of sales', `(${w0(cos)})`, '(3,479)'],
      ], undefined, SOURCES.bm),
      formula: { options: ['gpm', 'opm', 'roce'], correct: 'gpm', explain: 'Gross profit as a share of sales: what’s left of each pound after the cost of the goods.' },
      inputs: [
        { key: 'R', symbol: '\\text{Sales}', label: 'Revenue (£m)', unit: 'number', expected: revenue, explain: `£${w0(revenue)}m.` },
        { key: 'C', symbol: '\\text{CoS}', label: 'Cost of sales (£m)', unit: 'number', expected: cos, explain: `£${w0(cos)}m.`, signless: true },
      ],
      solve: (v) => ((v.R - Math.abs(v.C)) / v.R) * 100,
      answer: { label: 'Gross profit margin', unit: 'pct', explain: `(${w0(revenue)} − ${w0(cos)}) ÷ ${w0(revenue)} × 100 = ${w0(gp)} ÷ ${w0(revenue)} × 100 = ${w2(Math.round(m * 100) / 100)}%.` },
      decision: {
        question: `B&M keeps ${w2(Math.round(m * 10) / 10)}p of gross profit from each pound of sales; Atelier Noor keeps 40p. Is B&M the weaker business?`,
        options: [
          { id: 'volume', label: 'No: a discounter chooses a thinner margin and makes it up on volume' },
          { id: 'weaker', label: 'Yes: a lower margin always means a weaker business' },
        ],
        correct: 'volume',
        why: whys(
          `Low prices are the whole offer. ${w0(gp)} of gross profit on £${w0(revenue)}m of sales is a huge sum, even at a thinner margin.`,
          'Margins can be compared across any two businesses, whatever they sell.',
          'Size alone decides whether a business is strong.',
        ),
        correctWhy: 'w0',
        explain: `A ratio only means something against the right comparison: B&M’s own past, or other discounters. A small couture house and a national discount chain run different models on purpose.`,
      },
      working: [`Gross profit = ${w0(revenue)} − ${w0(cos)} = £${w0(gp)}m`, `Gross profit margin = ${w0(gp)} ÷ ${w0(revenue)} × 100 = ${w2(Math.round(m * 100) / 100)}%`],
      hints: { formula: 'Which ratio uses gross profit?', inputs: 'Revenue and cost of sales, straight from the table.', answer: 'Revenue less cost of sales, divided by revenue.', decision: 'What is a discount store selling, besides the goods?' },
      outcomes: {
        volume: { valueDelta: 500, news: 'Theo stops comparing the atelier with a supermarket. Mostly.' },
        weaker: { valueDelta: -500, news: 'Theo tells a friend B&M is a weak business. The friend works in retail and laughs.' },
      },
      cfoLine: `B&M gross margin ${w2(Math.round(m * 100) / 100)}%, against our 40%.`,
    };
  },
});

// ---------------------------------------------------------------- Games Workshop: free cash flow and the dividend (Chapter IV)

interface GwCashP {
  cfo: number;
  ppe: number;
  intangibles: number;
  development: number;
  dividends: number;
  profit: number;
}

export const realGwCash = fixed<GwCashP>({
  id: 'real-gw-cash',
  title: 'Real company check-in: Games Workshop',
  concept: 'free-cash-flow',
  uses: ['cash-v-profit'],
  base: { cfo: 267.7, ppe: 32.0, intangibles: 0.4, development: 17.0, dividends: 160.1, profit: 206.0 },
  build: ({ cfo, ppe, intangibles, development, dividends, profit }) => {
    const capex = Math.round((ppe + intangibles + development) * 10) / 10;
    const fcf = Math.round((cfo - capex) * 10) / 10;
    const covered = fcf >= dividends;
    return {
      prompt: [
        { who: 'margaux', text: 'Our free cash flow couldn’t cover our dividend this year. Here’s a company that pays out most of what it makes: Games Workshop, the Nottingham maker of Warhammer miniatures.' },
        { who: 'idris', mood: 'happy', text: `They paid £${w2(dividends)}m in dividends. If they can, why can’t we?` },
      ],
      ask: 'What was Games Workshop’s free cash flow, and did it cover the dividends paid?',
      data: table('Games Workshop: from the cash flow statement (£m)', ['', '52 weeks to 31 May 2026'], [
        ['Profit for the year', w2(profit)],
        ['Net cash generated from operating activities', w2(cfo)],
        ['Purchases of property, plant and equipment', `(${w2(ppe)})`],
        ['Purchases of other intangible assets', `(${w2(intangibles)})`],
        ['Expenditure on product development', `(${w2(development)})`],
        ['Dividends paid to shareholders', `(${w2(dividends)})`],
      ], undefined, SOURCES.gw),
      formula: { options: ['fcf', 'fcf-plus', 'profit-is-cash'], correct: 'fcf', explain: 'Free cash flow is operating cash flow less what had to be spent on long-term assets.' },
      inputs: [
        { key: 'C', symbol: '\\text{CFO}', label: 'Cash from operating activities (£m)', unit: 'number', expected: cfo, explain: `£${w2(cfo)}m.` },
        { key: 'K', symbol: '\\text{Capex}', label: 'Capital expenditure, all three lines (£m)', unit: 'number', expected: capex, explain: `${w2(ppe)} + ${w2(intangibles)} + ${w2(development)} = £${w2(capex)}m. New sculpts and moulds are capitalised as development.`, signless: true },
      ],
      solve: (v) => v.C - Math.abs(v.K),
      answer: { label: 'Free cash flow (£m)', unit: 'number', explain: `${w2(cfo)} − ${w2(capex)} = £${w2(fcf)}m.` },
      decision: {
        question: `Free cash flow against £${w2(dividends)}m of dividends: covered?`,
        options: [
          { id: 'covered', label: 'Covered, with room to spare' },
          { id: 'short', label: 'Not covered: they paid from savings' },
        ],
        correct: covered ? 'covered' : 'short',
        why: whys(
          `£${w2(fcf)}m of free cash against £${w2(dividends)}m paid out.`,
          'Dividends always come from profit, so cash is irrelevant.',
          'Operating cash flow is all free to pay out.',
        ),
        correctWhy: 'w0',
        explain: `Games Workshop turned £${w2(profit)}m of profit into £${w2(cfo)}m of operating cash, spent only £${w2(capex)}m on its assets, and still had £${w2(Math.round((fcf - dividends) * 10) / 10)}m left after the dividend. Same formula as ours, opposite answer: our £30,000 of machines left no free cash for our £8,000 dividend.`,
      },
      working: [`Capex = ${w2(ppe)} + ${w2(intangibles)} + ${w2(development)} = £${w2(capex)}m`, `FCF = ${w2(cfo)} − ${w2(capex)} = £${w2(fcf)}m`, `Dividends paid £${w2(dividends)}m: ${covered ? 'covered' : 'not covered'}`],
      hints: { formula: 'What has to be spent before any cash is free?', inputs: 'Three lines in investing are spending on long-term assets. Interest received isn’t one.', answer: 'One subtraction.', decision: 'Compare free cash flow with the dividends paid.' },
      outcomes: {
        covered: { valueDelta: 500, news: 'Idris learns why some companies can pay big dividends: they need very little new kit to keep earning.' },
        short: { valueDelta: -500, news: 'Idris is told the wrong story about Warhammer. He’s disappointed for the wrong reasons.' },
      },
      cfoLine: `Games Workshop FCF £${w2(fcf)}m against £${w2(dividends)}m of dividends.`,
    };
  },
});

// ---------------------------------------------------------------- tonies: profitable, but the stock ate the cash (Chapter IV)

interface ToniesP {
  ebitda: number;
  rec: number;
  inv: number;
  pay: number;
  other: number;
  tax: number;
  profit: number;
  reported: number;
}

export const realToniesCash = fixed<ToniesP>({
  id: 'real-tonies-cash',
  title: 'Real company check-in: tonies',
  concept: 'working-capital',
  uses: ['indirect-method', 'cash-v-profit'],
  // Other operating items, net: other assets 3,495 + provisions 3,415 + other liabilities 6,601 + share-based payment
  // liabilities 379 + share-based remuneration reserve 3,295 + loss on disposal 1,390 = 18,575.
  base: { ebitda: 48305, rec: -29144, inv: -68409, pay: 40473, other: 18575, tax: -3927, profit: 13114, reported: 5874 },
  build: ({ ebitda, rec, inv, pay, other, tax, profit, reported }) => {
    const cfo = ebitda + rec + inv + pay + other + tax;
    const sgn = (n: number) => (n < 0 ? `(${w0(-n)})` : w0(n));
    return {
      prompt: [
        { who: 'margaux', text: 'tonies makes the little audio figures children put on a speaker box to play stories. 2025 was a record year, and it launched a new Toniebox. It was profitable. Watch what happened to the cash.' },
        { who: 'theo', text: `€${w0(profit)} thousand of profit. So at least that much cash, surely?` },
      ],
      ask: 'Work out cash from operating activities from the reconciliation.',
      data: table('tonies: from the cash flow statement (€’000)', ['', '2025'], [
        ['Profit for the year', w0(profit)],
        ['EBITDA (operating profit with depreciation and amortisation added back)', w0(ebitda)],
        ['Decrease (increase) in trade receivables', sgn(rec)],
        ['Decrease (increase) in inventories', sgn(inv)],
        ['Increase (decrease) in trade payables', sgn(pay)],
        ['Other operating items, net', sgn(other)],
        ['Income tax paid', sgn(tax)],
      ], undefined, SOURCES.tonies),
      formula: { options: ['cfo-indirect', 'cfo-wrong-wc', 'profit-is-cash'], correct: 'cfo-indirect', explain: 'The indirect method: start from operating profit with the non-cash costs added back, then adjust for every working capital movement.' },
      stepNames: { inputs: 'Signed adjustments' },
      inputs: [
        { key: 'E', symbol: '\\text{EBITDA}', label: 'EBITDA', unit: 'number', expected: ebitda, explain: `${w0(ebitda)}: operating profit of 27,843 plus 20,462 of depreciation and amortisation, already added back.` },
        { key: 'R', symbol: '\\Delta\\text{Rec}', label: 'Receivables adjustment (negative if it soaks up cash)', unit: 'number', expected: rec, explain: `Receivables rose: ${sgn(rec)}.` },
        { key: 'I', symbol: '\\Delta\\text{Inv}', label: 'Inventories adjustment', unit: 'number', expected: inv, explain: `Inventories rose by ${w0(-inv)}: ${sgn(inv)}.` },
        { key: 'P', symbol: '\\Delta\\text{Pay}', label: 'Payables adjustment', unit: 'number', expected: pay, explain: `Payables rose: +${w0(pay)}.` },
        { key: 'O', symbol: '\\text{Other}', label: 'Other operating items, net', unit: 'number', expected: other, explain: `+${w0(other)}.` },
        { key: 'T', symbol: '\\text{Tax}', label: 'Income tax paid (negative)', unit: 'number', expected: tax, explain: `${sgn(tax)}.` },
      ],
      solve: (v) => v.E + v.R + v.I + v.P + v.O + v.T,
      answer: { label: 'Cash from operating activities (€’000)', unit: 'number', explain: `${w0(ebitda)} ${sgn(rec)} ${sgn(inv)} + ${w0(pay)} + ${w0(other)} ${sgn(tax)} = ${w0(cfo)}. The published statement shows ${w0(reported)}: its lines are rounded to the nearest thousand.` },
      decision: {
        question: `Profit ${w0(profit)}, operating cash about ${w0(cfo)}. What swallowed the cash?`,
        options: [
          { id: 'stock', label: 'Inventories: stock was built up for growth and the new Toniebox' },
          { id: 'dep', label: 'Depreciation and amortisation' },
          { id: 'tax', label: 'The tax bill' },
        ],
        correct: 'stock',
        why: whys(
          `Inventories alone soaked up ${w0(-inv)}, more than EBITDA itself. Suppliers funded only part of it (payables up ${w0(pay)}).`,
          'Depreciation is the main cash cost of any business.',
          'Tax is always the biggest difference between profit and cash.',
        ),
        correctWhy: 'w0',
        explain: `Depreciation was added back, so it isn’t a cash cost. Tax paid was ${w0(-tax)}. The stock build-up was ${w0(-inv)}. It’s the same lesson as Atelier Noor’s year (stock and slow-paying boutiques held the cash), at a hundred times the size.`,
      },
      working: [`${w0(ebitda)} ${sgn(rec)} ${sgn(inv)} + ${w0(pay)} + ${w0(other)} ${sgn(tax)}`, `= €${w0(cfo)} thousand (published: ${w0(reported)})`],
      hints: { formula: 'Increases in assets soak up cash, so they can’t be added.', inputs: 'Assets up: negative. Liabilities up: positive. The signs are in the table.', answer: 'Add the six figures, keeping their signs.', decision: 'Which single line is biggest?' },
      outcomes: {
        stock: { valueDelta: 500, news: 'Margaux pins the tonies cash flow next to ours: “Growth eats cash first.”' },
        dep: { valueDelta: -500, news: 'Theo blames depreciation again. Niamh sighs.' },
        tax: { valueDelta: -500, news: 'Theo blames the taxman. The taxman took less than a tenth of it.' },
      },
      cfoLine: `tonies: profit €${w0(profit)}k, operating cash €${w0(cfo)}k.`,
    };
  },
});

// ---------------------------------------------------------------- Games Workshop: ROCE (Chapter V)

interface GwRoceP {
  op: number;
  equity: number;
  ncl: number;
}

export const realGwRoce = fixed<GwRoceP>({
  id: 'real-gw-roce',
  title: 'Real company check-in: Games Workshop’s return',
  concept: 'profitability',
  uses: ['ratio-limits'],
  base: { op: 275.0, equity: 335.3, ncl: 52.5 },
  build: ({ op, equity, ncl }) => {
    const ce = Math.round((equity + ncl) * 10) / 10;
    const roce = (op / ce) * 100;
    const r1 = Math.round(roce * 10) / 10;
    return {
      prompt: [
        { who: 'aoife', text: 'Your return on capital employed is 15.3%. Respectable for a small atelier. Let me show you a number that isn’t.' },
        { who: 'margaux', text: 'Games Workshop again. Its real assets are the Warhammer worlds and designs it owns, and very little of that sits on a balance sheet.' },
      ],
      ask: 'What was Games Workshop’s return on capital employed?',
      data: table('Games Workshop: income statement and balance sheet (£m)', ['', '31 May 2026'], [
        ['Operating profit', w2(op)],
        ['Total equity', w2(equity)],
        ['Non-current liabilities (mostly leases)', w2(ncl)],
      ], undefined, SOURCES.gw),
      formula: { options: ['roce', 'roe', 'opm'], correct: 'roce', explain: 'Operating profit over all the long-term money in the business: equity plus long-term liabilities.' },
      inputs: [
        { key: 'P', symbol: '\\text{OP}', label: 'Operating profit (£m)', unit: 'number', expected: op, explain: `£${w2(op)}m, before interest and tax.` },
        { key: 'E', symbol: '\\text{Equity}', label: 'Total equity (£m)', unit: 'number', expected: equity, explain: `£${w2(equity)}m.` },
        { key: 'L', symbol: '\\text{NCL}', label: 'Non-current liabilities (£m)', unit: 'number', expected: ncl, explain: `£${w2(ncl)}m.` },
      ],
      solve: (v) => (v.P / (v.E + v.L)) * 100,
      answer: { label: 'ROCE', unit: 'pct', explain: `${w2(op)} ÷ (${w2(equity)} + ${w2(ncl)}) × 100 = ${w2(op)} ÷ ${w2(ce)} × 100 = ${w2(r1)}%.` },
      decision: {
        question: `ROCE of ${w2(r1)}% against our 15.3%. What explains most of the gap?`,
        options: [
          { id: 'ip', label: 'Its value is in brands and designs that need little capital on the balance sheet' },
          { id: 'fraud', label: 'The figure must be wrong: no business earns that' },
        ],
        correct: 'ip',
        why: whys(
          'A plastic miniature costs little to make and sells at a premium to loyal fans, and the brand built over decades isn’t a balance-sheet asset.',
          'High returns are always a sign of an error.',
          'ROCE ignores how much capital a business uses.',
        ),
        correctWhy: 'w0',
        explain: `Capital employed is only £${w2(ce)}m against £${w2(op)}m of operating profit. It’s also a limit of the ratio: assets the business built itself, like the brand, are left out of the denominator, so ROCE flatters it. Always ask what the balance sheet leaves out.`,
      },
      working: [`Capital employed = ${w2(equity)} + ${w2(ncl)} = £${w2(ce)}m`, `ROCE = ${w2(op)} ÷ ${w2(ce)} × 100 = ${w2(r1)}%`],
      hints: { formula: 'Profit before interest, over all long-term capital.', inputs: 'Equity plus non-current liabilities.', answer: 'One division, times 100.', decision: 'What does a model-maker own that a balance sheet can’t show?' },
      outcomes: {
        ip: { valueDelta: 500, news: 'Aoife nods. “Now tell me what’s missing from yours.”' },
        fraud: { valueDelta: -500, news: 'Aoife points out the auditors signed it. Niamh agrees, sharply.' },
      },
      cfoLine: `Games Workshop ROCE ${w2(r1)}%, against our 15.3%.`,
    };
  },
});

// ---------------------------------------------------------------- B&M: inventory days (Chapter V)

interface BmDaysP {
  open: number;
  close: number;
  cos: number;
  released: number;
}

export const realBmInvDays = fixed<BmDaysP>({
  id: 'real-bm-invdays',
  title: 'Real company check-in: B&M’s stock',
  concept: 'efficiency',
  uses: ['working-capital'],
  base: { open: 883, close: 849, cos: 3670, released: 38 },
  build: ({ open, close, cos, released }) => {
    const avg = (open + close) / 2;
    const days = (avg / cos) * 365;
    const d1 = Math.round(days * 10) / 10;
    return {
      prompt: [
        { who: 'margaux', text: 'Our stock sits for about 73 days before it sells. A discount chain lives or dies on how fast its shelves turn over. B&M spent the year on “getting back to basics”, and part of that was carrying less stock.' },
      ],
      ask: 'What were B&M’s inventory days?',
      data: table('B&M: from the accounts (£m)', ['', '29 Mar 2025', '28 Mar 2026'], [
        ['Inventories', w0(open), w0(close)],
        ['Cost of sales for the year', '', w0(cos)],
        ['Change in inventories (cash flow statement)', '', `+${w0(released)}`],
      ], undefined, SOURCES.bm),
      formula: { options: ['inv-days', 'creditor-days', 'debtor-days'], correct: 'inv-days', explain: 'Average inventory over cost of sales, times 365: how many days’ worth of stock is on hand.' },
      inputs: [
        { key: 'O', symbol: '\\text{Inv}_{start}', label: 'Inventories at the start (£m)', unit: 'number', expected: open, explain: `£${w0(open)}m.` },
        { key: 'C', symbol: '\\text{Inv}_{end}', label: 'Inventories at the end (£m)', unit: 'number', expected: close, explain: `£${w0(close)}m.` },
        { key: 'S', symbol: '\\text{CoS}', label: 'Cost of sales (£m)', unit: 'number', expected: cos, explain: `£${w0(cos)}m.`, signless: true },
      ],
      solve: (v) => ((v.O + v.C) / 2 / Math.abs(v.S)) * 365,
      answer: { label: 'Inventory days', unit: 'days', explain: `(${w0(open)} + ${w0(close)}) ÷ 2 = ${w0(avg)}; ${w0(avg)} ÷ ${w0(cos)} × 365 = ${w2(d1)} days.` },
      decision: {
        question: 'Stock fell from 883 to 849 while sales grew. What did that do for B&M’s cash?',
        options: [
          { id: 'released', label: `Released cash: the cash flow statement shows +${w0(released)}` },
          { id: 'none', label: 'Nothing: stock is on the balance sheet, not in cash' },
        ],
        correct: 'released',
        why: whys(
          'Less money tied up on the shelves means more in the bank. In the indirect method a fall in inventory is added back.',
          'Inventory and cash never affect each other.',
          'A fall in stock always means falling sales.',
        ),
        correctWhy: 'w0',
        explain: `Same rule as our cash flow, opposite direction: our stock rose and soaked up 8,000; B&M’s fell and released £${w0(released)}m. Inventory days link the balance sheet, the income statement and the cash flow in one number.`,
      },
      working: [`Average inventory = (${w0(open)} + ${w0(close)}) ÷ 2 = £${w0(avg)}m`, `Inventory days = ${w0(avg)} ÷ ${w0(cos)} × 365 = ${w2(d1)} days`],
      hints: { formula: 'Which ratio uses inventory and cost of sales?', inputs: 'Both inventory figures, then cost of sales.', answer: 'Average the two inventory figures first.', decision: 'In the indirect method, what does a fall in an asset do?' },
      outcomes: {
        released: { valueDelta: 500, news: 'Margaux starts a monthly stock count. Theo hides two rails of samples.' },
        none: { valueDelta: -500, news: 'The stock keeps growing at the atelier, and so does the overdraft.' },
      },
      cfoLine: `B&M inventory days ${w2(d1)}, against our 73.`,
    };
  },
});

export const REAL_PROBLEMS = [realBmMargin, realGwCash, realToniesCash, realGwRoce, realBmInvDays];
