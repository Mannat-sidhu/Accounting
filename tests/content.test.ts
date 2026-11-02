import { ACTS, CONCEPTS, METHODS, PROBLEMS, problemsFor } from '../src/content';
import { expectedValues, markSubtotals, markTotals, markWorksheet, sectionSums, truePlacements } from '../src/engine/grading';
import { mulberry32 } from '../src/engine/rng';
import type { CalcProblem, GridProblem, ProblemInstance, StatementInstance, StatementProblem } from '../src/engine/types';

const BANNED = /lecture|lecturer|textbook|exam script|McLaney|Atrill|BMA|Brightspace/i;
const BROKEN = /NaN|undefined|Infinity/;

const all = Object.values(PROBLEMS);
const calcs = all.filter((p): p is CalcProblem => p.kind === 'calc');
const statements = all.filter((p): p is StatementProblem => p.kind === 'statement');
const grids = all.filter((p): p is GridProblem => p.kind === 'grid');

function checkCalc(id: string, inst: ProblemInstance) {
  const answer = inst.solve(expectedValues(inst.inputs));
  expect(Number.isFinite(answer), `${id}: answer finite`).toBe(true);
  expect(inst.formula.options, `${id}: correct formula offered`).toContain(inst.formula.correct);
  for (const m of inst.formula.options) expect(METHODS[m], `${id}: method ${m} exists`).toBeDefined();
  expect(new Set(inst.formula.options).size, `${id}: no duplicate formula options`).toBe(inst.formula.options.length);
  expect(inst.decision.options.map((o) => o.id)).toContain(inst.decision.correct);
  expect(inst.decision.why.map((o) => o.id)).toContain(inst.decision.correctWhy);
  for (const o of inst.decision.options) expect(inst.outcomes[o.id], `${id}: outcome for ${o.id}`).toBeDefined();
  if (inst.spot) for (const c of inst.spot.correct) expect(inst.spot.options.map((o) => o.id), `${id}: spot answer offered`).toContain(c);
  expect(new Set(inst.inputs.map((i) => i.key)).size).toBe(inst.inputs.length);
  for (const i of inst.inputs) expect(Number.isFinite(i.expected), `${id}: input ${i.key} finite`).toBe(true);
  const text = [
    ...inst.prompt.map((b) => (typeof b === 'string' ? b : b.text)),
    inst.ask,
    inst.answer.explain,
    inst.decision.explain,
    inst.decision.question,
    ...inst.decision.options.map((o) => o.label),
    ...inst.working,
    inst.cfoLine,
    ...inst.inputs.map((i) => i.explain),
    ...(inst.spot ? [inst.spot.question, ...inst.spot.options.map((o) => o.label)] : []),
  ].join(' ');
  expect(text, `${id}: no broken numbers`).not.toMatch(BROKEN);
  expect(text, `${id}: no course references`).not.toMatch(BANNED);
}

function checkStatement(id: string, inst: StatementInstance) {
  const ids = new Set(inst.sections.map((s) => s.id));
  for (const it of inst.items) {
    expect(ids.has(it.section) || it.section === 'none', `${id}: ${it.id} has a real section`).toBe(true);
    expect(Number.isFinite(it.amount) && it.amount >= 0, `${id}: ${it.id} amount`).toBe(true);
  }
  expect(new Set(inst.items.map((i) => i.id)).size).toBe(inst.items.length);
  const sums = sectionSums(inst, truePlacements(inst));
  for (const t of inst.totals) expect(Number.isFinite(t.calc(sums)), `${id}: total ${t.key}`).toBe(true);
  // The right answers mark as right.
  const subs = Object.fromEntries(inst.sections.filter((s) => s.subtotal).map((s) => [s.id, sums[s.id]]));
  expect(markSubtotals(inst, truePlacements(inst), subs).right).toBe(inst.sections.filter((s) => s.subtotal).length);
  const tots = Object.fromEntries(inst.totals.map((t) => [t.key, t.calc(sums)]));
  expect(markTotals(inst, subs, tots).right).toBe(inst.totals.length);
  expect(inst.decision.options.map((o) => o.id)).toContain(inst.decision.correct);
  for (const o of inst.decision.options) expect(inst.outcomes[o.id], `${id}: outcome ${o.id}`).toBeDefined();
  const text = [...inst.prompt.map((b) => (typeof b === 'string' ? b : b.text)), inst.ask, inst.heading, inst.decision.explain, ...inst.decision.options.map((o) => o.label), ...inst.items.map((i) => i.label + i.why), ...inst.working].join(' ');
  expect(text, `${id}: no broken numbers`).not.toMatch(BROKEN);
  expect(text, `${id}: no course references`).not.toMatch(BANNED);
}

