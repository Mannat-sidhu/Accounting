// Chapter VI lessons: cost–volume–profit analysis (Topic 6), following the course's formulas and worked examples.
import type { Concept } from '../engine/types';

const c = (x: Omit<Concept, 'act'>): Concept => ({ act: 6, ...x });

export const ACT6_CONCEPTS: Concept[] = [
  c({
    id: 'cost-behaviour',
    name: 'Fixed and variable costs',
    summary: 'Fixed costs stay the same as volume changes; variable costs move with it. Some costs are both.',
    lesson: {
      plain: [
        'CVP is a quick, broad-brush tool. It tells you how profit moves as you sell more or less.',
        'It starts with how costs behave. Fixed costs stay the same whatever the volume: the studio rent, salaried staff. Variable costs rise with every unit: the silk in each scarf, piece-rate pay.',
        'Some costs are semi-variable. Electricity has a standing charge (fixed) plus a charge for each unit used (variable).',
        '“Fixed” only holds within a time period and a range of output. Make ten times as many coats and you’ll need a bigger studio.',
      ],
      diagram: {
        kind: 'table',
        title: 'Costs of an online table seller (€500 price, €300 cost each, €40,000 rent)',
        head: ['Tables sold', 'Rent (fixed)', 'Tables (variable)', 'Total cost', 'Revenue'],
        rows: [
          ['5', '40,000', '1,500', '41,500', '2,500'],
          ['50', '40,000', '15,000', '55,000', '25,000'],
          ['100', '40,000', '30,000', '70,000', '50,000'],
          ['1,000', '40,000', '300,000', '340,000', '500,000'],
        ],
      },
      traps: ['Fixed doesn’t mean it never changes. It means it doesn’t change with volume, inside the relevant range.', 'Workers paid only for the hours they work are a variable cost.'],
    },
  }),
  c({
    id: 'contribution',
    name: 'Contribution',
    summary: 'Contribution per unit = price − variable cost per unit. It pays the fixed costs first, then becomes profit.',
    lesson: {
      plain: [
        'Every sale brings in its price and costs its variable cost. What’s left is the contribution per unit: price − variable cost per unit.',
        'Contribution goes first towards paying the fixed costs. Once they’re covered, every extra unit’s contribution is profit.',
        'The contribution margin ratio (CMR) is contribution as a share of sales: contribution ÷ sales revenue × 100%. It works per unit or in total.',
        'If you’re given totals, divide by the units first. Total sales ÷ units = price; total variable costs ÷ units = variable cost per unit.',
      ],
      formula: { tex: '\\text{CpU} = \\text{Price} - \\text{Variable cost per unit} \\qquad \\text{CMR} = \\frac{\\text{Contribution}}{\\text{Sales revenue}} \\times 100\\%' },
      example: {
        prompt: 'Baskets sell for €14. Materials are €2 each; each takes one hour at €10 an hour.',
        working: ['Variable cost per basket = 2 + 10 = 12', 'CpU = 14 − 12 = €2'],
        answer: '€2 per basket; CMR = 2 ÷ 14 = 14.3%.',
      },
      traps: ['Fixed costs never go into contribution per unit. Don’t divide the rent by the units.', 'Profit per unit isn’t a useful figure in CVP: it changes with every unit sold.'],
    },
  }),
  c({
    id: 'break-even',
    name: 'Break-even point',
    summary: 'Break-even units = fixed costs ÷ contribution per unit. Break-even revenue = fixed costs ÷ CMR.',
    lesson: {
      plain: [
        'The break-even point (BEP) is where total revenue equals total cost: no profit, no loss.',
        'In units: fixed costs ÷ contribution per unit. You need just enough units for their contribution to pay all the fixed costs.',
        'In value: fixed costs ÷ CMR. Or break-even units × price, which gives the same answer.',
        'On a break-even chart, fixed costs are a flat line. Total cost starts at the fixed costs and rises by the variable cost per unit. Revenue starts at zero and rises faster. They cross at break-even.',
      ],
      formula: { tex: '\\text{BEP (units)} = \\frac{\\text{Fixed cost}}{\\text{Price} - \\text{Variable cost per unit}} \\qquad \\text{BEP (value)} = \\frac{\\text{Fixed cost}}{\\text{CMR}}' },
      example: {
        prompt: 'Fixed costs €60,000 a year; price €20; variable cost €10 a unit.',
        working: ['CpU = 20 − 10 = 10', 'BEP = 60,000 ÷ 10 = 6,000 units', 'BEP value = 6,000 × 20 = €120,000 (or 60,000 ÷ 50%)'],
        answer: '6,000 units, €120,000 of sales.',
      },
      traps: ['Round break-even units up if you need a whole number of units to actually break even (428.6 baskets means 429).', 'Dividing fixed costs by the price, not the contribution, is the classic slip.'],
    },
  }),
  c({
    id: 'target-profit',
    name: 'Volume for a target profit',
    summary: 'Units = (fixed costs + target profit) ÷ contribution per unit. Value = (fixed costs + target profit) ÷ CMR.',
    lesson: {
      plain: [
        'To hit a target profit, contribution has to cover the fixed costs and the target.',
        'Units needed = (fixed costs + target profit) ÷ contribution per unit.',
        'Sales value needed = (fixed costs + target profit) ÷ CMR.',
      ],
      formula: { tex: 't = \\frac{\\text{Fixed cost} + \\text{Target profit}}{\\text{Price} - \\text{Variable cost per unit}}' },
      example: {
        prompt: 'Fixed costs €60,000, contribution €10 a unit, target profit €30,000.',
        working: ['(60,000 + 30,000) ÷ 10 = 9,000 units'],
        answer: '9,000 units.',
      },
      traps: ['Don’t forget the fixed costs. Target profit ÷ contribution only tells you the units beyond break-even.'],
    },
  }),
  c({
    id: 'margin-of-safety',
    name: 'Margin of safety',
    summary: '(Expected sales − break-even sales) ÷ expected sales × 100%: how far sales can fall before a loss.',
    lesson: {
      plain: [
        'The margin of safety is how far sales could fall from what we expect before we start making a loss.',
        'As a percentage: (expected sales − break-even sales) ÷ expected sales × 100%. Use units or value, but use the same in both.',
        'It’s a measure of risk. Airlines and hotels watch it closely: their fixed costs are huge, so a small drop in passengers or guests can wipe out profit.',
      ],
      formula: { tex: '\\text{MoS} = \\frac{\\text{Expected sales} - \\text{Break-even sales}}{\\text{Expected sales}} \\times 100\\%' },
      example: { prompt: 'Expected sales 9,000 units, break-even 6,000.', working: ['(9,000 − 6,000) ÷ 9,000 = 33.3%'], answer: 'Sales can fall a third before we make a loss.' },
      traps: ['Divide by expected sales, not by break-even sales.'],
    },
  }),
  c({
    id: 'operating-gearing',
    name: 'Operating gearing',
    summary: 'More fixed cost and less variable cost: a higher break-even point, but profit grows faster once past it.',
    lesson: {
      plain: [
        'Operating gearing is the mix of fixed and variable costs. High operating gearing means a lot of fixed cost and little variable cost.',
        'Take the basket maker. Renting a machine adds €2,500 a month of fixed cost but halves the labour, so contribution jumps from €2 to €7 a basket.',
        'At 500 baskets a month both ways make the same €500 profit. But with the machine, break-even rises from 250 to 429 baskets. That’s the risk.',
        'And the upside: a €4,000 monthly profit needs 2,250 baskets without the machine, and only 1,000 with it.',
        'High operating gearing businesses, like airlines, hotels and software firms, see profit swing hard with volume. Their key measures are volume ones: load factor, occupancy, users.',
      ],
      diagram: {
        kind: 'table',
        title: 'Basket maker: with and without the machine (a month)',
        head: ['', 'Without', 'With'],
        rows: [
          ['Fixed costs', '500', '3,000'],
          ['Contribution per basket', '2', '7'],
          ['Break-even (baskets)', '250', '429'],
          ['Profit at 500 baskets', '500', '500'],
          ['Baskets for €4,000 profit', '2,250', '1,000'],
        ],
      },
      traps: ['High operating gearing isn’t good or bad. It’s more risk and more reward from changes in volume.', 'Don’t mix it up with financial gearing, which is about debt.'],
    },
  }),
  c({
    id: 'sales-mix',
    name: 'More than one product: sales mix',
    summary: 'Assume a constant mix; use the weighted average contribution of one “bundle”.',
    lesson: {
      plain: [
        'With several products, assume the sales mix stays constant, and treat one “bundle” in that mix as a single product.',
        'Its contribution is the weighted average. Product X earns €12 and product Y €8, sold 50:50: (50% × 12) + (50% × 8) = €10.',
        'Break-even = fixed costs ÷ weighted contribution. €180,000 ÷ 10 = 18,000 units, split 9,000 X and 9,000 Y.',
        'If the real mix turns out 25:75, the weighted contribution is only €9, and break-even rises to 20,000 units. Watch the mix assumption.',
      ],
      formula: { tex: '\\text{BEP} = \\frac{\\text{Fixed costs}}{\\sum \\text{mix share} \\times \\text{CpU}}' },
      traps: ['If the mix shifts towards the lower-contribution product, break-even goes up.'],
    },
  }),
  c({
    id: 'cvp-limits',
    name: 'Limits of CVP',
    summary: 'It assumes straight lines, a constant mix and clean fixed/variable splits, within a relevant range.',
    lesson: {
      plain: [
        'CVP assumes everything else stays the same: the sales mix, efficiency, prices and methods.',
        'It assumes costs and revenues are straight lines. That only holds over a relevant range.',
        'It needs costs split cleanly into fixed and variable, and it’s for the medium term.',
        'In the real world, prices aren’t constant: discounts, dynamic pricing, bulk deals. Nor is variable cost per unit. Bulk discounts on materials push it down. Scarce resources push it up, like overtime at premium rates. Learning curves, and staff turnover that undoes them, shift labour cost per unit.',
        'So CVP gives directions, not exact answers. Test it with scenarios (best, base, worst) and sensitivities (what if price or cost moves ±10%?).',
      ],
      traps: ['In the exam, “describe two real-world factors” wants a factor and how it bends the line: bulk discounts lower variable cost per unit at higher volume.'],
    },
  }),
];
