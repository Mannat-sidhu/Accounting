import { ACTS, CONCEPTS, PROBLEMS } from '../src/content';
import { PAPER_KINDS, REVIEW_PREFIX, paperKind, reviewTest, totalMarks } from '../src/content/papers';
import { isWhichTool, WHICH_TOOL_PROBLEMS } from '../src/content/which-tool';
import { expectedValues } from '../src/engine/grading';
import type { CalcProblem, ClassifyProblem } from '../src/engine/types';

const answer = (id: string, params: unknown) => {
  const inst = (PROBLEMS[id] as CalcProblem).build(params);
  return inst.solve(expectedValues(inst.inputs));
};
const finite = (id: string, params: unknown) => {
  const p = PROBLEMS[id] as CalcProblem;
  const inst = p.build(params ?? p.base);
  return Number.isFinite(inst.solve(expectedValues(inst.inputs)));
};

describe('cumulative reviews', () => {
  const live = ACTS.filter((a) => !a.draft && a.number >= 2);
  it('each review draws only on chapters up to its own, and says nothing about the topic in its titles', () => {
    for (const act of live)
      for (let seed = 1; seed <= 12; seed++) {
        const paper = reviewTest(act.number, seed);
        for (const q of paper.questions) {
          expect(q.title, 'blind titles').toMatch(/^Question \d+$/);
          for (const part of q.parts) {
            const prob = PROBLEMS[part.problem];
            expect(prob, part.problem).toBeDefined();
            const concept = part.concept ?? prob.concept;
            expect(CONCEPTS[concept].act, `${act.numeral} seed ${seed}: ${part.problem} (${concept})`).toBeLessThanOrEqual(act.number);
            if (prob.kind === 'calc') expect(finite(part.problem, part.params), `${part.problem}`).toBe(true);
          }
        }
        expect(paper.minutes).toBeGreaterThan(14);
        expect(paper.minutes).toBeLessThan(110);
      }
  });
  it('the latest chapter is always examined, and later reviews include a case that needs several chapters', () => {
    for (const act of live) {
      let sawCase = false;
      for (let seed = 1; seed <= 12; seed++) {
        const paper = reviewTest(act.number, seed);
        const chapters = paper.questions.flatMap((q) => q.parts.map((p) => CONCEPTS[p.concept ?? PROBLEMS[p.problem].concept].act));
        expect(chapters, `${act.numeral} seed ${seed} includes the newest chapter`).toContain(act.number);
        if (paper.questions.some((q) => q.parts.length > 2)) sawCase = true;
      }
      if (act.number >= 4) expect(sawCase, `Chapter ${act.numeral} review has a case`).toBe(true);
    }
  });
  it('is reachable by id', () => {
    for (const act of live) expect(paperKind(`${REVIEW_PREFIX}${act.number}`)?.title).toContain('Review');
    expect(paperKind(`${REVIEW_PREFIX}10`)).toBeUndefined();
  });
  it('“Which tool?” only offers the tools met so far, and each item has a home', () => {
    for (const p of WHICH_TOOL_PROBLEMS as ClassifyProblem[]) {
      expect(isWhichTool(p.id)).toBe(true);
      const cats = new Set(p.categories.map((c) => c.id));
      for (const it of p.items) expect(cats.has(it.category), it.text).toBe(true);
      expect(p.items.length).toBeGreaterThanOrEqual(5);
    }
    const first = WHICH_TOOL_PROBLEMS[0] as ClassifyProblem;
    expect(first.categories.map((c) => c.id)).toEqual(['bs']);
  });
});

describe('mock exams use the sample papers’ shapes', () => {
  it('each sitting is four questions of 25 marks, with a real choice for question 4', () => {
    for (const k of PAPER_KINDS.filter((k) => ['mixed', 'mock-a', 'mock-b', 'mock-c', 'fresh'].includes(k.id)))
      for (let seed = 1; seed <= 20; seed++) {
        const p = k.build(seed);
        expect(totalMarks(p), `${k.id} ${seed}`).toBe(100);
        const [a, b] = p.questions.slice(3);
        expect(a.title).not.toBe(b.title);
        for (const q of p.questions) expect(q.parts.reduce((s, x) => s + x.marks, 0)).toBe(25);
      }
  });
});

