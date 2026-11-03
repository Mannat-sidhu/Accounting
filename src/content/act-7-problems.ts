// Chapter VII problems: budgeting. The six-month cash budget is the course's own example; the Christmas budget is the house's.
import * as A from '../engine/accounting';
import { eur } from '../engine/format';
import { pickInt, pickOne } from '../engine/rng';
import type { BriefProblem, ClassifyProblem, Problem } from '../engine/types';
import { defineCalc, defineGrid, table, w0, w2, whys } from './helpers';

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
  cap: 4,
  cards: [
    { text: 'Planning: it makes managers think ahead about how conditions might change, so problems such as a seasonal cash shortfall are spotted before they arise.', kind: 'key', why: 'Compels planning and forward thinking.' },
    { text: 'Co-ordination: different departments work to the same numbers, so purchasing, production and sales line up.', kind: 'key', why: 'Joins up the business.' },
    { text: 'Communication: everyone knows what part they play and who is accountable for it.', kind: 'key', why: 'Spreads the plan and fixes responsibility.' },
    { text: 'Motivation: managers who help set realistic targets have something to aim for.', kind: 'key', why: 'Participation and a challenge motivate.' },
    { text: 'Control: actual results are compared with the budget, and the big variances are investigated (management by exception).', kind: 'key', why: 'Directs attention where it’s needed.' },
    { text: 'Authorisation: the budget sets what each manager may spend, so spending is approved in advance.', kind: 'key', why: 'A system of authorisation.' },
    { text: 'Performance evaluation: managers can be judged against agreed targets.', kind: 'key', why: 'A framework for appraisal.' },
    { text: 'A budget guarantees the business will hit its profit target.', kind: 'trap', why: 'It’s a plan, not a guarantee.' },
    { text: 'Budgets are the same as the audited accounts.', kind: 'trap', why: 'Budgets look forward; accounts look back.' },
  ],
  model:
    'A regular budget brings several benefits. First, planning: managers must think ahead about how conditions might change, so problems such as a seasonal cash shortfall are spotted before they arise. Second, co-ordination and communication: every department works to the same figures, and everyone knows their part and who is accountable. Third, motivation: realistic targets, ideally set with managers’ participation, give them something to aim for. Fourth, control: actual results are compared with the budget each month and the large variances are investigated, which directs management attention to where it is needed. The budget also authorises spending and gives a basis for evaluating managers’ performance.',
};

// ---------------------------------------------------------------- the course's own six-month cash budget

interface SlideCbP {
  open: number;
  rec: number[];
  pay: number[];
  sal: number;
  elec: number[];
  oh: number;
  van: number[];
}

