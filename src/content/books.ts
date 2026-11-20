// Atelier Noor's own books. Chapters II to V build the same year one layer at a time: the opening balance sheet, the
// income statement, the closing balance sheet, the cash flow, then the ratios. Every figure comes from the list of what
// happened, so a number found in one chapter turns up again, and must agree, in the next.
// Practice uses fresh years and single months of the same business.
import { type Book, type BookEvent, cashFlow, incomeStatement, openingPosition, position } from '../engine/books';
import { eur } from '../engine/format';
import { pickInt, pickOne } from '../engine/rng';
import type { FinData } from './act-5-problems';

// ---------------------------------------------------------------- the year

export interface YearP {
  /** Balances on 1 January. Retained earnings is whatever makes it balance. */
  open: { equip: number; accDep: number; inv: number; rec: number; cash: number; pay: number; tax: number; loan: number; shareCap: number };
  sales: number;
  closeRec: number;
  purchases: number;
  closePay: number;
  closeInv: number;
  wages: number;
  rent: number;
  utilities: number;
  /** Agents' commission, % of sales. */
  commissionRate: number;
  /** Commission still unpaid at the year end (an accrual). */
  commissionOwed: number;
  capex: number;
  sold: { cost: number; ad: number; proceeds: number; item: string };
  dep: number;
  loanRepaid: number;
  interest: number;
  taxCharge: number;
  /** New €1 shares issued for cash. */
  shares: number;
  dividend: number;
  /** Share price at the year end, for the investor ratios. */
  sharePrice: number;
}

export const YEAR_BASE: YearP = {
  open: { equip: 120000, accDep: 30000, inv: 26000, rec: 38000, cash: 30000, pay: 22000, tax: 9000, loan: 60000, shareCap: 50000 },
  sales: 250000,
  closeRec: 46000,
  purchases: 158000,
  closePay: 26000,
  closeInv: 34000,
  wages: 38000,
  rent: 14000,
  utilities: 6000,
  commissionRate: 2,
  commissionOwed: 1200,
  capex: 30000,
  sold: { cost: 10000, ad: 7000, proceeds: 4500, item: 'old cutting table' },
  dep: 14000,
  loanRepaid: 10000,
  interest: 4800,
  taxCharge: 4700,
  shares: 10000,
  dividend: 8000,
  sharePrice: 2,
};

/** Workings that the events need and the problems quote. */
export function yearFigures(p: YearP) {
  const receipts = p.open.rec + p.sales - p.closeRec;
  const payments = p.open.pay + p.purchases - p.closePay;
  const cos = p.open.inv + p.purchases - p.closeInv;
  const commission = Math.round((p.sales * p.commissionRate) / 100);
  const commissionPaid = commission - p.commissionOwed;
  const nbvSold = p.sold.cost - p.sold.ad;
  const gain = p.sold.proceeds - nbvSold;
  return { receipts, payments, cos, commission, commissionPaid, nbvSold, gain };
}

