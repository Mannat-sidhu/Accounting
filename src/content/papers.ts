// Mock exam papers. A paper is a set of questions, each worth 25 marks, built from the same problems as the chapters
// and played under exam conditions: no tips, no feedback until the end, one clock for the whole paper.
import { mulberry32 } from '../engine/rng';
import type { Act, CalcProblem, ConceptId, Problem, StatementProblem } from '../engine/types';
import { ACTS, CONCEPTS, PROBLEMS, hasParams, problemsFor } from './index';
import type { FrostP } from './act-4-problems';
import { OVERLOAD, freshHouse, type FinData } from './act-5-problems';
import { KNOTTED, varyCvp } from './act-6-problems';
import { ONESALE, varyData } from './act-8-problems';

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

/** The same shape with new numbers, so the answers can’t be remembered. */
const fresh = (seed: number): Paper => {
  const rng = mulberry32(seed);
  const cvp = { ...varyCvp(rng), totals: true, product: 'silk ties' };
  const cut = Math.max(1, Math.round((cvp.price - cvp.vc) * 0.2));
  const house = freshHouse(rng);
  const days = Math.round(((house.rec[1] / house.creditSales) * 365));
  const ccTo = Math.max(15, days - 30);
  const funds = 5 + Math.floor(rng() * 6);
  const v = varyData(rng);
  return {
    id: 'fresh',
    title: 'A fresh paper: new numbers',
    minutes: 120,
    questions: [
      cvpQuestion('Question 1: a CVP budget', `A business makes ${cvp.product}. Its budget for the year is based on ${cvp.units.toLocaleString('en-GB')} units.`, cvp, cut, 15),
      ratioQuestion(
        `Question 2: ${house.name}`,
        'The accounts are given. The CFO has two proposals for improving cash management in relation to trade debtors.',
        house,
        { inv: 60, deb: 70, cover: 4 },
        { sales: house.creditSales, daysNow: null, receivables: house.rec[1], to: ccTo, by: null, funds, cost: 10000 + Math.round(rng() * 8) * 5000, name: house.name },
        { receivables: house.rec[1], sales: 0, days: 0, eligible: 75, advance: 80, facility: 2 + Math.floor(rng() * 2), fee: 5000 + Math.round(rng() * 6) * 5000, funds, limit: null },
      ),
      varianceQuestion('Question 3: a standard-cost business', `A business makes ${v.product}. Budgeted and actual figures for the last year are given.`, v),
      Q4,
    ],
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
  { id: 'fresh', title: 'A fresh paper', blurb: 'The same shape, new numbers every time, so you can’t remember the answers. 4 questions, 100 marks, 120 minutes.', minutes: 120, fixed: false, build: fresh },
  { id: 'cashflow', title: 'Cash flow clinic', blurb: 'Two cash flow questions with new numbers each time: every working, then the full statement. 50 marks, 60 minutes.', minutes: 60, fixed: false, build: cashflow },
];

export const totalMarks = (p: Paper) => p.questions.reduce((s, q) => s + q.parts.reduce((t, x) => t + x.marks, 0), 0);

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
    const own = Object.values(PROBLEMS).filter((p) => p.concept === concept && !used.has(p.id));
    const pool = own.length ? own : problemsFor(concept).filter((p) => !used.has(p.id));
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

export const CHAPTER_PREFIX = 'chapter-';

/** The kind behind a paper id, including the chapter tests, which are built on the fly. */
export function paperKind(id: string): PaperKind | undefined {
  if (!id.startsWith(CHAPTER_PREFIX)) return PAPER_KINDS.find((k) => k.id === id);
  const act = ACTS[Number(id.slice(CHAPTER_PREFIX.length)) - 1];
  if (!act) return undefined;
  const probe = chapterTest(act, 1);
  return { id, title: probe.title, blurb: '', minutes: probe.minutes, fixed: false, build: (seed) => chapterTest(act, seed) };
}
