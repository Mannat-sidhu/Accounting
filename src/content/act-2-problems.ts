// Chapter II problems: the balance sheet. Based on the course's worked examples (ROCK company, Exercise 1).
import * as A from '../engine/accounting';
import { eur } from '../engine/format';
import { pickInt } from '../engine/rng';
import type { ClassifyProblem, Problem, StatementItem, TableProblem } from '../engine/types';
import { defineCalc, defineStatement, w0, whys } from './helpers';

export const assetTest: ClassifyProblem = {
  kind: 'classify',
  id: 'asset-test',
  title: 'Asset or not?',
  host: 'niamh',
  concept: 'asset-test',
  prompt: ['Niamh runs her finger down Margaux’s draft list of assets. Which of these really belong on the balance sheet?'],
  categories: [
    { id: 'asset', label: 'An asset' },
    { id: 'not', label: 'Not an asset' },
  ],
  show: 7,
  items: [
    { text: 'The delivery van we bought in March', category: 'asset', why: 'Future benefit, we control it, bought in a past transaction, measurable.' },
    { text: 'Electricity used in the studio last quarter', category: 'not', why: 'The benefit has been used up: it’s an expense.' },
    { text: 'Our brilliant pattern cutters', category: 'not', why: 'We don’t control people, and can’t measure them reliably in money.' },
    { text: 'Silk bought for next season’s collection', category: 'asset', why: 'Inventory: a future benefit we control.' },
    { text: 'Six months of insurance paid in advance', category: 'asset', why: 'A prepayment: the cover is still to come.' },
    { text: 'A boutique’s promise to place an order next year', category: 'not', why: 'No past transaction yet.' },
    { text: 'The Atelier Noor name, built up ourselves', category: 'not', why: 'Can’t be measured reliably: home-grown brands usually aren’t recognised.' },
    { text: 'A trademark we bought from another label', category: 'asset', why: 'Bought, so there’s a past transaction and a cost to measure.' },
    { text: 'Money customers owe us for September’s sales', category: 'asset', why: 'Trade receivables: a right to cash from a past sale.' },
  ],
};

export const currentSort: ClassifyProblem = {
  kind: 'classify',
  id: 'current-sort',
  title: 'Sooner or later',
  host: 'margaux',
  concept: 'current-noncurrent',
  prompt: ['Sort the lines for the balance sheet.'],
  categories: [
    { id: 'nca', label: 'Non-current asset' },
    { id: 'ca', label: 'Current asset' },
    { id: 'ncl', label: 'Non-current liability' },
    { id: 'cl', label: 'Current liability' },
  ],
  show: 8,
  items: [
    { text: 'Inventory of finished coats', category: 'ca', why: 'Expected to be sold within the year.' },
    { text: 'Trade receivables', category: 'ca', why: 'Collected within the year.' },
    { text: 'Cash at bank', category: 'ca', why: 'Cash is always current.' },
    { text: 'Prepaid rent for next quarter', category: 'ca', why: 'Used up within the year.' },
    { text: 'Sewing and cutting equipment', category: 'nca', why: 'Held for use over several years.' },
    { text: 'Delivery van', category: 'nca', why: 'A long-term asset.' },
    { text: 'Shares in a supplier, held for the long term', category: 'nca', why: 'A long-term investment.' },
    { text: 'Trade payables', category: 'cl', why: 'Due within the year.' },
    { text: 'Bank overdraft', category: 'cl', why: 'Repayable on demand.' },
    { text: 'Corporation tax due in nine months', category: 'cl', why: 'Due within a year.' },
    { text: 'This year’s instalment on the five-year loan', category: 'cl', why: 'The part due in the next twelve months is current.' },
    { text: 'The rest of the five-year loan', category: 'ncl', why: 'Due after more than a year.' },
    { text: '10% debentures repayable in 2031', category: 'ncl', why: 'Long-term borrowing.' },
  ],
};

