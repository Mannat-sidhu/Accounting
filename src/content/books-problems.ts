// Rounds built on Atelier Noor's own books. The chapter versions use the house's year (YEAR_BASE), so each chapter
// adds a layer to the same figures; replays and practice draw a fresh year or a single month of the same business.
import { type Book, cashFlow, effectOf, incomeStatement, openingPosition, position } from '../engine/books';
import { eur } from '../engine/format';
import type { ClassifyItem, ClassifyProblem, StatementItem, StatementSection, TableDiagram } from '../engine/types';
import { MONTH_BASE, type MonthP, YEAR_BASE, type YearP, monthBook, varyMonth, varyYear, yearBook, yearFigures } from './books';
import { defineStatement, table, w0, whys } from './helpers';

const it = (id: string, label: string, amount: number, section: string, sign: 1 | -1, why: string, accept?: string[]): StatementItem => ({ id, label, amount: Math.abs(amount), section, sign, why, ...(accept ? { accept } : {}) });

/** The numbered list of what happened, as a data panel. */
export const happened = (book: Book, title = `What happened in ${book.period}`): TableDiagram =>
  table(title, ['#', 'Event'], book.events.map((e, i) => [String(i + 1), e.text]));

const openingTable = (book: Book): TableDiagram => {
  const o = openingPosition(book);
  return table(`Balances on ${book.start} (€)`, ['', '€'], [
    ['Equipment at cost', w0(o.equipCost)],
    ['Accumulated depreciation', w0(o.accDep)],
    ['Inventory', w0(o.inv)],
    ['Trade receivables', w0(o.rec)],
    ...(o.prepaid ? [['Prepayments', w0(o.prepaid)]] : []),
    ['Cash at bank', w0(o.cash)],
    ['Trade payables', w0(o.pay)],
    ...(o.tax ? [['Tax owed', w0(o.tax)]] : []),
    ['Bank loan', w0(o.loan)],
    ['Share capital', w0(o.shareCap)],
    ['Retained earnings', w0(o.retained)],
  ]);
};

const SFP_SECTIONS: StatementSection[] = [
  { id: 'nca', label: 'Non-current assets', subtotal: 'Total non-current assets' },
  { id: 'ca', label: 'Current assets', subtotal: 'Total current assets' },
  { id: 'eq', label: 'Equity', subtotal: 'Total equity' },
  { id: 'ncl', label: 'Non-current liabilities', subtotal: 'Total non-current liabilities' },
  { id: 'cl', label: 'Current liabilities', subtotal: 'Total current liabilities' },
];
const SFP_TOTALS = [
  { key: 'ta', label: 'Total assets', calc: (s: Record<string, number>) => s.nca + s.ca, explain: 'Non-current + current assets.' },
  { key: 'tel', label: 'Total equity and liabilities', calc: (s: Record<string, number>) => s.eq + s.ncl + s.cl, explain: 'Equity + non-current + current liabilities. It matches total assets.' },
];

// ---------------------------------------------------------------- Chapter II: the opening balance sheet

