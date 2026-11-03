// The step-by-step process mark: spot, formula, inputs, answer, decision. Move names change by problem type.
import { useMemo, useState, type ReactNode } from 'react';
import { CONCEPTS, METHODS } from '../content';
import { fmt, parseNumber } from '../engine/format';
import {
  cleanRun,
  expectedValues,
  inputOk,
  markAnswer,
  markDecision,
  markFormula,
  markInputs,
  playerValues,
  markSpot,
  stepsOf,
  totals,
  type StepKey,
  type StepResult,
} from '../engine/grading';
import { mulberry32, shuffle } from '../engine/rng';
import { TIER_LABEL } from '../engine/mastery';
import type { CalcProblem, Defensible, InputSpec, ProblemInstance, Tier, Unit } from '../engine/types';
import { Bubble, Chat } from './Chat';
import { BreakEven, DataTable } from './Diagrams';
import { Stars, starsFor } from './Stars';
import { useGame } from './store';
import { Tex } from './Tex';

export type RunMode = Tier;

export interface RunResult {
  clean: boolean;
  score: number;
  max: number;
  decision: string;
  instance: ProblemInstance;
  results: Partial<Record<StepKey, StepResult>>;
  /** What the player typed, for the marked script at the end of an exam. */
  typed: Typed;
}

export interface Typed {
  inputs: Record<string, number | null>;
  answer: number | null;
  decision: string | null;
  why: string | null;
}

export const STEP_NAMES: Record<StepKey, string> = {
  spot: 'Spot it',
  formula: 'Pick the formula',
  inputs: 'Plug in',
  answer: 'Crunch it',
  decision: 'Make the call',
};

const STEP_HELP: Record<StepKey, string> = {
  spot: 'Before any sums: what are we looking at? Tick every one that applies.',
  formula: 'Which rule gets you there? The key ratios sheet is one tap away.',
  inputs: 'Fish the numbers out of the conversation. Percentages as 6 for 6%. Brackets or a minus sign both work for negatives.',
  answer: 'Grab your calculator. Type what you get.',
  decision: 'Your call, and the reason you’d give the board.',
};

const PRAISE = ['Spot on.', 'Lovely.', 'Exactly right.', 'Nailed it.', 'That’s the one.'];
const NUDGE = ['Close. Here’s the fix.', 'Not quite. Look at this.', 'Ah, careful.', 'Nearly. One thing.'];

const affix = (u: Unit) => (u === 'eur' ? { pre: '€' } : u === 'pct' ? { post: '%' } : u === 'days' ? { post: 'days' } : u === 'times' ? { post: 'times' } : {});

function NumberField({
  id,
  label,
  unit,
  value,
  onChange,
  state,
  big,
  disabled,
}: {
  id: string;
  label: ReactNode;
  unit: Unit;
  value: string;
  onChange: (v: string) => void;
  state?: 'good' | 'bad';
  big?: boolean;
  disabled?: boolean;
}) {
  const a = affix(unit);
  return (
    <div className={`field${big ? ' answer-field' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className={`input-wrap${state ? ' ' + state : ''}`}>
        {a.pre && <span className="affix">{a.pre}</span>}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
        {a.post && <span className="affix">{a.post}</span>}
      </div>
    </div>
  );
}

function Choice({
  checked,
  onClick,
  children,
  state,
  disabled,
  multi,
}: {
  multi?: boolean;
  checked: boolean;
  onClick: () => void;
  children: ReactNode;
  state?: 'correct' | 'wrong';
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={checked}
      className={`choice${multi ? ' multi' : ''}${state ? ' is-' + state : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="dot" aria-hidden />
      <span className="body">{children}</span>
    </button>
  );
}

function Pips({ score, max }: { score: number; max: number }) {
  return (
    <span className="pips" aria-label={`${score} of ${max} points`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={score >= i + 1 ? 'on' : score > i ? 'half' : ''} />
      ))}
    </span>
  );
}