export function yearBook(p: YearP): Book {
  const f = yearFigures(p);
  const ev = (e: BookEvent) => e;
  const events: BookEvent[] = [
    ev({ id: 'sales', text: `Sold ${eur(p.sales)} of dresses and coats to boutiques, all on credit.`, why: 'Wholesale customers expect 30 to 60 days to pay. The sale counts when the clothes are delivered, not when the money arrives.', legs: { rec: p.sales, revenue: -p.sales } }),
    ev({ id: 'receipts', text: `Boutiques paid ${eur(f.receipts)} of what they owed.`, why: 'Receivables are cash on its way. Some of this year’s sales are still on the way at the year end.', legs: { cash: f.receipts, rec: -f.receipts }, cf: 'op', cfLabel: 'Cash received from customers' }),
    ev({ id: 'purchases', text: `Bought ${eur(p.purchases)} of fabric and trims on credit.`, why: 'Suppliers give credit too. Buying on credit keeps cash in the bank for longer.', legs: { inv: p.purchases, pay: -p.purchases } }),
    ev({ id: 'payments', text: `Paid suppliers ${eur(f.payments)}.`, why: 'Cash out, but not the expense. The expense is the cost of what was sold.', legs: { pay: f.payments, cash: -f.payments }, cf: 'op', cfLabel: 'Cash paid to suppliers' }),
    ev({ id: 'stock', text: `Year-end stock count: fabric and finished pieces costing ${eur(p.closeInv)} are still on the shelves.`, why: 'Unsold stock stays an asset. Cost of sales is opening stock plus purchases less what’s left.', legs: { cos: f.cos, inv: -f.cos } }),
    ev({ id: 'wages', text: `Paid the studio team ${eur(p.wages)} in wages.`, why: 'Skilled people are the atelier’s biggest running cost after fabric.', legs: { wages: p.wages, cash: -p.wages }, cf: 'op', cfLabel: 'Wages paid' }),
    ev({ id: 'rent', text: `Paid ${eur(p.rent)} rent for the studio for the year.`, why: 'Paid for the year it covers, so the expense and the payment match.', legs: { rent: p.rent, cash: -p.rent }, cf: 'op', cfLabel: 'Rent paid' }),
    ev({ id: 'utilities', text: `Paid ${eur(p.utilities)} for heat, light and insurance.`, why: 'Running costs: an expense and cash out in the same year.', legs: { utilities: p.utilities, cash: -p.utilities }, cf: 'op', cfLabel: 'Heat, light and insurance paid' }),
    ev({ id: 'commission', text: `Sales agents earn ${p.commissionRate}% commission on sales: ${eur(f.commission)} for the year. ${eur(f.commissionPaid)} was paid; ${eur(p.commissionOwed)} is still owed on 31 December.`, why: 'The expense belongs to the year the sales were made, paid or not. The unpaid part is an accrual: a liability.', legs: { commission: f.commission, cash: -f.commissionPaid, accr: -p.commissionOwed }, cf: 'op', cfLabel: 'Commission paid' }),
    ev({ id: 'capex', text: `Bought new industrial sewing machines for ${eur(p.capex)}, paid in cash.`, why: 'They’ll earn for years, so the cost is spread over those years as depreciation instead of hitting one year’s profit.', legs: { equip: p.capex, cash: -p.capex }, cf: 'inv', cfLabel: 'Purchase of sewing machines' }),
    ev({ id: 'disposal', text: `Sold the ${p.sold.item} for ${eur(p.sold.proceeds)}. It cost ${eur(p.sold.cost)} and had ${eur(p.sold.ad)} of depreciation against it.`, why: 'The gain or loss is only the gap between the price and what the books said it was worth. The whole price is investing cash.', legs: { cash: p.sold.proceeds, accDep: p.sold.ad, equip: -p.sold.cost, disposal: -f.gain }, cf: 'inv', cfLabel: `Sale of the ${p.sold.item}` }),
    ev({ id: 'dep', text: `Depreciation for the year: ${eur(p.dep)}.`, why: 'A cost with no cash leaving. It’s one reason profit and cash drift apart.', legs: { depn: p.dep, accDep: -p.dep } }),
    ev({ id: 'loan', text: `Repaid ${eur(p.loanRepaid)} of the bank loan.`, why: 'Paying back a loan isn’t an expense. It shrinks a liability.', legs: { loan: p.loanRepaid, cash: -p.loanRepaid }, cf: 'fin', cfLabel: 'Loan repaid' }),
    ev({ id: 'interest', text: `Paid ${eur(p.interest)} interest on the loan.`, why: 'Interest is what borrowing costs: an expense, shown below operating profit.', legs: { interest: p.interest, cash: -p.interest }, cf: 'op', cfLabel: 'Interest paid' }),
    ev({ id: 'taxpaid', text: `Paid last year’s tax bill of ${eur(p.open.tax)}.`, why: 'Tax is paid the year after it’s charged, so this year’s cash pays last year’s bill.', legs: { taxOwed: p.open.tax, cash: -p.open.tax }, cf: 'op', cfLabel: 'Tax paid' }),
    ev({ id: 'taxcharge', text: `Tax on this year’s profit: ${eur(p.taxCharge)}, due next year.`, why: 'An expense this year and a liability until it’s paid.', legs: { taxExp: p.taxCharge, taxOwed: -p.taxCharge } }),
    ev({ id: 'shares', text: `Idris bought ${p.shares.toLocaleString('en-GB')} new €1 shares for ${eur(p.shares)} in cash.`, why: 'Owners putting money in is financing, not income.', legs: { cash: p.shares, shareCap: -p.shares }, cf: 'fin', cfLabel: 'Shares issued' }),
    ev({ id: 'dividend', text: `Paid the shareholders a dividend of ${eur(p.dividend)}.`, why: 'A share of the profit handed to the owners. It isn’t an expense: it comes out of retained earnings.', legs: { dividends: p.dividend, cash: -p.dividend }, cf: 'fin', cfLabel: 'Dividend paid' }),
  ];
  return {
    name: 'Atelier Noor',
    period: 'the year to 31 December',
    start: '1 January',
    end: '31 December',
    opening: { equip: p.open.equip, accDep: -p.open.accDep, inv: p.open.inv, rec: p.open.rec, cash: p.open.cash, pay: -p.open.pay, taxOwed: -p.open.tax, loan: -p.open.loan, shareCap: -p.open.shareCap },
    events,
  };
}