export const booksSfpOpen = defineStatement<YearP>({
  kind: 'statement',
  id: 'books-sfp-open',
  title: 'Where the year starts',
  host: 'margaux',
  concept: 'sfp-layout',
  uses: ['current-noncurrent', 'equation'],
  base: YEAR_BASE,
  vary: varyYear,
  build: (p) => {
    const book = yearBook(p);
    const o = openingPosition(book);
    const items: StatementItem[] = [
      it('eq', `Sewing and cutting equipment (cost ${w0(o.equipCost)} less depreciation ${w0(o.accDep)})`, o.nbv, 'nca', 1, 'Used for years: non-current, shown at cost less depreciation.'),
      it('inv', 'Inventory: fabric and finished pieces', o.inv, 'ca', 1, 'Sold within the year: current.'),
      it('rec', 'Trade receivables: boutiques that owe us', o.rec, 'ca', 1, 'Collected within weeks: current.'),
      it('cash', 'Cash at bank', o.cash, 'ca', 1, 'Cash is current.'),
      it('sc', 'Share capital', o.shareCap, 'eq', 1, 'What the owners put in.'),
      it('re', 'Retained earnings', o.retained, 'eq', 1, 'Past profits kept in the business.'),
      it('loan', 'Bank loan, repayable over five years', o.loan, 'ncl', 1, 'Most of it is due after more than a year.'),
      it('pay', 'Trade payables: suppliers we owe', o.pay, 'cl', 1, 'Due within weeks.'),
      it('tax', 'Tax owed on last year’s profit', o.tax, 'cl', 1, 'Due within the year.'),
      it('sales', 'Sales we expect to make this year', p.sales, 'none', 1, 'Not yet earned and not controlled: nothing to record.'),
      it('team', 'Our skilled team', 60000, 'none', 1, 'We don’t control people, and there’s no reliable cost: fails the asset test.'),
    ];
    const debt = o.pay + o.tax + o.loan;
    return {
      prompt: [
        { who: 'margaux', text: `This is the year we’ll follow from start to finish. Every chapter adds a layer to the same books, so get the starting point right.` },
        { who: 'margaux', text: `Here’s where Atelier Noor stands on ${book.start}. Theo has slipped a couple of wishes onto the list.` },
      ],
      ask: `Lay out the balance sheet on ${book.start}, then check it balances.`,
      heading: `Atelier Noor: statement of financial position at ${book.start} (€)`,
      data: openingTable(book),
      sections: SFP_SECTIONS,
      items,
      signed: false,
      totals: SFP_TOTALS,
      decision: {
        question: 'Idris asks what the business is worth to its owners, on paper.',
        options: [
          { id: 'eq', label: `${eur(o.equity)}: total equity` },
          { id: 'ta', label: `${eur(o.ta)}: total assets` },
        ],
        correct: 'eq',
        why: whys('Equity = assets − liabilities: what’s left after everyone we owe is paid.', 'The owners own every asset.', 'Assets plus liabilities.'),
        correctWhy: 'w0',
        explain: `Net assets = ${w0(o.ta)} − ${w0(debt)} = ${w0(o.equity)}, the same as total equity. This ${eur(o.equity)} is the figure every later chapter builds on.`,
      },
      working: [`Total assets = ${w0(o.nbv)} + ${w0(o.ca)} = ${w0(o.ta)}`, `Total equity and liabilities = ${w0(o.equity)} + ${w0(o.loan)} + ${w0(o.cl)} = ${w0(o.tel)}`],
      hints: { place: 'Two lines fail the asset test: something not yet earned and something we don’t control.', subtotals: 'Add each section.', totals: 'Both sides should match.', decision: 'Equity = assets − liabilities.' },
      outcomes: {
        eq: { valueDelta: 1500, news: 'The opening balance sheet is signed off. The year can begin.' },
        ta: { valueDelta: -1000, news: 'Idris quotes total assets to a friend as “what we’re worth”. Niamh winces.' },
      },
    };
  },
});

// ---------------------------------------------------------------- Chapter III: the year's income statement

const IS_SECTIONS: StatementSection[] = [
  { id: 'trade', label: 'Trading', subtotal: 'Gross profit' },
  { id: 'opex', label: 'Operating expenses', subtotal: 'Total operating expenses' },
  { id: 'fin', label: 'Finance costs', subtotal: 'Net finance costs' },
  { id: 'tax', label: 'Tax', subtotal: 'Tax charge' },
];