function Feedback({ r, seed, children }: { r: StepResult; seed: number; children: ReactNode }) {
  const kind = r.correct || r.ecf ? 'good' : r.score > 0 ? 'partial' : 'bad';
  const line = r.ecf
    ? 'Wrong inputs, but your maths from them is right. Method points, earned.'
    : r.correct
      ? PRAISE[seed % PRAISE.length] + (r.hinted ? ' With a little help.' : '')
      : NUDGE[seed % NUDGE.length];
  return (
    <div className={`reaction ${kind}`} role="status">
      <Bubble beat={{ who: 'margaux', mood: kind === 'good' ? 'happy' : kind === 'bad' ? 'worried' : 'neutral', text: line }}>
        <div className="reaction-body">{children}</div>
        <div className="reaction-points">
          <Pips score={r.score} max={r.max} /> +{r.score} points
        </div>
      </Bubble>
    </div>
  );
}

export function ProblemRunner({
  problem,
  params,
  tier,
  seed,
  onDone,
  intro,
  outcomeNote,
  noCall,
  silent,
}: {
  problem: CalcProblem;
  params: unknown;
  tier: Tier;
  seed: number;
  onDone: (r: RunResult) => void;
  intro?: ReactNode;
  /** Show the consequence for the house on the summary card. */
  outcomeNote?: boolean;
  /** A paper only asks for the sum: leave out the "make the call" move. */
  noCall?: boolean;
  /** No summary at the end: hand the result straight back, to be reviewed with the whole paper. */
  silent?: boolean;
}) {
  const { openFormulas, openLesson } = useGame();
  const inst = useMemo(() => problem.build(params ?? problem.base), [problem, params]);
  const order = useMemo(() => {
    const rng = mulberry32(seed);
    return { formulas: shuffle(rng, inst.formula.options), why: shuffle(rng, inst.decision.why), spot: shuffle(rng, inst.spot?.options ?? []) };
  }, [inst, seed]);
  const STEPS = stepsOf(inst, tier).filter((s) => !(noCall && s === 'decision'));
  const names = { ...STEP_NAMES, ...inst.stepNames, ...(tier !== 'guided' ? { inputs: 'Your workings' } : {}) };
  const exam = tier === 'exam';

  const autoSteps: StepKey[] = [];
  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState<'answer' | 'feedback' | 'summary'>('answer');
  const [spot, setSpot] = useState<string[]>([]);
  const [formula, setFormula] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [answer, setAnswer] = useState('');
  const [decision, setDecision] = useState<string | null>(null);
  const [why, setWhy] = useState<string | null>(null);
  const [hints, setHints] = useState<Partial<Record<StepKey, boolean>>>({});
  const [results, setResults] = useState<Partial<Record<StepKey, StepResult>>>({});
  const [ecfDetail, setEcfDetail] = useState<{ expected: number; own?: number } | null>(null);

  const step = STEPS[stepIdx];
  const isAuto = autoSteps.includes(step);
  const expectedAnswer = inst.solve(expectedValues(inst.inputs));
  const parsedInputs = Object.fromEntries(inst.inputs.map((s) => [s.key, parseNumber(inputs[s.key] ?? '')]));
  const hintsAllowed = tier === 'guided';
  const [defensible, setDefensible] = useState<Defensible | null>(null);

  const canCheck = (() => {
    switch (step) {
      case 'spot':
        return spot.length > 0;
      case 'formula':
        return formula !== null;
      case 'inputs':
        return inst.inputs.every((s) => parsedInputs[s.key] !== null);
      case 'answer':
        return parseNumber(answer) !== null;
      case 'decision':
        return decision !== null && why !== null;
    }
  })();

  const check = () => {
    const h = !!hints[step];
    let r: StepResult;
    switch (step) {
      case 'spot':
        r = markSpot(inst.spot!, spot, h);
        break;
      case 'formula':
        r = markFormula(inst.formula.correct, formula, h);
        break;
      case 'inputs':
        r = markInputs(inst.inputs, parsedInputs, h);
        break;
      case 'answer': {
        const a = markAnswer(inst, parseNumber(answer), results.inputs?.auto ? null : parsedInputs, h);
        setEcfDetail({ expected: a.expected, own: a.ownExpected });
        r = a;
        break;
      }
      case 'decision': {
        const d = markDecision(inst.decision, decision, why, h);
        setDefensible(d.defensible ?? null);
        r = d;
        break;
      }
    }
    const merged = { ...results, [step]: r };
    setResults(merged);
    // Exam conditions: no feedback until the end, straight on to the next move.
    if (exam) advance(merged);
    else setPhase('feedback');
  };

  const next = () => advance(results);

  const advance = (res: Partial<Record<StepKey, StepResult>>) => {
    if (stepIdx === STEPS.length - 1) {
      if (silent) finish(res);
      else setPhase('summary');
      return;
    }
    const n = stepIdx + 1;
    const nextStep = STEPS[n];
    setStepIdx(n);
    if (autoSteps.includes(nextStep)) {
      setResults((prev) => ({ ...prev, [nextStep]: { score: 0, max: 0, hinted: false, correct: true, auto: true } }));
      setPhase('feedback');
    } else setPhase('answer');
    requestAnimationFrame(() => document.getElementById('work-top')?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  };

  const finish = (res: Partial<Record<StepKey, StepResult>> = results) => {
    const t = totals(res);
    onDone({ clean: cleanRun(res), score: t.score, max: t.max, decision: decision ?? '', instance: inst, results: res, typed: { inputs: parsedInputs, answer: parseNumber(answer), decision, why } });
  };

  const r = results[step];
  const showFeedback = phase === 'feedback' && r;
  const tally = totals(results);

  // ---------------------------------------------------------------- summary
  if (phase === 'summary') {
    const outcome = decision ? inst.outcomes[decision] : undefined;
    return (
      <section className="panel" aria-labelledby="summary-title">
        <div className="spread">
          <div>
            <div className="eyebrow">Round over</div>
            <h2 id="summary-title" className="step-title" style={{ marginTop: 4 }}>
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
            {STEPS.map((s, i) => {
              const res = results[s]!;
              return (
                <tr key={s}>
                  <td>
                    {i + 1}. {names[s]}
                    {res.auto && <span className="tagline">Margaux did this</span>}
                    {res.hinted && <span className="tagline">used a tip</span>}
                    {res.ecf && <span className="tagline">method points</span>}
                  </td>
                  <td>{res.auto ? '—' : <Pips score={res.score} max={res.max} />}</td>
                </tr>
              );
            })}
            <tr className="total">
              <td>Total</td>
              <td>
                {tally.score} / {tally.max}
              </td>
            </tr>
          </tbody>
        </table>

        {exam && <ExamReview inst={inst} typed={{ inputs: parsedInputs, answer: parseNumber(answer), decision, why }} results={results} />}
        {!exam && defensible && (
          <p className="outcome" style={{ marginTop: 12 }}>
            {defensible.note}
          </p>
        )}
        <h3 className="eyebrow" style={{ marginTop: 22 }}>
          How Margaux writes it up
        </h3>
        <div className="working">
          {inst.working.map((line, i) => (
            <div className="line" key={i}>
              <Tex>{line}</Tex>
            </div>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 14 }}>
          {inst.decision.explain}
        </p>
        {inst.chart && <BreakEven c={inst.chart} />}

        {outcomeNote && outcome && <p className="outcome">{outcome.news}</p>}

        <div className="step-actions">
          <button type="button" className="link" onClick={() => openLesson(problem.concept)}>
            Cheat card: {CONCEPTS[problem.concept]?.name}
          </button>
          <span className="spacer" />
          <button type="button" className="btn" onClick={() => finish()} autoFocus>
            Continue
          </button>
        </div>
      </section>
    );
  }

  // ---------------------------------------------------------------- steps
  return (
    <section aria-labelledby="problem-title">
      {intro}
      <div className="game-title">
        <span className={`game-kind tier-${tier}`}>{TIER_LABEL[tier]}</span>
        <h2 id="problem-title">{problem.title}</h2>
      </div>
      <Chat beats={inst.prompt} host={problem.host} />
      {inst.data && <DataTable d={inst.data} compact />}
      <div className="ask-card">
        <span className="ask-tag">The question</span>
        {inst.ask}
      </div>

      <nav className="stepper" aria-label="Steps" id="work-top">
        <ol>
          {STEPS.map((s, i) => {
            const res = results[s];
            const state = i < stepIdx || (i === stepIdx && phase === 'feedback') ? 'done' : i === stepIdx ? 'current' : '';
            return (
              <li key={s} className={i === stepIdx ? 'current' : state} aria-current={i === stepIdx ? 'step' : undefined}>
                <span className="n">{res && (res.correct || res.ecf) ? '✓' : i + 1}</span>
                <span className="lbl">{names[s]}</span>
                {res && !res.auto && <Pips score={res.score} max={res.max} />}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="panel">
        <h3 className="step-title">
          <span className="move-n">Move {stepIdx + 1}</span> {names[step]}
        </h3>
        <p className="step-help">
          {isAuto
            ? 'I’ll do the sums on this one. Just check they make sense.'
            : step === 'inputs' && tier !== 'guided'
              ? `No formula menu this time: decide the method yourself, then put the figures it needs.${exam ? ' Marks come at the end.' : ''}`
              : STEP_HELP[step]}
        </p>

        {step === 'spot' && inst.spot && (
          <>
            <p style={{ fontWeight: 550 }}>{inst.spot.question}</p>
            <div className="choices" role={inst.spot.correct.length > 1 ? 'group' : 'radiogroup'} aria-label={inst.spot.question}>
              {order.spot.map((o) => {
                const multi = inst.spot!.correct.length > 1;
                const on = spot.includes(o.id);
                const right = inst.spot!.correct.includes(o.id);
                const st = showFeedback ? (right ? 'correct' : on ? 'wrong' : undefined) : undefined;
                return (
                  <Choice
                    key={o.id}
                    multi={multi}
                    checked={on}
                    state={st}
                    disabled={!!showFeedback}
                    onClick={() => setSpot((cur) => (multi ? (on ? cur.filter((x) => x !== o.id) : [...cur, o.id]) : [o.id]))}
                  >
                    {o.label}
                  </Choice>
                );
              })}
            </div>
            {!showFeedback && inst.spot.correct.length > 1 && <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>More than one is right.</p>}
          </>
        )}

        {step === 'formula' && (
          <>
            <div className="choices" role="radiogroup" aria-label="Formula">
              {order.formulas.map((id) => {
                const m = METHODS[id];
                const st = showFeedback ? (id === inst.formula.correct ? 'correct' : id === formula ? 'wrong' : undefined) : undefined;
                return (
                  <Choice key={id} checked={formula === id} onClick={() => setFormula(id)} state={st} disabled={!!showFeedback}>
                    <span className="name">
                      {m.name}
                      {m.sheet && <span className="sheet-badge">sheet ({m.sheet})</span>}
                    </span>
                    <Tex>{m.tex}</Tex>
                  </Choice>
                );
              })}
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button type="button" className="link" onClick={() => openFormulas(true)}>
                Peek at the key ratios sheet
              </button>
            </div>
          </>
        )}

        {step === 'inputs' &&
          (isAuto ? (
            <AutoInputs specs={inst.inputs} />
          ) : (
            <div className="fields">
              {inst.inputs.map((s) => {
                const ok = showFeedback ? inputOk(s, parsedInputs[s.key]) : undefined;
                return (
                  <div key={s.key}>
                    <NumberField
                      id={`in-${s.key}`}
                      label={
                        <>
                          <Tex>{s.symbol}</Tex>
                          {s.label}
                        </>
                      }
                      unit={s.unit}
                      value={inputs[s.key] ?? ''}
                      onChange={(v) => setInputs((p) => ({ ...p, [s.key]: v }))}
                      state={ok === undefined ? undefined : ok ? 'good' : 'bad'}
                      disabled={!!showFeedback}
                    />
                    {showFeedback && (
                      <div className={`check ${ok ? 'good' : 'bad'}`}>
                        {ok ? '✓ ' : `✕ Should be ${fmt(s.expected, s.unit)}. `}
                        {!ok && s.explain}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

        {step === 'answer' &&
          (isAuto ? (
            <div>
              <div className="eyebrow">{inst.answer.label}</div>
              <div className="big-number" style={{ margin: '6px 0 12px' }}>
                {fmt(expectedAnswer, inst.answer.unit, 2)}
              </div>
              <p className="muted">{inst.answer.explain}</p>
            </div>
          ) : (
            <>
              {!exam && results.inputs && !results.inputs.correct && (
                <p className="muted" style={{ fontSize: 14 }}>
                  Some inputs were off. Use yours or the corrected ones: right maths from either earns the points.
                </p>
              )}
              <NumberField
                id="answer"
                big
                label={inst.answer.label}
                unit={inst.answer.unit}
                value={answer}
                onChange={setAnswer}
                disabled={!!showFeedback}
                state={showFeedback ? (r!.correct || r!.ecf ? 'good' : 'bad') : undefined}
              />
            </>
          ))}

        {step === 'decision' && (
          <>
            {!exam && (
              <p className="muted" style={{ fontSize: 14 }}>
                {inst.answer.label}: <strong className="num-tab">{fmt(expectedAnswer, inst.answer.unit, 2)}</strong>
              </p>
            )}
            <p style={{ fontWeight: 550 }}>{inst.decision.question}</p>
            <div className="seg" role="radiogroup" aria-label="Decision">
              {inst.decision.options.map((o) => (
                <Choice
                  key={o.id}
                  checked={decision === o.id}
                  onClick={() => setDecision(o.id)}
                  disabled={!!showFeedback}
                  state={showFeedback ? (o.id === inst.decision.correct ? 'correct' : o.id === decision ? 'wrong' : undefined) : undefined}
                >
                  {o.label}
                </Choice>
              ))}
            </div>
            <p style={{ fontWeight: 550, marginTop: 18 }}>Because…</p>
            <div className="choices" role="radiogroup" aria-label="Justification">
              {order.why.map((o) => (
                <Choice
                  key={o.id}
                  checked={why === o.id}
                  onClick={() => setWhy(o.id)}
                  disabled={!!showFeedback}
                  state={showFeedback ? (o.id === inst.decision.correctWhy ? 'correct' : o.id === why ? 'wrong' : undefined) : undefined}
                >
                  {o.label}
                </Choice>
              ))}
            </div>
          </>
        )}

        {hints[step] && !showFeedback && (
          <div className="hint-wrap">
            <Bubble beat={{ who: 'margaux', text: `Psst. ${inst.hints[step] ?? 'Read the question again, slowly. Every number you need is in the conversation.'}` }} />
          </div>
        )}

        {showFeedback && !r!.auto && (
          <Feedback r={r!} seed={seed + stepIdx}>
            {step === 'spot' && <p style={{ margin: 0 }}>{inst.spot!.explain}</p>}
            {step === 'formula' && (
              <p style={{ margin: 0 }}>
                <strong>{METHODS[inst.formula.correct].name}.</strong> {inst.formula.explain}
              </p>
            )}
            {step === 'inputs' && <p style={{ margin: 0 }}>Corrections are above. For the next move, use your numbers or mine: right maths from either earns the points.</p>}
            {step === 'answer' && (
              <p style={{ margin: 0 }}>
                Correct answer: <strong>{fmt(ecfDetail?.expected ?? expectedAnswer, inst.answer.unit, 2)}</strong>. {inst.answer.explain}
                {r!.ecf && ecfDetail?.own !== undefined && <> From your inputs, {fmt(ecfDetail.own, inst.answer.unit, 2)} was the right result.</>}
              </p>
            )}
            {step === 'decision' && (
              <p style={{ margin: 0 }}>
                {defensible && <strong>{defensible.note} </strong>}
                {inst.decision.explain}
              </p>
            )}
          </Feedback>
        )}

        <div className="step-actions">
          {phase === 'answer' && hintsAllowed && !hints[step] && (
            <button type="button" className="btn ghost small" onClick={() => setHints((h) => ({ ...h, [step]: true }))}>
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
            <button type="button" className="btn" onClick={next} autoFocus>
              {stepIdx === STEPS.length - 1 ? 'See how I did' : 'Next move →'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/** Exam conditions: what you put, next to what it should have been, shown only once the round is over. */
export function ExamReview({ inst, typed, results }: { inst: ProblemInstance; typed: Typed; results: Partial<Record<StepKey, StepResult>> }) {
  const label = (id: string | null, list: { id: string; label: string }[]) => list.find((o) => o.id === id)?.label ?? '—';
  const expectedAnswer = inst.solve(expectedValues(inst.inputs));
  const answerOk = !!(results.answer?.correct || results.answer?.ecf);
  let own: number | undefined;
  try {
    own = inst.solve(playerValues(inst.inputs, typed.inputs));
  } catch {
    own = undefined;
  }
  const ecf = !!results.answer?.ecf && own !== undefined && Math.abs(own - expectedAnswer) > 0.01;
  const hasCall = !!results.decision;
  const d = hasCall ? markDecision(inst.decision, typed.decision, typed.why, false) : null;
  const exact = typed.decision === inst.decision.correct && typed.why === inst.decision.correctWhy;
  return (
    <>
      <h3 className="eyebrow" style={{ marginTop: 22 }}>
        Your script, marked
      </h3>
      <table className="marks-table review">
        <tbody>
          {inst.inputs.map((s) => {
            const ok = inputOk(s, typed.inputs[s.key]);
            return (
              <tr key={s.key} className={ok ? 'ok' : 'bad'}>
                <td>{s.label}</td>
                <td className="num-tab">{typed.inputs[s.key] === null ? '—' : fmt(typed.inputs[s.key]!, s.unit)}</td>
                <td className="num-tab">{ok ? '✓' : `✕ ${fmt(s.expected, s.unit)}`}</td>
              </tr>
            );
          })}
          <tr className={answerOk ? 'ok' : 'bad'}>
            <td>
              <strong>{inst.answer.label}</strong>
            </td>
            <td className="num-tab">{typed.answer === null ? '—' : fmt(typed.answer, inst.answer.unit, 2)}</td>
            <td className="num-tab">{answerOk ? (ecf ? '✓ from your workings' : '✓') : `✕ ${fmt(expectedAnswer, inst.answer.unit, 2)}`}</td>
          </tr>
          {hasCall && (
            <tr className={exact || d?.defensible ? 'ok' : 'bad'}>
              <td>{inst.decision.question}</td>
              <td>
                {label(typed.decision, inst.decision.options)}
                <div className="muted" style={{ fontSize: 12.5 }}>
                  {label(typed.why, inst.decision.why)}
                </div>
              </td>
              <td>{exact ? '✓' : d?.defensible ? `Defensible: ${d.defensible.note}` : `✕ ${label(inst.decision.correct, inst.decision.options)}`}</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

function AutoInputs({ specs }: { specs: InputSpec[] }) {
  return (
    <table className="marks-table">
      <tbody>
        {specs.map((s) => (
          <tr key={s.key}>
            <td>
              <Tex>{s.symbol}</Tex> <span className="muted">{s.label}</span>
              <div className="muted" style={{ fontSize: 12.5 }}>
                {s.explain}
              </div>
            </td>
            <td className="num-tab">{fmt(s.expected, s.unit)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