const HALF = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export const slideCashBudget = defineGrid<SlideCbP>({
  kind: 'grid',
  id: 'slide-cash-budget',
  title: 'Six months of cash',
  host: 'aoife',
  concept: 'cash-budget',
  base: { open: 12, rec: [60, 52, 55, 55, 60, 55], pay: [30, 30, 31, 26, 35, 31], sal: 10, elec: [0, 0, 14, 0, 0, 9], oh: 2, van: [0, 0, 11, 0, 0, 0] },
  vary: (rng) => {
    const vanMonth = pickInt(rng, 0, 5);
    const e1 = pickInt(rng, 8, 16);
    const e2 = pickInt(rng, 6, 12);
    return {
      open: pickInt(rng, 4, 25),
      rec: HALF.map(() => pickInt(rng, 40, 70)),
      pay: HALF.map(() => pickInt(rng, 22, 38)),
      sal: pickInt(rng, 8, 12),
      elec: [0, 0, e1, 0, 0, e2],
      oh: pickInt(rng, 1, 3),
      van: HALF.map((_, i) => (i === vanMonth ? pickInt(rng, 8, 14) : 0)),
    };
  },
  build: (p) => {
    const tot = HALF.map((_, i) => p.pay[i] + p.sal + p.elec[i] + p.oh + p.van[i]);
    const surplus = HALF.map((_, i) => p.rec[i] - tot[i]);
    const bal = A.runningBalance(p.open, surplus);
    const low = Math.min(...bal.close);
    const lowMonth = HALF[bal.close.indexOf(low)];
    const needOd = low < 0;
    const thin = !needOd && low < 0.5 * Math.max(...tot);
    const cum = (n: number[]) => n.map((_, i) => p.open + n.slice(0, i).reduce((a, b) => a + b, 0));
    const vanMonth = HALF[p.van.findIndex((v) => v > 0)];
    return {
      prompt: [
        { who: 'aoife', text: 'Before I renew the facility I want a cash budget for the first half of the year: month by month, with every payment in it.' },
        { who: 'margaux', text: `Figures in €000. We start January with ${w0(p.open)} in the bank. Receipts come from the receivables budget. Payables, salaries, other overheads and the electricity bills are in the table, and we’re buying a van in ${vanMonth}.` },
      ],
      ask: 'Complete the cash budget. Is there a month where we’d need an overdraft?',
      columns: HALF,
      unitLabel: '€000',
      rows: [
        { key: 'rec', label: 'Receipts from receivables', given: true, hint: '', explain: '', calc: () => p.rec },
        { key: 'pay', label: 'Payables', given: true, hint: '', explain: '', calc: () => p.pay },
        { key: 'sal', label: 'Salaries and wages', given: true, hint: '', explain: '', calc: () => HALF.map(() => p.sal) },
        { key: 'elec', label: 'Electricity', given: true, hint: '', explain: '', calc: () => p.elec },
        { key: 'oh', label: 'Other overheads', given: true, hint: '', explain: '', calc: () => HALF.map(() => p.oh) },
        { key: 'van', label: 'Van purchase', given: true, hint: '', explain: '', calc: () => p.van },
        {
          key: 'tot',
          label: 'Total payments',
          total: true,
          hint: 'Add every payment line in the month: payables, salaries, electricity, overheads, van.',
          explain: 'Payables + salaries + electricity + overheads + the van, month by month.',
          calc: (r) => HALF.map((_, i) => (r.pay?.[i] ?? 0) + (r.sal?.[i] ?? 0) + (r.elec?.[i] ?? 0) + (r.oh?.[i] ?? 0) + (r.van?.[i] ?? 0)),
        },
        { key: 'surplus', label: 'Cash surplus / (shortfall)', total: true, hint: 'Receipts less total payments. Negative if more goes out.', explain: 'Receipts − total payments.', calc: (r) => HALF.map((_, i) => (r.rec?.[i] ?? 0) - (r.tot?.[i] ?? 0)) },
        { key: 'open', label: 'Opening balance', cells: [1, 2, 3, 4, 5], hint: 'Last month’s closing balance.', explain: `January opens at ${w0(p.open)}; every other month opens with last month’s close.`, calc: (r) => cum(r.surplus ?? surplus) },
        { key: 'close', label: 'Closing balance', total: true, hint: 'Opening balance plus the month’s surplus or shortfall.', explain: 'Opening balance + surplus (or − shortfall).', calc: (r) => HALF.map((_, i) => (r.open?.[i] ?? 0) + (r.surplus?.[i] ?? 0)) },
      ],
      decision: {
        question: 'Will the business need an overdraft in these six months?',
        options: [
          { id: 'od', label: needOd ? `Yes, in ${lowMonth}` : 'Yes' },
          { id: 'ok', label: 'No' },
        ],
        correct: needOd ? 'od' : 'ok',
        why: whys(
          needOd ? `The balance goes negative in ${lowMonth}: ${w0(low)}.` : `The balance never falls below ${w0(low)}, in ${lowMonth}.`,
          'Receipts are bigger than payments in most months, so it can’t go negative.',
          'Profit is positive, so cash must be too.',
          `The lowest balance, ${w0(low)} in ${lowMonth}, is thin against a month’s payments, so a standby facility is prudent.`,
        ),
        correctWhy: 'w0',
        alsoAccept: thin ? [{ option: 'od', why: 'w3', score: 1.5, note: 'A sensible commercial instinct: a standby overdraft costs little and a thin balance is risky. On the numbers it isn’t needed, so not full marks.' }] : undefined,
        explain: needOd
          ? `The balance bottoms out at ${w0(low)} in ${lowMonth}. Arrange the overdraft now, or move the van purchase.`
          : `The lowest balance is ${w0(low)} in ${lowMonth}: in credit all the way, though ${thin ? 'not by much' : 'comfortably'}.`,
      },
      working: [`Total payments: ${tot.map(w0).join(', ')}`, `Surplus/(shortfall): ${surplus.map(w0).join(', ')}`, `Closing balance: ${bal.close.map(w0).join(', ')}`],
      outcomes: {
        od: { valueDelta: needOd ? 3000 : thin ? 500 : -1000, news: needOd ? 'The overdraft is agreed before the van arrives. Nobody panics.' : 'A small facility is agreed as a precaution.' },
        ok: { valueDelta: needOd ? -5000 : 1000, news: needOd ? `A payment bounces in ${lowMonth}. Aoife is not amused.` : 'The first half-year passes with the balance always in credit.' },
      },
    };
  },
});