export const conventionsSort: ClassifyProblem = {
  kind: 'classify',
  id: 'conventions-sort',
  title: 'Which convention?',
  host: 'niamh',
  concept: 'conventions',
  prompt: ['Niamh explains five of Margaux’s choices. Which convention is behind each?'],
  categories: [
    { id: 'entity', label: 'Business entity' },
    { id: 'dual', label: 'Dual aspect' },
    { id: 'prudence', label: 'Prudence' },
    { id: 'cost', label: 'Historic cost' },
    { id: 'going', label: 'Going concern' },
  ],
  show: 5,
  items: [
    { text: 'Idris’s personal car isn’t on the house’s balance sheet.', category: 'entity', why: 'The business is separate from its owners.' },
    { text: 'Buying silk on credit raises both inventory and payables.', category: 'dual', why: 'Every transaction has two sides.' },
    { text: 'We provide now for a debt that probably won’t be paid, but don’t book a lawsuit we might win.', category: 'prudence', why: 'Losses when likely; gains when reasonably certain.' },
    { text: 'The studio is shown at what we paid, though prices on the street have risen.', category: 'cost', why: 'Recorded at cost.' },
    { text: 'Machines are valued on the basis that we’ll keep using them, not at auction prices.', category: 'going', why: 'We assume the business will carry on.' },
    { text: 'Theo’s home studio is not the house’s asset, even though he sews there.', category: 'entity', why: 'His property, not the business’s.' },
    { text: 'Equipment bought for €10,000 stays at €10,000 less depreciation, not its resale value.', category: 'cost', why: 'Historic cost, less depreciation.' },
  ],
};

export const dualEffect: TableProblem = {
  kind: 'table',
  id: 'dual-effect',
  title: 'Two sides of every story',
  host: 'margaux',
  concept: 'dual-effect',
  prompt: ['A week of transactions. For each one, what happens to assets, liabilities and equity? “+ and −” means one asset up and another down.'],
  columns: [
    { label: 'Assets', options: ['+', '−', '+ and −', '0'] },
    { label: 'Liabilities', options: ['+', '−', '0'] },
    { label: 'Equity', options: ['+', '−', '0'] },
  ],
  rows: [
    { label: 'Bought a delivery van, paid from the bank', answers: ['+ and −', '0', '0'], why: 'Van up, cash down. Nothing else changes.' },
    { label: 'Bought fabric on credit', answers: ['+', '+', '0'], why: 'Inventory up; we owe the supplier.' },
    { label: 'Sold a coat for cash, at a profit', answers: ['+', '0', '+'], why: 'Cash up by more than inventory goes down; the profit adds to equity.' },
    { label: 'Idris invested more money for shares', answers: ['+', '0', '+'], why: 'Cash up; share capital up.' },
    { label: 'Returned faulty fabric bought on credit', answers: ['−', '−', '0'], why: 'Inventory down; we owe the supplier less.' },
    { label: 'Paid a supplier what we owed', answers: ['−', '−', '0'], why: 'Cash down; payables down. No expense now.' },
    { label: 'A customer paid what they owed', answers: ['+ and −', '0', '0'], why: 'Cash up, receivables down.' },
    { label: 'Took out a long-term bank loan', answers: ['+', '+', '0'], why: 'Cash up; borrowings up.' },
    { label: 'Paid this month’s wages', answers: ['−', '0', '−'], why: 'Cash down; an expense reduces equity.' },
    { label: 'Idris took a coat from stock for himself', answers: ['−', '0', '−'], why: 'Inventory down; a withdrawal reduces equity.' },
  ],
};

interface EqP {
  assets: number;
  current: number;
  longTerm: number;
  shares: number;
}

