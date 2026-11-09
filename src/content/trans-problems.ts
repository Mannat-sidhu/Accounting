// "Preparing accounts" from a list of a year's transactions: the income statement, the cash balance, and the balance
// sheet. The same list feeds all three, as in a written exam question. Numbers are the house's own.
import { eur } from '../engine/format';
import { pickInt, pickOne } from '../engine/rng';
import type { CalcProblem, Problem, StatementItem } from '../engine/types';
import { defineCalc, defineStatement, w0, whys } from './helpers';

export interface TransP {
  capital: number;
  equip: number;
  depPct: number;
  sales: number;
  /** Sales still owed by customers at the year end. */
  debtors: number;
  purchases: number;
  /** Inventory still unsold at the year end. */
  closingInv: number;
  /** Owed to suppliers at the year end. */
  creditors: number;
  loan: number;
  interestPct: number;
  admin: number;
  /** Admin expenses paid in the year; the rest is accrued. */
  adminPaid: number;
}

export const derived = (p: TransP) => {
  const dep = (p.equip * p.depPct) / 100;
  const interest = (p.loan * p.interestPct) / 100;
  const cos = p.purchases - p.closingInv;
  const fromCustomers = p.sales - p.debtors;
  const toSuppliers = p.purchases - p.creditors;
  const accrual = p.admin - p.adminPaid;
  const cash = p.capital - p.equip + fromCustomers - toSuppliers + p.loan - interest - p.adminPaid;
  const profit = p.sales - cos - p.admin - dep - interest;
  return { dep, interest, cos, fromCustomers, toSuppliers, accrual, cash, profit, gross: p.sales - cos, op: p.sales - cos - p.admin - dep };
};

export const TRANS_BASE: TransP = { capital: 60000, equip: 80000, depPct: 25, sales: 280000, debtors: 45000, purchases: 170000, closingInv: 35000, creditors: 30000, loan: 90000, interestPct: 7, admin: 72000, adminPaid: 60000 };

export const varyTrans = (rng: () => number): TransP => {
  for (;;) {
    const sales = pickInt(rng, 150000, 450000, 10000);
    const purchases = Math.round((sales * (0.45 + rng() * 0.2)) / 10000) * 10000;
    const p: TransP = {
      capital: pickInt(rng, 20000, 100000, 5000),
      equip: pickInt(rng, 40000, 200000, 20000),
      depPct: pickOne(rng, [10, 20, 25]),
      sales,
      debtors: pickInt(rng, 10000, Math.floor((sales * 0.3) / 5000) * 5000, 5000),
      purchases,
      closingInv: pickInt(rng, 10000, Math.floor((purchases * 0.4) / 5000) * 5000, 5000),
      creditors: pickInt(rng, 10000, Math.floor((purchases * 0.3) / 5000) * 5000, 5000),
      loan: pickInt(rng, 40000, 150000, 10000),
      interestPct: pickOne(rng, [5, 6, 7, 8]),
      admin: pickInt(rng, 40000, 110000, 1000),
      adminPaid: 0,
    };
    p.adminPaid = p.admin - pickInt(rng, 2, 15, 1) * 1000;
    const d = derived(p);
    if (d.cash > 15000 && d.profit > 5000) return p;
  }
};

/** The transactions, numbered as on a paper, as the player reads them. */
const story = (p: TransP): string[] => {
  const d = derived(p);
  return [
    `The house’s new boutique started on 1 January and traded for the year to 31 December. These are the totals for the year.`,
    `1. Share capital of ${eur(p.capital)} was issued for cash. 2. Equipment costing ${eur(p.equip)} was bought for cash, and is depreciated at ${p.depPct}% a year (a full year’s charge in the year of purchase).`,
    `3. Sales were ${eur(p.sales)}, all on credit; ${eur(p.debtors)} is still owed by customers at the year end. 4. Inventory of ${eur(p.purchases)} was bought, of which ${eur(p.closingInv)} is unsold at the year end; ${eur(p.creditors)} of the purchases is still owed to suppliers.`,
    `5. A bank loan of ${eur(p.loan)} was raised, repayable in five years. Interest for the year was ${p.interestPct}% of the loan and was paid. 6. Admin expenses of ${eur(p.admin)} were incurred; ${eur(p.adminPaid)} was paid in the year, and the bills for the remaining ${eur(d.accrual)} have not yet been paid.`,
  ];
};

