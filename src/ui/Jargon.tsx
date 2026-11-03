// Tap-for-meaning: terms in speech bubbles and cheat cards become buttons that open a plain-English definition.
// Switched off under exam conditions, where there's no glossary on the day.
import { createContext, useContext, type ReactNode } from 'react';
import { TERM_REGEX, entryFor, type GlossaryEntry } from '../content/glossary';
import { useGame } from './store';

const Off = createContext(false);
export const GlossaryOff = Off.Provider;

/** Wraps the first mention of each known term in a button. */
export function Jargon({ children }: { children: string }) {
  const off = useContext(Off);
  const { openTerm } = useGame();
  if (off || typeof children !== 'string') return <>{children}</>;
  const out: ReactNode[] = [];
  const seen = new Set<GlossaryEntry>();
  let last = 0;
  for (const m of children.matchAll(TERM_REGEX)) {
    const entry = entryFor(m[2]);
    if (!entry || seen.has(entry)) continue;
    seen.add(entry);
    const start = (m.index ?? 0) + m[1].length;
    out.push(children.slice(last, start));
    out.push(
      <button key={start} type="button" className="jargon" onClick={(e) => { e.stopPropagation(); openTerm(entry.terms[0]); }}>
        {m[2]}
      </button>,
    );
    last = start + m[2].length;
  }
  out.push(children.slice(last));
  return <>{out}</>;
}
