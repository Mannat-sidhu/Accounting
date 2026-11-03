// Process marking: each move is marked on its own, the way an examiner awards method marks.
import type { Defensible, InputSpec, JudgementProblem, ProblemInstance, SpotSpec, StatementInstance, StepKey, Tier, Unit, Verdict } from './types';

export type { StepKey } from './types';

export const STEP_MAX = 2;
export const STEPS: StepKey[] = ['spot', 'formula', 'inputs', 'answer', 'decision'];

/** The moves a problem actually has (the first is optional). */
/** The moves a problem has at a given level of help. Without guidance there is no spot move and no formula menu. */
export const stepsOf = (inst: Pick<ProblemInstance, 'spot'>, tier: Tier = 'guided'): StepKey[] =>
  tier !== 'guided' ? ['inputs', 'answer', 'decision'] : inst.spot ? STEPS : STEPS.slice(1);

export interface StepResult {
  score: number;
  max: number;
  hinted: boolean;
  correct: boolean;
  /** Answer was wrong overall but right given the player's own inputs (error carried forward). */
  ecf?: boolean;
  /** Not marked because the game filled it in (practising mode). */
  auto?: boolean;
}

/** Within ±0.5% or the nearest whole euro, whichever is wider. */
export function withinTolerance(given: number, expected: number, unit: Unit) {
  const rel = Math.abs(expected) * 0.005;
  const abs = unit === 'eur' ? 1 : unit === 'pct' || unit === 'times' ? 0.01 : unit === 'days' ? 0.5 : 1e-9;
  return Math.abs(given - expected) <= Math.max(rel, abs);
}

/** A percentage may be typed as 6 or 0.06. Returns the value in percent. */
export function normalise(given: number, unit: Unit, expected: number) {
  if (unit !== 'pct') return given;
  if (withinTolerance(given, expected, unit)) return given;
  if (withinTolerance(given * 100, expected, unit)) return given * 100;
  return given;
}

const applyHint = (score: number, hinted: boolean) => (hinted ? score / 2 : score);

/** Spot move: every right option and nothing else earns 2; mostly right earns 1. */
export function markSpot(spec: SpotSpec, chosen: string[], hinted: boolean): StepResult {
  const right = chosen.filter((c) => spec.correct.includes(c)).length;
  const wrong = chosen.length - right;
  const all = right === spec.correct.length && wrong === 0;
  const raw = all ? 2 : spec.correct.length > 1 && right - wrong >= spec.correct.length / 2 ? 1 : 0;
  return { score: applyHint(raw, hinted), max: STEP_MAX, hinted, correct: all };
}

export function markFormula(correct: string, chosen: string | null, hinted: boolean): StepResult {
  const ok = chosen === correct;
  return { score: applyHint(ok ? 2 : 0, hinted), max: STEP_MAX, hinted, correct: ok };
}

const signed = (signless: boolean | undefined, given: number) => (signless ? Math.abs(given) : given);

export function inputOk(spec: InputSpec, given: number | null) {
  if (given === null) return false;
  const e = spec.signless ? Math.abs(spec.expected) : spec.expected;
  return withinTolerance(normalise(signed(spec.signless, given), spec.unit, e), e, spec.unit);
}

export function markInputs(specs: InputSpec[], given: Record<string, number | null>, hinted: boolean): StepResult {
  const right = specs.filter((s) => inputOk(s, given[s.key])).length;
  const raw = right === specs.length ? 2 : right >= specs.length / 2 ? 1 : 0;
  return { score: applyHint(raw, hinted), max: STEP_MAX, hinted, correct: right === specs.length };
}

/** Input values to feed the solver: the player's own where valid, normalised to percent, signed as expected. */
export function playerValues(specs: InputSpec[], given: Record<string, number | null>) {
  const out: Record<string, number> = {};
  for (const s of specs) {
    const g = given[s.key];
    if (g === null || g === undefined) out[s.key] = NaN;
    else {
      const v = normalise(signed(s.signless, g), s.unit, s.expected);
      out[s.key] = s.signless && s.expected < 0 ? -Math.abs(v) : v;
    }
  }
  return out;
}

export function expectedValues(specs: InputSpec[]) {
  return Object.fromEntries(specs.map((s) => [s.key, s.expected]));
}

