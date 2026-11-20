// The books panel: Atelier Noor's year, always beside the play screen. Each statement fills in once it has been built
// in its chapter, and the links between them (profit into retained earnings, the cash flow into the bank balance)
// appear as soon as both ends exist.
import { useState } from 'react';
import { ratioValue } from '../content/act-5-problems';
import { YEAR, YEAR_BASE, finOf } from '../content/books';
import { cashFlow, incomeStatement, openingPosition, position } from '../engine/books';
import type { SaveData } from '../engine/save';
import { useGame } from './store';

export type BookPart = 'open' | 'is' | 'close' | 'cf' | 'ratios';

/** Which round builds each part (in its chapter), and the episode that contains it. */
export const BOOK_REVEALS: Record<string, BookPart> = { 'books-sfp-open': 'open', 'books-is': 'is', 'books-sfp': 'close', 'books-scf': 'cf', 'ratio-profit': 'ratios' };
const PART_SESSION: Record<BookPart, string> = { open: 'a2s2', is: 'a3s1', close: 'a3s3', cf: 'a4s4', ratios: 'a5s1' };
const PART_WHERE: Record<BookPart, string> = { open: 'Chapter II, “Where the year starts”', is: 'Chapter III, “Did we make a profit?”', close: 'Chapter III, “Where the year ends”', cf: 'Chapter IV, “Detective work”', ratios: 'Chapter V, “Aoife’s checklist”' };

export function builtParts(save: SaveData): Set<BookPart> {
  const out = new Set<BookPart>((save.books ?? []) as BookPart[]);
  for (const [part, sid] of Object.entries(PART_SESSION)) if (save.sessions[sid]) out.add(part as BookPart);
  return out;
}

const n0 = (n: number) => (Math.round(n) < 0 ? `(${Math.abs(Math.round(n)).toLocaleString('en-GB')})` : Math.round(n).toLocaleString('en-GB'));

type Row = [label: string, value: number | string, kind?: 'head' | 'sub' | 'total'];

const PART_KIND: Record<BookPart, string> = { open: 'sfp', is: 'pl', close: 'sfp', cf: 'cf', ratios: 'ratio' };

function Block({ title, ready, part, rows }: { title: string; ready: boolean; part: BookPart; rows: Row[] }) {
  return (
    <section className={`books-block st-${PART_KIND[part]}${ready ? '' : ' locked'}`}>
      <div className="books-block-head">
        <span>{title}</span>
        {!ready && <span className="books-tag">not built yet</span>}
      </div>
      <div className="books-rows">
        {rows.map(([label, v, kind], i) =>
          kind === 'head' ? (
            <div className="books-row head" key={i}>
              {label}
            </div>
          ) : (
            <div className={`books-row${kind ? ` ${kind}` : ''}`} key={i}>
              <span>{label}</span>
              <span className="num">{ready ? (typeof v === 'number' ? n0(v) : v) : '···'}</span>
            </div>
          ),
        )}
      </div>
      {!ready && <p className="books-where">Fills in when you build it in {PART_WHERE[part]}.</p>}
    </section>
  );
}

function Link({ show, from, to, children }: { show: boolean; from: string; to: string; children: string }) {
  if (!show) return null;
  return (
    <p className={`books-link from-${from} to-${to}`}>
      <span aria-hidden>↳ </span>
      {children}
    </p>
  );
}

