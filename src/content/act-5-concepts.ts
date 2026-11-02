// Chapter V lessons: analysing and interpreting financial statements, and liquidity management (Topic 5).
// Ratio definitions follow the exam's key ratios sheet; the slides' wording is noted where it differs.
import type { Concept } from '../engine/types';

const c = (x: Omit<Concept, 'act'>): Concept => ({ act: 5, ...x });

export const ACT5_CONCEPTS: Concept[] = [
  c({
    id: 'ratio-families',
    name: 'Ratios and what they’re compared with',
    summary: 'Five families: profitability, efficiency, liquidity, gearing, investment. A ratio means nothing without a benchmark.',
    lesson: {
      plain: [
        'A ratio puts two numbers from the accounts side by side, so you can compare businesses of different sizes, or the same business over time.',
        'They come in five families: profitability (how much profit from sales or capital), efficiency (how fast stock and debts turn over), liquidity (can we pay the bills due soon), gearing (how much is borrowed), and investment (what shareholders get).',
        'On its own a ratio tells you almost nothing. Compare it with past years, with the plan, or with similar businesses.',
        'Context matters too. A current ratio below 1 sounds alarming, but a supermarket that’s paid in cash today and pays its suppliers in 60 days can run like that safely.',
      ],
      traps: [
        'Always say what you’re comparing with: “down from 45% last year”, “below the industry’s 30 days”.',
        'The exam gives you the key ratios sheet. Learn what each one means and what moves it, not just the formula.',
      ],
    },
  }),
  c({
    id: 'profitability',
    name: 'Profitability ratios',
    summary: 'Gross and operating margin (profit ÷ sales); ROCE (operating profit ÷ capital employed); ROE (net profit ÷ equity).',
    lesson: {
      plain: [
        'Gross profit margin: gross profit ÷ sales × 100. How much of each euro of sales is left after the cost of the goods.',
        'Operating profit margin: operating profit ÷ sales × 100. What’s left after all the running costs too.',
        'Return on capital employed (ROCE): operating profit ÷ total capital employed × 100. Capital employed is equity plus long-term liabilities: all the long-term money in the business.',
        'Return on equity (ROE): net profit ÷ equity × 100. The return to the owners after interest has been paid.',
      ],
      diagram: {
        kind: 'table',
        title: 'Worked example',
        head: ['', '€', 'Ratio'],
        rows: [
          ['Sales revenue', '250,000', ''],
          ['Gross profit', '100,000', 'GP margin 40%'],
          ['Operating profit', '40,000', 'OP margin 16%'],
          ['Profit for the year (after 15,000 interest)', '25,000', ''],
          ['Equity', '200,000', 'ROE 12.5%'],
          ['Long-term debt', '300,000', ''],
          ['Total capital employed', '500,000', 'ROCE 8%'],
        ],
      },
      formula: { tex: '\\text{ROCE} = \\frac{\\text{Operating Profit}}{\\text{Total Capital Employed}} \\times 100\\%', onSheet: true },
      traps: [
        'ROCE uses operating profit (before interest), because capital employed includes the lenders’ money. ROE uses net profit, because equity is only the owners’ money.',
        'Capital employed = equity + non-current liabilities, which also equals total assets − current liabilities.',
      ],
    },
  }),
  c({
    id: 'efficiency',
    name: 'Efficiency ratios and the cash conversion cycle',
    summary: 'Inventory, debtor and creditor days; cash conversion cycle = inventory days + debtor days − creditor days.',
    lesson: {
      plain: [
        'Inventory days: average inventory ÷ cost of sales × 365. How long stock sits before it’s sold.',
        'Debtor days: average trade receivables ÷ credit sales × 365. How long customers take to pay.',
        'Creditor days: average trade payables ÷ cost of sales × 365. How long we take to pay suppliers.',
        'Put them together and you get the cash conversion cycle: inventory days + debtor days − creditor days. That’s the number of days our own cash is tied up between paying for stock and being paid for it.',
        'Every one of those days costs money, either interest on borrowing or interest we could have earned. That’s the cost of funding working capital.',
      ],
      formula: { tex: '\\text{Cash cycle} = \\text{Inventory days} + \\text{Debtor days} - \\text{Creditor days}' },
      example: {
        prompt: 'Inventory days 50, debtor days 60, creditor days 30.',
        working: ['Cash conversion cycle = 50 + 60 − 30 = 80 days'],
        answer: '80 days with our own cash tied up.',
      },
      traps: [
        'Use the average of the opening and closing balances when you have both. With only one balance sheet, use the closing figure and say so.',
        'The exam sheet puts creditor days over cost of sales. Some books use credit purchases. Use the sheet’s version unless the question says otherwise.',
        'Debtor days use credit sales only. Cash sales were never owed.',
      ],
    },
  }),
  c({
    id: 'liquidity',
    name: 'Liquidity ratios',
    summary: 'Current ratio = current assets ÷ current liabilities; acid test leaves out inventory.',
    lesson: {
      plain: [
        'Liquidity asks one question: can we pay what’s due in the next year?',
        'Current ratio: current assets ÷ current liabilities.',
        'Quick (acid test) ratio: (current assets − inventory) ÷ current liabilities. Inventory is left out because it can’t always be turned into cash quickly.',
        'Too low and bills may go unpaid. Too high and cash is sitting idle in stock and debtors, costing money.',
      ],
      formula: { tex: '\\text{Quick} = \\frac{\\text{Current Assets less Inventory}}{\\text{Current Liabilities}}', onSheet: true },
      traps: ['Ratios are a snapshot at one date. A business can dress up its year-end balance sheet.', 'What counts as “safe” depends on the industry. Compare like with like.'],
    },
  }),
  c({
    id: 'gearing-cover',
    name: 'Gearing and interest cover',
    summary: 'Gearing = long-term liabilities ÷ total capital employed; interest cover = operating profit ÷ interest.',
    lesson: {
      plain: [
        'Gearing: long-term liabilities ÷ total capital employed. How much of the long-term money is borrowed.',
        'Interest cover: operating profit ÷ interest expense. How many times profit could pay the interest bill.',
        'Borrowing cuts both ways. In good years, debt boosts the return to owners: ROE rises above ROCE. In bad years the interest still has to be paid, so owners’ returns fall faster.',
        'In the worked example, with no debt ROE was 8%. Swap €300,000 of equity for debt and ROE rose to 12.5%, but gearing went to 60% and interest cover fell to 2.67.',
      ],
      formula: { tex: '\\text{Interest Cover} = \\frac{\\text{Operating Profit}}{\\text{Interest Expense}}', onSheet: true },
      traps: ['Interest cover is “times”, not a percentage.', 'High gearing isn’t bad in itself: stable businesses can carry more debt. It’s about risk.'],
    },
  }),
  c({
    id: 'investor-ratios',
    name: 'Investment ratios',
    summary: 'EPS, P/E, dividend cover and dividend yield: what shareholders earn and get paid.',
    lesson: {
      plain: [
        'Earnings per share (EPS): earnings for the year ÷ number of shares in issue.',
        'Price/earnings (P/E): market price per share ÷ EPS. How many years of current earnings the market is paying for. High means the market expects growth.',
        'Dividend cover: earnings ÷ dividend declared. How many times the dividend could have been paid. Its flip side is the payout ratio: dividend ÷ earnings × 100.',
        'Dividend yield: dividend per share ÷ market price per share × 100. The cash return on the share price.',
      ],
      formula: { tex: '\\text{P/E} = \\frac{\\text{Market Price per share}}{\\text{Earnings per share}}', onSheet: true },
      traps: ['Earnings here means profit available to ordinary shareholders, after any preference dividend.', 'A high yield can mean the share price has fallen because the market expects trouble.'],
    },
  }),
  c({
    id: 'ratio-limits',
    name: 'Limits of ratios and earnings management',
    summary: 'Ratios depend on the comparison, the quality of the accounts, inflation and a single balance sheet date; managers can bend them.',
    lesson: {
      plain: [
        'Ratios have limits. Don’t rely on them alone. Choose the comparison carefully. They’re only as good as the accounts behind them. Balance sheet ratios are a snapshot at one date. Inflation can distort comparisons over time.',
        'Earnings management is when managers choose methods and estimates that don’t really reflect the business: changing how stock is valued, stretching depreciation lives, capitalising costs that should be expenses.',
        'So read the accounting policies and look for changes. Compare profit with cash flow: profit that never turns into cash is a warning sign. And do a proper analysis, not just one ratio.',
      ],
      traps: ['A sudden jump in margin with no jump in operating cash is worth a question.', 'When asked for “additional information”, think: comparisons, detail behind the balance, and what happened after the year end.'],
    },
  }),
  c({
    id: 'liquidity-management',
    name: 'Liquidity management: is it worth it?',
    summary: 'Cost v. benefit. The benefit is a smaller funding need (days saved × sales ÷ 365 × cost of funds) or a cheaper rate.',
    lesson: {
      plain: [
        'Questions often give you a few ways to get customers to pay faster and ask which ones help profit. Treat each as a cost–benefit sum: what it costs a year, against what it saves a year.',
        'Fewer debtor days means less money tied up. The money released = days saved ÷ 365 × credit sales. The saving = money released × cost of funds.',
        'Credit control: the cost is what you spend on it; the saving is the funding on the days cut.',
        'Prompt-payment discount: the cost is the discount given away (discount % × the sales that take it up); the saving is the funding on the days cut.',
        'Then add the two up, and say whether it helps profit or not.',
      ],
      formula: { tex: '\\text{Saving} = \\frac{\\text{Days saved}}{365} \\times \\text{Credit sales} \\times \\text{Cost of funds}' },
      example: {
        prompt: 'Credit sales €8,000,000, debtor days 70, cost of funds 8%. Spending €30,000 a year on credit control cuts debtor days to 50.',
        working: ['Days saved = 70 − 50 = 20', 'Money released = 20 ÷ 365 × 8,000,000 = 438,356', 'Saving = 438,356 × 8% = 35,068', 'Net = 35,068 − 30,000 = +5,068'],
        answer: 'A net saving of €5,068 a year: worth doing.',
      },
      traps: [
        'It’s linear, so you can go straight to the days saved. No need to work out the old and new funding costs separately.',
        'If you’re given the debtor balance, not the days, find the days first: receivables ÷ credit sales × 365.',
        'Say the answer in words: “a net cost of €5,000 a year, so not worth doing on profit grounds.”',
      ],
    },
  }),
  c({
    id: 'debt-finance-options',
    name: 'Invoice discounting and factoring',
    summary: 'Discounting borrows against invoices at a cheaper rate; factoring sells them for less than face value.',
    lesson: {
      plain: [
        'Invoice discounting: the bank lends against your unpaid invoices. You keep the customers and still chase them.',
        'It doesn’t cut debtor days. It cuts the rate you pay to fund them. Amount borrowed = receivables × eligible % × advance rate. The saving = amount borrowed × (your cost of funds − the facility’s rate). The cost is the facility fee. Check any limit on the facility.',
        'Invoice factoring: you sell the invoices to a factor for, say, 96% of face value. You give up the 4% on everything factored, but those debts turn into cash at once, and you may save on credit control. You also lose the customer relationship.',
        'For factoring over a year, the cost is on the sales factored, not on the year-end balance.',
      ],
      formula: { tex: '\\text{Discounting saving} = \\text{Receivables} \\times \\text{eligible} \\times \\text{advance} \\times (r_{funds} - r_{facility})' },
      example: {
        prompt: 'Receivables €240,000; 75% eligible; 80% advance; facility rate 4%, fee €15,000; own cost of funds 10%.',
        working: ['Borrowed = 240,000 × 75% × 80% = 144,000', 'Saving = 144,000 × (10% − 4%) = 8,640', 'Net = 8,640 − 15,000 = (6,360)'],
        answer: 'A net cost of €6,360 a year: not worth it on profit.',
      },
      traps: ['Discounting changes the rate, not the days. Don’t also count days saved.', 'Factoring cost = (100% − price paid) × sales factored.'],
    },
  }),
];
