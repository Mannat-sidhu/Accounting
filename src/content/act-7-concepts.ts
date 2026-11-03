// Chapter VII lessons: budgeting (Topic 7). Follows the course's slides: what a budget is, the planning and control
// cycle, benefits, the setting process, types and how they interlock, the cash budget, behavioural problems,
// criticisms, and zero-based, activity-based and beyond-budgeting approaches.
import type { Concept } from '../engine/types';

const c = (x: Omit<Concept, 'act'>): Concept => ({ act: 7, ...x });

export const ACT7_CONCEPTS: Concept[] = [
  c({
    id: 'budget-purpose',
    name: 'What a budget is, and why bother',
    summary: 'A plan of action in numbers for a set period. Benefits: planning, coordination and communication, motivation, control, authorisation.',
    lesson: {
      plain: [
        'A budget is a plan of action, expressed in numbers, for a set period. It helps co-ordinate what has to be done to carry the plan out.',
        'It can be in money, in units, or both. A sales budget can say “2,000 coats” and “€800,000”. Businesses, charities and public bodies all use them.',
        'Budgets sit inside a cycle. The strategy gives a long-term plan; the long-term plan gives this year’s budget; during the year we compare actual results with the budget; we respond to the differences (variances); and where needed we revise the plans.',
        'The benefits, in the course’s words, come in five groups. Planning: managers must think about how conditions might change, and deal with problems before they arise. Co-ordination and communication: every department sees how it fits with the others, and everyone knows what part they play and who is accountable.',
        'Motivation: taking part in setting it, and having a target to aim for. Control and performance evaluation: actual against budget points attention at the big differences (management by exception), and gives a yardstick for judging managers. And authorisation: the budget says what may be spent.',
      ],
      diagram: { kind: 'cycle', title: 'The planning and control loop', stops: ['Strategy', 'Annual budget', 'Actual results', 'Variances', 'Revise'], caption: 'The loop never stops: results feed back into the next plan.' },
      traps: [
        'A budget is a plan, not a forecast of what will happen, and not a promise.',
        'In “describe four benefits”, each needs a sentence on how it helps, not just its name.',
        'Budgets can cover non-financial things too: units, hours, headcount.',
      ],
    },
  }),
  c({
    id: 'budget-process',
    name: 'Setting the budget: steps and types',
    summary: 'Find the limiting factor first, budget sales (or that factor), draft the rest, coordinate, then the master budget. Operating, financial and master budgets.',
    lesson: {
      plain: [
        'The order matters. First someone must be made responsible for the process. Guidelines go out to managers. Then you find the key, or limiting, factor: whatever caps what the business can do, usually sales demand, but it could be silk supply or studio hours.',
        'The budget for that factor is prepared first, because every other budget hangs off it. Then draft budgets for the other areas, reviewed and co-ordinated so they fit. They combine into the master budgets, which are communicated to everyone. Then, through the year, you monitor actual performance against the budget.',
        'Budgets come in two families. Operating budgets: the revenue budget, all the cost budgets, culminating in the budgeted income statement. Financial budgets: the capital expenditure budget, the cash budget and the budgeted balance sheet. All of them together make the master budget.',
        'And they interlock. The sales budget drives the finished-inventory and production budgets. Production drives the raw-materials inventory and purchases budgets, direct labour and overheads. Sales also drive the receivables budget, purchases drive payables. Capex joins in too. All of it ends up in the cash budget, which is why the cash budget reflects the whole business more completely than any other single budget.',
        'Big businesses build their sales budget from the bottom: each region’s sales budget adds up to the overall one.',
      ],
      diagram: {
        kind: 'table',
        title: 'The budgets and what feeds what',
        head: ['Budget', 'Comes from', 'Feeds'],
        rows: [
          ['Sales budget', 'Demand (often the limiting factor)', 'Production, receivables, income statement'],
          ['Production budget', 'Sales + change in finished stock', 'Materials, labour, overheads'],
          ['Materials purchases', 'Production + change in materials stock', 'Payables, cash budget'],
          ['Capital expenditure', 'The plan for new assets', 'Cash budget, balance sheet'],
          ['Cash budget', 'All of the above', 'Overdraft or surplus decisions'],
        ],
      },
      traps: [
        'The first budget prepared is the limiting factor’s, not always sales.',
        'The cash budget is a financial budget, not an operating one. The budgeted income statement is an operating budget.',
        'Budgets are meant to be co-ordinated before they’re final: a sales target the factory can’t produce is useless.',
      ],
    },
  }),
  c({
    id: 'operating-budgets',
    name: 'Production and purchases budgets',
    summary: 'Production = sales + closing finished stock − opening. Purchases = production × usage + closing materials stock − opening.',
    lesson: {
      plain: [
        'The interlocking is arithmetic, and it is the same jar rule again: opening + in − out = closing.',
        'Finished stock jar: opening stock, plus what we produce, minus what we sell, gives closing stock. So production = sales + closing stock − opening stock.',
        'The materials jar works the same way. Materials needed = production × materials per unit. Purchases = materials needed + closing materials stock − opening materials stock.',
        'If we plan to end the year with more stock than we started with, we must produce more than we sell, and buy more than we use.',
      ],
      diagram: {
        kind: 'jar',
        title: 'Finished stock jar (units)',
        start: { label: 'Opening stock', value: 400 },
        ins: [{ label: 'Production' }],
        outs: [{ label: 'Sales', value: 5000 }],
        end: { label: 'Closing stock', value: 600 },
        caption: 'Production = 5,000 + 600 − 400 = 5,200 units.',
      },
      formula: { tex: '\\text{Purchases} = (\\text{Sales} + \\text{Closing FG} - \\text{Opening FG}) \\times \\text{usage} + \\text{Closing RM} - \\text{Opening RM}' },
      traps: ['Don’t buy exactly what the sales budget needs. Both stock levels move it.', 'Do the production budget first, then the materials.'],
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
  c({
    id: 'cash-budget',
    name: 'The cash budget',
    summary: 'Month by month: receipts − payments = surplus or shortfall; opening + surplus = closing, which opens next month.',
    lesson: {
      plain: [
        'The cash budget is the jar rule, one month at a time, and it’s the budget that shows the whole business, because everything eventually turns into cash.',
        'For each month: list the receipts, list every payment (suppliers, wages, electricity, other overheads, assets bought), add the payments up, and take them from the receipts. That’s the cash surplus (or shortfall, in brackets).',
        'Opening balance + surplus = closing balance. This month’s closing balance is next month’s opening.',
        'Only cash goes in. No depreciation, no provisions. A van bought in March is cash out in March, in full. Electricity bills that arrive quarterly show up in the months they’re paid.',
        'The point is to spot a shortfall early, so you can arrange an overdraft or move a payment. Smaller businesses may not budget much else, but they need this one.',
      ],
      diagram: {
        kind: 'table',
        title: 'The shape of a cash budget (€000)',
        head: ['', 'Jan', 'Feb', 'Mar', 'Apr'],
        rows: [
          ['Receipts from customers', '60', '52', '55', '55'],
          ['Total payments', '(42)', '(42)', '(68)', '(38)'],
          ['Cash surplus / (shortfall)', '18', '10', '(13)', '17'],
          ['Opening balance', '12', '30', '40', '27'],
          ['Closing balance', '30', '40', '27', '44'],
        ],
        totals: [2, 4],
        caption: 'March has a bigger bill: electricity and a new van. The balance still stays in credit.',
      },
      traps: ['Depreciation is never in a cash budget.', 'A profitable month can still be cash-negative.', 'A shortfall in brackets is still added: 40 + (13) = 27.'],
    },
  }),
  c({
    id: 'budget-behaviour',
    name: 'People and budgets',
    summary: 'Padding, “spend it or lose it”, short-termism, imposed targets, and bonus gaming all bend what managers do.',
    lesson: {
      plain: [
        'A budget changes how people behave, and not always for the better.',
        'Padding: building slack into your own budget so it’s easy to beat. “Spend it or lose it”: using up the budget before year end so it isn’t cut next year. Over-emphasis on short-term financial results, with non-financial aims overlooked and innovation shelved because it wasn’t budgeted.',
        'Imposed or participative? Budgets handed down from above get less buy-in than ones managers helped set. And a budget that is only a target gives no incentive to beat it.',
        'When bonuses ride on the budget, sales managers may sell to marginal customers, cut prices too deeply, or overload distributors with stock and take it back later.',
        'The cure is not “no budgets”, it’s good design: participation, balanced targets that include non-financial measures, and rewards that look past the single year.',
      ],
      traps: ['Describe the behaviour and its consequence: “padding makes the budget soft, so it no longer motivates or controls”.', 'Participation helps motivation, but budgets that managers set themselves can be padded.'],
    },
  }),
  c({
    id: 'budget-criticisms',
    name: 'Criticisms of budgeting',
    summary: 'Power concentrated at the top, protects rather than cuts costs, short-term, slow, inflexible, incremental, built round functions.',
    lesson: {
      plain: [
        'Traditional budgeting attracts a long list of criticisms. It concentrates power in the hands of senior managers. It protects costs rather than lowering them: last year’s spend becomes this year’s entitlement.',
        'It promotes sharp practices among managers. It focuses on short-term financial targets. It can’t cope with a fast-changing environment, because the plan is set once a year. It takes up a great deal of management time. It encourages incremental thinking, where this year’s budget is last year’s plus a few percent.',
        'And it’s built around business functions (marketing, production) rather than business processes (winning and fulfilling an order), though customers experience the process.',
      ],
      traps: ['In an exam, pick three or four and say why each hurts, with an example. A list of headings earns little.'],
    },
  }),
  c({
    id: 'budget-methods',
    name: 'Zero-based, activity-based and beyond budgeting',
    summary: 'ZBB justifies every item from scratch; ABB budgets by activity; beyond budgeting drops the fixed annual budget for adaptive, devolved planning.',
    lesson: {
      plain: [
        'Incremental budgeting takes last year’s figures and adds a little. It’s simple and common, especially in small firms, but it carries last year’s waste forward.',
        'Zero-based budgeting (ZBB): every item added to the budget must be justified from scratch. It encourages a more questioning approach. But it can be costly to implement and can make employees feel threatened.',
        'Activity-based budgeting (ABB): budgets are prepared by cost-driving activity rather than by function. It aims to authorise only the resources needed to perform the activities that meet budgeted volumes. That gives more accurate budgets and closer links between costs and who’s responsible. It suits support activities, where costs don’t vary with output volume and an incremental budget just turns them into fixed costs.',
        'Beyond budgeting: ditch the fixed annual budget. Planning becomes adaptive rather than fixed, goals are set against rolling benchmarks rather than a budget, and decisions are devolved rather than centralised. Few firms of any size use it so far.',
      ],
      diagram: {
        kind: 'table',
        title: 'Customer order processing: same €592k, two views',
        head: ['Conventional (by cost type)', '€000', 'Activity-based', '€000'],
        rows: [
          ['Salaries', '290', 'Vetting of customer', '90'],
          ['Office equipment depreciation', '84', 'Order taking', '114'],
          ['Travel and accommodation', '158', 'Customer agreements', '38'],
          ['Stationery and office supplies', '31', 'Quotations and pricing', '105'],
          ['Telephone', '29', 'Customer liaison', '91'],
          ['', '', 'Problem and error resolution', '84'],
          ['', '', 'Expediting', '70'],
          ['Total', '592', 'Total', '592'],
        ],
        totals: [7],
        caption: 'Same total. Only the activity view shows that errors and expediting cost €154k, which is a target for improvement.',
      },
      traps: ['ZBB isn’t “start with no budget”. It means each line must earn its place.', 'ABB changes how costs are grouped; the total doesn’t change.'],
    },
  }),
];
