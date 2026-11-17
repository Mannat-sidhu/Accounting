// Mock exam papers. A paper is a set of questions, each worth 25 marks, built from the same problems as the chapters
// and played under exam conditions: no tips, no feedback until the end, one clock for the whole paper.
import { mulberry32 } from '../engine/rng';
import type { Act, CalcProblem, ConceptId, ParamProblem, Problem, StatementProblem } from '../engine/types';
import { ACTS, CONCEPTS, PROBLEMS, hasParams, problemsFor } from './index';
import type { FrostP } from './act-4-problems';
import { OVERLOAD, freshHouse, type FinData } from './act-5-problems';
import { KNOTTED, varyCvp, type CvpP } from './act-6-problems';
import { ONESALE, budgetProfit, cpuOf, varyData, type VarData, type VarKind } from './act-8-problems';
import { derived, varyTrans } from './trans-problems';
import { isWhichTool } from './which-tool';

export interface PaperPart {
  /** (A), (B) i, and so on, as printed on the paper. */
  label: string;
  problem: string;
  params?: unknown;
  marks: number;
  /** The idea this part tests, when it isn't the problem's own (chapter tests). */
  concept?: ConceptId;
}

export interface PaperQuestion {
  /** Two questions with the same group are alternatives: the paper says “answer one”. */
  choice?: { group: string; option: number };
  title: string;
  /** One line of scene-setting shown above the question. */
  stem: string;
  parts: PaperPart[];
}

export interface Paper {
  id: string;
  title: string;
  minutes: number;
  questions: PaperQuestion[];
}

export interface PaperKind {
  id: string;
  title: string;
  blurb: string;
  minutes: number;
  /** Fixed papers have the same numbers every time; others are built fresh from a seed. */
  fixed: boolean;
  build: (seed: number) => Paper;
}

const Q4: PaperQuestion = {
  title: 'Question 4: the directors’ discretion',
  stem: 'The CEO asks the CFO, “What is our profit for the year?” The CFO replies, “What would you like it to be?” (The paper also offers an alternative question on measuring the value of nature, which needs the sustainability chapter.)',
  parts: [
    { label: '(a)', problem: 'discretion-brief', marks: 10 },
    { label: '(b)', problem: 'mitigants-brief', marks: 11 },
    { label: '(c)', problem: 'mitigants-opinion', marks: 4 },
  ],
};

/** The four parts of a CVP question over one set of numbers. */
const cvpQuestion = (title: string, stem: string, d: unknown, cut: number, lift: number): PaperQuestion => ({
  title,
  stem,
  parts: [
    { label: '(A)', problem: 'cvp-cpu', params: d, marks: 3 },
    { label: '(B) i', problem: 'cvp-be', params: { ...(d as object), mode: 'units' }, marks: 1.5 },
    { label: '(B) ii', problem: 'cvp-be', params: { ...(d as object), mode: 'value' }, marks: 1.5 },
    { label: '(C)', problem: 'cvp-mos', params: d, marks: 3 },
    { label: '(D)', problem: 'cvp-target', params: d, marks: 3 },
    { label: '(E) i', problem: 'cvp-whatif', params: { ...(d as object), cut, lift, ask: 'profit' }, marks: 2 },
    { label: '(E) ii', problem: 'cvp-whatif', params: { ...(d as object), cut, lift, ask: 'be' }, marks: 2 },
    { label: '(F)', problem: 'cvp-limits-brief', marks: 4 },
    { label: '(G)', problem: 'op-gearing-brief', marks: 5 },
  ],
});

const ratioQuestion = (title: string, stem: string, d: FinData, last: { inv: number; deb: number; cover: number }, cc: object, id: object): PaperQuestion => ({
  title,
  stem,
  parts: [
    { label: '(A) a', problem: 'ratio-efficiency', params: { ratio: 'inv-days', d, last: last.inv }, marks: 2 },
    { label: '(A) b', problem: 'ratio-efficiency', params: { ratio: 'debtor-days', d, last: last.deb }, marks: 2 },
    { label: '(A) c', problem: 'ratio-gearing', params: { ratio: 'int-cover', d, last: last.cover }, marks: 2 },
    { label: '(B)', problem: 'debtor-info', marks: 6 },
    { label: '(C) Proposal 1', problem: 'credit-control', params: cc, marks: 6.5 },
    { label: '(C) Proposal 2', problem: 'invoice-discounting', params: id, marks: 6.5 },
  ],
});