export function markAnswer(
  inst: ProblemInstance,
  given: number | null,
  inputsGiven: Record<string, number | null> | null,
  hinted: boolean,
): StepResult & { expected: number; ownExpected?: number } {
  const unit = inst.answer.unit;
  const expected = inst.solve(expectedValues(inst.inputs));
  const tol = inst.answer.tolerance;
  const fix = (v: number) => (inst.answer.signless ? Math.abs(v) : v);
  const close = (v: number, e: number) => (tol !== undefined ? Math.abs(fix(v) - fix(e)) <= tol : withinTolerance(fix(v), fix(e), unit));
  const value = given === null ? null : normalise(given, unit, expected);
  if (value !== null && close(value, expected)) {
    return { score: applyHint(2, hinted), max: STEP_MAX, hinted, correct: true, expected };
  }
  // Error carried forward: right method applied to the player's own (wrong) inputs.
  if (inputsGiven && value !== null) {
    let own: number;
    try {
      own = inst.solve(playerValues(inst.inputs, inputsGiven));
    } catch {
      own = NaN;
    }
    const ownValue = normalise(given!, unit, own);
    if (Number.isFinite(own) && close(ownValue, own)) {
      return { score: applyHint(2, hinted), max: STEP_MAX, hinted, correct: false, ecf: true, expected, ownExpected: own };
    }
  }
  return { score: 0, max: STEP_MAX, hinted, correct: false, expected };
}

export function markDecision(
  spec: ProblemInstance['decision'],
  choice: string | null,
  why: string | null,
  hinted: boolean,
): StepResult & { defensible?: Defensible } {
  const alt = spec.alsoAccept?.find((a) => a.option === choice && a.why === why);
  if (alt) return { score: applyHint(alt.score, hinted), max: STEP_MAX, hinted, correct: alt.score >= STEP_MAX, defensible: alt };
  const raw = (choice === spec.correct ? 1 : 0) + (why === spec.correctWhy ? 1 : 0);
  return { score: applyHint(raw, hinted), max: STEP_MAX, hinted, correct: raw === 2 };
}

// ---------------------------------------------------------------- judgement rounds

export const VERDICT_MARK: Record<Verdict, number> = { best: 2, defensible: 1.5, stretch: 0.5, wrong: 0 };

/** Profit after a set of choices. */
export const profitAfter = (p: Pick<JudgementProblem, 'startProfit' | 'items'>, picks: Record<string, string | null>) =>
  p.startProfit + p.items.reduce((s, it) => s + (it.options.find((o) => o.id === picks[it.id])?.effect ?? 0), 0);

/** Lowest and highest profit reachable using only best or defensible treatments. */
export function defensibleRange(p: Pick<JudgementProblem, 'startProfit' | 'items'>) {
  let lo = p.startProfit;
  let hi = p.startProfit;
  for (const it of p.items) {
    const ok = it.options.filter((o) => o.verdict === 'best' || o.verdict === 'defensible').map((o) => o.effect);
    lo += Math.min(...ok);
    hi += Math.max(...ok);
  }
  return { lo, hi };
}

/**
 * What someone with a bonus incentive would push for: the highest profit, or the lowest that still clears
 * their own threshold (saving profit for later), using any option on the table.
 */
export function pushedProfit(p: Pick<JudgementProblem, 'startProfit' | 'items'>, wants: 'high' | 'low', floor = -Infinity) {
  if (wants === 'high') return p.startProfit + p.items.reduce((s, it) => s + Math.max(...it.options.map((o) => o.effect)), 0);
  // Low: try every combination (small sets) and keep the lowest that clears the floor.
  let best = Infinity;
  const walk = (i: number, acc: number) => {
    if (i === p.items.length) {
      if (acc >= floor && acc < best) best = acc;
      return;
    }
    for (const o of p.items[i].options) walk(i + 1, acc + o.effect);
  };
  walk(0, p.startProfit);
  return best;
}

export const totals = (results: Partial<Record<string, StepResult>>) => {
  const marked = Object.values(results).filter((r): r is StepResult => !!r && !r.auto);
  return { score: marked.reduce((s, r) => s + r.score, 0), max: marked.reduce((s, r) => s + r.max, 0) };
};

/** Unassisted and correct on every step the player did: what counts towards mastery. */
export const cleanRun = (results: Partial<Record<string, StepResult>>) =>
  Object.values(results).every((r) => !r || r.auto || (r.correct && !r.hinted));

/** Brief the board: +1 per key point chosen, −1 per trap, floored at 0, out of the number of key points. */
export function markBrief(cards: { kind: 'key' | 'trap' | 'filler' }[], chosen: number[], cap?: number) {
  const keys = cards.filter((c) => c.kind === 'key').length;
  const max = Math.min(keys, cap ?? keys);
  const raw = chosen.reduce((s, i) => s + (cards[i].kind === 'key' ? 1 : cards[i].kind === 'trap' ? -1 : 0), 0);
  return { score: Math.min(max, Math.max(0, raw)), max, clean: raw >= max && chosen.every((i) => cards[i].kind !== 'trap') };
}

/** Table-fill: one point per correct cell. */
export function markTable(rows: { answers: string[] }[], given: (string | null)[][]) {
  let score = 0;
  let max = 0;
  rows.forEach((r, i) =>
    r.answers.forEach((a, j) => {
      max++;
      if (given[i]?.[j] === a) score++;
    }),
  );
  return { score, max, clean: score === max };
}

/** 2 if every one is right, 1 if at least 70% are, else 0. */
export const shareMark = (right: number, of: number) => (of === 0 ? 2 : right === of ? 2 : right / of >= 0.7 ? 1 : 0);