describe('every calculation problem is internally consistent', () => {
  for (const p of calcs) {
    it(`${p.id}: base parameters`, () => checkCalc(p.id, p.build(p.base)));
    it(`${p.id}: 200 random variations`, () => {
      const rng = mulberry32(42);
      for (let i = 0; i < 200; i++) checkCalc(p.id, p.build(p.vary(rng)));
    });
  }
});

describe('every statement builder is internally consistent', () => {
  for (const p of statements) {
    it(`${p.id}: base`, () => checkStatement(p.id, p.build(p.base)));
    it(`${p.id}: 200 random variations`, () => {
      const rng = mulberry32(7);
      for (let i = 0; i < 200; i++) checkStatement(p.id, p.build(p.vary(rng)));
    });
  }
  it('the balance sheet balances, every time', () => {
    const p = PROBLEMS['sfp-build'] as StatementProblem;
    const rng = mulberry32(3);
    for (let i = 0; i < 200; i++) {
      const inst = p.build(i === 0 ? p.base : p.vary(rng));
      const s = sectionSums(inst, truePlacements(inst));
      expect(s.nca + s.ca).toBeCloseTo(s.eq + s.ncl + s.cl, 6);
    }
  });
  it('the boss statement explains the Frozen target of (205)', () => {
    const p = PROBLEMS['scf-frost'] as StatementProblem;
    const inst = p.build(p.base);
    const s = sectionSums(inst, truePlacements(inst));
    expect(s.op).toBeCloseTo(-1100, 6);
    expect(s.inv).toBeCloseTo(-880, 6);
    expect(s.fin).toBeCloseTo(1775, 6);
  });
  it('the class example statement: (15,000), (30,000), 60,000, closing 45,000', () => {
    const p = PROBLEMS['scf-full'] as StatementProblem;
    const inst = p.build(p.base);
    const s = sectionSums(inst, truePlacements(inst));
    expect([s.op, s.inv, s.fin]).toEqual([-15000, -30000, 60000]);
    expect(inst.totals.find((t) => t.key === 'close')!.calc(s)).toBe(45000);
  });
  it('the income statement: operating profit 24,600, profit 25,500', () => {
    const p = PROBLEMS['is-build'] as StatementProblem;
    const inst = p.build(p.base);
    const s = sectionSums(inst, truePlacements(inst));
    expect(inst.totals.map((t) => t.calc(s))).toEqual([24600, 25500]);
  });
});

describe('budget grids', () => {
  for (const p of grids) {
    it(`${p.id}: the right numbers mark as right, base and 200 variations`, () => {
      const rng = mulberry32(11);
      for (let i = 0; i < 201; i++) {
        const inst = p.build(i === 0 ? p.base : p.vary(rng));
        const truth = markWorksheet(inst.rows, inst.columns.length - 1, {}).truth;
        const typed = Object.fromEntries(inst.rows.filter((r) => !r.given).map((r) => [r.key, truth[r.key]]));
        const m = markWorksheet(inst.rows, inst.columns.length - 1, typed);
        for (const r of inst.rows.filter((x) => !x.given)) expect(m.result[r.key].rowOk, `${p.id}: ${r.key}`).toBe(true);
        expect(inst.decision.options.map((o) => o.id)).toContain(inst.decision.correct);
        expect([inst.ask, inst.decision.explain, ...inst.working].join(' ')).not.toMatch(BROKEN);
      }
    });
  }
  it('Christmas budget: closing balances 8,000, (27,000), (17,000), 3,000, 0, (4,000)', () => {
    const p = PROBLEMS['xmas-budget'] as GridProblem;
    const inst = p.build(p.base);
    expect(markWorksheet(inst.rows, 5, {}).truth.close).toEqual([8000, -27000, -17000, 3000, 0, -4000]);
  });
});

const answerOf = (id: string, params?: unknown) => {
  const p = PROBLEMS[id] as CalcProblem;
  const inst = p.build(params ?? p.base);
  return inst.solve(expectedValues(inst.inputs));
};

