// Mock exams: pick a paper, sit it under exam conditions with one clock, then mark your written answers
// and read where the marks went, with a link back to the cheat card for every weak spot.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ACTS, CONCEPTS, PROBLEMS } from '../content';
import { PAPER_KINDS, totalMarks, type Paper } from '../content/papers';
import { markBrief } from '../engine/grading';
import { newSeed } from '../engine/rng';
import type { BriefProblem, ConceptId } from '../engine/types';
import { Bubble } from './Chat';
import { RoundRunner, SelfMark, type RoundResult } from './Rounds';
import { bumpStreak, useGame } from './store';

const pctOf = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
const clock = (secs: number) => `${Math.floor(secs / 60)}:${String(Math.max(0, secs % 60)).padStart(2, '0')}`;
const dayLabel = (t: number) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const marks = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

// ---------------------------------------------------------------- hub

export function ExamHub() {
  const { save, go } = useGame();
  const daysLeft = Math.ceil((new Date(save.settings.examDate + 'T09:00:00').getTime() - Date.now()) / 86_400_000);
  return (
    <>
      <section className="hero">
        <h1>Mock exams</h1>
        <p>
          Sit a full paper under real conditions: one clock, no tips, no feedback until the end. Then see where every mark went.
          {daysLeft > 0 ? ` ${daysLeft} days to your exam.` : ''}
        </p>
      </section>
      <div className="paper-list">
        {PAPER_KINDS.map((k) => {
          const tries = save.exams.filter((e) => e.paper === k.id);
          const best = tries.reduce((m, e) => Math.max(m, pctOf(e.score, e.max)), 0);
          return (
            <article className="paper-card" key={k.id}>
              <div>
                <h2>{k.title}</h2>
                <p className="muted">{k.blurb}</p>
                {tries.length > 0 && (
                  <p className="muted" style={{ fontSize: 13 }}>
                    {tries.length} {tries.length === 1 ? 'attempt' : 'attempts'} · best {best}% · last {pctOf(tries[0].score, tries[0].max)}%
                  </p>
                )}
              </div>
              <button type="button" className="btn" onClick={() => go({ name: 'paper', kind: k.id, seed: k.fixed ? 1 : newSeed() })}>
                {tries.length ? 'Sit it again' : 'Sit this paper'} →
              </button>
            </article>
          );
        })}
      </div>
      {save.exams.length > 0 && (
        <>
          <h2 className="section-title">Your attempts</h2>
          <table className="marks-table">
            <tbody>
              {save.exams.slice(0, 10).map((e) => (
                <tr key={e.at}>
                  <td>
                    {dayLabel(e.at)} · {e.title}
                    <span className="tagline">{Math.round(e.seconds / 60)} min</span>
                  </td>
                  <td className="num-tab">
                    {marks(e.score)} / {e.max} · {pctOf(e.score, e.max)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <p className="muted" style={{ marginTop: 24, fontSize: 13.5, maxWidth: 560 }}>
        On the day you’ll have a non-programmable calculator and the sheet of key ratios and formulae. The sheet is the ƒ button at the top, as on the paper.
      </p>
    </>
  );
}

// ---------------------------------------------------------------- sitting a paper

interface PartResult {
  score: number;
  max: number;
  written?: string;
  ticks: number[];
  review?: ReactNode;
  notReached?: boolean;
}

export function PaperPlayer({ kind, seed }: { kind: string; seed: number }) {
  const { setSave, go, openLesson } = useGame();
  const def = PAPER_KINDS.find((k) => k.id === kind)!;
  const paper: Paper = useMemo(() => def.build(seed), [def, seed]);
  const parts = useMemo(() => paper.questions.flatMap((q, qi) => q.parts.map((p, pi) => ({ q, qi, p, pi }))), [paper]);
  const [phase, setPhase] = useState<'intro' | 'sitting' | 'report'>('intro');
  const [queue, setQueue] = useState<number[]>(() => parts.map((_, i) => i));
  const [results, setResults] = useState<Record<number, PartResult>>({});
  const [startedAt, setStartedAt] = useState(0);
  const [endsAt, setEndsAt] = useState(0);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (phase !== 'sitting') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const finishPaper = (res: Record<number, PartResult>) => {
    // Anything not attempted scores nothing.
    const filled = { ...res };
    parts.forEach((_, i) => {
      if (!filled[i]) filled[i] = { score: 0, max: 1, ticks: [], notReached: true };
    });
    setResults(filled);
    setStoppedAt(Date.now());
    setPhase('report');
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (phase === 'sitting' && now >= endsAt) finishPaper(results);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const left = Math.max(0, Math.round((endsAt - now) / 1000));
  const cur = queue[0];
  const part = cur !== undefined ? parts[cur] : null;

  const onPart = (r: RoundResult) => {
    const next = { ...results, [cur]: { score: r.score, max: r.max, written: r.written, ticks: [], review: r.review } };
    setResults(next);
    const rest = queue.slice(1);
    setQueue(rest);
    if (!rest.length) finishPaper(next);
    else window.scrollTo({ top: 0 });
  };

  // ---- intro
  if (phase === 'intro') {
    return (
      <div className="play-main narrow">
        <header className="session-head">
          <div className="eyebrow">Mock exam</div>
          <h1>{paper.title}</h1>
        </header>
        <section className="panel">
          <ul className="rules">
            <li>
              <strong>{paper.questions.length} questions</strong>, {marks(totalMarks(paper))} marks, <strong>{paper.minutes} minutes</strong>. The clock starts when you press the button and doesn’t stop.
            </li>
            <li>No tips and no feedback. Written answers you type yourself; you’ll mark them against the mark scheme at the end.</li>
            <li>You can skip any part. Skipped parts come back at the end if there’s time. Press “Done with this part” on a calculation when you’re finished with it.</li>
            <li>The sheet of key ratios and formulae is the ƒ button at the top, as on the paper. Bring your own calculator.</li>
            <li>When time’s up, it’s pens down: parts not reached score nothing.</li>
          </ul>
          <div className="step-actions">
            <button type="button" className="btn ghost" onClick={() => go({ name: 'exam' })}>
              Not now
            </button>
            <span className="spacer" />
            <button
              type="button"
              className="btn"
              autoFocus
              onClick={() => {
                const t = Date.now();
                setStartedAt(t);
                setNow(t);
                setEndsAt(t + paper.minutes * 60_000);
                setPhase('sitting');
              }}
            >
              Start the clock →
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ---- sitting
  if (phase === 'sitting' && part) {
    const problem = PROBLEMS[part.p.problem];
    const firstOfQ = part.pi === 0;
    return (
      <div className="play-main narrow">
        <header className="session-head">
          <div className="spread">
            <div className="eyebrow">
              {paper.title} · {queue.length} {queue.length === 1 ? 'part' : 'parts'} left
            </div>
            <span className={`exam-clock${left < 600 ? ' low' : ''}`}>⏱ {clock(left)}</span>
          </div>
          <h1>{part.q.title}</h1>
          <div className="progress-dots" aria-hidden>
            {parts.map((_, i) => (
              <span key={i} className={results[i] ? 'done' : i === cur ? 'here' : ''} />
            ))}
          </div>
        </header>
        {firstOfQ && <p className="exam-stem">{part.q.stem}</p>}
        <RoundRunner
          key={cur}
          problem={problem}
          params={part.p.params}
          tier="exam"
          seed={seed + cur}
          noCall
          silent
          intro={
            <div className="pop-quiz">
              <span className="pop-tag">
                Part {part.p.label}
              </span>{' '}
              {marks(part.p.marks)} {part.p.marks === 1 ? 'mark' : 'marks'}
            </div>
          }
          onDone={onPart}
        />
        {queue.length > 1 && (
          <div className="step-actions" style={{ marginTop: 14 }}>
            <button
              type="button"
              className="link"
              onClick={() => {
                setQueue((q) => [...q.slice(1), q[0]]);
                window.scrollTo({ top: 0 });
              }}
            >
              Skip this part for now
            </button>
          </div>
        )}
      </div>
    );
  }

  // ---- report
  const fraction = (i: number) => {
    const r = results[i];
    if (!r) return 0;
    const p = PROBLEMS[parts[i].p.problem];
    if (p.kind === 'brief' && r.written !== undefined) {
      const m = markBrief((p as BriefProblem).cards, r.ticks, (p as BriefProblem).cap);
      return m.max ? m.score / m.max : 0;
    }
    return r.max ? r.score / r.max : 0;
  };
  const got = (i: number) => parts[i].p.marks * fraction(i);
  const total = totalMarks(paper);
  const score = parts.reduce((s, _, i) => s + got(i), 0);
  const seconds = Math.round(((stoppedAt ?? now) - startedAt) / 1000);
  const timedOut = stoppedAt !== null && stoppedAt - startedAt >= paper.minutes * 60_000 - 1500;
  const written = parts.map((x, i) => ({ x, i })).filter(({ i }) => results[i]?.written !== undefined);

  const byConcept: Record<ConceptId, { got: number; of: number }> = {};
  parts.forEach((x, i) => {
    const c = PROBLEMS[x.p.problem].concept;
    byConcept[c] = { got: (byConcept[c]?.got ?? 0) + got(i), of: (byConcept[c]?.of ?? 0) + x.p.marks };
  });
  const weak = Object.entries(byConcept)
    .map(([c, v]) => ({ c, lost: v.of - v.got, pct: v.of ? v.got / v.of : 1 }))
    .filter((w) => w.pct < 0.6)
    .sort((a, b) => b.lost - a.lost);

  const saveAndLeave = () => {
    if (!saved) {
      setSaved(true);
      setSave((s) =>
        bumpStreak({
          ...s,
          exams: [{ at: Date.now(), paper: def.id, title: paper.title, score: Math.round(score * 10) / 10, max: total, seconds, byConcept }, ...s.exams].slice(0, 30),
        }),
      );
    }
    go({ name: 'exam' });
  };

  const tick = (i: number, ticks: number[]) => setResults((r) => ({ ...r, [i]: { ...r[i], ticks } }));
  const pct = pctOf(score, total);

  return (
    <div className="play-main narrow">
      <header className="session-head">
        <div className="eyebrow">{timedOut ? 'Pens down: time’s up' : 'Paper finished'}</div>
        <h1>{paper.title}</h1>
      </header>
      <section className="finale">
        <div className="big-number">
          {marks(Math.round(score * 10) / 10)} <span className="muted" style={{ fontSize: 24 }}>/ {total}</span>
        </div>
        <div className="muted">
          {pct}% · {Math.round(seconds / 60)} of {paper.minutes} minutes
        </div>
        <Bubble
          beat={{
            who: 'margaux',
            mood: pct >= 70 ? 'happy' : pct >= 50 ? 'neutral' : 'worried',
            text:
              written.length && !written.every(({ i }) => results[i].ticks.length)
                ? 'That’s the calculations marked. Now mark your written answers below, honestly: they’re worth a lot of this paper.'
                : pct >= 70
                  ? 'A strong paper. Read the weak spots below and close them.'
                  : pct >= 50
                    ? 'A pass, with marks left on the table. The list below is where they went.'
                    : 'Not there yet, but now you know exactly where. Start with the first item below.',
          }}
        />
      </section>

      {paper.questions.map((q, qi) => {
        const idx = parts.map((x, i) => ({ x, i })).filter(({ x }) => x.qi === qi);
        const qGot = idx.reduce((s, { i }) => s + got(i), 0);
        const qMax = idx.reduce((s, { x }) => s + x.p.marks, 0);
        return (
          <section className="panel" key={qi} style={{ marginTop: 16 }}>
            <div className="spread">
              <h3 className="step-title">{q.title}</h3>
              <span className="points num-tab">
                {marks(Math.round(qGot * 10) / 10)} / {marks(qMax)}
              </span>
            </div>
            {idx.map(({ x, i }) => {
              const r = results[i];
              const prob = PROBLEMS[x.p.problem];
              const isWritten = r.written !== undefined;
              return (
                <details className={`part-review${fraction(i) >= 0.8 ? ' ok' : fraction(i) < 0.5 ? ' bad' : ''}`} key={i} open={isWritten}>
                  <summary>
                    <span>
                      {x.p.label} · {CONCEPTS[prob.concept].name}
                      {r.notReached && <span className="tagline">not reached</span>}
                    </span>
                    <span className="num-tab">
                      {marks(Math.round(got(i) * 10) / 10)} / {marks(x.p.marks)}
                    </span>
                  </summary>
                  {isWritten ? (
                    <>
                      <p className="muted" style={{ fontSize: 13.5 }}>
                        {(prob as BriefProblem).question}
                      </p>
                      <blockquote className="your-answer">{r.written}</blockquote>
                      <SelfMark problem={prob as BriefProblem} ticks={r.ticks} onChange={(t) => tick(i, t)} />
                      <Bubble beat={{ who: 'margaux', text: 'Here’s how I’d write it up:' }}>
                        <p className="model-answer">{(prob as BriefProblem).model}</p>
                      </Bubble>
                    </>
                  ) : (
                    r.review ?? <p className="muted">Not attempted.</p>
                  )}
                </details>
              );
            })}
          </section>
        );
      })}

      <h2 className="section-title">Where the marks went</h2>
      {weak.length === 0 ? (
        <p className="muted">Nothing below 60%. Sit a fresh paper next.</p>
      ) : (
        <ul className="weak-list">
          {weak.map((w) => (
            <li key={w.c}>
              <div>
                <strong>{CONCEPTS[w.c].name}</strong>
                <span className="muted">
                  {' '}
                  · Chapter {ACTS[CONCEPTS[w.c].act - 1].numeral} · {marks(Math.round(w.lost * 10) / 10)} marks lost
                </span>
              </div>
              <div className="row">
                <button type="button" className="btn ghost small" onClick={() => openLesson(w.c)}>
                  Cheat card
                </button>
                <button type="button" className="btn small" onClick={() => go({ name: 'practice', concept: w.c })}>
                  Practise
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="scene-controls" style={{ marginTop: 20 }}>
        <span />
        <span />
        <button type="button" className="btn" onClick={saveAndLeave}>
          Save this attempt →
        </button>
      </div>
    </div>
  );
}
