// Chapter VII problems: the Christmas cash budget.
import * as A from '../engine/accounting';
import { eur } from '../engine/format';
import { pickInt, pickOne } from '../engine/rng';
import type { BriefProblem, Problem } from '../engine/types';
import { defineCalc, defineGrid, table, w0, whys } from './helpers';

interface RecP {
  inMonth: number;
  sales: [number, number];
  months: [string, string];
}

export const receiptsCalc = defineCalc<RecP>({
  kind: 'calc',
  id: 'receipts-month',
  title: 'When does the money arrive?',
  host: 'margaux',
  concept: 'receipts-timing',
  base: { inMonth: 40, sales: [70000, 95000], months: ['November', 'December'] },
  vary: (rng) => ({ inMonth: pickOne(rng, [20, 30, 40, 50, 60]), sales: [pickInt(rng, 20000, 120000, 5000), pickInt(rng, 20000, 120000, 5000)], months: pickOne(rng, [['November', 'December'], ['February', 'March'], ['August', 'September']] as const).slice() as [string, string] }),
  build: ({ inMonth, sales, months }) => {
    const later = 100 - inMonth;
    const got = A.receipts(sales, [inMonth / 100, later / 100])[1];
    return {
      prompt: [`Boutiques pay ${inMonth}% in the month of sale and ${later}% the month after. Sales are ${eur(sales[0])} in ${months[0]} and ${eur(sales[1])} in ${months[1]}.`],
      ask: `How much cash comes in from customers in ${months[1]}?`,
      formula: { options: ['receipts', 'receipts-sales', 'jar-end'], correct: 'receipts', explain: `Part of ${months[1]}’s sales, plus the rest of ${months[0]}’s.` },
      inputs: [
        { key: 'A', symbol: '\\text{This month}', label: `${inMonth}% of ${months[1]}’s sales`, unit: 'eur', expected: (sales[1] * inMonth) / 100, explain: `${inMonth}% × ${w0(sales[1])}.` },
        { key: 'B', symbol: '\\text{Last month}', label: `${later}% of ${months[0]}’s sales`, unit: 'eur', expected: (sales[0] * later) / 100, explain: `${later}% × ${w0(sales[0])}.` },
      ],
      solve: (v) => v.A + v.B,
      answer: { label: `Receipts in ${months[1]}`, unit: 'eur', explain: `${w0((sales[1] * inMonth) / 100)} + ${w0((sales[0] * later) / 100)} = ${w0(got)}.` },
      decision: {
        question: `Theo budgets ${months[1]}’s receipts as ${eur(sales[1])}. Fine?`,
        options: [
          { id: 'no', label: `No: ${eur(got)}` },
          { id: 'yes', label: 'Yes' },
        ],
        correct: 'no',
        why: whys('Receipts follow the credit terms, not the sales month.', 'Sales are cash in the month they’re made.', 'It evens out, so it doesn’t matter.'),
        correctWhy: 'w0',
        explain: `${eur(got)} arrives in ${months[1]}; the rest of ${months[1]}’s sales arrives next month.`,
      },
      working: [`${months[1]} receipts = ${inMonth}% × ${w0(sales[1])} + ${later}% × ${w0(sales[0])}`, `= ${w0((sales[1] * inMonth) / 100)} + ${w0((sales[0] * later) / 100)} = €${w0(got)}`],
      hints: { formula: 'Two months’ sales feed this month’s cash.', answer: 'Add the two parts.' },
      outcomes: { no: { valueDelta: 500, news: 'The cash budget uses the right receipts.' }, yes: { valueDelta: -1000, news: 'The cash budget is too rosy by a whole month of credit.' } },
      cfoLine: `${months[1]} receipts ${eur(got)}.`,
    };
  },
});

interface BudP {
  open: number;
  prevSales: number;
  sales: number[];
  inMonth: number;
  prevPurch: number;
  purch: number[];
  wages: number;
  rent: number;
  machine: number;
  machineMonth: number;
}

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

