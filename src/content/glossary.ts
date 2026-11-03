// Plain-English meanings for the jargon, tappable wherever a term appears in a speech bubble or cheat card.
// `terms` are the words to link (case-insensitive, whole words); the first is the headword.
import type { ConceptId } from '../engine/types';

export interface GlossaryEntry {
  terms: string[];
  plain: string;
  /** An everyday picture, if one helps. */
  like?: string;
  /** The idea to open for the full lesson. */
  concept?: ConceptId;
}

export const GLOSSARY: GlossaryEntry[] = [
  { terms: ['asset', 'assets'], plain: 'Something the business owns or controls that will help it make money.', like: 'Your phone or your bike.', concept: 'asset-test' },
  { terms: ['liability', 'liabilities'], plain: 'Money the business owes to someone outside it.', like: 'A credit-card bill or a loan.', concept: 'equation' },
  { terms: ['equity'], plain: 'The owners’ share: what’s left if you sold everything and paid everyone you owe.', like: 'The part of your flat you actually own after the mortgage.', concept: 'equation' },
  { terms: ['net assets'], plain: 'Assets minus liabilities. It’s the same number as equity.', concept: 'equation' },
  { terms: ['trade receivables', 'receivables', 'debtors', 'trade debtors'], plain: 'Money customers owe the business for things already sold on credit.', like: 'A friend who still owes you for the concert ticket.', concept: 'cash-jar' },
  { terms: ['trade payables', 'payables', 'creditors', 'trade creditors'], plain: 'Money the business owes its suppliers for things already received.', like: 'Your phone bill you haven’t paid yet.', concept: 'cash-jar' },
  { terms: ['inventory', 'stock'], plain: 'Goods held to be sold, or materials to make them.', like: 'The boxes on a shop’s shelves.', concept: 'cost-of-sales' },
  { terms: ['accrual', 'accruals', 'accrued'], plain: 'A cost you’ve already incurred but haven’t yet paid for. It’s a liability.', like: 'March’s electricity, with the bill coming in April.', concept: 'accruals-prepayments' },
  { terms: ['prepayment', 'prepayments', 'prepaid'], plain: 'Something you’ve paid for in advance that you haven’t used yet. It’s an asset.', like: 'A year’s gym pass paid in January.', concept: 'accruals-prepayments' },
  { terms: ['depreciation'], plain: 'Spreading the cost of a long-lasting item over the years it’s used, instead of charging it all on day one.', like: 'Your phone losing value each year.', concept: 'depreciation' },
  { terms: ['carrying amount', 'net book value'], plain: 'What an asset is worth in the books: what it cost, minus the depreciation so far.', concept: 'depreciation' },
  { terms: ['accumulated depreciation'], plain: 'The total depreciation charged on an asset so far, since it was bought.', concept: 'dep-charge' },
  { terms: ['provision', 'provisions'], plain: 'An amount set aside now for a cost that’s likely but uncertain in size or timing.', like: 'Writing off part of what you think a friend won’t repay.', concept: 'provisions' },
  { terms: ['retained earnings'], plain: 'Profits the business has kept over the years instead of paying them out.', concept: 'equation' },
  { terms: ['share capital'], plain: 'The money owners put in by buying shares.', concept: 'equation' },
  { terms: ['share premium'], plain: 'What investors paid for shares above their face value.', concept: 'ofi' },
  { terms: ['working capital'], plain: 'The money tied up in the day-to-day: stock and what customers owe, minus what you owe suppliers.', like: 'Cash lent to friends and stock in your market stall.', concept: 'working-capital' },
  { terms: ['cash equivalents', 'cash equivalent'], plain: 'Very safe short deposits you could turn into cash straight away, such as ones maturing in three months or less.', concept: 'cash-equivalents' },
  { terms: ['operating profit'], plain: 'Profit from running the business, before interest on borrowing.', concept: 'is-layout' },
  { terms: ['gross profit'], plain: 'Sales minus the direct cost of what was sold.', concept: 'is-layout' },
  { terms: ['cost of sales'], plain: 'What the goods you actually sold cost you.', concept: 'cost-of-sales' },
  { terms: ['revenue', 'sales revenue'], plain: 'The money earned from selling things in the period.', concept: 'recognition' },
  { terms: ['dividend', 'dividends'], plain: 'A share of profit paid out to the owners.', concept: 'interest-dividends' },
  { terms: ['overdraft'], plain: 'Borrowing by spending more than is in your bank account.', concept: 'cash-equivalents' },
  { terms: ['indirect method'], plain: 'Building “cash from operations” by starting from profit and correcting it.', concept: 'indirect-method' },
  { terms: ['free cash flow'], plain: 'Cash from running the business, minus what’s spent on new long-lasting assets.', concept: 'free-cash-flow' },
  { terms: ['cash conversion cycle', 'cash cycle'], plain: 'How many days your own cash is tied up between paying for stock and being paid for it.', concept: 'efficiency' },
  { terms: ['debtor days'], plain: 'How many days, on average, customers take to pay.', concept: 'efficiency' },
  { terms: ['creditor days'], plain: 'How many days, on average, you take to pay suppliers.', concept: 'efficiency' },
  { terms: ['inventory days'], plain: 'How many days, on average, stock sits before it is sold.', concept: 'efficiency' },
  { terms: ['liquidity'], plain: 'Whether you can pay the bills coming up soon.', concept: 'liquidity' },
  { terms: ['gearing'], plain: 'How much of the business’s long-term money is borrowed.', like: 'The mortgage on your flat.', concept: 'gearing-cover' },
  { terms: ['interest cover'], plain: 'How many times over profit could pay the interest bill.', concept: 'gearing-cover' },
  { terms: ['roce', 'return on capital employed'], plain: 'Profit from operations as a percentage of all the long-term money in the business.', concept: 'profitability' },
  { terms: ['invoice discounting'], plain: 'Borrowing from a bank against money customers owe you, while you still chase the customers.', concept: 'debt-finance-options' },
  { terms: ['factoring', 'invoice factoring'], plain: 'Selling the money customers owe you to a company, for a bit less, in return for cash now.', concept: 'debt-finance-options' },
  { terms: ['fixed costs', 'fixed cost'], plain: 'Costs that stay the same however much you sell.', like: 'The rent on a market stall.', concept: 'cost-behaviour' },
  { terms: ['variable costs', 'variable cost'], plain: 'Costs that rise with every unit you sell.', like: 'The milk and cup in each coffee.', concept: 'cost-behaviour' },
  { terms: ['contribution'], plain: 'What each sale adds after its own variable costs, towards paying fixed costs and then profit.', concept: 'contribution' },
  { terms: ['break-even', 'break-even point', 'breakeven'], plain: 'The sales level where you make neither profit nor loss.', concept: 'break-even' },
  { terms: ['margin of safety'], plain: 'How far sales can fall before you start losing money.', concept: 'margin-of-safety' },
  { terms: ['operating gearing'], plain: 'How much of the cost base is fixed. High means profit swings hard with sales.', like: 'A flat-fee gym versus pay-per-visit.', concept: 'operating-gearing' },
  { terms: ['budget', 'budgets'], plain: 'A plan for a period, in numbers.', like: 'A holiday budget.', concept: 'budget-purpose' },
  { terms: ['limiting factor', 'key factor'], plain: 'Whatever caps what the business can do: demand, supply, space, time.', concept: 'budget-process' },
  { terms: ['master budget'], plain: 'All the separate budgets combined into one plan.', concept: 'budget-process' },
  { terms: ['zero-based budgeting', 'zbb'], plain: 'Budgeting where every item must be justified from scratch each time.', concept: 'budget-methods' },
  { terms: ['variance', 'variances'], plain: 'The difference between what was planned and what actually happened.', concept: 'standard-cost' },
  { terms: ['favourable'], plain: 'A difference that’s better for profit than planned.', concept: 'standard-cost' },
  { terms: ['adverse'], plain: 'A difference that’s worse for profit than planned.', concept: 'standard-cost' },
  { terms: ['standard cost'], plain: 'What one unit should cost, from a recipe of quantities and prices.', concept: 'standard-cost' },
  { terms: ['fifo'], plain: 'Treat the oldest stock as the first sold.', concept: 'inventory-methods' },
  { terms: ['lifo'], plain: 'Treat the newest stock as the first sold.', concept: 'inventory-methods' },
  { terms: ['avco', 'weighted average cost'], plain: 'Give every unit of stock the average cost of the lot.', concept: 'inventory-methods' },
  { terms: ['going concern'], plain: 'The assumption that the business will carry on, not close down tomorrow.', concept: 'conventions' },
  { terms: ['prudence'], plain: 'Don’t overstate: count likely losses early, gains only when fairly certain.', concept: 'conventions' },
  { terms: ['materiality'], plain: 'Only things big enough to change a decision need to be reported.', concept: 'qualities' },
  { terms: ['balanced scorecard'], plain: 'Tracking a business from four angles, not just money: finance, customers, processes, people.', concept: 'balanced-scorecard' },
  { terms: ['dual aspect'], plain: 'Every transaction has two sides, and both are recorded.', concept: 'dual-effect' },
];

const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const TERM_TO_ENTRY = new Map<string, GlossaryEntry>();
for (const e of GLOSSARY) for (const t of e.terms) TERM_TO_ENTRY.set(t.toLowerCase(), e);

/**
 * Longest terms first, so “trade receivables” wins over “receivables”. Group 1 is whatever precedes the term
 * (a lookbehind would be tidier, but older iPhones can’t parse one), group 2 is the term.
 */
export const TERM_REGEX = new RegExp(
  `(^|[^\\w-])(${[...TERM_TO_ENTRY.keys()].sort((a, b) => b.length - a.length).map(escape).join('|')})(?![\\w-])`,
  'gi',
);

export const entryFor = (term: string) => TERM_TO_ENTRY.get(term.toLowerCase());
