// Chapter III problems: the income statement. Base numbers follow the course examples
// (Better-Price Stores layout, Examples 3.2, 3.4, 3.6 and 3.8, and the Bull and Bear bonus case).
import * as A from '../engine/accounting';
import { eur } from '../engine/format';
import { pickInt, pickOne } from '../engine/rng';
import type { BriefProblem, ClassifyProblem, JudgementProblem, Problem, StatementItem } from '../engine/types';
import { defineCalc, defineStatement, w0, whys } from './helpers';
import { TRANS_PROBLEMS } from './trans-problems';

interface IsP {
  sales: number;
  cos: number;
  salaries: number;
  rent: number;
  light: number;
  phone: number;
  insurance: number;
  vanRun: number;
  depFix: number;
  depVan: number;
  intRec: number;
  intPaid: number;
  vanBought: number;
  loanRepaid: number;
  dividend: number;
}

export const isBuild = defineStatement<IsP>({
  kind: 'statement',
  id: 'is-build',
  title: 'Did we actually make a profit?',
  host: 'theo',
  concept: 'is-layout',
  base: { sales: 232000, cos: 154000, salaries: 24500, rent: 14200, light: 7500, phone: 1200, insurance: 1000, vanRun: 3400, depFix: 1000, depVan: 600, intRec: 2000, intPaid: 1100, vanBought: 12000, loanRepaid: 5000, dividend: 6000 },
  vary: (rng) => {
    const sales = pickInt(rng, 150000, 400000, 1000);
    const k = (lo: number, hi: number) => pickInt(rng, lo, hi, 100);
    return { sales, cos: Math.round((sales * (0.55 + rng() * 0.15)) / 100) * 100, salaries: k(15000, 40000), rent: k(8000, 20000), light: k(3000, 9000), phone: k(500, 2000), insurance: k(500, 2000), vanRun: k(1000, 5000), depFix: k(500, 3000), depVan: k(300, 2000), intRec: k(0, 3000), intPaid: k(500, 4000), vanBought: k(8000, 20000), loanRepaid: k(2000, 10000), dividend: k(2000, 10000) };
  },
  build: (p) => {
    const it = (id: string, label: string, amount: number, section: string, sign: 1 | -1, why: string): StatementItem => ({ id, label, amount, section, sign, why });
    const opex = p.salaries + p.rent + p.light + p.phone + p.insurance + p.vanRun + p.depFix + p.depVan;
    const gp = p.sales - p.cos;
    const op = gp - opex;
    const profit = op + p.intRec - p.intPaid;
    const items: StatementItem[] = [
      it('sales', 'Sales revenue', p.sales, 'trade', 1, 'Revenue starts the statement.'),
      it('cos', 'Cost of sales', p.cos, 'trade', -1, 'The cost of the goods sold.'),
      it('sal', 'Salaries and wages', p.salaries, 'opex', -1, 'An operating expense.'),
      it('rent', 'Rent and rates', p.rent, 'opex', -1, 'An operating expense.'),
      it('light', 'Heat and light', p.light, 'opex', -1, 'An operating expense.'),
      it('phone', 'Telephone and postage', p.phone, 'opex', -1, 'An operating expense.'),
      it('ins', 'Insurance', p.insurance, 'opex', -1, 'An operating expense.'),
      it('van', 'Motor van running expenses', p.vanRun, 'opex', -1, 'An operating expense.'),
      it('depf', 'Depreciation: fixtures and fittings', p.depFix, 'opex', -1, 'An operating expense (non-cash).'),
      it('depv', 'Depreciation: motor van', p.depVan, 'opex', -1, 'An operating expense (non-cash).'),
      ...(p.intRec ? [it('intr', 'Interest received from investments', p.intRec, 'fin', 1, 'Below operating profit.')] : []),
      it('intp', 'Interest on borrowings', p.intPaid, 'fin', -1, 'A finance cost, below operating profit.'),
      it('buy', 'Cost of a new van bought in June', p.vanBought, 'none', -1, 'Leave it out: it’s an asset. Only its depreciation is an expense.'),
      it('repay', 'Repayment of part of the bank loan', p.loanRepaid, 'none', -1, 'Leave it out: repaying a loan reduces a liability. Only interest is an expense.'),
      it('div', 'Dividend paid to Idris', p.dividend, 'none', -1, 'Leave it out: a dividend is a share of profit, not an expense.'),
    ];
    return {
      prompt: [
        { who: 'theo', mood: 'happy', text: 'My record year! I’ve listed everything that went out of the bank. Take it off sales and that’s my bonus.' },
        { who: 'margaux', text: 'Not everything that left the bank is an expense, Theo.' },
      ],
      ask: 'Lay out the income statement and find operating profit and profit for the year.',
      heading: 'Income statement for the year ended 30 September (€)',
      sections: [
        { id: 'trade', label: 'Trading', subtotal: 'Gross profit' },
        { id: 'opex', label: 'Operating expenses', subtotal: 'Total operating expenses' },
        { id: 'fin', label: 'Finance items', subtotal: 'Net interest' },
      ],
      items,
      signed: false,
      totals: [
        { key: 'op', label: 'Operating profit', calc: (s) => s.trade + s.opex, explain: 'Gross profit less operating expenses.' },
        { key: 'pf', label: 'Profit for the year', calc: (s) => s.trade + s.opex + s.fin, explain: 'Operating profit plus interest received, less interest paid.' },
      ],
      decision: {
        question: 'Theo wants the new van counted as an expense this year, “to keep the tax bill down”.',
        options: [
          { id: 'no', label: 'No: it’s an asset, depreciated over its life' },
          { id: 'yes', label: 'Yes: we paid for it this year' },
        ],
        correct: 'no',
        why: whys('The van helps earn revenue for several years, so matching spreads its cost as depreciation.', 'Anything paid in cash this year is this year’s expense.', 'Assets bought are always expensed when bought.'),
        correctWhy: 'w0',
        explain: `Profit for the year is ${eur(profit)}. The van, the loan repayment and the dividend all stay out of it.`,
      },
      working: [`Gross profit = ${w0(p.sales)} − ${w0(p.cos)} = ${w0(gp)}`, `Operating profit = ${w0(gp)} − ${w0(opex)} = ${w0(op)}`, `Profit for the year = ${w0(op)} + ${w0(p.intRec)} − ${w0(p.intPaid)} = ${w0(profit)}`],
      hints: {
        place: 'Three lines aren’t expenses at all: an asset bought, a loan paid back, and a payout to an owner.',
        subtotals: 'Trading: sales less cost of sales. Then add up the expenses, then the interest lines.',
        totals: 'Operating profit = gross profit less expenses. Then the interest.',
        decision: 'How long will the van be used?',
      },
      outcomes: {
        no: { valueDelta: 1500, news: 'Niamh signs off the income statement. Theo’s bonus is a bit smaller than he hoped, and correct.' },
        yes: { valueDelta: -2000, news: 'Niamh qualifies her opinion on the van. Aoife reads it.' },
      },
    };
  },
});

