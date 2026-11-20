// Colour helpers. Each chapter has its own jewel colour (--ch-1 … --ch-10 in styles.css); setting --ch on an element
// makes everything inside it (numerals, path, progress, badges) take that chapter's colour.
import type { CSSProperties } from 'react';

export const chStyle = (act: number): CSSProperties => ({ ['--ch' as string]: `var(--ch-${act})` });

export type StatementKind = 'pl' | 'sfp' | 'cf' | 'ratio';

/** Which statement a heading belongs to, so it can wear that statement's colour everywhere. */
export function statementKind(heading: string): StatementKind | null {
  if (/income statement|profit or loss|profit and loss/i.test(heading)) return 'pl';
  if (/financial position|balance sheet/i.test(heading)) return 'sfp';
  if (/cash flow/i.test(heading)) return 'cf';
  if (/ratio/i.test(heading)) return 'ratio';
  return null;
}
