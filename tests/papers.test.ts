import { CONCEPTS, PROBLEMS } from '../src/content';
import { EVERYDAY } from '../src/content/everyday';
import { GLOSSARY, TERM_REGEX, entryFor } from '../src/content/glossary';
import { PAPER_KINDS, totalMarks } from '../src/content/papers';
import { expectedValues, markBrief, sectionSums, truePlacements } from '../src/engine/grading';
import { pickDrillSet, tierFor } from '../src/engine/mastery';
import { freshSave } from '../src/engine/save';
import type { BriefProblem, CalcProblem, StatementProblem } from '../src/engine/types';

describe('mock exam papers', () => {
  for (const kind of PAPER_KINDS) {
    it(`${kind.title}: builds, adds up, and every part answers with a finite number (20 seeds)`, () => {
      for (let seed = 1; seed <= (kind.fixed ? 1 : 20); seed++) {
        const paper = kind.build(seed);
        expect(paper.questions.length).toBeGreaterThan(0);
        const parts = paper.questions.flatMap((q) => q.parts);
        for (const p of parts) {
          const prob = PROBLEMS[p.problem];
          expect(prob, `${kind.id}: ${p.problem}`).toBeDefined();
          if (prob.kind === 'calc') {
            const inst = (prob as CalcProblem).build(p.params ?? (prob as CalcProblem).base);
            expect(Number.isFinite(inst.solve(expectedValues(inst.inputs))), `${kind.id}/${p.label}`).toBe(true);
          }
        }
        for (const q of paper.questions) expect(q.parts.reduce((s, x) => s + x.marks, 0), `${kind.id}: ${q.title}`).toBe(25);
      }
    });
  }
  it('the real paper is 100 marks in 120 minutes; the clinic is 50 in 60', () => {
    const real = PAPER_KINDS[0].build(1);
    expect([totalMarks(real), real.minutes]).toEqual([100, 120]);
    const clinic = PAPER_KINDS[2].build(1);
    expect([totalMarks(clinic), clinic.minutes]).toEqual([50, 60]);
  });
  it('Autumn 2025 numbers: Knotted (A) is €40 a tie; Overload (C) proposals (29,000) and (13,000)', () => {
    const q = PAPER_KINDS[0].build(1).questions;
    const ans = (label: string, qi: number) => {
      const p = q[qi].parts.find((x) => x.label === label)!;
      const prob = PROBLEMS[p.problem] as CalcProblem;
      const inst = prob.build(p.params ?? prob.base);
      return inst.solve(expectedValues(inst.inputs));
    };
    expect(ans('(A)', 0)).toBeCloseTo(40, 6);
    expect(ans('(C) Proposal 1', 1)).toBeCloseTo(-29000, 0);
    expect(ans('(C) Proposal 2', 1)).toBeCloseTo(-13000, 0);
    expect(ans('(A) b', 2)).toBeCloseTo(24000, 0);
  });
  it('the varied cash flow clinic reconciles: the statement and the stated target agree (30 seeds)', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const q1 = PAPER_KINDS[2].build(seed).questions[0];
      const cce = q1.parts[0];
      const inst = (PROBLEMS['cce-change'] as CalcProblem).build(cce.params);
      const target = inst.solve(expectedValues(inst.inputs));
      const stm = q1.parts[q1.parts.length - 1];
      const sp = PROBLEMS[stm.problem] as StatementProblem;
      const built = sp.build(stm.params);
      const sums = sectionSums(built, truePlacements(built));
      expect(sums.op + sums.inv + sums.fin, `seed ${seed}`).toBeCloseTo(target, 6);
    }
  });
});

describe('written answers with a cap', () => {
  const p = PROBLEMS['budget-benefits'] as BriefProblem;
  const keys = p.cards.map((c, i) => ({ c, i })).filter((x) => x.c.kind === 'key').map((x) => x.i);
  it('"describe four" caps at four however many are ticked', () => expect(markBrief(p.cards, keys, p.cap).score).toBe(4));
  it('three right points score three', () => expect(markBrief(p.cards, keys.slice(0, 3), p.cap).score).toBe(3));
  it('a wrong point costs one', () => {
    const trap = p.cards.findIndex((c) => c.kind === 'trap');
    expect(markBrief(p.cards, [...keys.slice(0, 3), trap], p.cap).score).toBe(2);
  });
});

describe('plain English layer', () => {
  it('every idea has an everyday picture', () => {
    for (const id of Object.keys(CONCEPTS)) expect(EVERYDAY[id], id).toBeTruthy();
  });
  it('no everyday picture mentions the course', () => expect(Object.values(EVERYDAY).join(' ')).not.toMatch(/lecture|textbook|slides|exam script/i));
  it('glossary entries point at real ideas', () => {
    for (const g of GLOSSARY) if (g.concept) expect(CONCEPTS[g.concept], g.terms[0]).toBeDefined();
  });
  it('the longest term wins, and the match works without lookbehind', () => {
    const m = [...'Trade receivables rose.'.matchAll(TERM_REGEX)];
    expect(m[0][2].toLowerCase()).toBe('trade receivables');
    expect(entryFor(m[0][2])?.terms[0]).toBe('trade receivables');
    expect([...'a subassetx'.matchAll(TERM_REGEX)].length).toBe(0);
  });
});

describe('daily drill', () => {
  const now = Date.now();
  it('is empty before anything is met, and picks due ideas first', () => {
    const s = freshSave();
    expect(pickDrillSet(s, Object.keys(CONCEPTS), 6, now)).toEqual([]);
    s.mastery['cash-jar'] = { stage: 'new', wins: [], checkLevel: 0, dueAt: null, dueAfterSession: null, attempts: 2, cleanAttempts: 0, lapses: 0, lastSeen: now };
    s.mastery['break-even'] = { stage: 'common', wins: [], checkLevel: 0, dueAt: now - 1, dueAfterSession: null, attempts: 4, cleanAttempts: 4, lapses: 0, lastSeen: now };
    const set = pickDrillSet(s, Object.keys(CONCEPTS), 6, now);
    expect(set[0]).toBe('break-even');
    expect(set).toContain('cash-jar');
  });
  it('stage sets the level used', () => expect(tierFor('common')).toBe('exam'));
});
