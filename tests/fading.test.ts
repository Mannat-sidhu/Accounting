import { PROBLEMS } from '../src/content';
import { defensibleRange, markDecision, profitAfter, pushedProfit, stepsOf } from '../src/engine/grading';
import { maxTier, tierFor } from '../src/engine/mastery';
import { mulberry32 } from '../src/engine/rng';
import type { CalcProblem, JudgementProblem } from '../src/engine/types';

describe('help fades', () => {
  it('stage sets the level: new guided, practising on your own, common exam', () => {
    expect(tierFor('new')).toBe('guided');
    expect(tierFor('practising')).toBe('unguided');
    expect(tierFor('common')).toBe('exam');
  });
  it('the stricter of two levels wins', () => {
    expect(maxTier('guided', 'unguided')).toBe('unguided');
    expect(maxTier('exam', undefined, 'guided')).toBe('exam');
  });
  it('without guidance there is no spot move and no formula menu', () => {
    expect(stepsOf({ spot: { question: '', options: [], correct: [], explain: '' } }, 'guided')).toEqual(['spot', 'formula', 'inputs', 'answer', 'decision']);
    expect(stepsOf({}, 'unguided')).toEqual(['inputs', 'answer', 'decision']);
    expect(stepsOf({}, 'exam')).toEqual(['inputs', 'answer', 'decision']);
  });
});

describe('defensible answers', () => {
  it('a loss-making credit-control deal accepted for cash reasons earns part marks, not zero', () => {
    const p = PROBLEMS['credit-control'] as CalcProblem;
    const inst = p.build({ sales: 1825000, daysNow: null, receivables: 500000, to: 30, by: null, funds: 6, cost: 50000, name: 'x' });
    expect(inst.decision.correct).toBe('no');
    expect(markDecision(inst.decision, 'no', 'w0', false).score).toBe(2);
    expect(markDecision(inst.decision, 'yes', 'w3', false).score).toBe(1);
    expect(markDecision(inst.decision, 'yes', 'w1', false).score).toBe(0);
  });
  it('every defensible answer points at a real option and reason, in every variation', () => {
    for (const p of Object.values(PROBLEMS).filter((x): x is CalcProblem => x.kind === 'calc')) {
      const rng = mulberry32(5);
      for (let i = 0; i < 100; i++) {
        const d = p.build(i ? p.vary(rng) : p.base).decision;
        for (const a of d.alsoAccept ?? []) {
          expect(d.options.map((o) => o.id), p.id).toContain(a.option);
          expect(d.why.map((o) => o.id), p.id).toContain(a.why);
          expect(a.option === d.correct && a.why === d.correctWhy, `${p.id}: alternative is not the main answer`).toBe(false);
        }
      }
    }
  });
});

describe('Bull and Bear: a range, not one answer', () => {
  const p = PROBLEMS['bull-bear'] as JudgementProblem;
  it('every item has a best answer and at least one other defensible or stretch option', () => {
    for (const it of p.items) {
      expect(it.options.some((o) => o.verdict === 'best'), it.id).toBe(true);
      expect(it.options.length).toBeGreaterThan(2);
    }
  });
  it('best estimate €18,125,000', () => {
    const best = Object.fromEntries(p.items.map((it) => [it.id, it.options.find((o) => o.verdict === 'best')!.id]));
    expect(profitAfter(p, best)).toBe(18125000);
  });
  it('defensible range €16.8m to €18.95m', () => expect(defensibleRange(p)).toEqual({ lo: 16800000, hi: 18950000 }));
  it('Bill pushes to €22m; Ben stays just over €8m', () => {
    expect(pushedProfit(p, 'high')).toBe(22000000);
    expect(pushedProfit(p, 'low', 8000000)).toBe(9412500);
  });
});
