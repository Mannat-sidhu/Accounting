// Daily drill: six quick questions on whatever needs it most: overdue pop quizzes, then the shakiest ideas,
// then what's gone longest without a look. Each is played at least "on your own".
import { useMemo, useState } from 'react';
import { CONCEPTS, PRACTISABLE, hasParams, problemsFor } from '../content';
import { maxTier, pickDrillSet, stageOf, tierFor } from '../engine/mastery';
import { mulberry32, newSeed, pickOne } from '../engine/rng';
import type { ConceptId } from '../engine/types';
import { Bubble } from './Chat';
import { RoundRunner } from './Rounds';
import { Stars, starsFor } from './Stars';
import { bumpStreak, useGame } from './store';

const SIZE = 6;

function DrillRound({ onAgain }: { onAgain: () => void }) {
  const { save, setSave, go, recordWork, openLesson } = useGame();
  const [seed] = useState(newSeed);
  const targets = useMemo(() => pickDrillSet(save, PRACTISABLE, SIZE, Date.now()), []); // eslint-disable-line react-hooks/exhaustive-deps
  const setups = useMemo(
    () =>
      targets.map((c, k) => {
        const rng = mulberry32(seed + k * 101);
        const p = pickOne(rng, problemsFor(c));
        return { c, p, params: hasParams(p) ? p.vary(rng) : null };
      }),
    [targets, seed],
  );
  const [i, setI] = useState(0);
  const [done, setDone] = useState<{ c: ConceptId; score: number; max: number }[]>([]);

  if (targets.length === 0)
    return (
      <>
        <section className="hero">
          <h1>Daily drill</h1>
          <p>Nothing to drill yet: the drill works on ideas you’ve met. Play an episode first, and it’ll pick up from there.</p>
          <button type="button" className="btn" onClick={() => go({ name: 'map' })}>
            Back to the map
          </button>
        </section>
      </>
    );

  if (i >= setups.length) {
    const score = done.reduce((s, d) => s + d.score, 0);
    const max = done.reduce((s, d) => s + d.max, 0);
    return (
      <section className="finale">
        <div className="eyebrow">Drill done</div>
        <div className="finale-stars">
          <Stars n={starsFor(score, max)} />
        </div>
        <div className="big-number">
          {score} <span className="muted" style={{ fontSize: 24 }}>/ {max}</span>
        </div>
        <ul className="weak-list" style={{ marginTop: 14 }}>
          {done.map((d, k) => (
            <li key={k}>
              <div>
                <strong>{CONCEPTS[d.c].name}</strong>
                <span className="muted"> · {d.score} / {d.max}</span>
              </div>
              {d.score < d.max && (
                <button type="button" className="btn ghost small" onClick={() => openLesson(d.c)}>
                  Cheat card
                </button>
              )}
            </li>
          ))}
        </ul>
        <Bubble beat={{ who: 'margaux', mood: score === max ? 'happy' : 'neutral', text: score === max ? 'Clean. See you tomorrow.' : 'The ones with a cheat card button are the ones to look at. Try again tomorrow, with new numbers.' }} />
        <div className="scene-controls">
          <button type="button" className="btn ghost" onClick={() => go({ name: 'map' })}>
            Back to the map
          </button>
          <span />
          <button type="button" className="btn" onClick={onAgain}>
            Another drill →
          </button>
        </div>
      </section>
    );
  }

  const cur = setups[i];
  const tier = maxTier('unguided', tierFor(stageOf(save, cur.c)));
  return (
    <>
      <header className="session-head">
        <div className="eyebrow">
          Daily drill · question {i + 1} of {setups.length}
        </div>
        <h1>{CONCEPTS[cur.c].name}</h1>
        <div className="progress-dots" aria-hidden>
          {setups.map((_, k) => (
            <span key={k} className={k < i ? 'done' : k === i ? 'here' : ''} />
          ))}
        </div>
      </header>
      <RoundRunner
        key={i}
        problem={cur.p}
        params={cur.params}
        tier={tier}
        seed={seed + i}
        count={3}
        onDone={(r) => {
          const clean = r.clean[cur.c] ?? r.score === r.max;
          recordWork(cur.c, clean, stageOf(save, cur.c) === 'common');
          setDone((d) => [...d, { c: cur.c, score: r.score, max: r.max }]);
          if (i + 1 >= setups.length) setSave((s) => bumpStreak(s));
          setI(i + 1);
          window.scrollTo({ top: 0 });
        }}
      />
    </>
  );
}

export function DrillPlayer() {
  const [round, setRound] = useState(0);
  return (
    <div className="play-main narrow">
      <DrillRound key={round} onAgain={() => setRound((r) => r + 1)} />
    </div>
  );
}