export const netAssetsCalc = defineCalc<EqP>({
  kind: 'calc',
  id: 'net-assets',
  title: 'What’s it worth on paper?',
  host: 'idris',
  concept: 'equation',
  base: { assets: 460000, current: 60000, longTerm: 50000, shares: 100000 },
  vary: (rng) => {
    const assets = pickInt(rng, 150000, 900000, 10000);
    return { assets, current: pickInt(rng, 20000, assets / 4, 5000), longTerm: pickInt(rng, 0, assets / 3, 5000), shares: pickInt(rng, 50000, 200000, 10000) };
  },
  build: ({ assets, current, longTerm, shares }) => {
    const eq = A.netAssets(assets, current + longTerm);
    return {
      prompt: [
        { who: 'idris', text: 'What is the house worth to us owners, according to the books?' },
        `Total assets are ${eur(assets)}. We owe ${eur(current)} due within a year and ${eur(longTerm)} on the long-term loan. Share capital is ${eur(shares)}.`,
      ],
      ask: 'What is total equity (net assets)?',
      spot: {
        question: 'Which of these are liabilities?',
        options: [
          { id: 'cl', label: `The ${eur(current)} due within a year` },
          { id: 'ltd', label: 'The long-term loan' },
          { id: 'sc', label: 'Share capital' },
          { id: 'ta', label: 'Total assets' },
        ],
        correct: ['cl', 'ltd'],
        explain: 'Amounts owed to outsiders are liabilities. Share capital is equity.',
      },
      formula: { options: ['net-assets', 'assets-plus-liab', 'equity-is-capital'], correct: 'net-assets', explain: 'Equity = assets − liabilities.' },
      inputs: [
        { key: 'A', symbol: '\\text{Assets}', label: 'Total assets', unit: 'eur', expected: assets, explain: `${eur(assets)}.` },
        { key: 'L', symbol: '\\text{Liabilities}', label: 'Total liabilities', unit: 'eur', expected: current + longTerm, explain: `${w0(current)} + ${w0(longTerm)} = ${w0(current + longTerm)}.` },
      ],
      solve: (v) => v.A - v.L,
      answer: { label: 'Equity (net assets)', unit: 'eur', explain: `${w0(assets)} − ${w0(current + longTerm)} = ${w0(eq)}.` },
      decision: {
        question: `Idris says equity is just the share capital, ${eur(shares)}. Is he right?`,
        options: [
          { id: 'no', label: 'No' },
          { id: 'yes', label: 'Yes' },
        ],
        correct: 'no',
        why: whys('Equity also includes share premium and retained earnings: all the net assets.', 'Share capital is the only part owners can claim.', 'Equity is total assets.'),
        correctWhy: 'w0',
        explain: `Equity is the whole of net assets, ${eur(eq)}: capital put in plus profits kept.`,
      },
      working: ['Equity = Assets − Liabilities', `= ${w0(assets)} − (${w0(current)} + ${w0(longTerm)}) = €${w0(eq)}`],
      hints: { spot: 'Who has a claim on us that we must pay?', formula: 'Rearrange A = L + E.', answer: 'Assets less all liabilities.', decision: 'What else sits in equity?' },
      outcomes: {
        no: { valueDelta: 500, news: 'Idris learns his stake is bigger than he thought. He’s delighted.' },
        yes: { valueDelta: -500, news: 'Idris undervalues his own stake in a chat with a buyer.' },
      },
      cfoLine: `Equity ${eur(eq)}.`,
    };
  },
});

interface SfpP {
  van: number;
  building: number;
  land: number;
  equipment: number;
  rec: number;
  inv: number;
  cash: number;
  pay: number;
  loan: number;
  sc: number;
  sp: number;
  sales: number;
  wages: number;
}