const varianceQuestion = (title: string, stem: string, d: unknown): PaperQuestion => ({
  title,
  stem,
  parts: [
    { label: '(A) a', problem: 'var-sales', params: { kind: 'sales-price', d }, marks: 3 },
    { label: '(A) b', problem: 'var-materials', params: { kind: 'mat-qty', d }, marks: 3 },
    { label: '(A) c', problem: 'var-materials', params: { kind: 'mat-rate', d }, marks: 3 },
    { label: '(B)', problem: 'budget-benefits', marks: 8 },
    { label: '(C)', problem: 'staff-brief', marks: 8 },
  ],
});

/** The Autumn 2025 paper, with the real numbers. */
const autumn25 = (): Paper => ({
  id: 'autumn25',
  title: 'Autumn 2025, as set',
  minutes: 120,
  questions: [
    cvpQuestion('Question 1: Knotted Limited', 'Knotted Limited makes luxury silk ties. Its budget for the year is based on 100,000 units: sales €8,660,000, variable costs €4,660,000, fixed costs €2,440,000.', KNOTTED, 8, 15),
    ratioQuestion(
      'Question 2: Overload Limited',
      'Overload Limited’s year-end balance sheet and trading figures are given. The CFO has two proposals for improving cash management in relation to trade debtors.',
      OVERLOAD,
      { inv: 90, deb: 80, cover: 5 },
      { sales: OVERLOAD.creditSales, daysNow: null, receivables: 500000, to: 30, by: null, funds: 6, cost: 50000, name: 'Overload' },
      { receivables: 500000, sales: 0, days: 0, eligible: 80, advance: 75, facility: 2, fee: 25000, funds: 6, limit: null },
    ),
    varianceQuestion('Question 3: Onesale Limited', 'Onesale Limited makes one bespoke product using highly skilled labour, and holds no stocks. Budgeted and actual figures for the last year are given.', ONESALE),
    Q4,
  ],
});

// ---------------------------------------------------------------- questions by topic, each with new numbers

type Topic = 'accounts' | 'ratios' | 'cvp' | 'budget' | 'variance';

const qCvp = (rng: () => number, n: number): PaperQuestion => {
  const cvp = { ...varyCvp(rng), totals: true, product: 'silk ties' };
  const cut = Math.max(1, Math.round((cvp.price - cvp.vc) * 0.2));
  return cvpQuestion(`Question ${n}: a CVP budget`, `A business makes ${cvp.product}. Its budget for the year is based on ${cvp.units.toLocaleString('en-GB')} units.`, cvp, cut, 15);
};

const qRatios = (rng: () => number, n: number): PaperQuestion => {
  const house = freshHouse(rng);
  const days = Math.round((house.rec[1] / house.creditSales) * 365);
  const ccTo = Math.max(15, days - 30);
  const funds = 5 + Math.floor(rng() * 6);
  return ratioQuestion(
    `Question ${n}: ${house.name}`,
    'The accounts are given. The CFO has two proposals for improving cash management in relation to trade debtors.',
    house,
    { inv: 60, deb: 70, cover: 4 },
    { sales: house.creditSales, daysNow: null, receivables: house.rec[1], to: ccTo, by: null, funds, cost: 10000 + Math.round(rng() * 8) * 5000, name: house.name },
    { receivables: house.rec[1], sales: 0, days: 0, eligible: 75, advance: 80, facility: 2 + Math.floor(rng() * 2), fee: 5000 + Math.round(rng() * 6) * 5000, funds, limit: null },
  );
};

/** The shape of the real paper's variance question: three variances, then two written parts. */
const qVarianceLite = (rng: () => number, n: number): PaperQuestion => {
  const v = varyData(rng);
  return varianceQuestion(`Question ${n}: a standard-cost business`, `A business makes ${v.product}. Budgeted and actual figures for the last year are given.`, v);
};

