import { describe, expect, it } from 'vitest';
import { type Book, balancesAfter, cashFlow, effectOf, incomeStatement, legSum, openingPosition, position } from '../src/engine/books';
import { mulberry32 } from '../src/engine/rng';
import { MONTH_BASE, YEAR, YEAR_BASE, finOf, monthBook, varyMonth, varyYear, yearBook } from '../src/content/books';

function checkBook(book: Book) {
  for (const e of book.events) expect(legSum(e), e.id).toBe(0);
  for (let n = 0; n <= book.events.length; n++) {
    const p = n === 0 ? openingPosition(book) : position(book, n);
    expect(Math.round(p.ta * 100) / 100, `${book.period} after ${n}`).toBe(Math.round(p.tel * 100) / 100);
  }
  const o = openingPosition(book);
  const c = position(book);
  const is = incomeStatement(book);
  const div = balancesAfter(book).dividends;
  expect(c.retained).toBeCloseTo(o.retained + is.profit - div, 6);
  const cf = cashFlow(book);
  expect(cf.close).toBeCloseTo(c.cash, 6);
  expect(cf.open + cf.net).toBeCloseTo(cf.close, 6);
  expect(cf.directOp).toBeCloseTo(cf.cfo, 6);
}

describe('Atelier Noor’s year', () => {
  it('matches the worked figures', () => {
    const is = incomeStatement(YEAR);
    expect(is).toMatchObject({ revenue: 250000, cos: 150000, gp: 100000, opex: 77000, gain: 1500, op: 24500, interest: 4800, pbt: 19700, tax: 4700, profit: 15000 });
    const o = openingPosition(YEAR);
    expect(o).toMatchObject({ nbv: 90000, ta: 184000, retained: 43000, equity: 93000 });
    const c = position(YEAR);
    expect(c).toMatchObject({ equipCost: 140000, accDep: 37000, nbv: 103000, inv: 34000, rec: 46000, cash: 8900, ta: 191900, pay: 26000, accr: 1200, tax: 4700, cl: 31900, loan: 50000, shareCap: 60000, retained: 50000, equity: 110000 });
    const cf = cashFlow(YEAR);
    expect(cf).toMatchObject({ open: 30000, close: 8900, generated: 26200, interestPaid: 4800, taxPaid: 9000, cfo: 12400, cfi: -25500, cff: -8000, net: -21100 });
    checkBook(YEAR);
  });

  it('balances and links for 300 fresh years', () => {
    for (let s = 1; s <= 300; s++) {
      const p = varyYear(mulberry32(s));
      const book = yearBook(p);
      checkBook(book);
      expect(position(book).cash).toBeGreaterThan(0);
      expect(incomeStatement(book).profit).toBeGreaterThan(0);
      const f = finOf(p);
      expect(f.nca + f.inv[1] + f.rec[1] + f.cash - f.pay[1] - f.otherCL - f.ltd).toBeCloseTo(position(book).equity, 6);
    }
  });

  it('feeds the ratio data', () => {
    const f = finOf(YEAR_BASE);
    expect(f).toMatchObject({ sales: 250000, cos: 150000, opex: 75500, interest: 4800, tax: 4700, cash: 8900, otherCL: 5900, nca: 103000, ltd: 50000, shares: 60000 });
  });

  it('sorts each event by what it does to profit and cash', () => {
    const fx = Object.fromEntries(YEAR.events.map((e) => [e.id, effectOf(e)]));
    expect(fx.sales).toEqual({ profit: 250000, cash: 0 });
    expect(fx.receipts).toEqual({ profit: 0, cash: 242000 });
    expect(fx.purchases).toEqual({ profit: 0, cash: 0 });
    expect(fx.commission).toEqual({ profit: -5000, cash: -3800 });
    expect(fx.dividend).toEqual({ profit: 0, cash: -8000 });
  });
});

describe('a single month', () => {
  it('balances for the base month and 300 fresh ones', () => {
    checkBook(monthBook(MONTH_BASE));
    for (let s = 1; s <= 300; s++) checkBook(monthBook(varyMonth(mulberry32(s))));
  });

  it('keeps rent paid ahead as a prepayment', () => {
    const c = position(monthBook(MONTH_BASE));
    expect(c.prepaid).toBe(2400);
    expect(incomeStatement(monthBook(MONTH_BASE)).rent).toBe(1200);
  });
});
