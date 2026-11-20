// The ten chapters. I–III are refreshers (topics up to the mid-term); IV, cash flow, is built up from first principles.
// Player-facing text never mentions lectures or textbooks; `topic` is for maintainers only.
import type { Act } from '../engine/types';
import { mulberry32 } from '../engine/rng';
import { ratioValue } from './act-5-problems';
import { YEAR_BASE, finOf, varyYear, yearParams } from './books';
import { KNOTTED } from './act-6-problems';
import { COATS } from './act-8-problems';
import { SCARVES } from './act-8-problems';

// Atelier Noor's year: Chapters II to V each add a layer to these same books.
const Y = yearParams(YEAR_BASE);
const FIN = finOf(YEAR_BASE);
// The following year, for the Chapter IV and V boss levels: same business, fresh numbers, compared with this year.
const NEXT = varyYear(mulberry32(2027));
const NY = yearParams(NEXT);
const NFIN = finOf(NEXT);
const r1 = (n: number) => Math.round(n * 10) / 10;

const ACT_1: Act = {
  number: 1,
  numeral: 'I',
  title: 'Who reads the books',
  topic: 'Topic 1: Introduction to accountancy',
  refresher: true,
  blurb: 'Year one ends. Everyone wants the accounts, for different reasons.',
  concepts: ['fin-v-mgmt', 'users', 'qualities', 'limited-company', 'annual-report'],
  sessions: [
    {
      id: 'a1s1',
      title: 'Year one closes',
      blurb: 'Who wants the numbers, and what makes them useful.',
      parts: [
        {
          kind: 'story',
          scene: 'Atelier Noor, Stoneybatter · 30 September',
          beats: [
            { who: 'narrator', text: 'The last order of the year goes out the door. Year one is over.' },
            { who: 'margaux', text: 'I’m Margaux. I keep the books. This season, you’re learning to read them with me.' },
            { who: 'idris', text: 'I own 60% of this house. I want to know what it earned.' },
            { who: 'aoife', text: 'And I want to know it can repay the bank.' },
            { who: 'margaux', text: 'Same accounts, different questions. Let’s start there.' },
          ],
        },
        { kind: 'lesson', concepts: ['fin-v-mgmt', 'users'] },
        { kind: 'problem', problem: 'fin-v-mgmt-sort' },
        { kind: 'problem', problem: 'users-sort' },
        { kind: 'lesson', concepts: ['qualities', 'limited-company'] },
        { kind: 'problem', problem: 'qualities-sort' },
        { kind: 'problem', problem: 'company-tf' },
        { kind: 'problem', problem: 'limits-brief' },
        { kind: 'lesson', concepts: ['annual-report'] },
        { kind: 'problem', problem: 'fs-components-brief' },
        { kind: 'problem', problem: 'fs-effectiveness-brief' },
        { kind: 'spotcheck' },
      ],
    },
  ],
};