/** The full set: budgeted profit, all nine variances, the statement for the board, and two written parts. */
const qVarianceFull = (rng: () => number, n: number): PaperQuestion => {
  const d = varyData(rng);
  const k = (kind: VarKind) => ({ kind, d });
  return {
    title: `Question ${n}: variance analysis`,
    stem: `A business makes ${d.product}. Its standard costs, its budget and its actual results for the year are given.`,
    parts: [
      { label: '(A)', problem: 'var-budget-profit', params: { d, kind: 'budget' }, marks: 1 },
      { label: '(B) a', problem: 'var-sales', params: k('sales-price'), marks: 1.5 },
      { label: '(B) b', problem: 'var-sales', params: k('sales-volume'), marks: 1.5 },
      { label: '(C) a', problem: 'var-materials', params: k('mat-rate'), marks: 1.5 },
      { label: '(C) b', problem: 'var-materials', params: k('mat-qty'), marks: 1.5 },
      { label: '(D) a', problem: 'var-labour', params: k('lab-rate'), marks: 1.5 },
      { label: '(D) b', problem: 'var-labour', params: k('lab-eff'), marks: 1.5 },
      { label: '(E) a', problem: 'var-overheads', params: k('vo-rate'), marks: 1.5 },
      { label: '(E) b', problem: 'var-overheads', params: k('vo-eff'), marks: 1.5 },
      { label: '(E) c', problem: 'var-overheads', params: k('fixed'), marks: 1.5 },
      { label: '(F)', problem: 'var-reconcile', params: d, marks: 5 },
      { label: '(G)', problem: 'usage-reasons-brief', marks: 2 },
      { label: '(H)', problem: 'standards-limits-brief', marks: 3.5 },
    ],
  };
};

/** Preparing accounts from a list of transactions: income statement, cash, balance sheet. */
const qAccounts = (rng: () => number, n: number): PaperQuestion => {
  const p = varyTrans(rng);
  return {
    title: `Question ${n}: preparing accounts`,
    stem: 'A new business has traded for its first year. Its transactions for the year are listed.',
    parts: [
      { label: '(A)', problem: 'trans-is', params: p, marks: 9 },
      { label: '(B)', problem: 'trans-cash', params: p, marks: 5 },
      { label: '(C)', problem: 'trans-bs', params: p, marks: 11 },
    ],
  };
};

/** A cash budget with opening balances, receipts and payments timing, plus a written part. */
const qBudget = (rng: () => number, n: number): PaperQuestion => {
  const vary = (id: string) => (PROBLEMS[id] as ParamProblem).vary(rng);
  return {
    title: `Question ${n}: cash budgeting`,
    stem: 'A business is preparing its cash budget for the next quarter. Its sales, purchases and payment terms are given.',
    parts: [
      { label: '(A)', problem: 'receipts-month', params: vary('receipts-month'), marks: 4 },
      { label: '(B)', problem: 'purchases-budget', params: vary('purchases-budget'), marks: 4 },
      { label: '(C)', problem: 'quarter-budget', params: vary('quarter-budget'), marks: 11 },
      { label: '(D)', problem: 'budget-benefits', marks: 6 },
    ],
  };
};

/** The same budget and standard cost card used for CVP and for variances: two chapters in one question. */
const cvpFromCard = (d: VarData): CvpP => ({
  product: d.product,
  unit: 'units',
  price: d.budgetPrice,
  vc: d.budgetPrice - cpuOf(d),
  fixed: d.fixedBudget!,
  units: d.budgetUnits,
  period: 'a year',
  target: Math.max(50000, Math.round((budgetProfit(d) * 1.4) / 10000) * 10000),
});

const caseCvpVariances = (rng: () => number, n: number): PaperQuestion => {
  const d = varyData(rng);
  const c = cvpFromCard(d);
  const cpu = cpuOf(d);
  return {
    title: `Question ${n}: cost–volume–profit and variances`,
    stem: `A business makes ${d.product}. Its budgeted cost card and the budget for the coming year are given. In the following year it did something different, and the actual figures are given too.`,
    parts: [
      { label: '(A) i', problem: 'cvp-be', params: { ...c, mode: 'units' }, marks: 2.5 },
      { label: '(A) ii', problem: 'cvp-be', params: { ...c, mode: 'value' }, marks: 2.5 },
      { label: '(B)', problem: 'cvp-mos', params: c, marks: 3 },
      { label: '(C)', problem: 'cvp-target', params: c, marks: 3 },
      { label: '(D)', problem: 'cvp-whatif', params: { ...c, cut: Math.max(1, Math.round(cpu * 0.2)), lift: 40, ask: 'profit', extra: Math.round((d.fixedBudget! * 0.06) / 1000) * 1000 }, marks: 5 },
      { label: '(E) a', problem: 'var-sales', params: { kind: 'sales-price', d }, marks: 3 },
      { label: '(E) b', problem: 'var-labour', params: { kind: 'lab-rate', d }, marks: 3 },
      { label: '(E) c', problem: 'var-labour', params: { kind: 'lab-eff', d }, marks: 3 },
    ],
  };
};

