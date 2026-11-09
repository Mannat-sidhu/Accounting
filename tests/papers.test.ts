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
        expect(totalMarks(paper), `${kind.id} total`).toBe(kind.id === 'cashflow' ? 50 : 100);
      }
    });
  }
  it('the real paper is 100 marks in 120 minutes; the clinic is 50 in 60', () => {
    const real = PAPER_KINDS.find((k) => k.id === 'autumn25')!.build(1);
    expect([totalMarks(real), real.minutes]).toEqual([100, 120]);
    const clinic = PAPER_KINDS.find((k) => k.id === 'cashflow')!.build(1);
    expect([totalMarks(clinic), clinic.minutes]).toEqual([50, 60]);
  });
  it('Autumn 2025 numbers: Knotted (A) is €40 a tie; Overload (C) proposals (29,000) and (13,000)', () => {
    const q = PAPER_KINDS.find((k) => k.id === 'autumn25')!.build(1).questions;
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
      const q1 = PAPER_KINDS.find((k) => k.id === 'cashflow')!.build(seed).questions[0];
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

describe('mock exams in the real format', () => {
  const kinds = ['mixed', 'mock-a', 'mock-b', 'mock-c', 'fresh'].map((id) => PAPER_KINDS.find((k) => k.id === id)!);
  it('three computational questions, then a written question with two options to choose from', () => {
    for (const k of kinds)
      for (let seed = 1; seed <= 10; seed++) {
        const p = k.build(seed);
        expect(p.questions.length, k.id).toBe(5);
        const [a, b] = [p.questions[3], p.questions[4]];
        expect(a.choice?.group).toBe('q4');
        expect(b.choice?.group).toBe('q4');
        expect([a.choice!.option, b.choice!.option]).toEqual([0, 1]);
        expect(p.questions.slice(0, 3).every((q) => !q.choice)).toBe(true);
        expect(totalMarks(p)).toBe(100);
      }
  });
  it('the mixed mock draws three different topics and varies with the seed', () => {
    const mixed = kinds[0];
    const seen = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) {
      const titles = mixed.build(seed).questions.slice(0, 3).map((q) => q.title.replace(/^Question \d: /, ''));
      expect(new Set(titles).size).toBe(3);
      seen.add(titles.join('|'));
    }
    expect(seen.size).toBeGreaterThan(5);
  });
  it('new numbers every time: two sittings never share the same variance data', () => {
    const c = kinds[3];
    const p1 = JSON.stringify(c.build(1).questions[0].parts[1].params);
    const p2 = JSON.stringify(c.build(2).questions[0].parts[1].params);
    expect(p1).not.toBe(p2);
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

import { ACTS as ALL_ACTS, CONCEPTS as ALL_CONCEPTS } from '../src/content';
import { chapterTest } from '../src/content/papers';
import { TEST_OUT_PASS, testOutChapter } from '../src/engine/mastery';

describe('chapter test-outs', () => {
  for (const act of ALL_ACTS.filter((a) => !a.draft)) {
    it(`Chapter ${act.numeral} tests every idea it teaches`, () => {
      for (const seed of [1, 2, 3, 4, 5]) {
        const paper = chapterTest(act, seed);
        const tested = new Set(paper.questions.flatMap((q) => q.parts.map((p) => p.concept)));
        for (const c of act.concepts) expect(tested.has(c), `${act.numeral}: ${c} (${ALL_CONCEPTS[c].name}) is not tested`).toBe(true);
        for (const q of paper.questions) for (const p of q.parts) expect(PROBLEMS[p.problem], p.problem).toBeTruthy();
        expect(paper.minutes).toBeGreaterThan(5);
      }
    });
  }

  it('ticks off the episodes and the boss, and promotes only what was shown', () => {
    const act = ALL_ACTS[3];
    const byConcept = Object.fromEntries(act.concepts.map((c, i) => [c, { got: i === 0 ? 1 : 4, of: 4 }]));
    const out = testOutChapter(freshSave(), { sessionIds: act.sessions.map((s) => s.id), boss: act.number, concepts: act.concepts }, byConcept, Date.now());
    for (const s of act.sessions) expect(out.sessions[s.id].testedOut).toBe(true);
    expect(out.bosses[act.number].testedOut).toBe(true);
    expect(out.mastery[act.concepts[0]].stage).toBe('new');
    expect(out.mastery[act.concepts[1]].stage).toBe('practising');
    expect(TEST_OUT_PASS).toBe(0.75);
  });

  it('never overwrites an episode that was actually played', () => {
    const act = ALL_ACTS[3];
    const save = freshSave();
    save.sessions[act.sessions[0].id] = { at: 1, score: 9, max: 10 };
    const out = testOutChapter(save, { sessionIds: act.sessions.map((s) => s.id), boss: null, concepts: [] }, {}, Date.now());
    expect(out.sessions[act.sessions[0].id].score).toBe(9);
    expect(out.sessions[act.sessions[0].id].testedOut).toBeUndefined();
  });
});