// ---------------------------------------------------------------- the income statement

export const transIs = defineStatement<TransP>({
  kind: 'statement',
  id: 'trans-is',
  title: 'The boutique’s first year',
  host: 'niamh',
  concept: 'transactions',
  uses: ['is-layout', 'cost-of-sales', 'accruals-prepayments'],
  base: TRANS_BASE,
  vary: varyTrans,
  build: (p) => {
    const d = derived(p);
    const it = (id: string, label: string, amount: number, section: string, sign: 1 | -1, why: string): StatementItem => ({ id, label, amount, section, sign, why });
    const items: StatementItem[] = [
      it('sales', 'Sales for the year (all on credit)', p.sales, 'trade', 1, 'Revenue is earned when the sale is made, whether or not the customer has paid.'),
      it('purch', 'Inventory bought during the year', p.purchases, 'trade', -1, 'Part of cost of sales: what we had available to sell.'),
      it('inv', 'Inventory unsold at the year end', p.closingInv, 'trade', 1, 'Still on the shelves: take it back out of cost of sales.'),
      it('admin', 'Admin expenses incurred', p.admin, 'opex', -1, 'The expense is what was incurred, paid or not.'),
      it('dep', `Depreciation (${p.depPct}% of the equipment)`, d.dep, 'opex', -1, 'Spreads the equipment’s cost over its life. Non-cash, but still an expense.'),
      it('int', 'Interest on the bank loan', d.interest, 'fin', -1, 'A finance cost, below operating profit.'),
      it('cust', 'Cash received from customers', d.fromCustomers, 'none', 1, 'Leave it out: the income statement shows sales, not cash received.'),
      it('equip', 'Equipment bought for cash', p.equip, 'none', -1, 'Leave it out: it’s an asset. Only the depreciation is an expense.'),
      it('cap', 'Share capital issued', p.capital, 'none', 1, 'Leave it out: money from owners isn’t income.'),
      it('loan', 'Bank loan received', p.loan, 'none', 1, 'Leave it out: a loan is a liability, not income.'),
      it('adminpaid', 'Admin expenses paid in cash', p.adminPaid, 'none', -1, 'Leave it out: the expense is what was incurred, not what was paid.'),
    ];
    return {
      prompt: [{ who: 'niamh', text: 'The boutique has opened its books for the first time. Prepare the income statement for the year, from the totals below.' }, ...story(p)],
      ask: 'Lay out the income statement, then find gross profit, operating profit and the profit for the year.',
      heading: 'Income statement for the year ended 31 December (€)',
      sections: [
        { id: 'trade', label: 'Trading', subtotal: 'Gross profit' },
        { id: 'opex', label: 'Operating expenses', subtotal: 'Total operating expenses' },
        { id: 'fin', label: 'Finance costs', subtotal: 'Interest' },
      ],
      items,
      signed: false,
      totals: [
        { key: 'op', label: 'Operating profit', calc: (s) => s.trade + s.opex, explain: 'Gross profit less operating expenses.' },
        { key: 'np', label: 'Profit for the year', calc: (s) => s.trade + s.opex + s.fin, explain: 'Operating profit less interest.' },
      ],
      decision: {
        question: `Customers have paid ${eur(d.fromCustomers)} so far. What do we show as sales?`,
        options: [
          { id: 'all', label: `${eur(p.sales)}: everything sold in the year` },
          { id: 'cash', label: `${eur(d.fromCustomers)}: the cash received` },
        ],
        correct: 'all',
        why: whys('Revenue is recognised when earned, not when the cash arrives.', 'A sale only counts when the money is in the bank.', 'Both figures are the same thing.'),
        correctWhy: 'w0',
        explain: `Sales are ${eur(p.sales)}. The ${eur(p.debtors)} still owed is a trade receivable on the balance sheet. Profit for the year is ${eur(d.profit)}.`,
      },
      working: [`Cost of sales = ${w0(p.purchases)} − ${w0(p.closingInv)} = ${w0(d.cos)}`, `Gross profit = ${w0(p.sales)} − ${w0(d.cos)} = ${w0(d.gross)}`, `Operating profit = ${w0(d.gross)} − ${w0(p.admin)} − ${w0(d.dep)} = ${w0(d.op)}`, `Profit for the year = ${w0(d.op)} − ${w0(d.interest)} = ${w0(d.profit)}`],
      hints: { place: 'Five of these lines are cash or balance sheet items, not income statement lines.', subtotals: 'Trading: sales, less purchases, plus the unsold inventory back. Then the expenses.', totals: 'Operating profit, then take off the interest.', decision: 'When is revenue earned?' },
      outcomes: {
        all: { valueDelta: 1500, news: 'Niamh signs off the income statement. The customers who owe us are on the balance sheet where they belong.' },
        cash: { valueDelta: -2000, news: 'Sales are understated by every unpaid invoice. Niamh has questions.' },
      },
    };
  },
});