const ACT_2: Act = {
  number: 2,
  numeral: 'II',
  title: 'What we own, what we owe',
  topic: 'Topic 2: The balance sheet',
  refresher: true,
  blurb: 'Margaux closes the books. The auditor arrives.',
  concepts: ['equation', 'asset-test', 'dual-effect', 'current-noncurrent', 'sfp-layout', 'conventions'],
  sessions: [
    {
      id: 'a2s1',
      title: 'The auditor arrives',
      blurb: 'The equation, the asset test, and two sides of every story.',
      parts: [
        {
          kind: 'story',
          scene: 'The studio · Monday, 9 a.m. sharp',
          beats: [
            { who: 'niamh', text: 'Niamh Deasy. I’m your auditor. I’ll need to see everything, and I’ll need to see the evidence for everything.' },
            { who: 'theo', mood: 'worried', text: 'Everything?' },
            { who: 'niamh', text: 'Everything. Starting with what you say you own.' },
          ],
        },
        { kind: 'lesson', concepts: ['equation', 'asset-test'] },
        { kind: 'problem', problem: 'asset-test' },
        { kind: 'problem', problem: 'net-assets', params: Y.netAssets },
        { kind: 'lesson', concepts: ['dual-effect'] },
        { kind: 'problem', problem: 'dual-effect' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a2s2',
      title: 'Where the year starts',
      blurb: 'Current or not, and Atelier Noor’s opening balance sheet: the first page of the year we’ll follow.',
      parts: [
        {
          kind: 'story',
          beats: [
            { who: 'margaux', text: 'Now we put it all in order. Long term, short term, and who has a claim on what.' },
            { who: 'margaux', text: 'And from here on we follow one year of our own business. The balance sheet you build today is where it starts. The income statement, the cash flow and the ratios all grow out of it.' },
          ],
        },
        { kind: 'lesson', concepts: ['current-noncurrent', 'sfp-layout'] },
        { kind: 'problem', problem: 'current-sort' },
        { kind: 'problem', problem: 'books-sfp-open' },
        { kind: 'lesson', concepts: ['conventions'] },
        { kind: 'problem', problem: 'conventions-sort' },
        { kind: 'spotcheck' },
      ],
    },
  ],
};

const ACT_3: Act = {
  number: 3,
  numeral: 'III',
  title: 'Theo’s record year',
  topic: 'Topic 3: The income statement',
  refresher: true,
  blurb: 'Did we actually make a profit? And who gets to decide?',
  concepts: ['is-layout', 'cost-of-sales', 'recognition', 'accruals-prepayments', 'depreciation', 'inventory-methods', 'provisions', 'discretion', 'transactions'],
  sessions: [
    {
      id: 'a3s1',
      title: 'Did we make a profit?',
      blurb: 'The layout, cost of sales, and when things count.',
      parts: [
        {
          kind: 'story',
          scene: 'The studio · bonus season',
          beats: [
            { who: 'theo', mood: 'happy', text: 'Record year! My bonus is on profit, so let’s count it.' },
            { who: 'margaux', text: 'Let’s count it properly. Same year we opened in Chapter II. First the two awkward lines, then the whole statement.' },
          ],
        },
        { kind: 'lesson', concepts: ['is-layout', 'cost-of-sales'] },
        { kind: 'problem', problem: 'cos', params: Y.cos },
        { kind: 'lesson', concepts: ['recognition', 'accruals-prepayments'] },
        { kind: 'problem', problem: 'recognition-sort' },
        { kind: 'problem', problem: 'accrual-prepayment', params: Y.accrual },
        { kind: 'problem', problem: 'books-is' },
        { kind: 'story', beats: [{ who: 'margaux', text: 'Real company check-in. Same move, real published accounts.' }] },
        { kind: 'problem', problem: 'real-bm-margin' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a3s2',
      title: 'What would you like it to be?',
      blurb: 'Depreciation, stock, provisions, and the judgement behind profit.',
      parts: [
        {
          kind: 'story',
          beats: [
            { who: 'niamh', text: 'Profit rests on estimates. Who made them, and why?' },
            { who: 'theo', text: 'Me. For excellent reasons.' },
          ],
        },
        { kind: 'lesson', concepts: ['depreciation', 'inventory-methods'] },
        { kind: 'problem', problem: 'straight-line', params: Y.straightLine },
        { kind: 'problem', problem: 'inventory-cost' },
        { kind: 'lesson', concepts: ['provisions', 'discretion'] },
        { kind: 'problem', problem: 'discretion-sort' },
        { kind: 'problem', problem: 'bull-bear' },
        { kind: 'problem', problem: 'discretion-brief' },
        { kind: 'problem', problem: 'mitigants-brief' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a3s3',
      title: 'Where the year ends',
      blurb: 'Follow each event of the year into the balance sheet, where profit joins it. Then a single month.',
      parts: [
        {
          kind: 'story',
          scene: 'The studio · 31 December',
          beats: [
            { who: 'niamh', text: 'Year end. I have the opening balance sheet you built, the income statement, and the list of what happened. I need the closing balance sheet, and it has to agree with both.' },
            { who: 'margaux', text: 'Same facts, three views: profit, cash, and what we own and owe. Every event lands in at least two places.' },
          ],
        },
        { kind: 'lesson', concepts: ['transactions'] },
        { kind: 'problem', problem: 'books-links' },
        { kind: 'problem', problem: 'books-sfp' },
        {
          kind: 'story',
          beats: [{ who: 'margaux', text: 'A year is just twelve months stacked up. Here’s one of them: same business, smaller numbers, one new trap.' }],
        },
        { kind: 'problem', problem: 'month-pl' },
        { kind: 'spotcheck' },
      ],
    },
  ],
};

const ACT_4: Act = {
  number: 4,
  numeral: 'IV',
  title: 'Profitable, but where’s the cash?',
  topic: 'Topic 4: Statement of cash flows',
  blurb: 'Built from the ground up: profit v. cash, the jar rule, the three buckets, the indirect method, every working.',
  concepts: ['cash-v-profit', 'cash-jar', 'cash-equivalents', 'ofi', 'interest-dividends', 'free-cash-flow', 'indirect-method', 'working-capital', 'dep-charge', 'capex', 'disposal', 'liability-jars', 'scf-layout'],
  sessions: [
    {
      id: 'a4s1',
      title: 'Profit isn’t cash',
      blurb: 'Why a record year left the bank account thin. The jar rule.',
      parts: [
        {
          kind: 'story',
          scene: 'Merchant’s Quay Bank · a Thursday',
          beats: [
            { who: 'aoife', text: 'Your profit is up. Your bank balance is down. Explain.' },
            { who: 'theo', mood: 'worried', text: 'That… can’t happen. Can it?' },
            { who: 'margaux', text: 'It happens all the time. It happened to us this year: the profit you found in Chapter III, and a bank balance that fell. We’re going to take this slowly, from the very beginning.' },
          ],
        },
        { kind: 'lesson', concepts: ['cash-v-profit'] },
        { kind: 'problem', problem: 'cash-or-profit' },
        { kind: 'lesson', concepts: ['cash-jar'] },
        { kind: 'problem', problem: 'cash-collected', params: Y.cashCollected },
        { kind: 'lesson', concepts: ['cash-equivalents'] },
        { kind: 'problem', problem: 'cce-change' },
        {
          kind: 'story',
          beats: [{ who: 'margaux', mood: 'happy', text: 'Three ideas so far. Profit isn’t cash. Every balance is a jar. And the target is the change in cash and cash equivalents, nothing else.' }],
        },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a4s2',
      title: 'Three buckets',
      blurb: 'Operating, investing, financing, and the interest question.',
      parts: [
        { kind: 'story', beats: [{ who: 'margaux', text: 'Every cash flow goes in one of three buckets. Let’s sort a year’s bank statements.' }] },
        { kind: 'lesson', concepts: ['ofi'] },
        { kind: 'problem', problem: 'ofi-sort' },
        { kind: 'problem', problem: 'month-cash' },
        { kind: 'lesson', concepts: ['interest-dividends'] },
        { kind: 'problem', problem: 'interest-choice' },
        { kind: 'lesson', concepts: ['free-cash-flow'] },
        { kind: 'problem', problem: 'fcf', params: Y.fcf },
        { kind: 'story', beats: [{ who: 'margaux', text: 'Real company check-in. Same formula, a company that can afford its dividend.' }] },
        { kind: 'problem', problem: 'real-gw-cash' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a4s3',
      title: 'From profit to cash',
      blurb: 'The indirect method: add back, take off, adjust.',
      parts: [
        { kind: 'story', beats: [{ who: 'margaux', text: 'Now we walk from operating profit to operating cash. Undo the non-cash, then follow the working capital.' }] },
        { kind: 'lesson', concepts: ['indirect-method', 'working-capital'] },
        { kind: 'problem', problem: 'wc-signs' },
        { kind: 'problem', problem: 'cfo-indirect', params: Y.cfoIndirect },
        { kind: 'story', beats: [{ who: 'margaux', text: 'Real company check-in. A real company that made a profit and still ran short of cash.' }] },
        { kind: 'problem', problem: 'real-tonies-cash' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a4s4',
      title: 'Detective work',
      blurb: 'Depreciation, additions, disposals, tax and dividends. Then the whole statement.',
      parts: [
        {
          kind: 'story',
          beats: [
            { who: 'niamh', text: 'In real accounts half the numbers are hidden. You find them from the balance sheet.' },
            { who: 'margaux', text: 'One jar at a time.' },
          ],
        },
        { kind: 'lesson', concepts: ['dep-charge', 'capex'] },
        { kind: 'problem', problem: 'dep-jar', params: Y.depJar },
        { kind: 'problem', problem: 'additions-jar', params: Y.additionsJar },
        { kind: 'lesson', concepts: ['disposal', 'liability-jars'] },
        { kind: 'problem', problem: 'disposal', params: Y.disposal },
        { kind: 'problem', problem: 'liability-paid', params: Y.taxPaid, tier: 'unguided' },
        { kind: 'lesson', concepts: ['scf-layout'] },
        { kind: 'problem', problem: 'books-scf' },
        { kind: 'spotcheck' },
      ],
    },
  ],
  boss: {
    title: 'The following year',
    intro: [
      { who: 'idris', mood: 'happy', text: 'Another year done! I’m telling my friends we’re “cash-rich” now.' },
      { who: 'margaux', text: 'Then we check. Same business, a whole new year of numbers. Every working, then the whole statement. No help from me.' },
    ],
    problems: [
      { problem: 'dep-jar', params: NY.depJar },
      { problem: 'disposal', params: NY.disposal },
      { problem: 'additions-jar', params: NY.additionsJar },
      { problem: 'liability-paid', params: NY.taxPaid },
      { problem: 'cfo-indirect', params: NY.cfoIndirect },
      { problem: 'books-scf', params: NEXT },
    ],
    paper: [
      { ref: 'Frozen Ltd', note: 'The same numbers as this boss. Write the full statement on paper with every working, W1 to W13.' },
      { ref: 'Equipment and litigation example', note: 'Rebuild the statement from the two balance sheets: target 15,000.' },
      { ref: 'Your Frozen workbook', note: 'Redo the “My workings” tab. Start from cash and cash equivalents, not profit or total assets.' },
    ],
  },
};

const ACT_5: Act = {
  number: 5,
  numeral: 'V',
  title: 'Aoife wants ratios',
  topic: 'Topic 5: Financial analysis and liquidity management',
  blurb: 'Five families of ratios, then the big one: is chasing slow payers worth what it costs?',
  concepts: ['ratio-families', 'profitability', 'efficiency', 'liquidity', 'gearing-cover', 'investor-ratios', 'ratio-limits', 'liquidity-management', 'debt-finance-options'],
  sessions: [
    {
      id: 'a5s1',
      title: 'Aoife’s checklist',
      blurb: 'Profitability, liquidity, gearing and investor ratios.',
      parts: [
        {
          kind: 'story',
          scene: 'Merchant’s Quay Bank · loan review',
          beats: [
            { who: 'aoife', text: 'New loan? Fine. Ratios first. I have a checklist.' },
            { who: 'margaux', text: 'She always has a checklist. Good news: we already have every number. They come straight from the income statement and balance sheets you built for this year.' },
          ],
        },
        { kind: 'lesson', concepts: ['ratio-families', 'profitability'] },
        { kind: 'problem', problem: 'ratio-sort' },
        { kind: 'problem', problem: 'ratio-profit', params: { ratio: 'roce', d: FIN, last: 13.8 } },
        { kind: 'story', beats: [{ who: 'margaux', text: 'Real company check-in. The same ratio on a famous real business.' }] },
        { kind: 'problem', problem: 'real-gw-roce' },
        { kind: 'problem', problem: 'ratio-profit', params: { ratio: 'roe', d: FIN, last: 15.5 }, tier: 'unguided' },
        { kind: 'lesson', concepts: ['liquidity', 'gearing-cover'] },
        { kind: 'problem', problem: 'ratio-liquidity', params: { ratio: 'quick', d: FIN, last: 1.4 }, tier: 'unguided' },
        { kind: 'problem', problem: 'ratio-gearing', params: { ratio: 'int-cover', d: FIN, last: 4.2 }, tier: 'unguided' },
        { kind: 'lesson', concepts: ['investor-ratios', 'ratio-limits'] },
        { kind: 'problem', problem: 'ratio-investor', params: { ratio: 'pe', d: FIN, last: 7 }, tier: 'unguided' },
        { kind: 'problem', problem: 'ratio-context-brief' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a5s2',
      title: 'Debtor days',
      blurb: 'The cash cycle, and four ways to get paid faster: which ones pay?',
      parts: [
        {
          kind: 'story',
          beats: [
            { who: 'aoife', text: 'Your customers take far too long to pay. That’s my money funding them.' },
            { who: 'margaux', text: 'Every option has a cost and a saving. We’ll weigh each one.' },
          ],
        },
        { kind: 'lesson', concepts: ['efficiency'] },
        { kind: 'problem', problem: 'ratio-efficiency', params: { ratio: 'debtor-days', d: FIN, last: 55 }, tier: 'unguided' },
        { kind: 'story', beats: [{ who: 'margaux', text: 'Real company check-in. How fast does a real discount chain sell its stock?' }] },
        { kind: 'problem', problem: 'real-bm-invdays' },
        { kind: 'problem', problem: 'ratio-reverse', tier: 'unguided' },
        { kind: 'problem', problem: 'cash-cycle' },
        { kind: 'lesson', concepts: ['liquidity-management'] },
        { kind: 'problem', problem: 'credit-control' },
        { kind: 'problem', problem: 'prompt-discount', tier: 'unguided' },
        { kind: 'lesson', concepts: ['debt-finance-options'] },
        { kind: 'problem', problem: 'invoice-discounting' },
        { kind: 'problem', problem: 'max-fee', tier: 'unguided' },
        { kind: 'problem', problem: 'factoring', tier: 'unguided' },
        { kind: 'problem', problem: 'debtor-info' },
        { kind: 'spotcheck' },
      ],
    },
  ],
  boss: {
    title: 'A year on',
    intro: [
      { who: 'aoife', text: 'The following year’s accounts are in. Before I renew anything: the ratios against last year, then what you’ll do about the debtors.' },
      { who: 'margaux', text: 'Same business, new numbers, and this year’s figures are the comparison. On your own.' },
    ],
    problems: [
      { problem: 'ratio-efficiency', params: { ratio: 'inv-days', d: NFIN, last: r1(ratioValue('inv-days', FIN)) } },
      { problem: 'ratio-efficiency', params: { ratio: 'debtor-days', d: NFIN, last: r1(ratioValue('debtor-days', FIN)) } },
      { problem: 'ratio-gearing', params: { ratio: 'int-cover', d: NFIN, last: r1(ratioValue('int-cover', FIN)) } },
      { problem: 'debtor-info' },
      { problem: 'credit-control', params: creditControlFor(NEXT.sales, NEXT.closeRec) },
    ],
    paper: [
      { ref: 'Overload Ltd (past paper Q2)', note: 'All three parts, written out: the ratios, three information sources, both proposals.' },
      { ref: 'Apex Company', note: 'All four options: credit control, prompt payment discount, invoice discounting, factoring.' },
      { ref: 'Week 5 question bank', note: 'Slowpay, Fastpay and Sluggish: LM1 to LM12.' },
    ],
  },
};

/** A credit-control offer for a year's debtors: get them down to 30 days, for a fee a bit under the saving. */
function creditControlFor(sales: number, receivables: number) {
  const saving = (receivables - (sales * 30) / 365) * 0.08;
  const cost = Math.max(500, Math.round((saving * 0.7) / 100) * 100);
  return { sales, daysNow: null, receivables, to: 30, by: null, funds: 8, cost, name: 'the boutique accounts' };
}

const ACT_6: Act = {
  number: 6,
  numeral: 'VI',
  title: 'How many scarves?',
  topic: 'Topic 6: Cost–volume–profit analysis',
  blurb: 'Contribution, break-even, margin of safety, and a machine that changes everything.',
  concepts: ['cost-behaviour', 'contribution', 'break-even', 'target-profit', 'margin-of-safety', 'operating-gearing', 'sales-mix', 'cvp-limits'],
  sessions: [
    {
      id: 'a6s1',
      title: 'Break-even',
      blurb: 'Fixed and variable, contribution, break-even, targets.',
      parts: [
        {
          kind: 'story',
          scene: 'The studio · planning the silk scarf line',
          beats: [
            { who: 'idris', text: 'Scarves. How many before they pay for themselves?' },
            { who: 'margaux', text: 'That’s a CVP question. First, which costs move with volume.' },
          ],
        },
        { kind: 'lesson', concepts: ['cost-behaviour', 'contribution'] },
        { kind: 'problem', problem: 'fixed-variable' },
        { kind: 'problem', problem: 'cvp-cpu' },
        { kind: 'lesson', concepts: ['break-even', 'target-profit', 'margin-of-safety'] },
        { kind: 'problem', problem: 'cvp-be' },
        { kind: 'problem', problem: 'cvp-target', tier: 'unguided' },
        { kind: 'problem', problem: 'cvp-mos', tier: 'unguided' },
        { kind: 'problem', problem: 'cvp-cmr', tier: 'unguided' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a6s2',
      title: 'The machine and the mix',
      blurb: 'Operating gearing, price cuts, sales mix and the limits of straight lines.',
      parts: [
        { kind: 'story', beats: [{ who: 'theo', mood: 'happy', text: 'I’ve found a machine. And a price cut. And a second product. All brilliant.' }] },
        { kind: 'lesson', concepts: ['operating-gearing'] },
        { kind: 'problem', problem: 'cvp-machine' },
        { kind: 'problem', problem: 'cvp-machine', params: { product: 'baskets', unit: 'baskets', price: 14, vc: 12, fixed: 500, units: 500, rent: 2500, newVc: 7, target: 4000, ask: 'target', period: 'a month' }, tier: 'unguided' },
        { kind: 'problem', problem: 'op-gearing-brief' },
        { kind: 'lesson', concepts: ['sales-mix', 'cvp-limits'] },
        { kind: 'problem', problem: 'sales-mix' },
        { kind: 'problem', problem: 'cvp-whatif', tier: 'unguided' },
        { kind: 'problem', problem: 'cvp-limits-brief' },
        { kind: 'problem', problem: 'cvp-assumptions-brief' },
        { kind: 'problem', problem: 'outsource-brief' },
        { kind: 'spotcheck' },
      ],
    },
  ],
  boss: {
    title: 'The silk tie maker',
    intro: [
      { who: 'idris', text: 'My cousin makes luxury silk ties. Here’s next year’s budget. Tell me everything.' },
      { who: 'margaux', text: 'Seven parts, all on one budget. No help from me.' },
    ],
    problems: [
      { problem: 'cvp-cpu', params: KNOTTED },
      { problem: 'cvp-be', params: { ...KNOTTED, mode: 'units' } },
      { problem: 'cvp-be', params: { ...KNOTTED, mode: 'value' } },
      { problem: 'cvp-mos', params: KNOTTED },
      { problem: 'cvp-target', params: KNOTTED },
      { problem: 'cvp-whatif', params: { ...KNOTTED, cut: 8, lift: 15, ask: 'profit' } },
      { problem: 'cvp-whatif', params: { ...KNOTTED, cut: 8, lift: 15, ask: 'be' } },
      { problem: 'cvp-limits-brief' },
      { problem: 'op-gearing-brief' },
    ],
    paper: [
      { ref: 'Knotted Ltd (past paper Q1)', note: 'Parts A to G, every line of working written out.' },
      { ref: 'Week 6 question bank', note: 'CVP1 to CVP11: from the contribution ratio, target profit, a price rise, and replacing variable overhead with a fixed fee.' },
      { ref: 'Cottage Industries', note: 'Q1 to Q3, with and without the machine, and the comments.' },
      { ref: 'CVP Example 1 and the sales mix example', note: 'Break-even, target profit, margin of safety, composite units.' },
    ],
  },
};

const ACT_7: Act = {
  number: 7,
  numeral: 'VII',
  title: 'The Christmas crunch',
  topic: 'Topic 7: Budgeting',
  blurb: 'What a budget is, how the budgets fit together, the cash budget, and why people game them.',
  concepts: ['budget-purpose', 'budget-process', 'operating-budgets', 'receipts-timing', 'cash-budget', 'budget-behaviour', 'budget-criticisms', 'budget-methods'],
  sessions: [
    {
      id: 'a7s1',
      title: 'The plan in numbers',
      blurb: 'What a budget is, how they’re set, and how they fit together.',
      parts: [
        {
          kind: 'story',
          scene: 'Merchant’s Quay Bank · budget season',
          beats: [
            { who: 'aoife', text: 'Next year’s plan. In numbers. By month. I’ll be reading it.' },
            { who: 'theo', mood: 'worried', text: 'A whole plan? In numbers? I just sell coats.' },
            { who: 'margaux', text: 'Everyone “just” does something. The budget is how it all fits together.' },
          ],
        },
        { kind: 'lesson', concepts: ['budget-purpose'] },
        { kind: 'problem', problem: 'budget-benefits' },
        { kind: 'lesson', concepts: ['budget-process'] },
        { kind: 'problem', problem: 'budget-types-sort' },
        { kind: 'problem', problem: 'budget-steps-sort', tier: 'unguided' },
        { kind: 'lesson', concepts: ['operating-budgets'] },
        { kind: 'problem', problem: 'purchases-budget' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a7s2',
      title: 'The cash budget',
      blurb: 'When the money arrives, and finding the overdraft before it finds you.',
      parts: [
        { kind: 'story', beats: [{ who: 'aoife', text: 'Your best months for sales are your worst months for cash. Every year. Let’s see it coming this time.' }] },
        { kind: 'lesson', concepts: ['receipts-timing', 'cash-budget'] },
        { kind: 'problem', problem: 'receipts-month' },
        { kind: 'problem', problem: 'receipts-split', tier: 'unguided' },
        { kind: 'problem', problem: 'slide-cash-budget' },
        { kind: 'problem', problem: 'xmas-budget', tier: 'unguided' },
        { kind: 'problem', problem: 'quarter-budget', tier: 'unguided' },
        { kind: 'problem', problem: 'cash-benefits-brief' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a7s3',
      title: 'When budgets go wrong',
      blurb: 'Padding, bonus gaming, and better ways to budget.',
      parts: [
        {
          kind: 'story',
          beats: [
            { who: 'theo', mood: 'happy', text: 'My studio’s budget is easy to beat. I may have mentioned we’d need a bit more silk than we really will.' },
            { who: 'niamh', text: 'A bit more.' },
            { who: 'margaux', text: 'That’s a story about people, not arithmetic. Let’s look at it properly.' },
          ],
        },
        { kind: 'lesson', concepts: ['budget-behaviour'] },
        { kind: 'problem', problem: 'behaviour-sort' },
        { kind: 'problem', problem: 'budget-behaviour-brief' },
        { kind: 'problem', problem: 'use-it-brief' },
        { kind: 'lesson', concepts: ['budget-criticisms', 'budget-methods'] },
        { kind: 'problem', problem: 'methods-sort' },
        { kind: 'problem', problem: 'budget-methods-brief' },
        { kind: 'problem', problem: 'beyond-budgeting-brief' },
        { kind: 'problem', problem: 'budget-criticisms-brief' },
        { kind: 'spotcheck' },
      ],
    },
  ],
  boss: {
    title: 'Next season’s plan',
    intro: [
      { who: 'aoife', text: 'Here’s the house’s next six months and a few questions. I’ll be reading your answers.' },
      { who: 'margaux', text: 'A cash budget, a purchases budget, and a couple of written answers. No help from me.' },
    ],
    problems: [
      { problem: 'receipts-month' },
      { problem: 'purchases-budget' },
      { problem: 'slide-cash-budget' },
      { problem: 'xmas-budget' },
      { problem: 'budget-benefits' },
      { problem: 'budget-criticisms-brief' },
    ],
    paper: [
      { ref: 'The six-month cash budget', note: 'Redo it on paper from the figures: total payments, surplus, opening and closing balance. Target closing balances: 30, 40, 27, 44, 57, 60.' },
      { ref: 'Week 9 question bank', note: 'BUD1 to BUD3: January to March with opening balances. Closing cash: 41,000, 77,000 and 58,000.' },
      { ref: 'Past paper Q3(B)', note: 'Four benefits of a regular budget, a sentence on how each helps.' },
      { ref: 'Your own list', note: 'Write out the eight criticisms of traditional budgeting and pair each with one example.' },
    ],
  },
};

const ACT_8: Act = {
  number: 8,
  numeral: 'VIII',
  title: 'Silk cost more',
  topic: 'Topic 8: Variance analysis (slides, class question, Week 10 question bank)',
  blurb: 'Price, usage, or Theo? Nine variances, one bridge from budgeted to actual profit.',
  concepts: ['standard-cost', 'sales-variances', 'material-variances', 'labour-variances', 'overhead-variances', 'variance-report', 'variance-causes', 'variance-reverse', 'standards-limits'],
  sessions: [
    {
      id: 'a8s1',
      title: 'The yardstick',
      blurb: 'Standards, the flexed budget, and the two sales variances.',
      parts: [
        { kind: 'story', scene: 'The studio · year-end review', beats: [{ who: 'idris', text: 'We spent more on silk than the budget said. Whose fault is it?' }, { who: 'margaux', text: 'First we need a fair yardstick. Then the variances can tell us.' }] },
        { kind: 'lesson', concepts: ['standard-cost'] },
        { kind: 'problem', problem: 'flex-tf' },
        { kind: 'problem', problem: 'var-budget-profit' },
        { kind: 'problem', problem: 'control-sort' },
        { kind: 'lesson', concepts: ['sales-variances'] },
        { kind: 'problem', problem: 'var-sales' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a8s2',
      title: 'Where the money went',
      blurb: 'Materials, labour, and the overheads.',
      parts: [
        { kind: 'story', beats: [{ who: 'niamh', text: 'Costs next. For each one, two questions: did we pay more per unit, and did we use more units?' }] },
        { kind: 'lesson', concepts: ['material-variances', 'labour-variances'] },
        { kind: 'problem', problem: 'var-materials' },
        { kind: 'problem', problem: 'var-labour' },
        { kind: 'lesson', concepts: ['overhead-variances'] },
        { kind: 'problem', problem: 'var-overheads' },
        { kind: 'problem', problem: 'var-overheads', params: { kind: 'fixed', d: COATS }, tier: 'unguided' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a8s3',
      title: 'The page for the board',
      blurb: 'The bridge to actual profit, why variances happen, and when they aren’t anyone’s fault.',
      parts: [
        { kind: 'story', beats: [{ who: 'idris', text: 'Nine numbers is not an answer. Give me one page.' }] },
        { kind: 'lesson', concepts: ['variance-report'] },
        { kind: 'problem', problem: 'var-reconcile' },
        { kind: 'lesson', concepts: ['variance-causes'] },
        { kind: 'problem', problem: 'variance-causes' },
        { kind: 'problem', problem: 'usage-reasons-brief' },
        { kind: 'problem', problem: 'variance-factors-brief' },
        { kind: 'lesson', concepts: ['variance-reverse'] },
        { kind: 'problem', problem: 'var-reverse' },
        { kind: 'lesson', concepts: ['standards-limits'] },
        { kind: 'problem', problem: 'standards-limits-brief' },
        { kind: 'spotcheck' },
      ],
    },
  ],
  boss: {
    title: 'The scarf maker',
    intro: [
      { who: 'niamh', text: 'A client of mine makes cashmere scarves. Here are its standards and last year’s results. I need all nine variances and the page for the board.' },
      { who: 'margaux', text: 'Eleven parts on one set of numbers. No help from me.' },
    ],
    problems: [
      { problem: 'var-budget-profit', params: { d: SCARVES, kind: 'budget' } },
      { problem: 'var-sales', params: { kind: 'sales-price', d: SCARVES } },
      { problem: 'var-sales', params: { kind: 'sales-volume', d: SCARVES } },
      { problem: 'var-materials', params: { kind: 'mat-rate', d: SCARVES } },
      { problem: 'var-materials', params: { kind: 'mat-qty', d: SCARVES } },
      { problem: 'var-labour', params: { kind: 'lab-rate', d: SCARVES } },
      { problem: 'var-labour', params: { kind: 'lab-eff', d: SCARVES } },
      { problem: 'var-overheads', params: { kind: 'vo-rate', d: SCARVES } },
      { problem: 'var-overheads', params: { kind: 'vo-eff', d: SCARVES } },
      { problem: 'var-overheads', params: { kind: 'fixed', d: SCARVES } },
      { problem: 'var-reconcile', params: SCARVES },
      { problem: 'usage-reasons-brief' },
    ],
    paper: [
      { ref: 'Beltra Fine Foods (class question)', note: 'Parts (a) and (b): all nine variances and the statement for the managing director. Target: budgeted 1,500,000 to actual 1,540,000.' },
      { ref: 'Week 10 bank: Big Change', note: 'VA1 to VA11: budgeted profit, all nine variances, and the reconciliation.' },
      { ref: 'Week 10 bank: Tricky Ltd', note: 'VA12 to VA15: working back to the actual rate, and setting aside the hours lost to the power cut.' },
      { ref: 'Onesale Ltd (past paper Q3)', note: 'Parts A and B written out. Then try C after the scorecard chapter.' },
    ],
  },
};

const ACT_9: Act = {
  number: 9,
  numeral: 'IX',
  title: 'More than money',
  topic: 'Topic 9: Non-financial measures (lecture 9 slides, sample exam Q4)',
  blurb: 'What profit can’t tell you, and how a balanced scorecard fills the gap.',
  concepts: ['financial-limits', 'nonfin-measures', 'balanced-scorecard', 'staff-and-profit', 'bsc-design', 'pms-features', 'bsc-limits'],
  sessions: [
    {
      id: 'a9s1',
      title: 'Looking ahead',
      blurb: 'What financial measures miss, and what non-financial ones add.',
      parts: [
        { kind: 'story', scene: 'The studio · the board meeting', beats: [{ who: 'margaux', text: 'Profit tells you how last year went. These tell you how next year will go.' }, { who: 'idris', text: 'Profit is the only number I read.' }, { who: 'niamh', text: 'Then you’re always a year behind.' }] },
        { kind: 'lesson', concepts: ['financial-limits', 'nonfin-measures'] },
        { kind: 'problem', problem: 'lead-lag-sort' },
        { kind: 'problem', problem: 'fin-nonfin-brief' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a9s2',
      title: 'The four perspectives',
      blurb: 'Financial, customer, internal and learning, and the chain from people to profit.',
      parts: [
        { kind: 'story', beats: [{ who: 'margaux', text: 'Four questions, one scorecard. How do shareholders see us? How do customers? What must we be good at? Can we keep improving?' }] },
        { kind: 'lesson', concepts: ['balanced-scorecard'] },
        { kind: 'problem', problem: 'scorecard-sort' },
        { kind: 'problem', problem: 'nonfin-brief' },
        { kind: 'lesson', concepts: ['staff-and-profit'] },
        { kind: 'problem', problem: 'staff-brief' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a9s3',
      title: 'Building one, and judging it',
      blurb: 'Objectives, measures, goals and initiatives; good design; limits.',
      parts: [
        { kind: 'story', beats: [{ who: 'niamh', text: 'Anyone can list measures. A scorecard is measures with a reason, a target and a plan.' }] },
        { kind: 'lesson', concepts: ['bsc-design'] },
        { kind: 'problem', problem: 'bsc-grid-sort' },
        { kind: 'problem', problem: 'bsc-flaws-sort' },
        { kind: 'problem', problem: 'bsc-design-brief' },
        { kind: 'lesson', concepts: ['pms-features', 'bsc-limits'] },
        { kind: 'problem', problem: 'pms-tf' },
        { kind: 'problem', problem: 'bsc-limits-brief' },
        { kind: 'spotcheck' },
      ],
    },
  ],
  boss: {
    title: 'The ferry operator',
    intro: [
      { who: 'niamh', text: 'A client runs a passenger ferry. The board has heard that “purely financial monitoring is reactive”. They want your view, a scorecard, and the limits.' },
      { who: 'margaux', text: 'Written answers under exam conditions. Use the marks to decide how much to write.' },
    ],
    problems: [{ problem: 'fin-nonfin-brief' }, { problem: 'bsc-design-brief' }, { problem: 'bsc-limits-brief' }, { problem: 'staff-brief' }],
    paper: [
      { ref: 'Sample Exam One, Question 4', note: 'The financial and non-financial data question (10 marks) and the scorecard for the Irish Postal Service (15 marks). Time yourself: a mark a minute.' },
      { ref: 'Past paper Q3(C)', note: 'The skilled-staff scorecard question, written out.' },
    ],
  },
};

const ACT_10: Act = {
  number: 10,
  numeral: 'X',
  title: 'The sustainability report',
  topic: 'Topic 12: Sustainability (needs the slides and the Quattrone reading)',
  blurb: 'A department store wants to know what your clothes cost the planet.',
  concepts: [],
  sessions: [],
  draft: true,
};

export const ACTS: Act[] = [ACT_1, ACT_2, ACT_3, ACT_4, ACT_5, ACT_6, ACT_7, ACT_8, ACT_9, ACT_10];
