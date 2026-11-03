// The ten chapters. I–III are refreshers (topics up to the mid-term); IV, cash flow, is built up from first principles.
// Player-facing text never mentions lectures or textbooks; `topic` is for maintainers only.
import type { Act } from '../engine/types';
import { FROST } from './act-4-problems';
import { HOUSE, OVERLOAD } from './act-5-problems';
import { KNOTTED } from './act-6-problems';
import { ONESALE } from './act-8-problems';

const ACT_1: Act = {
  number: 1,
  numeral: 'I',
  title: 'Who reads the books',
  topic: 'Topic 1: Introduction to accountancy',
  refresher: true,
  blurb: 'Year one ends. Everyone wants the accounts, for different reasons.',
  concepts: ['fin-v-mgmt', 'users', 'qualities', 'limited-company'],
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
        { kind: 'problem', problem: 'net-assets' },
        { kind: 'lesson', concepts: ['dual-effect'] },
        { kind: 'problem', problem: 'dual-effect' },
        { kind: 'spotcheck' },
      ],
    },
    {
      id: 'a2s2',
      title: 'Closing the books',
      blurb: 'Current or not, and the whole balance sheet.',
      parts: [
        { kind: 'story', beats: [{ who: 'margaux', text: 'Now we put it all in order. Long term, short term, and who has a claim on what.' }] },
        { kind: 'lesson', concepts: ['current-noncurrent', 'sfp-layout'] },
        { kind: 'problem', problem: 'current-sort' },
        { kind: 'problem', problem: 'sfp-build' },
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
  concepts: ['is-layout', 'cost-of-sales', 'recognition', 'accruals-prepayments', 'depreciation', 'inventory-methods', 'provisions', 'discretion'],
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
            { who: 'margaux', text: 'Let’s count it properly.' },
          ],
        },
        { kind: 'lesson', concepts: ['is-layout', 'cost-of-sales'] },
        { kind: 'problem', problem: 'is-build' },
        { kind: 'problem', problem: 'cos' },
        { kind: 'lesson', concepts: ['recognition', 'accruals-prepayments'] },
        { kind: 'problem', problem: 'recognition-sort' },
        { kind: 'problem', problem: 'accrual-prepayment' },
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
        { kind: 'problem', problem: 'straight-line' },
        { kind: 'problem', problem: 'inventory-cost' },
        { kind: 'lesson', concepts: ['provisions', 'discretion'] },
        { kind: 'problem', problem: 'discretion-sort' },
        { kind: 'problem', problem: 'bull-bear' },
        { kind: 'problem', problem: 'discretion-brief' },
        { kind: 'problem', problem: 'mitigants-brief' },
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
            { who: 'margaux', text: 'It happens all the time. We’re going to take this slowly, from the very beginning.' },
          ],
        },
        { kind: 'lesson', concepts: ['cash-v-profit'] },
        { kind: 'problem', problem: 'cash-or-profit' },
        { kind: 'lesson', concepts: ['cash-jar'] },
        { kind: 'problem', problem: 'cash-collected' },
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
        { kind: 'lesson', concepts: ['interest-dividends'] },
        { kind: 'problem', problem: 'interest-choice' },
        { kind: 'lesson', concepts: ['free-cash-flow'] },
        { kind: 'problem', problem: 'fcf' },
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
        { kind: 'problem', problem: 'cfo-indirect' },
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
        { kind: 'problem', problem: 'dep-jar' },
        { kind: 'problem', problem: 'additions-jar' },
        { kind: 'lesson', concepts: ['disposal', 'liability-jars'] },
        { kind: 'problem', problem: 'disposal' },
        { kind: 'problem', problem: 'liability-paid', tier: 'unguided' },
        { kind: 'lesson', concepts: ['scf-layout'] },
        { kind: 'problem', problem: 'scf-full' },
        { kind: 'spotcheck' },
      ],
    },
  ],
  boss: {
    title: 'The dessert maker',
    intro: [
      { who: 'idris', mood: 'happy', text: 'A frozen-dessert maker wants me to invest. Their brochure says “cash-rich”.' },
      { who: 'margaux', text: 'Then we check. Every working, then the whole statement. Figures in thousands. No help from me.' },
    ],
    problems: [
      { problem: 'cce-change', params: { oc: 120, oe: 100, oo: 20, cc: 95, ce: 500, co: 600, lock: 0, profit: 1200, receivables: 1450, unit: '€’000', depositNote: 'opened on 16 November that matured on 15 February' } },
      { problem: 'dep-jar', params: { open: FROST.adOpen, close: FROST.adClose, sold: FROST.soldAd, claim: FROST.adClose - FROST.adOpen, unit: '€’000' } },
      { problem: 'disposal', params: { cost: FROST.soldCost, ad: FROST.soldAd, given: 'proceeds', amount: FROST.proceeds, item: 'freezer line', unit: '€’000' } },
      { problem: 'additions-jar', params: { open: FROST.costOpen, close: FROST.costClose, soldCost: FROST.soldCost, unit: '€’000' } },
      { problem: 'liability-paid', params: { what: 'tax', start: FROST.taxOpen, charge: FROST.taxCharge, end: FROST.taxClose, unit: '€’000' } },
      { problem: 'liability-paid', params: { what: 'dividends', start: FROST.divOpen, charge: FROST.divDeclared, end: FROST.divClose, unit: '€’000' } },
      { problem: 'scf-frost' },
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
            { who: 'margaux', text: 'She always has a checklist.' },
          ],
        },
        { kind: 'lesson', concepts: ['ratio-families', 'profitability'] },
        { kind: 'problem', problem: 'ratio-sort' },
        { kind: 'problem', problem: 'ratio-profit' },
        { kind: 'problem', problem: 'ratio-profit', params: { ratio: 'roe', d: HOUSE, last: 10 }, tier: 'unguided' },
        { kind: 'lesson', concepts: ['liquidity', 'gearing-cover'] },
        { kind: 'problem', problem: 'ratio-liquidity', tier: 'unguided' },
        { kind: 'problem', problem: 'ratio-gearing', tier: 'unguided' },
        { kind: 'lesson', concepts: ['investor-ratios', 'ratio-limits'] },
        { kind: 'problem', problem: 'ratio-investor', tier: 'unguided' },
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
        { kind: 'problem', problem: 'ratio-efficiency', tier: 'unguided' },
        { kind: 'problem', problem: 'cash-cycle' },
        { kind: 'lesson', concepts: ['liquidity-management'] },
        { kind: 'problem', problem: 'credit-control' },
        { kind: 'problem', problem: 'prompt-discount', tier: 'unguided' },
        { kind: 'lesson', concepts: ['debt-finance-options'] },
        { kind: 'problem', problem: 'invoice-discounting' },
        { kind: 'problem', problem: 'factoring', tier: 'unguided' },
        { kind: 'problem', problem: 'debtor-info' },
        { kind: 'spotcheck' },
      ],
    },
  ],
  boss: {
    title: 'Overloaded',
    intro: [
      { who: 'aoife', text: 'A supplier of yours, Overload, wants credit from us. Here are its accounts.' },
      { who: 'margaux', text: 'Ratios, then the two proposals for its debtors. On your own.' },
    ],
    problems: [
      { problem: 'ratio-efficiency', params: { ratio: 'inv-days', d: OVERLOAD, last: 90 } },
      { problem: 'ratio-efficiency', params: { ratio: 'debtor-days', d: OVERLOAD, last: 80 } },
      { problem: 'ratio-gearing', params: { ratio: 'int-cover', d: OVERLOAD, last: 5 } },
      { problem: 'debtor-info' },
      { problem: 'credit-control', params: { sales: OVERLOAD.creditSales, daysNow: null, receivables: 500000, to: 30, by: null, funds: 6, cost: 50000, name: 'Overload' } },
      { problem: 'invoice-discounting', params: { receivables: 500000, sales: 0, days: 0, eligible: 80, advance: 75, facility: 2, fee: 25000, funds: 6, limit: null } },
    ],
    paper: [
      { ref: 'Overload Ltd (past paper Q2)', note: 'All three parts, written out: the ratios, three information sources, both proposals.' },
      { ref: 'Apex Company', note: 'All four options: credit control, prompt payment discount, invoice discounting, factoring.' },
      { ref: 'Week 5 question bank', note: 'Slowpay, Fastpay and Sluggish: LM1 to LM12.' },
    ],
  },
};

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
        { kind: 'problem', problem: 'slide-cash-budget' },
        { kind: 'problem', problem: 'xmas-budget', tier: 'unguided' },
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
        { kind: 'lesson', concepts: ['budget-criticisms', 'budget-methods'] },
        { kind: 'problem', problem: 'methods-sort' },
        { kind: 'problem', problem: 'budget-methods-brief' },
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
      { ref: 'Past paper Q3(B)', note: 'Four benefits of a regular budget, a sentence on how each helps.' },
      { ref: 'Your own list', note: 'Write out the eight criticisms of traditional budgeting and pair each with one example.' },
    ],
  },
};