// ---------------------------------------------------------------- production and purchases

interface PurchP {
  sales: number;
  openFG: number;
  closeFG: number;
  usage: number;
  openRM: number;
  closeRM: number;
}

export const purchasesBudget = defineCalc<PurchP>({
  kind: 'calc',
  id: 'purchases-budget',
  title: 'How much silk do we order?',
  host: 'margaux',
  concept: 'operating-budgets',
  uses: ['budget-process'],
  base: { sales: 5000, openFG: 400, closeFG: 600, usage: 3, openRM: 1500, closeRM: 1200 },
  vary: (rng) => {
    const openFG = pickInt(rng, 200, 800, 100);
    let closeFG = pickInt(rng, 200, 900, 100);
    if (closeFG === openFG) closeFG += 100;
    return { sales: pickInt(rng, 2000, 9000, 100), openFG, closeFG, usage: pickOne(rng, [2, 2.5, 3, 4]), openRM: pickInt(rng, 500, 3000, 100), closeRM: pickInt(rng, 500, 3000, 100) };
  },
  build: ({ sales, openFG, closeFG, usage, openRM, closeRM }) => {
    const prod = sales + closeFG - openFG;
    const need = prod * usage;
    const buy = need + closeRM - openRM;
    const dir = closeFG > openFG ? 'more' : closeFG < openFG ? 'fewer' : 'same';
    return {
      prompt: [
        `The sales budget says we’ll sell ${w0(sales)} scarves. We hold ${w0(openFG)} finished scarves now and want ${w0(closeFG)} at the end of the year. Each scarf uses ${usage} metres of silk.`,
        `We have ${w0(openRM)} metres of silk in the stockroom and want ${w0(closeRM)} metres at the end of the year.`,
      ],
      ask: 'How many metres of silk must the purchases budget allow for?',
      data: table('Budget inputs', ['', 'Opening', 'Closing'], [
        ['Finished scarves (units)', w0(openFG), w0(closeFG)],
        ['Silk (metres)', w0(openRM), w0(closeRM)],
        [`Sales budget ${w0(sales)} units; ${usage} m of silk per scarf`],
      ]),
      spot: {
        question: 'Which budgets feed the silk purchases budget?',
        options: [
          { id: 'sales', label: 'The sales budget' },
          { id: 'prod', label: 'The production budget' },
          { id: 'fg', label: 'The finished-stock budget' },
          { id: 'rm', label: 'The materials-stock budget' },
          { id: 'cash', label: 'The cash budget' },
          { id: 'capex', label: 'The capital expenditure budget' },
        ],
        correct: ['sales', 'prod', 'fg', 'rm'],
        explain: 'Sales drive production (with the change in finished stock), production drives materials needed, and the materials-stock budget adjusts what we buy. The cash budget comes after the purchases budget, not before.',
      },
      formula: { options: ['purchases-budget', 'purchases-sales-usage', 'production-only'], correct: 'purchases-budget', explain: 'Both stock jars move what we produce and what we buy.' },
      stepNames: { spot: 'Which budgets feed it?', formula: 'Pick the method' },
      inputs: [
        { key: 'S', symbol: '\text{Sales}', label: 'Sales budget (units)', unit: 'count', expected: sales, explain: `${w0(sales)}.` },
        { key: 'F', symbol: '\text{Closing FG}', label: 'Closing finished stock (units)', unit: 'count', expected: closeFG, explain: `${w0(closeFG)}.` },
        { key: 'G', symbol: '\text{Opening FG}', label: 'Opening finished stock (units)', unit: 'count', expected: openFG, explain: `${w0(openFG)}.` },
        { key: 'U', symbol: '\text{Usage}', label: 'Silk per scarf (metres)', unit: 'number', expected: usage, explain: `${usage} metres.` },
        { key: 'R', symbol: '\text{Closing RM}', label: 'Closing silk stock (metres)', unit: 'count', expected: closeRM, explain: `${w0(closeRM)}.` },
        { key: 'O', symbol: '\text{Opening RM}', label: 'Opening silk stock (metres)', unit: 'count', expected: openRM, explain: `${w0(openRM)}.` },
      ],
      solve: (v) => (v.S + v.F - v.G) * v.U + v.R - v.O,
      answer: { label: 'Silk to buy (metres)', unit: 'count', tolerance: 1, explain: `Production ${w0(sales)} + ${w0(closeFG)} − ${w0(openFG)} = ${w0(prod)} scarves; × ${usage} = ${w2(need)} m; + ${w0(closeRM)} − ${w0(openRM)} = ${w2(buy)} m.` },
      decision: {
        question: 'Will we make more or fewer scarves than we sell?',
        options: [
          { id: 'more', label: 'More' },
          { id: 'fewer', label: 'Fewer' },
          { id: 'same', label: 'The same' },
        ],
        correct: dir,
        why: whys(
          dir === 'more' ? 'We’re building up finished stock, so production must cover sales plus the increase.' : dir === 'fewer' ? 'We’re running stock down, so we can sell some of what we already hold.' : 'Stock is unchanged, so production equals sales.',
          'Production always equals sales.',
          'Production depends only on materials stock.',
        ),
        correctWhy: 'w0',
        explain: `Production is ${w0(prod)} against sales of ${w0(sales)}, because finished stock goes from ${w0(openFG)} to ${w0(closeFG)}.`,
      },
      working: ['Production = sales + closing FG − opening FG', `= ${w0(sales)} + ${w0(closeFG)} − ${w0(openFG)} = ${w0(prod)} units`, `Materials needed = ${w0(prod)} × ${usage} = ${w2(need)} m`, `Purchases = ${w2(need)} + ${w0(closeRM)} − ${w0(openRM)} = ${w2(buy)} m`],
      hints: { spot: 'Which budgets come before purchases in the chain?', formula: 'Two stock jars: finished goods and materials.', inputs: 'Six figures, all in the story.', answer: 'Production first, then materials.', decision: 'Compare closing and opening finished stock.' },
      outcomes: {
        more: { valueDelta: dir === 'more' ? 800 : -800, news: dir === 'more' ? 'The stockroom orders enough silk for the extra scarves.' : 'The silk order is wrong; the studio is short in March.' },
        fewer: { valueDelta: dir === 'fewer' ? 800 : -800, news: dir === 'fewer' ? 'The buyer cuts the silk order to match.' : 'The silk order is wrong; the studio is short in March.' },
        same: { valueDelta: dir === 'same' ? 800 : -800, news: dir === 'same' ? 'The silk order matches the sales plan.' : 'The silk order is wrong; the studio is short in March.' },
      },
      cfoLine: `Silk to buy: ${w2(buy)} metres.`,
    };
  },
});

