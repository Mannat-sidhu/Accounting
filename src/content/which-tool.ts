// "Which tool?" rounds. A question in the exam doesn't say which chapter it comes from. Each round here gives plain
// questions from the story and asks which part of the toolkit would answer them, using only the tools met so far.
import type { ClassifyProblem, ConceptId, Problem } from '../engine/types';

interface Tool {
  id: string;
  label: string;
  /** The chapter that teaches it. */
  chapter: number;
  concept: ConceptId;
  asks: string[];
}

const TOOLS: Tool[] = [
  {
    id: 'bs',
    label: 'Balance sheet',
    chapter: 2,
    concept: 'equation',
    asks: [
      'How much would be left for the owners if we sold everything and paid every debt?',
      'What do we own and owe on 31 December?',
      'Is the new van a long-term or a short-term asset, and what do we still owe on it?',
      'Which of our debts fall due within the year and which later?',
      'What is the owners’ stake once everyone we owe has been paid?',
    ],
  },
  {
    id: 'is',
    label: 'Income statement',
    chapter: 3,
    concept: 'is-layout',
    asks: [
      'Did we make a profit last year, and how much?',
      'What did the goods we actually sold cost us, given the stock still on the shelves?',
      'How much of the new equipment’s cost belongs to this year?',
      'An electricity bill for December arrives in January. Whose year is it in?',
      'Which inventory method flatters profit when prices are rising?',
      'Theo’s bonus is on profit. How much room is there to flatter it?',
    ],
  },
  {
    id: 'cf',
    label: 'Cash flow statement',
    chapter: 4,
    concept: 'cash-v-profit',
    asks: [
      'Profit is up but the bank balance is down. Where did the money go?',
      'How much cash did trading produce after paying suppliers and waiting for customers?',
      'Was the new equipment paid for from trading or from borrowing?',
      'How much tax did we actually pay, as opposed to the charge in the income statement?',
      'What cash is left after the spending needed to keep the equipment going?',
      'By how much did cash and cash equivalents change in the year?',
    ],
  },
  {
    id: 'ratio',
    label: 'Ratios',
    chapter: 5,
    concept: 'liquidity',
    asks: [
      'Can we pay what falls due over the next twelve months?',
      'How many days of sales are customers sitting on?',
      'How heavily is the business borrowed, compared with all its funding?',
      'How many times does operating profit cover the interest?',
      'How much of each euro of sales is left after the cost of goods?',
      'What return are we earning on the money tied up in the business?',
    ],
  },
  {
    id: 'liq',
    label: 'Liquidity proposals',
    chapter: 5,
    concept: 'liquidity-management',
    asks: [
      'Is paying €15,000 a year for a credit controller worth the interest it saves?',
      'A bank offers to advance 80% of our invoices at 3%. Is the fee worth it?',
      'Should we give 1% off to customers who pay within 15 days?',
      'Would selling our invoices to a factor for 97% of their value pay?',
      'How much cash would be released, and how much interest saved, by cutting debtor days by 10?',
    ],
  },
  {
    id: 'cvp',
    label: 'Cost–volume–profit',
    chapter: 6,
    concept: 'break-even',
    asks: [
      'How many scarves must we sell before we stop making a loss?',
      'How far can sales fall before we start losing money?',
      'If we cut the price and sell more, will profit rise?',
      'How many units give us a profit of €100,000?',
      'Should we pay a fixed fee for a service that cuts the cost of each unit?',
      'What does each extra unit add towards fixed costs and profit?',
    ],
  },
  {
    id: 'budget',
    label: 'Budgets',
    chapter: 7,
    concept: 'cash-budget',
    asks: [
      'Will we need an overdraft in February?',
      'How much cash arrives in March from sales made on credit in the last two months?',
      'How much silk should we order for next season, given what’s in stock?',
      'Why would a manager pad a budget, or spend the last of it in November?',
      'Would starting from zero each year, rather than from last year’s numbers, help?',
      'What will customers still owe us at the end of the quarter?',
    ],
  },
  {
    id: 'var',
    label: 'Variance analysis',
    chapter: 8,
    concept: 'standard-cost',
    asks: [
      'Profit came in under budget: was it price, usage or volume?',
      'We used more silk than we should have for the coats we made. What is that worth?',
      'Wages were higher than planned: was it the rate or the hours?',
      'Why does the budget have to be re-worked for the units actually made?',
      'How do we explain the gap between budgeted and actual profit, line by line?',
      'Does a power cut count against the studio’s efficiency?',
    ],
  },
  {
    id: 'bsc',
    label: 'Scorecard and non-financial measures',
    chapter: 9,
    concept: 'financial-limits',
    asks: [
      'Staff are leaving and complaints are rising, but profit is fine. How do we track that?',
      'Which numbers would show next year’s problems today?',
      'How do we turn our strategy into targets across customers, processes and people?',
      'How do customers see our delivery times, and what are we doing about it?',
      'Why shouldn’t we judge the business on profit alone?',
    ],
  },
];

export const WHICH_TOOL_FIRST = 2;

/** One round per chapter, covering that chapter and all those before it. */
function build(upTo: number): ClassifyProblem {
  const tools = TOOLS.filter((t) => t.chapter <= upTo);
  return {
    kind: 'classify',
    id: `which-tool-${upTo}`,
    title: 'Which tool?',
    host: 'margaux',
    concept: TOOLS.find((t) => t.chapter === upTo)!.concept,
    prompt: ['Questions come in plain words, not under a heading. For each, which part of the toolkit would answer it?'],
    categories: tools.map((t) => ({ id: t.id, label: t.label })),
    items: tools.flatMap((t) => t.asks.map((text) => ({ text, category: t.id, why: `That’s a job for the ${t.label.toLowerCase()}.`, concept: t.concept }))),
    show: 8,
  };
}

export const WHICH_TOOL_PROBLEMS: Problem[] = Array.from({ length: 8 }, (_, i) => build(i + WHICH_TOOL_FIRST));
export const isWhichTool = (id: string) => id.startsWith('which-tool-');
