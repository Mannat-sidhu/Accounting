// Chapter IV problems. Every number shown comes from the parameters and the solvers in engine/accounting.
import * as A from '../engine/accounting';
import { eur } from '../engine/format';
import { pickInt, pickOne } from '../engine/rng';
import type { ClassifyProblem, Problem, StatementItem } from '../engine/types';
import { defineCalc, defineStatement, table, w0, whys } from './helpers';

// ---------------------------------------------------------------- sorting rounds

export const cashOrProfit: ClassifyProblem = {
  kind: 'classify',
  id: 'cash-or-profit',
  title: 'Cash, profit, both or neither?',
  host: 'margaux',
  concept: 'cash-v-profit',
  prompt: ['Here’s the year in a dozen moments. For each one: does it change profit, cash, both, or neither (yet)?'],
  categories: [
    { id: 'both', label: 'Both' },
    { id: 'profit', label: 'Profit only' },
    { id: 'cash', label: 'Cash only' },
    { id: 'neither', label: 'Neither yet' },
  ],
  show: 7,
  items: [
    { text: 'Sell a coat for €900, paid on the spot', category: 'both', why: 'The sale is earned and the cash arrives at the same moment.' },
    { text: 'Sell a coat for €900 on 30 days’ credit', category: 'profit', why: 'Earned now, so it counts in profit. The cash comes next month.' },
    { text: 'A customer pays last month’s invoice', category: 'cash', why: 'The profit was counted when the sale was made. Today is just the cash catching up.' },
    { text: 'Charge €4,000 depreciation on the sewing machines', category: 'profit', why: 'An expense, but no money leaves. The cash went when the machines were bought.' },
    { text: 'Buy a new steam press for €6,000, paid in cash', category: 'cash', why: 'Cash out today. It reaches profit slowly, as depreciation over its life.' },
    { text: 'Take out a €20,000 bank loan', category: 'cash', why: 'Cash in, but it’s borrowed. A loan is a liability, not income.' },
    { text: 'Pay this month’s €2,000 rent', category: 'both', why: 'The rent is used up this month and paid this month.' },
    { text: 'Pay last year’s tax bill', category: 'cash', why: 'The tax expense was in last year’s profit. This year only the cash moves.' },
    { text: 'Staff work overtime in September, paid in October', category: 'profit', why: 'The cost belongs to September (an accrual). The cash goes in October.' },
    { text: 'Idris puts in €10,000 for new shares', category: 'cash', why: 'Cash in from an owner. It’s equity, not profit.' },
    { text: 'Buy silk on credit for next season', category: 'neither', why: 'No cash yet, and it isn’t an expense until the silk is used and the clothes are sold. It sits in inventory.' },
    { text: 'Write off €1,500 a customer will never pay', category: 'profit', why: 'An expense (a bad debt). No cash moves: that’s the problem.' },
    { text: 'Repay €5,000 of the bank loan', category: 'cash', why: 'Cash out, but repaying a loan isn’t an expense. Only the interest is.' },
  ],
  outcome: {
    allRight: { valueDelta: 1500, news: 'Margaux’s monthly cash report goes to the board for the first time. Idris actually reads it.' },
    someWrong: { valueDelta: 0, news: 'The board gets the profit figure and not much else. Business as usual.' },
  },
};

export const ofiSort: ClassifyProblem = {
  kind: 'classify',
  id: 'ofi-sort',
  title: 'Three buckets',
  host: 'margaux',
  concept: 'ofi',
  prompt: ['Margaux tips a shoebox of bank statements onto the table. Every line is a cash flow, or something pretending to be one. Which bucket?'],
  categories: [
    { id: 'op', label: 'Operating' },
    { id: 'inv', label: 'Investing' },
    { id: 'fin', label: 'Financing' },
    { id: 'none', label: 'Not a cash flow' },
  ],
  show: 8,
  items: [
    { text: 'Cash received from boutique customers', category: 'op', why: 'Day-to-day trading.' },
    { text: 'Paying the mill for silk', category: 'op', why: 'Buying inventory is part of trading.' },
    { text: 'Wages paid to the studio team', category: 'op', why: 'Running the business.' },
    { text: 'Buying a new embroidery machine', category: 'inv', why: 'A long-term asset: investing, even though it’s used in operations.' },
    { text: 'Selling the old delivery van', category: 'inv', why: 'Disposing of a long-term asset.' },
    { text: 'Buying shares in a fabric supplier, to hold', category: 'inv', why: 'An investment in another company.' },
    { text: 'Lending €5,000 to a struggling supplier', category: 'inv', why: 'Cash advanced to another party is investing.' },
    { text: 'Issuing new shares to Idris', category: 'fin', why: 'Raising money from an owner.' },
    { text: 'The premium Idris paid over the shares’ nominal value', category: 'fin', why: 'Share premium is part of the same share issue: financing.' },
    { text: 'Repaying part of the bank loan', category: 'fin', why: 'Paying back a lender.' },
    { text: 'Drawing down a new five-year loan', category: 'fin', why: 'Borrowing is financing.' },
    { text: 'The depreciation charge for the year', category: 'none', why: 'No cash moves. It’s added back in operating to undo it.' },
    { text: 'A gain on selling the van above its carrying amount', category: 'none', why: 'The gain isn’t cash. The sale proceeds are the investing inflow.' },
    { text: 'Raising the doubtful-debt provision', category: 'none', why: 'An estimate in profit. No money moves.' },
    { text: 'Corporation tax paid', category: 'op', why: 'Tax paid normally sits in operating.' },
  ],
};

export const interestChoice: ClassifyProblem = {
  kind: 'classify',
  id: 'interest-choice',
  title: 'The small print',
  host: 'niamh',
  concept: 'interest-dividends',
  prompt: ['Niamh, the auditor, likes a quiz. True or false?'],
  categories: [
    { id: 'true', label: 'True' },
    { id: 'false', label: 'False' },
  ],
  show: 6,
  items: [
    { text: 'Under IFRS, interest paid can be shown in operating or in financing.', category: 'true', why: 'IFRS allows either, applied consistently.' },
    { text: 'Once you’ve picked a bucket for interest, you can switch each year to make operating cash look better.', category: 'false', why: 'The choice must be applied consistently from period to period.' },
    { text: 'US rules require interest paid to be an operating cash flow.', category: 'true', why: 'US GAAP is stricter than IFRS here.' },
    { text: 'Dividends paid can be financing or operating.', category: 'true', why: 'Financing as a cost of equity, or operating to show they can be paid from trading cash.' },
    { text: 'The statement of cash flows shows the tax charge from the income statement.', category: 'false', why: 'It shows tax paid in cash. Use the tax jar.' },
    { text: 'Interest received can be shown in investing.', category: 'true', why: 'It’s a return on investments, so investing is allowed (or operating).' },
    { concept: 'cash-equivalents', text: 'A deposit made for two months counts as a cash equivalent.', category: 'true', why: 'It matures within three months of being made.' },
    { concept: 'cash-equivalents', text: 'A six-month deposit counts if it has under three months left at the year end.', category: 'false', why: 'The three months run from the date it was made, not from the year end.' },
    { concept: 'cash-equivalents', text: 'An overdraft repayable on demand is deducted in cash and cash equivalents.', category: 'true', why: 'It’s part of day-to-day cash management.' },
    { concept: 'cash-equivalents', text: 'If profit was €38,000, cash and cash equivalents went up by €38,000.', category: 'false', why: 'Profit isn’t cash. That’s what the whole statement is for.' },
  ],
};

export const wcSigns: ClassifyProblem = {
  kind: 'classify',
  id: 'wc-signs',
  title: 'Add or deduct?',
  host: 'margaux',
  concept: 'working-capital',
  prompt: ['We’re walking from operating profit to operating cash. For each line: add it, or deduct it?'],
  categories: [
    { id: 'add', label: 'Add' },
    { id: 'deduct', label: 'Deduct' },
  ],
  show: 8,
  items: [
    { text: 'Inventory went up', category: 'deduct', why: 'Cash spent on stock that hasn’t been sold yet.' },
    { text: 'Inventory went down', category: 'add', why: 'We sold stock we’d already paid for: cash released.' },
    { text: 'Trade receivables went up', category: 'deduct', why: 'Sales made but not yet paid for.' },
    { text: 'Trade receivables went down', category: 'add', why: 'We collected more than we sold this year.' },
    { text: 'Trade payables went up', category: 'add', why: 'We held on to cash we owe suppliers.' },
    { text: 'Trade payables went down', category: 'deduct', why: 'We paid suppliers more than we bought.' },
    { text: 'Accruals went up', category: 'add', why: 'Expenses in profit that we haven’t paid yet.' },
    { text: 'Prepayments went up', category: 'deduct', why: 'Paid in advance: cash out ahead of the expense.' },
    { concept: 'indirect-method', text: 'Depreciation charge', category: 'add', why: 'An expense with no cash: add it back.' },
    { concept: 'indirect-method', text: 'Gain on disposal of equipment', category: 'deduct', why: 'Not cash. The proceeds go in investing.' },
    { concept: 'indirect-method', text: 'Loss on disposal of equipment', category: 'add', why: 'A non-cash expense: add it back.' },
    { concept: 'indirect-method', text: 'New provision for a legal claim', category: 'add', why: 'Expense booked, nothing paid yet.' },
  ],
};