// ---------------------------------------------------------------- sorting rounds

export const budgetTypesSort: ClassifyProblem = {
  kind: 'classify',
  id: 'budget-types-sort',
  title: 'Which budget is which?',
  host: 'margaux',
  concept: 'budget-process',
  prompt: ['The budget file has a dozen sections. Is each one an operating budget, a financial budget, or the whole lot?'],
  categories: [
    { id: 'op', label: 'Operating budget' },
    { id: 'fin', label: 'Financial budget' },
    { id: 'master', label: 'Master budget' },
  ],
  show: 6,
  items: [
    { text: 'The sales (revenue) budget', category: 'op', why: 'Revenue budgets are operating budgets.' },
    { text: 'The production budget', category: 'op', why: 'A cost-side operating budget.' },
    { text: 'The direct labour budget', category: 'op', why: 'One of the cost budgets.' },
    { text: 'The overheads budget', category: 'op', why: 'One of the cost budgets.' },
    { text: 'The budgeted income statement', category: 'op', why: 'The operating budgets culminate in it.' },
    { text: 'The cash budget', category: 'fin', why: 'A financial budget.' },
    { text: 'The capital expenditure budget', category: 'fin', why: 'A financial budget.' },
    { text: 'The budgeted balance sheet', category: 'fin', why: 'A financial budget.' },
    { text: 'All the budgets combined into one plan', category: 'master', why: 'That’s the master budget.' },
  ],
};

