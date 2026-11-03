// "Brief the board" (written answers) and table-fill rounds, plus one runner that plays any round type.
import { useMemo, useState, type ReactNode } from 'react';
import { markBrief, markTable } from '../engine/grading';
import { mulberry32, shuffle } from '../engine/rng';
import type { BriefProblem, ConceptId, Outcome, Problem, TableProblem, Tier } from '../engine/types';
import { Bubble, Chat } from './Chat';
import { ClassifyRunner } from './Classify';
import { GlossaryOff } from './Jargon';
import { JudgementRunner } from './Judgement';
import { ExamReview, ProblemRunner, type RunResult } from './ProblemRunner';
import { GridRunner } from './Grid';
import { StatementRunner } from './Statement';

/** What every round reports back. */
export interface RoundResult {
  score: number;
  max: number;
  /** Clean (correct, unaided) per concept the round touched. */
  clean: Record<ConceptId, boolean>;
  /** Calculation rounds only: the decision taken, for the story outcome. */
  calc?: RunResult;
  /** Other rounds with a decision (statements, budgets): its consequence for the house. */
  outcome?: Outcome;
  /** A marked copy of the player's script, shown with the whole paper at the end of an exam. */
  review?: ReactNode;
  /** A written answer typed freely, waiting to be marked against the mark scheme. */
  written?: string;
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="step-actions">{children}</div>;
}

/** The mark scheme for a written answer. You tick the points you actually made; wrong points you wrote cost a mark. */
export function SelfMark({ problem, ticks, onChange, locked }: { problem: BriefProblem; ticks: number[]; onChange: (t: number[]) => void; locked?: boolean }) {
  const toggle = (i: number) => !locked && onChange(ticks.includes(i) ? ticks.filter((x) => x !== i) : [...ticks, i]);
  const keys = problem.cards.map((c, i) => ({ c, i })).filter((x) => x.c.kind === 'key');
  const traps = problem.cards.map((c, i) => ({ c, i })).filter((x) => x.c.kind === 'trap');
  const r = markBrief(problem.cards, ticks, problem.cap);
  return (
    <div className="selfmark">
      <h4 className="eyebrow">Mark scheme: tick each point you actually made</h4>
      <p className="muted" style={{ fontSize: 13.5, margin: '0 0 8px' }}>
        {problem.cap ? `Up to ${problem.cap} marks: one for each distinct point.` : 'One mark for each distinct point.'} Be strict: an examiner is, and “sort of” doesn’t count.
      </p>
      {keys.map(({ c, i }) => (
        <label key={i} className={`sm-row${ticks.includes(i) ? ' on' : ''}`}>
          <input type="checkbox" checked={ticks.includes(i)} disabled={locked} onChange={() => toggle(i)} />
          <span>
            {c.text}
            <span className="sm-why">{c.why}</span>
          </span>
        </label>
      ))}
      {traps.length > 0 && (
        <>
          <h4 className="eyebrow" style={{ marginTop: 14 }}>
            Did you write any of these? Each costs a mark
          </h4>
          {traps.map(({ c, i }) => (
            <label key={i} className={`sm-row trap${ticks.includes(i) ? ' on' : ''}`}>
              <input type="checkbox" checked={ticks.includes(i)} disabled={locked} onChange={() => toggle(i)} />
              <span>
                {c.text}
                <span className="sm-why">{c.why}</span>
              </span>
            </label>
          ))}
        </>
      )}
      <div className="points num-tab" style={{ marginTop: 10 }}>
        ✦ {r.score} / {r.max}
      </div>
    </div>
  );
}