const j = (rng: () => number, base: number, spread: number, step: number) => Math.max(step, Math.round((base * (1 + (rng() * 2 - 1) * spread)) / step) * step);

/** A fresh year for the same business: different numbers, same shape, always balancing and always solvent. */
export function varyYear(rng: () => number): YearP {
  const b = YEAR_BASE;
  for (let tries = 0; tries < 40; tries++) {
    const sales = j(rng, b.sales, 0.3, 5000);
    const margin = 0.36 + rng() * 0.1;
    const openInv = j(rng, b.open.inv, 0.3, 1000);
    const closeInv = Math.max(4000, openInv + pickInt(rng, -6, 12, 1) * 1000);
    const cos = Math.round((sales * (1 - margin)) / 1000) * 1000;
    const purchases = cos + closeInv - openInv;
    const openRec = j(rng, b.open.rec, 0.3, 1000);
    const openPay = j(rng, b.open.pay, 0.3, 1000);
    const cost = pickInt(rng, 6, 16) * 1000;
    const ad = Math.min(cost - 1000, pickInt(rng, 3, 12) * 1000);
    const nbv = cost - ad;
    const proceeds = Math.max(500, nbv + pickInt(rng, -2, 4) * 500);
    const loan = j(rng, b.open.loan, 0.3, 5000);
    const interest = Math.round((loan * pickInt(rng, 6, 9)) / 100 / 100) * 100;
    const p: YearP = {
      open: { equip: j(rng, b.open.equip, 0.25, 5000), accDep: j(rng, b.open.accDep, 0.3, 1000), inv: openInv, rec: openRec, cash: j(rng, b.open.cash, 0.4, 1000), pay: openPay, tax: j(rng, b.open.tax, 0.4, 500), loan, shareCap: j(rng, b.open.shareCap, 0.2, 10000) },
      sales,
      closeRec: Math.max(4000, openRec + pickInt(rng, -6, 14) * 1000),
      purchases,
      closePay: Math.max(3000, openPay + pickInt(rng, -4, 8) * 1000),
      closeInv,
      wages: j(rng, b.wages, 0.25, 1000),
      rent: j(rng, b.rent, 0.25, 500),
      utilities: j(rng, b.utilities, 0.3, 500),
      commissionRate: pickOne(rng, [1, 2, 2.5, 3]),
      commissionOwed: 0,
      capex: j(rng, b.capex, 0.5, 1000),
      sold: { cost, ad, proceeds, item: pickOne(rng, ['old cutting table', 'old steam press', 'delivery van', 'old overlocker']) },
      dep: j(rng, b.dep, 0.3, 1000),
      loanRepaid: pickInt(rng, 0, 3) * 5000 || 5000,
      interest,
      taxCharge: 0,
      shares: pickInt(rng, 0, 3) * 5000,
      dividend: pickInt(rng, 2, 12) * 1000,
      sharePrice: pickOne(rng, [1.5, 1.8, 2, 2.2, 2.5, 3]),
    };
    p.commissionOwed = Math.round((yearFigures(p).commission * (0.15 + rng() * 0.3)) / 100) * 100;
    if (p.open.accDep >= p.open.equip - 20000 || p.sold.cost > p.open.equip || p.sold.ad > p.open.accDep) continue;
    // Tax at a fifth of profit before tax, to the nearest hundred.
    const pbt = incomeStatement(yearBook(p)).pbt;
    if (pbt < 5000) continue;
    p.taxCharge = Math.round((pbt * 0.2) / 100) * 100;
    const book = yearBook(p);
    const is = incomeStatement(book);
    const pos = position(book);
    if (is.profit < p.dividend || pos.cash < 1000 || pos.retained <= 0 || openingPosition(book).retained <= 0) continue;
    return p;
  }
  return YEAR_BASE;
}

