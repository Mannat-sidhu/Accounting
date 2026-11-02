// Small helpers for writing problem content.
import type { CalcProblem, GridProblem, ProblemInstance, StatementProblem, TableDiagram } from '../engine/types';

export const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

export const roundTo = (n: number, step: number) => Math.round(n / step) * step;

/** Whole number with grouping, for working lines: 15000 → "15,000"; negatives in brackets. */
export const w0 = (n: number) => {
  const r = Math.round(n);
  return r < 0 ? `(${Math.abs(r).toLocaleString('en-GB')})` : r.toLocaleString('en-GB');
};
/** Signed with a real minus, for sums written out: −7,000. */
export const s0 = (n: number) => (Math.round(n) < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString('en-GB');
/** Up to 2 dp, trimmed. */
export const w2 = (n: number) => n.toLocaleString('en-GB', { maximumFractionDigits: 2 });
/** Euro amount with sign in words for prose: "€15,000". */
export const e0 = (n: number) => (n < 0 ? '−€' : '€') + Math.abs(Math.round(n)).toLocaleString('en-GB');

/** A small statement extract for the "data" panel. Rows of one cell become section headings. */
export const table = (title: string, head: string[], rows: string[][], totals?: number[], caption?: string): TableDiagram => ({ kind: 'table', title, head, rows, totals, caption });

export const defineCalc = <P,>(p: CalcProblem<P>) => p;
export const defineStatement = <P,>(p: StatementProblem<P>) => p;
export const defineGrid = <P,>(p: GridProblem<P>) => p;
export type Built = ProblemInstance;

/** Standard pair of why-options with one right and the rest wrong, ids w0..wn in order given. */
export const whys = (...labels: string[]) => labels.map((label, i) => ({ id: `w${i}`, label }));