// ---------------------------------------------------------------- the jar: cash from customers

export const cashCollected = defineCalc({
  kind: 'calc',
  id: 'cash-collected',
  title: 'Theo’s record year',
  host: 'theo',
  concept: 'cash-jar',
  uses: ['cash-v-profit'],
  base: { open: 18000, sales: 240000, close: 62000 },
  vary: (rng) => {
    const open = pickInt(rng, 8000, 40000, 1000);
    return { open, sales: pickInt(rng, 120000, 400000, 5000), close: open + pickInt(rng, 5000, 60000, 1000) };
  },
  build: ({ open, sales, close }) => {
    const got = A.cashFromCustomers(open, sales, close);
    const gap = sales - got;
    return {
      prompt: [
        { who: 'theo', mood: 'happy', text: `Record year! ${eur(sales)} of sales, all on credit to the boutiques. Champagne?` },
        { who: 'margaux', text: `Then why is the bank account so thin? Customers owed us ${eur(open)} at the start of the year. They owe us ${eur(close)} now.` },
        { who: 'theo', mood: 'worried', text: 'They’ll pay. Probably. How much have they actually paid us this year?' },
      ],
      ask: 'How much cash did we collect from customers this year?',
      spot: {
        question: 'Which jar holds the answer?',
        options: [
          { id: 'rec', label: 'Trade receivables' },
          { id: 'inv', label: 'Inventory' },
          { id: 'pay', label: 'Trade payables' },
          { id: 're', label: 'Retained earnings' },
        ],
        correct: ['rec'],
        explain: 'Credit sales go into receivables; cash collected comes out. That’s the jar.',
      },
      formula: {
        options: ['jar-out', 'jar-end', 'jar-in', 'sales-is-cash'],
        correct: 'jar-out',
        explain: 'We know the start, what went in (sales) and the end. The unknown is what came out: the cash.',
      },
      stepNames: { spot: 'Find the jar', formula: 'Set up the jar' },
      inputs: [
        { key: 'S', symbol: '\\text{Start}', label: 'Receivables at the start', unit: 'eur', expected: open, explain: `Owed to us at the start: ${eur(open)}.` },
        { key: 'I', symbol: '\\text{In}', label: 'Credit sales', unit: 'eur', expected: sales, explain: `Sales on credit go into the jar: ${eur(sales)}.` },
        { key: 'E', symbol: '\\text{End}', label: 'Receivables at the end', unit: 'eur', expected: close, explain: `Still owed at the end: ${eur(close)}.` },
      ],
      solve: (v) => v.S + v.I - v.E,
      answer: { label: 'Cash collected', unit: 'eur', explain: `${w0(open)} + ${w0(sales)} − ${w0(close)} = ${w0(got)}. Receivables rose by ${w0(gap)}: that much of the record year is still IOUs.` },
      decision: {
        question: 'What do we tell Theo?',
        options: [
          { id: 'chase', label: `Chase the slow payers: ${eur(gap)} of his sales hasn’t arrived` },
          { id: 'fine', label: 'Pop the champagne: sales are cash' },
        ],
        correct: 'chase',
        why: whys('Receivables went up, so we collected less cash than we sold.', 'Profit and cash are the same thing over a year.', 'Receivables are cash at the bank.'),
        correctWhy: 'w0',
        explain: `Sales are profit, not cash. Only ${eur(got)} of the ${eur(sales)} reached the bank; the other ${eur(gap)} is sitting in receivables.`,
      },
      working: [
        'Receivables jar: Start + In − Out = End',
        `${w0(open)} + ${w0(sales)} − Out = ${w0(close)}`,
        `Cash collected = ${w0(open)} + ${w0(sales)} − ${w0(close)} = €${w0(got)}`,
      ],
      hints: {
        spot: 'Where do credit sales go before they turn into cash?',
        formula: 'You know three of the four. Which one is missing?',
        inputs: 'Start and end are the receivables balances. What goes in is the sales.',
        answer: 'Start + In − End.',
        decision: 'Compare the cash collected with the sales.',
      },
      outcomes: {
        chase: { valueDelta: 3000, cashDelta: Math.round(gap / 3), news: 'Margaux’s credit-control drive brings in a third of the overdue invoices within a month.' },
        fine: { valueDelta: -4000, news: 'A Galway boutique goes bust owing the house money. Theo had been “meaning to chase it”.' },
      },
      cfoLine: `Collected ${eur(got)} of ${eur(sales)} in sales; I’m chasing the rest.`,
    };
  },
});

// ---------------------------------------------------------------- what counts as cash

interface CceP {
  /** Opening cash, cash equivalents, overdraft. */
  oc: number;
  oe: number;
  oo: number;
  cc: number;
  ce: number;
  co: number;
  /** A longer deposit that is not a cash equivalent (closing). */
  lock: number;
  profit: number;
  receivables: number;
  unit: string;
  /** How the closing deposit is described (it must mature within 3 months of being made). */
  depositNote?: string;
}

export const cceChange = defineCalc<CceP>({
  kind: 'calc',
  id: 'cce-change',
  title: 'Find the target',
  host: 'margaux',
  concept: 'cash-equivalents',
  uses: ['cash-v-profit'],
  base: { oc: 14000, oe: 0, oo: 0, cc: 3000, ce: 10000, co: 8000, lock: 20000, profit: 38000, receivables: 46000, unit: '€' },
  vary: (rng) => ({
    oc: pickInt(rng, 2000, 30000, 1000),
    oe: pickOne(rng, [0, 0, 5000, 10000]),
    oo: pickOne(rng, [0, 0, 2000, 6000]),
    cc: pickInt(rng, 1000, 20000, 1000),
    ce: pickInt(rng, 0, 20000, 5000),
    co: pickOne(rng, [0, 4000, 8000, 12000]),
    lock: pickInt(rng, 10000, 40000, 5000),
    profit: pickInt(rng, 15000, 60000, 1000),
    receivables: pickInt(rng, 20000, 80000, 1000),
    unit: '€',
  }),
  build: ({ oc, oe, oo, cc, ce, co, lock, profit, receivables, unit, depositNote }) => {
    const note = depositNote ?? 'made on 1 September that matures on 30 November';
    const k = unit === '€' ? '' : ` (${unit})`;
    const open = A.cashAndEquivalents(oc, oe, oo);
    const close = A.cashAndEquivalents(cc, ce, co);
    const change = close - open;
    const idrisRight = Math.abs(change - profit) < 1;
    return {
      prompt: [
        { who: 'idris', text: `Profit was ${eur(profit)}${k}. So the cash went up by ${eur(profit)}${k}. Simple.` },
        { who: 'margaux', text: 'Nothing about cash is simple, Idris. Here are the year-end balances.' },
        `At the start we had ${eur(oc)} in the bank${oe ? `, a ${eur(oe)} deposit made for two months` : ''}${oo ? ` and an overdraft of ${eur(oo)}` : ''}. That’s ${eur(open)} of cash and cash equivalents.`,
        `Now: ${eur(cc)} in the bank, a ${eur(ce)} deposit ${note}${lock ? `, a ${eur(lock)} twelve-month deposit` : ''}, ${co ? `an overdraft of ${eur(co)}` : 'no overdraft'}, and customers owing us ${eur(receivables)}.`,
      ],
      ask: `By how much did cash and cash equivalents change this year${k}?`,
      data: table(`Year-end balances${k}`, ['', 'Start', 'End'], [
        ['Cash at bank', w0(oc), w0(cc)],
        ['Short deposit (made for 3 months or less)', w0(oe), w0(ce)],
        ...(lock ? [['Twelve-month deposit', '–', w0(lock)]] : []),
        ['Bank overdraft', oo ? `(${w0(oo)})` : '–', co ? `(${w0(co)})` : '–'],
        ['Trade receivables', '', w0(receivables)],
        ['Profit for the year', '', w0(profit)],
      ]),
      spot: {
        question: 'Which of these go into cash and cash equivalents at the year end?',
        options: [
          { id: 'cash', label: 'Cash at bank' },
          { id: 'short', label: `The deposit ${note}` },
          { id: 'od', label: 'The overdraft (subtracted)' },
          ...(lock ? [{ id: 'lock', label: 'The twelve-month deposit' }] : []),
          { id: 'rec', label: 'Trade receivables' },
          { id: 'profit', label: 'Profit for the year' },
        ],
        correct: co ? ['cash', 'short', 'od'] : ['cash', 'short'],
        explain: `Cash, deposits maturing within three months of being made, less overdrafts repayable on demand.${lock ? ' The twelve-month deposit fails the three-month test;' : ''} Receivables and profit aren’t cash at all.`,
      },
      formula: {
        options: ['cce', 'cce-all-deposits', 'profit-is-cash', 'total-assets-change'],
        correct: 'cce',
        explain: 'The target is the change in cash and cash equivalents: cash, plus short deposits, minus overdraft, end versus start.',
      },
      stepNames: { spot: 'What counts as cash?', formula: 'Pick the rule' },
      inputs: [
        { key: 'C', symbol: '\\text{Cash}', label: 'Cash at bank, end', unit: 'eur', expected: cc, explain: `${eur(cc)}.` },
        { key: 'E', symbol: '\\text{Equiv.}', label: 'Cash equivalents, end', unit: 'eur', expected: ce, explain: `Only the deposit made for three months: ${eur(ce)}.` },
        { key: 'O', symbol: '\\text{Overdraft}', label: 'Overdraft, end', unit: 'eur', expected: co, explain: co ? `${eur(co)}, which comes off.` : 'No overdraft at the end: 0.', signless: true },
        { key: 'P', symbol: '\\text{Start}', label: 'Cash and cash equivalents, start', unit: 'eur', expected: open, explain: `${eur(open)}, as Margaux said.` },
      ],
      solve: (v) => v.C + v.E - Math.abs(v.O) - v.P,
      answer: {
        label: 'Change in cash and cash equivalents',
        unit: 'eur',
        explain: `End: ${w0(cc)} + ${w0(ce)} − ${w0(co)} = ${w0(close)}. Start: ${w0(open)}. Change: ${w0(change)}.`,
      },
      decision: {
        question: 'Is Idris right that cash went up by the profit?',
        options: [
          { id: 'no', label: idrisRight ? 'Yes, this time, by coincidence' : 'No' },
          { id: 'yes', label: idrisRight ? 'No' : 'Yes' },
        ],
        correct: 'no',
        why: whys(
          'Profit is measured on an accruals basis; the change in cash has to be explained separately, line by line.',
          'Profit always equals the change in cash over a full year.',
          lock ? 'The twelve-month deposit is cash, so the two match.' : 'The overdraft is a liability, so it doesn’t affect cash.',
        ),
        correctWhy: 'w0',
        explain: `Cash and cash equivalents changed by ${eur(change)}${k}, against a profit of ${eur(profit)}${k}. The statement of cash flows has to explain that ${eur(change)}: it’s the target every line must add up to.`,
      },
      working: [
        `C&CE at start = ${w0(oc)} + ${w0(oe)} − ${w0(oo)} = ${w0(open)}`,
        `C&CE at end = ${w0(cc)} + ${w0(ce)} − ${w0(co)} = ${w0(close)}`,
        `Change = ${w0(close)} − ${w0(open)} = ${w0(change)}  (the target)`,
        ...(lock ? ['Twelve-month deposit: not a cash equivalent (matures more than 3 months after it was made).'] : []),
      ],
      hints: {
        spot: 'Three months from the date the deposit was made. And an overdraft is negative cash.',
        formula: 'The target is about cash, not profit and not total assets.',
        inputs: 'Leave out anything that isn’t cash or a three-month deposit.',
        answer: 'Work out the end figure first, then take off the start figure.',
        decision: 'What does the accruals basis do to timing?',
      },
      outcomes: {
        no: { valueDelta: 1000, news: 'Idris stops quoting profit as “cash in the bank” at board meetings. Mostly.' },
        yes: { valueDelta: -2000, news: 'Idris promises his mill a payment the house can’t make on time.' },
      },
      cfoLine: `Cash and cash equivalents moved by ${eur(change)}${k}; that’s our target.`,
    };
  },
});