interface CosP {
  open: number;
  bought: number;
  close: number;
  sales: number;
  paid: number;
}

export const cosCalc = defineCalc<CosP>({
  kind: 'calc',
  id: 'cos',
  title: 'What did the coats cost us?',
  host: 'margaux',
  concept: 'cost-of-sales',
  base: { open: 40000, bought: 189000, close: 75000, sales: 232000, paid: 180000 },
  vary: (rng) => {
    const open = pickInt(rng, 10000, 60000, 1000);
    const bought = pickInt(rng, 80000, 250000, 1000);
    return { open, bought, close: pickInt(rng, 10000, 80000, 1000), sales: Math.round((open + bought) * 1.25 / 1000) * 1000, paid: Math.round(bought * 0.9 / 1000) * 1000 };
  },
  build: ({ open, bought, close, sales, paid }) => {
    const cos = A.costOfSales(open, bought, close);
    return {
      prompt: [`We started the year with ${eur(open)} of stock and bought ${eur(bought)} more, of which we’ve paid suppliers ${eur(paid)}. The year-end count found ${eur(close)} still on the rails. Sales were ${eur(sales)}.`, { who: 'theo', text: `Cost of sales is what we bought: ${eur(bought)}. Done.` }],
      ask: 'What was cost of sales?',
      spot: {
        question: 'Which figures do you need?',
        options: [
          { id: 'open', label: 'Opening inventory' },
          { id: 'bought', label: 'Purchases' },
          { id: 'close', label: 'Closing inventory' },
          { id: 'sales', label: 'Sales' },
          { id: 'paid', label: 'Cash paid to suppliers' },
        ],
        correct: ['open', 'bought', 'close'],
        explain: 'Cost of sales uses the inventory jar: opening + purchases − closing. Cash paid and sales don’t come into it.',
      },
      formula: { options: ['cos', 'cos-purchases', 'cos-plus-closing'], correct: 'cos', explain: 'Opening inventory + purchases − closing inventory.' },
      inputs: [
        { key: 'O', symbol: '\\text{Opening}', label: 'Opening inventory', unit: 'eur', expected: open, explain: `${eur(open)}.` },
        { key: 'P', symbol: '\\text{Purchases}', label: 'Purchases', unit: 'eur', expected: bought, explain: `${eur(bought)}, whether paid for or not.` },
        { key: 'C', symbol: '\\text{Closing}', label: 'Closing inventory', unit: 'eur', expected: close, explain: `${eur(close)}.` },
      ],
      solve: (v) => v.O + v.P - v.C,
      answer: { label: 'Cost of sales', unit: 'eur', explain: `${w0(open)} + ${w0(bought)} − ${w0(close)} = ${w0(cos)}.` },
      decision: {
        question: `Use Theo’s ${eur(bought)}?`,
        options: [
          { id: 'mine', label: `No: ${eur(cos)}` },
          { id: 'theo', label: 'Yes' },
        ],
        correct: 'mine',
        why: whys('Cost of sales is the cost of what was sold, not what was bought.', 'Purchases are the same as cost of sales.', 'Cost of sales is the cash paid.'),
        correctWhy: 'w0',
        explain: `Gross profit is ${eur(sales - cos)}, not ${eur(sales - bought)}.`,
      },
      working: ['Cost of sales = opening inventory + purchases − closing inventory', `= ${w0(open)} + ${w0(bought)} − ${w0(close)} = €${w0(cos)}`],
      hints: { spot: 'Think of the stock jar.', formula: 'What’s left on the rails wasn’t sold.', answer: 'Opening + purchases − closing.', decision: 'Bought or sold?' },
      outcomes: {
        mine: { valueDelta: 500, news: 'Gross margin comes out right first time.' },
        theo: { valueDelta: -1000, news: 'Gross profit is wrong in the draft. Niamh finds it in ten minutes.' },
      },
      cfoLine: `Cost of sales ${eur(cos)}.`,
    };
  },
});