export const booksIs = defineStatement<YearP>({
  kind: 'statement',
  id: 'books-is',
  title: 'The year’s profit',
  host: 'theo',
  concept: 'is-layout',
  uses: ['cost-of-sales', 'accruals-prepayments', 'recognition'],
  base: YEAR_BASE,
  vary: varyYear,
  build: (p) => {
    const book = yearBook(p);
    const f = yearFigures(p);
    const is = incomeStatement(book);
    const g = is.gain;
    const items: StatementItem[] = [
      it('rev', 'Sales revenue', is.revenue, 'trade', 1, 'Every sale delivered this year, paid for or not.'),
      it('cos', `Cost of sales (${w0(p.open.inv)} + ${w0(p.purchases)} − ${w0(p.closeInv)})`, is.cos, 'trade', -1, 'Opening stock plus purchases less closing stock: the cost of what was sold.'),
      it('wages', 'Wages', is.wages, 'opex', -1, 'A running cost.'),
      it('rent', 'Studio rent', is.rent, 'opex', -1, 'A running cost.'),
      it('util', 'Heat, light and insurance', is.utilities, 'opex', -1, 'A running cost.'),
      it('comm', `Sales commission (${p.commissionRate}% of sales)`, is.commission, 'opex', -1, 'The whole year’s commission, including the part still owed (an accrual).'),
      it('dep', 'Depreciation', is.dep, 'opex', -1, 'The year’s share of the equipment’s cost. No cash moves.'),
      it('gain', `${g >= 0 ? 'Gain' : 'Loss'} on sale of the ${p.sold.item}`, g, 'opex', g >= 0 ? 1 : -1, `Price ${w0(p.sold.proceeds)} less the ${w0(f.nbvSold)} the books said it was worth. It sits above operating profit.`),
      it('int', 'Loan interest', is.interest, 'fin', -1, 'The cost of borrowing: below operating profit.'),
      it('tax', 'Tax on this year’s profit', is.tax, 'tax', -1, 'This year’s charge, even though it’s paid next year.'),
      it('paid', 'Cash paid to suppliers', f.payments, 'none', -1, 'Leave it out: the expense is cost of sales, not what was paid.'),
      it('capex', 'New sewing machines', p.capex, 'none', -1, 'Leave it out: an asset. Only its depreciation is an expense.'),
      it('loan', 'Loan repaid', p.loanRepaid, 'none', -1, 'Leave it out: it shrinks a liability. Only interest is an expense.'),
      it('oldtax', 'Last year’s tax bill, paid this year', p.open.tax, 'none', -1, 'Leave it out: it was last year’s expense.'),
      it('div', 'Dividend paid', p.dividend, 'none', -1, 'Leave it out: a share of profit, not a cost of making it.'),
    ];
    return {
      prompt: [
        { who: 'theo', mood: 'happy', text: 'The year’s done! Everything that happened is on the list. Take all the money that went out away from sales and that’s our profit, right?' },
        { who: 'margaux', text: 'Not everything that left the bank is an expense, and not every expense left the bank. Same year, same list. Sort it.' },
      ],
      ask: 'Build the income statement for the year: operating profit, profit before tax and profit for the year.',
      heading: 'Atelier Noor: income statement for the year to 31 December (€)',
      data: happened(book),
      sections: IS_SECTIONS,
      items,
      signed: false,
      totals: [
        { key: 'op', label: 'Operating profit', calc: (s) => s.trade + s.opex, explain: 'Gross profit less operating expenses (plus the gain).' },
        { key: 'pbt', label: 'Profit before tax', calc: (s) => s.trade + s.opex + s.fin, explain: 'Operating profit less interest.' },
        { key: 'pat', label: 'Profit for the year', calc: (s) => s.trade + s.opex + s.fin + s.tax, explain: 'Profit before tax less the tax charge.' },
      ],
      decision: {
        question: `Profit for the year is ${eur(is.profit)}. Where does it go on the balance sheet?`,
        options: [
          { id: 're', label: 'Into retained earnings, less the dividend paid' },
          { id: 'cash', label: 'Into cash: profit is the money we made' },
        ],
        correct: 're',
        why: whys('Profit belongs to the owners, so it adds to equity. The dividend hands part of it back.', 'Profit and cash are the same thing measured twice.', 'It goes to share capital.'),
        correctWhy: 'w0',
        explain: `Retained earnings: ${w0(openingPosition(book).retained)} + ${w0(is.profit)} − ${w0(p.dividend)} = ${w0(position(book).retained)}. Cash is a different story, and Chapter IV tells it.`,
      },
      working: [
        `Gross profit = ${w0(is.revenue)} − ${w0(is.cos)} = ${w0(is.gp)}`,
        `Operating profit = ${w0(is.gp)} − ${w0(is.opex)} ${g >= 0 ? '+' : '−'} ${w0(Math.abs(g))} = ${w0(is.op)}`,
        `Profit before tax = ${w0(is.op)} − ${w0(is.interest)} = ${w0(is.pbt)}`,
        `Profit for the year = ${w0(is.pbt)} − ${w0(is.tax)} = ${w0(is.profit)}`,
      ],
      hints: {
        place: 'Five lines are cash going out that aren’t this year’s expenses: an asset, a loan, last year’s bill, a payout to owners, and paying suppliers.',
        subtotals: 'Trading: sales less cost of sales. Then the running costs, then interest, then tax.',
        totals: 'Operating profit, then less interest, then less tax.',
        decision: 'Who does profit belong to?',
      },
      outcomes: {
        re: { valueDelta: 1500, news: 'Niamh signs off the income statement. Theo asks why the bank balance is so much smaller than the profit. Good question.' },
        cash: { valueDelta: -1500, news: 'Theo plans a party with the profit. The bank balance disagrees.' },
      },
    };
  },
});