// ---------------------------------------------------------------- free cash flow

export const fcfProblem = defineCalc({
  kind: 'calc',
  id: 'fcf',
  title: 'What’s actually free?',
  host: 'idris',
  concept: 'free-cash-flow',
  base: { cfo: 46000, capex: 30000, dividend: 25000 },
  vary: (rng) => {
    const cfo = pickInt(rng, 20000, 90000, 1000);
    return { cfo, capex: pickInt(rng, 5000, cfo + 10000, 1000), dividend: pickInt(rng, 5000, 40000, 1000) };
  },
  build: ({ cfo, capex, dividend }) => {
    const fcf = A.freeCashFlow(cfo, capex);
    const ok = fcf >= dividend;
    return {
      prompt: [
        { who: 'idris', mood: 'happy', text: `Operations brought in ${eur(cfo)} of cash. I’d like a ${eur(dividend)} dividend, please.` },
        { who: 'margaux', text: `We also spent ${eur(capex)} on new machines this year, and we’ll need to again.` },
      ],
      ask: 'What was free cash flow, and can it cover the dividend?',
      formula: {
        options: ['fcf', 'fcf-plus', 'profit-is-cash'],
        correct: 'fcf',
        explain: 'Free cash flow is operating cash flow minus capital expenditure.',
      },
      inputs: [
        { key: 'C', symbol: '\\text{CFO}', label: 'Cash from operating activities', unit: 'eur', expected: cfo, explain: `${eur(cfo)}.` },
        { key: 'K', symbol: '\\text{Capex}', label: 'Capital expenditure', unit: 'eur', expected: capex, explain: `${eur(capex)} on machines.`, signless: true },
      ],
      solve: (v) => v.C - Math.abs(v.K),
      answer: { label: 'Free cash flow', unit: 'eur', explain: `${w0(cfo)} − ${w0(capex)} = ${w0(fcf)}.` },
      decision: {
        question: `Pay Idris ${eur(dividend)} out of this year’s free cash flow?`,
        options: [
          { id: 'pay', label: 'Pay it' },
          { id: 'hold', label: 'Not in full' },
        ],
        correct: ok ? 'pay' : 'hold',
        why: whys(
          ok ? 'Free cash flow covers it, after keeping the equipment going.' : 'Free cash flow doesn’t cover it; we’d be paying it from savings or borrowing.',
          'Operating cash flow is all free to pay out.',
          'Dividends come from profit, so cash doesn’t matter.',
        ),
        correctWhy: 'w0',
        explain: ok
          ? `Free cash flow of ${eur(fcf)} covers the ${eur(dividend)} dividend.`
          : `Free cash flow is only ${eur(fcf)}. A ${eur(dividend)} dividend would eat into reserves or need borrowing.`,
      },
      working: [`FCF = CFO − capital expenditure`, `= ${w0(cfo)} − ${w0(capex)} = €${w0(fcf)}`],
      hints: { formula: 'What has to be spent before any cash is free?', inputs: 'Capital expenditure is the cash spent on machines.', answer: 'One subtraction.', decision: 'Compare free cash flow with the dividend.' },
      outcomes: {
        pay: { valueDelta: ok ? 500 : -3000, news: ok ? 'Idris gets his dividend. The machines get their maintenance.' : 'The dividend goes out; by March the house is on its overdraft.' },
        hold: { valueDelta: ok ? -500 : 2000, news: ok ? 'Idris grumbles about cash sitting idle.' : 'Idris gets a smaller dividend, and the house keeps a cushion.' },
      },
      cfoLine: `Free cash flow ${eur(fcf)}.`,
    };
  },
});

// ---------------------------------------------------------------- indirect method

interface CfoP {
  op: number;
  dep: number;
  inv: [number, number];
  rec: [number, number];
  pay: [number, number];
  refit: number;
}

