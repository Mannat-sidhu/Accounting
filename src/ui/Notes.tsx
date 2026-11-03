// The notes: every idea in the course, readable without playing, searchable, with a glossary of the jargon.
// Meant as the revision guide: nothing is locked.
import { useMemo, useState } from 'react';
import { ACTS, CONCEPTS, PRACTISABLE } from '../content';
import { EVERYDAY } from '../content/everyday';
import { GLOSSARY } from '../content/glossary';
import { stageOf } from '../engine/mastery';
import type { Concept } from '../engine/types';
import { LessonView, STAGE_LABEL } from './Overlays';
import { useGame } from './store';

const haystack = (c: Concept) => [c.name, c.summary, EVERYDAY[c.id] ?? '', ...c.lesson.plain, ...c.lesson.traps].join(' ').toLowerCase();

export function Notes() {
  const { save, go, openTerm, openFormulas } = useGame();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [tab, setTab] = useState<'ideas' | 'words'>('ideas');
  const needle = q.trim().toLowerCase();

  const chapters = useMemo(
    () =>
      ACTS.filter((a) => a.concepts.length).map((a) => ({
        act: a,
        concepts: a.concepts.map((id) => CONCEPTS[id]).filter((c) => !needle || haystack(c).includes(needle)),
      })),
    [needle],
  );
  const words = useMemo(() => GLOSSARY.filter((g) => !needle || g.terms.join(' ').toLowerCase().includes(needle) || g.plain.toLowerCase().includes(needle)), [needle]);
  const shown = chapters.reduce((n, c) => n + c.concepts.length, 0);

  return (
    <>
      <section className="hero">
        <h1>Notes</h1>
        <p>Every idea in the course, in plain English, with nothing locked. Use it to revise, or to look something up mid-game.</p>
        <div className="row">
          <button type="button" className="btn ghost small" onClick={() => openFormulas(true)}>
            ƒ Key ratios sheet
          </button>
        </div>
      </section>

      <div className="notes-bar">
        <input className="text-input" type="search" placeholder="Search: break-even, accruals, FIFO…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the notes" />
        <div className="pills" role="tablist" aria-label="Notes view">
          {(['ideas', 'words'] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={`pill ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
              {t === 'ideas' ? `Ideas (${shown})` : `Jargon buster (${words.length})`}
            </button>
          ))}
        </div>
      </div>

      {tab === 'ideas' &&
        chapters.map(
          ({ act, concepts }) =>
            concepts.length > 0 && (
              <section className="notes-chapter" key={act.number}>
                <h2 className="eyebrow">
                  Chapter {act.numeral} · {act.title}
                </h2>
                <ul className="notes-list">
                  {concepts.map((c) => {
                    const stage = stageOf(save, c.id);
                    const isOpen = open === c.id || (!!needle && concepts.length <= 2);
                    return (
                      <li key={c.id}>
                        <button type="button" className="notes-row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : c.id)}>
                          <span className="notes-name">{c.name}</span>
                          {stage !== 'locked' && <span className={`stage ${stage}`}>{STAGE_LABEL[stage]}</span>}
                        </button>
                        {isOpen && (
                          <div className="notes-body">
                            <LessonView concept={c} />
                            {PRACTISABLE.includes(c.id) && (
                              <div className="row" style={{ marginTop: 12 }}>
                                <button type="button" className="btn small" onClick={() => go({ name: 'practice', concept: c.id })}>
                                  Practise this
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ),
        )}
      {tab === 'ideas' && shown === 0 && <p className="muted">Nothing matches “{q}”.</p>}

      {tab === 'words' && (
        <ul className="notes-list words">
          {words.map((g) => (
            <li key={g.terms[0]}>
              <button type="button" className="notes-row" onClick={() => openTerm(g.terms[0])}>
                <span className="notes-name">{g.terms[0]}</span>
                <span className="muted words-plain">{g.plain}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