/** Sample-style: four variances, a cause for each, and a written part on budget behaviour. */
const caseVarianceCauses = (rng: () => number, n: number): PaperQuestion => {
  const d = varyData(rng);
  const k = (kind: VarKind) => ({ kind, d });
  return {
    title: `Question ${n}: standard costs and budgets`,
    stem: `A business makes ${d.product} with no stocks of materials or finished goods. Its standard costs, its budget and the actual figures for the year are given.`,
    parts: [
      { label: '(A) a', problem: 'var-sales', params: k('sales-price'), marks: 3 },
      { label: '(A) b', problem: 'var-materials', params: k('mat-qty'), marks: 3 },
      { label: '(A) c', problem: 'var-labour', params: k('lab-rate'), marks: 3 },
      { label: '(A) d', problem: 'var-sales', params: k('sales-volume'), marks: 3 },
      { label: '(B)', problem: 'variance-factors-brief', marks: 8 },
      { label: '(C)', problem: 'use-it-brief', marks: 5 },
    ],
  };
};

/** Preparing accounts from a list, then a liquidity proposal on the trade debtors it produces: two chapters in one question. */
const caseAccountsLiquidity = (rng: () => number, n: number): PaperQuestion => {
  const p = varyTrans(rng);
  const d = derived(p);
  const eligible = pickOneOf(rng, [80, 90]);
  const advance = pickOneOf(rng, [70, 80]);
  const funds = pickOneOf(rng, [8, 9, 10]);
  const facility = pickOneOf(rng, [2, 3]);
  const saving = p.debtors * (eligible / 100) * (advance / 100) * ((funds - facility) / 100);
  const fee = Math.max(500, Math.round((saving * pickOneOf(rng, [0.6, 0.85, 1.3])) / 100) * 100);
  void d;
  return {
    title: `Question ${n}: accounts and cash management`,
    stem: 'A new business has traded for its first year. Its transactions are listed. A bank has offered it an invoice discounting facility.',
    parts: [
      { label: '(A)', problem: 'trans-is', params: p, marks: 8 },
      { label: '(B)', problem: 'trans-cash', params: p, marks: 3 },
      { label: '(C)', problem: 'trans-bs', params: p, marks: 8 },
      { label: '(D)', problem: 'invoice-discounting', params: { receivables: p.debtors, sales: 0, days: 0, eligible, advance, facility, fee, funds, limit: null }, marks: 6 },
    ],
  };
};

/** Ratios read off the accounts of a business whose accounts first have to be built, then liquidity proposals. */
const caseRatiosFromAccounts = (rng: () => number, n: number): PaperQuestion => {
  const p = varyTrans(rng);
  const days = Math.round((p.debtors / p.sales) * 365);
  const funds = pickOneOf(rng, [8, 9, 10]);
  return {
    title: `Question ${n}: reading the accounts`,
    stem: 'A new business has traded for its first year and a bank is deciding whether to lend to it. Its transactions for the year are listed.',
    parts: [
      { label: '(A) a', problem: 'trans-ratios', params: { ...p, ratio: 'current' }, marks: 4 },
      { label: '(A) b', problem: 'trans-ratios', params: { ...p, ratio: 'gearing' }, marks: 4 },
      { label: '(A) c', problem: 'trans-ratios', params: { ...p, ratio: 'roce' }, marks: 4 },
      { label: '(B)', problem: 'ratio-context-brief', marks: 3 },
      { label: '(C) Proposal 1', problem: 'credit-control', params: { sales: p.sales, daysNow: null, receivables: p.debtors, to: Math.max(10, days - 12), by: null, funds, cost: 5000 + Math.round(rng() * 4) * 2500, name: 'the business' }, marks: 5 },
      { label: '(C) Proposal 2', problem: 'prompt-discount', params: { sales: p.sales, takeUp: 50, discount: 1, daysNow: days, daysAfter: Math.max(1, Math.min(15, Math.floor(days / 2))), funds, takersOnly: true }, marks: 5 },
    ],
  };
};