export const xmasBudget = defineGrid<BudP>({
  kind: 'grid',
  id: 'xmas-budget',
  title: 'The Christmas crunch',
  host: 'aoife',
  concept: 'cash-budget',
  base: { open: 25000, prevSales: 40000, sales: [45000, 70000, 95000, 30000, 35000, 50000], inMonth: 40, prevPurch: 30000, purch: [40000, 50000, 20000, 15000, 25000, 25000], wages: 20000, rent: 9000, machine: 30000, machineMonth: 1 },
  vary: (rng) => {
    const s = (lo: number, hi: number) => pickInt(rng, lo, hi, 5000);
    return { open: s(5000, 40000), prevSales: s(30000, 60000), sales: [s(40000, 60000), s(60000, 90000), s(80000, 120000), s(20000, 40000), s(25000, 45000), s(35000, 60000)], inMonth: pickOne(rng, [30, 40, 50]), prevPurch: s(20000, 40000), purch: [s(30000, 50000), s(40000, 60000), s(15000, 30000), s(10000, 20000), s(15000, 30000), s(20000, 30000)], wages: s(15000, 25000), rent: s(5000, 12000), machine: s(15000, 40000), machineMonth: pickInt(rng, 0, 2) };
  },
  build: (p) => {
    const later = 100 - p.inMonth;
    const rec = A.receipts(p.sales, [p.inMonth / 100, later / 100], [(p.prevSales * later) / 100]);
    const payTrue = A.laggedPayments(p.purch, 1, [p.prevPurch]);
    const rentRow = MONTHS.map((_, i) => (i === 0 || i === 3 ? p.rent : 0));
    const machRow = MONTHS.map((_, i) => (i === p.machineMonth ? p.machine : 0));
    const wagesRow = MONTHS.map(() => p.wages);
    const totalPay = MONTHS.map((_, i) => payTrue[i] + p.wages + rentRow[i] + machRow[i]);
    const net = MONTHS.map((_, i) => rec[i] - totalPay[i]);
    const bal = A.runningBalance(p.open, net);
    const low = Math.min(...bal.close);
    const lowMonth = MONTHS[bal.close.indexOf(low)];
    const needOd = low < 0;
    const cum = (n: number[]) => n.map((_, i) => p.open + n.slice(0, i).reduce((a, b) => a + b, 0));
    return {
      prompt: [
        { who: 'aoife', text: 'Christmas is your busiest season. It’s also when I get the most panicked phone calls. Show me a cash budget, October to March.' },
        { who: 'margaux', text: `Boutiques pay ${p.inMonth}% in the month of sale and ${later}% the month after. We pay for fabric the month after we buy it. Wages ${eur(p.wages)} a month, rent ${eur(p.rent)} each quarter (October and January), and the new machine ${eur(p.machine)} in ${MONTHS[p.machineMonth]}. We start with ${eur(p.open)} in the bank.` },
      ],
      ask: 'Fill the cash budget. In which month is the balance lowest, and do we need an overdraft?',
      data: table('Plan (€)', ['', 'Sep', ...MONTHS], [
        ['Sales', w0(p.prevSales), ...p.sales.map(w0)],
        ['Fabric bought', w0(p.prevPurch), ...p.purch.map(w0)],
      ]),
      columns: MONTHS,
      unitLabel: '€',
      rows: [
        { key: 'sales', label: 'Sales', given: true, hint: '', explain: '', calc: () => p.sales },
        {
          key: 'rec',
          label: 'Receipts from customers',
          hint: `${p.inMonth}% of this month’s sales + ${later}% of last month’s. October includes ${later}% of September’s ${w0(p.prevSales)}.`,
          explain: `${p.inMonth}% of this month + ${later}% of last month. October: ${p.inMonth}% × ${w0(p.sales[0])} + ${later}% × ${w0(p.prevSales)} = ${w0(rec[0])}.`,
          concept: 'receipts-timing',
          calc: (r) => A.receipts(r.sales ?? p.sales, [p.inMonth / 100, later / 100], [(p.prevSales * later) / 100]),
        },
        { key: 'sup', label: 'Payments to suppliers', hint: 'Last month’s fabric purchases. October pays for September’s.', explain: `Each month pays the month before’s purchases; October pays September’s ${w0(p.prevPurch)}.`, calc: () => payTrue },
        { key: 'wages', label: 'Wages', given: true, hint: '', explain: '', calc: () => wagesRow },
        { key: 'rent', label: 'Rent', given: true, hint: '', explain: '', calc: () => rentRow },
        { key: 'mach', label: 'New machine', given: true, hint: '', explain: '', calc: () => machRow },
        { key: 'tot', label: 'Total payments', total: true, hint: 'Suppliers + wages + rent + machine.', explain: 'Add every payment in the month.', calc: (r) => MONTHS.map((_, i) => (r.sup?.[i] ?? 0) + (r.wages?.[i] ?? 0) + (r.rent?.[i] ?? 0) + (r.mach?.[i] ?? 0)) },
        { key: 'net', label: 'Net cash flow', total: true, hint: 'Receipts − total payments. Negative if more goes out.', explain: 'Receipts less total payments.', calc: (r) => MONTHS.map((_, i) => (r.rec?.[i] ?? 0) - (r.tot?.[i] ?? 0)) },
        { key: 'open', label: 'Opening balance', cells: [1, 2, 3, 4, 5], hint: 'Last month’s closing balance.', explain: `October opens at ${w0(p.open)}; each month opens with last month’s close.`, calc: (r) => cum(r.net ?? net) },
        { key: 'close', label: 'Closing balance', total: true, hint: 'Opening + net cash flow.', explain: 'Opening balance plus net cash flow.', calc: (r) => MONTHS.map((_, i) => (r.open?.[i] ?? 0) + (r.net?.[i] ?? 0)) },
      ],
      decision: {
        question: 'What do we tell Aoife?',
        options: [
          { id: 'od', label: needOd ? `We need an overdraft of about ${eur(Math.ceil(-low / 1000) * 1000)}, peaking in ${lowMonth}` : 'We need an overdraft for December' },
          { id: 'none', label: needOd ? 'We stay in credit all season' : `We stay in credit all season; lowest point ${eur(low)} in ${lowMonth}` },
        ],
        correct: needOd ? 'od' : 'none',
        why: whys(
          needOd ? `The balance goes negative, reaching ${w0(low)} in ${lowMonth}, before the Christmas receipts arrive.` : 'The closing balance never goes below zero.',
          'December’s sales are the biggest, so December’s cash is the best.',
          'Profit is high, so cash is fine.',
        ),
        correctWhy: 'w0',
        explain: needOd
          ? `Christmas sales arrive a month late, but the fabric and the machine are paid for first. The balance bottoms out at ${eur(low)} in ${lowMonth}. Arrange the overdraft now, or move the machine to a later month.`
          : `The lowest balance is ${eur(low)} in ${lowMonth}. Tight, but in credit.`,
      },
      working: [`Receipts: ${rec.map(w0).join(', ')}`, `Total payments: ${totalPay.map(w0).join(', ')}`, `Closing: ${bal.close.map(w0).join(', ')}`, `Lowest: ${w0(low)} in ${lowMonth}`],
      outcomes: {
        od: { valueDelta: needOd ? 4000 : -1000, news: needOd ? 'Aoife sets up the overdraft in October. In November nobody panics.' : 'An overdraft is arranged and never used. A small fee wasted.' },
        none: { valueDelta: needOd ? -6000 : 1000, news: needOd ? 'A wages payment bounces in late November. Aoife is not amused.' : 'Christmas comes and goes; the bank balance never dips below zero.' },
      },
    };
  },
});