export const budgetStepsSort: ClassifyProblem = {
  kind: 'classify',
  id: 'budget-steps-sort',
  title: 'First things first',
  host: 'margaux',
  concept: 'budget-process',
  prompt: ['Next year’s budget season starts Monday. Where does each task come in the process?'],
  categories: [
    { id: 'before', label: 'Before drafting' },
    { id: 'draft', label: 'Drafting and co-ordinating' },
    { id: 'after', label: 'Finishing and following up' },
  ],
  show: 6,
  items: [
    { text: 'Decide who is responsible for the budget-setting process', category: 'before', why: 'Responsibility is established first.' },
    { text: 'Send budget guidelines to the managers', category: 'before', why: 'Guidelines go out before anyone drafts.' },
    { text: 'Find the key (limiting) factor: what caps the business?', category: 'before', why: 'It decides which budget is prepared first.' },
    { text: 'Prepare the sales budget (or the budget for the limiting factor)', category: 'draft', why: 'It’s drafted first of the budgets, since the others hang off it.' },
    { text: 'Prepare draft budgets for all the other areas', category: 'draft', why: 'They follow from the limiting factor’s budget.' },
    { text: 'Review the drafts and co-ordinate them so they fit together', category: 'draft', why: 'The production budget has to match the sales budget.' },
    { text: 'Combine them into the master budgets', category: 'after', why: 'Once the drafts fit.' },
    { text: 'Communicate the budgets to everyone concerned', category: 'after', why: 'Everyone needs to know their part.' },
    { text: 'Monitor actual performance against the budget', category: 'after', why: 'The control stage.' },
  ],
};

export const behaviourSort: ClassifyProblem = {
  kind: 'classify',
  id: 'behaviour-sort',
  title: 'What the budget does to people',
  host: 'theo',
  concept: 'budget-behaviour',
  prompt: ['Theo’s team has been very creative with this year’s budget. Which of the known problems is each of these?'],
  categories: [
    { id: 'pad', label: 'Budget padding' },
    { id: 'spend', label: 'Spend it or lose it' },
    { id: 'bonus', label: 'Bonus gaming' },
    { id: 'short', label: 'Short-termism' },
    { id: 'imposed', label: 'Imposed targets' },
  ],
  show: 6,
  items: [
    { text: 'A manager quietly asks for 20% more than they need, so the target is easy to beat.', category: 'pad', why: 'Building slack into the budget.' },
    { text: 'In November a department buys a new printer it doesn’t need, because unspent budget would be cut next year.', category: 'spend', why: 'Spending it before it’s lost.' },
    { text: 'To hit a sales bonus, a manager sells to customers who are unlikely to pay.', category: 'bonus', why: 'Selling to marginal customers.' },
    { text: 'To hit the year’s target, a manager cuts prices far too deeply.', category: 'bonus', why: 'Price cuts that hurt profit to hit a bonus.' },
    { text: 'To hit the sales target, a manager overloads shops with stock, then takes it back in January.', category: 'bonus', why: 'Overloading distributors and taking goods back later.' },
    { text: 'A promising new fabric line is shelved because it wasn’t in this year’s budget.', category: 'short', why: 'Innovation postponed by the budget.' },
    { text: 'Training and customer-service spend is cut to protect this year’s profit figure.', category: 'short', why: 'Over-emphasis on short-term financial results.' },
    { text: 'The board hands each studio its budget with no discussion; the team shrugs.', category: 'imposed', why: 'Imposed rather than participative.' },
  ],
};

