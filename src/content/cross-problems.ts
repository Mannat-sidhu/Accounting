// Questions that sit across chapters. Receipts split over two later months, and ratios read off a set of accounts the
// player has had to build first: neither says which chapter it belongs to, which is how the exam works.
import { eur } from '../engine/format';
import { pickInt, pickOne } from '../engine/rng';
import type { CalcProblem, Problem, ProblemInstance, Unit } from '../engine/types';
import { defineCalc, w0, w2, whys } from './helpers';
import { TRANS_BASE, derived, story, varyTrans, type TransP } from './trans-problems';

// ---------------------------------------------------------------- receipts over three months, and debtors

interface SplitP {
  sales: [number, number, number];
  months: [string, string, string];
  cashPct: number;
  /** Share of credit sales collected one month after the sale; the rest arrives two months after. */
  oneMonthShare: number;
  kind: 'receipts' | 'debtors';
}

export const receiptsSplit = defineCalc<SplitP>({
  kind: 'calc',
  id: 'receipts-split',
  title: 'Cash in, and who still owes us',
  host: 'aoife',
  concept: 'receipts-timing',
  uses: ['cash-jar'],
  base: { sales: [240000, 320000, 450000], months: ['April', 'May', 'June'], cashPct: 30, oneMonthShare: 60, kind: 'receipts' },
  vary: (rng) => ({
    sales: [pickInt(rng, 150000, 400000, 10000), pickInt(rng, 200000, 450000, 10000), pickInt(rng, 250000, 550000, 10000)],
    months: pickOne(rng, [['January', 'February', 'March'], ['April', 'May', 'June'], ['July', 'August', 'September'], ['October', 'November', 'December']] as const).slice() as [string, string, string],
    cashPct: pickOne(rng, [20, 30, 40, 50]),
    oneMonthShare: pickOne(rng, [40, 50, 60]),
    kind: pickOne(rng, ['receipts', 'debtors'] as const),
  }),
  build: (p): ProblemInstance => {
    const [a, b, c] = p.sales;
    const credit = (100 - p.cashPct) / 100;
    const one = p.oneMonthShare / 100;
    const two = 1 - one;
    const m = p.months;
    const intro = {
      who: 'aoife' as const,
      text: `Sales are ${eur(a)} in ${m[0]}, ${eur(b)} in ${m[1]} and ${eur(c)} in ${m[2]}. ${p.cashPct}% of sales are for cash, collected in the month of sale. The other ${100 - p.cashPct}% are on credit: ${p.oneMonthShare}% of that is collected a month after the sale, and the other ${100 - p.oneMonthShare}% two months after.`,
    };
    if (p.kind === 'receipts') {
      const cash = c * (p.cashPct / 100);
      const fromB = b * credit * one;
      const fromA = a * credit * two;
      const total = cash + fromB + fromA;
      return {
        prompt: [intro, `There were no sales before ${m[0]}, so ignore anything owed from earlier.`],
        ask: `What receipts can we expect from customers in ${m[2]}?`,
        formula: { options: ['receipts', 'receipts-sales', 'jar-end'], correct: 'receipts', explain: `Three months feed ${m[2]}’s cash: this month’s cash sales, last month’s credit sales (the first part), and the month before’s (the second part).` },
        stepNames: { formula: 'Pick the method' },
        inputs: [
          { key: 'X', symbol: '\\text{Cash}', label: `Cash sales in ${m[2]}`, unit: 'eur', expected: cash, explain: `${p.cashPct}% × ${w0(c)} = ${w0(cash)}.`, given: false },
          { key: 'Y', symbol: '\\text{1 month}', label: `Collected from ${m[1]}’s credit sales`, unit: 'eur', expected: fromB, explain: `${w0(b)} × ${100 - p.cashPct}% × ${p.oneMonthShare}% = ${w0(fromB)}.`, given: false },
          { key: 'Z', symbol: '\\text{2 months}', label: `Collected from ${m[0]}’s credit sales`, unit: 'eur', expected: fromA, explain: `${w0(a)} × ${100 - p.cashPct}% × ${100 - p.oneMonthShare}% = ${w0(fromA)}.`, given: false },
        ],
        solve: (v) => v.X + v.Y + v.Z,
        answer: { label: `Receipts in ${m[2]}`, unit: 'eur', explain: `${w0(cash)} + ${w0(fromB)} + ${w0(fromA)} = ${w0(total)}.` },
        decision: {
          question: `Theo says ${m[2]}’s receipts should be ${eur(c)}, “because that’s what we sold”. Is he right?`,
          options: [
            { id: 'no', label: `No: ${eur(total)}, because most of ${m[2]}’s sales are collected later and earlier months are still arriving` },
            { id: 'yes', label: 'Yes: sales are cash' },
          ],
          correct: 'no',
          why: whys('Receipts follow the credit terms, not the month of sale.', 'Sales are cash in the month they’re made.', 'Credit sales arrive in the month of sale.'),
          correctWhy: 'w0',
          explain: `${eur(total)} arrives in ${m[2]}: cash sales plus the parts of the two earlier months’ credit sales.`,
        },
        working: [`${m[2]} receipts = ${p.cashPct}% × ${w0(c)} + ${p.oneMonthShare}% × ${100 - p.cashPct}% × ${w0(b)} + ${100 - p.oneMonthShare}% × ${100 - p.cashPct}% × ${w0(a)}`, `= ${w0(cash)} + ${w0(fromB)} + ${w0(fromA)} = ${w0(total)}`],
        hints: { formula: 'Three months of sales feed this month’s cash.', inputs: 'Work out the credit part of each month, then the share collected now.', answer: 'Add the three parts.', decision: 'Credit terms, not sales, set receipts.' },
        outcomes: { no: { valueDelta: 800, news: 'The cash budget uses the right receipts.' }, yes: { valueDelta: -1000, news: 'The cash budget is too rosy: it forgets who still owes us.' } },
        cfoLine: `${m[2]} receipts ${eur(total)}.`,
      };
    }
    const mCredit = c * credit;
    const bOwed = b * credit * two;
    const owed = mCredit + bOwed;
    return {
      prompt: [intro],
      ask: `What will the trade debtors balance be at the end of ${m[2]}?`,
      formula: { options: ['debtors-owed', 'debtors-all-credit', 'receipts'], correct: 'debtors-owed', explain: `Everything not yet collected: all of ${m[2]}’s credit sales, plus the part of ${m[1]}’s still outstanding. ${m[0]}’s are all collected by then.` },
      stepNames: { formula: 'Pick the method' },
      inputs: [
        { key: 'X', symbol: '\\text{This month}', label: `${m[2]}’s credit sales (none collected yet)`, unit: 'eur', expected: mCredit, explain: `${w0(c)} × ${100 - p.cashPct}% = ${w0(mCredit)}.`, given: false },
        { key: 'Y', symbol: '\\text{Last month}', label: `Part of ${m[1]}’s credit sales still owed`, unit: 'eur', expected: bOwed, explain: `${w0(b)} × ${100 - p.cashPct}% × ${100 - p.oneMonthShare}% = ${w0(bOwed)}.`, given: false },
      ],
      solve: (v) => v.X + v.Y,
      answer: { label: `Trade debtors at the end of ${m[2]}`, unit: 'eur', explain: `${w0(mCredit)} + ${w0(bOwed)} = ${w0(owed)}.` },
      decision: {
        question: `Is ${m[0]}’s credit still owed at the end of ${m[2]}?`,
        options: [
          { id: 'no', label: 'No: both instalments have been collected by then' },
          { id: 'yes', label: 'Yes: some is still outstanding' },
        ],
        correct: 'no',
        why: whys(`${m[0]}’s credit sales are collected one and two months after the sale, so by ${m[2]} they are all in.`, 'Credit sales are never fully collected.', 'It depends on the cash percentage.'),
        correctWhy: 'w0',
        explain: `Only ${m[2]}’s credit sales and the second instalment of ${m[1]}’s are outstanding: ${eur(owed)}.`,
      },
      working: [`This month’s credit sales = ${w0(c)} × ${100 - p.cashPct}% = ${w0(mCredit)}`, `Still owed from last month = ${w0(b)} × ${100 - p.cashPct}% × ${100 - p.oneMonthShare}% = ${w0(bOwed)}`, `Debtors = ${w0(owed)}`],
      hints: { formula: 'Debtors are what customers still owe at the month end.', inputs: 'Credit sales of this month, and the unpaid part of last month’s.', answer: 'Add them.', decision: 'How long does a credit sale take to be collected in full?' },
      outcomes: { no: { valueDelta: 600, news: 'The balance sheet shows the right debtors.' }, yes: { valueDelta: -600, news: 'Debtors are overstated.' } },
      cfoLine: `Debtors ${eur(owed)}.`,
    };
  },
}) as CalcProblem<SplitP>;