interface AccP {
  kind: 'accrual' | 'prepayment';
  sales: number;
  rate: number;
  paid: number;
  perQuarter: number;
  quarters: number;
}

export const accrualCalc = defineCalc<AccP>({
  kind: 'calc',
  id: 'accrual-prepayment',
  title: 'Owed, or paid ahead?',
  host: 'niamh',
  concept: 'accruals-prepayments',
  uses: ['recognition'],
  base: { kind: 'accrual', sales: 300000, rate: 2, paid: 5000, perQuarter: 4000, quarters: 5 },
  vary: (rng) => ({ kind: pickOne(rng, ['accrual', 'prepayment'] as const), sales: pickInt(rng, 100000, 500000, 10000), rate: pickOne(rng, [1, 2, 2.5, 3]), paid: 0, perQuarter: pickInt(rng, 2000, 8000, 500), quarters: pickInt(rng, 5, 6) }),
  build: (p) => {
    const accrual = p.kind === 'accrual';
    const expense = accrual ? (p.sales * p.rate) / 100 : 4 * p.perQuarter;
    const paid = accrual ? (p.paid || Math.round((expense * 0.8) / 100) * 100) : p.quarters * p.perQuarter;
    const bal = Math.abs(expense - paid);
    return {
      prompt: accrual
        ? [`Sales staff earn ${p.rate}% commission on sales. Sales for the year were ${eur(p.sales)}. By the year end we’d paid them ${eur(paid)}.`]
        : [`Rent is ${eur(p.perQuarter)} a quarter. During the year we paid ${p.quarters} quarters, ${eur(paid)}, because the next one fell due just before the year end.`],
      ask: accrual ? 'What accrual goes on the balance sheet?' : 'What prepayment goes on the balance sheet?',
      spot: {
        question: 'Asset or liability?',
        options: [
          { id: 'liab', label: 'A liability: we owe it' },
          { id: 'asset', label: 'An asset: we’ve paid ahead' },
        ],
        correct: [accrual ? 'liab' : 'asset'],
        explain: accrual ? 'We owe more than we’ve paid: an accrual, a liability.' : 'We’ve paid for a quarter not yet used: a prepayment, an asset.',
      },
      formula: accrual
        ? { options: ['accrual-expense', 'expense-is-paid', 'prepaid-expense'], correct: 'accrual-expense', explain: 'Expense = paid + closing accrual, so the accrual is expense − paid.' }
        : { options: ['prepaid-expense', 'expense-is-paid', 'accrual-expense'], correct: 'prepaid-expense', explain: 'Expense = paid − closing prepayment, so the prepayment is paid − expense.' },
      stepNames: { spot: 'Asset or liability?' },
      inputs: accrual
        ? [
            { key: 'E', symbol: '\\text{Expense}', label: 'Commission expense for the year', unit: 'eur', expected: expense, explain: `${p.rate}% × ${w0(p.sales)} = ${w0(expense)}.` },
            { key: 'P', symbol: '\\text{Paid}', label: 'Cash paid', unit: 'eur', expected: paid, explain: `${eur(paid)}.` },
          ]
        : [
            { key: 'P', symbol: '\\text{Paid}', label: 'Cash paid', unit: 'eur', expected: paid, explain: `${eur(paid)}.` },
            { key: 'E', symbol: '\\text{Expense}', label: 'Rent expense for the year (4 quarters)', unit: 'eur', expected: expense, explain: `4 × ${w0(p.perQuarter)} = ${w0(expense)}.` },
          ],
      solve: accrual ? (v) => v.E - v.P : (v) => v.P - v.E,
      answer: { label: accrual ? 'Accrual (liability)' : 'Prepayment (asset)', unit: 'eur', explain: `${w0(accrual ? expense : paid)} − ${w0(accrual ? paid : expense)} = ${w0(bal)}.` },
      decision: {
        question: 'What goes in the income statement?',
        options: [
          { id: 'exp', label: `${eur(expense)}, the cost of the year` },
          { id: 'paid', label: `${eur(paid)}, the cash paid` },
        ],
        correct: 'exp',
        why: whys('Matching: the expense is what belongs to the year, whenever it’s paid.', 'The income statement records cash paid.', 'Whichever is lower, to be prudent.'),
        correctWhy: 'w0',
        explain: `Expense ${eur(expense)}; ${accrual ? 'accrual' : 'prepayment'} ${eur(bal)}; cash ${eur(paid)}.`,
      },
      working: [`Expense = ${w0(expense)}; paid = ${w0(paid)}`, `${accrual ? 'Accrual' : 'Prepayment'} = ${w0(bal)} (${accrual ? 'liability' : 'asset'})`],
      hints: { spot: 'Have we paid more or less than belongs to the year?', formula: 'Expense, paid, and the balance between them.', answer: 'The difference between expense and cash.', decision: 'Matching.' },
      outcomes: {
        exp: { valueDelta: 500, news: 'Niamh ticks the accruals schedule.' },
        paid: { valueDelta: -500, news: 'Expenses are misstated in the draft.' },
      },
      cfoLine: `${accrual ? 'Accrual' : 'Prepayment'} ${eur(bal)}.`,
    };
  },
});