// ---------------------------------------------------------------- statement builder

export interface Placement {
  section: string | null;
  sign: 1 | -1 | null;
}

export const placedOk = (item: StatementInstance['items'][number], p: Placement | undefined) =>
  !!p && (p.section === item.section || (item.accept ?? []).includes(p.section ?? ''));

/** Signed section sums from a set of placements. Items left out or unplaced count for nothing. */
export function sectionSums(inst: StatementInstance, placements: Record<string, Placement>, useTrueSigns = false) {
  const sums: Record<string, number> = Object.fromEntries(inst.sections.map((s) => [s.id, 0]));
  for (const it of inst.items) {
    const p = placements[it.id];
    if (!p?.section || !(p.section in sums)) continue;
    const sign = !inst.signed || useTrueSigns ? it.sign : (p.sign ?? it.sign);
    sums[p.section] += sign * it.amount;
  }
  return sums;
}

/** The correct placements, used as the "mine" alternative for error carried forward. */
export const truePlacements = (inst: StatementInstance): Record<string, Placement> =>
  Object.fromEntries(inst.items.map((it) => [it.id, { section: it.section, sign: it.sign }]));

const near = (a: number | null, b: number) => a !== null && Math.abs(a - b) <= Math.max(1, Math.abs(b) * 0.005);

/** A typed subtotal is right if it matches the true placement or the player's own (error carried forward). */
export function markSubtotals(inst: StatementInstance, placements: Record<string, Placement>, typed: Record<string, number | null>) {
  const truth = sectionSums(inst, truePlacements(inst));
  const own = sectionSums(inst, placements);
  const withSub = inst.sections.filter((s) => s.subtotal);
  const ok: Record<string, boolean> = {};
  const ecf: Record<string, boolean> = {};
  for (const s of withSub) {
    const t = typed[s.id] ?? null;
    ok[s.id] = near(t, truth[s.id]) || near(t, own[s.id]);
    ecf[s.id] = ok[s.id] && !near(t, truth[s.id]);
  }
  return { truth, own, ok, ecf, right: withSub.filter((s) => ok[s.id]).length, of: withSub.length };
}

/** Bottom-line totals, checked against the true subtotals or the player's own typed ones. */
export function markTotals(inst: StatementInstance, typedSubs: Record<string, number | null>, typed: Record<string, number | null>) {
  const truth = sectionSums(inst, truePlacements(inst));
  const ownSubs: Record<string, number> = { ...truth };
  for (const s of inst.sections) if (s.subtotal && typedSubs[s.id] !== null && typedSubs[s.id] !== undefined) ownSubs[s.id] = typedSubs[s.id]!;
  const ok: Record<string, boolean> = {};
  const expected: Record<string, number> = {};
  for (const t of inst.totals) {
    expected[t.key] = t.calc(truth);
    const v = typed[t.key] ?? null;
    ok[t.key] = near(v, expected[t.key]) || near(v, t.calc(ownSubs));
  }
  return { ok, expected, right: inst.totals.filter((t) => ok[t.key]).length, of: inst.totals.length };
}

/**
 * Marks a grid (cash budget) row by row. Each fillable row is checked against its formula applied to
 * the player's own earlier rows (error carried forward), so one slip doesn't sink every later row.
 */
export function markWorksheet(
  rows: { key: string; given?: boolean; cells?: number[]; calc: (r: Record<string, number[]>) => number[] }[],
  lastCol: number,
  typed: Record<string, (number | null)[]>,
  tol = 0.51,
) {
  const truth: Record<string, number[]> = {};
  const own: Record<string, number[]> = {};
  const result: Record<string, { ok: boolean[]; expected: number[]; ownExpected: number[]; rowOk: boolean; ecf: boolean }> = {};
  const cols = Array.from({ length: lastCol + 1 }, (_, i) => i);
  for (const row of rows) {
    const t = row.calc(truth);
    truth[row.key] = t;
    const o = row.calc(own);
    const cells = row.cells ?? cols;
    if (row.given) {
      own[row.key] = t;
      continue;
    }
    const mine = cols.map((y) => (cells.includes(y) ? (typed[row.key]?.[y] ?? NaN) : o[y]));
    own[row.key] = mine.map((v) => (Number.isFinite(v) ? v : 0));
    const close = (v: number, e: number) => Math.abs(v - e) <= Math.max(tol, Math.abs(e) * 0.005);
    const ok = mine.map((v, y) => !cells.includes(y) || (Number.isFinite(v) && (close(v, o[y]) || close(v, t[y]))));
    const exact = mine.every((v, y) => !cells.includes(y) || close(v, t[y]));
    result[row.key] = { ok, expected: t, ownExpected: o, rowOk: ok.every(Boolean), ecf: ok.every(Boolean) && !exact };
  }
  return { truth, own, result };
}