export const cfoIndirect = defineCalc<CfoP>({
  kind: 'calc',
  id: 'cfo-indirect',
  title: 'From profit to cash',
  host: 'theo',
  concept: 'indirect-method',
  uses: ['working-capital'],
  base: { op: 52000, dep: 9000, inv: [14000, 21000], rec: [8000, 20000], pay: [6000, 10000], refit: 50000 },
  vary: (rng) => {
    const iv = pickInt(rng, 8000, 30000, 1000);
    const rc = pickInt(rng, 5000, 30000, 1000);
    const py = pickInt(rng, 4000, 20000, 1000);
    return {
      op: pickInt(rng, 30000, 90000, 1000),
      dep: pickInt(rng, 3000, 15000, 1000),
      inv: [iv, iv + pickInt(rng, -6000, 15000, 1000)],
      rec: [rc, rc + pickInt(rng, -5000, 18000, 1000)],
      pay: [py, py + pickInt(rng, -4000, 8000, 1000)],
      refit: pickInt(rng, 30000, 70000, 5000),
    };
  },
  build: ({ op, dep, inv, rec, pay, refit }) => {
    const wc = A.workingCapitalAdjustments({ inventory: inv, receivables: rec, payables: pay });
    const cfo = A.cashFromOperations({ operatingProfit: op, depreciation: dep, gainOnDisposal: 0, provisionIncrease: 0, wc: { inventory: inv, receivables: rec, payables: pay } });
    const sgn = (n: number) => (n >= 0 ? `+${w0(n)}` : `(${w0(-n)})`);
    return {
      prompt: [
        { who: 'theo', mood: 'happy', text: `Operating profit ${eur(op)}! So we can afford the ${eur(refit)} showroom refit this month. Right?` },
        { who: 'margaux', text: `Depreciation in that profit was ${eur(dep)}. Over the year inventory went from ${eur(inv[0])} to ${eur(inv[1])}, receivables from ${eur(rec[0])} to ${eur(rec[1])}, and payables from ${eur(pay[0])} to ${eur(pay[1])}.` },
      ],
      ask: 'What was the cash from operating activities?',
      data: table('From the accounts', ['', 'Start', 'End'], [
        ['Operating profit', '', w0(op)],
        ['Depreciation charged', '', w0(dep)],
        ['Inventory', w0(inv[0]), w0(inv[1])],
        ['Trade receivables', w0(rec[0]), w0(rec[1])],
        ['Trade payables', w0(pay[0]), w0(pay[1])],
      ]),
      spot: {
        question: 'Which lines need adjusting to get from operating profit to operating cash?',
        options: [
          { id: 'dep', label: 'Depreciation' },
          { id: 'inv', label: 'Change in inventory' },
          { id: 'rec', label: 'Change in receivables' },
          { id: 'pay', label: 'Change in payables' },
          { id: 'sales', label: 'Sales revenue' },
          { id: 'loan', label: 'The bank loan' },
        ],
        correct: ['dep', 'inv', 'rec', 'pay'],
        explain: 'Undo the non-cash expense (depreciation), then adjust for each working capital movement. Sales are already inside profit; the loan is financing.',
      },
      formula: {
        options: ['cfo-indirect', 'cfo-wrong-wc', 'profit-is-cash'],
        correct: 'cfo-indirect',
        explain: 'Indirect method: add back non-cash expenses, then deduct increases in assets and add increases in liabilities.',
      },
      stepNames: { spot: 'What needs adjusting?', formula: 'Pick the method', inputs: 'Signed adjustments' },
      inputs: [
        { key: 'P', symbol: '\\text{OP}', label: 'Operating profit', unit: 'eur', expected: op, explain: `${eur(op)}.` },
        { key: 'D', symbol: '\\text{Dep}', label: 'Depreciation (add back)', unit: 'eur', expected: dep, explain: `Add back ${eur(dep)}.` },
        { key: 'I', symbol: '\\Delta\\text{Inv}', label: 'Inventory adjustment (negative if it soaks up cash)', unit: 'eur', expected: wc.inventory, explain: `Inventory ${inv[1] >= inv[0] ? 'rose' : 'fell'} by ${w0(Math.abs(inv[1] - inv[0]))}: ${sgn(wc.inventory)}.` },
        { key: 'R', symbol: '\\Delta\\text{Rec}', label: 'Receivables adjustment', unit: 'eur', expected: wc.receivables, explain: `Receivables ${rec[1] >= rec[0] ? 'rose' : 'fell'} by ${w0(Math.abs(rec[1] - rec[0]))}: ${sgn(wc.receivables)}.` },
        { key: 'Y', symbol: '\\Delta\\text{Pay}', label: 'Payables adjustment', unit: 'eur', expected: wc.payables, explain: `Payables ${pay[1] >= pay[0] ? 'rose' : 'fell'} by ${w0(Math.abs(pay[1] - pay[0]))}: ${sgn(wc.payables)}.` },
      ],
      solve: (v) => v.P + v.D + v.I + v.R + v.Y,
      answer: { label: 'Cash from operating activities', unit: 'eur', explain: `${w0(op)} + ${w0(dep)} ${sgn(wc.inventory)} ${sgn(wc.receivables)} ${sgn(wc.payables)} = ${w0(cfo)}.` },
      decision: {
        question: `Can the ${eur(refit)} refit come out of this year’s operating cash?`,
        options: [
          { id: 'yes', label: 'Yes, go ahead' },
          { id: 'no', label: 'Not on this cash' },
        ],
        correct: cfo >= refit ? 'yes' : 'no',
        why: whys(
          cfo >= refit ? 'Operating cash covers it.' : 'Operating cash is well short of profit, because working capital soaked it up.',
          'Operating profit is the cash available.',
          'Depreciation is cash we can spend.',
        ),
        correctWhy: 'w0',
        explain: `Operating cash was ${eur(cfo)} against an operating profit of ${eur(op)}. ${cfo >= refit ? 'There’s enough, just.' : 'Profit isn’t cash: stock and slow payers have it.'}`,
      },
      working: [
        `Operating profit ${w0(op)}`,
        `Add back depreciation ${w0(dep)}`,
        `(Increase)/decrease in inventory ${w0(wc.inventory)}`,
        `(Increase)/decrease in receivables ${w0(wc.receivables)}`,
        `Increase/(decrease) in payables ${w0(wc.payables)}`,
        `Cash from operating activities €${w0(cfo)}`,
      ],
      hints: {
        spot: 'Anything in profit that wasn’t cash, and every working capital line that moved.',
        formula: 'Increases in assets soak up cash, so they can’t be added.',
        inputs: 'Assets up: negative. Liabilities up: positive.',
        answer: 'Add the five figures, keeping their signs.',
        decision: 'Compare operating cash, not profit, with the refit.',
      },
      outcomes: {
        yes: { valueDelta: cfo >= refit ? 2000 : -5000, news: cfo >= refit ? 'The showroom reopens with new rails and a queue outside.' : 'The refit goes ahead; the wages run in March needs an emergency overdraft.' },
        no: { valueDelta: cfo >= refit ? -1000 : 2500, news: cfo >= refit ? 'The refit waits a season. Theo sulks.' : 'Theo waits for the spring receipts. The refit happens in May, paid in cash.' },
      },
      cfoLine: `Operating cash ${eur(cfo)} against profit of ${eur(op)}.`,
    };
  },
});

// ---------------------------------------------------------------- side workings (the jars)

interface DepP {
  open: number;
  close: number;
  sold: number;
  claim: number;
  unit: string;
}

export const depJar = defineCalc<DepP>({
  kind: 'calc',
  id: 'dep-jar',
  title: 'The missing depreciation',
  host: 'niamh',
  concept: 'dep-charge',
  uses: ['cash-jar'],
  base: { open: 24000, close: 31000, sold: 5000, claim: 7000, unit: '€' },
  vary: (rng) => {
    const open = pickInt(rng, 10000, 60000, 1000);
    const sold = pickInt(rng, 1000, 12000, 1000);
    const charge = pickInt(rng, 4000, 20000, 1000);
    const close = open + charge - sold;
    return { open, close, sold, claim: close - open, unit: '€' };
  },
  build: ({ open, close, sold, claim, unit }) => {
    const k = unit === '€' ? '' : ` (${unit})`;
    const charge = A.depreciationCharge(open, close, sold);
    return {
      prompt: [
        { who: 'niamh', text: `I can’t find the depreciation charge in these draft accounts. Accumulated depreciation was ${eur(open)}${k} at the start and ${eur(close)}${k} at the end.` },
        { who: 'niamh', text: `Equipment was sold during the year. It had ${eur(sold)}${k} of accumulated depreciation on it when it went.` },
        { who: 'theo', text: `Easy: ${eur(close)} minus ${eur(open)}. ${eur(claim)}.` },
      ],
      ask: `What was the depreciation charge for the year${k}?`,
      spot: {
        question: 'Which jar do we need?',
        options: [
          { id: 'ad', label: 'Accumulated depreciation' },
          { id: 'cost', label: 'Equipment at cost' },
          { id: 'cash', label: 'Cash' },
          { id: 're', label: 'Retained earnings' },
        ],
        correct: ['ad'],
        explain: 'This year’s charge goes into the accumulated depreciation jar; depreciation on the assets sold comes out.',
      },
      formula: {
        options: ['dep-charge', 'dep-change-only', 'jar-end'],
        correct: 'dep-charge',
        explain: 'Closing − opening, plus what left the jar with the assets sold.',
      },
      stepNames: { spot: 'Find the jar', formula: 'Set up the jar' },
      inputs: [
        { key: 'O', symbol: '\\text{Opening AD}', label: 'Opening accumulated depreciation', unit: 'eur', expected: open, explain: `${eur(open)}.`, signless: true },
        { key: 'C', symbol: '\\text{Closing AD}', label: 'Closing accumulated depreciation', unit: 'eur', expected: close, explain: `${eur(close)}.`, signless: true },
        { key: 'S', symbol: '\\text{AD sold}', label: 'Accumulated depreciation on assets sold', unit: 'eur', expected: sold, explain: `${eur(sold)} left with the equipment.`, signless: true },
      ],
      solve: (v) => Math.abs(v.C) - Math.abs(v.O) + Math.abs(v.S),
      answer: { label: 'Depreciation charge', unit: 'eur', explain: `${w0(close)} − ${w0(open)} + ${w0(sold)} = ${w0(charge)}.` },
      decision: {
        question: `Use Theo’s ${eur(claim)}${k}?`,
        options: [
          { id: 'mine', label: `No: it’s ${eur(charge)}${k}` },
          { id: 'theo', label: 'Yes, near enough' },
        ],
        correct: 'mine',
        why: whys('Theo forgot the depreciation that left the jar with the assets sold.', 'Depreciation is just the change in the balance.', 'Depreciation doesn’t matter for cash flow.'),
        correctWhy: 'w0',
        explain: `The disposal took ${eur(sold)}${k} out of the jar, so the charge must have been ${eur(sold)}${k} more than the change in the balance. It’s added back in operating.`,
      },
      working: ['Accumulated depreciation jar: Opening + Charge − On disposals = Closing', `${w0(open)} + Charge − ${w0(sold)} = ${w0(close)}`, `Charge = ${w0(close)} − ${w0(open)} + ${w0(sold)} = ${w0(charge)}  (add back in operating)`],
      hints: {
        spot: 'Where does each year’s depreciation pile up?',
        formula: 'Something left the jar during the year. Don’t forget it.',
        inputs: 'All three figures are in Niamh’s lines.',
        answer: 'Closing − opening + sold.',
        decision: 'Did Theo use the disposal?',
      },
      outcomes: {
        mine: { valueDelta: 1000, news: 'Niamh ticks the depreciation working. One fewer audit query.' },
        theo: { valueDelta: -1500, news: 'Niamh raises an audit query on depreciation. The sign-off slips a week.' },
      },
      cfoLine: `Depreciation charge ${eur(charge)}${k}.`,
    };
  },
});