// ---------------------------------------------------------------- the cash balance

export const transCash = defineCalc<TransP>({
  kind: 'calc',
  id: 'trans-cash',
  title: 'Where did the cash end up?',
  host: 'margaux',
  concept: 'transactions',
  uses: ['cash-jar'],
  base: TRANS_BASE,
  vary: varyTrans,
  build: (p) => {
    const d = derived(p);
    return {
      prompt: [{ who: 'margaux', text: 'Nobody has opened the bank statement. But every transaction is on the list, and cash only moves when money actually moves.' }, ...story(p)],
      ask: 'What is the cash balance at the year end?',
      spot: {
        question: 'Which of these moved cash during the year?',
        options: [
          { id: 'cap', label: 'Share capital issued' },
          { id: 'equip', label: 'Equipment bought' },
          { id: 'cust', label: 'Customers paying their invoices' },
          { id: 'supp', label: 'Paying suppliers' },
          { id: 'loan', label: 'The bank loan' },
          { id: 'int', label: 'Interest paid' },
          { id: 'admin', label: 'Admin bills paid' },
          { id: 'dep', label: 'Depreciation' },
          { id: 'acc', label: 'Admin bills not yet paid' },
        ],
        correct: ['cap', 'equip', 'cust', 'supp', 'loan', 'int', 'admin'],
        explain: 'Depreciation and unpaid bills are accounting entries: no money moved.',
      },
      formula: { options: ['jar-end', 'profit-is-cash', 'sales-is-cash'], correct: 'jar-end', explain: 'Start with nothing, add what came in, take off what went out.' },
      inputs: [
        { key: 'A', symbol: '\\text{Shares}', label: 'Share capital received', unit: 'eur', expected: p.capital, explain: `${w0(p.capital)}.` },
        { key: 'B', symbol: '\\text{Equip}', label: 'Equipment paid for', unit: 'eur', expected: p.equip, explain: `${w0(p.equip)}.` },
        { key: 'C', symbol: '\\text{Cust}', label: 'Cash received from customers', unit: 'eur', expected: d.fromCustomers, explain: `${w0(p.sales)} − ${w0(p.debtors)} still owed = ${w0(d.fromCustomers)}.` },
        { key: 'D', symbol: '\\text{Supp}', label: 'Cash paid to suppliers', unit: 'eur', expected: d.toSuppliers, explain: `${w0(p.purchases)} − ${w0(p.creditors)} still owed = ${w0(d.toSuppliers)}.` },
        { key: 'E', symbol: '\\text{Loan}', label: 'Bank loan received', unit: 'eur', expected: p.loan, explain: `${w0(p.loan)}.` },
        { key: 'F', symbol: '\\text{Int}', label: 'Interest paid', unit: 'eur', expected: d.interest, explain: `${p.interestPct}% × ${w0(p.loan)} = ${w0(d.interest)}.` },
        { key: 'G', symbol: '\\text{Admin}', label: 'Admin expenses paid', unit: 'eur', expected: p.adminPaid, explain: `${w0(p.adminPaid)}: the unpaid ${w0(d.accrual)} hasn’t moved any cash.` },
      ],
      solve: (v) => v.A - v.B + v.C - v.D + v.E - v.F - v.G,
      answer: { label: 'Cash at bank at the year end', unit: 'eur', explain: `${w0(p.capital)} − ${w0(p.equip)} + ${w0(d.fromCustomers)} − ${w0(d.toSuppliers)} + ${w0(p.loan)} − ${w0(d.interest)} − ${w0(p.adminPaid)} = ${w0(d.cash)}.` },
      decision: {
        question: `Profit for the year is ${eur(d.profit)} and cash is ${eur(d.cash)}. Why aren’t they the same?`,
        options: [
          { id: 'timing', label: 'Profit counts sales and costs when they happen; cash counts when the money moves, and cash also moves for equipment, loans and shares' },
          { id: 'same', label: 'They should be the same: an error has crept in' },
        ],
        correct: 'timing',
        why: whys('Debtors, creditors, accruals, depreciation and non-income flows all separate the two.', 'Profit is the change in cash, always.', 'Only the loan makes them differ.'),
        correctWhy: 'w0',
        explain: `Profit ${eur(d.profit)}, cash ${eur(d.cash)}: unpaid sales and bills, depreciation, the equipment, the loan and the shares all pull them apart.`,
      },
      working: [`Cash = ${w0(p.capital)} − ${w0(p.equip)} + ${w0(d.fromCustomers)} − ${w0(d.toSuppliers)} + ${w0(p.loan)} − ${w0(d.interest)} − ${w0(p.adminPaid)}`, `= ${w0(d.cash)}`],
      hints: { spot: 'Cash only moves when money moves.', formula: 'Every cash in and out, added up.', inputs: 'Sales less what customers still owe; purchases less what we still owe suppliers.', answer: 'Cash in less cash out.', decision: 'Think about timing.' },
      outcomes: { timing: { valueDelta: 1500, news: 'Aoife nods: the bank balance and the profit tell different stories.' }, same: { valueDelta: -1500, news: 'Hours are wasted looking for an error that isn’t there.' } },
      cfoLine: `Cash at the year end ${eur(d.cash)}.`,
    };
  },
}) as CalcProblem<TransP>;