export function BriefRunner({ problem, seed, onDone, intro, tier = 'guided', silent }: { problem: BriefProblem; seed: number; onDone: (r: RoundResult) => void; intro?: ReactNode; tier?: Tier; silent?: boolean }) {
  const order = useMemo(() => shuffle(mulberry32(seed), problem.cards.map((_, i) => i)), [problem, seed]);
  const [chosen, setChosen] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [text, setText] = useState('');
  const [writing, setWriting] = useState(true);
  const result = markBrief(problem.cards, chosen, problem.cap);
  const cap = problem.cap ?? problem.cards.filter((c) => c.kind === 'key').length;
  const toggle = (i: number) => !checked && setChosen((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));
  const free = tier === 'exam';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const finishFree = () => onDone({ score: result.score, max: result.max, clean: { [problem.concept]: result.clean }, written: text });

  return (
    <section aria-labelledby="brief-title">
      {intro}
      <div className="game-title">
        <span className={`game-kind tier-${tier}`}>{free ? 'Written answer · Exam conditions' : 'Brief the board'}</span>
        <h2 id="brief-title">{problem.title}</h2>
      </div>
      <Chat beats={problem.prompt} host={problem.host} />
      <div className="ask-card">
        <span className="ask-tag">Explain</span>
        {problem.question}
      </div>
      <div className="panel" style={{ marginTop: 16 }}>
        {free ? (
          <>
            <p className="step-help">
              {writing
                ? 'Write your answer as you would on the paper: whole sentences, one point at a time. There are no hints. Then you’ll mark it yourself against the mark scheme.'
                : 'Your answer is below. Mark it honestly.'}
            </p>
            <textarea
              className="written"
              aria-label="Your written answer"
              rows={9}
              value={text}
              readOnly={!writing}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start writing…"
            />
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              {words} {words === 1 ? 'word' : 'words'}
            </div>
            {!writing && !silent && (
              <>
                <SelfMark problem={problem} ticks={chosen} onChange={setChosen} />
                <div style={{ marginTop: 18 }}>
                  <Bubble beat={{ who: 'margaux', text: 'Here’s how I’d write it up. Compare it with yours:' }}>
                    <p className="model-answer">{problem.model}</p>
                  </Bubble>
                </div>
              </>
            )}
            <Actions>
              <span className="spacer" />
              {writing ? (
                <button
                  type="button"
                  className="btn"
                  disabled={words < 3}
                  onClick={() => {
                    if (silent) finishFree();
                    else setWriting(false);
                  }}
                >
                  {silent ? 'Done with this part' : 'I’ve finished writing'}
                </button>
              ) : (
                <button type="button" className="btn" autoFocus onClick={finishFree}>
                  Continue →
                </button>
              )}
            </Actions>
          </>
        ) : (
          <>
            <p className="step-help">
              {tier === 'guided'
                ? `Build your answer: pick the points you’d write. ${problem.cap ? `The question asks for ${cap}, but more than ${cap} won’t earn extra.` : `There are ${cap} that earn marks.`} Wrong points cost one.`
                : 'Build your answer: pick the points you’d write. You aren’t told how many earn marks. Wrong points cost one, so don’t pad.'}
            </p>
            <div className="cards">
              {order.map((i) => {
                const c = problem.cards[i];
                const on = chosen.includes(i);
                const state = checked ? (c.kind === 'key' ? (on ? 'hit' : 'missed') : c.kind === 'trap' ? (on ? 'trap-hit' : 'trap') : on ? 'filler-hit' : 'filler') : '';
                return (
                  <button key={i} type="button" className={`card-pick ${on ? 'on' : ''} ${state}`} aria-pressed={on} onClick={() => toggle(i)} disabled={checked}>
                    <span className="card-text">{c.text}</span>
                    {checked && (
                      <span className="card-why">
                        {c.kind === 'key' ? (on ? '✓ Key point. ' : '○ A key point you didn’t pick. ') : c.kind === 'trap' ? (on ? '✕ Wrong: ' : '✕ Rightly left out: ') : 'True, but not what was asked. '}
                        {c.why}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {checked && (
              <div style={{ marginTop: 18 }}>
                <Bubble beat={{ who: 'margaux', mood: result.clean ? 'happy' : 'neutral', text: result.clean ? 'That’s the answer. Here’s how I’d write it up:' : 'Here’s how I’d write it up. Copy this shape on paper:' }}>
                  <p className="model-answer">{problem.model}</p>
                </Bubble>
              </div>
            )}
            <Actions>
              <span className="spacer" />
              {checked && (
                <span className="points num-tab">
                  ✦ {result.score} / {result.max}
                </span>
              )}
              {!checked ? (
                <button type="button" className="btn" disabled={!chosen.length} onClick={() => setChecked(true)}>
                  Submit my answer
                </button>
              ) : (
                <button type="button" className="btn" autoFocus onClick={() => onDone({ score: result.score, max: result.max, clean: { [problem.concept]: result.clean } })}>
                  Continue →
                </button>
              )}
            </Actions>
          </>
        )}
      </div>
    </section>
  );
}

export function TableRunner({ problem, onDone, intro }: { problem: TableProblem; onDone: (r: RoundResult) => void; intro?: ReactNode }) {
  const [given, setGiven] = useState<(string | null)[][]>(() => problem.rows.map((r) => r.answers.map(() => null)));
  const [checked, setChecked] = useState(false);
  const result = markTable(problem.rows, given);
  const set = (i: number, j: number, v: string) => !checked && setGiven((g) => g.map((row, a) => (a === i ? row.map((c, b) => (b === j ? v : c)) : row)));
  const complete = given.every((row) => row.every((c) => c !== null));

  return (
    <section aria-labelledby="table-title">
      {intro}
      <div className="game-title">
        <span className="game-kind">Fill the table</span>
        <h2 id="table-title">{problem.title}</h2>
      </div>
      <Chat beats={problem.prompt} host={problem.host} />
      <div className="panel" style={{ overflowX: 'auto' }}>
        <table className="fill-table">
          <thead>
            <tr>
              <th />
              {problem.columns.map((c) => (
                <th key={c.label}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {problem.rows.map((row, i) => (
              <tr key={row.label}>
                <th scope="row">
                  {row.label}
                  {checked && <div className="row-why">{row.why}</div>}
                </th>
                {problem.columns.map((col, j) => (
                  <td key={col.label}>
                    <div className="pills" role="radiogroup" aria-label={`${row.label}: ${col.label}`}>
                      {col.options.map((o) => {
                        const on = given[i][j] === o;
                        const st = checked ? (o === row.answers[j] ? 'right' : on ? 'wrong' : '') : '';
                        return (
                          <button key={o} type="button" role="radio" aria-checked={on} className={`pill ${on ? 'on' : ''} ${st}`} onClick={() => set(i, j, o)} disabled={checked}>
                            {o}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {checked && (
          <Bubble
            beat={{
              who: 'margaux',
              mood: result.clean ? 'happy' : 'neutral',
              text: result.clean ? 'Every cell right. Lovely.' : 'Check the reasons under each row, then try it on paper.',
            }}
          />
        )}
        <Actions>
          <span className="spacer" />
          {checked && (
            <span className="points num-tab">
              ✦ {result.score} / {result.max}
            </span>
          )}
          {!checked ? (
            <button type="button" className="btn" disabled={!complete} onClick={() => setChecked(true)}>
              Check
            </button>
          ) : (
            <button type="button" className="btn" autoFocus onClick={() => onDone({ score: result.score, max: result.max, clean: { [problem.concept]: result.clean } })}>
              Continue →
            </button>
          )}
        </Actions>
      </div>
    </section>
  );
}

/** Plays any kind of round. `count` limits sorting rounds (pop quizzes use 3). No glossary under exam conditions. */
export function RoundRunner(props: Parameters<typeof RoundRunnerInner>[0]) {
  return (
    <GlossaryOff value={props.tier === 'exam'}>
      <RoundRunnerInner {...props} />
    </GlossaryOff>
  );
}

function RoundRunnerInner({
  problem,
  params,
  tier,
  seed,
  count,
  intro,
  outcomeNote,
  noCall,
  silent,
  onDone,
}: {
  problem: Problem;
  params?: unknown;
  tier: Tier;
  seed: number;
  count?: number;
  intro?: ReactNode;
  outcomeNote?: boolean;
  /** Exam parts that only ask for the sum: no "make the call" move. */
  noCall?: boolean;
  /** Exam papers: no feedback or summary after the part; review comes with the whole paper. */
  silent?: boolean;
  onDone: (r: RoundResult) => void;
}) {
  switch (problem.kind) {
    case 'calc':
      return (
        <ProblemRunner
          problem={problem}
          params={params}
          tier={tier}
          seed={seed}
          intro={intro}
          outcomeNote={outcomeNote}
          noCall={noCall}
          silent={silent}
          onDone={(r) => onDone({ score: r.score, max: r.max, clean: { [problem.concept]: r.clean }, calc: r, review: <ExamReview inst={r.instance} typed={r.typed} results={r.results} /> })}
        />
      );
    case 'classify':
      return <ClassifyRunner problem={problem} seed={seed} count={count} intro={intro} onDone={(r) => onDone({ score: r.score, max: r.max, clean: r.clean })} />;
    case 'brief':
      return <BriefRunner problem={problem} seed={seed} intro={intro} tier={tier} silent={silent} onDone={onDone} />;
    case 'table':
      return <TableRunner problem={problem} intro={intro} onDone={onDone} />;
    case 'statement':
      return <StatementRunner problem={problem} params={params} seed={seed} intro={intro} outcomeNote={outcomeNote} tier={tier} noCall={noCall} silent={silent} onDone={onDone} />;
    case 'grid':
      return <GridRunner problem={problem} params={params} seed={seed} intro={intro} tier={tier} noCall={noCall} silent={silent} onDone={onDone} />;
    case 'judgement':
      return <JudgementRunner problem={problem} seed={seed} intro={intro} tier={tier} onDone={onDone} />;
  }
}