// ---------------------------------------------------------------- Chapter III: the closing balance sheet, linked

export const booksSfp = defineStatement<YearP>({
  kind: 'statement',
  id: 'books-sfp',
  title: 'Where the year ends',
  host: 'niamh',
  concept: 'transactions',
  uses: ['sfp-layout', 'is-layout', 'dual-effect'],
  base: YEAR_BASE,
  vary: varyYear,
  build: (p) => {
    const book = yearBook(p);
    const o = openingPosition(book);
    const c = position(book);
    const is = incomeStatement(book);
    const items: StatementItem[] = [
      it('eq', `Equipment (cost ${w0(c.equipCost)} less depreciation ${w0(c.accDep)})`, c.nbv, 'nca', 1, `Cost: ${w0(o.equipCost)} + ${w0(p.capex)} bought − ${w0(p.sold.cost)} sold. Depreciation: ${w0(o.accDep)} + ${w0(p.dep)} − ${w0(p.sold.ad)} on the one sold.`),
      it('inv', 'Inventory', c.inv, 'ca', 1, 'From the year-end stock count.'),
      it('rec', 'Trade receivables', c.rec, 'ca', 1, `${w0(o.rec)} at the start + ${w0(p.sales)} of sales − ${w0(yearFigures(p).receipts)} received.`),
      it('cash', 'Cash at bank', c.cash, 'ca', 1, 'Opening cash plus every cash line on the list.'),
      it('sc', 'Share capital', c.shareCap, 'eq', 1, `${w0(o.shareCap)} + ${w0(p.shares)} new shares.`),
      it('re', `Retained earnings (${w0(o.retained)} + profit ${w0(is.profit)} − dividend ${w0(p.dividend)})`, c.retained, 'eq', 1, 'This is where the income statement joins the balance sheet.'),
      it('loan', 'Bank loan', c.loan, 'ncl', 1, `${w0(o.loan)} less ${w0(p.loanRepaid)} repaid.`),
      it('pay', 'Trade payables', c.pay, 'cl', 1, 'Owed to suppliers.'),
      it('accr', 'Commission owed (accrual)', c.accr, 'cl', 1, 'An expense already in profit, not yet paid: a liability.'),
      it('tax', 'Tax owed', c.tax, 'cl', 1, 'This year’s charge, paid next year.'),
      it('profit', 'Profit for the year', is.profit, 'none', 1, 'Leave it out as a line of its own: it’s already inside retained earnings. Counting it twice is the classic slip.'),
      it('sales', 'Sales revenue', is.revenue, 'none', 1, 'An income statement figure, not a balance.'),
    ];
    return {
      prompt: [
        { who: 'niamh', text: 'Year end. Same list of what happened, same opening balances. I want the closing balance sheet, and I want it to agree with your income statement.' },
        { who: 'margaux', text: 'Every event moved two things. Follow each one into the balances. The profit arrives through retained earnings.' },
      ],
      ask: 'Lay out the balance sheet at 31 December and check it balances.',
      heading: 'Atelier Noor: statement of financial position at 31 December (€)',
      data: happened(book),
      sections: SFP_SECTIONS,
      items,
      signed: false,
      totals: SFP_TOTALS,
      decision: {
        question: `Profit was ${eur(is.profit)}, but cash went from ${eur(o.cash)} to ${eur(c.cash)}. What’s the honest explanation?`,
        options: [
          { id: 'flows', label: 'Profit isn’t cash: machines, loan repayments, dividends and working capital used it' },
          { id: 'error', label: 'There must be a mistake: profitable businesses gain cash' },
        ],
        correct: 'flows',
        why: whys('Several cash payments never touch profit, and some expenses never touch cash.', 'Cash always moves with profit over a full year.', 'Depreciation took the cash.'),
        correctWhy: 'w0',
        explain: `Both statements come from the same list, and they still disagree on purpose. Chapter IV builds the bridge: the statement of cash flows.`,
      },
      working: [`Total assets = ${w0(c.nbv)} + ${w0(c.ca)} = ${w0(c.ta)}`, `Equity = ${w0(c.shareCap)} + ${w0(c.retained)} = ${w0(c.equity)}`, `Total equity and liabilities = ${w0(c.equity)} + ${w0(c.loan)} + ${w0(c.cl)} = ${w0(c.tel)}`],
      hints: {
        place: 'Two lines are income statement figures. Profit is already inside retained earnings.',
        subtotals: 'Add each section.',
        totals: 'If it doesn’t balance, look at retained earnings first.',
        decision: 'List the cash payments that never appeared as expenses.',
      },
      outcomes: {
        flows: { valueDelta: 2000, news: 'Niamh signs off the year. Aoife at the bank asks for the cash flow statement next.' },
        error: { valueDelta: -1000, news: 'A week lost hunting for an error that isn’t there.' },
      },
    };
  },
});