// ---------------------------------------------------------------- the balance sheet

export const transBs = defineStatement<TransP>({
  kind: 'statement',
  id: 'trans-bs',
  title: 'The boutique’s balance sheet',
  host: 'margaux',
  concept: 'transactions',
  uses: ['sfp-layout', 'equation'],
  base: TRANS_BASE,
  vary: varyTrans,
  build: (p) => {
    const d = derived(p);
    const it = (id: string, label: string, amount: number, section: string, sign: 1 | -1, why: string): StatementItem => ({ id, label, amount, section, sign, why });
    const items: StatementItem[] = [
      it('equip', 'Equipment at cost', p.equip, 'nca', 1, 'A long-term asset.'),
      it('ad', 'Accumulated depreciation', d.dep, 'nca', -1, 'Taken off the cost: the equipment’s carrying amount is what’s left.'),
      it('inv', 'Inventory', p.closingInv, 'ca', 1, 'Unsold at the year end.'),
      it('rec', 'Trade receivables', p.debtors, 'ca', 1, 'Customers who still owe us.'),
      it('cash', 'Cash at bank', d.cash, 'ca', 1, 'Worked out from the cash flows.'),
      it('pay', 'Trade payables', p.creditors, 'cl', 1, 'Owed to suppliers, due within the year.'),
      it('acc', 'Accruals', d.accrual, 'cl', 1, 'Admin bills incurred but not yet paid.'),
      it('loan', 'Bank loan, due in five years', p.loan, 'ncl', 1, 'Due after more than a year.'),
      it('sc', 'Share capital', p.capital, 'eq', 1, 'Owners’ money put in.'),
      it('re', 'Retained profit for the year', d.profit, 'eq', 1, 'The year’s profit, kept in the business.'),
      it('sales', 'Sales for the year', p.sales, 'none', 1, 'Income statement, not balance sheet. Only the profit reaches equity.'),
      it('admin', 'Admin expenses', p.admin, 'none', -1, 'An expense: income statement.'),
      it('int', 'Interest on the loan', d.interest, 'none', -1, 'An expense: income statement.'),
    ];
    const netAssets = p.equip - d.dep + p.closingInv + p.debtors + d.cash - p.creditors - d.accrual - p.loan;
    return {
      prompt: [{ who: 'margaux', text: 'Same boutique, same list. Now the balance sheet at 31 December. The profit for the year is worked out for you, and so is the cash.' }, ...story(p)],
      ask: 'Lay out the balance sheet and show that net assets equal equity.',
      heading: 'Statement of financial position at 31 December (€)',
      sections: [
        { id: 'nca', label: 'Non-current assets', subtotal: 'Net book value of equipment' },
        { id: 'ca', label: 'Current assets', subtotal: 'Total current assets' },
        { id: 'cl', label: 'Current liabilities', subtotal: 'Total current liabilities' },
        { id: 'ncl', label: 'Non-current liabilities', subtotal: 'Total non-current liabilities' },
        { id: 'eq', label: 'Equity', subtotal: 'Total equity' },
      ],
      items,
      signed: false,
      totals: [{ key: 'na', label: 'Net assets', calc: (s) => s.nca + s.ca - s.cl - s.ncl, explain: 'Non-current plus current assets, less every liability. It equals total equity.' }],
      decision: {
        question: 'The owners ask what their stake in the boutique is worth on paper.',
        options: [
          { id: 'eq', label: `${eur(netAssets)}: net assets, the same as total equity` },
          { id: 'ta', label: `${eur(p.equip - d.dep + p.closingInv + p.debtors + d.cash)}: total assets` },
        ],
        correct: 'eq',
        why: whys('Equity is what’s left after paying everyone we owe.', 'The owners own every asset.', 'Share capital alone is their stake.'),
        correctWhy: 'w0',
        explain: `Net assets = ${w0(p.equip - d.dep + p.closingInv + p.debtors + d.cash)} − ${w0(p.creditors + d.accrual + p.loan)} = ${w0(netAssets)}, which is share capital ${w0(p.capital)} plus profit ${w0(d.profit)}.`,
      },
      working: [`Net book value = ${w0(p.equip)} − ${w0(d.dep)} = ${w0(p.equip - d.dep)}`, `Net assets = ${w0(p.equip - d.dep)} + ${w0(p.closingInv + p.debtors + d.cash)} − ${w0(p.creditors + d.accrual)} − ${w0(p.loan)} = ${w0(netAssets)}`, `Equity = ${w0(p.capital)} + ${w0(d.profit)} = ${w0(p.capital + d.profit)}`],
      hints: { place: 'Three lines belong to the income statement.', subtotals: 'Add each section; accumulated depreciation comes off the cost.', totals: 'Assets less all liabilities. It should match equity.', decision: 'Equity = assets − liabilities.' },
      outcomes: { eq: { valueDelta: 1500, news: 'The balance sheet balances, and everyone agrees the number.' }, ta: { valueDelta: -1000, news: 'The owners quote the total assets as their stake. The bank is unimpressed.' } },
    };
  },
});

export const TRANS_PROBLEMS: Problem[] = [transIs, transCash, transBs];
