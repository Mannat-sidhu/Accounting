// @vitest-environment jsdom
// Smoke tests: every problem mounts at every level of help without throwing, and a perfect script under exam
// conditions earns full marks and hands its result straight back.
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { METHODS, PROBLEMS, hasParams } from '../src/content';
import { PAPER_KINDS } from '../src/content/papers';
import { expectedValues, markWorksheet, sectionSums, truePlacements } from '../src/engine/grading';
import { mulberry32 } from '../src/engine/rng';
import type { CalcProblem, GridProblem, Problem, StatementProblem, Tier } from '../src/engine/types';
import { RoundRunner, type RoundResult } from '../src/ui/Rounds';
import { GameProvider } from '../src/ui/store';

afterEach(cleanup);

const TIERS: Tier[] = ['guided', 'unguided', 'exam'];
const mount = (p: Problem, params: unknown, tier: Tier, extra: { noCall?: boolean; silent?: boolean; onDone?: (r: RoundResult) => void } = {}) =>
  render(
    <GameProvider>
      <RoundRunner problem={p} params={params} tier={tier} seed={3} count={3} onDone={extra.onDone ?? (() => {})} noCall={extra.noCall} silent={extra.silent} />
    </GameProvider>,
  );

describe('every problem mounts at every help level', () => {
  for (const p of Object.values(PROBLEMS)) {
    for (const tier of TIERS) {
      it(`${p.id} · ${tier}`, () => {
        const params = hasParams(p) ? p.vary(mulberry32(9)) : undefined;
        const { container } = mount(p, params, tier);
        const text = container.textContent ?? '';
        expect(text.length).toBeGreaterThan(40);
        expect(text).not.toMatch(/NaN|undefined|Infinity|\[object/);
        expect(container.querySelector('.bubble')).not.toBeNull();
      });
    }
  }
});

describe('a perfect script under exam conditions', () => {
  const calcs = Object.values(PROBLEMS).filter((p): p is CalcProblem => p.kind === 'calc');
  for (const p of calcs) {
    it(`${p.id}: full marks, no feedback shown, result handed straight back`, () => {
      const onDone = vi.fn();
      const inst = p.build(p.base);
      const { container, getByText } = mount(p, p.base, 'exam', { noCall: true, silent: true, onDone });
      const exp = expectedValues(inst.inputs);
      for (const spec of inst.inputs) {
        const el = container.querySelector(`#in-${spec.key}`) as HTMLInputElement;
        fireEvent.change(el, { target: { value: String(exp[spec.key]) } });
      }
      fireEvent.click(getByText('Check'));
      expect(container.querySelector('.reaction')).toBeNull();
      fireEvent.change(container.querySelector('#answer') as HTMLInputElement, { target: { value: String(inst.solve(exp)) } });
      fireEvent.click(getByText('Check'));
      expect(onDone).toHaveBeenCalledTimes(1);
      const r = onDone.mock.calls[0][0] as RoundResult;
      expect(r.score).toBe(r.max);
      expect(r.max).toBe(4);
      expect(r.review).toBeTruthy();
    });
  }
});

describe('paper parts mount under paper conditions', () => {
  for (const kind of PAPER_KINDS) {
    it(`${kind.title}: every part`, () => {
      const paper = kind.build(5);
      for (const q of paper.questions)
        for (const part of q.parts) {
          const { container, unmount } = mount(PROBLEMS[part.problem], part.params, 'exam', { noCall: true, silent: true });
          expect(container.textContent).not.toMatch(/NaN|undefined|Infinity/);
          unmount();
        }
    });
  }
});

describe('statements and budgets under paper conditions', () => {
  it('budget grid: every cell right earns full marks, nothing shown, result handed back', () => {
    for (const id of ['slide-cash-budget', 'xmas-budget']) {
      const p = PROBLEMS[id] as GridProblem;
      const inst = p.build(p.base);
      const onDone = vi.fn();
      const { container, getByText, unmount } = mount(p, p.base, 'exam', { noCall: true, silent: true, onDone });
      const truth = markWorksheet(inst.rows, inst.columns.length - 1, {}).truth;
      for (const row of inst.rows.filter((r) => !r.given)) {
        const cells = row.cells ?? inst.columns.map((_, i) => i);
        for (const y of cells) {
          const el = container.querySelector(`input[aria-label="${row.label}, ${inst.columns[y]}"]`) as HTMLInputElement;
          fireEvent.change(el, { target: { value: String(truth[row.key][y]) } });
        }
      }
      fireEvent.click(getByText('Done with this part'));
      expect(onDone).toHaveBeenCalledTimes(1);
      const r = onDone.mock.calls[0][0] as RoundResult;
      expect(r.score, id).toBe(r.max);
      unmount();
    }
  });

  for (const id of ['is-build', 'sfp-build', 'scf-full']) {
    it(`statement builder ${id}: a perfect script earns full marks without feedback`, () => {
      const p = PROBLEMS[id] as StatementProblem;
      const inst = p.build(p.base);
      const onDone = vi.fn();
      const { container, getByText, unmount } = mount(p, p.base, 'exam', { noCall: true, silent: true, onDone });
      for (const it of inst.items) {
        const sel = container.querySelector(`select[aria-label="Section for ${it.label}"]`) as HTMLSelectElement;
        fireEvent.change(sel, { target: { value: it.section } });
      }
      fireEvent.click(getByText('Check'));
      if (inst.signed) {
        for (const it of inst.items.filter((x) => x.section !== 'none')) {
          const group = container.querySelector(`[aria-label="Add or deduct ${it.label}"]`) as HTMLElement;
          fireEvent.click(group.querySelectorAll('button')[it.sign === 1 ? 0 : 1]);
        }
        fireEvent.click(getByText('Check'));
      }
      const sums = sectionSums(inst, truePlacements(inst));
      for (const s of inst.sections.filter((x) => x.subtotal)) fireEvent.change(container.querySelector(`#sub-${s.id}`) as HTMLInputElement, { target: { value: String(sums[s.id]) } });
      fireEvent.click(getByText('Check'));
      for (const t of inst.totals) fireEvent.change(container.querySelector(`#tot-${t.key}`) as HTMLInputElement, { target: { value: String(t.calc(sums)) } });
      fireEvent.click(getByText('Check'));
      expect(container.querySelector('.reaction')).toBeNull();
      expect(onDone).toHaveBeenCalledTimes(1);
      const r = onDone.mock.calls[0][0] as RoundResult;
      expect(r.score, id).toBe(r.max);
      unmount();
    });
  }
});

describe('the figures stay on hand and are never given away', () => {
  it('guided: figures the question states are filled in, so only the working-out is asked for', () => {
    const p = PROBLEMS['cfo-indirect'] as CalcProblem;
    const inst = p.build(p.base);
    const { container, getByText, getAllByText, getByRole, getAllByRole } = mount(p, p.base, 'guided');
    // spot, formula, then the inputs move
    for (const id of inst.spot!.correct) fireEvent.click(getByRole('checkbox', { name: inst.spot!.options.find((o) => o.id === id)!.label }));
    fireEvent.click(getByText('Check'));
    fireEvent.click(getByText(/Next move/));
    fireEvent.click(getAllByRole('radio').find((el) => el.querySelector('.name')?.firstChild?.textContent === METHODS[inst.formula.correct].name)!);
    fireEvent.click(getByText('Check'));
    fireEvent.click(getByText(/Next move/));
    // the printed figures are shown, not asked for
    expect(container.querySelector('#in-P')).toBeNull();
    expect(container.querySelector('#in-D')).toBeNull();
    expect(container.querySelector('#in-I')).not.toBeNull();
    expect(container.querySelector('.marks-table.given')?.textContent).toContain('52,000');
    // and the accounts are on hand while working
    expect(container.querySelectorAll('.figures').length).toBe(1);
    expect(getAllByText(/Operating profit/).length).toBeGreaterThan(1);
  });

  it('statement builder: subtotals are not printed beside the boxes that ask for them; the statement stays on screen', () => {
    const p = PROBLEMS['is-build'] as StatementProblem;
    const inst = p.build(p.base);
    const { container, getByText } = mount(p, p.base, 'unguided');
    for (const it of inst.items) fireEvent.change(container.querySelector(`select[aria-label="Section for ${it.label}"]`) as HTMLSelectElement, { target: { value: it.section } });
    fireEvent.click(getByText('Check'));
    fireEvent.click(getByText(/Next move/));
    // Subtotals move: the working-out is hidden
    const subs = [...container.querySelectorAll('.st-line.subtotal .num-tab')].map((e) => e.textContent);
    expect(subs.length).toBeGreaterThan(0);
    expect(subs.every((t) => t === '?')).toBe(true);
    const truth = sectionSums(inst, truePlacements(inst));
    for (const s of inst.sections.filter((x) => x.subtotal)) fireEvent.change(container.querySelector(`#sub-${s.id}`) as HTMLInputElement, { target: { value: String(truth[s.id]) } });
    fireEvent.click(getByText('Check'));
    fireEvent.click(getByText(/Next move/));
    // Totals move: the statement is still there, with the subtotals just typed, and the bottom lines still to find
    expect(container.querySelector('.statement')).not.toBeNull();
    expect(container.querySelector('.st-section-label')?.textContent).toBeTruthy();
    const shown = [...container.querySelectorAll('.st-line.subtotal .num-tab')].map((e) => e.textContent ?? '');
    expect(shown.some((t) => t === '?')).toBe(true);
    expect(shown.some((t) => /\d/.test(t))).toBe(true);
  });
});