// ---------------------------------------------------------------- Chapter IV: the year's cash flow

const FLOW_SECTIONS: StatementSection[] = [
  { id: 'op', label: 'Cash flows from operating activities', subtotal: 'Net cash from operating activities' },
  { id: 'inv', label: 'Cash flows from investing activities', subtotal: 'Net cash from investing activities' },
  { id: 'fin', label: 'Cash flows from financing activities', subtotal: 'Net cash from financing activities' },
];

const wcItem = (id: string, name: string, d: number, asset: boolean) =>
  it(id, `${d >= 0 ? 'Increase' : 'Decrease'} in ${name}`, d, 'op', (asset ? (d >= 0 ? -1 : 1) : d >= 0 ? 1 : -1) as 1 | -1, asset ? (d >= 0 ? 'More cash tied up: deduct.' : 'Cash released: add.') : d >= 0 ? 'Cash kept back from creditors: add.' : 'We paid out more than we were charged: deduct.');

export const booksScf = defineStatement<YearP>({
  kind: 'statement',
  id: 'books-scf',
  title: 'Where did the cash go?',
  host: 'aoife',
  concept: 'scf-layout',
  uses: ['indirect-method', 'working-capital', 'ofi', 'dep-charge', 'disposal', 'liability-jars'],
  base: YEAR_BASE,
  vary: varyYear,
  build: (p) => {
    const book = yearBook(p);
    const cf = cashFlow(book);
    const is = incomeStatement(book);
    const items: StatementItem[] = [
      it('op', 'Operating profit', cf.op, 'op', 1, 'The indirect method starts here, from the income statement.'),
      it('dep', 'Depreciation', cf.dep, 'op', 1, 'Non-cash expense: add it back.'),
      it('gain', `${cf.gain >= 0 ? 'Gain' : 'Loss'} on sale of the ${p.sold.item}`, cf.gain, 'op', cf.gain >= 0 ? -1 : 1, cf.gain >= 0 ? 'Non-cash gain inside profit: deduct it. The full price goes in investing.' : 'Non-cash loss inside profit: add it back.'),
      wcItem('dinv', 'inventory', cf.dInv, true),
      wcItem('drec', 'trade receivables', cf.dRec, true),
      wcItem('dpay', 'trade payables', cf.dPay, false),
      ...(cf.dAccr ? [wcItem('daccr', 'accruals', cf.dAccr, false)] : []),
      it('int', 'Interest paid', cf.interestPaid, 'op', -1, 'Operating here; financing is also allowed if used consistently.', ['fin']),
      it('taxp', 'Tax paid', cf.taxPaid, 'op', -1, `Last year’s bill: ${w0(p.open.tax)} owed + ${w0(p.taxCharge)} charged − ${w0(p.taxCharge)} still owed.`),
      ...cf.invLines.map((l) => it(l.id, l.label, l.amount, 'inv', (l.amount >= 0 ? 1 : -1) as 1 | -1, l.amount >= 0 ? 'Cash from selling a long-term asset.' : 'Cash spent on long-term assets.')),
      ...cf.finLines.map((l) => it(l.id, l.label, l.amount, 'fin', (l.amount >= 0 ? 1 : -1) as 1 | -1, l.amount >= 0 ? 'Money in from owners or lenders.' : 'Money back to owners or lenders.')),
      it('pat', 'Profit for the year', is.profit, 'none', 1, 'Leave it out: we started from operating profit. Using both counts the year twice.'),
      it('taxc', 'Tax charge for the year', is.tax, 'none', -1, 'Leave it out: it’s next year’s cash. This year paid last year’s bill.'),
    ];
    const opSum = cf.cfo;
    return {
      prompt: [
        { who: 'aoife', text: `Your income statement says ${eur(is.profit)} of profit. Your bank balance fell from ${eur(cf.open)} to ${eur(cf.close)}. Show me where it went.` },
        { who: 'margaux', text: 'Same year, same list. Start from operating profit, then follow the cash.' },
      ],
      ask: 'Build the statement of cash flows, then find the net change in cash and the closing balance.',
      heading: 'Atelier Noor: statement of cash flows for the year to 31 December (€)',
      data: happened(book),
      sections: FLOW_SECTIONS,
      items,
      signed: true,
      totals: [
        { key: 'net', label: 'Net change in cash', calc: (s) => s.op + s.inv + s.fin, explain: 'Operating + investing + financing.' },
        { key: 'close', label: 'Cash at 31 December', calc: (s) => cf.open + s.op + s.inv + s.fin, explain: `Opening cash ${w0(cf.open)} plus the net change. It must match the balance sheet.` },
      ],
      decision: {
        question: 'What does the statement tell Aoife?',
        options: [
          { id: 'read', label: opSum >= -cf.cfi ? 'Trading paid for the investment; the rest went back to lenders and owners' : 'Trading made cash, but not enough to pay for the machines and the payouts too' },
          { id: 'wrong', label: 'The business is losing money' },
        ],
        correct: 'read',
        why: whys(`Operating cash ${w0(opSum)}, investing ${w0(cf.cfi)}, financing ${w0(cf.cff)}.`, 'Cash fell, so profit must be a loss.', 'Only the closing balance matters.'),
        correctWhy: 'w0',
        explain: `Profitable, and still the cash fell by ${eur(-cf.net)}. Closing cash ${eur(cf.close)} matches the balance sheet you built in Chapter III.`,
      },
      working: [
        `Cash generated from operations = ${w0(cf.generated)}; less interest ${w0(cf.interestPaid)} and tax ${w0(cf.taxPaid)} = ${w0(cf.cfo)}`,
        `Net change = ${w0(cf.cfo)} + ${w0(cf.cfi)} + ${w0(cf.cff)} = ${w0(cf.net)}`,
        `Closing cash = ${w0(cf.open)} + ${w0(cf.net)} = ${w0(cf.close)}`,
      ],
      hints: {
        place: 'Operating: profit, the non-cash items, working capital, interest and tax. Long-term assets: investing. Owners and lenders: financing. Two lines are leftovers from the income statement.',
        sign: 'Cash in adds, cash out deducts. Assets up deduct; liabilities up add.',
        subtotals: 'Add each section with its signs.',
        totals: 'Closing cash = opening + net change. Check it against the balance sheet.',
        decision: 'Compare the three section totals.',
      },
      outcomes: {
        read: { valueDelta: 3000, news: 'Aoife renews the overdraft. The cash flow statement goes into the monthly pack.' },
        wrong: { valueDelta: -2000, news: 'Aoife wonders why the house thinks it’s losing money. So does Idris.' },
      },
    };
  },
});

