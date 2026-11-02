// Chapter VIII lessons: variance analysis. No slides in the materials yet; the formulas and sign convention
// are exactly those on the exam's key ratios sheet. Check against the slides when they arrive.
import type { Concept } from '../engine/types';

const c = (x: Omit<Concept, 'act'>): Concept => ({ act: 8, ...x });

export const ACT8_CONCEPTS: Concept[] = [
  c({
    id: 'standard-cost',
    name: 'Standard costs and flexing',
    summary: 'A standard cost card says what one unit should use and cost. Compare actual with the standard for the actual output.',
    lesson: {
      plain: [
        'A standard cost card says what one unit should take: so many kilos of material at a budget rate, so many hours of labour at a budget rate.',
        'Variances compare what actually happened with what should have happened for the output we actually made. That’s the flexed budget.',
        'The standard quantity = actual units made × standard quantity per unit. If we made 280,000 units at 2.2 kg each, the standard is 616,000 kg.',
        'Each variance is either favourable (better for profit than planned) or adverse (worse).',
      ],
      traps: ['Never compare actual cost with the original budget for a different volume. Flex it to actual output first.', 'Favourable isn’t always good news: cheap material that wastes more is a favourable rate and an adverse quantity.'],
    },
  }),
  c({
    id: 'sales-variances',
    name: 'Sales price and volume variances',
    summary: 'Price: (actual price − budget price) × actual quantity. Volume: (actual − budget quantity) × budget contribution per unit.',
    lesson: {
      plain: [
        'Sales price variance: (actual price − budget price) × actual quantity sold. Selling for more than planned is favourable.',
        'Sales volume variance: (actual quantity − budget quantity) × budget contribution per unit. Selling more units than planned is favourable.',
        'Volume is valued at contribution, because each extra unit adds its contribution to profit, not its whole price.',
      ],
      formula: { tex: '(\\text{Actual Price} - \\text{Budget Price}) \\times \\text{Actual Quantity}', onSheet: true },
      example: { prompt: 'Budget price €10; actual price €9; actual sales 280,000 units.', working: ['(9 − 10) × 280,000 = (280,000)'], answer: '€280,000 adverse.' },
      traps: ['For sales, a positive number is favourable. For costs, a positive number is adverse. Say F or A every time.'],
    },
  }),
  c({
    id: 'material-variances',
    name: 'Materials rate and quantity variances',
    summary: 'Rate: (actual rate − budget rate) × actual quantity. Quantity: (actual quantity − standard quantity) × budget rate.',
    lesson: {
      plain: [
        'Materials rate variance: (actual rate − budget rate) × actual quantity. Paying more per kilo than planned is adverse.',
        'Materials quantity variance: (actual quantity − standard quantity) × budget rate. Using more kilos than the standard for actual output is adverse.',
        'If you’re given the total cost, the actual rate = total cost ÷ actual quantity.',
        'Together they add up to the total materials variance: actual cost − standard cost of actual output.',
      ],
      formula: { tex: '(\\text{Actual Rate} - \\text{Budget Rate}) \\times \\text{Actual Quantity}', onSheet: true },
      example: {
        prompt: '640,000 kg bought for €620,000; budget €1 a kg; standard 2.2 kg a unit; 280,000 units made.',
        working: ['Actual rate = 620,000 ÷ 640,000 = 0.96875', 'Rate = (0.96875 − 1) × 640,000 = (20,000): €20,000 F', 'Standard qty = 280,000 × 2.2 = 616,000', 'Quantity = (640,000 − 616,000) × 1 = 24,000: €24,000 A'],
        answer: 'Rate €20,000 favourable; quantity €24,000 adverse.',
      },
      traps: ['Rate uses actual quantity; quantity uses budget rate. Swap them and you’ll double-count.'],
    },
  }),
  c({
    id: 'labour-variances',
    name: 'Labour (and overhead) variances',
    summary: 'Rate: (actual − budget rate) × actual hours. Efficiency: (actual − standard hours) × budget rate.',
    lesson: {
      plain: [
        'Labour works just like materials, with hours in place of kilos.',
        'Labour rate variance: (actual rate per hour − budget rate) × actual hours.',
        'Labour efficiency variance: (actual hours − standard hours for actual output) × budget rate.',
        'Variable overhead works the same way, using the overhead rate per hour. The fixed overhead variance is simply actual − budget fixed overhead.',
      ],
      formula: { tex: '(\\text{Actual Quantity} - \\text{Standard Quantity}) \\times \\text{Budget Rate}', onSheet: true },
      traps: ['Standard hours = actual units × standard hours per unit.'],
    },
  }),
  c({
    id: 'variance-causes',
    name: 'Why variances happen',
    summary: 'Variances point at questions: who bought what, who used what, and why. They’re often linked.',
    lesson: {
      plain: [
        'A variance doesn’t explain itself. It points at a question for someone.',
        'Materials rate: supplier prices changed, or we bought a different quality. Materials quantity: waste, poor quality material, untrained staff, or a design change.',
        'Labour rate: overtime, a pay rise, or a different grade of staff. Labour efficiency: training, motivation, machine breakdowns, or poor material slowing the work.',
        'Variances are often linked. Cheaper silk gives a favourable rate, but if it frays more, an adverse quantity and adverse labour efficiency too.',
        'Sales price and volume are linked as well: cut the price and you may sell more.',
      ],
      traps: ['Don’t blame the buyer for an adverse quantity variance, or the studio for an adverse rate variance, until you know the cause.'],
    },
  }),
];
