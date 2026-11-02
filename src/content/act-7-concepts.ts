// Chapter VII lessons: budgeting. No slides for this topic in the materials yet; built from the past paper
// (Q3B: benefits of budgeting) and standard cash-budget practice. Check against the slides when they arrive.
import type { Concept } from '../engine/types';

const c = (x: Omit<Concept, 'act'>): Concept => ({ act: 7, ...x });

export const ACT7_CONCEPTS: Concept[] = [
  c({
    id: 'budget-purpose',
    name: 'Why budget?',
    summary: 'Planning, co-ordination, communication, motivation, control and performance evaluation.',
    lesson: {
      plain: [
        'A budget is the plan for the coming period, in money.',
        'It forces planning: thinking ahead about sales, costs and cash before they happen.',
        'It co-ordinates: the studio, the shop and purchasing all work to the same numbers. And it communicates: everyone knows what’s expected.',
        'It motivates, if the targets are realistic. It allows control, by comparing actual results with the budget each month (that’s variance analysis). And it gives a basis for evaluating managers’ performance and allocating resources.',
      ],
      traps: ['Targets set too high demotivate; too low and they waste the point.', 'In “describe four benefits”, each point needs a sentence on why it helps, not just the word.'],
    },
  }),
  c({
    id: 'cash-budget',
    name: 'The cash budget',
    summary: 'Month by month: receipts − payments = net cash flow; opening + net = closing, which becomes next month’s opening.',
    lesson: {
      plain: [
        'The cash budget is the jar rule, one month at a time.',
        'For each month: list cash in (receipts), list cash out (payments), and take one from the other to get the net cash flow.',
        'Opening balance + net cash flow = closing balance. This month’s closing is next month’s opening.',
        'Only cash goes in. No depreciation, no provisions. Include capital spending, loans and tax when they’re actually paid.',
        'The point is to spot a shortfall early, so you can arrange an overdraft or move a payment before the bank bounces anything.',
      ],
      diagram: {
        kind: 'table',
        title: 'The shape of a cash budget (€’000)',
        head: ['', 'Oct', 'Nov', 'Dec'],
        rows: [
          ['Receipts from customers', '42', '55', '80'],
          ['Payments', '(59)', '(90)', '(70)'],
          ['Net cash flow', '(17)', '(35)', '10'],
          ['Opening balance', '25', '8', '(27)'],
          ['Closing balance', '8', '(27)', '(17)'],
        ],
        totals: [2, 4],
      },
      traps: ['Depreciation is never in a cash budget.', 'A profitable month can still be a cash-negative month.'],
    },
  }),
  c({
    id: 'receipts-timing',
    name: 'Receipts and credit terms',
    summary: 'Split each month’s sales by when the cash arrives: this month, next month, the month after.',
    lesson: {
      plain: [
        'Customers on credit pay later, so receipts lag sales.',
        'If 40% pay in the month of sale and 60% the month after, November’s receipts = 40% of November’s sales + 60% of October’s.',
        'Write the pattern out as a little grid, one row per month of sale. Each month’s receipts are a column sum.',
        'Payments to suppliers work the same way: bought on one month’s credit, paid the following month.',
      ],
      formula: { tex: '\\text{Receipts}_{m} = 40\\% \\times \\text{Sales}_{m} + 60\\% \\times \\text{Sales}_{m-1}' },
      traps: ['The first month’s receipts include money from sales made before the budget starts.', 'Bad debts never arrive: take them out of the pattern.'],
    },
  }),
];
