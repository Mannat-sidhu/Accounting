// One set of books. A book is an opening balance sheet plus a numbered list of things that happened, each written as
// double entry (debits positive, credits negative). Every statement is worked out from that list, so the income
// statement, the balance sheet, the cash flow and the ratios can never disagree with each other.

export type Acc =
  // balance sheet
  | 'equip'
  | 'accDep'
  | 'inv'
  | 'rec'
  | 'prepaid'
  | 'cash'
  | 'pay'
  | 'accr'
  | 'taxOwed'
  | 'loan'
  | 'shareCap'
  | 'retained'
  | 'dividends'
  // income statement
  | 'revenue'
  | 'cos'
  | 'wages'
  | 'rent'
  | 'utilities'
  | 'commission'
  | 'depn'
  | 'disposal'
  | 'interest'
  | 'taxExp';

export const ACCS: Acc[] = ['equip', 'accDep', 'inv', 'rec', 'prepaid', 'cash', 'pay', 'accr', 'taxOwed', 'loan', 'shareCap', 'retained', 'dividends', 'revenue', 'cos', 'wages', 'rent', 'utilities', 'commission', 'depn', 'disposal', 'interest', 'taxExp'];
export const PL_ACCS: Acc[] = ['revenue', 'cos', 'wages', 'rent', 'utilities', 'commission', 'depn', 'disposal', 'interest', 'taxExp'];

export type Balances = Record<Acc, number>;
export type CfClass = 'op' | 'inv' | 'fin';

export interface BookEvent {
  id: string;
  /** What happened, in a sentence. */
  text: string;
  /** Why a real business does this, or what it means. */
  why: string;
  /** Double entry: debits positive, credits negative. Always sums to zero. */
  legs: Partial<Record<Acc, number>>;
  /** Where its cash goes in the statement of cash flows. */
  cf?: CfClass;
  /** Its line in the statement of cash flows (direct method). */
  cfLabel?: string;
}

export interface Book {
  name: string;
  /** "the year to 31 December", "March" */
  period: string;
  start: string;
  end: string;
  /** Opening balance-sheet balances (debit positive). Retained earnings is worked out so the books balance. */
  opening: Partial<Record<Acc, number>>;
  events: BookEvent[];
}

export const zero = (): Balances => Object.fromEntries(ACCS.map((a) => [a, 0])) as Balances;

const r2 = (n: number) => Math.round(n * 100) / 100;

export const legSum = (e: BookEvent) => r2(Object.values(e.legs).reduce((s, v) => s + (v ?? 0), 0));

export function openingBalances(book: Book): Balances {
  const b = zero();
  for (const [k, v] of Object.entries(book.opening)) b[k as Acc] = v ?? 0;
  b.retained = 0;
  b.retained = -ACCS.reduce((s, a) => s + b[a], 0);
  return b;
}

/** Balances after the first `n` events (all of them by default). */
export function balancesAfter(book: Book, n = book.events.length): Balances {
  const b = openingBalances(book);
  for (const e of book.events.slice(0, n)) for (const [k, v] of Object.entries(e.legs)) b[k as Acc] = r2(b[k as Acc] + (v ?? 0));
  return b;
}

export interface IncomeStatement {
  revenue: number;
  cos: number;
  gp: number;
  wages: number;
  rent: number;
  utilities: number;
  commission: number;
  dep: number;
  /** Gain on disposal (a loss is negative). */
  gain: number;
  /** Operating expenses, not counting the gain. */
  opex: number;
  op: number;
  interest: number;
  pbt: number;
  tax: number;
  profit: number;
}

export function incomeStatement(book: Book, n?: number): IncomeStatement {
  const b = balancesAfter(book, n);
  const revenue = -b.revenue;
  const cos = b.cos;
  const gp = revenue - cos;
  const opex = b.wages + b.rent + b.utilities + b.commission + b.depn;
  const gain = -b.disposal;
  const op = gp - opex + gain;
  const pbt = op - b.interest;
  return { revenue, cos, gp, wages: b.wages, rent: b.rent, utilities: b.utilities, commission: b.commission, dep: b.depn, gain, opex, op, interest: b.interest, pbt, tax: b.taxExp, profit: pbt - b.taxExp };
}