interface DepP {
  cost: number;
  residual: number;
  life: number;
  theoLife: number;
  item: string;
}

export const straightLineCalc = defineCalc<DepP>({
  kind: 'calc',
  id: 'straight-line',
  title: 'Spreading the cost',
  host: 'theo',
  concept: 'depreciation',
  base: { cost: 24000, residual: 4000, life: 5, theoLife: 10, item: 'embroidery machine' },
  vary: (rng) => {
    const cost = pickInt(rng, 6000, 60000, 1000);
    const life = pickInt(rng, 3, 8);
    return { cost, residual: pickInt(rng, 0, cost / 4, 500), life, theoLife: life * 2, item: pickOne(rng, ['embroidery machine', 'laser cutter', 'delivery van']) };
  },
  build: ({ cost, residual, life, theoLife, item }) => {
    const dep = A.straightLine(cost, residual, life);
    const theo = A.straightLine(cost, residual, theoLife);
    return {
      prompt: [`The new ${item} cost ${eur(cost)}. We expect to use it for ${life} years and sell it for ${eur(residual)} at the end.`, { who: 'theo', mood: 'happy', text: `Why not say ${theoLife} years? Lower depreciation, higher profit. Better bonus.` }],
      ask: 'What is the yearly straight-line depreciation charge?',
      formula: { options: ['straight-line', 'straight-line-no-residual', 'reducing-balance'], correct: 'straight-line', explain: '(Cost − residual value) ÷ useful life.' },
      inputs: [
        { key: 'C', symbol: '\\text{Cost}', label: 'Cost', unit: 'eur', expected: cost, explain: `${eur(cost)}.` },
        { key: 'R', symbol: '\\text{Residual}', label: 'Residual value', unit: 'eur', expected: residual, explain: `${eur(residual)}.` },
        { key: 'L', symbol: '\\text{Life}', label: 'Useful life (years)', unit: 'count', expected: life, explain: `${life} years: our honest estimate.` },
      ],
      solve: (v) => (v.C - v.R) / v.L,
      answer: { label: 'Yearly depreciation', unit: 'eur', explain: `(${w0(cost)} − ${w0(residual)}) ÷ ${life} = ${w0(dep)}.` },
      decision: {
        question: `Use Theo’s ${theoLife} years instead?`,
        options: [
          { id: 'no', label: 'No: use our best estimate' },
          { id: 'yes', label: 'Yes: it’s only an estimate' },
        ],
        correct: 'no',
        why: whys('Useful life must be a genuine estimate; stretching it to lift profit is earnings management.', 'Longer lives are always more prudent.', 'Depreciation doesn’t affect profit.'),
        correctWhy: 'w0',
        explain: `Theo’s ${theoLife} years would cut the charge to ${eur(theo)} and lift profit by ${eur(dep - theo)} a year, for no reason except his bonus.`,
      },
      working: [`Depreciation = (cost − residual) ÷ life = (${w0(cost)} − ${w0(residual)}) ÷ ${life} = €${w0(dep)} a year`],
      hints: { formula: 'Don’t forget the residual value.', answer: '(Cost − residual) ÷ life.', decision: 'Whose estimate is honest?' },
      outcomes: {
        no: { valueDelta: 1000, news: 'Niamh agrees the useful lives without comment.' },
        yes: { valueDelta: -2000, news: 'Niamh asks for evidence of the ten-year life. There isn’t any.' },
      },
      cfoLine: `Depreciation ${eur(dep)} a year.`,
    };
  },
});

interface InvP {
  lots: { qty: number; cost: number }[];
  sold: number;
  method: 'fifo' | 'avco';
}