/** Receipts over three months, debtors, and two written parts on budgeting. */
const caseBudgetDebtors = (rng: () => number, n: number): PaperQuestion => {
  const rs = PROBLEMS['receipts-split'] as CalcProblem;
  const base = rs.vary(rng) as { sales: number[]; months: string[]; cashPct: number; oneMonthShare: number };
  return {
    title: `Question ${n}: cash and budgets`,
    stem: `A business expects its sales in ${base.months[0]}, ${base.months[1]} and ${base.months[2]} to be ${base.sales.map((x) => '€' + x.toLocaleString('en-GB')).join(', ')} respectively. Part of its sales are for cash and the rest are on credit, collected over the next two months.`,
    parts: [
      { label: '(A)', problem: 'receipts-split', params: { ...base, kind: 'receipts' }, marks: 5 },
      { label: '(B)', problem: 'receipts-split', params: { ...base, kind: 'debtors' }, marks: 4 },
      { label: '(C)', problem: 'cash-benefits-brief', marks: 8 },
      { label: '(D)', problem: 'beyond-budgeting-brief', marks: 8 },
    ],
  };
};

function pickOneOf<T>(rng: () => number, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)];
}

const TOPIC_BUILDERS: Record<Topic, (rng: () => number, n: number) => PaperQuestion> = {
  accounts: (rng, n) => (rng() < 0.75 ? caseAccountsLiquidity(rng, n) : qAccounts(rng, n)),
  ratios: (rng, n) => (rng() < 0.6 ? qRatios(rng, n) : caseRatiosFromAccounts(rng, n)),
  cvp: (rng, n) => (rng() < 0.5 ? qCvp(rng, n) : caseCvpVariances(rng, n)),
  budget: (rng, n) => (rng() < 0.5 ? qBudget(rng, n) : caseBudgetDebtors(rng, n)),
  variance: (rng, n) => (rng() < 0.5 ? qVarianceFull(rng, n) : caseVarianceCauses(rng, n)),
};

/** The written question: two options drawn from the ones the sample papers use. Answer one. */
const Q4_POOL: { title: string; stem: string; parts: PaperPart[] }[] = [
  { title: 'the directors’ discretion', stem: Q4.stem.replace(/ \(The paper also[^)]*\)/, ''), parts: Q4.parts },
  {
    title: 'financial and non-financial measures',
    stem: '“Organisations that monitor purely financial data will always be reactive rather than proactive.” A ferry operator is considering how it should measure itself.',
    parts: [
      { label: '(a)', problem: 'fin-nonfin-brief', marks: 10 },
      { label: '(b)', problem: 'bsc-design-brief', marks: 15 },
    ],
  },
  {
    title: 'the annual report',
    stem: '“The annual report is the key governance document that allows an assessment of the actions of the management of an organisation.”',
    parts: [
      { label: '(a)', problem: 'fs-components-brief', marks: 10 },
      { label: '(b)', problem: 'fs-effectiveness-brief', marks: 15 },
    ],
  },
  {
    title: 'measuring more than money',
    stem: 'A fashion house that has always reported profit is thinking about a balanced scorecard.',
    parts: [
      { label: '(a)', problem: 'scorecard-sort', marks: 5 },
      { label: '(b)', problem: 'nonfin-brief', marks: 8 },
      { label: '(c)', problem: 'staff-brief', marks: 12 },
    ],
  },
];

const q4Choice = (rng: () => number): PaperQuestion[] => {
  const pool = [...Q4_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 2).map((q, option) => ({
    choice: { group: 'q4', option },
    title: `Question 4, option ${option ? 'B' : 'A'}: ${q.title}`,
    stem: `Answer ONE of the two written questions, A or B. (The real paper’s sustainability option needs a chapter that isn’t built yet.) ${q.stem}`,
    parts: q.parts,
  }));
};

/** Three computational questions, one written question with a choice of two. The topics are drawn from the syllabus. */
const sitting = (id: string, title: string, topics: Topic[]) => (seed: number): Paper => {
  const rng = mulberry32(seed);
  return { id, title, minutes: 120, questions: [...topics.map((t, i) => TOPIC_BUILDERS[t](rng, i + 1)), ...q4Choice(rng)] };
};

const ALL_TOPICS: Topic[] = ['accounts', 'ratios', 'cvp', 'budget', 'variance'];

const mixed = (seed: number): Paper => {
  const rng = mulberry32(seed * 7919 + 13);
  const pick = [...ALL_TOPICS];
  for (let i = pick.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pick[i], pick[j]] = [pick[j], pick[i]];
  }
  return sitting('mixed', 'A mixed mock: three topics drawn at random', pick.slice(0, 3))(seed);
};

