// British/Irish number formatting.
import type { Unit } from './types';

const grouped = (n: number, dp: number) =>
  n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });

/** €107,163 — whole euros unless `dp` is given. */
export const eur = (n: number, dp = 0) => (n < 0 ? '−€' : '€') + grouped(Math.abs(n), dp);

/** Signed euro change: +€7,163 / −€2,000 */
export const eurSigned = (n: number) => (n >= 0 ? '+' : '') + eur(n);

/** 6% / 6.5% / 12.68% — `n` is already in percent. */
export const pct = (n: number, dp?: number) => {
  const d = dp ?? (Number.isInteger(n) ? 0 : Math.abs(n * 10 - Math.round(n * 10)) < 1e-9 ? 1 : 2);
  return grouped(n, d) + '%';
};

/** Plain number with grouping and up to `dp` decimals. */
export const num = (n: number, dp = 2) => {
  const s = n.toLocaleString('en-GB', { maximumFractionDigits: dp });
  return n < 0 ? s.replace('-', '−') : s;
};

/** Number formatted for its unit, used in feedback and model working. */
export function fmt(n: number, unit: Unit, dp?: number) {
  switch (unit) {
    case 'eur':
      // Whole euros stay whole: €196,000, not €196,000.00.
      return eur(n, Math.abs(n - Math.round(n)) < 0.005 ? 0 : (dp ?? (Math.abs(n) < 100 ? 2 : 0)));
    case 'pct':
      return pct(Math.round(n * 100) / 100, dp);
    case 'days':
      return `${num(n, dp ?? 1)} days`;
    case 'times':
      return `${num(n, dp ?? 2)} times`;
    case 'count':
      return num(n, dp ?? 0);
    default:
      return num(n, dp ?? 4);
  }
}

/** Accounts style: brackets for negatives, e.g. (15,000). */
export const acc = (n: number) => {
  const r = Math.round(n);
  const s = Math.abs(r).toLocaleString('en-GB');
  return r < 0 ? `(${s})` : s;
};

/** Reads what the player typed: tolerates €, %, commas, spaces and a Unicode minus. */
export function parseNumber(raw: string): number | null {
  const t = raw.trim();
  // (15,000) in brackets means minus, as in a set of accounts.
  const bracket = /^\(.*\)$/.test(t);
  const cleaned = (bracket ? '-' : '') + t.replace(/[()€%,\s]|days?|times|x$/gi, '').replace(/[−–]/g, '-');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
