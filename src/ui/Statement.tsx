// Statement builder: place each line in the right section (and, for cash flows, add or deduct it),
// then type the subtotals and the bottom line. Each move is marked on its own, with error carried forward.
import { useMemo, useState, type ReactNode } from 'react';
import { acc, parseNumber } from '../engine/format';
import {
  STEP_MAX,
  cleanRun,
  markDecision,
  markSubtotals,
  markTotals,
  placedOk,
  sectionSums,
  shareMark,
  totals as sumResults,
  truePlacements,
  type Placement,
  type StepResult,
} from '../engine/grading';
import { mulberry32, shuffle } from '../engine/rng';
import { TIER_LABEL } from '../engine/mastery';
import type { StatementInstance, StatementProblem, Tier } from '../engine/types';
import { Bubble, Chat } from './Chat';
import { DataTable } from './Diagrams';
import type { RoundResult } from './Rounds';
import { Stars, starsFor } from './Stars';
import { useGame } from './store';
import { Tex } from './Tex';

type Move = 'place' | 'sign' | 'subtotals' | 'totals' | 'decision';
const MOVE_NAMES: Record<Move, string> = {
  place: 'Place each line',
  sign: 'Add or deduct',
  subtotals: 'Subtotals',
  totals: 'The bottom line',
  decision: 'Make the call',
};
const MOVE_HELP: Record<Move, string> = {
  place: 'Which section does each line belong in? Some lines don’t belong at all: leave those out.',
  sign: 'Does each line add to its section or come off it? Cash in adds; cash out deducts.',
  subtotals: 'Add up each section as you placed it. A right total from your own placing still scores.',
  totals: 'Now the figures the whole statement is for.',
  decision: 'Your call, and the reason you’d give.',
};