/** The real paper’s shape (CVP, ratios, standard costing, then the written question) with new numbers. */
const fresh = (seed: number): Paper => {
  const rng = mulberry32(seed);
  return {
    id: 'fresh',
    title: 'A fresh paper: new numbers',
    minutes: 120,
    questions: [qCvp(rng, 1), qRatios(rng, 2), qVarianceLite(rng, 3), ...q4Choice(rng)],
  };
};

/** Cash flow only: the topic that most needs method, not memory. */
const cashflow = (seed: number): Paper => {
  const rng = mulberry32(seed);
  const f: FrostP = (PROBLEMS['scf-frost'] as StatementProblem<FrostP>).vary(rng);
  const target = f.cce[1] - f.cce[0];
  const close = f.cce[1];
  const co = Math.max(600, 500 - close);
  const cc = close + co - 500;
  const profit = f.op + f.intRec - f.intPaid - f.taxCharge;
  const u = '€’000';
  const cfo = PROBLEMS['cfo-indirect'] as CalcProblem;
  const disp = PROBLEMS['disposal'] as CalcProblem;
  const full = PROBLEMS['scf-full'] as StatementProblem;
  return {
    id: 'cashflow',
    title: 'Cash flow clinic',
    minutes: 60,
    questions: [
      {
        title: 'Question 1: a company’s cash flow statement',
        stem: `Two balance sheets and some extracts are given (${u}). Prepare the statement of cash flows, showing every working. The change in cash and cash equivalents should be ${target.toLocaleString('en-GB')}.`,
        parts: [
          { label: '(a)', problem: 'cce-change', params: { oc: 120, oe: 100, oo: 20, cc, ce: 500, co, lock: 0, profit, receivables: f.rec[1], unit: u, depositNote: 'opened on 16 November that matured on 15 February' }, marks: 3 },
          { label: '(b) depreciation', problem: 'dep-jar', params: { open: f.adOpen, close: f.adClose, sold: f.soldAd, claim: f.adClose - f.adOpen, unit: u }, marks: 2 },
          { label: '(b) disposal', problem: 'disposal', params: { cost: f.soldCost, ad: f.soldAd, given: 'proceeds', amount: f.proceeds, item: 'freezer line', unit: u }, marks: 2 },
          { label: '(b) additions', problem: 'additions-jar', params: { open: f.costOpen, close: f.costClose, soldCost: f.soldCost, unit: u }, marks: 2 },
          { label: '(b) tax', problem: 'liability-paid', params: { what: 'tax', start: f.taxOpen, charge: f.taxCharge, end: f.taxClose, unit: u }, marks: 2 },
          { label: '(b) dividends', problem: 'liability-paid', params: { what: 'dividends', start: f.divOpen, charge: f.divDeclared, end: f.divClose, unit: u }, marks: 2 },
          { label: '(c)', problem: 'scf-frost', params: f, marks: 12 },
        ],
      },
      {
        title: 'Question 2: profit and cash',
        stem: 'A business reports a healthy operating profit but is short of cash.',
        parts: [
          { label: '(a)', problem: 'cfo-indirect', params: cfo.vary(rng), marks: 8 },
          { label: '(b)', problem: 'disposal', params: disp.vary(rng), marks: 4 },
          { label: '(c)', problem: 'scf-full', params: full.vary(rng), marks: 13 },
        ],
      },
    ],
  };
};