export const YEAR = yearBook(YEAR_BASE);

/** The year's figures in the shape the ratio problems use. */
export function finOf(p: YearP): FinData {
  const book = yearBook(p);
  const is = incomeStatement(book);
  const pos = position(book);
  const op0 = openingPosition(book);
  return {
    name: book.name,
    sales: is.revenue,
    creditSales: is.revenue,
    cos: is.cos,
    opex: is.opex - is.gain,
    interest: is.interest,
    tax: is.tax,
    inv: [op0.inv, pos.inv],
    rec: [op0.rec, pos.rec],
    pay: [op0.pay, pos.pay],
    cash: pos.cash,
    otherCL: pos.accr + pos.tax,
    nca: pos.nbv,
    ltd: pos.loan,
    shares: pos.shareCap,
    price: p.sharePrice,
    dividend: p.dividend,
  };
}

/** Params for the existing step-by-step problems, all taken from one year. */
export function yearParams(p: YearP) {
  const f = yearFigures(p);
  const book = yearBook(p);
  const cf = cashFlow(book);
  const pos = position(book);
  return {
    netAssets: { assets: openingPosition(book).ta, current: p.open.pay + p.open.tax, longTerm: p.open.loan, shares: p.open.shareCap },
    cos: { open: p.open.inv, bought: p.purchases, close: p.closeInv, sales: p.sales, paid: f.payments },
    accrual: { kind: 'accrual' as const, sales: p.sales, rate: p.commissionRate, paid: f.commissionPaid, perQuarter: 4000, quarters: 5 },
    straightLine: { cost: p.capex, residual: Math.round(p.capex / 6 / 1000) * 1000, life: 5, theoLife: 10, item: 'new sewing machines' },
    cashCollected: { open: p.open.rec, sales: p.sales, close: p.closeRec },
    fcf: { cfo: cf.cfo, capex: p.capex, dividend: p.dividend },
    cfoIndirect: {
      op: cf.op,
      dep: cf.dep,
      inv: [p.open.inv, p.closeInv] as [number, number],
      rec: [p.open.rec, p.closeRec] as [number, number],
      pay: [p.open.pay, p.closePay] as [number, number],
      refit: 25000,
      gain: cf.gain,
      accr: [0, p.commissionOwed] as [number, number],
      paidOut: { interest: cf.interestPaid, tax: cf.taxPaid },
    },
    depJar: { open: p.open.accDep, close: pos.accDep, sold: p.sold.ad, claim: pos.accDep - p.open.accDep, unit: '€' },
    additionsJar: { open: p.open.equip, close: pos.equipCost, soldCost: p.sold.cost, unit: '€' },
    disposal: { cost: p.sold.cost, ad: p.sold.ad, given: 'proceeds' as const, amount: p.sold.proceeds, item: p.sold.item, unit: '€' },
    taxPaid: { what: 'tax' as const, start: p.open.tax, charge: p.taxCharge, end: p.taxCharge, unit: '€' },
  };
}

