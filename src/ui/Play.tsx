// Session player, boss round and free practice.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ACTS, CONCEPTS, PRACTISABLE, PROBLEMS, findSession, hasParams, problemsFor } from '../content';
import { eurSigned } from '../engine/format';
import { TIER_BLURB, TIER_LABEL, maxTier, pickSpotCheck, stageOf, tierFor } from '../engine/mastery';
import { mulberry32, newSeed, pickOne } from '../engine/rng';
import type { ConceptId, Problem, Stage, Tier } from '../engine/types';
import { Bubble, Scene } from './Chat';
import { Ledger, LessonCard, STAGE_LABEL } from './Overlays';
import { RoundRunner, type RoundResult } from './Rounds';
import { Stars, starsFor } from './Stars';
import { bumpStreak, useGame } from './store';

// ---------------------------------------------------------------- lessons

function Lessons({
  concepts,
  onDone,
  onBack,
  fromEnd,
}: {
  concepts: ConceptId[];
  onDone: () => void;
  onBack: () => void;
  fromEnd?: boolean;
}) {
  const { save, meet } = useGame();
  const [i, setI] = useState(fromEnd ? concepts.length - 1 : 0);
  const [phase, setPhase] = useState<'talk' | 'card'>(fromEnd ? 'card' : 'talk');
  const [talkFromEnd, setTalkFromEnd] = useState(false);
  const id = concepts[i];
  const c = CONCEPTS[id];
  const stage = stageOf(save, id);
  const known = stage === 'practising' || stage === 'common';

  const nextConcept = () => {
    meet(id);
    if (i + 1 < concepts.length) {
      setI(i + 1);
      setPhase(known ? 'card' : 'talk');
      setTalkFromEnd(false);
    } else onDone();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const prevConcept = () => {
    if (i > 0) {
      setI(i - 1);
      setPhase('card');
    } else onBack();
  };

  const label = (
    <div className="lesson-label">
      <span className="eyebrow">Margaux explains</span>
      {concepts.length > 1 && (
        <span className="eyebrow">
          {i + 1} of {concepts.length}
        </span>
      )}
    </div>
  );

  if (phase === 'talk' && !known) {
    return (
      <section key={`${id}-talk`}>
        {label}
        <Scene
          beats={c.lesson.plain.map((text) => ({ who: 'margaux' as const, text }))}
          startAtEnd={talkFromEnd}
          onBack={prevConcept}
          onDone={() => setPhase('card')}
          cta="Show me the card"
        />
      </section>
    );
  }
  return (
    <section key={`${id}-card`}>
      {label}
      {known && (
        <Bubble beat={{ who: 'margaux', text: `You know this one already. Here’s the card if you want a look.` }} />
      )}
      <LessonCard concept={c} />
      <div className="scene-controls">
        <button
          type="button"
          className="btn ghost small"
          onClick={() => {
            if (known) prevConcept();
            else {
              setTalkFromEnd(true);
              setPhase('talk');
            }
          }}
        >
          ← Back
        </button>
        <span />
        <button type="button" className="btn" onClick={nextConcept}>
          {i + 1 < concepts.length ? 'Next idea' : 'Got it, let’s play'} →
        </button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- small cards

function Promotion({ concept, to }: { concept: ConceptId; to: Stage }) {
  return (
    <div className="level-up" role="status">
      <span className="level-up-tag">Level up</span>
      <strong>{CONCEPTS[concept].name}</strong> is now <em>{STAGE_LABEL[to]}</em>.{' '}
      {to === 'practising' && 'From now on it’s on your own: no formula menu, no tips.'}
      {to === 'common' && 'From now on it’s exam conditions: no help, marks at the end.'}
      {to === 'new' && ''}
    </div>
  );
}

function DoneCard({ title, score, max, onNext }: { title: string; score: number; max: number; onNext: () => void }) {
  return (
    <section className="done-card">
      <div className="done-tick">✓</div>
      <div>
        <div className="eyebrow">Already played</div>
        <div className="done-title">{title}</div>
        <div className="muted">
          ✦ {score} / {max} points
        </div>
      </div>
      <button type="button" className="btn" onClick={onNext} autoFocus>
        Continue →
      </button>
    </section>
  );
}

const pickProblem = (concept: ConceptId, rng: () => number): Problem => pickOne(rng, problemsFor(concept));

/** A quick, one-minute pop quiz on something learnt earlier. */
function SpotCheck({ exclude, onDone }: { exclude: ConceptId[]; onDone: (score: number, max: number) => void }) {
  const { save, recordWork } = useGame();
  const [seed] = useState(newSeed);
  const [target] = useState(() => pickSpotCheck(save, PRACTISABLE, exclude, Date.now()));
  const [promo, setPromo] = useState<Stage | null>(null);
  const [done, setDone] = useState<{ score: number; max: number } | null>(null);
  const setup = useMemo(() => {
    if (!target) return null;
    const rng = mulberry32(seed);
    const p = pickProblem(target, rng);
    return { p, params: hasParams(p) ? p.vary(rng) : null };
  }, [target, seed]);

  if (!target || !setup) {
    return (
      <section>
        <Bubble beat={{ who: 'margaux', mood: 'happy', text: 'No pop quiz today. Enjoy it while it lasts.' }} />
        <div className="scene-controls">
          <span />
          <span />
          <button type="button" className="btn" onClick={() => onDone(0, 0)} autoFocus>
            Finish →
          </button>
        </div>
      </section>
    );
  }
  if (done) {
    return (
      <section>
        <Bubble
          beat={{
            who: 'margaux',
            mood: done.score === done.max ? 'happy' : 'worried',
            text: done.score === done.max ? 'Still sharp. Good.' : 'Bit rusty. We’ll come back to that one.',
          }}
        />
        {promo && <Promotion concept={target} to={promo} />}
        <div className="scene-controls">
          <span />
          <span className="muted">
            ✦ {done.score} / {done.max}
          </span>
          <button type="button" className="btn" onClick={() => onDone(done.score, done.max)} autoFocus>
            Finish →
          </button>
        </div>
      </section>
    );
  }
  const stage = stageOf(save, target);
  const tier = maxTier('unguided', tierFor(stage));
  const intro = (
    <div className="pop-quiz">
      <span className="pop-tag">Pop quiz</span> {CONCEPTS[target].name}, with new numbers. {TIER_LABEL[tier]}: {TIER_BLURB[tier].toLowerCase()}
    </div>
  );
  return (
    <RoundRunner
      problem={setup.p}
      params={setup.params}
      tier={tier}
      seed={seed}
      count={3}
      intro={intro}
      onDone={(r) => {
        const clean = r.clean[target] ?? r.score === r.max;
        const to = recordWork(target, clean, true);
        if (to && to !== stage) setPromo(to);
        setDone({ score: r.score, max: r.max });
      }}
    />
  );
}

// ---------------------------------------------------------------- session

export function SessionPlayer({ sessionId }: { sessionId: string }) {
  const { save, setSave, go, back, applyOutcome, recordWork } = useGame();
  const found = findSession(sessionId)!;
  const { session, act, index } = found;
  const replay = !!save.sessions[sessionId];
  const resume = save.resume?.sessionId === sessionId ? save.resume : null;
  const [part, setPart] = useState(resume?.part ?? 0);
  const [done, setDone] = useState<Record<number, { score: number; max: number }>>(resume?.done ?? {});
  const [cameBack, setCameBack] = useState(false);
  const [startValue] = useState(resume?.startValue ?? save.value);
  const [seed] = useState(newSeed);
  const [promos, setPromos] = useState<{ concept: ConceptId; to: Stage }[]>([]);
  const taught = useMemo(() => session.parts.flatMap((p) => (p.kind === 'lesson' ? p.concepts : [])), [session]);
  const total = session.parts.length;
  const finished = part >= total;
  const score = Object.values(done).reduce((s, d) => s + d.score, 0);
  const max = Object.values(done).reduce((s, d) => s + d.max, 0);

  useEffect(() => {
    if (!finished) setSave((s) => ({ ...s, resume: { sessionId, part, score, max, startValue, done } }));
  }, [part, done, finished, sessionId, startValue, setSave, score, max]);

  const recorded = useRef(false);
  useEffect(() => {
    if (!finished || recorded.current) return;
    recorded.current = true;
    setSave((s) =>
      bumpStreak({
        ...s,
        resume: null,
        sessionsPlayed: s.sessionsPlayed + 1,
        sessions: { ...s.sessions, [sessionId]: { at: Date.now(), score, max } },
      }),
    );
  }, [finished, score, max, sessionId, setSave]);

  const forward = (result?: { score: number; max: number }) => {
    if (result) setDone((d) => ({ ...d, [part]: result }));
    setCameBack(false);
    setPart((p) => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const backward = () => {
    if (part === 0) return back();
    setCameBack(true);
    setPart((p) => p - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const notePromo = (concept: ConceptId, to: Stage | null) => to && setPromos((p) => [...p, { concept, to }]);

  const head = (
    <header className="session-head">
      <div className="spread">
        <div className="eyebrow">
          Chapter {act.numeral} · Episode {index + 1}
          {replay && ' · replay, just for practice'}
        </div>
        {!finished && (
          <span className="muted num-tab" style={{ fontSize: 13 }}>
            ✦ {score} points
          </span>
        )}
      </div>
      <h1>{session.title}</h1>
      <div className="progress-dots" aria-hidden>
        {session.parts.map((_, i) => (
          <span key={i} className={i < part ? 'done' : i === part ? 'here' : ''} />
        ))}
      </div>
    </header>
  );

  if (finished) {
    const nextSession = act.sessions[index + 1];
    const delta = save.value - startValue;
    const stars = starsFor(score, max);
    return (
      <div className="play">
        <div className="play-main">
          {head}
          <section className="finale">
            <div className="eyebrow">Episode cleared</div>
            <div className="finale-stars">
              <Stars n={stars} />
            </div>
            <div className="finale-grid">
              <div>
                <div className="eyebrow">Points</div>
                <div className="big-number">
                  {score}
                  <span className="muted" style={{ fontSize: 24 }}>
                    {' '}
                    / {max}
                  </span>
                </div>
              </div>
              <div>
                <div className="eyebrow">House value</div>
                <div className={`big-number delta ${delta >= 0 ? 'up' : 'down'}`} style={{ fontWeight: 400 }}>
                  {eurSigned(delta)}
                </div>
              </div>
            </div>
            {promos.map((p, i) => (
              <Promotion key={i} concept={p.concept} to={p.to} />
            ))}
            <Bubble
              beat={{
                who: 'margaux',
                mood: stars === 3 ? 'happy' : 'neutral',
                text:
                  stars === 3
                    ? 'Not bad at all. Come back tomorrow and do a couple from the ledger. Ideas level up when you get them right on two different days.'
                    : 'Decent. Practise the shaky ones from the ledger tomorrow. Ideas level up when you get them right on two different days.',
              }}
            />
            <div className="scene-controls">
              <button type="button" className="btn ghost" onClick={() => go({ name: 'map' })}>
                Back to the map
              </button>
              <span />
              {nextSession ? (
                <button type="button" className="btn" onClick={() => go({ name: 'play', sessionId: nextSession.id })}>
                  Next: {nextSession.title} →
                </button>
              ) : act.boss ? (
                <button type="button" className="btn" onClick={() => go({ name: 'boss', act: act.number })}>
                  Boss level: {act.boss.title} →
                </button>
              ) : null}
            </div>
          </section>
        </div>
        <aside className="play-side">
          <Ledger />
        </aside>
      </div>
    );
  }

  const p = session.parts[part];
  let body: JSX.Element;
  if (p.kind === 'story')
    body = <Scene key={part} beats={p.beats} scene={p.scene} startAtEnd={cameBack} onBack={backward} onDone={() => forward()} />;
  else if (p.kind === 'lesson')
    body = <Lessons key={part} concepts={p.concepts} fromEnd={cameBack} onBack={backward} onDone={() => forward()} />;
  else if (done[part]) {
    const title = p.kind === 'problem' ? PROBLEMS[p.problem].title : 'Pop quiz';
    body = <DoneCard key={part} title={title} score={done[part].score} max={done[part].max} onNext={() => forward()} />;
  } else if (p.kind === 'spotcheck') body = <SpotCheck key={part} exclude={taught} onDone={(s, m) => forward({ score: s, max: m })} />;
  else {
    const problem = PROBLEMS[p.problem];
    // Help fades: by the concept's stage, by the episode's own setting, and refreshers never start fully guided.
    const tier = maxTier(tierFor(stageOf(save, problem.concept)), p.tier, act.refresher ? 'unguided' : undefined);
    {
      body = (
        <RoundRunner
          key={part}
          problem={problem}
          params={p.params}
          tier={tier}
          seed={seed + part}
          outcomeNote={!replay}
          onDone={(r: RoundResult) => {
            const o = r.calc?.instance.outcomes[r.calc.decision] ?? r.outcome;
            if (!replay && o) applyOutcome(o);
            for (const [c, clean] of Object.entries(r.clean)) notePromo(c, recordWork(c, clean, false));
            forward({ score: r.score, max: r.max });
          }}
        />
      );
    }
  }

  return (
    <div className="play">
      <div className="play-main">
        {head}
        {(p.kind === 'problem' || p.kind === 'spotcheck') && !done[part] && (
          <button type="button" className="link back-link" onClick={backward}>
            ← Back
          </button>
        )}
        {body}
      </div>
      <aside className="play-side" aria-label="Ledger">
        <Ledger />
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------- boss round

export function BossPlayer({ actNumber }: { actNumber: number }) {
  const { setSave, go, back, recordWork } = useGame();
  const act = ACTS[actNumber - 1];
  const boss = act.boss!;
  const [i, setI] = useState(-1);
  const [seed] = useState(newSeed);
  const [runs, setRuns] = useState<{ title: string; r: RoundResult }[]>([]);
  // Exam conditions: one clock for the whole paper. When it runs out, pens down; unattempted parts score nothing.
  const allowance = useMemo(() => boss.problems.reduce((m, x) => m + minutesFor(PROBLEMS[x.problem]), 0), [boss]);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (endsAt === null) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  const timeUp = endsAt !== null && now >= endsAt && i < boss.problems.length;
  const [stopped, setStopped] = useState(false);
  useEffect(() => {
    if (timeUp && !stopped) {
      setStopped(true);
      setRuns((x) => [
        ...x,
        ...boss.problems.slice(x.length).map((b) => ({ title: `${PROBLEMS[b.problem].title} (not reached)`, r: { score: 0, max: nominalMax(PROBLEMS[b.problem], b.params), clean: {} } })),
      ]);
      setI(boss.problems.length);
    }
  }, [timeUp, stopped, boss]);
  const done = i >= boss.problems.length;
  const left = endsAt === null ? allowance * 60 : Math.max(0, Math.round((endsAt - now) / 1000));
  const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (!done) return;
    const score = runs.reduce((s, x) => s + x.r.score, 0);
    const max = runs.reduce((s, x) => s + x.r.max, 0);
    setSave((s) => bumpStreak({ ...s, bosses: { ...s.bosses, [actNumber]: { at: Date.now(), score, max } } }));
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const head = (
    <header className="session-head">
      <div className="spread">
        <div className="eyebrow">Chapter {act.numeral} · Boss level · exam conditions</div>
        {!done && <span className={`exam-clock${left < 300 && endsAt !== null ? ' low' : ''}`}>⏱ {clock}</span>}
      </div>
      <h1>{boss.title}</h1>
      <div className="progress-dots" aria-hidden>
        {boss.problems.map((_, k) => (
          <span key={k} className={k < i ? 'done' : k === i ? 'here' : ''} />
        ))}
      </div>
    </header>
  );

  if (i < 0)
    return (
      <div className="play-main narrow">
        {head}
        <Scene
          beats={[...boss.intro, { who: 'narrator', text: `Exam conditions: ${allowance} minutes for ${boss.problems.length} parts. No tips, no cheat cards, marks only at the end of each part. The clock starts when you do.` }]}
          onBack={back}
          onDone={() => {
            setEndsAt(Date.now() + allowance * 60_000);
            setNow(Date.now());
            setI(0);
          }}
          cta="Start the clock"
        />
      </div>
    );

  if (done) {
    const score = runs.reduce((s, x) => s + x.r.score, 0);
    const max = runs.reduce((s, x) => s + x.r.max, 0);
    return (
      <div className="play-main narrow">
        {head}
        <section className="finale">
          <div className="eyebrow">{stopped ? 'Pens down: time’s up' : 'Boss defeated'}</div>
          <div className="finale-stars">
            <Stars n={starsFor(score, max)} />
          </div>
          <div className="big-number" style={{ margin: '8px 0 16px' }}>
            {score} <span className="muted" style={{ fontSize: 24 }}>/ {max}</span>
          </div>
          <table className="marks-table">
            <tbody>
              {runs.map((x, k) => (
                <tr key={k}>
                  <td>
                    ({String.fromCharCode(97 + k)}) {x.title}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {x.r.score} / {x.r.max}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="paper-card">
          <Bubble
            beat={{
              who: 'margaux',
              text: 'Homework. Do these on paper, every working written out, just like you did here. They’re the real test.',
            }}
          />
          <ul>
            {boss.paper.map((p) => (
              <li key={p.ref}>
                <b>{p.ref}</b>
                <span>{p.note}</span>
              </li>
            ))}
          </ul>
        </section>
        <div className="scene-controls">
          <span />
          <span />
          <button type="button" className="btn" onClick={() => go({ name: 'map' })}>
            Back to the map
          </button>
        </div>
      </div>
    );
  }

  const spec = boss.problems[i];
  const problem = PROBLEMS[spec.problem];
  return (
    <div className="play-main narrow">
      {head}
      <RoundRunner
        key={i}
        problem={problem}
        params={spec.params}
        tier="exam"
        seed={seed + i}
        intro={<div className="pop-quiz">Part ({String.fromCharCode(97 + i)}) of {boss.problems.length}</div>}
        onDone={(r) => {
          for (const [c, clean] of Object.entries(r.clean)) recordWork(c, clean, false);
          setRuns((x) => [...x, { title: problem.title, r }]);
          setI(i + 1);
          window.scrollTo({ top: 0 });
        }}
      />
    </div>
  );
}

/** Exam-style time allowance for a part, in minutes (roughly 1.2 minutes a mark). */
function minutesFor(p: Problem) {
  switch (p.kind) {
    case 'calc':
      return 4;
    case 'statement':
      return 12;
    case 'grid':
      return 10;
    case 'judgement':
      return 8;
    case 'brief':
      return 5;
    default:
      return 3;
  }
}

/** Marks a part is worth, for parts not reached before the clock ran out. */
function nominalMax(p: Problem, params?: unknown) {
  switch (p.kind) {
    case 'calc':
      return 6;
    case 'statement':
      return p.build(params ?? p.base).signed ? 10 : 8;
    case 'grid':
      return p.build(params ?? p.base).rows.filter((r) => !r.given).length + 2;
    case 'judgement':
      return p.items.length * 2 + 2;
    case 'brief':
      return p.cards.filter((c) => c.kind === 'key').length;
    case 'classify':
      return p.show;
    case 'table':
      return p.rows.reduce((n, r) => n + r.answers.length, 0);
  }
}

// ---------------------------------------------------------------- practice from the ledger

export function PracticePlayer({ concept }: { concept: ConceptId }) {
  const { save, go, recordWork, openLesson } = useGame();
  const [round, setRound] = useState(0);
  const [seed, setSeed] = useState(newSeed);
  const [result, setResult] = useState<{ score: number; max: number; promo: Stage | null } | null>(null);
  const stage = stageOf(save, concept);
  const setup = useMemo(() => {
    const rng = mulberry32(seed);
    const p = pickProblem(concept, rng);
    return { p, params: hasParams(p) ? p.vary(rng) : null };
  }, [concept, seed]);
  const [tier, setTier] = useState<Tier>(() => tierFor(stage));
  const spot = stage === 'common';
  const c = CONCEPTS[concept];

  const again = () => {
    setResult(null);
    setSeed(newSeed());
    setRound((r) => r + 1);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="play-main narrow">
      <header className="session-head">
        <div className="eyebrow">Practice · {STAGE_LABEL[stage]}</div>
        <h1>{c.name}</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          New numbers every round.{' '}
          <button type="button" className="link" onClick={() => openLesson(concept)}>
            Open the cheat card
          </button>
        </p>
        <div className="tier-pick" role="radiogroup" aria-label="How much help">
          {(['guided', 'unguided', 'exam'] as Tier[]).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={tier === t}
              className={`pill ${tier === t ? 'on' : ''}`}
              onClick={() => {
                setTier(t);
                again();
              }}
            >
              {TIER_LABEL[t]}
            </button>
          ))}
          <span className="muted" style={{ fontSize: 13 }}>{TIER_BLURB[tier]}</span>
        </div>
      </header>
      {result ? (
        <section className="finale">
          <div className="finale-stars">
            <Stars n={starsFor(result.score, result.max)} />
          </div>
          <div className="big-number" style={{ margin: '8px 0' }}>
            {result.score} <span className="muted" style={{ fontSize: 24 }}>/ {result.max}</span>
          </div>
          {result.promo && <Promotion concept={concept} to={result.promo} />}
          <div className="scene-controls">
            <button type="button" className="btn ghost" onClick={() => go({ name: 'map' })}>
              Back to the map
            </button>
            <span />
            <button type="button" className="btn" onClick={again} autoFocus>
              Another round →
            </button>
          </div>
        </section>
      ) : (
        <RoundRunner
          key={round}
          problem={setup.p}
          params={setup.params}
          tier={tier}
          seed={seed}
          onDone={(r) => {
            const promo = recordWork(concept, r.clean[concept] ?? r.score === r.max, spot);
            setResult({ score: r.score, max: r.max, promo });
          }}
        />
      )}
    </div>
  );
}