export const inventoryCalc = defineCalc<InvP>({
  kind: 'calc',
  id: 'inventory-cost',
  title: 'Which silk did we use?',
  host: 'margaux',
  concept: 'inventory-methods',
  base: { lots: [{ qty: 100, cost: 100 }, { qty: 500, cost: 110 }, { qty: 800, cost: 120 }], sold: 900, method: 'fifo' },
  vary: (rng) => {
    const c0 = pickInt(rng, 20, 60);
    const lots = [{ qty: pickInt(rng, 50, 200, 10), cost: c0 }, { qty: pickInt(rng, 200, 600, 50), cost: c0 + pickInt(rng, 2, 8) }, { qty: pickInt(rng, 300, 800, 50), cost: c0 + pickInt(rng, 10, 20) }];
    const total = lots.reduce((s, l) => s + l.qty, 0);
    return { lots, sold: Math.round((total * (0.5 + rng() * 0.3)) / 10) * 10, method: pickOne(rng, ['fifo', 'avco'] as const) };
  },
  build: ({ lots, sold, method }) => {
    const r = A.inventoryCost(lots, sold, method);
    const fifo = A.inventoryCost(lots, sold, 'fifo');
    const avco = A.inventoryCost(lots, sold, 'avco');
    const total = lots.reduce((s, l) => s + l.qty, 0);
    const name = method === 'fifo' ? 'FIFO' : 'weighted average cost';
    return {
      prompt: [`Silk in metres. We started with ${lots[0].qty} m at ${eur(lots[0].cost)} a metre, bought ${lots[1].qty} m at ${eur(lots[1].cost)}, then ${lots[2].qty} m at ${eur(lots[2].cost)}. We used ${sold} m in the clothes we sold.`],
      ask: `What is cost of sales under ${name}?`,
      formula: { options: [method, method === 'fifo' ? 'avco' : 'fifo', 'lifo'], correct: method, explain: method === 'fifo' ? 'FIFO: the oldest metres are treated as used first.' : 'AVCO: total cost ÷ total metres, applied to the metres used.' },
      inputs: [
        { key: 'T', symbol: '\\text{Total cost}', label: 'Total cost of all the silk available', unit: 'eur', expected: lots.reduce((s, l) => s + l.qty * l.cost, 0), explain: lots.map((l) => `${l.qty} × ${l.cost}`).join(' + ') + '.' },
        { key: 'Q', symbol: '\\text{Metres}', label: 'Total metres available', unit: 'count', expected: total, explain: `${total} m.` },
        { key: 'S', symbol: '\\text{Used}', label: 'Metres used', unit: 'count', expected: sold, explain: `${sold} m.` },
      ],
      solve: method === 'avco' ? (v) => (v.T / v.Q) * v.S : (v) => A.inventoryCost(lots, v.S, 'fifo').cos,
      answer: { label: `Cost of sales (${name})`, unit: 'eur', explain: method === 'fifo' ? `Oldest first: ${w0(r.cos)}. Closing inventory ${w0(r.closing)}.` : `Average ${(Math.round(r.avg * 100) / 100).toLocaleString('en-GB')} a metre × ${sold} = ${w0(r.cos)}.` },
      decision: {
        question: 'Prices have been rising all year. Which method shows the higher profit?',
        options: [
          { id: 'fifo', label: 'FIFO' },
          { id: 'avco', label: 'AVCO' },
        ],
        correct: 'fifo',
        why: whys('FIFO puts the older, cheaper costs into cost of sales.', 'AVCO always gives the lowest cost of sales.', 'The method makes no difference to profit.'),
        correctWhy: 'w0',
        explain: `FIFO cost of sales ${eur(fifo.cos)} against AVCO ${eur(avco.cos)}: FIFO profit is ${eur(avco.cos - fifo.cos)} higher.`,
      },
      working: method === 'fifo' ? [`FIFO cost of sales = ${w0(r.cos)}`, `Closing inventory = ${w0(r.closing)}`] : [`Average = ${w0(lots.reduce((s, l) => s + l.qty * l.cost, 0))} ÷ ${total} = ${(Math.round(r.avg * 100) / 100).toLocaleString('en-GB')}`, `Cost of sales = ${sold} × ${(Math.round(r.avg * 100) / 100).toLocaleString('en-GB')} = ${w0(r.cos)}`],
      hints: { formula: 'Read which method the question names.', inputs: 'Total cost and metres of everything available, then metres used.', answer: method === 'fifo' ? 'Take the oldest metres first until you reach the metres used.' : 'Average cost × metres used.', decision: 'In rising prices, which costs are oldest and cheapest?' },
      outcomes: { fifo: { valueDelta: 500, news: 'The board understands why margins jumped with silk prices.' }, avco: { valueDelta: -500, news: 'The board misreads the margin.' } },
      cfoLine: `Cost of sales ${eur(r.cos)} (${name}).`,
    };
  },
});

export const recognitionSort: ClassifyProblem = {
  kind: 'classify',
  id: 'recognition-sort',
  title: 'This year or not?',
  host: 'niamh',
  concept: 'recognition',
  prompt: ['Year end is 30 September. Does each of these belong in this year’s income statement?'],
  categories: [
    { id: 'yes', label: 'This year' },
    { id: 'no', label: 'Not this year' },
  ],
  show: 6,
  items: [
    { text: 'Coats delivered to a boutique on 28 September, invoice to be paid in November', category: 'yes', why: 'Delivered and control passed: revenue now.' },
    { text: 'An order placed on 29 September for delivery in October', category: 'no', why: 'Nothing delivered yet. An order isn’t a sale.' },
    { text: 'A deposit received in September for the spring collection', category: 'no', why: 'A liability until the goods are delivered.' },
    { text: 'September’s electricity, billed in October', category: 'yes', why: 'Used this year: accrue it.' },
    { text: 'Insurance paid in September for October to March', category: 'no', why: 'A prepayment for next year.' },
    { text: 'Overtime worked in September, paid in October', category: 'yes', why: 'Matched to the work done this year.' },
    { text: 'Depreciation on the cutting tables for the year', category: 'yes', why: 'This year’s share of their cost.' },
  ],
};