// ---------------------------------------------------------------- a single month

export interface MonthP {
  month: string;
  open: { equip: number; accDep: number; inv: number; rec: number; prepaid: number; cash: number; pay: number; loan: number; shareCap: number };
  creditSales: number;
  cashSales: number;
  receipts: number;
  purchases: number;
  payments: number;
  closeInv: number;
  wages: number;
  /** Rent paid for this month and the next two. */
  rentQuarter: number;
  dep: number;
  interest: number;
  /** Something bought for the studio (0 for none). */
  capex: number;
  /** New bank borrowing (0 for none). */
  newLoan: number;
  /** Dividend paid (0 for none). */
  dividend: number;
}

export const MONTH_BASE: MonthP = {
  month: 'March',
  open: { equip: 125000, accDep: 33000, inv: 29000, rec: 41000, prepaid: 0, cash: 18000, pay: 23000, loan: 58000, shareCap: 50000 },
  creditSales: 19000,
  cashSales: 3000,
  receipts: 20500,
  purchases: 14000,
  payments: 12500,
  closeInv: 30000,
  wages: 3200,
  rentQuarter: 3600,
  dep: 1200,
  interest: 400,
  capex: 6000,
  newLoan: 0,
  dividend: 0,
};

export function monthBook(p: MonthP): Book {
  const cos = p.open.inv + p.purchases - p.closeInv;
  const rentMonth = Math.round(p.rentQuarter / 3);
  const events: BookEvent[] = [
    { id: 'm-credit', text: `Sold ${eur(p.creditSales)} of pieces to boutiques on credit.`, why: 'Profit now, cash later.', legs: { rec: p.creditSales, revenue: -p.creditSales } },
    { id: 'm-cashsale', text: `Sold ${eur(p.cashSales)} of samples for cash at the studio sale.`, why: 'Profit and cash at the same moment.', legs: { cash: p.cashSales, revenue: -p.cashSales }, cf: 'op', cfLabel: 'Cash sales' },
    { id: 'm-receipts', text: `Boutiques paid ${eur(p.receipts)} they owed from earlier months.`, why: 'Cash now for profit already counted.', legs: { cash: p.receipts, rec: -p.receipts }, cf: 'op', cfLabel: 'Cash received from customers' },
    { id: 'm-purchases', text: `Bought ${eur(p.purchases)} of fabric on credit.`, why: 'Stock in, a debt to the supplier. Not yet an expense.', legs: { inv: p.purchases, pay: -p.purchases } },
    { id: 'm-payments', text: `Paid suppliers ${eur(p.payments)}.`, why: 'Settling earlier bills: cash out, no expense.', legs: { pay: p.payments, cash: -p.payments }, cf: 'op', cfLabel: 'Cash paid to suppliers' },
    { id: 'm-wages', text: `Paid ${eur(p.wages)} wages.`, why: 'An expense paid as it’s incurred.', legs: { wages: p.wages, cash: -p.wages }, cf: 'op', cfLabel: 'Wages paid' },
    { id: 'm-rent', text: `Paid ${eur(p.rentQuarter)} rent for ${p.month} and the next two months.`, why: `Only ${p.month}’s third is this month’s expense. The rest is paid ahead: a prepayment, which is an asset.`, legs: { rent: rentMonth, prepaid: p.rentQuarter - rentMonth, cash: -p.rentQuarter }, cf: 'op', cfLabel: 'Rent paid' },
    ...(p.capex ? [{ id: 'm-capex', text: `Bought a new embroidery machine for ${eur(p.capex)} in cash.`, why: 'An asset, not an expense: it will be depreciated over its life.', legs: { equip: p.capex, cash: -p.capex }, cf: 'inv' as const, cfLabel: 'Purchase of equipment' }] : []),
    ...(p.newLoan ? [{ id: 'm-loan', text: `Borrowed ${eur(p.newLoan)} from the bank.`, why: 'Cash in, but it has to be paid back: a liability, not income.', legs: { cash: p.newLoan, loan: -p.newLoan }, cf: 'fin' as const, cfLabel: 'New bank loan' }] : []),
    { id: 'm-interest', text: `Paid ${eur(p.interest)} loan interest.`, why: 'The cost of borrowing: an expense.', legs: { interest: p.interest, cash: -p.interest }, cf: 'op', cfLabel: 'Interest paid' },
    ...(p.dividend ? [{ id: 'm-div', text: `Paid a dividend of ${eur(p.dividend)}.`, why: 'A payout to owners, not an expense.', legs: { dividends: p.dividend, cash: -p.dividend }, cf: 'fin' as const, cfLabel: 'Dividend paid' }] : []),
    { id: 'm-stock', text: `Month-end count: stock costing ${eur(p.closeInv)} is left.`, why: 'Cost of sales is what was used up: opening stock plus purchases less what’s left.', legs: { cos, inv: -cos } },
    { id: 'm-dep', text: `Depreciation for ${p.month}: ${eur(p.dep)}.`, why: 'A non-cash cost.', legs: { depn: p.dep, accDep: -p.dep } },
  ];
  return {
    name: 'Atelier Noor',
    period: p.month,
    start: `1 ${p.month}`,
    end: `the end of ${p.month}`,
    opening: { equip: p.open.equip, accDep: -p.open.accDep, inv: p.open.inv, rec: p.open.rec, prepaid: p.open.prepaid, cash: p.open.cash, pay: -p.open.pay, loan: -p.open.loan, shareCap: -p.open.shareCap },
    events,
  };
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function varyMonth(rng: () => number): MonthP {
  const b = MONTH_BASE;
  for (let tries = 0; tries < 40; tries++) {
    const k = (base: number, spread = 0.35, step = 100) => j(rng, base, spread, step);
    const openInv = k(b.open.inv, 0.3, 1000);
    const purchases = k(b.purchases);
    const creditSales = k(b.creditSales, 0.35, 500);
    const cashSales = pickInt(rng, 0, 8) * 500;
    const sales = creditSales + cashSales;
    const cos = Math.round((sales * (0.55 + rng() * 0.12)) / 100) * 100;
    const closeInv = openInv + purchases - cos;
    const openRec = k(b.open.rec, 0.3, 1000);
    const openPay = k(b.open.pay, 0.3, 1000);
    const p: MonthP = {
      month: pickOne(rng, MONTHS),
      open: { equip: k(b.open.equip, 0.2, 5000), accDep: k(b.open.accDep, 0.3, 1000), inv: openInv, rec: openRec, prepaid: 0, cash: k(b.open.cash, 0.4, 1000), pay: openPay, loan: k(b.open.loan, 0.3, 1000), shareCap: b.open.shareCap },
      creditSales,
      cashSales,
      receipts: Math.min(openRec, k(b.receipts, 0.3, 500)),
      purchases,
      payments: Math.min(openPay, k(b.payments, 0.3, 500)),
      closeInv,
      wages: k(b.wages, 0.25),
      rentQuarter: pickInt(rng, 9, 15) * 300,
      dep: k(b.dep, 0.3),
      interest: k(b.interest, 0.3),
      capex: rng() < 0.6 ? pickInt(rng, 2, 12) * 1000 : 0,
      newLoan: rng() < 0.35 ? pickInt(rng, 2, 8) * 2500 : 0,
      dividend: rng() < 0.3 ? pickInt(rng, 2, 6) * 500 : 0,
    };
    if (closeInv < 3000) continue;
    const book = monthBook(p);
    if (position(book).cash < 500) continue;
    return p;
  }
  return MONTH_BASE;
}