export const budgetBenefits: BriefProblem = {
  kind: 'brief',
  id: 'budget-benefits',
  title: 'Why bother with a budget?',
  host: 'theo',
  concept: 'budget-purpose',
  prompt: [{ who: 'theo', text: 'Budgets are a waste of a week. We’ll sell what we sell. Why do we need one?' }],
  question: 'Describe four benefits of preparing a regular budget in an organisation.',
  cards: [
    { text: 'Planning: it makes managers think ahead about sales, costs and cash, so problems like a cash shortfall are spotted early.', kind: 'key', why: 'The first benefit, with its reason.' },
    { text: 'Co-ordination: different departments work to the same set of numbers, so purchasing, production and sales line up.', kind: 'key', why: 'Joins up the business.' },
    { text: 'Communication: everyone knows what’s expected of them and what resources they have.', kind: 'key', why: 'Spreads the plan.' },
    { text: 'Motivation: realistic targets give managers something to aim for.', kind: 'key', why: 'Targets drive effort.' },
    { text: 'Control: actual results are compared with the budget each month, and variances are investigated and acted on.', kind: 'key', why: 'Links to variance analysis.' },
    { text: 'Performance evaluation: managers can be judged against agreed targets.', kind: 'key', why: 'A basis for appraisal.' },
    { text: 'A budget guarantees the business will hit its profit target.', kind: 'trap', why: 'It’s a plan, not a guarantee.' },
    { text: 'Budgets are the same as the audited accounts.', kind: 'trap', why: 'Budgets look forward; accounts look back.' },
  ],
  model:
    'A regular budget brings several benefits. It forces planning: managers must think ahead about sales, costs and cash, so problems such as a seasonal cash shortfall are spotted in time. It co-ordinates the business, because every department works to the same figures. It communicates expectations and resources to the people responsible. It motivates, provided the targets are realistic. And it enables control and performance evaluation: actual results are compared with the budget each month, variances are investigated, and managers can be judged against agreed targets.',
};

export const ACT7_PROBLEMS: Problem[] = [receiptsCalc, xmasBudget, budgetBenefits];