// ---------------------------------------------------------------- practice: a single month

const monthIs = defineStatement<MonthP>({
  kind: 'statement',
  id: 'month-pl',
  title: 'One month’s profit',
  host: 'theo',
  concept: 'recognition',
  uses: ['is-layout', 'accruals-prepayments', 'cost-of-sales'],
  base: MONTH_BASE,
  vary: varyMonth,
  build: (p) => {
    const book = monthBook(p);
    const is = incomeStatement(book);
    const cos = is.cos;
    const ahead = p.rentQuarter - is.rent;
    const items: StatementItem[] = [
      it('cr', 'Sales on credit', p.creditSales, 'trade', 1, 'Earned when delivered, paid or not.'),
      ...(p.cashSales ? [it('cs', 'Cash sales', p.cashSales, 'trade', 1, 'Earned and paid at once.')] : []),
      it('cos', `Cost of sales (${w0(p.open.inv)} + ${w0(p.purchases)} − ${w0(p.closeInv)})`, cos, 'trade', -1, 'What was used up, from the stock count.'),
      it('wages', 'Wages', p.wages, 'opex', -1, 'This month’s cost.'),
      it('rent', `Rent for ${p.month}`, is.rent, 'opex', -1, 'One month of the three paid.'),
      it('dep', 'Depreciation', p.dep, 'opex', -1, 'Non-cash, but a real cost.'),
      it('int', 'Interest', p.interest, 'fin', -1, 'Below operating profit.'),
      it('ahead', 'Rent paid ahead for the next two months', ahead, 'none', -1, 'A prepayment: an asset until those months arrive.'),
      it('rcpt', 'Cash from boutiques for earlier sales', p.receipts, 'none', 1, 'The profit was counted when those sales were made.'),
      it('bought', 'Fabric bought on credit', p.purchases, 'none', -1, 'Into stock. It becomes an expense only as it’s used (cost of sales).'),
      ...(p.capex ? [it('capex', 'Embroidery machine bought', p.capex, 'none', -1, 'An asset, depreciated over its life.')] : []),
      ...(p.newLoan ? [it('loan', 'New bank loan', p.newLoan, 'none', 1, 'Borrowed, not earned.')] : []),
      ...(p.dividend ? [it('div', 'Dividend paid', p.dividend, 'none', -1, 'A payout to owners, not an expense.')] : []),
    ];
    return {
      prompt: [
        { who: 'theo', text: `${p.month} at Atelier Noor. Here’s everything that happened. Did we make money this month?` },
        { who: 'margaux', text: 'Only what was earned and used up in the month. Not what came in or went out of the bank.' },
      ],
      ask: `Build the income statement for ${p.month}.`,
      heading: `Atelier Noor: income statement for ${p.month} (€)`,
      data: happened(book),
      sections: [
        { id: 'trade', label: 'Trading', subtotal: 'Gross profit' },
        { id: 'opex', label: 'Operating expenses', subtotal: 'Total operating expenses' },
        { id: 'fin', label: 'Finance costs', subtotal: 'Net finance costs' },
      ],
      items,
      signed: false,
      totals: [
        { key: 'op', label: 'Operating profit', calc: (s) => s.trade + s.opex, explain: 'Gross profit less expenses.' },
        { key: 'pf', label: `Profit for ${p.month}`, calc: (s) => s.trade + s.opex + s.fin, explain: 'Less interest.' },
      ],
      decision: {
        question: `The ${eur(p.rentQuarter)} rent payment: how much is ${p.month}’s expense?`,
        options: [
          { id: 'third', label: `${eur(is.rent)}: one month’s worth` },
          { id: 'all', label: `${eur(p.rentQuarter)}: it was paid this month` },
        ],
        correct: 'third',
        why: whys('An expense belongs to the period it’s used up in. The rest is a prepayment.', 'Expenses follow the cash.', 'Spread it over the year.'),
        correctWhy: 'w0',
        explain: `${eur(ahead)} is paid ahead: an asset on the balance sheet until the next two months use it. Profit for ${p.month}: ${eur(is.profit)}.`,
      },
      working: [`Gross profit = ${w0(is.revenue)} − ${w0(cos)} = ${w0(is.gp)}`, `Operating profit = ${w0(is.gp)} − ${w0(is.opex)} = ${w0(is.op)}`, `Profit = ${w0(is.op)} − ${w0(is.interest)} = ${w0(is.profit)}`],
      hints: { place: 'Leave out anything that only moved cash or stock, and the part of the rent that belongs to later months.', subtotals: 'Trading, then expenses, then interest.', totals: 'Gross profit less expenses, then less interest.', decision: 'Which month uses it up?' },
      outcomes: {
        third: { valueDelta: 800, news: `${p.month}’s figures go to the board on time.` },
        all: { valueDelta: -600, news: `${p.month} looks worse than it was, and the next two look better. Idris is confused.` },
      },
    };
  },
});

