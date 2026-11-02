// Lesson diagrams (jar, bridge, table, cycle), data extracts and the break-even chart.
import type { BreakEvenChart, CycleDiagram, Diagram, JarDiagram, BridgeDiagram, TableDiagram } from '../engine/types';
import { acc, eur } from '../engine/format';

const v = (n?: number) => (n === undefined ? '?' : acc(n));

function Jar({ d }: { d: JarDiagram }) {
  return (
    <figure className="diagram jar">
      <div className="jar-title">{d.title}</div>
      <div className="jar-row">
        <div className="jar-cell start">
          <span className="jar-label">{d.start.label}</span>
          <span className="jar-val num-tab">{v(d.start.value)}</span>
        </div>
        <span className="jar-op">+</span>
        <div className="jar-stack">
          {d.ins.map((x, i) => (
            <div className="jar-cell in" key={i}>
              <span className="jar-label">{x.label}</span>
              <span className="jar-val num-tab">{v(x.value)}</span>
            </div>
          ))}
        </div>
        <span className="jar-op">−</span>
        <div className="jar-stack">
          {d.outs.map((x, i) => (
            <div className="jar-cell out" key={i}>
              <span className="jar-label">{x.label}</span>
              <span className="jar-val num-tab">{v(x.value)}</span>
            </div>
          ))}
        </div>
        <span className="jar-op">=</span>
        <div className="jar-cell end">
          <span className="jar-label">{d.end.label}</span>
          <span className="jar-val num-tab">{v(d.end.value)}</span>
        </div>
      </div>
      {d.caption && <figcaption>{d.caption}</figcaption>}
    </figure>
  );
}

