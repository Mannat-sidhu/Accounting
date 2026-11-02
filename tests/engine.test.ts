import { PROBLEMS } from '../src/content';
import { markAnswer, markInputs, markSpot, normalise, withinTolerance } from '../src/engine/grading';
import { isDue, pickSpotCheck, recordAttempt, recordSpotCheck, separateSittings } from '../src/engine/mastery';
import { freshSave, migrate } from '../src/engine/save';
import { parseNumber } from '../src/engine/format';
import type { CalcProblem } from '../src/engine/types';

describe('tolerance and input', () => {
  it('accepts ±0.5% on euro answers', () => {
    expect(withinTolerance(196500, 196000, 'eur')).toBe(true);
    expect(withinTolerance(199000, 196000, 'eur')).toBe(false);
  });
  it('reads 0.06 or 6 as 6%', () => {
    expect(normalise(0.06, 'pct', 6)).toBeCloseTo(6);
    expect(normalise(6, 'pct', 6)).toBe(6);
  });
  it('reads brackets as negatives, as in a set of accounts', () => {
    expect(parseNumber('(15,000)')).toBe(-15000);
    expect(parseNumber('−7,000')).toBe(-7000);
    expect(parseNumber('100 days')).toBe(100);
  });
});

describe('error carried forward', () => {
  const p = PROBLEMS['cash-collected'] as CalcProblem;
  const inst = p.build(p.base);
  it('right maths from the wrong inputs earns the answer mark', () => {
    const inputs = { S: 18000, I: 240000, E: 26000 };
    expect(markInputs(inst.inputs, inputs, false).correct).toBe(false);
    const res = markAnswer(inst, inst.solve(inputs), inputs, false);
    expect(res.ecf).toBe(true);
    expect(res.score).toBe(2);
  });
  it('a wrong answer that doesn’t follow from her inputs scores 0', () => expect(markAnswer(inst, 240000, { S: 18000, I: 240000, E: 62000 }, false).score).toBe(0));
  it('a tip halves the mark', () => expect(markAnswer(inst, 196000, null, true).score).toBe(1));
});

describe('spot move', () => {
  const spec = { question: '', options: [{ id: 'a', label: '' }, { id: 'b', label: '' }, { id: 'c', label: '' }, { id: 'd', label: '' }], correct: ['a', 'b', 'c'], explain: '' };
  it('all right: 2', () => expect(markSpot(spec, ['a', 'b', 'c'], false).score).toBe(2));
  it('mostly right: 1', () => expect(markSpot(spec, ['a', 'b'], false).score).toBe(1));
  it('an extra wrong pick loses the full mark', () => expect(markSpot(spec, ['a', 'b', 'c', 'd'], false).score).toBe(1));
});

describe('saves', () => {
  it('a finance-game save is refused', () => {
    const finance = { ...freshSave(), edition: undefined };
    expect(() => migrate(finance)).toThrow();
    expect(migrate(freshSave()).edition).toBe('accounts');
  });
});

describe('mastery', () => {
  const t0 = new Date('2026-11-01T09:00:00').getTime();
  const h = 3_600_000;
  it('two clean answers in the same sitting do not promote', () => {
    let s = freshSave();
    s = recordAttempt(s, 'cash-jar', true, t0).save;
    expect(recordAttempt(s, 'cash-jar', true, t0 + h).promotedTo).toBeNull();
  });
  it('two clean answers 6+ hours apart promote', () => {
    let s = freshSave();
    s = recordAttempt(s, 'cash-jar', true, t0).save;
    expect(recordAttempt(s, 'cash-jar', true, t0 + 7 * h).promotedTo).toBe('practising');
  });
  it('separate days count', () => expect(separateSittings(new Date('2026-11-01T23:00').getTime(), new Date('2026-11-02T01:00').getTime())).toBe(true));
  it('a missed pop quiz drops back to Practising', () => {
    let s = freshSave();
    s.mastery['cash-jar'] = { stage: 'common', wins: [], checkLevel: 0, dueAt: t0, dueAfterSession: null, attempts: 4, cleanAttempts: 4, lapses: 0, lastSeen: t0 };
    expect(isDue(s, 'cash-jar', t0 + 1)).toBe(true);
    expect(pickSpotCheck(s, ['cash-jar'], [], t0 + 1)).toBe('cash-jar');
    s = recordSpotCheck(s, 'cash-jar', false, t0 + 1);
    expect(s.mastery['cash-jar'].stage).toBe('practising');
  });
});