const monthCash = defineStatement<MonthP>({
  kind: 'statement',
  id: 'month-cash',
  title: 'One month’s cash',
  host: 'margaux',
  concept: 'cash-v-profit',
  uses: ['ofi', 'cash-jar'],
  base: MONTH_BASE,
  vary: varyMonth,
  build: (p) => {
    const book = monthBook(p);
    const cf = cashFlow(book);
    const is = incomeStatement(book);
    const lines = book.events.filter((e) => e.cf && e.legs.cash);
    const items: StatementItem[] = [
      ...lines.map((e) => it(e.id, e.cfLabel!, e.legs.cash!, e.cf!, (e.legs.cash! >= 0 ? 1 : -1) as 1 | -1, e.why, e.id === 'm-interest' ? ['fin'] : undefined)),
      it('credit', 'Sales on credit, not yet paid', p.creditSales, 'none', 1, 'Profit this month, cash later.'),
      it('dep', 'Depreciation', p.dep, 'none', -1, 'No cash moves.'),
      it('bought', 'Fabric bought on credit', p.purchases, 'none', -1, 'Nothing paid yet.'),
    ];
    const gap = is.profit - cf.net;
    return {
      prompt: [
        { who: 'margaux', text: `${p.month} again, this time through the bank account. Cash was ${eur(cf.open)} on ${book.start}.` },
        { who: 'theo', text: 'If we made a profit, the bank balance went up by the same. Surely.' },
      ],
      ask: `List every cash movement in ${p.month} by activity, then find the closing balance.`,
      heading: `Atelier Noor: cash flows for ${p.month}, direct method (€)`,
      data: happened(book),
      sections: FLOW_SECTIONS,
      items,
      signed: true,
      totals: [
        { key: 'net', label: 'Net change in cash', calc: (s) => s.op + s.inv + s.fin, explain: 'Operating + investing + financing.' },
        { key: 'close', label: `Cash at the end of ${p.month}`, calc: (s) => cf.open + s.op + s.inv + s.fin, explain: `Opening ${w0(cf.open)} plus the net change.` },
      ],
      decision: {
        question: `Profit for ${p.month} was ${eur(is.profit)}. Cash changed by ${eur(cf.net)}. Is Theo right?`,
        options: [
          { id: 'no', label: 'No: timing, assets and financing pull them apart' },
          { id: 'yes', label: 'Yes, near enough' },
        ],
        correct: 'no',
        why: whys('Credit sales, stock, rent paid ahead, depreciation, machines and loans all move one and not the other.', 'Over a month, profit and cash always match.', 'Only depreciation causes the gap.'),
        correctWhy: 'w0',
        explain: `They differ by ${eur(Math.abs(gap))}. Same month, two true stories.`,
      },
      working: [`Operating ${w0(cf.cfo)}, investing ${w0(cf.cfi)}, financing ${w0(cf.cff)}`, `Closing cash = ${w0(cf.open)} + ${w0(cf.net)} = ${w0(cf.close)}`],
      hints: { place: 'Only lines where money actually moved. Customers, suppliers, staff, rent and interest are operating; machines are investing; lenders and owners are financing.', sign: 'In adds, out deducts.', subtotals: 'Add each section.', totals: 'Opening plus the net change.', decision: 'Find three events that moved profit but not cash, or cash but not profit.' },
      outcomes: {
        no: { valueDelta: 800, news: 'Theo starts reading the cash report as well as the profit figure.' },
        yes: { valueDelta: -600, news: 'Theo books a trip on the strength of the profit. The card is declined.' },
      },
    };
  },
});