interface AddP {
  open: number;
  close: number;
  soldCost: number;
  unit: string;
}

export const additionsJar = defineCalc<AddP>({
  kind: 'calc',
  id: 'additions-jar',
  title: 'What did we buy?',
  host: 'niamh',
  concept: 'capex',
  uses: ['cash-jar'],
  base: { open: 90000, close: 112000, soldCost: 15000, unit: '€' },
  vary: (rng) => {
    const open = pickInt(rng, 40000, 200000, 5000);
    const soldCost = pickInt(rng, 5000, 30000, 1000);
    return { open, soldCost, close: open - soldCost + pickInt(rng, 10000, 60000, 1000), unit: '€' };
  },
  build: ({ open, close, soldCost, unit }) => {
    const k = unit === '€' ? '' : ` (${unit})`;
    const add = A.additions(open, close, soldCost);
    return {
      prompt: [
        { who: 'niamh', text: `Equipment at cost: ${eur(open)}${k} at the start, ${eur(close)}${k} at the end. The equipment sold had originally cost ${eur(soldCost)}${k}.` },
        { who: 'niamh', text: 'Nothing was bought on credit. How much cash went on new equipment?' },
      ],
      ask: `What were the additions to equipment${k}?`,
      formula: {
        options: ['additions', 'additions-change-only', 'dep-charge'],
        correct: 'additions',
        explain: 'Cost jar: closing − opening + cost of what was sold.',
      },
      stepNames: { formula: 'Set up the jar' },
      inputs: [
        { key: 'O', symbol: '\\text{Opening cost}', label: 'Opening cost', unit: 'eur', expected: open, explain: `${eur(open)}.` },
        { key: 'C', symbol: '\\text{Closing cost}', label: 'Closing cost', unit: 'eur', expected: close, explain: `${eur(close)}.` },
        { key: 'S', symbol: '\\text{Cost sold}', label: 'Cost of equipment sold', unit: 'eur', expected: soldCost, explain: `${eur(soldCost)}.` },
      ],
      solve: (v) => v.C - v.O + v.S,
      answer: { label: 'Additions (cash paid)', unit: 'eur', explain: `${w0(close)} − ${w0(open)} + ${w0(soldCost)} = ${w0(add)}.` },
      decision: {
        question: 'Where does it go in the statement of cash flows?',
        options: [
          { id: 'inv', label: 'Investing, as an outflow' },
          { id: 'op', label: 'Operating, as an expense' },
        ],
        correct: 'inv',
        why: whys('It’s cash spent on long-term assets.', 'Equipment is used in operations, so it’s operating.', 'It isn’t cash; only depreciation counts.'),
        correctWhy: 'w0',
        explain: `${eur(add)}${k} out, under investing activities. The depreciation on it is handled separately, in operating.`,
      },
      working: ['Cost jar: Opening + Additions − Disposals = Closing', `${w0(open)} + Additions − ${w0(soldCost)} = ${w0(close)}`, `Additions = ${w0(add)}  (investing outflow)`],
      hints: { formula: 'The cost of the equipment sold left the jar.', inputs: 'Use cost figures only.', answer: 'Closing − opening + sold.', decision: 'Long-term asset, so which bucket?' },
      outcomes: {
        inv: { valueDelta: 500, news: 'The investing section adds up first time.' },
        op: { valueDelta: -1000, news: 'Operating cash looks awful in the draft; Aoife rings to ask what’s wrong.' },
      },
      cfoLine: `Additions ${eur(add)}${k}, in investing.`,
    };
  },
});

interface DispP {
  cost: number;
  ad: number;
  /** Known side: 'gain' given (find proceeds) or 'proceeds' given (find the gain). */
  given: 'gain' | 'proceeds';
  amount: number;
  item: string;
  unit: string;
}

export const disposalCalc = defineCalc<DispP>({
  kind: 'calc',
  id: 'disposal',
  title: 'Selling the old van',
  host: 'margaux',
  concept: 'disposal',
  base: { cost: 15000, ad: 5000, given: 'gain', amount: 2500, item: 'delivery van', unit: '€' },
  vary: (rng) => {
    const cost = pickInt(rng, 8000, 40000, 1000);
    const ad = pickInt(rng, 1000, cost - 2000, 1000);
    const given = pickOne(rng, ['gain', 'proceeds'] as const);
    const gain = pickInt(rng, -2000, 6000, 500) || 1500;
    return { cost, ad, given, amount: given === 'gain' ? gain : cost - ad + gain, item: pickOne(rng, ['delivery van', 'cutting table', 'steam press']), unit: '€' };
  },
  build: ({ cost, ad, given, amount, item, unit }) => {
    const k = unit === '€' ? '' : ` (${unit})`;
    const nbv = cost - ad;
    const gain = given === 'gain' ? amount : A.disposalGain(cost, ad, amount);
    const proceeds = A.disposalProceeds(cost, ad, gain);
    const findProceeds = given === 'gain';
    const word = gain >= 0 ? 'gain' : 'loss';
    return {
      prompt: findProceeds
        ? [`We sold the ${item}. It cost ${eur(cost)}${k} and had ${eur(ad)}${k} of accumulated depreciation. The income statement shows a ${word} on disposal of ${eur(Math.abs(gain))}${k}.`, 'The bank statement’s missing. How much did the buyer pay?']
        : [`We sold the ${item} for ${eur(proceeds)}${k}. It cost ${eur(cost)}${k} and had ${eur(ad)}${k} of accumulated depreciation when it went.`, 'What gain or loss goes in the income statement?'],
      ask: findProceeds ? `What were the sale proceeds${k}?` : `What was the gain on disposal${k}? (A loss is negative.)`,
      formula: findProceeds
        ? { options: ['proceeds', 'proceeds-is-gain', 'proceeds-cost-gain'], correct: 'proceeds', explain: 'Carrying amount plus the gain gives the price paid.' }
        : { options: ['proceeds', 'proceeds-is-gain', 'proceeds-cost-gain'], correct: 'proceeds', explain: 'Proceeds = carrying amount + gain, so gain = proceeds − carrying amount.' },
      inputs: [
        { key: 'C', symbol: '\\text{Cost}', label: 'Original cost', unit: 'eur', expected: cost, explain: `${eur(cost)}.` },
        { key: 'D', symbol: '\\text{AD}', label: 'Accumulated depreciation on it', unit: 'eur', expected: ad, explain: `${eur(ad)}.`, signless: true },
        findProceeds
          ? { key: 'G', symbol: '\\text{Gain}', label: 'Gain on disposal (negative for a loss)', unit: 'eur', expected: gain, explain: `${gain >= 0 ? 'A gain' : 'A loss'} of ${eur(Math.abs(gain))}.` }
          : { key: 'G', symbol: '\\text{Proceeds}', label: 'Sale proceeds', unit: 'eur', expected: proceeds, explain: `${eur(proceeds)}.` },
      ],
      solve: findProceeds ? (v) => v.C - Math.abs(v.D) + v.G : (v) => v.G - (v.C - Math.abs(v.D)),
      answer: findProceeds
        ? { label: 'Sale proceeds', unit: 'eur', explain: `Carrying amount ${w0(cost)} − ${w0(ad)} = ${w0(nbv)}; plus ${word} ${w0(gain)} = ${w0(proceeds)}.` }
        : { label: 'Gain on disposal', unit: 'eur', explain: `Proceeds ${w0(proceeds)} − carrying amount ${w0(nbv)} = ${w0(gain)}.` },
      decision: {
        question: 'How does the sale show in the statement of cash flows?',
        options: [
          { id: 'split', label: `Proceeds ${w0(proceeds)} in investing; ${gain >= 0 ? 'deduct' : 'add back'} the ${word} in operating` },
          { id: 'gain', label: `Only the ${word}, in operating` },
          { id: 'both-op', label: 'Proceeds in operating' },
        ],
        correct: 'split',
        why: whys(
          `The proceeds are the cash; the ${word} is a non-cash figure inside operating profit.`,
          `The ${word} is the cash that came in.`,
          'Selling equipment is part of day-to-day trading.',
        ),
        correctWhy: 'w0',
        explain: `Cash in = ${eur(proceeds)}${k}, under investing. The ${word} of ${eur(Math.abs(gain))}${k} is ${gain >= 0 ? 'deducted from' : 'added back to'} operating profit so it isn’t counted twice.`,
      },
      working: [`Carrying amount = ${w0(cost)} − ${w0(ad)} = ${w0(nbv)}`, findProceeds ? `Proceeds = ${w0(nbv)} + ${w0(gain)} = ${w0(proceeds)}` : `Gain = ${w0(proceeds)} − ${w0(nbv)} = ${w0(gain)}`, `Investing: proceeds ${w0(proceeds)}. Operating: ${gain >= 0 ? 'deduct' : 'add back'} ${w0(Math.abs(gain))}.`],
      hints: { formula: 'Start from the carrying amount: cost less accumulated depreciation.', inputs: 'Cost and accumulated depreciation come from the asset that was sold.', answer: findProceeds ? 'Carrying amount + gain.' : 'Proceeds − carrying amount.', decision: 'Which figure is actual cash?' },
      outcomes: {
        split: { valueDelta: 500, news: 'The disposal working goes in exactly as Niamh would write it.' },
        gain: { valueDelta: -1000, news: 'The investing section is short by the whole sale price. It doesn’t balance.' },
        'both-op': { valueDelta: -500, news: 'Operating cash looks oddly healthy in the draft. Niamh notices.' },
      },
      cfoLine: `Disposal: proceeds ${eur(proceeds)}${k}, ${word} ${eur(Math.abs(gain))}${k}.`,
    };
  },
});

