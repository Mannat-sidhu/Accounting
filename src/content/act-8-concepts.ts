// Chapter VIII lessons: standard costing and variance analysis.
// Built from the variance slides, the Beltra class question and the Week 10 question bank. The formulas and sign
// convention are exactly those on the exam's formula sheet (the sheet is given on the day; CVP's is not).
import type { Concept } from '../engine/types';

const c = (x: Omit<Concept, 'act'>): Concept => ({ act: 8, ...x });

export const ACT8_CONCEPTS: Concept[] = [
  c({
    id: 'standard-cost',
    name: 'Standards, flexing and the profit bridge',
    summary: 'A standard is the target cost of one unit. Compare actual with the standard for the output actually made. Budgeted profit + favourable − adverse = actual profit.',
    lesson: {
      plain: [
        'A standard cost is a target set in advance: what one unit should cost if we work efficiently. The gap between standard and actual is a variance.',
        'Every cost comes from three things: volume × efficiency × rate. Re-covering the seats in a theatre: how many seats, how long each takes, what we pay an hour.',
        'Budgeted profit comes from the standard card. Contribution per unit = price − variable costs (materials, labour, variable overhead). Profit = units × contribution − fixed overhead.',
        'If we made a different number of units from the budget, the original budget is the wrong yardstick. Flex it: re-run the same standards for the output we actually made. Then the only differences left are real ones.',
        'The bridge: budgeted profit, plus every favourable variance, minus every adverse one, equals actual profit. If your bridge doesn’t land on actual profit, a variance is wrong.',
        'Feedback control compares results with the budget after the event and adjusts. Feedforward control forecasts the outcome now, compares it with the budget, and acts before it happens.',
      ],
      diagram: {
        kind: 'table',
        title: 'Flexing the budget (the figures change, the standards don’t)',
        head: ['', 'Original budget', 'Flexed budget', 'Actual'],
        rows: [
          ['Units', '1,000', '900', '900'],
          ['Sales', '100,000', '90,000', '92,000'],
          ['Materials (€1 a metre, 40 m a unit)', '(40,000)', '(36,000)', '(36,900)'],
          ['Labour (2.5 hours at €8)', '(20,000)', '(18,000)', '(17,500)'],
          ['Fixed overhead', '(20,000)', '(20,000)', '(20,700)'],
          ['Profit', '20,000', '16,000', '16,900'],
        ],
        totals: [5],
        caption: 'Budget to flexed: 4,000 lower profit just from selling 100 fewer. That’s the sales volume variance. Fixed overhead isn’t flexed.',
      },
      traps: [
        'Never compare actual cost with the original budget for a different volume. Flex it to the actual output first.',
        'Favourable isn’t always good news: cheap material that wastes more is a favourable price and an adverse usage variance.',
        'Fixed overhead is a lump sum. It isn’t “per unit” and it isn’t flexed.',
      ],
    },
  }),
  c({
    id: 'sales-variances',
    name: 'Sales price and volume variances',
    summary: 'Price: (actual − budget price) × actual quantity. Volume: (actual − budget quantity) × budgeted contribution per unit.',
    lesson: {
      plain: [
        'Sales price variance: (actual price − budget price) × actual quantity sold. Selling for more than planned is favourable.',
        'If you’re given total sales, the actual price = total sales ÷ units sold.',
        'Sales volume variance: (actual quantity − budget quantity) × budgeted contribution per unit. Selling more than planned is favourable.',
        'Volume is valued at contribution, not at price, because each extra unit adds only its contribution to profit: the variable costs have to be paid too. Contribution = price − material − labour − variable overhead.',
        'The two sales variances together explain the move from budgeted profit to the profit the actual sales should have earned.',
      ],
      formula: { tex: '(\\text{Actual Price} - \\text{Budget Price}) \\times \\text{Actual Quantity}', onSheet: true },
      example: {
        prompt: 'Budget 1,000 units at €100 (contribution €40); actual 900 units for €92,000.',
        working: ['Actual price = 92,000 ÷ 900 = 102.22', 'Price = (102.22 − 100) × 900 = 2,000 F', 'Volume = (900 − 1,000) × 40 = (4,000) A'],
        answer: 'Price €2,000 favourable; volume €4,000 adverse.',
      },
      traps: ['For sales, a positive answer is favourable. For costs, a positive answer is adverse. Say F or A every time.', 'Value volume at contribution per unit, not at the selling price.'],
    },
  }),
  c({
    id: 'material-variances',
    name: 'Materials price and usage variances',
    summary: 'Price: (actual price − standard price) × actual quantity purchased. Usage: (actual quantity used − standard quantity) × standard price.',
    lesson: {
      plain: [
        'Materials price (rate) variance: (actual price − standard price) × actual quantity purchased. Paying more per kilo than planned is adverse.',
        'Materials usage (quantity) variance: (actual quantity used − standard quantity for the output made) × standard price. Using more than the standard is adverse.',
        'The actual price = total cost ÷ quantity. The standard quantity = actual units made × standard per unit: 240,000 units at ½ kg is 120,000 kg.',
        'Price uses the quantity bought, because that is what the price applied to. Usage uses the quantity used and is valued at the standard price, so a price change can’t leak into it.',
        'Together they make the total materials variance: actual cost − standard cost of the output made.',
      ],
      formula: { tex: '(\\text{Actual Rate} - \\text{Budget Rate}) \\times \\text{Actual Quantity}', onSheet: true },
      example: {
        prompt: '37,000 m used and bought for €36,900; standard €1 a metre and 40 m a unit; 900 units made.',
        working: ['Actual price = 36,900 ÷ 37,000 = 0.9973', 'Price = (0.9973 − 1) × 37,000 = (100) F', 'Standard quantity = 900 × 40 = 36,000', 'Usage = (37,000 − 36,000) × 1 = 1,000 A'],
        answer: 'Price €100 favourable; usage €1,000 adverse. Total €900 adverse.',
      },
      traps: ['Price uses actual quantity; usage uses the standard price. Swap them and you’ll double-count.', 'Negative on a cost variance means the cost was below standard: favourable.'],
    },
  }),
  c({
    id: 'labour-variances',
    name: 'Labour rate and efficiency variances',
    summary: 'Rate: (actual rate − standard rate) × actual hours. Efficiency: (actual hours − standard hours) × standard rate.',
    lesson: {
      plain: [
        'Labour works just like materials, with hours in place of kilos.',
        'Labour rate variance: (actual rate per hour − standard rate) × actual hours. Actual rate = total pay ÷ hours worked.',
        'Labour efficiency variance: (actual hours − standard hours for the output made) × standard rate. Standard hours = actual units × standard hours per unit.',
        'Rate is about what we paid per hour; efficiency is about how many hours it took.',
      ],
      formula: { tex: '(\\text{Actual Quantity} - \\text{Standard Quantity}) \\times \\text{Budget Rate}', onSheet: true },
      example: {
        prompt: '2,150 hours cost €17,500; standard €8 an hour and 2.5 hours a unit; 900 units made.',
        working: ['Actual rate = 17,500 ÷ 2,150 = 8.1395', 'Rate = (8.1395 − 8) × 2,150 = 300 A', 'Standard hours = 900 × 2.5 = 2,250', 'Efficiency = (2,150 − 2,250) × 8 = (800) F'],
        answer: 'Rate €300 adverse; efficiency €800 favourable. Total €500 favourable.',
      },
      traps: ['Standard hours = actual units × standard hours per unit, not budgeted units.'],
    },
  }),
  c({
    id: 'overhead-variances',
    name: 'Overhead variances',
    summary: 'Variable overhead: same two as labour, using the overhead rate per hour. Fixed overhead: actual − budget.',
    lesson: {
      plain: [
        'Variable overhead moves with labour hours, so it has the same two variances as labour, using the overhead rate per hour.',
        'Variable overhead spending (rate) variance: (actual rate − standard rate) × actual hours. Actual rate = total variable overhead ÷ actual hours.',
        'Variable overhead efficiency variance: (actual hours − standard hours) × standard variable overhead rate. The hours are the same ones as in the labour efficiency variance, so the cause is the same too.',
        'Fixed overhead expenditure variance: actual − budgeted. It’s a straight difference of the two totals: no hours, no rates, and no flexing, because fixed costs don’t move with output.',
      ],
      formula: { tex: '\\text{Actual Fixed Overhead} - \\text{Budget Fixed Overhead}', onSheet: true },
      example: {
        prompt: '500,000 hours cost €495,000 of variable overhead (standard €1 an hour); 240,000 units at 2 hours. Fixed overhead €1,027,500 against €1,000,000 budgeted.',
        working: ['Spending = (495,000 ÷ 500,000 − 1) × 500,000 = (5,000) F', 'Efficiency = (500,000 − 480,000) × 1 = 20,000 A', 'Fixed = 1,027,500 − 1,000,000 = 27,500 A'],
        answer: 'Spending €5,000 favourable; efficiency €20,000 adverse; fixed €27,500 adverse.',
      },
      traps: ['Use the total fixed overhead as given. Don’t divide it by units or hours.', 'Variable overhead efficiency uses the overhead rate, not the labour rate.'],
    },
  }),
  c({
    id: 'variance-report',
    name: 'The statement for the managing director',
    summary: 'Budgeted profit, then every variance (F added, A deducted), grouped into sales and cost variances, to actual profit.',
    lesson: {
      plain: [
        'A variance report starts at budgeted profit and walks to actual profit, one variance at a time. Favourable variances are added; adverse ones are deducted.',
        'The usual layout: budgeted profit; the two sales variances (price, volume) with a subtotal; the cost variances (materials price and usage, labour rate and efficiency, variable overhead spending and efficiency, fixed overhead) with a subtotal; actual profit.',
        'Raw formula answers carry a sign you need to read. On a cost variance a positive answer is adverse; on a sales variance a positive answer is favourable. Convert each to F or A before it goes on the statement.',
        'Check the bridge: budgeted profit + net sales variances + net cost variances must equal the actual profit from the results. If not, one of the nine is wrong.',
      ],
      diagram: {
        kind: 'table',
        title: 'The report layout',
        head: ['', '€', '€'],
        rows: [
          ['Budgeted profit', '', '20,000'],
          ['Sales price variance', '2,000 F', ''],
          ['Sales volume variance', '4,000 A', '(2,000)'],
          ['Materials price variance', '100 F', ''],
          ['Materials usage variance', '1,000 A', ''],
          ['Labour rate variance', '300 A', ''],
          ['Labour efficiency variance', '800 F', ''],
          ['Fixed overhead variance', '700 A', '(1,100)'],
          ['Actual profit', '', '16,900'],
        ],
        totals: [0, 8],
      },
      traps: ['Don’t add an adverse variance because its raw answer was positive. Check which kind of variance it is.', 'A zero variance still gets a line: it shows you checked.'],
    },
  }),
  c({
    id: 'variance-causes',
    name: 'Why variances happen',
    summary: 'Variances point at questions: who bought what, who used what, and why. They’re often linked.',
    lesson: {
      plain: [
        'A variance doesn’t explain itself. It points at a question for someone.',
        'Materials price: unexpected market changes, quantity discounts, buying lower-quality material. Materials usage: waste from inferior material, higher-quality material than allowed for, and the efficiency of the workers.',
        'Labour rate: a higher or lower grade of labour than the standard, or a pay rise. Labour efficiency: inferior or better-quality material, machine breakdowns, changed work practices.',
        'Variable overhead spending: changes in market prices, or a different grade of indirect labour. Variable overhead efficiency has the same causes as labour efficiency.',
        'Fixed overhead: inaccurate estimates in the budget, or unexpected changes in costs such as insurance.',
        'Variances are often linked. Cheaper silk gives a favourable price, but if it frays more: an adverse usage and an adverse labour efficiency too.',
      ],
      traps: ['Don’t blame the buyer for an adverse usage variance, or the studio for an adverse price variance, until you know the cause.'],
    },
  }),
  c({
    id: 'variance-reverse',
    name: 'Working backwards, and what’s controllable',
    summary: 'Given a variance, you can work back to the actual rate or quantity. Hours lost to events outside anyone’s control are set aside before judging efficiency.',
    lesson: {
      plain: [
        'The formulas run both ways. If you’re told a labour rate variance and the hours, you can find the actual rate: variance ÷ hours = the difference per hour, then add it to the standard rate.',
        'Likewise a materials usage variance divided by the standard price gives the extra kilos used; add them to the standard quantity.',
        'Keep the sign straight: an adverse cost variance means the actual rate or quantity was above the standard.',
        'Sometimes part of a variance isn’t anyone’s fault. A power cut that idles the studio for 800 hours isn’t the production manager’s inefficiency. Set those hours aside and recalculate efficiency on the hours actually available to work.',
        'Report the idle hours separately, so the cost is visible but isn’t charged to the person who couldn’t control it.',
      ],
      example: {
        prompt: '20,000 hours worked for 4,900 units; standard 4 hours at €15. A power cut idled 800 hours.',
        working: ['Standard hours = 4,900 × 4 = 19,600', 'As reported: (20,000 − 19,600) × 15 = 6,000 A', 'Setting aside 800 hours: (19,200 − 19,600) × 15 = (6,000) F'],
        answer: 'Adverse €6,000 as reported; favourable €6,000 once the power cut is set aside.',
      },
      traps: ['Divide by the actual hours when working back to the rate, not the standard hours.', 'Setting hours aside changes the efficiency variance; it doesn’t change what was paid per hour.'],
    },
  }),
  c({
    id: 'standards-limits',
    name: 'Problems with standard costing',
    summary: 'Standards go out of date; factors may be beyond the manager’s control; responsibilities overlap; no incentive to beat the standard; perverse incentives.',
    lesson: {
      plain: [
        'Standards can quickly become outdated: prices, methods and technology move, and a stale standard produces variances that mean nothing.',
        'Factors beyond a manager’s control can drive a variance: a supplier’s price, a power cut, the weather.',
        'It’s difficult to demarcate responsibility. Poor material from purchasing causes high usage in the studio: whose variance is it?',
        'There’s no incentive to beat the standard. Once a team has hit it, there’s nothing to gain from going further.',
        'Standards can create perverse incentives. A buyer chasing a favourable price variance buys cheap, poor material; a manager chasing efficiency pushes staff too hard and quality falls.',
      ],
      traps: ['The fix isn’t “scrap standards”. It’s to review them, separate controllable from uncontrollable, and read the variances together.'],
    },
  }),
];
