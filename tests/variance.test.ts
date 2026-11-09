import { PROBLEMS } from '../src/content';
import { ACTS } from '../src/content';
import { ALL_KINDS, NAMES, SCARVES, actualProfit, budgetProfit, profitEffect, varyData, variance, type VarData } from '../src/content/act-8-problems';
import { expectedValues } from '../src/engine/grading';
import { mulberry32 } from '../src/engine/rng';
import type { CalcProblem } from '../src/engine/types';

const answerOf = (id: string, params: unknown) => {
  const p = PROBLEMS[id] as CalcProblem;
  const inst = p.build(params);
  return inst.solve(expectedValues(inst.inputs));
};

// Two worked question sets from the course, rebuilt as data: the solver must reproduce the worked answers.
const CLASS_Q: VarData = {
  product: 'goormay', budgetUnits: 250000, budgetPrice: 20, actualUnits: 240000, actualPrice: 21,
  stdQty: 0.5, matRate: 4, matUnit: 'kg', actQty: 125000, actCost: 487500,
  stdHrs: 2, labRate: 3, actHrs: 500000, actPay: 1490000, otherVar: 2, voRate: 1, actVo: 495000,
  fixedBudget: 1000000, fixedActual: 1027500,
};
const BIG_CHANGE: VarData = {
  product: 'units', budgetUnits: 50000, budgetPrice: 80, actualUnits: 52000, actualPrice: 82,
  stdQty: 1.5, matRate: 10, matUnit: 'kg', actQty: 77000, actCost: 885500,
  stdHrs: 2, labRate: 15, actHrs: 108000, actPay: 1512000, otherVar: 5, voRate: 2.5, actVo: 232200,
  fixedBudget: 1000000, fixedActual: 1025000,
};

describe('variances reproduce the worked answers', () => {
  it('class question: every variance, and 1,500,000 to 1,540,000', () => {
    const v = Object.fromEntries(ALL_KINDS.map((k) => [k, variance(k, CLASS_Q).v]));
    expect(v['mat-rate']).toBeCloseTo(-12500, 6);
    expect(v['mat-qty']).toBeCloseTo(20000, 6);
    expect(v['lab-rate']).toBeCloseTo(-10000, 6);
    expect(v['lab-eff']).toBeCloseTo(60000, 6);
    expect(v['vo-rate']).toBeCloseTo(-5000, 6);
    expect(v['vo-eff']).toBeCloseTo(20000, 6);
    expect(v['fixed']).toBeCloseTo(27500, 6);
    expect(v['sales-price']).toBeCloseTo(240000, 6);
    expect(v['sales-volume']).toBeCloseTo(-100000, 6);
    expect(budgetProfit(CLASS_Q)).toBeCloseTo(1500000, 6);
    expect(actualProfit(CLASS_Q)).toBeCloseTo(1540000, 6);
  });
  it('week 10 bank: Big Change', () => {
    const v = Object.fromEntries(ALL_KINDS.map((k) => [k, variance(k, BIG_CHANGE).v]));
    expect(v['mat-rate']).toBeCloseTo(115500, 6);
    expect(v['mat-qty']).toBeCloseTo(-10000, 6);
    expect(v['lab-rate']).toBeCloseTo(-108000, 6);
    expect(v['lab-eff']).toBeCloseTo(60000, 6);
    expect(v['vo-rate']).toBeCloseTo(-37800, 6);
    expect(v['vo-eff']).toBeCloseTo(10000, 6);
    expect(v['fixed']).toBeCloseTo(25000, 6);
    expect(v['sales-price']).toBeCloseTo(104000, 6);
    expect(v['sales-volume']).toBeCloseTo(60000, 6);
    expect(budgetProfit(BIG_CHANGE)).toBeCloseTo(500000, 6);
    expect(actualProfit(BIG_CHANGE)).toBeCloseTo(609300, 6);
  });
  it('the game’s own problems give the same answers as the bank', () => {
    expect(answerOf('var-materials', { kind: 'mat-rate', d: BIG_CHANGE })).toBeCloseTo(115500, 6);
    expect(answerOf('var-overheads', { kind: 'vo-rate', d: BIG_CHANGE })).toBeCloseTo(-37800, 6);
    expect(answerOf('var-overheads', { kind: 'fixed', d: CLASS_Q })).toBeCloseTo(27500, 6);
    expect(answerOf('var-budget-profit', { d: BIG_CHANGE, kind: 'budget' })).toBeCloseTo(500000, 6);
  });
  it('working back (Tricky): 15.60 an hour, and 6,000 favourable once 800 idle hours are set aside', () => {
    const tricky: VarData = { ...BIG_CHANGE, actualUnits: 4900, stdHrs: 4, labRate: 15, actHrs: 20000, actPay: 312000 };
    expect(variance('lab-rate', tricky).v).toBeCloseTo(12000, 6);
    expect(answerOf('var-reverse', { d: tricky, kind: 'back-rate', lost: 800 })).toBeCloseTo(15.6, 6);
    expect(answerOf('var-reverse', { d: tricky, kind: 'idle', lost: 800 })).toBeCloseTo(-6000, 6);
  });
});

describe('the boss and random data', () => {
  it('the bridge always lands on actual profit (300 random sets)', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 300; i++) {
      const d = varyData(rng);
      const bridge = budgetProfit(d) + ALL_KINDS.reduce((s, k) => s + profitEffect(k, d), 0);
      expect(bridge, `set ${i}`).toBeCloseTo(actualProfit(d), 4);
      for (const k of ALL_KINDS) expect(Math.abs(variance(k, d).v), `${i}/${k} is not zero`).toBeGreaterThan(0);
      // every actual price is a clean two-decimal figure
      expect((d.actCost / d.actQty) * 100).toBeCloseTo(Math.round((d.actCost / d.actQty) * 100), 6);
      expect((d.actPay / d.actHrs) * 100).toBeCloseTo(Math.round((d.actPay / d.actHrs) * 100), 6);
      expect((d.actVo! / d.actHrs) * 100).toBeCloseTo(Math.round((d.actVo! / d.actHrs) * 100), 6);
    }
  });
  it('the scarf maker boss reconciles and its pieces are the ones in the chapter', () => {
    expect(budgetProfit(SCARVES) + ALL_KINDS.reduce((s, k) => s + profitEffect(k, SCARVES), 0)).toBeCloseTo(actualProfit(SCARVES), 6);
    const ids = ACTS[7].boss!.problems.map((p) => p.problem);
    expect(ids.length).toBe(12);
    for (const k of ALL_KINDS) expect(NAMES[k].name.length).toBeGreaterThan(3);
  });
});