export const discretionSort: ClassifyProblem = {
  kind: 'classify',
  id: 'discretion-sort',
  title: 'Which way does profit move?',
  host: 'niamh',
  concept: 'discretion',
  prompt: [
    'Theo’s bonus is 5% of profit above a threshold, and he leaves next spring. Idris is on a long-term plan that pays more if profits grow over the next two years.',
    'Each of these is a judgement call. Does it push this year’s profit up or down?',
  ],
  categories: [
    { id: 'up', label: 'Profit up' },
    { id: 'down', label: 'Profit down' },
  ],
  show: 7,
  items: [
    { concept: 'provisions', text: 'Make a specific provision for a big customer who is 90 days overdue and in talks with its banks', category: 'down', why: 'A new provision is an expense.' },
    { concept: 'provisions', text: 'Release most of last year’s litigation provision, now that a smaller settlement looks likely', category: 'up', why: 'Releasing a provision adds back to profit.' },
    { concept: 'provisions', text: 'Cut the general doubtful-debt provision from 2.5% to 1% of receivables', category: 'up', why: 'A smaller provision, so a smaller expense.' },
    { concept: 'depreciation', text: 'Shorten the oldest machine’s useful life to match the faults it’s showing', category: 'down', why: 'A shorter life means a bigger charge now.' },
    { concept: 'depreciation', text: 'Lengthen all the machines’ useful lives', category: 'up', why: 'Smaller depreciation each year.' },
    { concept: 'provisions', text: 'Write down imported parts that may fail safety standards', category: 'down', why: 'A write-down is an expense.' },
    { text: 'Capitalise this year’s repairs as an asset instead of expensing them', category: 'up', why: 'The cost moves to the balance sheet, out of this year’s profit.' },
    { text: 'Book a sale when the order is taken, not when the goods are delivered', category: 'up', why: 'Revenue recognised early.' },
    { text: 'Leave out the accrual for staff bonuses earned this year', category: 'up', why: 'An expense missing from the year.' },
  ],
};

export const discretionBrief: BriefProblem = {
  kind: 'brief',
  id: 'discretion-brief',
  title: '“What would you like it to be?”',
  host: 'idris',
  concept: 'discretion',
  prompt: [
    { who: 'idris', text: 'I asked Margaux what our profit was. She said, “What would you like it to be?” I think she was joking.' },
    { who: 'niamh', text: 'Half joking. Show him where directors have room to move.' },
  ],
  question: 'Describe three examples of where directors can use discretion on accounting policies or estimates in a way that affects profit.',
  cap: 3,
  cards: [
    { text: 'Depreciation: choosing useful lives, residual values and the method changes the yearly charge.', kind: 'key', why: 'A core estimate.' },
    { text: 'Provisions: how much to provide for doubtful debts, legal claims or warranties, and when to release them.', kind: 'key', why: 'Judgement on uncertain amounts.' },
    { text: 'Inventory: the costing method (FIFO or AVCO) and whether, and how far, to write down slow-moving or obsolete stock.', kind: 'key', why: 'Moves cost of sales and closing inventory.' },
    { text: 'Revenue recognition: deciding when control has passed, so a sale lands in this year or next.', kind: 'key', why: 'Timing of revenue.' },
    { text: 'Capitalising or expensing costs, such as repairs or development spending.', kind: 'key', why: 'Moves cost between the balance sheet and profit.' },
    { text: 'Directors can choose the cash balance at the year end.', kind: 'trap', why: 'Cash is a fact, checked against the bank.' },
    { text: 'Directors set the tax rate the business pays.', kind: 'trap', why: 'Tax law sets that.' },
    { text: 'Profit is a precise fact, so there is no discretion.', kind: 'trap', why: 'Profit rests on estimates.' },
  ],
  model:
    'Profit depends on estimates and policy choices. First, depreciation: directors estimate useful lives and residual values, so lengthening a life lowers the yearly charge and raises profit. Second, provisions: the size of doubtful-debt, legal or warranty provisions is a judgement, and releasing one that is no longer needed raises profit. Third, inventory: the costing method and decisions to write down slow-moving stock change cost of sales. The timing of revenue recognition and capitalising rather than expensing costs give further room.',
};

export const mitigantsBrief: BriefProblem = {
  kind: 'brief',
  id: 'mitigants-brief',
  title: 'Who keeps them honest?',
  host: 'niamh',
  concept: 'discretion',
  prompt: [{ who: 'aoife', text: 'So directors can move profit. What stops them going too far?' }],
  question: 'Describe five measures the accounting and business communities use to reduce the impact of directors’ discretion.',
  cap: 5,
  cards: [
    { text: 'External audit: independent auditors give an opinion on whether the accounts show a true and fair view.', kind: 'key', why: 'The main external check.' },
    { text: 'Accounting standards (IFRS) narrow the choices available and set rules for estimates and disclosures.', kind: 'key', why: 'Limits the menu.' },
    { text: 'The consistency convention, plus disclosure of accounting policies and any changes to them and their effect.', kind: 'key', why: 'Users can see and allow for changes.' },
    { text: 'Corporate governance: audit committees and independent non-executive directors who review judgements.', kind: 'key', why: 'Oversight inside the company.' },
    { text: 'Regulators and company law, with penalties for misleading accounts, and enforcement reviews of published accounts.', kind: 'key', why: 'Legal teeth.' },
    { text: 'Professional bodies’ codes of ethics binding accountants who prepare the accounts.', kind: 'key', why: 'Personal accountability.' },
    { text: 'Bonuses based on cash or long-term performance rather than one year’s profit.', kind: 'filler', why: 'Helps reduce the motive, but it’s a company pay decision rather than a community-wide measure.' },
    { text: 'Shareholders can rewrite the accounts at the AGM.', kind: 'trap', why: 'They can’t; they receive and vote on them.' },
  ],
  model:
    'Several measures limit directors’ discretion. External auditors give an independent opinion on whether the accounts are true and fair. Accounting standards narrow the policies available and require disclosures. The consistency convention, with disclosure of accounting policies and changes, lets users see when choices move profit. Audit committees and independent non-executive directors review key judgements. Regulators and company law punish misleading accounts, and professional codes of ethics bind the accountants who prepare them. Even so, estimates remain judgements, so users should compare profit with cash flow and read the policy notes.',
};