export const methodsSort: ClassifyProblem = {
  kind: 'classify',
  id: 'methods-sort',
  title: 'Which way of budgeting?',
  host: 'niamh',
  concept: 'budget-methods',
  prompt: ['Niamh’s other clients budget in very different ways. Which approach is each description?'],
  categories: [
    { id: 'incr', label: 'Incremental' },
    { id: 'zbb', label: 'Zero-based' },
    { id: 'abb', label: 'Activity-based' },
    { id: 'beyond', label: 'Beyond budgeting' },
  ],
  show: 6,
  items: [
    { text: 'Each year, last year’s figures plus 3%.', category: 'incr', why: 'Incremental: simple, but carries forward last year’s waste.' },
    { text: 'Every line of spending must be justified from scratch, as if it were new.', category: 'zbb', why: 'The defining idea of zero-based budgeting.' },
    { text: 'It encourages a more questioning approach, but is costly and managers can feel threatened.', category: 'zbb', why: 'The classic advantage and disadvantages of ZBB.' },
    { text: 'Costs are budgeted by what drives them, such as vetting customers, taking orders and fixing errors.', category: 'abb', why: 'Budgets by cost-driving activity rather than function.' },
    { text: 'It authorises only the resources needed to carry out the activities that meet budgeted volumes.', category: 'abb', why: 'Fits support activities whose costs don’t vary with volume.' },
    { text: 'There’s no fixed annual budget: planning is adaptive and decisions are devolved.', category: 'beyond', why: 'The beyond-budgeting philosophy.' },
    { text: 'Most common in small firms; its weakness is that it turns costs into entitlements.', category: 'incr', why: 'Incremental budgets are the default.' },
    { text: 'It gives closer links between costs and the managers responsible for them.', category: 'abb', why: 'A benefit of activity-based budgeting.' },
  ],
};

// ---------------------------------------------------------------- written answers

export const criticismsBrief: BriefProblem = {
  kind: 'brief',
  id: 'budget-criticisms-brief',
  title: 'Is the budget doing more harm than good?',
  host: 'idris',
  concept: 'budget-criticisms',
  prompt: [{ who: 'idris', text: 'Every autumn we spend a month on the budget, and every spring it’s out of date. Is it worth it?' }],
  question: 'Discuss the criticisms that are made of traditional budgeting.',
  cap: 5,
  cards: [
    { text: 'It concentrates power in the hands of senior managers, who set the targets and hold the purse.', kind: 'key', why: 'A criticism from the course.' },
    { text: 'It protects costs rather than lowering them: last year’s spend becomes this year’s entitlement.', kind: 'key', why: 'Incremental budgets carry waste forward.' },
    { text: 'It promotes sharp practices: padding, spending to use up the budget, gaming bonuses.', kind: 'key', why: 'The behavioural problems.' },
    { text: 'It focuses on short-term financial targets, so innovation and non-financial aims are neglected.', kind: 'key', why: 'Short-termism.' },
    { text: 'It can’t cope with a fast-changing environment, because the plan is fixed once a year.', kind: 'key', why: 'Inflexible.' },
    { text: 'It takes up too much management time.', kind: 'key', why: 'The cost of the process itself.' },
    { text: 'It encourages incremental thinking: this year is last year plus a bit.', kind: 'key', why: 'No questioning of the base.' },
    { text: 'It’s built round functions (production, marketing) rather than processes (winning and delivering an order).', kind: 'key', why: 'Out of line with how customers see the business.' },
    { text: 'Budgets make accounts unnecessary.', kind: 'trap', why: 'Budgets plan the future; accounts report the past.' },
    { text: 'Budgets always make managers work harder.', kind: 'trap', why: 'The criticism is that they can do the opposite.' },
  ],
  model:
    'Traditional budgeting attracts several criticisms. It concentrates power in the hands of senior managers. It protects costs rather than reducing them, because last year’s spend becomes this year’s entitlement, and it encourages incremental thinking. It promotes sharp practices such as padding and gaming bonuses. It focuses on short-term financial targets, so innovation and non-financial aims are neglected. It cannot cope with a fast-changing environment because the plan is fixed once a year, and it takes up a great deal of management time. Finally it is organised around functions rather than the business processes that customers experience.',
};