export const sfpBuild = defineStatement<SfpP>({
  kind: 'statement',
  id: 'sfp-build',
  title: 'Closing the books',
  host: 'margaux',
  concept: 'sfp-layout',
  uses: ['current-noncurrent', 'equation'],
  base: { van: 30000, building: 90000, land: 60000, equipment: 80000, rec: 110000, inv: 50000, cash: 40000, pay: 60000, loan: 50000, sc: 100000, sp: 200000, sales: 320000, wages: 85000 },
  vary: (rng) => {
    const k = (lo: number, hi: number) => pickInt(rng, lo, hi, 5000);
    return { van: k(10000, 40000), building: k(50000, 150000), land: k(20000, 90000), equipment: k(30000, 120000), rec: k(40000, 150000), inv: k(20000, 90000), cash: k(5000, 60000), pay: k(20000, 80000), loan: k(0, 80000), sc: k(50000, 120000), sp: k(0, 100000), sales: k(200000, 500000), wages: k(50000, 120000) };
  },
  build: (p) => {
    const nca = p.van + p.building + p.land + p.equipment;
    const ca = p.rec + p.inv + p.cash;
    const re = nca + ca - p.pay - p.loan - p.sc - p.sp;
    const it = (id: string, label: string, amount: number, section: string, why: string): StatementItem => ({ id, label, amount, section, sign: 1, why });
    const items: StatementItem[] = [
      it('land', 'Land', p.land, 'nca', 'Held for the long term.'),
      it('bldg', 'Studio building', p.building, 'nca', 'Held for the long term.'),
      it('eq', 'Sewing and cutting equipment', p.equipment, 'nca', 'Used over several years.'),
      it('van', 'Delivery van', p.van, 'nca', 'A long-term asset.'),
      it('inv', 'Inventory', p.inv, 'ca', 'Sold within the year.'),
      it('rec', 'Trade receivables', p.rec, 'ca', 'Collected within the year.'),
      it('cash', 'Cash at bank', p.cash, 'ca', 'Cash is current.'),
      it('sc', 'Share capital', p.sc, 'eq', 'Owners’ capital.'),
      ...(p.sp ? [it('sp', 'Share premium', p.sp, 'eq', 'Owners’ capital paid above nominal value.')] : []),
      it('re', 'Retained earnings', Math.abs(re), 'eq', 'Profits kept in the business.'),
      ...(p.loan ? [it('loan', 'Five-year bank loan', p.loan, 'ncl', 'Due after more than a year.')] : []),
      it('pay', 'Trade payables', p.pay, 'cl', 'Due within the year.'),
      it('sales', 'Sales revenue for the year', p.sales, 'none', 'Income statement, not balance sheet. Only the profit reaches retained earnings.'),
      it('wages', 'Wages expense', p.wages, 'none', 'An expense: income statement.'),
      it('team', 'Our skilled team (not bought)', 50000, 'none', 'Fails the asset test: we don’t control people, and can’t measure them reliably.'),
    ];
    if (re < 0) items.find((x) => x.id === 're')!.sign = -1;
    const total = nca + ca;
    return {
      prompt: [
        { who: 'margaux', text: 'Year end. Here’s every balance from the ledger, plus a few things Theo thinks belong here.' },
        { who: 'theo', text: 'Put the team on it! We’re the real assets.' },
        { who: 'margaux', text: 'Sweet. No.' },
      ],
      ask: 'Lay out the classified balance sheet, then check it balances.',
      heading: 'Statement of financial position at 30 September (€)',
      sections: [
        { id: 'nca', label: 'Non-current assets', subtotal: 'Total non-current assets' },
        { id: 'ca', label: 'Current assets', subtotal: 'Total current assets' },
        { id: 'eq', label: 'Equity', subtotal: 'Total equity' },
        { id: 'ncl', label: 'Non-current liabilities', subtotal: 'Total non-current liabilities' },
        { id: 'cl', label: 'Current liabilities', subtotal: 'Total current liabilities' },
      ],
      items,
      signed: false,
      totals: [
        { key: 'ta', label: 'Total assets', calc: (s) => s.nca + s.ca, explain: 'Non-current + current assets.' },
        { key: 'tel', label: 'Total equity and liabilities', calc: (s) => s.eq + s.ncl + s.cl, explain: 'Equity + non-current + current liabilities. It matches total assets.' },
      ],
      decision: {
        question: 'Idris asks what the house is worth to its owners, on paper.',
        options: [
          { id: 'eq', label: `${eur(total - p.pay - p.loan)}: total equity` },
          { id: 'ta', label: `${eur(total)}: total assets` },
        ],
        correct: 'eq',
        why: whys('Equity = net assets: what’s left after paying everyone we owe.', 'The owners own every asset.', 'Assets minus equity.'),
        correctWhy: 'w0',
        explain: `Net assets = ${w0(total)} − ${w0(p.pay + p.loan)} = ${w0(total - p.pay - p.loan)}, the same as total equity.`,
      },
      working: [`Total assets = ${w0(nca)} + ${w0(ca)} = ${w0(total)}`, `Total equity and liabilities = ${w0(p.sc + p.sp + re)} + ${w0(p.loan)} + ${w0(p.pay)} = ${w0(total)}`],
      hints: {
        place: 'Three lines don’t belong: income statement items, and something that fails the asset test.',
        subtotals: 'Add each section.',
        totals: 'Both sides should match.',
        decision: 'Equity = assets − liabilities.',
      },
      outcomes: {
        eq: { valueDelta: 1500, news: 'Niamh signs off the balance sheet without a single query.' },
        ta: { valueDelta: -1000, news: 'Idris tells a buyer the house is worth its total assets. The buyer laughs.' },
      },
    };
  },
});

export const ACT2_PROBLEMS: Problem[] = [assetTest, currentSort, conventionsSort, dualEffect, netAssetsCalc, sfpBuild];