describe('cross-chapter questions reproduce the sample papers’ worked answers', () => {
  it('Sample Exam Two Q3: March receipts 410,000 and debtors 420,000', () => {
    const base = { sales: [300000, 400000, 500000], months: ['January', 'February', 'March'], cashPct: 40, oneMonthShare: 50 };
    expect(answer('receipts-split', { ...base, kind: 'receipts' })).toBeCloseTo(410000, 4);
    expect(answer('receipts-split', { ...base, kind: 'debtors' })).toBeCloseTo(420000, 4);
  });
  it('Sample Exam Two Q1(D): a €50,000 campaign and a €10 price cut for 40% more volume leaves profit at 90,000', () => {
    const p = { product: 'units', unit: 'units', price: 80, vc: 50, fixed: 840000, units: 35000, period: 'a year', cut: 10, lift: 40, ask: 'profit', extra: 50000 };
    expect(answer('cvp-whatif', p)).toBeCloseTo(90000, 4);
  });
  it('Sample Exam Two Q2: the three proposals, 5,000, (11,500) and 20,280', () => {
    expect(answer('credit-control', { sales: 7300000, daysNow: null, receivables: 800000, to: 30, by: null, funds: 10, cost: 15000, name: 'x' })).toBeCloseTo(5000, 0);
    expect(answer('prompt-discount', { sales: 7300000, takeUp: 50, discount: 1, daysNow: 40, daysAfter: 15, funds: 10, takersOnly: true })).toBeCloseTo(-11500, 0);
    expect(answer('invoice-discounting', { receivables: 800000, sales: 0, days: 0, eligible: 90, advance: 70, facility: 3, fee: 15000, funds: 10, limit: null })).toBeCloseTo(20280, 0);
  });
  it('Sample Exam One Q3: price 282,000 favourable, volume (156,000) adverse, usage 30,000 adverse', () => {
    const eureka = { product: 'units', budgetUnits: 100000, budgetPrice: 50, actualUnits: 94000, actualPrice: 53, stdQty: 2, matRate: 5, matUnit: 'kg', actQty: 194000, actCost: 1020000, stdHrs: 1, labRate: 12, actHrs: 103000, actPay: 1180000, otherVar: 2, voRate: 2, actVo: 206000, fixedBudget: 600000, fixedActual: 600000 };
    expect(answer('var-sales', { kind: 'sales-price', d: eureka })).toBeCloseTo(282000, 4);
    expect(answer('var-sales', { kind: 'sales-volume', d: eureka })).toBeCloseTo(-156000, 4);
    expect(answer('var-materials', { kind: 'mat-qty', d: eureka })).toBeCloseTo(30000, 4);
  });
});

describe('the cases never ask for a negative saving of days', () => {
  it('prompt-discount parts in the mixed papers always cut days', () => {
    for (let seed = 1; seed <= 200; seed++)
      for (const k of PAPER_KINDS.filter((x) => x.id === 'mixed' || x.id === 'mock-a')) {
        for (const q of k.build(seed).questions) for (const part of q.parts) if (part.problem === 'prompt-discount') expect((part.params as { daysNow: number; daysAfter: number }).daysNow, `${seed}`).toBeGreaterThan((part.params as { daysAfter: number }).daysAfter);
      }
    for (let seed = 1; seed <= 100; seed++) for (const q of reviewTest(9, seed).questions) for (const part of q.parts) if (part.problem === 'prompt-discount') expect((part.params as { daysNow: number; daysAfter: number }).daysNow).toBeGreaterThan((part.params as { daysAfter: number }).daysAfter);
  });
});