interface LiabP {
  what: 'tax' | 'dividends';
  start: number;
  charge: number;
  end: number;
  unit: string;
}

export const liabilityPaid = defineCalc<LiabP>({
  kind: 'calc',
  id: 'liability-paid',
  title: 'What was actually paid?',
  host: 'margaux',
  concept: 'liability-jars',
  uses: ['cash-jar'],
  base: { what: 'tax', start: 9000, charge: 11000, end: 6000, unit: '€' },
  vary: (rng) => ({
    what: pickOne(rng, ['tax', 'dividends'] as const),
    start: pickInt(rng, 1000, 15000, 500),
    charge: pickInt(rng, 3000, 20000, 500),
    end: pickInt(rng, 500, 15000, 500),
    unit: '€',
  }),
  build: ({ what, start, charge, end, unit }) => {
    const k = unit === '€' ? '' : ` (${unit})`;
    const paid = A.liabilityPaid(start, charge, end);
    const tax = what === 'tax';
    const chargeWord = tax ? 'tax charge for the year' : 'dividends declared for the year';
    return {
      prompt: tax
        ? [`The income statement shows a tax charge of ${eur(charge)}${k}. Corporation tax owed was ${eur(start)}${k} at the start of the year and ${eur(end)}${k} at the end.`]
        : [`Dividends of ${eur(charge)}${k} were declared for the year. Dividends owed to shareholders were ${eur(start)}${k} at the start and ${eur(end)}${k} at the end.`],
      ask: `How much ${tax ? 'tax' : 'in dividends'} did we actually pay${k}?`,
      formula: {
        options: ['liability-paid', 'charge-is-paid', 'jar-end'],
        correct: 'liability-paid',
        explain: 'Liability jar: owed at start + charge − owed at end = paid.',
      },
      stepNames: { formula: 'Set up the jar' },
      inputs: [
        { key: 'S', symbol: '\\text{Owed start}', label: 'Owed at the start', unit: 'eur', expected: start, explain: `${eur(start)}.` },
        { key: 'C', symbol: '\\text{Charge}', label: tax ? 'Tax charge' : 'Dividends declared', unit: 'eur', expected: charge, explain: `${eur(charge)}.` },
        { key: 'E', symbol: '\\text{Owed end}', label: 'Owed at the end', unit: 'eur', expected: end, explain: `${eur(end)}.` },
      ],
      solve: (v) => v.S + v.C - v.E,
      answer: { label: tax ? 'Tax paid' : 'Dividends paid', unit: 'eur', explain: `${w0(start)} + ${w0(charge)} − ${w0(end)} = ${w0(paid)}.` },
      decision: {
        question: 'Which figure goes in the statement of cash flows?',
        options: [
          { id: 'paid', label: `${w0(paid)}, the amount paid` },
          { id: 'charge', label: `${w0(charge)}, the ${chargeWord}` },
        ],
        correct: 'paid',
        why: whys('The statement shows cash moving, not the charge.', 'The charge is what the income statement says, so it must be the cash.', 'Whichever is smaller, to be prudent.'),
        correctWhy: 'w0',
        explain: `Cash paid was ${eur(paid)}${k}. ${tax ? 'Tax paid normally sits in operating.' : 'Dividends paid go in financing, or operating if that’s the house choice.'}`,
      },
      working: [`${tax ? 'Tax' : 'Dividends'} owed jar: Start + Charge − Paid = End`, `${w0(start)} + ${w0(charge)} − Paid = ${w0(end)}`, `Paid = ${w0(paid)}`],
      hints: { formula: 'The charge goes into the jar; payments come out.', inputs: 'Owed at start, the charge, owed at end.', answer: 'Start + charge − end.', decision: 'Is the statement about charges or cash?' },
      outcomes: {
        paid: { valueDelta: 500, news: 'Another jar ticked off.' },
        charge: { valueDelta: -1000, news: 'The statement is out by the change in the liability. Back to the jars.' },
      },
      cfoLine: `${tax ? 'Tax' : 'Dividends'} paid ${eur(paid)}${k}.`,
    };
  },
});

// ---------------------------------------------------------------- the whole statement

interface ScfP {
  open: number;
  op: number;
  dep: number;
  gain: number;
  prov: number;
  dInv: number;
  dRec: number;
  dPay: number;
  capex: number;
  proceeds: number;
  shares: number;
  premium: number;
  repay: number;
  interest: number;
  netProfit: number;
  adSold: number;
}

const scfBase: ScfP = {
  open: 30000,
  op: 30000,
  dep: 40000,
  gain: 10000,
  prov: 20000,
  dInv: 50000,
  dRec: 60000,
  dPay: 15000,
  capex: 70000,
  proceeds: 40000,
  shares: 40000,
  premium: 80000,
  repay: 40000,
  interest: 20000,
  netProfit: 10000,
  adSold: 20000,
};

const flowSections = [
  { id: 'op', label: 'Cash flows from operating activities', subtotal: 'Net cash from operating activities' },
  { id: 'inv', label: 'Cash flows from investing activities', subtotal: 'Net cash from investing activities' },
  { id: 'fin', label: 'Cash flows from financing activities', subtotal: 'Net cash from financing activities' },
];