/** The in-class bonus case: five judgement calls, a range of defensible profits, and two directors pulling opposite ways. */
export const bullBear: JudgementProblem = {
  kind: 'judgement',
  id: 'bull-bear',
  title: 'Two bonuses, one profit',
  host: 'niamh',
  concept: 'discretion',
  uses: ['provisions', 'depreciation'],
  prompt: [
    { who: 'niamh', text: 'A client of mine, Bull and Bear Ltd. Profit before year-end adjustments: €15,500,000. Five judgement calls are still open.' },
    { who: 'niamh', text: 'Bill gets 5% of profit above €10m, and retires in March. Ben gets €100,000 if this year’s profit tops €8m, and €200,000 if next year’s tops €12m.' },
    { who: 'margaux', text: 'So Bill wants profit high now, and Ben wants it just over €8m, with something saved for next year. Ignore tax. What’s the honest number?' },
  ],
  ask: 'For each item, choose the treatment you could defend to an auditor. Then work out the profit you would report.',
  startProfit: 15500000,
  startLabel: 'starting from',
  items: [
    {
      id: 'debtor',
      title: 'A big customer in trouble',
      situation: 'Underwater Ltd owes €1,500,000, now over 90 days overdue. It is in talks with its banks about refinancing. No bankruptcy yet; if it fails, recovery could be 10c to 40c in the euro.',
      options: [
        { id: 'none', label: 'No provision: they haven’t gone bust', effect: 0, verdict: 'stretch', why: '90 days overdue and refinancing talks are evidence the debt is impaired. Prudence says provide.' },
        { id: 'p60', label: 'Provide 60% (€900,000), assuming 40c recovery', effect: -900000, verdict: 'defensible', why: 'The optimistic end of the range. Defensible if you can argue recovery will be good.' },
        { id: 'p75', label: 'Provide 75% (€1,125,000), the midpoint', effect: -1125000, verdict: 'best', why: 'With a range and no better evidence, the midpoint is the best estimate.' },
        { id: 'p90', label: 'Provide 90% (€1,350,000), assuming 10c recovery', effect: -1350000, verdict: 'defensible', why: 'The prudent end of the range. Defensible.' },
        { id: 'p100', label: 'Write the whole €1,500,000 off', effect: -1500000, verdict: 'stretch', why: 'No bankruptcy and some recovery expected: writing off the lot overstates the loss, and stores profit for later.' },
      ],
    },
    {
      id: 'general',
      title: 'A general doubtful-debt provision',
      situation: 'The CFO suggests a new policy: provide 2.5% of trade receivables. Year-end receivables are €15,500,000, including Underwater Ltd.',
      options: [
        { id: 'none', label: 'No general provision', effect: 0, verdict: 'defensible', why: 'Without evidence that the other debts are at risk, a general provision needs a basis. Defensible, if the history supports it.' },
        { id: 'rest', label: '2.5% of the €14,000,000 not already provided for (€350,000)', effect: -350000, verdict: 'best', why: 'Applies the policy without counting Underwater twice.' },
        { id: 'all', label: '2.5% of all €15,500,000 (€387,500)', effect: -387500, verdict: 'stretch', why: 'Provides for Underwater twice: it already has its own provision.' },
      ],
    },
    {
      id: 'stock',
      title: 'Parts that may fail EU safety rules',
      situation: 'Imported parts in stock at €2,200,000. An EU ruling, highly likely to be adverse, may find they don’t meet safety standards. They were bought on sale or return; the maker only sells into the EU.',
      options: [
        { id: 'keep', label: 'Keep them at cost and wait for the ruling', effect: 0, verdict: 'stretch', why: 'Ignores a highly likely adverse ruling.' },
        { id: 'return', label: 'Return them under sale or return now (no loss), and disclose the risk', effect: 0, verdict: 'best', why: 'The returns right is the way to realise value. Use it before the ruling.' },
        { id: 'half', label: 'Write them down by half (€1,100,000)', effect: -1100000, verdict: 'defensible', why: 'Prudent if the maker may not be able to refund, since it only sells into the EU.' },
        { id: 'all', label: 'Write them off in full (€2,200,000)', effect: -2200000, verdict: 'stretch', why: 'Ignores the right to return them.' },
      ],
    },
    {
      id: 'line',
      title: 'The faulty production line',
      situation: 'Four matching lines, depreciated straight line over 7 years. The oldest, 4 years old, keeps faulting and will need replacing in 12 months. Moving it to a 5-year life costs €400,000 this year; moving all four costs €2,000,000.',
      options: [
        { id: 'none', label: 'Change nothing', effect: 0, verdict: 'stretch', why: 'There’s clear evidence the oldest line’s life is shorter than 7 years.' },
        { id: 'old', label: 'Shorten the oldest line only (€400,000)', effect: -400000, verdict: 'best', why: 'The evidence is about that line.' },
        { id: 'all', label: 'Shorten all four lines (€2,000,000)', effect: -2000000, verdict: 'stretch', why: 'No evidence the other three are failing: a “big bath” that stores profit for later.' },
      ],
    },
    {
      id: 'legal',
      title: 'Last year’s litigation provision',
      situation: 'A €6,500,000 provision was made last year. The lawyers now expect to settle, probably for €1,500,000 to €2,000,000.',
      options: [
        { id: 'keep', label: 'Keep the full €6,500,000', effect: 0, verdict: 'stretch', why: 'No longer the best estimate. An excess provision is a hidden reserve.' },
        { id: 'to2', label: 'Reduce it to €2,000,000 (release €4,500,000)', effect: 4500000, verdict: 'best', why: 'The top of the lawyers’ range: prudent and supportable.' },
        { id: 'to175', label: 'Reduce it to €1,750,000 (release €4,750,000)', effect: 4750000, verdict: 'defensible', why: 'The midpoint of the range: a fair best estimate.' },
        { id: 'to15', label: 'Reduce it to €1,500,000 (release €5,000,000)', effect: 5000000, verdict: 'stretch', why: 'The bottom of the range, with settlement not yet agreed: optimistic.' },
        { id: 'all', label: 'Release all of it', effect: 6500000, verdict: 'wrong', why: 'A settlement is still expected. The obligation hasn’t gone away.' },
      ],
    },
  ],
  sides: [
    { who: 'theo', wants: 'high', label: 'Bill' },
    { who: 'idris', wants: 'low', floor: 8000000, label: 'Ben' },
  ],
  model:
    'Profit depends on judgement. Taking the best estimate for each: provide 75% (€1.125m) against Underwater; apply the 2.5% policy to the €14m of other debts (€0.35m); return the imported parts under sale or return; shorten the life of the faulty line only (€0.4m); and reduce the litigation provision to the top of the lawyers’ range, €2m, releasing €4.5m. Reported profit: €18.125m. Bill, retiring, would push every choice upwards (no provisions, release the whole litigation provision) for about €22m. Ben would “big bath” this year by writing off everything and keeping the litigation provision, holding profit just over his €8m threshold and storing profit to release next year. Auditors, accounting standards and the consistency rule are there to keep both of them inside the defensible range.',
};