export function BooksPanel() {
  const { save } = useGame();
  const built = builtParts(save);
  const [open, setOpen] = useState<number | null>(null);
  const o = openingPosition(YEAR);
  const is = incomeStatement(YEAR);
  const c = position(YEAR);
  const cf = cashFlow(YEAR);
  const fin = finOf(YEAR_BASE);
  const sfpRows = (p: typeof o): Row[] => [
    ['Equipment (cost less depreciation)', p.nbv],
    ['Inventory', p.inv],
    ['Trade receivables', p.rec],
    ['Cash at bank', p.cash],
    ['Total assets', p.ta, 'total'],
    ['Share capital', p.shareCap],
    ['Retained earnings', p.retained],
    ['Bank loan', p.loan],
    ['Current liabilities', p.cl],
    ['Total equity and liabilities', p.tel, 'total'],
  ];
  const ratio = (id: Parameters<typeof ratioValue>[0], unit: string, dp = 1) => `${ratioValue(id, fin).toFixed(dp)}${unit}`;
  return (
    <div className="books">
      <h2>The books</h2>
      <p className="stage-legend">Atelier Noor, the year to 31 December. One list of events; every statement grows out of it.</p>

      <details className="books-events">
        <summary>What happened ({YEAR.events.length} events)</summary>
        <ol>
          {YEAR.events.map((e, i) => (
            <li key={e.id}>
              <button type="button" className="books-event" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                {e.text}
              </button>
              {open === i && <p className="books-why">{e.why}</p>}
            </li>
          ))}
        </ol>
      </details>

      <Block title="Balance sheet, 1 January" part="open" ready={built.has('open')} rows={sfpRows(o)} />

      <Block
        title="Income statement for the year"
        part="is"
        ready={built.has('is')}
        rows={[
          ['Sales revenue', is.revenue],
          ['Cost of sales', -is.cos],
          ['Gross profit', is.gp, 'sub'],
          ['Operating expenses', -is.opex],
          [is.gain >= 0 ? 'Gain on disposal' : 'Loss on disposal', is.gain],
          ['Operating profit', is.op, 'sub'],
          ['Interest', -is.interest],
          ['Tax', -is.tax],
          ['Profit for the year', is.profit, 'total'],
        ]}
      />
      <Link show={built.has('open') && built.has('is')} from="pl" to="sfp">{`Profit ${n0(is.profit)} joins the balance sheet as retained earnings: ${n0(o.retained)} + ${n0(is.profit)} − ${n0(YEAR_BASE.dividend)} dividend = ${n0(c.retained)}.`}</Link>

      <Block title="Balance sheet, 31 December" part="close" ready={built.has('close')} rows={sfpRows(c)} />
      <Link show={built.has('close')} from="sfp" to="cf">{`Profit was ${n0(is.profit)}, yet cash went from ${n0(o.cash)} to ${n0(c.cash)}. Chapter IV explains the gap.`}</Link>

      <Block
        title="Cash flow for the year"
        part="cf"
        ready={built.has('cf')}
        rows={[
          ['Operating profit', cf.op],
          ['Non-cash items and working capital', cf.generated - cf.op],
          ['Interest and tax paid', -(cf.interestPaid + cf.taxPaid)],
          ['Operating activities', cf.cfo, 'sub'],
          ['Investing activities', cf.cfi, 'sub'],
          ['Financing activities', cf.cff, 'sub'],
          ['Net change in cash', cf.net],
          ['Cash at 31 December', cf.close, 'total'],
        ]}
      />
      <Link show={built.has('cf') && built.has('close')} from="cf" to="sfp">{`Closing cash ${n0(cf.close)} is the same figure as the balance sheet’s cash. Two statements, one bank account.`}</Link>

      <Block
        title="Ratios"
        part="ratios"
        ready={built.has('ratios')}
        rows={[
          ['Gross profit margin', ratio('gpm', '%')],
          ['Operating profit margin', ratio('opm', '%')],
          ['Return on capital employed', ratio('roce', '%')],
          ['Current ratio', ratio('current', ':1', 2)],
          ['Quick ratio', ratio('quick', ':1', 2)],
          ['Debtor days', ratio('debtor-days', ' days', 0)],
          ['Inventory days', ratio('inv-days', ' days', 0)],
          ['Gearing', ratio('gearing', '%')],
          ['Interest cover', ratio('int-cover', ' times')],
        ]}
      />
      <Link show={built.has('ratios')} from="ratio" to="ratio">Every ratio here is two figures from the statements above, divided. If a statement changes, its ratios move with it.</Link>
    </div>
  );
}