describe('story numbers match the worked answers', () => {
  it('Overload boss: proposals (29,000) and (13,000)', () => {
    const boss = ACTS[4].boss!;
    const cc = boss.problems.find((x) => x.problem === 'credit-control')!;
    const id = boss.problems.find((x) => x.problem === 'invoice-discounting')!;
    expect(answerOf('credit-control', cc.params)).toBeCloseTo(-29000, 0);
    expect(answerOf('invoice-discounting', id.params)).toBeCloseTo(-13000, 0);
  });
  it('Apex 1 base: +5,068', () => expect(answerOf('credit-control')).toBeCloseTo(5068.49, 0));
  it('Slowpay LM4 base: (6,360)', () => expect(answerOf('invoice-discounting')).toBeCloseTo(-6360, 1));
  it('Apex 2 and 4 bases', () => {
    expect(answerOf('prompt-discount')).toBeCloseTo(-36164.38, 1);
    expect(answerOf('factoring')).toBeCloseTo(-118082.19, 1);
  });
  it('Knotted boss parts', () => {
    const parts = ACTS[5].boss!.problems.filter((x) => PROBLEMS[x.problem].kind === 'calc').map((x) => answerOf(x.problem, x.params));
    expect(parts[0]).toBeCloseTo(40, 6);
    expect(parts[1]).toBeCloseTo(61000, 4);
    expect(parts[2]).toBeCloseTo(5282600, 0);
    expect(parts[3]).toBeCloseTo(39, 6);
    expect(parts[4]).toBeCloseTo(141000, 4);
    expect(parts[5]).toBeCloseTo(1240000, 0);
    expect(parts[6]).toBeCloseTo(76250, 4);
  });
  it('Onesale boss: (280,000), 24,000, (20,000)', () => {
    const b = ACTS[7].boss!.problems.slice(0, 3).map((x) => answerOf(x.problem, x.params));
    expect(b[0]).toBeCloseTo(-280000, 0);
    expect(b[1]).toBeCloseTo(24000, 0);
    expect(b[2]).toBeCloseTo(-20000, 0);
  });
  it('Frozen boss workings: (205), 900, 120, 1,400, 830, 600', () => {
    const v = ACTS[3].boss!.problems.slice(0, 6).map((x) => answerOf(x.problem, x.params));
    expect(v).toEqual([-205, 900, 120, 1400, 830, 600].map((n) => expect.closeTo(n, 6)));
  });
  it('Cottage machine: BEP 428.6 and 1,000 baskets for €4,000', () => {
    expect(answerOf('cvp-machine')).toBeCloseTo(428.57, 1);
    expect(answerOf('cvp-machine', { product: 'baskets', unit: 'baskets', price: 14, vc: 12, fixed: 500, units: 500, rent: 2500, newVc: 7, target: 4000, ask: 'target', period: 'a month' })).toBeCloseTo(1000, 6);
  });
  it('sales mix: 18,000 composite units', () => expect(answerOf('sales-mix')).toBeCloseTo(18000, 6));
  it('ratio base: ROCE 8%', () => expect(answerOf('ratio-profit')).toBeCloseTo(8, 6));
});

describe('act structure', () => {
  it('every session part and boss part points at real content', () => {
    for (const act of ACTS) {
      for (const s of act.sessions)
        for (const part of s.parts) {
          if (part.kind === 'problem') expect(PROBLEMS[part.problem], part.problem).toBeDefined();
          if (part.kind === 'lesson') for (const c of part.concepts) expect(CONCEPTS[c], c).toBeDefined();
        }
      for (const b of act.boss?.problems ?? []) expect(PROBLEMS[b.problem], b.problem).toBeDefined();
    }
  });
  it('every concept has a lesson, is taught in its act and can be practised', () => {
    for (const act of ACTS.filter((a) => !a.draft)) {
      const taught = new Set(act.sessions.flatMap((s) => s.parts.flatMap((p) => (p.kind === 'lesson' ? p.concepts : []))));
      for (const c of act.concepts) {
        expect(CONCEPTS[c], c).toBeDefined();
        expect(taught.has(c), `${c} taught`).toBe(true);
        expect(problemsFor(c).length, `${c} practisable`).toBeGreaterThan(0);
      }
    }
  });
  it('a lesson comes before any problem on its concept', () => {
    for (const act of ACTS) {
      const seen = new Set<string>();
      for (const s of act.sessions)
        for (const part of s.parts) {
          if (part.kind === 'lesson') part.concepts.forEach((c) => seen.add(c));
          if (part.kind === 'problem') expect(seen.has(PROBLEMS[part.problem].concept), `${part.problem} after its lesson`).toBe(true);
        }
    }
  });
  it('lessons and sorting rounds never mention the course', () => {
    const text = JSON.stringify([Object.values(CONCEPTS), all.filter((p) => p.kind === 'classify' || p.kind === 'brief' || p.kind === 'table' || p.kind === 'judgement'), ACTS.map((a) => [a.title, a.blurb, a.sessions, a.boss])]);
    expect(text).not.toMatch(BANNED);
  });
});