const ACT_8: Act = {
  number: 8,
  numeral: 'VIII',
  title: 'Silk cost more',
  topic: 'Topic 10: Variance analysis (no slides yet: formulas from the exam sheet)',
  blurb: 'Price, usage, or Theo? Every variance asks a question.',
  concepts: ['standard-cost', 'sales-variances', 'material-variances', 'labour-variances', 'variance-causes'],
  sessions: [
    {
      id: 'a8s1',
      title: 'Price, usage, or Theo?',
      blurb: 'Sales, materials and labour variances, and what causes them.',
      parts: [
        { kind: 'story', beats: [{ who: 'idris', text: 'We spent more on silk than the budget said. Whose fault is it?' }, { who: 'margaux', text: 'Let the variances tell us.' }] },
        { kind: 'lesson', concepts: ['standard-cost', 'sales-variances'] },
        { kind: 'problem', problem: 'flex-tf' },
        { kind: 'problem', problem: 'var-sales' },
        { kind: 'lesson', concepts: ['material-variances', 'labour-variances'] },
        { kind: 'problem', problem: 'var-materials' },
        { kind: 'problem', problem: 'var-labour' },
        { kind: 'lesson', concepts: ['variance-causes'] },
        { kind: 'problem', problem: 'variance-causes' },
        { kind: 'spotcheck' },
      ],
    },
  ],
  boss: {
    title: 'One product, three variances',
    intro: [{ who: 'niamh', text: 'A client of mine makes a single bespoke product. No stock held. Three variances, then why budgets matter.' }],
    problems: [
      { problem: 'var-sales', params: { kind: 'sales-price', d: ONESALE } },
      { problem: 'var-materials', params: { kind: 'mat-qty', d: ONESALE } },
      { problem: 'var-materials', params: { kind: 'mat-rate', d: ONESALE } },
      { problem: 'budget-benefits' },
    ],
    paper: [{ ref: 'Onesale Ltd (past paper Q3)', note: 'Parts A and B written out. Then try C after the scorecard chapter.' }],
  },
};

const ACT_9: Act = {
  number: 9,
  numeral: 'IX',
  title: 'More than money',
  topic: 'Topic 11: Non-financial information (no slides yet)',
  blurb: 'A balanced scorecard, and what unhappy staff do to profit.',
  concepts: ['balanced-scorecard', 'staff-and-profit'],
  sessions: [
    {
      id: 'a9s1',
      title: 'The scorecard',
      blurb: 'Four perspectives, and the chain from people to profit.',
      parts: [
        { kind: 'story', beats: [{ who: 'margaux', text: 'Profit tells you how last year went. These tell you how next year will go.' }] },
        { kind: 'lesson', concepts: ['balanced-scorecard'] },
        { kind: 'problem', problem: 'scorecard-sort' },
        { kind: 'lesson', concepts: ['staff-and-profit'] },
        { kind: 'problem', problem: 'staff-brief' },
        { kind: 'spotcheck' },
      ],
    },
  ],
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