export const scfFull = defineStatement<ScfP>({
  kind: 'statement',
  id: 'scf-full',
  title: 'Where did the money go?',
  host: 'aoife',
  concept: 'scf-layout',
  uses: ['indirect-method', 'working-capital', 'ofi'],
  base: scfBase,
  vary: (rng) => {
    const k = (lo: number, hi: number) => pickInt(rng, lo, hi, 1000);
    const op = k(10000, 60000);
    const interest = k(4000, Math.min(20000, op - 2000));
    return {
      open: k(10000, 50000),
      op,
      dep: k(10000, 50000),
      gain: k(2000, 12000),
      prov: k(0, 20000),
      dInv: k(-10000, 50000),
      dRec: k(-10000, 60000),
      dPay: k(-8000, 20000),
      capex: k(20000, 90000),
      proceeds: k(5000, 40000),
      shares: k(0, 50000),
      premium: k(0, 80000),
      repay: k(0, 40000),
      interest,
      netProfit: op - interest,
      adSold: k(5000, 25000),
    };
  },
  build: (p) => {
    const it = (id: string, label: string, amount: number, section: string, sign: 1 | -1, why: string, accept?: string[]): StatementItem => ({ id, label, amount, section, sign, why, accept });
    const wcItem = (id: string, name: string, d: number, asset: boolean) =>
      it(id, `${d >= 0 ? 'Increase' : 'Decrease'} in ${name}`, Math.abs(d), 'op', (asset ? (d >= 0 ? -1 : 1) : d >= 0 ? 1 : -1) as 1 | -1, asset ? (d >= 0 ? 'More cash tied up: deduct.' : 'Cash released: add.') : d >= 0 ? 'Cash kept back from suppliers: add.' : 'We paid suppliers more than we bought: deduct.');
    const items: StatementItem[] = [
      it('op', 'Operating profit', p.op, 'op', 1, 'The starting point of the indirect method.'),
      it('dep', 'Depreciation', p.dep, 'op', 1, 'Non-cash expense: add it back.'),
      it('gain', 'Gain on disposal of equipment', p.gain, 'op', -1, 'Non-cash gain inside profit: deduct it. The proceeds go in investing.'),
      ...(p.prov ? [it('prov', 'Increase in litigation provision', p.prov, 'op', 1, 'An expense with no cash paid yet: add it back.')] : []),
      wcItem('inv', 'inventory', p.dInv, true),
      wcItem('rec', 'trade debtors', p.dRec, true),
      wcItem('pay', 'trade creditors', p.dPay, false),
      it('capex', 'Investment in equipment', p.capex, 'inv', -1, 'Cash spent on long-term assets.'),
      it('proc', 'Proceeds from disposal of equipment', p.proceeds, 'inv', 1, 'Cash from selling a long-term asset.'),
      ...(p.shares ? [it('sh', 'Issue of share capital', p.shares, 'fin', 1, 'Money from owners.')] : []),
      ...(p.premium ? [it('prem', 'Share premium received', p.premium, 'fin', 1, 'Part of the same share issue: financing.')] : []),
      ...(p.repay ? [it('repay', 'Repayment of loans', p.repay, 'fin', -1, 'Paying back a lender.')] : []),
      it('int', 'Interest paid', p.interest, 'fin', -1, 'Cost of borrowing. Financing here; operating is also allowed if used consistently.', ['op']),
      it('np', 'Net profit for the year', p.netProfit, 'none', 1, 'Leave it out: we started from operating profit. Using both counts the year twice.'),
      it('adsold', 'Accumulated depreciation on equipment sold', p.adSold, 'none', 1, 'Leave it out: it’s a working for the depreciation jar, not a cash flow.'),
    ];
    const net = items.filter((x) => x.section !== 'none').reduce((s, x) => s + x.sign * x.amount, 0);
    const close = p.open + net;
    const opSum = items.filter((x) => x.section === 'op').reduce((s, x) => s + x.sign * x.amount, 0);
    const finSum = items.filter((x) => x.section === 'fin').reduce((s, x) => s + x.sign * x.amount, 0);
    const drained = opSum < 0;
    return {
      prompt: [
        { who: 'aoife', text: 'Before I renew the facility, I want to see the statement of cash flows. Not the profit. The cash.' },
        { who: 'margaux', text: `I’ve done the workings. Operating profit ${eur(p.op)}, depreciation ${eur(p.dep)}, a ${eur(p.gain)} gain on the old equipment, which sold for ${eur(p.proceeds)}. The rest is on the list.` },
        { who: 'margaux', text: `Cash was ${eur(p.open)} at the start. Put every line where it belongs.` },
      ],
      ask: 'Build the statement of cash flows, then find the net change in cash and the closing balance.',
      heading: 'Statement of cash flows for the year (€)',
      sections: flowSections,
      items,
      signed: true,
      totals: [
        { key: 'net', label: 'Net change in cash', calc: (s) => s.op + s.inv + s.fin, explain: 'Operating + investing + financing.' },
        { key: 'close', label: 'Cash at the end of the year', calc: (s) => p.open + s.op + s.inv + s.fin, explain: `Opening cash ${w0(p.open)} plus the net change.` },
      ],
      decision: {
        question: 'What does the statement tell Aoife?',
        options: [
          { id: 'drain', label: drained ? 'Trading used cash; new money and loans kept the house afloat' : 'Trading produced cash this year' },
          { id: 'opposite', label: drained ? 'Trading produced plenty of cash' : 'Trading used cash; the house survived on new money' },
        ],
        correct: 'drain',
        why: whys(
          `Operating cash was ${w0(opSum)} against an operating profit of ${w0(p.op)}; financing ${finSum >= 0 ? 'brought in' : 'took out'} ${w0(Math.abs(finSum))}.`,
          'Operating profit was positive, so operating cash must be too.',
          'The closing cash balance is all that matters to a bank.',
        ),
        correctWhy: 'w0',
        explain: drained
          ? `Operating cash was ${eur(opSum)}: working capital swallowed the profit. The cash ${net >= 0 ? 'rise' : 'position'} came from financing, which can’t go on for ever.`
          : `Operating cash of ${eur(opSum)} is real money from trading, which is what a lender wants to see.`,
      },
      working: [`Net change = ${w0(opSum)} + ${w0(items.filter((x) => x.section === 'inv').reduce((s, x) => s + x.sign * x.amount, 0))} + ${w0(finSum)} = ${w0(net)}`, `Closing cash = ${w0(p.open)} + ${w0(net)} = ${w0(close)}`],
      hints: {
        place: 'Start from operating profit; the non-cash items and working capital go with it. Long-term assets are investing; owners and lenders are financing. Two lines are workings, not cash flows.',
        sign: 'Cash in adds; cash out deducts. In operating, increases in debtors and inventory deduct; an increase in creditors adds.',
        subtotals: 'Add each section with its signs.',
        totals: 'Net change = the three subtotals added. Closing = opening + net change.',
        decision: 'Compare operating cash with operating profit, then look at financing.',
      },
      outcomes: {
        drain: { valueDelta: 4000, news: 'Aoife renews the facility, on condition of a monthly cash report.' },
        opposite: { valueDelta: -4000, news: 'Aoife isn’t convinced by the house’s reading of its own accounts. The facility is cut.' },
      },
    };
  },
});

// ---------------------------------------------------------------- the boss: a full statement with every working (€'000)

export interface FrostP {
  op: number;
  intRec: number;
  intPaid: number;
  taxCharge: number;
  taxOpen: number;
  taxClose: number;
  divDeclared: number;
  divOpen: number;
  divClose: number;
  costOpen: number;
  costClose: number;
  adOpen: number;
  adClose: number;
  soldCost: number;
  soldAd: number;
  proceeds: number;
  inv: [number, number];
  rec: [number, number];
  pay: [number, number];
  accr: [number, number];
  sc: [number, number];
  sp: [number, number];
  deb: [number, number];
  grant: [number, number];
  cce: [number, number];
}

/** The boss company's accounts (€'000). Matches the homework set exactly. */
export const FROST: FrostP = {
  op: 1890,
  intRec: 4,
  intPaid: 524,
  taxCharge: 170,
  taxOpen: 900,
  taxClose: 240,
  divDeclared: 500,
  divOpen: 200,
  divClose: 100,
  costOpen: 9000,
  costClose: 9900,
  adOpen: 3200,
  adClose: 4000,
  soldCost: 500,
  soldAd: 100,
  proceeds: 520,
  inv: [350, 1600],
  rec: [320, 1450],
  pay: [1300, 1520],
  accr: [120, 460],
  sc: [1500, 3000],
  sp: [100, 800],
  deb: [5650, 5025],
  grant: [0, 200],
  cce: [200, -5],
};

/** Net cash flow implied by a set of accounts: the figure every correctly built statement adds up to. */
export function frostNet(f: FrostP) {
  const dep = A.depreciationCharge(f.adOpen, f.adClose, f.soldAd);
  const gain = A.disposalGain(f.soldCost, f.soldAd, f.proceeds);
  const add = A.additions(f.costOpen, f.costClose, f.soldCost);
  const tax = A.liabilityPaid(f.taxOpen, f.taxCharge, f.taxClose);
  const div = A.liabilityPaid(f.divOpen, f.divDeclared, f.divClose);
  const wc = A.workingCapitalAdjustments({ inventory: f.inv, receivables: f.rec, payables: f.pay, accruals: f.accr });
  return (
    f.op + dep - gain + wc.inventory + wc.receivables + wc.payables + wc.accruals + f.intRec - f.intPaid - tax - div - add + f.proceeds +
    (f.sc[1] - f.sc[0]) + (f.sp[1] - f.sp[0]) + (f.deb[1] - f.deb[0]) + (f.grant[1] - f.grant[0])
  );
}

