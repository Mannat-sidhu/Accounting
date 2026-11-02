// Chapter II lessons: the statement of financial position (Topic 2). A refresher: short, then practise.
import type { Concept } from '../engine/types';

const c = (x: Omit<Concept, 'act'>): Concept => ({ act: 2, ...x });

export const ACT2_CONCEPTS: Concept[] = [
  c({
    id: 'equation',
    name: 'The accounting equation',
    summary: 'Assets = Liabilities + Equity. So equity = assets − liabilities = net assets.',
    lesson: {
      plain: [
        'Everything rests on one line: Assets = Liabilities + Equity.',
        'Assets are what the house controls. Liabilities and equity are the two kinds of claim on them: what we owe outsiders, and what belongs to the owners.',
        'Rearrange it and equity = assets − liabilities. That’s why equity is also called net assets.',
        'Equity is made up of the capital the owners put in (share capital and share premium) plus profits kept in the business over the years (retained earnings).',
      ],
      formula: { tex: '\\text{Assets} = \\text{Liabilities} + \\text{Equity}' },
      traps: ['Equity isn’t cash. It’s a claim, and there’s no obligation to pay it out, unlike a liability.', 'The balance sheet is a snapshot at one date; the income statement covers a period.'],
    },
  }),
  c({
    id: 'asset-test',
    name: 'What counts as an asset',
    summary: 'A probable future benefit, which we control, from a past transaction, that can be measured in money.',
    lesson: {
      plain: [
        'Something is an accounting asset only if it passes four tests.',
        'There’s a probable future benefit. We have the right to control it. It came from a past transaction or event. And it can be measured reliably in money.',
        'So a delivery van we bought is an asset. Electricity we used last month isn’t: the benefit’s gone. Our clever staff aren’t: we don’t control them. A brand we built ourselves usually isn’t: we can’t measure it reliably. A trademark we bought is.',
      ],
      traps: ['Prepaid insurance is an asset (the benefit is still to come); insurance for the year just gone is an expense.', 'Tiny items like a stapler are assets in theory, but are expensed because they aren’t material.'],
    },
  }),
  c({
    id: 'dual-effect',
    name: 'Every transaction has two sides',
    summary: 'Each transaction changes at least two things, and A = L + E stays balanced.',
    lesson: {
      plain: [
        'Every transaction affects at least two accounts. The business gives something up and gets something in return. That’s the dual aspect.',
        'To analyse one: name the accounts affected, say whether each is an asset, liability or equity, decide if it goes up or down, and check that A = L + E still balances.',
        'Issue €2,000 of shares for cash: cash (asset) up, share capital (equity) up.',
        'Buy €10,000 of equipment, paying €2,000 cash and signing a note for the rest: equipment up 10,000, cash down 2,000, notes payable up 8,000.',
        'Income increases equity (through retained earnings); expenses and dividends reduce it.',
      ],
      traps: ['Paying a supplier you already owe reduces cash and payables. No expense: that was recorded when you bought.', 'Swapping one asset for another (collecting a debt) changes nothing in total.'],
    },
  }),
  c({
    id: 'current-noncurrent',
    name: 'Current or non-current',
    summary: 'Current assets and liabilities turn over within a year (or the operating cycle); everything else is non-current.',
    lesson: {
      plain: [
        'Current assets are cash, or things expected to be sold, used or turned into cash within a year: inventory, trade receivables, prepayments, cash.',
        'Non-current assets are held for the long term: property, equipment, vehicles, long-term investments.',
        'Current liabilities are due within a year: trade payables, the overdraft, tax due, this year’s loan repayments. Non-current liabilities are due later: long-term loans, debentures.',
      ],
      diagram: { kind: 'cycle', title: 'Current assets go round', stops: ['Cash', 'Inventory', 'Receivables'] },
      traps: ['A five-year loan has a current part: the instalment due in the next twelve months.', 'It’s about the business’s intention and timing, not what the thing is. A van held for resale by a van dealer is inventory.'],
    },
  }),
  c({
    id: 'sfp-layout',
    name: 'Laying out the balance sheet',
    summary: 'Non-current assets + current assets = total assets = equity + non-current liabilities + current liabilities.',
    lesson: {
      plain: [
        'A classified statement of financial position groups the lines.',
        'Assets first: non-current assets, then current assets, then total assets.',
        'Then equity and liabilities: equity (share capital, share premium, retained earnings), non-current liabilities, current liabilities, and the total.',
        'The two totals must agree. If they don’t, something is in the wrong place or missing.',
      ],
      diagram: {
        kind: 'table',
        title: 'A classified balance sheet (€)',
        head: ['', '€'],
        rows: [
          ['Non-current assets'],
          ['Land, buildings, equipment, vehicles', '2,600'],
          ['Current assets'],
          ['Inventory, receivables, cash', '2,000'],
          ['Total assets', '4,600'],
          ['Equity: share capital, premium, retained earnings', '3,500'],
          ['Non-current liabilities: long-term borrowing', '500'],
          ['Current liabilities: trade payables', '600'],
          ['Total equity and liabilities', '4,600'],
        ],
        totals: [4, 8],
      },
      traps: ['Accumulated depreciation is shown as a deduction from cost, inside non-current assets. It isn’t a liability.', 'Sales and expenses never go on the balance sheet. They go in the income statement, and only the year’s profit reaches retained earnings.'],
    },
  }),
  c({
    id: 'conventions',
    name: 'The conventions behind it',
    summary: 'Business entity, dual aspect, prudence, historic cost, going concern.',
    lesson: {
      plain: [
        'Five conventions shape the balance sheet.',
        'Business entity: the business is separate from its owners. Idris’s own car isn’t ours.',
        'Dual aspect: every transaction has two sides.',
        'Prudence: recognise likely losses now, but gains only when they’re reasonably certain.',
        'Historic cost: assets are recorded at what they cost, not what they’d sell for today. Going concern: we assume the business will carry on, so we don’t value things at fire-sale prices.',
      ],
      traps: ['Prudence doesn’t mean deliberately understating. It means not overstating.'],
    },
  }),
];
