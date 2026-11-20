import { describe, expect, it } from 'vitest';
import { ACTS, PROBLEMS } from '../src/content';
import { REAL_PROBLEMS, SOURCES } from '../src/content/real-companies';
import { expectedValues } from '../src/engine/grading';
import type { CalcProblem } from '../src/engine/types';

const inst = (id: string) => {
  const p = PROBLEMS[id] as CalcProblem;
  return p.build(p.base);
};
const answerOf = (id: string) => {
  const i = inst(id);
  return i.solve(expectedValues(i.inputs));
};

describe('real company check-ins (figures from the published statements)', () => {
  it('B&M gross margin: 2,105 ÷ 5,775 = 36.45%', () => expect(answerOf('real-bm-margin')).toBeCloseTo(36.45, 2));
  it('Games Workshop free cash flow: 267.7 − 49.4 = 218.3, covering 160.1 of dividends', () => {
    expect(answerOf('real-gw-cash')).toBeCloseTo(218.3, 6);
    expect(inst('real-gw-cash').decision.correct).toBe('covered');
  });
  it('tonies operating cash: 5,873 (5,874 published, rounded)', () => {
    expect(answerOf('real-tonies-cash')).toBe(5873);
    expect(inst('real-tonies-cash').decision.correct).toBe('stock');
  });
  it('Games Workshop ROCE: 275.0 ÷ 387.8 = 70.9%', () => expect(answerOf('real-gw-roce')).toBeCloseTo(70.9, 1));
  it('B&M inventory days: 866 ÷ 3,670 × 365 = 86.1', () => expect(answerOf('real-bm-invdays')).toBeCloseTo(86.1, 1));

  it('every check-in shows its source', () => {
    const all = Object.values(SOURCES);
    for (const p of REAL_PROBLEMS) {
      const caption = inst(p.id).data?.caption;
      expect(caption, p.id).toBeDefined();
      expect(all).toContain(caption);
    }
  });

  it('a replay shows the same published figures', () => {
    for (const p of REAL_PROBLEMS) expect(p.vary(Math.random)).toEqual(p.base);
  });

  it('each check-in sits in its episode, straight after a story beat', () => {
    const where: Record<string, string> = { 'real-bm-margin': 'a3s1', 'real-gw-cash': 'a4s2', 'real-tonies-cash': 'a4s3', 'real-gw-roce': 'a5s1', 'real-bm-invdays': 'a5s2' };
    const sessions = ACTS.flatMap((a) => a.sessions);
    for (const [id, sid] of Object.entries(where)) {
      const parts = sessions.find((s) => s.id === sid)!.parts;
      const i = parts.findIndex((x) => x.kind === 'problem' && x.problem === id);
      expect(i, `${id} in ${sid}`).toBeGreaterThan(0);
      const before = parts[i - 1];
      expect(before.kind).toBe('story');
      if (before.kind === 'story') expect(before.beats[0].text).toMatch(/^Real company check-in/);
    }
  });
});