export const scfFrost = defineStatement<FrostP>({
  kind: 'statement',
  id: 'scf-frost',
  title: 'The whole thing, every working',
  host: 'idris',
  concept: 'scf-layout',
  uses: ['dep-charge', 'capex', 'disposal', 'liability-jars', 'cash-equivalents', 'interest-dividends'],
  base: FROST,
  vary: (rng) => {
    const j = (n: number) => Math.max(0, Math.round((n * (0.85 + rng() * 0.3)) / 5) * 5);
    const f = { ...FROST };
    f.op = j(FROST.op);
    f.intPaid = j(FROST.intPaid);
    f.taxCharge = j(FROST.taxCharge);
    f.divDeclared = j(FROST.divDeclared);
    f.proceeds = j(FROST.proceeds);
    f.inv = [FROST.inv[0], j(FROST.inv[1])];
    f.rec = [FROST.rec[0], j(FROST.rec[1])];
    f.costClose = j(FROST.costClose);
    f.adClose = f.adOpen - f.soldAd + j(900);
    // Keep the closing cash consistent with every other figure, so a correct statement always hits the target.
    f.cce = [FROST.cce[0], FROST.cce[0] + Math.round(frostNet(f))];
    return f;
  },
  build: (f) => {
    const dep = A.depreciationCharge(f.adOpen, f.adClose, f.soldAd);
    const gain = A.disposalGain(f.soldCost, f.soldAd, f.proceeds);
    const add = A.additions(f.costOpen, f.costClose, f.soldCost);
    const tax = A.liabilityPaid(f.taxOpen, f.taxCharge, f.taxClose);
    const div = A.liabilityPaid(f.divOpen, f.divDeclared, f.divClose);
    const wc = A.workingCapitalAdjustments({ inventory: f.inv, receivables: f.rec, payables: f.pay, accruals: f.accr });
    const it = (id: string, label: string, signed: number, section: string, why: string, accept?: string[]): StatementItem => ({ id, label, amount: Math.abs(signed), sign: signed >= 0 ? 1 : -1, section, why, accept });
    const items: StatementItem[] = [
      it('op', 'Operating profit', f.op, 'op', 'The starting point.'),
      it('dep', 'Depreciation (W1)', dep, 'op', `Accumulated depreciation jar: ${w0(f.adClose)} − ${w0(f.adOpen)} + ${w0(f.soldAd)} = ${w0(dep)}. Add back.`),
      it('gain', gain >= 0 ? 'Gain on disposal (W2)' : 'Loss on disposal (W2)', -gain, 'op', `Proceeds ${w0(f.proceeds)} − carrying amount ${w0(f.soldCost - f.soldAd)} = ${w0(gain)}. ${gain >= 0 ? 'Deduct the gain' : 'Add back the loss'}.`),
      it('inv', 'Increase in inventory', wc.inventory, 'op', `${w0(f.inv[1])} − ${w0(f.inv[0])}: cash tied up in stock.`),
      it('rec', 'Increase in trade receivables', wc.receivables, 'op', `${w0(f.rec[1])} − ${w0(f.rec[0])}: sales not yet collected.`),
      it('pay', 'Increase in trade payables', wc.payables, 'op', `${w0(f.pay[1])} − ${w0(f.pay[0])}: cash kept back.`),
      it('accr', 'Increase in accruals', wc.accruals, 'op', `${w0(f.accr[1])} − ${w0(f.accr[0])}: expenses not yet paid.`),
      it('intr', 'Interest received', f.intRec, 'op', 'Operating in this layout; investing is also allowed.', ['inv']),
      it('intp', 'Interest paid', -f.intPaid, 'op', 'Operating in this layout; financing is also allowed.', ['fin']),
      it('tax', 'Tax paid (W7)', -tax, 'op', `Tax jar: ${w0(f.taxOpen)} + ${w0(f.taxCharge)} − ${w0(f.taxClose)} = ${w0(tax)}.`),
      it('div', 'Dividends paid (W8)', -div, 'op', `Dividends jar: ${w0(f.divOpen)} + ${w0(f.divDeclared)} − ${w0(f.divClose)} = ${w0(div)}. Operating in this layout; financing is also allowed.`, ['fin']),
      it('add', 'Purchase of property, plant and equipment (W9)', -add, 'inv', `Cost jar: ${w0(f.costClose)} − ${w0(f.costOpen)} + ${w0(f.soldCost)} = ${w0(add)}.`),
      it('proc', 'Proceeds from sale of equipment', f.proceeds, 'inv', 'Cash from selling a long-term asset.'),
      it('sc', 'Issue of ordinary share capital', f.sc[1] - f.sc[0], 'fin', `${w0(f.sc[1])} − ${w0(f.sc[0])}.`),
      it('sp', 'Share premium received', f.sp[1] - f.sp[0], 'fin', `${w0(f.sp[1])} − ${w0(f.sp[0])}.`),
      it('deb', 'Repayment of debentures', f.deb[1] - f.deb[0], 'fin', `${w0(f.deb[0])} − ${w0(f.deb[1])} repaid.`),
      it('grant', 'Government grant received', f.grant[1] - f.grant[0], 'fin', 'Cash received from the grant, treated as financing here.'),
      it('pat', 'Profit after tax', f.op + f.intRec - f.intPaid - f.taxCharge, 'none', 'Leave it out: we started from operating profit.'),
      it('stinv', 'Increase in short-term investments', 400, 'none', 'Leave it out: the deposit is a cash equivalent, so it’s inside the target, not a cash flow.'),
      it('od', 'Increase in bank overdraft', 580, 'none', 'Leave it out: the overdraft is part of cash and cash equivalents.'),
    ];
    const net = items.filter((x) => x.section !== 'none').reduce((s, x) => s + x.sign * x.amount, 0);
    const target = f.cce[1] - f.cce[0];
    return {
      prompt: [
        { who: 'idris', mood: 'happy', text: 'A frozen-dessert maker wants me to buy in. “Profitable, growing, cash-rich,” says the brochure.' },
        { who: 'margaux', text: 'Brochures say a lot of things. I’ve done all the workings from their two balance sheets. Figures are in thousands of euro.' },
        { who: 'margaux', text: `The deposit was opened on 16 November and matured on 15 February: three months, so it’s a cash equivalent. Cash and cash equivalents went from ${w0(f.cce[0])} to ${w0(f.cce[1])}. That’s the target.` },
        { who: 'idris', text: 'Interest, tax and dividends all in operating, please. It’s how their accountant does it.' },
      ],
      ask: `Build their statement of cash flows (€’000). It should explain the change in cash and cash equivalents of ${w0(target)}.`,
      heading: 'Statement of cash flows (€’000)',
      data: table('Their balance sheets (€’000)', ['', 'Start', 'End'], [
        ['PPE at cost', w0(f.costOpen), w0(f.costClose)],
        ['Accumulated depreciation', `(${w0(f.adOpen)})`, `(${w0(f.adClose)})`],
        ['Inventory', w0(f.inv[0]), w0(f.inv[1])],
        ['Trade receivables', w0(f.rec[0]), w0(f.rec[1])],
        ['Trade payables', w0(f.pay[0]), w0(f.pay[1])],
        ['Accruals', w0(f.accr[0]), w0(f.accr[1])],
        ['Corporation tax owed', w0(f.taxOpen), w0(f.taxClose)],
        ['Dividends owed', w0(f.divOpen), w0(f.divClose)],
        ['Ordinary share capital', w0(f.sc[0]), w0(f.sc[1])],
        ['Share premium', w0(f.sp[0]), w0(f.sp[1])],
        ['10% debentures', w0(f.deb[0]), w0(f.deb[1])],
        ['Government grant', w0(f.grant[0]), w0(f.grant[1])],
        ['Cash and cash equivalents', w0(f.cce[0]), w0(f.cce[1])],
      ], undefined, `Operating profit ${w0(f.op)}; interest received ${w0(f.intRec)}, paid ${w0(f.intPaid)}; tax charge ${w0(f.taxCharge)}; dividends declared ${w0(f.divDeclared)}. Equipment sold: cost ${w0(f.soldCost)}, accumulated depreciation ${w0(f.soldAd)}, proceeds ${w0(f.proceeds)}.`),
      sections: flowSections,
      items,
      signed: true,
      totals: [
        { key: 'net', label: 'Net change in cash and cash equivalents (€’000)', calc: (s) => s.op + s.inv + s.fin, explain: `Should match the target of ${w0(target)}.` },
      ],
      decision: {
        question: 'Is the brochure’s “cash-rich” fair?',
        options: [
          { id: 'no', label: 'No: operating cash was negative and the cash pile shrank' },
          { id: 'yes', label: 'Yes: it raised plenty of cash' },
        ],
        correct: 'no',
        why: whys(
          'Stock and receivables soaked up more than the profit; shares and a grant paid for the rest.',
          'A profitable company is cash-rich by definition.',
          'The overdraft counts as cash, so cash went up.',
        ),
        correctWhy: 'w0',
        explain: 'Operating profit was strong, but inventory and receivables more than quadrupled. Trading burned cash, and the cash that came in was from new shares and a grant. Cash and cash equivalents ended below zero.',
      },
      working: [
        `W1 Depreciation = ${w0(f.adClose)} − ${w0(f.adOpen)} + ${w0(f.soldAd)} = ${w0(dep)}`,
        `W2 Gain = ${w0(f.proceeds)} − (${w0(f.soldCost)} − ${w0(f.soldAd)}) = ${w0(gain)}`,
        `W7 Tax paid = ${w0(f.taxOpen)} + ${w0(f.taxCharge)} − ${w0(f.taxClose)} = ${w0(tax)}`,
        `W8 Dividends paid = ${w0(f.divOpen)} + ${w0(f.divDeclared)} − ${w0(f.divClose)} = ${w0(div)}`,
        `W9 Additions = ${w0(f.costClose)} − ${w0(f.costOpen)} + ${w0(f.soldCost)} = ${w0(add)}`,
        `Net change = ${w0(net)}; target ${w0(target)}`,
      ],
      hints: {
        place: 'Interest, tax and dividends go in operating here, as Idris asked. The short-term deposit and the overdraft are inside cash and cash equivalents, so they aren’t cash flows.',
        sign: 'Payments are deductions. Increases in inventory and receivables deduct; increases in payables and accruals add. The debentures went down: repaid.',
        subtotals: 'Operating has eleven lines. Take care with the signs.',
        totals: 'Add the three sections. It should match the target.',
        decision: 'Look at the operating subtotal, then at where the inflows came from.',
      },
      outcomes: {
        no: { valueDelta: 6000, news: 'Idris passes on the dessert maker. Six months later it’s looking for a rescue buyer.' },
        yes: { valueDelta: -8000, news: 'Idris buys in. By spring the dessert maker is asking its shareholders for more cash.' },
      },
    };
  },
});

export const ACT4_PROBLEMS: Problem[] = [cashOrProfit, ofiSort, interestChoice, wcSigns, cashCollected, cceChange, fcfProblem, cfoIndirect, depJar, additionsJar, disposalCalc, liabilityPaid, scfFull, scfFrost];