export const behaviourBrief: BriefProblem = {
  kind: 'brief',
  id: 'budget-behaviour-brief',
  title: 'Budgets and bad behaviour',
  host: 'niamh',
  concept: 'budget-behaviour',
  prompt: [{ who: 'niamh', text: 'In my experience, the budget changes what people do. Not always for the better.' }],
  question: 'Explain how budgeting can cause managers to behave in ways that harm the business, and suggest how this can be reduced.',
  cap: 5,
  cards: [
    { text: 'Budget padding: managers build slack into their budgets so they’re easy to beat, which makes the plan soft and misleading.', kind: 'key', why: 'Behaviour and its consequence.' },
    { text: '“Spend it or lose it”: managers use up their budget before year end so it isn’t cut next year, wasting money.', kind: 'key', why: 'Behaviour and its consequence.' },
    { text: 'Short-termism: too much weight on this year’s financial results means non-financial aims are overlooked and innovation is postponed.', kind: 'key', why: 'Behaviour and its consequence.' },
    { text: 'Bonus gaming: if bonuses depend on budget, sales managers may sell to marginal customers, cut prices too deeply, or overload distributors and take stock back later.', kind: 'key', why: 'Examples from the course.' },
    { text: 'Imposed budgets get less buy-in than participative ones; a pure target gives no incentive to beat it.', kind: 'key', why: 'Motivation.' },
    { text: 'To reduce it: involve managers in setting budgets, add non-financial measures, and reward longer-term performance rather than one year’s numbers.', kind: 'key', why: 'The “how it can be reduced” part of the question.' },
    { text: 'Managers always behave honestly, so budgets are safe.', kind: 'trap', why: 'The whole point is that they respond to incentives.' },
    { text: 'The solution is to abolish all targets.', kind: 'trap', why: 'Targets motivate; the answer is better design.' },
  ],
  model:
    'Budgets change behaviour. Managers may pad their budgets to make them easy to beat, which makes the plan soft and misleading. Under “spend it or lose it” they use up spare budget before the year end so it is not cut, wasting money. A focus on short-term financial results means non-financial aims are overlooked and innovation may be shelved. Where bonuses depend on the budget, sales managers may sell to marginal customers, cut prices too deeply or overload distributors. Imposed budgets get less buy-in. To reduce these effects, involve managers in setting budgets, use non-financial measures alongside financial ones, and base rewards on longer-term performance.',
};

export const zbbBrief: BriefProblem = {
  kind: 'brief',
  id: 'budget-methods-brief',
  title: 'Start from zero?',
  host: 'idris',
  concept: 'budget-methods',
  prompt: [{ who: 'idris', text: 'A consultant says we should budget from zero every year. Sounds sensible. Is it?' }],
  question: 'Explain zero-based budgeting and discuss its advantages and disadvantages compared with incremental budgeting.',
  cap: 4,
  cards: [
    { text: 'In zero-based budgeting every item added to the budget must be justified from scratch, rather than starting from last year’s figures.', kind: 'key', why: 'The definition.' },
    { text: 'Advantage: it encourages a more questioning approach, so waste carried over from past years gets challenged.', kind: 'key', why: 'The main benefit.' },
    { text: 'Disadvantage: it can be costly to implement, taking a lot of management time.', kind: 'key', why: 'Cost.' },
    { text: 'Disadvantage: employees may feel threatened, since their budgets could be cut to nothing.', kind: 'key', why: 'Behavioural cost.' },
    { text: 'Incremental budgeting is simpler and quicker, but carries forward last year’s waste and treats spend as an entitlement.', kind: 'key', why: 'The comparison.' },
    { text: 'ZBB means the business starts each year with no staff and no assets.', kind: 'trap', why: 'It means each spending item is justified, not that everything is removed.' },
    { text: 'ZBB is used by most large organisations.', kind: 'trap', why: 'Surveys show it is not widely used.' },
  ],
  model:
    'In zero-based budgeting every item in the budget must be justified from scratch, rather than starting from last year’s figures and adding a little, as incremental budgeting does. Its advantage is that it encourages a more questioning approach, so waste carried over from earlier years is challenged. Its disadvantages are that it can be costly and time-consuming to implement and that employees may feel threatened. Incremental budgeting is simpler and quicker, but it carries forward past waste and treats last year’s spending as an entitlement.',
};

export const ACT7_PROBLEMS: Problem[] = [budgetBenefits, budgetTypesSort, budgetStepsSort, purchasesBudget, receiptsCalc, slideCashBudget, xmasBudget, behaviourSort, behaviourBrief, methodsSort, zbbBrief, criticismsBrief];
