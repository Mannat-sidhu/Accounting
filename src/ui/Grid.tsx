// Budget grid: fill a month-by-month table (receipts, payments, running balance), then make the call.
import { useMemo, useState, type ReactNode } from 'react';
import { acc, parseNumber } from '../engine/format';
import { markDecision, markWorksheet } from '../engine/grading';
import { mulberry32, shuffle } from '../engine/rng';
import { TIER_LABEL } from '../engine/mastery';
import type { ConceptId, GridProblem, Tier } from '../engine/types';
import { Bubble, Chat } from './Chat';
import { DataTable } from './Diagrams';
import type { RoundResult } from './Rounds';
import { Tex } from './Tex';

export function GridRunner({ problem, params, seed, intro, onDone, tier = 'guided', noCall, silent }: { problem: GridProblem; params?: unknown; seed: number; intro?: ReactNode; tier?: Tier; noCall?: boolean; silent?: boolean; onDone: (r: RoundResult) => void }) {
  const inst = useMemo(() => problem.build(params ?? problem.base), [problem, params]);
  const cols = inst.columns.map((_, i) => i);
  const last = cols.length - 1;
  const fillRows = inst.rows.filter((r) => !r.given);
  const [typed, setTyped] = useState<Record<string, string[]>>({});
  const [hinted, setHinted] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<'sheet' | 'call' | 'done'>('sheet');
  const [choice, setChoice] = useState<string | null>(null);
  const [why, setWhy] = useState<string | null>(null);
  const whyOrder = useMemo(() => shuffle(mulberry32(seed), inst.decision.why), [inst, seed]);

  const parsed = Object.fromEntries(Object.entries(typed).map(([k, v]) => [k, v.map((x) => parseNumber(x ?? ''))]));
  const marks = useMemo(() => markWorksheet(inst.rows, last, parsed as Record<string, (number | null)[]>), [typed]); // eslint-disable-line react-hooks/exhaustive-deps
  const checked = phase !== 'sheet';
  const cellsOf = (key: string) => inst.rows.find((r) => r.key === key)!.cells ?? cols;
  const complete = fillRows.every((r) => cellsOf(r.key).every((y) => parseNumber(typed[r.key]?.[y] ?? '') !== null));

  const rowPoints = (key: string) => (marks.result[key]?.rowOk ? (hinted[key] ? 0.5 : 1) : 0);
  const sheetScore = fillRows.reduce((s, r) => s + rowPoints(r.key), 0);
  const dec = markDecision(inst.decision, choice, why, false);
  const max = fillRows.length + (noCall ? 0 : 2);
  const total = sheetScore + (phase === 'done' && !noCall ? dec.score : 0);

  const finish = () => {
    const clean: Record<ConceptId, boolean> = {};
    for (const r of fillRows) {
      const c = r.concept ?? problem.concept;
      clean[c] = (clean[c] ?? true) && !!marks.result[r.key]?.rowOk && !hinted[r.key];
    }
    if (!noCall) clean[problem.concept] = (clean[problem.concept] ?? true) && dec.correct;
    onDone({
      score: total,
      max,
      clean,
      outcome: choice ? inst.outcomes[choice] : undefined,
      review: (
        <table className="marks-table review">
          <tbody>
            {fillRows.map((r) => {
              const res = marks.result[r.key];
              return (
                <tr key={r.key} className={res?.rowOk ? 'ok' : 'bad'}>
                  <td>{r.label}</td>
                  <td className="num-tab">{(typed[r.key] ?? []).filter((_, y) => (r.cells ?? cols).includes(y)).map((v) => v || '—').join(' · ')}</td>
                  <td className="num-tab">{res?.rowOk ? '✓' : `✕ ${res?.expected.filter((_, y) => (r.cells ?? cols).includes(y)).map(acc).join(' · ')}`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ),
    });
  };

  return (
    <section aria-labelledby="grid-title">
      {intro}
      <div className="game-title">
        <span className={`game-kind tier-${tier}`}>Fill the budget · {TIER_LABEL[tier]}</span>
        <h2 id="grid-title">{problem.title}</h2>
      </div>
      <Chat beats={inst.prompt} host={problem.host} />
      {inst.data && <DataTable d={inst.data} compact />}
      <div className="ask-card">
        <span className="ask-tag">The question</span>
        {inst.ask}
      </div>

      <div className="panel" style={{ marginTop: 16, overflowX: 'auto' }}>
        <p className="step-help">
          Fill the white cells in {inst.unitLabel}. Payments are positive numbers on the payments rows; a negative balance is an overdraft (type −2000 or (2000)). Each row is marked from your own rows above it, so one slip won’t sink the rest.
        </p>
        <p className="mobile-only swipe-hint">Swipe the table sideways for more months →</p>
        <table className="worksheet">
          <thead>
            <tr>
              <th />
              {inst.columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inst.rows.map((row) => {
              const res = marks.result[row.key];
              const cells = row.cells ?? cols;
              return (
                <tr key={row.key} className={`${row.total ? 'total-row ' : ''}${row.given ? 'given' : checked ? (res?.rowOk ? 'row-ok' : 'row-bad') : ''}`}>
                  <th scope="row">
                    <div className="ws-label">{row.label}</div>
                    {!row.given && !checked && tier === 'guided' && !hinted[row.key] && (
                      <button type="button" className="link ws-hint-btn" onClick={() => setHinted((h) => ({ ...h, [row.key]: true }))}>
                        tip
                      </button>
                    )}
                    {!row.given && (hinted[row.key] || checked) && <div className="ws-note">{checked ? row.explain : row.hint}</div>}
                  </th>
                  {cols.map((y) => {
                    if (row.given || !cells.includes(y))
                      return (
                        <td key={y} className="ws-fixed num-tab">
                          {acc(marks.truth[row.key][y])}
                        </td>
                      );
                    const ok = res?.ok[y];
                    return (
                      <td key={y}>
                        <input
                          className={`ws-input${checked ? (ok ? ' good' : ' bad') : ''}`}
                          inputMode="decimal"
                          aria-label={`${row.label}, ${inst.columns[y]}`}
                          value={typed[row.key]?.[y] ?? ''}
                          disabled={checked}
                          onChange={(e) =>
                            setTyped((t) => {
                              const arr = [...(t[row.key] ?? cols.map(() => ''))];
                              arr[y] = e.target.value;
                              return { ...t, [row.key]: arr };
                            })
                          }
                        />
                        {checked && !ok && <div className="ws-should num-tab">{acc(res!.ownExpected[y])}</div>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {phase === 'sheet' ? (
          <div className="step-actions">
            <span className="muted" style={{ fontSize: 13 }}>
              Tips halve that row’s point.
            </span>
            <span className="spacer" />
            <button type="button" className="btn" disabled={!complete} onClick={() => (noCall ? (silent ? finish() : setPhase('done')) : setPhase('call'))}>
              {noCall && silent ? 'Done with this part' : 'Check the budget'}
            </button>
          </div>
        ) : (
          <Bubble
            beat={{
              who: 'margaux',
              mood: sheetScore === fillRows.length ? 'happy' : 'neutral',
              text:
                sheetScore === fillRows.length
                  ? 'Every row right. That’s the hard part done.'
                  : `${fillRows.filter((r) => marks.result[r.key]?.rowOk).length} of ${fillRows.length} rows right. Read the notes on the red rows; the corrections are under each cell.`,
            }}
          />
        )}
      </div>

      {checked && noCall && (
        <div className="step-actions" style={{ marginTop: 12 }}>
          <span className="spacer" />
          <span className="points num-tab">
            ✦ {total} / {max}
          </span>
          <button type="button" className="btn" autoFocus onClick={() => finish()}>
            Continue →
          </button>
        </div>
      )}
      {checked && !noCall && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h3 className="step-title">
            <span className="move-n">Final move</span> Make the call
          </h3>
          <p style={{ fontWeight: 550 }}>{inst.decision.question}</p>
          <div className="seg" role="radiogroup" aria-label="Decision">
            {inst.decision.options.map((o) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={choice === o.id}
                className={`choice${phase === 'done' ? (o.id === inst.decision.correct ? ' is-correct' : o.id === choice ? ' is-wrong' : '') : ''}`}
                onClick={() => setChoice(o.id)}
                disabled={phase === 'done'}
              >
                <span className="dot" aria-hidden />
                <span className="body">{o.label}</span>
              </button>
            ))}
          </div>
          <p style={{ fontWeight: 550, marginTop: 18 }}>Because…</p>
          <div className="choices" role="radiogroup" aria-label="Justification">
            {whyOrder.map((o) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={why === o.id}
                className={`choice${phase === 'done' ? (o.id === inst.decision.correctWhy ? ' is-correct' : o.id === why ? ' is-wrong' : '') : ''}`}
                onClick={() => setWhy(o.id)}
                disabled={phase === 'done'}
              >
                <span className="dot" aria-hidden />
                <span className="body">{o.label}</span>
              </button>
            ))}
          </div>
          {phase === 'done' && (
            <>
              <Bubble beat={{ who: 'margaux', mood: dec.correct ? 'happy' : 'neutral', text: inst.decision.explain }} />
              <h3 className="eyebrow" style={{ marginTop: 22 }}>
                How Margaux writes it up
              </h3>
              <div className="working">
                {inst.working.map((w, i) => (
                  <div className="line" key={i}>
                    <Tex>{w}</Tex>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="step-actions">
            <span className="spacer" />
            <span className="points num-tab">
              ✦ {total} / {max}
            </span>
            {phase === 'call' ? (
              <button type="button" className="btn" disabled={!choice || !why} onClick={() => setPhase('done')}>
                Check
              </button>
            ) : (
              <button type="button" className="btn" autoFocus onClick={finish}>
                Continue →
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