export const PAPER_KINDS: PaperKind[] = [
  { id: 'autumn25', title: 'Autumn 2025, as set', blurb: 'The real paper: Knotted, Overload, Onesale and the discretion question, with the real numbers. 4 questions, 100 marks, 120 minutes.', minutes: 120, fixed: true, build: () => autumn25() },
  { id: 'mixed', title: 'A mixed mock: three topics at random', blurb: 'Built like the real exam: three computational questions drawn from accounts, ratios and liquidity, CVP, cash budgeting and variances, plus one written question where you choose A or B. New topics and numbers every time.', minutes: 120, fixed: false, build: mixed },
  { id: 'mock-a', title: 'Mock A: accounts, ratios and variances', blurb: 'Preparing accounts from a list of transactions; liquidity and ratios; all nine variances. Then written question 4, A or B. New numbers every time.', minutes: 120, fixed: false, build: sitting('mock-a', 'Mock A: accounts, ratios and variances', ['accounts', 'ratios', 'variance']) },
  { id: 'mock-b', title: 'Mock B: CVP, cash budget and accounts', blurb: 'Cost–volume–profit; a cash budget with opening balances; preparing accounts. Then written question 4, A or B. New numbers every time.', minutes: 120, fixed: false, build: sitting('mock-b', 'Mock B: CVP, cash budget and accounts', ['cvp', 'budget', 'accounts']) },
  { id: 'mock-c', title: 'Mock C: variances, CVP and cash budget', blurb: 'The variance report; cost–volume–profit; the quarter’s cash budget. Then written question 4, A or B. New numbers every time.', minutes: 120, fixed: false, build: sitting('mock-c', 'Mock C: variances, CVP and cash budget', ['variance', 'cvp', 'budget']) },
  { id: 'fresh', title: 'A fresh Autumn 2025 paper', blurb: 'The real paper’s shape (CVP, liquidity and ratios, standard costing), with new numbers every time. Question 4 lets you choose A or B. 120 minutes.', minutes: 120, fixed: false, build: fresh },
  { id: 'cashflow', title: 'Cash flow clinic', blurb: 'Two cash flow questions with new numbers each time: every working, then the full statement. 50 marks, 60 minutes.', minutes: 60, fixed: false, build: cashflow },
];

/** Marks on offer: where two questions are alternatives, only one of them counts. */
export const totalMarks = (p: Paper) => p.questions.filter((q) => !q.choice || q.choice.option === 0).reduce((s, q) => s + q.parts.reduce((t, x) => t + x.marks, 0), 0);

// ---------------------------------------------------------------- chapter tests

const KIND_MARKS: Record<Problem['kind'], number> = { calc: 4, statement: 8, grid: 8, brief: 4, classify: 3, table: 3, judgement: 6 };
const KIND_MINUTES: Record<Problem['kind'], number> = { calc: 4, statement: 12, grid: 10, brief: 5, classify: 3, table: 3, judgement: 8 };

/**
 * A test of a whole chapter: one question on every idea in it, with fresh numbers, under exam conditions.
 * Passing it ticks the chapter off, for anyone who already knows the material.
 */
export function chapterTest(act: Act, seed: number): Paper {
  const rng = mulberry32(seed);
  const used = new Set<string>();
  const questions: PaperQuestion[] = [];
  let minutes = 0;
  for (const concept of act.concepts) {
    const own = Object.values(PROBLEMS).filter((p) => p.concept === concept && !used.has(p.id) && !isWhichTool(p.id));
    const pool = own.length ? own : problemsFor(concept).filter((p) => !used.has(p.id) && !isWhichTool(p.id));
    if (!pool.length) continue;
    // Calculations and statements first: they are the better test of whether it has really sunk in.
    const worked = pool.filter((p) => hasParams(p));
    const from = worked.length ? worked : pool;
    const p = from[Math.floor(rng() * from.length)];
    used.add(p.id);
    minutes += KIND_MINUTES[p.kind];
    questions.push({
      title: `${questions.length + 1}. ${CONCEPTS[concept].name}`,
      stem: '',
      parts: [{ label: '', problem: p.id, params: hasParams(p) ? p.vary(rng) : undefined, marks: KIND_MARKS[p.kind], concept }],
    });
  }
  return { id: `chapter-${act.number}`, title: `Chapter ${act.numeral} test-out: ${act.title}`, minutes: Math.max(10, Math.ceil(minutes * 1.1)), questions };
}

// ---------------------------------------------------------------- cumulative reviews

export const REVIEW_PREFIX = 'review-';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/** Questions that need more than one chapter, and the first chapter by which a player has met everything they use. */
const CASES: { min: number; build: (rng: () => number, n: number) => PaperQuestion }[] = [
  { min: 4, build: qAccounts },
  { min: 5, build: caseAccountsLiquidity },
  { min: 5, build: caseRatiosFromAccounts },
  { min: 7, build: caseBudgetDebtors },
  { min: 8, build: caseCvpVariances },
  { min: 8, build: caseVarianceCauses },
];