export const mitigantsOpinion: BriefProblem = {
  kind: 'brief',
  id: 'mitigants-opinion',
  title: 'Is it enough?',
  host: 'aoife',
  concept: 'discretion',
  prompt: [{ who: 'aoife', text: 'So: auditors, standards, governance, regulators. Do they actually protect people like me from a director who wants to flatter the profit?' }],
  question: 'In your opinion, do these measures sufficiently protect the users of accounts from the potential for directors to manipulate profits? Give reasons.',
  cap: 4,
  cards: [
    { text: 'They reduce the risk but can’t remove it: audit gives reasonable, not absolute, assurance, and works from samples.', kind: 'key', why: 'A balanced view of audit.' },
    { text: 'Standards still leave room for judgement in estimates (lives, provisions), and judgement is where profit can be nudged.', kind: 'key', why: 'The root of the problem is estimates.' },
    { text: 'Governance only works if the non-executives are genuinely independent and well informed.', kind: 'key', why: 'A condition on a safeguard.' },
    { text: 'Regulators and the law mostly act after the event, so they deter more than they prevent.', kind: 'key', why: 'Timing of enforcement.' },
    { text: 'Users can protect themselves: read the accounting policies, look for changes, and compare profit with operating cash flow.', kind: 'key', why: 'The user’s own checks.' },
    { text: 'My conclusion is that they give significant but not complete protection, so users should still read critically.', kind: 'key', why: 'An opinion has to reach a conclusion.' },
    { text: 'Yes, completely: the accounts are audited, so profit can’t be manipulated.', kind: 'trap', why: 'Audit isn’t a guarantee.' },
    { text: 'No, accounts are useless because directors always lie.', kind: 'trap', why: 'Overstated: most accounts are reliable.' },
  ],
  model:
    'In my opinion the measures give significant but not complete protection. Audit gives reasonable, not absolute, assurance and relies on samples and on management’s own estimates. Standards narrow the choices but still leave room for judgement over lives, provisions and write-downs, and that judgement is where profit can be nudged. Governance depends on non-executives being independent and well informed, and regulators usually act after the event. So the measures reduce the risk rather than remove it, and users should still read the accounting policies, look for changes and compare profit with operating cash flow.',
};

export const ACT3_PROBLEMS: Problem[] = [...TRANS_PROBLEMS, bullBear, mitigantsOpinion, isBuild, cosCalc, accrualCalc, straightLineCalc, inventoryCalc, recognitionSort, discretionSort, discretionBrief, mitigantsBrief];