// ---------------------------------------------------------------- ratios from accounts the player builds

type RatioKind = 'current' | 'gearing' | 'roce' | 'debtor-days' | 'gpm' | 'int-cover';

interface TransRatioP extends TransP {
  ratio: RatioKind;
}

const RATIO_NAME: Record<RatioKind, string> = {
  current: 'current ratio',
  gearing: 'gearing ratio',
  roce: 'return on capital employed',
  'debtor-days': 'debtor days',
  gpm: 'gross profit margin',
  'int-cover': 'interest cover',
};

export const transRatios = defineCalc<TransRatioP>({
  kind: 'calc',
  id: 'trans-ratios',
  title: 'What do the accounts say?',
  host: 'aoife',
  concept: 'ratio-families',
  uses: ['transactions', 'liquidity', 'gearing-cover', 'profitability'],
  base: { ...TRANS_BASE, ratio: 'gearing' },
  vary: (rng) => ({ ...varyTrans(rng), ratio: pickOne(rng, ['current', 'gearing', 'roce', 'debtor-days', 'gpm', 'int-cover'] as const) }),
  build: (p): ProblemInstance => {
    const d = derived(p);
    const equity = p.capital + d.profit;
    const ce = equity + p.loan;
    const ca = p.closingInv + p.debtors + d.cash;
    const cl = p.creditors + d.accrual;
    const R = p.ratio;
    type Spec = { method: string; inputs: { label: string; value: number; unit: Unit; explain: string; given?: boolean }[]; solve: (v: number[]) => number; unit: Unit; value: number; formula: string; wrong: string[] };
    const spec: Record<RatioKind, Spec> = {
      current: {
        method: 'current',
        inputs: [
          { label: 'Current assets', value: ca, unit: 'eur', explain: `Inventory ${w0(p.closingInv)} + debtors ${w0(p.debtors)} + cash ${w0(d.cash)} = ${w0(ca)}.`, given: false },
          { label: 'Current liabilities', value: cl, unit: 'eur', explain: `Trade payables ${w0(p.creditors)} + accruals ${w0(d.accrual)} = ${w0(cl)}.`, given: false },
        ],
        solve: (v) => v[0] / v[1],
        unit: 'times',
        value: ca / cl,
        formula: 'Current assets ÷ current liabilities',
        wrong: ['quick', 'gearing'],
      },
      gearing: {
        method: 'gearing',
        inputs: [
          { label: 'Long-term liabilities', value: p.loan, unit: 'eur', explain: `${w0(p.loan)}: the bank loan.` },
          { label: 'Total capital employed', value: ce, unit: 'eur', explain: `Equity ${w0(equity)} (shares ${w0(p.capital)} + profit ${w0(d.profit)}) + loan ${w0(p.loan)} = ${w0(ce)}.`, given: false },
        ],
        solve: (v) => (v[0] / v[1]) * 100,
        unit: 'pct',
        value: (p.loan / ce) * 100,
        formula: 'Long-term liabilities ÷ total capital employed × 100',
        wrong: ['current', 'int-cover'],
      },
      roce: {
        method: 'roce',
        inputs: [
          { label: 'Operating profit', value: d.op, unit: 'eur', explain: `Gross profit ${w0(d.gross)} − admin ${w0(p.admin)} − depreciation ${w0(d.dep)} = ${w0(d.op)}.`, given: false },
          { label: 'Total capital employed', value: ce, unit: 'eur', explain: `Equity ${w0(equity)} + loan ${w0(p.loan)} = ${w0(ce)}.`, given: false },
        ],
        solve: (v) => (v[0] / v[1]) * 100,
        unit: 'pct',
        value: (d.op / ce) * 100,
        formula: 'Operating profit ÷ total capital employed × 100',
        wrong: ['roe', 'opm'],
      },
      'debtor-days': {
        method: 'debtor-days',
        inputs: [
          { label: 'Trade receivables', value: p.debtors, unit: 'eur', explain: `${w0(p.debtors)}: still owed by customers.` },
          { label: 'Credit sales', value: p.sales, unit: 'eur', explain: `${w0(p.sales)}: all sales were on credit.` },
        ],
        solve: (v) => (v[0] / v[1]) * 365,
        unit: 'days',
        value: (p.debtors / p.sales) * 365,
        formula: 'Trade receivables ÷ credit sales × 365',
        wrong: ['inv-days', 'creditor-days'],
      },
      gpm: {
        method: 'gpm',
        inputs: [
          { label: 'Gross profit', value: d.gross, unit: 'eur', explain: `Sales ${w0(p.sales)} − cost of sales ${w0(d.cos)} = ${w0(d.gross)}.`, given: false },
          { label: 'Sales', value: p.sales, unit: 'eur', explain: `${w0(p.sales)}.` },
        ],
        solve: (v) => (v[0] / v[1]) * 100,
        unit: 'pct',
        value: (d.gross / p.sales) * 100,
        formula: 'Gross profit ÷ sales × 100',
        wrong: ['opm', 'roce'],
      },
      'int-cover': {
        method: 'int-cover',
        inputs: [
          { label: 'Operating profit', value: d.op, unit: 'eur', explain: `Gross profit ${w0(d.gross)} − admin ${w0(p.admin)} − depreciation ${w0(d.dep)} = ${w0(d.op)}.`, given: false },
          { label: 'Interest expense', value: d.interest, unit: 'eur', explain: `${p.interestPct}% × ${w0(p.loan)} = ${w0(d.interest)}.`, given: false },
        ],
        solve: (v) => v[0] / v[1],
        unit: 'times',
        value: d.op / d.interest,
        formula: 'Operating profit ÷ interest expense',
        wrong: ['gearing', 'div-cover'],
      },
    };
    const sp = spec[R];
    const keys = ['X', 'Y'];
    return {
      prompt: [{ who: 'aoife', text: `The new boutique wants a loan. I’ve only been given its list of transactions for the year, not its accounts. I need the ${RATIO_NAME[R]}.` }, ...story(p)],
      ask: `Calculate the ${RATIO_NAME[R]}.`,
      formula: { options: [sp.method, ...sp.wrong], correct: sp.method, explain: `${RATIO_NAME[R]} = ${sp.formula}.` },
      stepNames: { formula: 'Pick the ratio', inputs: 'Work out the figures' },
      inputs: sp.inputs.map((x, i) => ({ key: keys[i], symbol: i === 0 ? '\\text{Top}' : '\\text{Bottom}', label: x.label, unit: x.unit, expected: x.value, explain: x.explain, ...(x.given === false ? { given: false } : {}) })),
      solve: (v) => sp.solve(keys.map((k) => v[k])),
      answer: { label: RATIO_NAME[R][0].toUpperCase() + RATIO_NAME[R].slice(1), unit: sp.unit, explain: `${sp.formula}: ${w2(sp.value)}${sp.unit === 'pct' ? '%' : sp.unit === 'days' ? ' days' : ''}.` },
      decision: {
        question: `The ${RATIO_NAME[R]} comes to ${w2(sp.value)}. Can we say from this figure alone whether it is good or bad?`,
        options: [
          { id: 'context', label: 'Not on its own: we’d want the trend, rivals’ figures and the company’s own target' },
          { id: 'rule', label: 'Yes: every ratio has a fixed good and bad level' },
        ],
        correct: 'context',
        why: whys('A ratio only means something against its trend, a benchmark and a target.', 'There are standard pass marks for every ratio.', 'Ratios can’t say anything.'),
        correctWhy: 'w0',
        explain: `${w2(sp.value)} is a number, not a verdict. The first year of trading has no trend, so benchmarks and targets matter more.`,
      },
      working: [`${RATIO_NAME[R]} = ${sp.formula}`, ...sp.inputs.map((x) => `${x.label}: ${x.explain}`), `= ${w2(sp.value)}`],
      hints: { formula: 'Which figures does it need?', inputs: 'Some of these have to be built from the transactions first: profit, cash, capital employed.', answer: 'Top ÷ bottom.', decision: 'Compare with what?' },
      outcomes: { context: { valueDelta: 500, news: 'Aoife asks for next year’s figures too.' }, rule: { valueDelta: -500, news: 'The ratio is judged against a rule that doesn’t exist.' } },
      cfoLine: `${RATIO_NAME[R]} ${w2(sp.value)}.`,
    };
  },
}) as CalcProblem<TransRatioP>;

export const CROSS_PROBLEMS: Problem[] = [receiptsSplit, transRatios];