const shuffled = <T,>(rng: () => number, list: readonly T[]): T[] => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/** A problem testing the concept, with fresh numbers if it can have them. */
function drawProblem(concept: ConceptId, used: Set<string>, rng: () => number): { p: Problem; params?: unknown } | null {
  const own = Object.values(PROBLEMS).filter((p) => p.concept === concept && !used.has(p.id) && !isWhichTool(p.id));
  const pool = own.length ? own : problemsFor(concept).filter((p) => !used.has(p.id) && !isWhichTool(p.id));
  if (!pool.length) return null;
  const worked = pool.filter((p) => hasParams(p));
  const from = worked.length ? worked : pool;
  const p = from[Math.floor(rng() * from.length)];
  used.add(p.id);
  return { p, params: hasParams(p) ? p.vary(rng) : undefined };
}

/**
 * A review of chapters I to `upTo` together. Question titles say nothing about the topic: a "which tool?" round, then
 * questions that mix chapters (accounts feeding a liquidity decision, CVP and variances on one cost card, receipts
 * feeding debtors), then single-topic questions drawn from across the chapters, weighted to the latest.
 */
export function reviewTest(upTo: number, seed: number): Paper {
  const rng = mulberry32(seed);
  const acts = ACTS.filter((a) => a.number <= upTo && !a.draft);
  const questions: PaperQuestion[] = [];
  let minutes = 0;
  const add = (q: PaperQuestion, mins: number) => {
    questions.push({ ...q, title: `Question ${questions.length + 1}` });
    minutes += mins;
  };
  const used = new Set<string>();

  if (upTo >= 2) {
    const id = `which-tool-${upTo}`;
    used.add(id);
    add({ title: '', stem: 'Read each question and decide which tool it needs. There’s no hint about which chapter it comes from.', parts: [{ label: '', problem: id, marks: 8 }] }, 4);
  }

  const nCases = upTo >= 8 ? 2 : upTo >= 4 ? 1 : 0;
  const avail = shuffled(rng, CASES.filter((c) => c.min <= upTo)).sort((a, b) => b.min - a.min);
  for (const c of avail.slice(0, nCases)) {
    const q = c.build(rng, 0);
    add(q, q.parts.reduce((t, x) => t + x.marks, 0));
  }

  const target = Math.min(upTo + 1, upTo >= 8 ? 4 : 6);
  const order = [upTo, upTo, ...shuffled(rng, acts.filter((a) => a.number < upTo).map((a) => a.number))].slice(0, target);
  const taken: Record<number, ConceptId[]> = {};
  for (const num of order) {
    const act = acts.find((a) => a.number === num)!;
    const concepts = shuffled(rng, act.concepts.filter((c) => !(taken[num] ?? []).includes(c)));
    let drawn: { p: Problem; params?: unknown } | null = null;
    let concept: ConceptId | null = null;
    for (const c of concepts) {
      drawn = drawProblem(c, used, rng);
      if (drawn) {
        concept = c;
        break;
      }
    }
    if (!drawn || !concept) continue;
    (taken[num] ??= []).push(concept);
    minutes += KIND_MINUTES[drawn.p.kind] * 1.1;
    questions.push({ title: `Question ${questions.length + 1}`, stem: '', parts: [{ label: '', problem: drawn.p.id, params: drawn.params, marks: KIND_MARKS[drawn.p.kind], concept }] });
  }
  return { id: `${REVIEW_PREFIX}${upTo}`, title: `Review: Chapters I${upTo > 1 ? `–${ROMAN[upTo]}` : ''} together`, minutes: Math.max(15, Math.ceil(minutes)), questions };
}

export const CHAPTER_PREFIX = 'chapter-';

/** The kind behind a paper id, including the chapter tests, which are built on the fly. */
export function paperKind(id: string): PaperKind | undefined {
  if (id.startsWith(REVIEW_PREFIX)) {
    const n = Number(id.slice(REVIEW_PREFIX.length));
    if (!ACTS[n - 1] || ACTS[n - 1].draft) return undefined;
    const probe = reviewTest(n, 1);
    return { id, title: probe.title, blurb: '', minutes: probe.minutes, fixed: false, build: (seed) => reviewTest(n, seed) };
  }
  if (!id.startsWith(CHAPTER_PREFIX)) return PAPER_KINDS.find((k) => k.id === id);
  const act = ACTS[Number(id.slice(CHAPTER_PREFIX.length)) - 1];
  if (!act) return undefined;
  const probe = chapterTest(act, 1);
  return { id, title: probe.title, blurb: '', minutes: probe.minutes, fixed: false, build: (seed) => chapterTest(act, seed) };
}