/** The statement laid out as placed: each section, its lines, and its subtotal. */
export function StatementView({ inst, placements, mark }: { inst: StatementInstance; placements: Record<string, Placement>; mark?: boolean }) {
  const sums = sectionSums(inst, placements);
  return (
    <div className="statement">
      <div className="statement-head">{inst.heading}</div>
      {inst.sections.map((s) => {
        const lines = inst.items.filter((it) => placements[it.id]?.section === s.id);
        return (
          <div className="st-section" key={s.id}>
            <div className="st-section-label">{s.label}</div>
            {lines.length === 0 && <div className="st-line empty">Nothing placed here yet</div>}
            {lines.map((it) => {
              const p = placements[it.id];
              const sign = inst.signed ? (p.sign ?? it.sign) : it.sign;
              const ok = placedOk(it, p) && (!inst.signed || sign === it.sign);
              return (
                <div className={`st-line${mark ? (ok ? ' ok' : ' bad') : ''}`} key={it.id}>
                  <span>{it.label}</span>
                  <span className="num-tab">{acc(sign * it.amount)}</span>
                </div>
              );
            })}
            {s.subtotal && (
              <div className="st-line subtotal">
                <span>{s.subtotal}</span>
                <span className="num-tab">{acc(sums[s.id])}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Pips({ r }: { r?: StepResult }) {
  if (!r) return null;
  return (
    <span className="pips" aria-label={`${r.score} of ${r.max} points`}>
      {Array.from({ length: r.max }, (_, i) => (
        <span key={i} className={r.score >= i + 1 ? 'on' : r.score > i ? 'half' : ''} />
      ))}
    </span>
  );
}

function Money({ id, label, value, onChange, state, disabled }: { id: string; label: ReactNode; value: string; onChange: (v: string) => void; state?: 'good' | 'bad'; disabled?: boolean }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={`input-wrap${state ? ' ' + state : ''}`}>
        <span className="affix">€</span>
        <input id={id} inputMode="decimal" autoComplete="off" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export function StatementRunner({ problem, params, seed, intro, onDone, outcomeNote, tier = 'guided' }: { problem: StatementProblem; params?: unknown; seed: number; intro?: ReactNode; outcomeNote?: boolean; tier?: Tier; onDone: (r: RoundResult) => void }) {
  const exam = tier === 'exam';
  const { openLesson } = useGame();
  const inst = useMemo(() => problem.build(params ?? problem.base), [problem, params]);
  const order = useMemo(() => {
    const rng = mulberry32(seed);
    return { items: shuffle(rng, inst.items), why: shuffle(rng, inst.decision.why) };
  }, [inst, seed]);
  const moves: Move[] = inst.signed ? ['place', 'sign', 'subtotals', 'totals', 'decision'] : ['place', 'subtotals', 'totals', 'decision'];
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'answer' | 'feedback' | 'summary'>('answer');
  const [placements, setPlacements] = useState<Record<string, Placement>>({});
  const [subs, setSubs] = useState<Record<string, string>>({});
  const [tots, setTots] = useState<Record<string, string>>({});
  const [choice, setChoice] = useState<string | null>(null);
  const [why, setWhy] = useState<string | null>(null);
  const [hints, setHints] = useState<Partial<Record<Move, boolean>>>({});
  const [results, setResults] = useState<Partial<Record<Move, StepResult>>>({});

  const move = moves[idx];
  const fb = phase === 'feedback';
  const truth = useMemo(() => truePlacements(inst), [inst]);
  const subSections = inst.sections.filter((s) => s.subtotal);
  const parsedSubs = Object.fromEntries(subSections.map((s) => [s.id, parseNumber(subs[s.id] ?? '')]));
  const parsedTots = Object.fromEntries(inst.totals.map((t) => [t.key, parseNumber(tots[t.key] ?? '')]));
  const subMarks = markSubtotals(inst, placements, parsedSubs);
  const totMarks = markTotals(inst, parsedSubs, parsedTots);
  const half = (n: number, h: boolean | undefined) => (h ? n / 2 : n);
  const hintText = { place: inst.hints.place, sign: inst.hints.sign, subtotals: inst.hints.subtotals, totals: inst.hints.totals, decision: inst.hints.decision }[move];

  const setPlace = (id: string, section: string | null) => setPlacements((p) => ({ ...p, [id]: { section, sign: p[id]?.sign ?? null } }));
  const setSign = (id: string, sign: 1 | -1) => setPlacements((p) => ({ ...p, [id]: { section: p[id]?.section ?? null, sign } }));

  const canCheck = (() => {
    switch (move) {
      case 'place':
        return inst.items.every((it) => placements[it.id]?.section);
      case 'sign':
        return inst.items.filter((it) => placements[it.id]?.section !== 'none').every((it) => placements[it.id]?.sign);
      case 'subtotals':
        return subSections.every((s) => parsedSubs[s.id] !== null);
      case 'totals':
        return inst.totals.every((t) => parsedTots[t.key] !== null);
      case 'decision':
        return !!choice && !!why;
    }
  })();

  const check = () => {
    const h = !!hints[move];
    let r: StepResult;
    if (move === 'place') {
      const right = inst.items.filter((it) => placedOk(it, placements[it.id])).length;
      r = { score: half(shareMark(right, inst.items.length), h), max: STEP_MAX, hinted: h, correct: right === inst.items.length };
    } else if (move === 'sign') {
      const signedItems = inst.items.filter((it) => it.section !== 'none');
      const right = signedItems.filter((it) => placements[it.id]?.sign === it.sign).length;
      r = { score: half(shareMark(right, signedItems.length), h), max: STEP_MAX, hinted: h, correct: right === signedItems.length };
    } else if (move === 'subtotals') {
      r = { score: half(shareMark(subMarks.right, subMarks.of), h), max: STEP_MAX, hinted: h, correct: subMarks.right === subMarks.of, ecf: Object.values(subMarks.ecf).some(Boolean) };
    } else if (move === 'totals') {
      r = { score: half(shareMark(totMarks.right, totMarks.of), h), max: STEP_MAX, hinted: h, correct: totMarks.right === totMarks.of };
    } else r = markDecision(inst.decision, choice, why, h);
    setResults((x) => ({ ...x, [move]: r }));
    // Exam conditions: no reveal, no correction of the placing. Errors carry, and are marked from your own lines.
    if (exam) next();
    else setPhase('feedback');
  };

  const next = () => {
    if (idx === moves.length - 1) setPhase('summary');
    else {
      setIdx(idx + 1);
      setPhase('answer');
    }
    requestAnimationFrame(() => document.getElementById('st-work')?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  };

  const tally = sumResults(results);
  const finish = () => onDone({ score: tally.score, max: tally.max, clean: { [problem.concept]: cleanRun(results) }, outcome: choice ? inst.outcomes[choice] : undefined });

  if (phase === 'summary') {
    const outcome = choice ? inst.outcomes[choice] : undefined;
    return (
      <section className="panel" aria-labelledby="st-summary">
        <div className="spread">
          <div>
            <div className="eyebrow">Round over</div>
            <h2 id="st-summary" className="step-title" style={{ marginTop: 4 }}>
              {problem.title}
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Stars n={starsFor(tally.score, tally.max)} />
            <div className="points num-tab">
              ✦ {tally.score} / {tally.max}
            </div>
          </div>
        </div>
        <table className="marks-table">
          <tbody>
            {moves.map((m, i) => (
              <tr key={m}>
                <td>
                  {i + 1}. {MOVE_NAMES[m]}
                  {results[m]?.hinted && <span className="tagline">used a tip</span>}
                  {results[m]?.ecf && <span className="tagline">method points</span>}
                </td>
                <td>
                  <Pips r={results[m]} />
                </td>
              </tr>
            ))}
            <tr className="total">
              <td>Total</td>
              <td>
                {tally.score} / {tally.max}
              </td>
            </tr>
          </tbody>
        </table>
        <h3 className="eyebrow" style={{ marginTop: 22 }}>
          How Margaux lays it out
        </h3>
        {exam && (
          <>
            <h3 className="eyebrow" style={{ marginTop: 18 }}>
              Yours, marked line by line
            </h3>
            <StatementView inst={inst} placements={placements} mark />
          </>
        )}
        <StatementView inst={inst} placements={truth} />
        {inst.working.length > 0 && (
          <div className="working">
            {inst.working.map((w, i) => (
              <div className="line" key={i}>
                <Tex>{w}</Tex>
              </div>
            ))}
          </div>
        )}
        <p className="muted" style={{ fontSize: 14 }}>
          {inst.decision.explain}
        </p>
        {outcomeNote && outcome && <p className="outcome">{outcome.news}</p>}
        <div className="step-actions">
          <button type="button" className="link" onClick={() => openLesson(problem.concept)}>
            Open the cheat card
          </button>
          <span className="spacer" />
          <button type="button" className="btn" onClick={finish} autoFocus>
            Continue
          </button>
        </div>
      </section>
    );
  }

  const r = results[move];
  const sectionLabel = (id: string | null) => (id === 'none' ? 'Leave it out' : (inst.sections.find((s) => s.id === id)?.label ?? ''));

  return (
    <section aria-labelledby="st-title">
      {intro}
      <div className="game-title">
        <span className={`game-kind tier-${tier}`}>Statement builder · {TIER_LABEL[tier]}</span>
        <h2 id="st-title">{problem.title}</h2>
      </div>
      <Chat beats={inst.prompt} host={problem.host} />
      {inst.data && <DataTable d={inst.data} compact />}
      <div className="ask-card">
        <span className="ask-tag">The question</span>
        {inst.ask}
      </div>

      <nav className="stepper" aria-label="Moves" id="st-work">
        <ol>
          {moves.map((m, i) => (
            <li key={m} className={i === idx ? 'current' : i < idx || (i === idx && fb) ? 'done' : ''} aria-current={i === idx ? 'step' : undefined}>
              <span className="n">{results[m]?.correct || results[m]?.ecf ? '✓' : i + 1}</span>
              <span className="lbl">{MOVE_NAMES[m]}</span>
              <Pips r={results[m]} />
            </li>
          ))}
        </ol>
      </nav>

      <div className="panel">
        <h3 className="step-title">
          <span className="move-n">Move {idx + 1}</span> {MOVE_NAMES[move]}
        </h3>
        <p className="step-help">{MOVE_HELP[move]}</p>

        {(move === 'place' || move === 'sign') && (
          <table className="st-items">
            <thead>
              <tr>
                <th>Line</th>
                <th className="num">€</th>
                <th>{move === 'place' ? 'Section' : 'In the statement'}</th>
                {move === 'sign' && <th>Add or deduct?</th>}
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => {
                const p = placements[it.id];
                const placeRight = placedOk(it, p);
                const signRight = p?.sign === it.sign;
                const showPlace = move === 'place' && fb;
                const showSign = move === 'sign' && fb && p?.section !== 'none';
                return (
                  <tr key={it.id} className={showPlace ? (placeRight ? 'row-ok' : 'row-bad') : showSign ? (signRight ? 'row-ok' : 'row-bad') : ''}>
                    <td>
                      {it.label}
                      {((showPlace && !placeRight) || (showSign && !signRight) || ((showPlace || showSign) && it.section === 'none')) && <div className="row-why">{it.why}</div>}
                    </td>
                    <td className="num num-tab">{it.amount.toLocaleString('en-GB')}</td>
                    <td>
                      {move === 'place' ? (
                        <>
                          <select
                            className="st-select"
                            aria-label={`Section for ${it.label}`}
                            value={p?.section ?? ''}
                            disabled={fb}
                            onChange={(e) => setPlace(it.id, e.target.value || null)}
                          >
                            <option value="">Choose…</option>
                            {inst.sections.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                            <option value="none">Leave it out</option>
                          </select>
                          {showPlace && !placeRight && <div className="ws-should">→ {sectionLabel(it.section)}</div>}
                        </>
                      ) : (
                        <span className="muted">{sectionLabel(p?.section ?? null)}</span>
                      )}
                    </td>
                    {move === 'sign' && (
                      <td>
                        {p?.section === 'none' ? (
                          <span className="muted">—</span>
                        ) : (
                          <div className="pills" role="radiogroup" aria-label={`Add or deduct ${it.label}`}>
                            {([1, -1] as const).map((sg) => {
                              const on = p?.sign === sg;
                              const st = showSign ? (sg === it.sign ? 'right' : on ? 'wrong' : '') : '';
                              return (
                                <button key={sg} type="button" role="radio" aria-checked={on} className={`pill ${on ? 'on' : ''} ${st}`} disabled={fb} onClick={() => setSign(it.id, sg)}>
                                  {sg === 1 ? '+ Add' : '( ) Deduct'}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {move === 'subtotals' && (
          <div className="st-split">
            <StatementView inst={inst} placements={placements} mark />
            <div className="fields">
              {subSections.map((s) => {
                const ok = fb ? subMarks.ok[s.id] : undefined;
                return (
                  <div key={s.id}>
                    <Money
                      id={`sub-${s.id}`}
                      label={s.subtotal}
                      value={subs[s.id] ?? ''}
                      onChange={(v) => setSubs((x) => ({ ...x, [s.id]: v }))}
                      state={ok === undefined ? undefined : ok ? 'good' : 'bad'}
                      disabled={fb}
                    />
                    {fb && (
                      <div className={`check ${ok ? 'good' : 'bad'}`}>
                        {ok
                          ? subMarks.ecf[s.id]
                            ? `✓ Right from your own lines. With every line placed and signed as I would, it is ${acc(subMarks.truth[s.id])}.`
                            : '✓'
                          : `✕ With every line placed and signed as I would, it is ${acc(subMarks.truth[s.id])}${Math.abs(subMarks.own[s.id] - subMarks.truth[s.id]) > 0.5 ? `; from your own lines, ${acc(subMarks.own[s.id])}` : ''}.`}
                      </div>
                    )}
                  </div>
                );
              })}
              <p className="muted" style={{ fontSize: 13 }}>
                Negatives: type −15000 or (15000).
              </p>
            </div>
          </div>
        )}

        {move === 'totals' && (
          <div className="fields">
            {inst.totals.map((t) => {
              const ok = fb ? totMarks.ok[t.key] : undefined;
              return (
                <div key={t.key}>
                  <Money id={`tot-${t.key}`} label={t.label} value={tots[t.key] ?? ''} onChange={(v) => setTots((x) => ({ ...x, [t.key]: v }))} state={ok === undefined ? undefined : ok ? 'good' : 'bad'} disabled={fb} />
                  {fb && (
                    <div className={`check ${ok ? 'good' : 'bad'}`}>
                      {ok ? '✓ ' : `✕ Should be ${acc(totMarks.expected[t.key])}. `}
                      {t.explain}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {move === 'decision' && (
          <>
            <p style={{ fontWeight: 550 }}>{inst.decision.question}</p>
            <div className="seg" role="radiogroup" aria-label="Decision">
              {inst.decision.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={choice === o.id}
                  className={`choice${fb ? (o.id === inst.decision.correct ? ' is-correct' : o.id === choice ? ' is-wrong' : '') : ''}`}
                  disabled={fb}
                  onClick={() => setChoice(o.id)}
                >
                  <span className="dot" aria-hidden />
                  <span className="body">{o.label}</span>
                </button>
              ))}
            </div>
            <p style={{ fontWeight: 550, marginTop: 18 }}>Because…</p>
            <div className="choices" role="radiogroup" aria-label="Justification">
              {order.why.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={why === o.id}
                  className={`choice${fb ? (o.id === inst.decision.correctWhy ? ' is-correct' : o.id === why ? ' is-wrong' : '') : ''}`}
                  disabled={fb}
                  onClick={() => setWhy(o.id)}
                >
                  <span className="dot" aria-hidden />
                  <span className="body">{o.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {hints[move] && !fb && hintText && (
          <div className="hint-wrap">
            <Bubble beat={{ who: 'margaux', text: `Psst. ${hintText}` }} />
          </div>
        )}

        {fb && r && (
          <div className={`reaction ${r.correct || r.ecf ? 'good' : r.score > 0 ? 'partial' : 'bad'}`} role="status">
            <Bubble
              beat={{
                who: 'margaux',
                mood: r.correct ? 'happy' : r.score > 0 ? 'neutral' : 'worried',
                text: r.correct
                  ? 'Spot on.'
                  : r.ecf
                    ? 'Your placing had slips, but your adding-up from it is right. Method points.'
                    : move === 'place'
                      ? 'Some went astray. The reasons are on the red rows. I’ll use the right placing from here on.'
                      : move === 'sign'
                        ? 'Some signs are flipped: reasons on the red rows. I’ll mark your subtotals from your own signs, so you can still earn method points.'
                      : move === 'decision'
                        ? inst.decision.explain
                        : 'Not quite. The corrections are above.',
              }}
            >
              <div className="reaction-points">
                <Pips r={r} /> +{r.score} points
              </div>
            </Bubble>
          </div>
        )}

        <div className="step-actions">
          {phase === 'answer' && tier === 'guided' && !hints[move] && (
            <button type="button" className="btn ghost small" onClick={() => setHints((h) => ({ ...h, [move]: true }))}>
              Ask Margaux for a tip (halves these points)
            </button>
          )}
          <span className="spacer" />
          <span className="points num-tab">✦ {tally.score}</span>
          {phase === 'answer' ? (
            <button type="button" className="btn" onClick={check} disabled={!canCheck}>
              Check
            </button>
          ) : (
            <button
              type="button"
              className="btn"
              autoFocus
              onClick={() => {
                // After the placing moves, carry on from the right placing so later moves are fair.
                if (move === 'place' && !inst.signed) setPlacements((p) => Object.fromEntries(inst.items.map((it) => [it.id, placedOk(it, p[it.id]) ? p[it.id] : truth[it.id]])));
                if (move === 'place' && inst.signed) setPlacements((p) => Object.fromEntries(inst.items.map((it) => [it.id, { section: placedOk(it, p[it.id]) ? p[it.id].section : it.section, sign: null }])));
                next();
              }}
            >
              {idx === moves.length - 1 ? 'See how I did' : 'Next move →'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