function Bridge({ d }: { d: BridgeDiagram }) {
  const points = [d.start.value];
  for (const s of d.steps) points.push(points[points.length - 1] + s.value);
  const end = points[points.length - 1];
  const lo = Math.min(0, ...points);
  const hi = Math.max(0, ...points);
  const span = hi - lo || 1;
  const W = 640;
  const rowH = 30;
  const labelW = 230;
  const barW = W - labelW - 90;
  const x = (n: number) => labelW + ((n - lo) / span) * barW;
  const rows = [{ label: d.start.label, from: 0, to: d.start.value, kind: 'total' }, ...d.steps.map((s, i) => ({ label: s.label, from: points[i], to: points[i + 1], kind: s.value >= 0 ? 'up' : 'down' })), { label: d.end, from: 0, to: end, kind: 'total' }];
  const H = rows.length * rowH + 12;
  return (
    <figure className="diagram bridge">
      <div className="jar-title">{d.title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={d.title}>
        <line x1={x(0)} x2={x(0)} y1={0} y2={H} className="axis" />
        {rows.map((r, i) => {
          const y = i * rowH + 6;
          const a = Math.min(x(r.from), x(r.to));
          const w = Math.max(2, Math.abs(x(r.to) - x(r.from)));
          const delta = r.to - r.from;
          return (
            <g key={i}>
              <text x={0} y={y + 18} className={`b-label${r.kind === 'total' ? ' strong' : ''}`}>
                {r.label}
              </text>
              <rect x={a} y={y + 4} width={w} height={rowH - 10} className={`b-bar ${r.kind}`} rx={2} />
              <text x={W - 4} y={y + 18} textAnchor="end" className={`b-val${r.kind === 'total' ? ' strong' : ''}`}>
                {r.kind === 'total' ? acc(r.to) : (delta >= 0 ? '+' : '') + acc(delta)}
              </text>
            </g>
          );
        })}
      </svg>
      {d.caption && <figcaption>{d.caption}</figcaption>}
    </figure>
  );
}

export function DataTable({ d, compact }: { d: TableDiagram; compact?: boolean }) {
  return (
    <figure className={`diagram data-table${compact ? ' compact' : ''}`}>
      {d.title && <div className="jar-title">{d.title}</div>}
      <table>
        <thead>
          <tr>
            {d.head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {d.rows.map((r, i) => (
            <tr key={i} className={d.totals?.includes(i) ? 'total' : r.length === 1 ? 'section' : ''}>
              {r.map((c, j) => (
                <td key={j} colSpan={r.length === 1 ? d.head.length : undefined} className={j > 0 && !/^[\s€(−-]*[\d,.]+[)%]?$|^[–?]?$/.test(c) ? 'txt' : undefined}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {d.caption && <figcaption>{d.caption}</figcaption>}
    </figure>
  );
}

function Cycle({ d }: { d: CycleDiagram }) {
  const n = d.stops.length;
  const R = 92;
  const C = 130;
  const pos = (i: number) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [C + Math.cos(a) * R * 1.45, C + Math.sin(a) * R];
  };
  return (
    <figure className="diagram cycle">
      {d.title && <div className="jar-title">{d.title}</div>}
      <svg viewBox="0 0 260 260" role="img" aria-label={d.title ?? d.stops.join(' to ')} style={{ maxWidth: 340 }}>
        <defs>
          <marker id="cyc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" className="cyc-head" />
          </marker>
        </defs>
        <ellipse cx={C} cy={C} rx={R * 1.45} ry={R} className="cyc-ring" />
        {d.stops.map((_, i) => {
          const [x1, y1] = pos(i + 0.5);
          const [x2, y2] = pos(i + 0.62);
          return <line key={`a${i}`} x1={x1} y1={y1} x2={x2} y2={y2} className="cyc-ring" markerEnd="url(#cyc-arrow)" />;
        })}
        {d.stops.map((s, i) => {
          const [x, y] = pos(i);
          return (
            <g key={s}>
              <rect x={x - 52} y={y - 15} width={104} height={30} rx={15} className="cyc-stop" />
              <text x={x} y={y + 4} textAnchor="middle" className="cyc-text">
                {s}
              </text>
            </g>
          );
        })}
      </svg>
      {d.caption && <figcaption>{d.caption}</figcaption>}
    </figure>
  );
}

export function LessonDiagram({ d }: { d: Diagram }) {
  switch (d.kind) {
    case 'jar':
      return <Jar d={d} />;
    case 'bridge':
      return <Bridge d={d} />;
    case 'table':
      return <DataTable d={d} />;
    case 'cycle':
      return <Cycle d={d} />;
  }
}

/** Revenue and total cost lines, with break-even and the planned volume marked. */
export function BreakEven({ c }: { c: BreakEvenChart }) {
  const cpu = c.price - c.varCost;
  const be = c.fixed / cpu;
  const maxQ = Math.max(be * 1.8, (c.budget ?? 0) * 1.25);
  const maxY = maxQ * c.price;
  const W = 560;
  const H = 300;
  const L = 70;
  const B = 34;
  const x = (q: number) => L + (q / maxQ) * (W - L - 16);
  const y = (e: number) => H - B - (e / maxY) * (H - B - 14);
  const fmtK = (e: number) => (e >= 1e6 ? `€${(e / 1e6).toLocaleString('en-GB', { maximumFractionDigits: 1 })}m` : `€${Math.round(e / 1000)}k`);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => k * maxY);
  return (
    <figure className="diagram breakeven">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Break-even chart: break-even at ${Math.round(be).toLocaleString('en-GB')} ${c.unitLabel}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - 16} y1={y(t)} y2={y(t)} className="grid" />
            <text x={L - 6} y={y(t) + 4} textAnchor="end" className="tick-label">
              {fmtK(t)}
            </text>
          </g>
        ))}
        <line x1={L} x2={W - 16} y1={y(c.fixed)} y2={y(c.fixed)} className="fixed-line" />
        <text x={W - 18} y={y(c.fixed) - 6} textAnchor="end" className="line-label">
          Fixed costs
        </text>
        <line x1={x(0)} y1={y(c.fixed)} x2={x(maxQ)} y2={y(c.fixed + c.varCost * maxQ)} className="cost-line" />
        <text x={x(maxQ) - 4} y={y(c.fixed + c.varCost * maxQ) + 16} textAnchor="end" className="line-label cost">
          Total cost
        </text>
        <line x1={x(0)} y1={y(0)} x2={x(maxQ)} y2={y(c.price * maxQ)} className="rev-line" />
        <text x={x(maxQ) - 4} y={y(c.price * maxQ) + 14} textAnchor="end" className="line-label rev">
          Revenue
        </text>
        <line x1={x(be)} x2={x(be)} y1={y(be * c.price)} y2={H - B} className="be-drop" />
        <circle cx={x(be)} cy={y(be * c.price)} r={5} className="be-dot" />
        <text x={x(be) + 8} y={y(be * c.price) - 8} className="line-label strong">
          Break-even: {Math.round(be).toLocaleString('en-GB')} {c.unitLabel}, {eur(be * c.price)}
        </text>
        {c.budget && (
          <>
            <line x1={x(c.budget)} x2={x(c.budget)} y1={14} y2={H - B} className="budget-line" />
            <text x={x(c.budget) - 4} y={26} textAnchor="end" className="line-label">
              Plan: {c.budget.toLocaleString('en-GB')}
            </text>
          </>
        )}
        <line x1={L} x2={W - 16} y1={H - B} y2={H - B} className="axis" />
        <text x={(L + W) / 2} y={H - 8} textAnchor="middle" className="tick-label">
          {c.unitLabel} sold
        </text>
      </svg>
      <figcaption>Left of the dot, cost is above revenue: a loss. Right of it, every extra sale adds its contribution to profit.</figcaption>
    </figure>
  );
}
