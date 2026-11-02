// Judgement round: several treatments can be defended. Each choice is marked on how well it can be justified,
// the reported profit is marked from your own choices, and the end shows the whole defensible range.
import { useMemo, useState, type ReactNode } from 'react';
import { acc, eur, parseNumber } from '../engine/format';
import { VERDICT_MARK, defensibleRange, profitAfter, pushedProfit } from '../engine/grading';
import { TIER_LABEL } from '../engine/mastery';
import { mulberry32, shuffle } from '../engine/rng';
import type { JudgementProblem, Tier, Verdict } from '../engine/types';
import { Bubble, Chat } from './Chat';
import type { RoundResult } from './Rounds';

const VERDICT_LABEL: Record<Verdict, string> = { best: 'Best answer', defensible: 'Defensible', stretch: 'A stretch', wrong: 'Not allowed' };

export function JudgementRunner({ problem, seed, intro, tier = 'guided', onDone }: { problem: JudgementProblem; seed: number; intro?: ReactNode; tier?: Tier; onDone: (r: RoundResult) => void }) {
  const orders = useMemo(() => {
    const rng = mulberry32(seed);
    return Object.fromEntries(problem.items.map((it) => [it.id, shuffle(rng, it.options)]));
  }, [problem, seed]);
  const [picks, setPicks] = useState<Record<string, string | null>>({});
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);

  const own = profitAfter(problem, picks);
  const given = parseNumber(typed);
  const profitOk = given !== null && Math.abs(given - own) <= Math.max(1, Math.abs(own) * 0.001);
  const itemScore = problem.items.reduce((s, it) => {
    const o = it.options.find((x) => x.id === picks[it.id]);
    return s + (o ? VERDICT_MARK[o.verdict] : 0);
  }, 0);
  const max = problem.items.length * 2 + 2;
  const score = itemScore + (profitOk ? 2 : 0);
  const complete = problem.items.every((it) => picks[it.id]) && given !== null;
  const range = defensibleRange(problem);
  const inRange = own >= range.lo - 0.5 && own <= range.hi + 0.5;

  const finish = () => {
    const clean = profitOk && problem.items.every((it) => ['best', 'defensible'].includes(it.options.find((o) => o.id === picks[it.id])?.verdict ?? ''));
    onDone({ score, max, clean: { [problem.concept]: clean } });
  };

  return (
    <section aria-labelledby="jd-title">
      {intro}
      <div className="game-title">
        <span className={`game-kind tier-${tier}`}>Judgement call · {TIER_LABEL[tier]}</span>
        <h2 id="jd-title">{problem.title}</h2>
      </div>
      <Chat beats={problem.prompt} host={problem.host} />
      <div className="ask-card">
        <span className="ask-tag">The question</span>
        {problem.ask}
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <p className="step-help">
          There’s no single right answer here. Pick the treatment you could defend to an auditor for each item. Treatments that can’t be justified, in either direction, lose marks.
          {tier === 'guided' ? ' Your running profit is shown below as you go.' : ' Then work out the profit yourself.'}
        </p>
        {problem.items.map((it, n) => {
          const pick = it.options.find((o) => o.id === picks[it.id]);
          return (
            <div className="jd-item" key={it.id}>
              <div className="jd-head">
                <span className="move-n">{n + 1}</span> <strong>{it.title}</strong>
              </div>
              <p className="jd-situation">{it.situation}</p>
              <div className="choices" role="radiogroup" aria-label={it.title}>
                {orders[it.id].map((o) => {
                  const on = picks[it.id] === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      disabled={checked}
                      className={`choice${checked ? ` verdict-${o.verdict}${on ? ' picked' : ''}` : ''}`}
                      onClick={() => setPicks((p) => ({ ...p, [it.id]: o.id }))}
                    >
                      <span className="dot" aria-hidden />
                      <span className="body">
                        {o.label}
                        {checked && (
                          <span className="jd-verdict">
                            <span className={`verdict-tag ${o.verdict}`}>{VERDICT_LABEL[o.verdict]}</span> {o.why}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              {checked && pick && (
                <div className="reaction-points">
                  Your pick: {VERDICT_LABEL[pick.verdict]} · +{VERDICT_MARK[pick.verdict]}
                </div>
              )}
            </div>
          );
        })}

        <div className="field answer-field" style={{ marginTop: 18 }}>
          <label htmlFor="jd-profit">Profit you’d report ({problem.startLabel} {eur(problem.startProfit)}, after your choices)</label>
          <div className={`input-wrap${checked ? (profitOk ? ' good' : ' bad') : ''}`}>
            <span className="affix">€</span>
            <input id="jd-profit" inputMode="decimal" value={typed} disabled={checked} onChange={(e) => setTyped(e.target.value)} />
          </div>
          {tier === 'guided' && !checked && problem.items.every((it) => picks[it.id]) && <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>Running total from your choices: {eur(own)}</div>}
          {checked && <div className={`check ${profitOk ? 'good' : 'bad'}`}>{profitOk ? '✓ Right for your choices.' : `✕ From your choices it comes to ${eur(own)}.`}</div>}
        </div>

        {checked && (
          <>
            <div className="jd-range">
              <div className="eyebrow">Where your answer sits</div>
              <RangeBar lo={range.lo} hi={range.hi} marks={[{ label: 'You', value: own, kind: 'you' }, ...problem.sides.map((s) => ({ label: s.label, value: pushedProfit(problem, s.wants, s.floor), kind: s.wants }))]} />
              <p className="muted" style={{ fontSize: 14 }}>
                Any profit from {eur(range.lo)} to {eur(range.hi)} can be defended. Yours, {eur(own)}, is {inRange ? 'inside that range' : 'outside it'}.{' '}
                {problem.sides
                  .map((s) => `${s.label} would push for ${eur(pushedProfit(problem, s.wants, s.floor))}`)
                  .join('; ')}
                .
              </p>
            </div>
            <Bubble beat={{ who: 'margaux', mood: inRange && profitOk ? 'happy' : 'neutral', text: 'Here’s how I’d write it up:' }}>
              <p className="model-answer">{problem.model}</p>
            </Bubble>
          </>
        )}

        <div className="step-actions">
          <span className="spacer" />
          {checked && (
            <span className="points num-tab">
              ✦ {score} / {max}
            </span>
          )}
          {!checked ? (
            <button type="button" className="btn" disabled={!complete} onClick={() => setChecked(true)}>
              Submit
            </button>
          ) : (
            <button type="button" className="btn" autoFocus onClick={finish}>
              Continue →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function RangeBar({ lo, hi, marks }: { lo: number; hi: number; marks: { label: string; value: number; kind: string }[] }) {
  const all = [lo, hi, ...marks.map((m) => m.value)];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const pad = (max - min) * 0.08 || 1;
  const a = min - pad;
  const b = max + pad;
  const W = 600;
  const x = (v: number) => 20 + ((v - a) / (b - a)) * (W - 40);
  return (
    <svg viewBox={`0 0 ${W} 96`} className="range-bar" role="img" aria-label={`Defensible range ${acc(lo)} to ${acc(hi)}`}>
      <line x1={20} x2={W - 20} y1={46} y2={46} className="rb-axis" />
      <rect x={x(lo)} y={36} width={Math.max(2, x(hi) - x(lo))} height={20} rx={4} className="rb-range" />
      <text x={x(lo) - 4} y={80} textAnchor="end" className="rb-text">
        {acc(lo)}
      </text>
      <text x={x(hi) + 4} y={80} textAnchor="start" className="rb-text">
        {acc(hi)}
      </text>
      {marks.map((m, i) => (
        <g key={m.label}>
          <line x1={x(m.value)} x2={x(m.value)} y1={30} y2={62} className={`rb-mark ${m.kind}`} />
          <text x={x(m.value)} y={i % 2 ? 30 : 18} textAnchor="middle" className={`rb-text strong ${m.kind}`}>
            {m.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
