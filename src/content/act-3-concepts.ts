// Chapter III lessons: the income statement (Topic 3). A refresher, with the judgement calls behind profit.
import type { Concept } from '../engine/types';

const c = (x: Omit<Concept, 'act'>): Concept => ({ act: 3, ...x });

export const ACT3_CONCEPTS: Concept[] = [
  c({
    id: 'is-layout',
    name: 'Laying out the income statement',
    summary: 'Sales − cost of sales = gross profit; − operating expenses = operating profit; ± interest = profit for the period.',
    lesson: {
      plain: [
        'Profit = revenue for the period − the expenses incurred to earn it.',
        'The layout goes: sales revenue, less cost of sales, gives gross profit.',
        'Less the operating expenses (wages, rent, heat and light, depreciation and so on) gives operating profit.',
        'Add interest received and take off interest paid, and you have profit for the period.',
        'The income statement covers a period. Its profit is the change in equity from trading, which ends up in retained earnings on the balance sheet.',
      ],
      diagram: {
        kind: 'table',
        title: 'Income statement for the year (€)',
        head: ['', '€'],
        rows: [
          ['Sales revenue', '232,000'],
          ['Cost of sales', '(154,000)'],
          ['Gross profit', '78,000'],
          ['Operating expenses (salaries, rent, light, insurance, depreciation…)', '(53,400)'],
          ['Operating profit', '24,600'],
          ['Interest received', '2,000'],
          ['Interest on borrowings', '(1,100)'],
          ['Profit for the year', '25,500'],
        ],
        totals: [2, 4, 7],
      },
      traps: ['Buying a van, repaying a loan and paying a dividend are not expenses.', 'Gross margin = gross profit ÷ sales; net margin = net profit ÷ sales.'],
    },
  }),
  c({
    id: 'cost-of-sales',
    name: 'Cost of sales',
    summary: 'Opening inventory + purchases − closing inventory.',
    lesson: {
      plain: [
        'Cost of sales is the cost of what we sold, not of what we bought.',
        'Start with the stock we had (opening inventory), add what we bought, then take off what’s still on the shelves (closing inventory).',
        'That’s the jar rule again: opening + in − closing = out.',
        'For a maker, “purchases” becomes the cost of making: materials used, direct labour, manufacturing costs.',
      ],
      formula: { tex: '\\text{COS} = \\text{Opening inventory} + \\text{Purchases} - \\text{Closing inventory}' },
      example: { prompt: 'Opening inventory €40,000; bought €189,000; €75,000 left at the year end.', working: ['40,000 + 189,000 − 75,000 = 154,000'], answer: 'Cost of sales €154,000.' },
      traps: ['Closing inventory is subtracted, not added.', 'A bigger closing inventory means a smaller cost of sales and a bigger profit, which is why stock counts matter.'],
    },
  }),
  c({
    id: 'recognition',
    name: 'When revenue and expenses count',
    summary: 'Revenue when it’s earned and ownership passes; expenses matched to the revenue they helped earn.',
    lesson: {
      plain: [
        'Revenue is recognised when the economic benefits are probable, the amount can be measured reliably, and, for goods, ownership and control have passed to the buyer.',
        'Expenses follow the matching convention: include all, and only, the expenses that relate to this period’s revenue.',
        'Cash doesn’t decide either. A sale on credit is revenue now. A bill paid early isn’t this year’s expense.',
      ],
      traps: ['An order isn’t a sale. A sale happens when the goods are delivered and control passes.', 'A deposit received for next season is a liability until the goods are delivered.'],
    },
  }),
  c({
    id: 'accruals-prepayments',
    name: 'Accruals and prepayments',
    summary: 'Owe it but haven’t paid: an accrual (liability). Paid it but haven’t used it: a prepayment (asset).',
    lesson: {
      plain: [
        'If the expense is bigger than the cash paid, the difference is an accrual: a liability for what we still owe. Sales commission of €6,000 with €5,000 paid means an expense of €6,000 and an accrual of €1,000.',
        'If we’ve paid more than the expense, the difference is a prepayment: an asset, because the benefit is still to come. Rent of €16,000 for the year with €20,000 paid means an expense of €16,000 and a prepayment of €4,000.',
        'Each one touches all three statements: the expense in the income statement, the accrual or prepayment on the balance sheet, the cash in the cash flow statement.',
      ],
      diagram: {
        kind: 'table',
        title: 'Two quick cases (€)',
        head: ['', 'Expense', 'Cash paid', 'Balance sheet'],
        rows: [
          ['Sales commission', '6,000', '5,000', 'Accrual 1,000 (liability)'],
          ['Rent', '16,000', '20,000', 'Prepayment 4,000 (asset)'],
        ],
      },
      traps: ['The expense is always what belongs to the period, not what was paid.', 'In the cash flow statement, an increase in accruals is added; an increase in prepayments is deducted.'],
    },
  }),
  c({
    id: 'depreciation',
    name: 'Depreciation',
    summary: 'Spreads an asset’s cost over its useful life. Straight line: (cost − residual value) ÷ life.',
    lesson: {
      plain: [
        'Depreciation spreads the cost of a long-term asset over the years it helps earn revenue. It’s the matching convention at work.',
        'Four things go in: the cost, the useful life, the residual value, and the method.',
        'Straight line: (cost − residual value) ÷ useful life, the same every year.',
        'Reducing balance: a fixed percentage of the carrying amount each year, so more in the early years.',
        'The carrying amount is cost less accumulated depreciation. It isn’t a market value.',
      ],
      formula: { tex: '\\text{Depreciation} = \\frac{\\text{Cost} - \\text{Residual value}}{\\text{Useful life}}' },
      traps: ['Useful life and residual value are estimates. Changing them changes profit, which is why auditors check them.', 'Depreciation is not cash and not a fund for replacing the asset.'],
    },
  }),
  c({
    id: 'inventory-methods',
    name: 'Costing inventory: FIFO, AVCO, LIFO',
    summary: 'FIFO: oldest costs to cost of sales first. AVCO: weighted average. LIFO: newest first (not allowed under IFRS).',
    lesson: {
      plain: [
        'When identical items were bought at different prices, which cost goes to cost of sales?',
        'FIFO (first in, first out): treat the oldest as sold first. Closing inventory is at the latest prices.',
        'AVCO (weighted average): total cost ÷ total units, used for everything.',
        'LIFO (last in, first out): newest first. It isn’t allowed under IFRS, but it shows up in exam questions.',
        'When prices are rising, FIFO gives the lowest cost of sales and the highest profit, and LIFO the opposite.',
      ],
      example: {
        prompt: 'Opening 100 tonnes at €100; bought 500 at €110, then 800 at €120. Sold 900 tonnes.',
        working: ['FIFO: 100 × 100 + 500 × 110 + 300 × 120 = 101,000', 'AVCO: 161,000 ÷ 1,400 = €115 a tonne; 900 × 115 = 103,500', 'LIFO: 800 × 120 + 100 × 110 = 107,000'],
        answer: 'Cost of sales €101,000 (FIFO), €103,500 (AVCO) or €107,000 (LIFO).',
      },
      traps: ['The method changes both cost of sales and the inventory figure on the balance sheet.', 'Over the asset’s whole life, total profit is the same; only the timing differs.'],
    },
  }),
  c({
    id: 'provisions',
    name: 'Provisions',
    summary: 'An expense that’s uncertain in amount or timing but belongs to this period: bad debts, obsolete stock, legal claims, warranties.',
    lesson: {
      plain: [
        'Accruals are expenses we know about. A provision is for an expense that belongs to this period but is uncertain in amount or timing.',
        'Common ones: doubtful debts (customers who may not pay), stock obsolescence, legal claims, warranties.',
        'Making or raising a provision reduces profit. Releasing one that’s no longer needed increases profit.',
        'Provisions rest on judgement, so they’re where profit can be nudged.',
      ],
      traps: ['A provision is a non-cash expense: add it back in the cash flow statement.', 'Prudence asks for likely losses to be provided for, not for every imaginable one.'],
    },
  }),
  c({
    id: 'discretion',
    name: '“What would you like profit to be?”',
    summary: 'Directors’ estimates move profit; auditors, standards, consistency, disclosure and governance limit the room.',
    lesson: {
      plain: [
        'Profit isn’t a fact. It rests on estimates and choices: depreciation lives and residual values, provisions, inventory methods and write-downs, when revenue is recognised, and whether a cost is capitalised or expensed.',
        'Directors whose bonus depends on profit have a reason to lean on those choices: up this year, or saved for next.',
        'The safeguards: external auditors, who give an opinion on whether the accounts are true and fair. Accounting standards that narrow the choices. The consistency convention, and disclosure of accounting policies and any changes. Audit committees and independent non-executive directors. And regulators, company law, and professional codes of ethics.',
        'None is perfect. Estimates stay estimates, and auditors work from samples and from management’s explanations.',
      ],
      traps: ['Most discretion moves profit between years rather than creating it: release a provision now and there’s less to release later.', 'Comparing profit with operating cash flow is a quick test: profit that never turns into cash is a warning sign.'],
    },
  }),
  c({
    id: 'transactions',
    name: 'From a list of transactions to the accounts',
    summary: 'Sort each transaction into income statement, balance sheet and cash. Sales and costs count when they happen; cash counts when money moves.',
    lesson: {
      plain: [
        'A written question often gives you a year’s transactions and asks for the income statement, then the balance sheet. Work in this order and nothing gets lost.',
        'Income statement first. Sales are what was sold, paid or not. Cost of sales = inventory bought − inventory unsold at the year end. Expenses are what was incurred (paid + still owed), plus depreciation on the equipment. Then interest.',
        'Cash next, because it isn’t given. Add what came in (shares, loan, cash from customers = sales − what customers still owe) and take off what went out (equipment, cash to suppliers = purchases − what we still owe, interest, bills actually paid).',
        'Then the balance sheet. Equipment at cost less accumulated depreciation. Inventory, trade receivables and cash. Trade payables and accruals are current liabilities; the bank loan is non-current. Equity is share capital plus the year’s profit.',
        'Check: net assets = equity. If they differ by a round number, a transaction went to the wrong place.',
      ],
      example: {
        prompt: 'Sales €100,000, of which €20,000 is unpaid. Purchases €60,000, of which €10,000 is unpaid; €15,000 of inventory is unsold.',
        working: ['Cost of sales = 60,000 − 15,000 = 45,000', 'Cash from customers = 100,000 − 20,000 = 80,000', 'Cash to suppliers = 60,000 − 10,000 = 50,000'],
        answer: 'Cost of sales €45,000; customers paid €80,000; suppliers were paid €50,000.',
      },
      traps: ['Don’t put cash received in the income statement: it shows sales. Don’t put equipment, a loan or share capital in it at all.', 'An unpaid expense is still an expense: it’s an accrual on the balance sheet.', 'The year’s profit goes into equity as retained profit; the sales figure itself does not.'],
    },
  }),
];