// ---------------------------------------------------------------- what moves: each event, profit and cash

function linkItems(book: Book, where: string): ClassifyItem[] {
  return book.events.map((e) => {
    const fx = effectOf(e);
    const category = fx.profit && fx.cash ? 'both' : fx.profit ? 'profit' : fx.cash ? 'cash' : 'neither';
    const say = (n: number, what: string) => (n ? `${what} ${n > 0 ? 'up' : 'down'} ${eur(Math.abs(n))}` : `${what} unchanged`);
    return { text: `${where}: ${e.text}`, category, why: `${say(fx.profit, 'Profit')}, ${say(fx.cash, 'cash')}. ${e.why}` };
  });
}

export const booksLinks: ClassifyProblem = {
  kind: 'classify',
  id: 'books-links',
  title: 'What else moves?',
  host: 'margaux',
  concept: 'transactions',
  prompt: ['Every event moves the balance sheet. Some also move profit, some move cash, some both. For each one from our year: what else moves?'],
  categories: [
    { id: 'both', label: 'Profit and cash' },
    { id: 'profit', label: 'Profit only' },
    { id: 'cash', label: 'Cash only' },
    { id: 'neither', label: 'Only the balance sheet' },
  ],
  show: 8,
  items: [...linkItems(yearBook(YEAR_BASE), 'The year'), ...linkItems(monthBook(MONTH_BASE), MONTH_BASE.month)],
  outcome: {
    allRight: { valueDelta: 1500, news: 'Margaux pins the list above her desk: “Every event, two places at least.”' },
    someWrong: { valueDelta: 0, news: 'A few events landed in the wrong place. Worth another look tomorrow.' },
  },
};

export const BOOKS_PROBLEMS = [booksSfpOpen, booksIs, booksSfp, booksScf, monthIs, monthCash, booksLinks];
/** Problems whose completion fills in the books panel. */
export const BOOK_BUILDS = ['books-sfp-open', 'books-is', 'books-sfp', 'books-scf'] as const;