export interface Position {
  equipCost: number;
  accDep: number;
  nbv: number;
  inv: number;
  rec: number;
  prepaid: number;
  cash: number;
  ca: number;
  ta: number;
  pay: number;
  accr: number;
  tax: number;
  cl: number;
  loan: number;
  shareCap: number;
  retained: number;
  equity: number;
  tel: number;
}

function positionOf(b: Balances, retainedOpen: number, profit: number): Position {
  const nbv = b.equip + b.accDep;
  const ca = b.inv + b.rec + b.prepaid + b.cash;
  const cl = -b.pay - b.accr - b.taxOwed;
  const retained = retainedOpen + profit - b.dividends;
  const equity = -b.shareCap + retained;
  return { equipCost: b.equip, accDep: -b.accDep, nbv, inv: b.inv, rec: b.rec, prepaid: b.prepaid, cash: b.cash, ca, ta: nbv + ca, pay: -b.pay, accr: -b.accr, tax: -b.taxOwed, cl, loan: -b.loan, shareCap: -b.shareCap, retained, equity, tel: equity - b.loan + cl };
}

/** The balance sheet at the start. */
export function openingPosition(book: Book): Position {
  const o = openingBalances(book);
  return positionOf(o, -o.retained, 0);
}

/** The balance sheet after the first `n` events, with the profit so far added to retained earnings. */
export function position(book: Book, n?: number): Position {
  const o = openingBalances(book);
  return positionOf(balancesAfter(book, n), -o.retained, incomeStatement(book, n).profit);
}

export interface CashLine {
  id: string;
  label: string;
  /** Signed: cash in positive. */
  amount: number;
}

export interface CashFlow {
  open: number;
  close: number;
  op: number;
  dep: number;
  gain: number;
  dInv: number;
  dRec: number;
  dPrepaid: number;
  dPay: number;
  dAccr: number;
  /** Cash generated from operations, before interest and tax. */
  generated: number;
  interestPaid: number;
  taxPaid: number;
  cfo: number;
  invLines: CashLine[];
  cfi: number;
  finLines: CashLine[];
  cff: number;
  net: number;
  /** Operating cash, worked out the direct way from the events. Always equals cfo. */
  directOp: number;
  opLines: CashLine[];
}

const cashLines = (book: Book, cls: CfClass): CashLine[] =>
  book.events.filter((e) => e.cf === cls && e.legs.cash).map((e) => ({ id: e.id, label: e.cfLabel ?? e.text, amount: e.legs.cash! }));

export function cashFlow(book: Book): CashFlow {
  const o = openingBalances(book);
  const c = balancesAfter(book);
  const is = incomeStatement(book);
  const dInv = c.inv - o.inv;
  const dRec = c.rec - o.rec;
  const dPrepaid = c.prepaid - o.prepaid;
  const dPay = -c.pay + o.pay;
  const dAccr = -c.accr + o.accr;
  const generated = is.op + is.dep - is.gain - dInv - dRec - dPrepaid + dPay + dAccr;
  const interestPaid = is.interest;
  const taxPaid = -o.taxOwed + is.tax + c.taxOwed;
  const cfo = generated - interestPaid - taxPaid;
  const invLines = cashLines(book, 'inv');
  const finLines = cashLines(book, 'fin');
  const opLines = cashLines(book, 'op');
  const cfi = invLines.reduce((s, l) => s + l.amount, 0);
  const cff = finLines.reduce((s, l) => s + l.amount, 0);
  return {
    open: o.cash,
    close: c.cash,
    op: is.op,
    dep: is.dep,
    gain: is.gain,
    dInv,
    dRec,
    dPrepaid,
    dPay,
    dAccr,
    generated,
    interestPaid,
    taxPaid,
    cfo,
    invLines,
    cfi,
    finLines,
    cff,
    net: cfo + cfi + cff,
    directOp: opLines.reduce((s, l) => s + l.amount, 0),
    opLines,
  };
}

/** What one event does to profit and to cash. */
export function effectOf(e: BookEvent) {
  const profit = -PL_ACCS.reduce((s, a) => s + (e.legs[a] ?? 0), 0);
  return { profit: r2(profit) + 0, cash: (e.legs.cash ?? 0) + 0 };
}
