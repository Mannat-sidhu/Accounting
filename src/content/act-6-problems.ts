// Chapter VI problems: cost–volume–profit. Base numbers follow the course examples (Cottage Industries,
// the €60k/€20/€10 example, the X/Y sales mix); the boss uses the past paper's silk tie maker.
import * as A from '../engine/accounting';
import { eur } from '../engine/format';
import { pickInt, pickOne } from '../engine/rng';
import type { BriefProblem, ClassifyProblem, Problem } from '../engine/types';
import { defineCalc, w0, w2, whys } from './helpers';

/** One product's numbers. `totals` means the story gives total sales and total variable cost for `units`. */
export interface CvpP {
  product: string;
  unit: string;
  price: number;
  vc: number;
  fixed: number;
  /** Expected (budget) units. */
  units: number;
  totals?: boolean;
  target?: number;
  /** For "units" or "value" answers. */
  mode?: 'units' | 'value';
  period: string;
}

const COTTAGE: CvpP = { product: 'baskets', unit: 'baskets', price: 14, vc: 12, fixed: 500, units: 500, period: 'a month' };
const SCARVES: CvpP = { product: 'silk scarves', unit: 'scarves', price: 20, vc: 10, fixed: 60000, units: 9000, target: 30000, period: 'a year' };
/** The past paper's silk ties: totals for 100,000 units. */
export const KNOTTED: CvpP = { product: 'silk ties', unit: 'ties', price: 86.6, vc: 46.6, fixed: 2440000, units: 100000, totals: true, target: 3200000, period: 'a year' };

export const varyCvp = (rng: () => number): CvpP => {
  const price = pickInt(rng, 20, 400, 5);
  const vc = Math.round(price * (0.35 + rng() * 0.4));
  const cpu = price - vc;
  const fixed = pickInt(rng, 20, 200, 5) * 1000;
  const be = fixed / cpu;
  return {
    product: pickOne(rng, ['silk scarves', 'wool coats', 'leather belts', 'linen shirts']),
    unit: 'units',
    price,
    vc,
    fixed,
    units: Math.round((be * (1.15 + rng() * 0.8)) / 10) * 10,
    totals: rng() < 0.4,
    target: pickInt(rng, 10, 150, 5) * 1000,
    mode: pickOne(rng, ['units', 'value'] as const),
    period: 'a year',
  };
};

const chart = (p: CvpP, fixed = p.fixed, vc = p.vc) => ({ price: p.price, varCost: vc, fixed, budget: p.units, unitLabel: p.unit });

/** The story lines that give the cost data, per unit or as totals. */
const costLines = (p: CvpP) =>
  p.totals
    ? `Budget for ${p.period}: ${w0(p.units)} ${p.unit}. Sales ${eur(p.price * p.units)}, variable costs ${eur(p.vc * p.units)}, fixed costs ${eur(p.fixed)}.`
    : `Each sells for ${eur(p.price, 2)} and costs ${eur(p.vc, 2)} in variable costs. Fixed costs are ${eur(p.fixed)} ${p.period}. We expect to sell ${w0(p.units)}.`;

const priceInput = (p: CvpP) => ({
  key: 'P',
  symbol: '\\text{Price}',
  label: 'Selling price per unit',
  unit: 'eur' as const,
  expected: p.price,
  explain: p.totals ? `${w0(p.price * p.units)} ÷ ${w0(p.units)} = ${w2(p.price)}.` : `${eur(p.price, 2)}.`,
});
const vcInput = (p: CvpP) => ({
  key: 'V',
  symbol: '\\text{VC}',
  label: 'Variable cost per unit',
  unit: 'eur' as const,
  expected: p.vc,
  explain: p.totals ? `${w0(p.vc * p.units)} ÷ ${w0(p.units)} = ${w2(p.vc)}.` : `${eur(p.vc, 2)}.`,
});
const fixedInput = (p: CvpP, f = p.fixed) => ({ key: 'F', symbol: '\\text{Fixed}', label: 'Fixed costs', unit: 'eur' as const, expected: f, explain: `${eur(f)}.` });

// ---------------------------------------------------------------- sorting

export const fixedVariable: ClassifyProblem = {
  kind: 'classify',
  id: 'fixed-variable',
  title: 'Fixed or variable?',
  host: 'margaux',
  concept: 'cost-behaviour',
  prompt: ['Before any break-even sums, sort the costs. If we made twice as many scarves next month, which of these would go up?'],
  categories: [
    { id: 'fixed', label: 'Fixed' },
    { id: 'variable', label: 'Variable' },
    { id: 'semi', label: 'Semi-variable' },
  ],
  show: 7,
  items: [
    { text: 'Rent on the studio', category: 'fixed', why: 'The same however many scarves we make.' },
    { text: 'Silk in each scarf', category: 'variable', why: 'Twice the scarves, twice the silk.' },
    { text: 'Margaux’s salary', category: 'fixed', why: 'A salary doesn’t change with output.' },
    { text: 'Piece-rate pay to the seamstresses', category: 'variable', why: 'Paid per item made.' },
    { text: 'Electricity: a standing charge plus a charge per unit used', category: 'semi', why: 'A fixed element and a variable element.' },
    { text: 'Insurance on the building', category: 'fixed', why: 'Doesn’t depend on volume.' },
    { text: 'Packaging and postage on each order', category: 'variable', why: 'One lot per order.' },
    { text: 'Sales staff on a basic salary plus commission on each sale', category: 'semi', why: 'Salary is fixed; commission is variable.' },
    { text: 'Depreciation on the cutting machines (straight line)', category: 'fixed', why: 'Straight-line depreciation is the same every year.' },
    { text: 'Basket makers paid €10 an hour, only for hours worked', category: 'variable', why: 'No work, no pay: it moves with output.' },
  ],
};

// ---------------------------------------------------------------- contribution

export const cvpCpu = defineCalc<CvpP>({
  kind: 'calc',
  id: 'cvp-cpu',
  title: 'What does each one contribute?',
  host: 'theo',
  concept: 'contribution',
  base: COTTAGE,
  vary: varyCvp,
  build: (p) => {
    const cpu = A.contributionPerUnit(p.price, p.vc);
    const cmr = A.contributionRatio(p.price, p.vc);
    const profitPer = (p.units * cpu - p.fixed) / p.units;
    return {
      prompt: [{ who: 'theo', mood: 'happy', text: `Our ${p.product}! How much does each one actually make us?` }, costLines(p)],
      ask: 'What is the contribution per unit?',
      formula: {
        options: ['cpu', 'profit-per-unit', 'be-units'],
        correct: 'cpu',
        explain: 'Contribution per unit is price less variable cost per unit. Fixed costs stay out of it.',
      },
      inputs: [priceInput(p), vcInput(p)],
      solve: (v) => v.P - v.V,
      answer: { label: 'Contribution per unit', unit: 'eur', explain: `${w2(p.price)} − ${w2(p.vc)} = ${w2(cpu)}. CMR = ${w2(cmr)}%.`, tolerance: 0.01 },
      decision: {
        question: `Theo says each one makes us ${eur(profitPer, 2)} of profit (total profit ÷ units). Is that a useful figure to plan with?`,
        options: [
          { id: 'no', label: 'No: use contribution per unit' },
          { id: 'yes', label: 'Yes: it’s the profit per unit' },
        ],
        correct: 'no',
        why: whys('Profit per unit changes with volume, because the fixed costs are spread over more or fewer units.', 'Fixed costs are a variable cost per unit.', 'Contribution and profit are the same thing.'),
        correctWhy: 'w0',
        explain: `Each extra unit adds ${eur(cpu, 2)} of contribution. “Profit per unit” only holds at exactly ${w0(p.units)} units.`,
      },
      working: [...(p.totals ? [`Price = ${w0(p.price * p.units)} ÷ ${w0(p.units)} = ${w2(p.price)}`, `VC per unit = ${w0(p.vc * p.units)} ÷ ${w0(p.units)} = ${w2(p.vc)}`] : []), `Contribution per unit = ${w2(p.price)} − ${w2(p.vc)} = €${w2(cpu)}`],
      hints: { formula: 'Which costs change with each unit sold?', inputs: p.totals ? 'Divide the totals by the units.' : 'Price and variable cost, both per unit.', answer: 'Price − variable cost.', decision: 'What happens to “profit per unit” if we sell one more?' },
      outcomes: {
        no: { valueDelta: 500, news: 'The pricing meeting is run on contribution. It takes ten minutes.' },
        yes: { valueDelta: -500, news: 'Theo prices a bulk order off “profit per unit”. It undercounts what the order is worth.' },
      },
      cfoLine: `Contribution ${eur(cpu, 2)} per unit.`,
    };
  },
});

// ---------------------------------------------------------------- break-even

export const cvpBe = defineCalc<CvpP>({
  kind: 'calc',
  id: 'cvp-be',
  title: 'When do we stop losing money?',
  host: 'idris',
  concept: 'break-even',
  uses: ['contribution'],
  base: { ...SCARVES, mode: 'units' },
  vary: varyCvp,
  build: (p) => {
    const cpu = A.contributionPerUnit(p.price, p.vc);
    const be = A.breakEvenUnits(p.fixed, cpu);
    const value = p.mode === 'value';
    const ans = value ? A.breakEvenRevenue(p.fixed, p.price, p.vc) : be;
    const safe = p.units > be;
    return {
      prompt: [{ who: 'idris', text: `The ${p.product} line. How many do we have to sell before it stops losing money?` }, costLines(p)],
      ask: value ? 'What is the break-even point in sales revenue?' : `What is the break-even point in ${p.unit}?`,
      formula: value
        ? { options: ['be-revenue', 'be-units-price', 'target-units'], correct: 'be-revenue', explain: 'Break-even revenue = fixed costs ÷ CMR, the same as break-even units × price.' }
        : { options: ['be-units', 'be-units-price', 'target-units'], correct: 'be-units', explain: 'Fixed costs ÷ contribution per unit.' },
      inputs: [priceInput(p), vcInput(p), fixedInput(p)],
      solve: value ? (v) => (v.F / (v.P - v.V)) * v.P : (v) => v.F / (v.P - v.V),
      answer: value
        ? { label: 'Break-even revenue', unit: 'eur', explain: `${w0(p.fixed)} ÷ ${w2(cpu)} = ${w2(be)} units × ${w2(p.price)} = ${w0(ans)}.` }
        : { label: `Break-even (${p.unit})`, unit: 'count', explain: `${w0(p.fixed)} ÷ ${w2(cpu)} = ${w2(be)} ${p.unit}.`, tolerance: 1 },
      decision: {
        question: `We expect to sell ${w0(p.units)}. Keep the line?`,
        options: [
          { id: 'keep', label: 'Keep it' },
          { id: 'drop', label: 'Drop it' },
        ],
        correct: safe ? 'keep' : 'drop',
        why: whys(
          safe ? 'Expected sales are above break-even, so it makes a profit.' : 'Expected sales are below break-even, so it makes a loss.',
          'Any line with positive contribution makes a profit.',
          'Break-even doesn’t matter if sales are high.',
          'Its contribution still pays towards fixed costs (rent, salaries) that wouldn’t go away if we dropped it.',
        ),
        correctWhy: 'w0',
        alsoAccept: safe
          ? undefined
          : [
              {
                option: 'keep',
                why: 'w3',
                score: 1.5,
                note: 'A sharp real-world point: if the fixed costs stay whether or not the line runs, its contribution still helps. Defensible, if you can show the fixed costs are shared.',
              },
            ],
        explain: `Break-even is ${w0(Math.ceil(be))} ${p.unit}; we expect ${w0(p.units)}.`,
      },
      chart: chart(p),
      working: [`CpU = ${w2(p.price)} − ${w2(p.vc)} = ${w2(cpu)}`, `BEP = ${w0(p.fixed)} ÷ ${w2(cpu)} = ${w2(be)} ${p.unit}`, ...(value ? [`BEP value = ${w2(be)} × ${w2(p.price)} = €${w0(ans)}  (= fixed ÷ CMR)`] : [])],
      hints: { formula: 'How many contributions does it take to cover the fixed costs?', inputs: 'Price and variable cost per unit, and the fixed costs.', answer: value ? 'Units at break-even × price.' : 'Fixed ÷ (price − variable cost).', decision: 'Compare expected sales with break-even.' },
      outcomes: {
        keep: { valueDelta: safe ? 2000 : -3000, news: safe ? `The ${p.product} line clears break-even by the autumn.` : `The ${p.product} line loses money all year.` },
        drop: { valueDelta: safe ? -2000 : 2000, news: safe ? 'A profitable line dropped. A rival picks it up.' : 'The line is quietly dropped before it costs any more.' },
      },
      cfoLine: `Break-even ${w0(Math.ceil(be))} ${p.unit}.`,
    };
  },
});

export const cvpTarget = defineCalc<CvpP>({
  kind: 'calc',
  id: 'cvp-target',
  title: 'Hitting Idris’s number',
  host: 'idris',
  concept: 'target-profit',
  uses: ['break-even'],
  base: SCARVES,
  vary: varyCvp,
  build: (p) => {
    const cpu = A.contributionPerUnit(p.price, p.vc);
    const target = p.target ?? 30000;
    const t = A.targetUnits(p.fixed, target, cpu);
    const reach = p.units >= t;
    return {
      prompt: [{ who: 'idris', text: `I want ${eur(target)} of profit from the ${p.product}, ${p.period}. How many is that?` }, costLines(p)],
      ask: `How many ${p.unit} must we sell for a profit of ${eur(target)}?`,
      formula: { options: ['target-units', 'target-units-wrong', 'be-units'], correct: 'target-units', explain: 'Contribution must cover the fixed costs and the target profit.' },
      inputs: [priceInput(p), vcInput(p), fixedInput(p), { key: 'T', symbol: '\\text{Target}', label: 'Target profit', unit: 'eur', expected: target, explain: `${eur(target)}.` }],
      solve: (v) => (v.F + v.T) / (v.P - v.V),
      answer: { label: `${p.unit} needed`, unit: 'count', explain: `(${w0(p.fixed)} + ${w0(target)}) ÷ ${w2(cpu)} = ${w2(t)}.`, tolerance: 1 },
      decision: {
        question: `We expect to sell ${w0(p.units)}. Can we promise Idris his number?`,
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'Not on current plans' },
        ],
        correct: reach ? 'yes' : 'no',
        why: whys(reach ? 'Expected sales reach the volume needed.' : 'Expected sales fall short of the volume needed.', 'Break-even is the same as the target.', 'Profit only depends on price.'),
        correctWhy: 'w0',
        explain: `We need ${w0(Math.ceil(t))}; we expect ${w0(p.units)}.`,
      },
      chart: chart(p),
      working: [`CpU = ${w2(p.price)} − ${w2(p.vc)} = ${w2(cpu)}`, `Units = (${w0(p.fixed)} + ${w0(target)}) ÷ ${w2(cpu)} = ${w2(t)}`],
      hints: { formula: 'Both the fixed costs and the target need covering.', answer: '(Fixed + target) ÷ CpU.', decision: 'Compare with expected sales.' },
      outcomes: {
        yes: { valueDelta: reach ? 1500 : -2500, news: reach ? 'Idris gets his number, and a little more.' : 'The house misses the promised profit. Idris remembers.' },
        no: { valueDelta: reach ? -1000 : 1500, news: reach ? 'Margaux undersells the plan; Idris looks elsewhere for growth.' : 'Margaux sets expectations early. Idris grumbles, but trusts the numbers.' },
      },
      cfoLine: `${w0(Math.ceil(t))} ${p.unit} for ${eur(target)} profit.`,
    };
  },
});

export const cvpMos = defineCalc<CvpP>({
  kind: 'calc',
  id: 'cvp-mos',
  title: 'How much room have we got?',
  host: 'aoife',
  concept: 'margin-of-safety',
  uses: ['break-even'],
  base: SCARVES,
  vary: varyCvp,
  build: (p) => {
    const cpu = A.contributionPerUnit(p.price, p.vc);
    const be = A.breakEvenUnits(p.fixed, cpu);
    const mos = A.marginOfSafetyPct(p.units, be);
    const comfy = mos >= 20;
    return {
      prompt: [{ who: 'aoife', text: `If sales of the ${p.product} disappoint, how far can they fall before you’re losing money?` }, costLines(p)],
      ask: 'What is the margin of safety, as a percentage of expected sales?',
      formula: { options: ['mos', 'mos-be', 'cvp-profit'], correct: 'mos', explain: '(Expected − break-even) ÷ expected.' },
      inputs: [
        { key: 'X', symbol: '\\text{Expected}', label: 'Expected sales (units)', unit: 'count', expected: p.units, explain: `${w0(p.units)}.` },
        { key: 'B', symbol: '\\text{BEP}', label: 'Break-even sales (units)', unit: 'count', expected: be, explain: `${w0(p.fixed)} ÷ ${w2(cpu)} = ${w2(be)}.` },
      ],
      solve: (v) => ((v.X - v.B) / v.X) * 100,
      answer: { label: 'Margin of safety', unit: 'pct', explain: `(${w0(p.units)} − ${w2(be)}) ÷ ${w0(p.units)} = ${w2(mos)}%.`, tolerance: 0.3 },
      decision: {
        question: 'Is that a comfortable cushion?',
        options: [
          { id: 'comfy', label: comfy ? 'Reasonably comfortable' : 'Tight' },
          { id: 'other', label: comfy ? 'Tight' : 'Reasonably comfortable' },
        ],
        correct: 'comfy',
        why: whys(comfy ? `Sales could fall ${w2(mos)}% before a loss.` : `A fall of only ${w2(mos)}% wipes out the profit.`, 'Margin of safety is the profit margin.', 'Only break-even matters, not the margin.'),
        correctWhy: 'w0',
        explain: `A ${w2(mos)}% margin of safety: sales can drop ${w0(p.units - be)} ${p.unit} before we make a loss.`,
      },
      chart: chart(p),
      working: [`BEP = ${w0(p.fixed)} ÷ ${w2(cpu)} = ${w2(be)}`, `MoS = (${w0(p.units)} − ${w2(be)}) ÷ ${w0(p.units)} × 100% = ${w2(mos)}%`],
      hints: { inputs: 'Find break-even first.', answer: 'Divide by expected sales, not by break-even.', decision: 'How far could sales fall?' },
      outcomes: {
        comfy: { valueDelta: 1000, news: 'Aoife notes the margin of safety in her file. Good sign.' },
        other: { valueDelta: -1000, news: 'The board misreads the risk on the line.' },
      },
      cfoLine: `Margin of safety ${w2(mos)}%.`,
    };
  },
});

// ---------------------------------------------------------------- what if? price cuts and operating gearing

interface WhatIfP extends CvpP {
  cut: number;
  lift: number;
  ask: 'profit' | 'be';
}

export const cvpWhatIf = defineCalc<WhatIfP>({
  kind: 'calc',
  id: 'cvp-whatif',
  title: 'Cut the price, sell more?',
  host: 'theo',
  concept: 'cvp-limits',
  uses: ['contribution', 'break-even'],
  base: { ...SCARVES, cut: 2, lift: 20, ask: 'profit' },
  vary: (rng) => {
    const p = varyCvp(rng);
    return { ...p, cut: Math.max(1, Math.round((p.price - p.vc) * (0.1 + rng() * 0.3))), lift: pickInt(rng, 5, 40, 5), ask: pickOne(rng, ['profit', 'be'] as const) };
  },
  build: (p) => {
    const cpu = A.contributionPerUnit(p.price, p.vc);
    const cpu2 = cpu - p.cut;
    const units2 = p.units * (1 + p.lift / 100);
    const before = A.profitAt(p.units, cpu, p.fixed);
    const after = A.profitAt(units2, cpu2, p.fixed);
    const be2 = A.breakEvenUnits(p.fixed, cpu2);
    const better = after > before;
    const profit = p.ask === 'profit';
    return {
      prompt: [{ who: 'theo', mood: 'happy', text: `Cut the price of the ${p.product} by ${eur(p.cut, 2)} and I’ll sell ${p.lift}% more. Guaranteed!` }, costLines(p)],
      ask: profit ? 'What would the revised budgeted profit be?' : `What would the revised break-even point be, in ${p.unit}?`,
      formula: profit
        ? { options: ['cvp-profit', 'profit-per-unit', 'target-units'], correct: 'cvp-profit', explain: 'New volume × new contribution per unit, less the unchanged fixed costs.' }
        : { options: ['be-units', 'be-units-price', 'mos'], correct: 'be-units', explain: 'Fixed costs ÷ the new, smaller contribution per unit.' },
      inputs: [
        { key: 'C', symbol: '\\text{New CpU}', label: 'New contribution per unit', unit: 'eur', expected: cpu2, explain: `(${w2(p.price)} − ${w2(p.cut)}) − ${w2(p.vc)} = ${w2(cpu2)}.` },
        ...(profit ? [{ key: 'U', symbol: '\\text{New units}', label: 'New sales volume', unit: 'count' as const, expected: units2, explain: `${w0(p.units)} × ${1 + p.lift / 100} = ${w0(units2)}.` }] : []),
        fixedInput(p),
      ],
      solve: profit ? (v) => v.U * v.C - v.F : (v) => v.F / v.C,
      answer: profit
        ? { label: 'Revised profit', unit: 'eur', explain: `${w0(units2)} × ${w2(cpu2)} − ${w0(p.fixed)} = ${w0(after)} (was ${w0(before)}).` }
        : { label: `Revised break-even (${p.unit})`, unit: 'count', explain: `${w0(p.fixed)} ÷ ${w2(cpu2)} = ${w2(be2)} (was ${w2(p.fixed / cpu)}).`, tolerance: 1 },
      decision: {
        question: 'Go with Theo’s price cut?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ],
        correct: better ? 'yes' : 'no',
        why: whys(
          better ? 'The extra volume more than makes up for the lower contribution on every unit.' : 'The lost contribution on every unit outweighs the extra volume.',
          'More sales always means more profit.',
          'A lower price lowers break-even.',
          'Profit dips now, but the extra customers and market share may pay off later.',
        ),
        correctWhy: 'w0',
        alsoAccept: better ? undefined : [{ option: 'yes', why: 'w3', score: 1, note: 'A real strategic argument, but the question is about this budget’s profit, which falls. Part marks.' }],
        explain: `Profit goes from ${eur(before)} to ${eur(after)}; break-even rises from ${w0(Math.ceil(p.fixed / cpu))} to ${w0(Math.ceil(be2))} ${p.unit}.`,
      },
      chart: chart({ ...p, price: p.price - p.cut, units: Math.round(units2) }),
      working: [`New CpU = ${w2(p.price - p.cut)} − ${w2(p.vc)} = ${w2(cpu2)}`, `New volume = ${w0(p.units)} × ${w2(1 + p.lift / 100)} = ${w0(units2)}`, `Revised profit = ${w0(units2)} × ${w2(cpu2)} − ${w0(p.fixed)} = ${w0(after)}`, `Revised BEP = ${w0(p.fixed)} ÷ ${w2(cpu2)} = ${w2(be2)}`],
      hints: { formula: 'Fixed costs don’t change. Contribution per unit does.', inputs: 'The whole price cut comes off contribution.', answer: profit ? 'Volume × CpU − fixed.' : 'Fixed ÷ new CpU.', decision: 'Compare old and new profit.' },
      outcomes: {
        yes: { valueDelta: better ? Math.round((after - before) / 10) : -Math.round((before - after) / 10), news: better ? 'The price cut pays off: the shop is busier and profit is up.' : 'The shop is busier, and profit is down.' },
        no: { valueDelta: better ? -1000 : 1500, news: better ? 'A rival cuts its price instead and takes the volume.' : 'The price stays. Theo’s “guarantee” is never tested.' },
      },
      cfoLine: `Price cut: profit ${eur(before)} → ${eur(after)}.`,
    };
  },
});

interface MachineP extends CvpP {
  rent: number;
  newVc: number;
  ask: 'profit' | 'be' | 'target';
}

export const cvpMachine = defineCalc<MachineP>({
  kind: 'calc',
  id: 'cvp-machine',
  title: 'Rent the machine?',
  host: 'theo',
  concept: 'operating-gearing',
  uses: ['break-even', 'target-profit'],
  base: { ...COTTAGE, rent: 2500, newVc: 7, target: 4000, ask: 'be' },
  vary: (rng) => {
    const vc = pickInt(rng, 8, 30);
    const price = vc + pickInt(rng, 2, 8);
    const fixed = pickInt(rng, 3, 20) * 100;
    const newVc = Math.round(vc * (0.4 + rng() * 0.35));
    const units = pickInt(rng, 3, 12) * 100;
    return { product: 'baskets', unit: 'baskets', price, vc, fixed, units, rent: Math.round(((price - newVc) - (price - vc)) * units * (0.6 + rng() * 0.6) / 100) * 100 || 500, newVc, target: pickInt(rng, 2, 8) * 1000, ask: pickOne(rng, ['profit', 'be', 'target'] as const), period: 'a month' };
  },
  build: (p) => {
    const cpu1 = p.price - p.vc;
    const cpu2 = p.price - p.newVc;
    const f2 = p.fixed + p.rent;
    const prof1 = A.profitAt(p.units, cpu1, p.fixed);
    const prof2 = A.profitAt(p.units, cpu2, f2);
    const be1 = p.fixed / cpu1;
    const be2 = f2 / cpu2;
    const target = p.target ?? 4000;
    const t2 = A.targetUnits(f2, target, cpu2);
    const t1 = A.targetUnits(p.fixed, target, cpu1);
    const ans = p.ask === 'profit' ? prof2 : p.ask === 'be' ? be2 : t2;
    return {
      prompt: [
        `We sell ${p.product} for ${eur(p.price)} each. Variable cost is ${eur(p.vc)} a basket (materials and the makers’ hourly pay). Fixed costs are ${eur(p.fixed)} a month, and we sell ${w0(p.units)} a month.`,
        { who: 'theo', mood: 'happy', text: `A machine we can rent for ${eur(p.rent)} a month would cut the labour so variable cost drops to ${eur(p.newVc)} a basket.` },
      ],
      ask: p.ask === 'profit' ? `What would the monthly profit be with the machine, at ${w0(p.units)} baskets?` : p.ask === 'be' ? 'What is the break-even point with the machine, in baskets a month?' : `How many baskets a month would we need, with the machine, for a profit of ${eur(target)}?`,
      formula:
        p.ask === 'profit'
          ? { options: ['cvp-profit', 'profit-per-unit', 'be-units'], correct: 'cvp-profit', explain: 'Units × new contribution, less the new, higher fixed costs.' }
          : p.ask === 'be'
            ? { options: ['be-units', 'be-units-price', 'target-units'], correct: 'be-units', explain: 'New fixed costs ÷ new contribution per unit.' }
            : { options: ['target-units', 'target-units-wrong', 'be-units'], correct: 'target-units', explain: '(New fixed costs + target) ÷ new contribution per unit.' },
      inputs: [
        { key: 'C', symbol: '\\text{New CpU}', label: 'Contribution per basket with the machine', unit: 'eur', expected: cpu2, explain: `${w0(p.price)} − ${w0(p.newVc)} = ${w0(cpu2)}.` },
        { key: 'F', symbol: '\\text{Fixed}', label: 'Fixed costs with the machine', unit: 'eur', expected: f2, explain: `${w0(p.fixed)} + ${w0(p.rent)} = ${w0(f2)}.` },
        ...(p.ask === 'profit' ? [{ key: 'U', symbol: '\\text{Units}', label: 'Baskets a month', unit: 'count' as const, expected: p.units, explain: `${w0(p.units)}.` }] : []),
        ...(p.ask === 'target' ? [{ key: 'T', symbol: '\\text{Target}', label: 'Target profit', unit: 'eur' as const, expected: target, explain: `${eur(target)}.` }] : []),
      ],
      solve: p.ask === 'profit' ? (v) => v.U * v.C - v.F : p.ask === 'be' ? (v) => v.F / v.C : (v) => (v.F + v.T) / v.C,
      answer:
        p.ask === 'profit'
          ? { label: 'Monthly profit with the machine', unit: 'eur', explain: `${w0(p.units)} × ${w0(cpu2)} − ${w0(f2)} = ${w0(prof2)} (without: ${w0(prof1)}).` }
          : p.ask === 'be'
            ? { label: 'Break-even with the machine (baskets)', unit: 'count', explain: `${w0(f2)} ÷ ${w0(cpu2)} = ${w2(be2)} (without: ${w2(be1)}).`, tolerance: 1 }
            : { label: 'Baskets needed with the machine', unit: 'count', explain: `(${w0(f2)} + ${w0(target)}) ÷ ${w0(cpu2)} = ${w2(t2)} (without: ${w2(t1)}).`, tolerance: 1 },
      decision: {
        question: 'What does the machine do to the business?',
        options: [
          { id: 'gearing', label: 'Raises break-even, but profit grows faster with volume' },
          { id: 'safer', label: 'Lowers break-even and makes it safer' },
          { id: 'nothing', label: 'Changes nothing: costs are costs' },
        ],
        correct: 'gearing',
        why: whys(
          'More fixed cost and less variable cost is higher operating gearing: more risk if volume falls, more profit if it grows.',
          'Lower variable costs always mean lower risk.',
          'Fixed and variable costs affect profit the same way.',
        ),
        correctWhy: 'w0',
        explain: `Break-even moves from ${w0(Math.ceil(be1))} to ${w0(Math.ceil(be2))} baskets. At ${w0(p.units)}, profit goes from ${eur(prof1)} to ${eur(prof2)}. For ${eur(target)} profit we’d need ${w0(Math.ceil(t1))} without and only ${w0(Math.ceil(t2))} with. That’s operating gearing: rent it if we’re confident volume will grow.`,
      },
      chart: { price: p.price, varCost: p.newVc, fixed: f2, budget: p.units, unitLabel: 'baskets' },
      working: [
        `Without: CpU ${w0(cpu1)}, BEP ${w0(p.fixed)} ÷ ${w0(cpu1)} = ${w2(be1)}, profit at ${w0(p.units)} = ${w0(prof1)}`,
        `With: CpU ${w0(cpu2)}, fixed ${w0(f2)}, BEP = ${w2(be2)}, profit at ${w0(p.units)} = ${w0(prof2)}`,
        `For ${w0(target)} profit: without ${w2(t1)}; with ${w2(t2)}`,
        `Answer: ${p.ask === 'profit' ? w0(ans) : w2(ans)}`,
      ],
      hints: { inputs: 'The rent adds to fixed costs; the labour saving lowers variable cost per unit.', answer: 'Same formulas, new numbers.', decision: 'What happens to break-even, and to profit at higher volumes?' },
      outcomes: {
        gearing: { valueDelta: 2000, news: 'Margaux rents the machine once the spring orders are confirmed.' },
        safer: { valueDelta: -1500, news: 'The machine goes in during a quiet month. Losses follow until the orders pick up.' },
        nothing: { valueDelta: -500, news: 'Nobody notices the break-even point has nearly doubled.' },
      },
      cfoLine: `Machine: break-even ${w0(Math.ceil(be1))} → ${w0(Math.ceil(be2))} baskets.`,
    };
  },
});

interface MixP {
  cx: number;
  cy: number;
  mx: number;
  fixed: number;
  actualMx: number;
}

export const salesMixCalc = defineCalc<MixP>({
  kind: 'calc',
  id: 'sales-mix',
  title: 'Coats and scarves together',
  host: 'margaux',
  concept: 'sales-mix',
  uses: ['break-even'],
  base: { cx: 12, cy: 8, mx: 50, fixed: 180000, actualMx: 25 },
  vary: (rng) => ({ cx: pickInt(rng, 8, 40), cy: pickInt(rng, 3, 20), mx: pickInt(rng, 20, 80, 10), fixed: pickInt(rng, 50, 400, 10) * 1000, actualMx: pickInt(rng, 10, 90, 5) }),
  build: ({ cx, cy, mx, fixed, actualMx }) => {
    const w = (mx / 100) * cx + (1 - mx / 100) * cy;
    const be = fixed / w;
    const w2a = (actualMx / 100) * cx + (1 - actualMx / 100) * cy;
    const be2 = fixed / w2a;
    const up = be2 > be;
    return {
      prompt: [`Two products. Coats contribute ${eur(cx)} each; scarves ${eur(cy)}. We plan to sell them ${mx}:${100 - mx}. Fixed costs are ${eur(fixed)} a year.`],
      ask: 'What is the break-even point, in total units, at the planned mix?',
      formula: { options: ['be-units', 'be-units-price', 'target-units'], correct: 'be-units', explain: 'Fixed costs ÷ the weighted-average contribution of one unit in the planned mix.' },
      stepNames: { formula: 'Pick the formula' },
      inputs: [
        { key: 'W', symbol: '\\text{Weighted CpU}', label: 'Weighted average contribution per unit', unit: 'eur', expected: w, explain: `(${mx}% × ${cx}) + (${100 - mx}% × ${cy}) = ${w2(w)}.` },
        { key: 'F', symbol: '\\text{Fixed}', label: 'Fixed costs', unit: 'eur', expected: fixed, explain: `${eur(fixed)}.` },
      ],
      solve: (v) => v.F / v.W,
      answer: { label: 'Break-even (total units)', unit: 'count', explain: `${w0(fixed)} ÷ ${w2(w)} = ${w2(be)}: ${w0(be * mx / 100)} coats and ${w0(be * (1 - mx / 100))} scarves.`, tolerance: 1 },
      decision: {
        question: `The actual mix turns out ${actualMx}:${100 - actualMx}. What happens to break-even?`,
        options: [
          { id: 'right', label: up ? 'It rises' : be2 < be ? 'It falls' : 'It stays the same' },
          { id: 'wrong', label: up ? 'It falls' : 'It rises' },
        ],
        correct: 'right',
        why: whys(
          up ? 'More of the lower-contribution product lowers the weighted contribution.' : 'More of the higher-contribution product raises the weighted contribution.',
          'Break-even doesn’t depend on the mix.',
          'Only fixed costs set break-even.',
        ),
        correctWhy: 'w0',
        explain: `At ${actualMx}:${100 - actualMx} the weighted contribution is ${eur(w2a, 2)}, so break-even is ${w0(Math.ceil(be2))} units.`,
      },
      working: [`Weighted CpU = (${mx}% × ${cx}) + (${100 - mx}% × ${cy}) = ${w2(w)}`, `BEP = ${w0(fixed)} ÷ ${w2(w)} = ${w2(be)} units`, `At the actual mix: ${w0(fixed)} ÷ ${w2(w2a)} = ${w2(be2)} units`],
      hints: { inputs: 'Weight each contribution by its share of the mix.', answer: 'Fixed ÷ weighted contribution.', decision: 'Which product carries more contribution?' },
      outcomes: {
        right: { valueDelta: 1000, news: 'Margaux tracks the mix monthly, not just the totals.' },
        wrong: { valueDelta: -1000, news: 'The board panics about coat sales that were actually fine for break-even.' },
      },
      cfoLine: `Break-even ${w0(Math.ceil(be))} units at plan mix.`,
    };
  },
});

// ---------------------------------------------------------------- written answers

export const cvpLimitsBrief: BriefProblem = {
  kind: 'brief',
  id: 'cvp-limits-brief',
  title: 'Straight lines, crooked world',
  host: 'idris',
  concept: 'cvp-limits',
  prompt: [{ who: 'idris', text: 'Your chart says each extra scarf costs exactly the same as the last one. I’ve run a mill for thirty years. It doesn’t.' }],
  question: 'Describe two real-world factors that can distort the assumption that variable costs per unit are constant.',
  cap: 2,
  cards: [
    { text: 'Bulk discounts: buy more silk and the supplier charges less per metre, so variable cost per unit falls at higher volumes.', kind: 'key', why: 'A classic reason the cost line bends.' },
    { text: 'Scarce resources: at high volume we pay overtime at premium rates, or pay more for scarce materials, so variable cost per unit rises.', kind: 'key', why: 'Scarcity pricing pushes the cost line up.' },
    { text: 'Learning curves: staff get faster with experience, so labour cost per unit falls. Staff turnover can reverse it.', kind: 'key', why: 'Efficiency changes labour cost per unit.' },
    { text: 'Fixed costs never change, whatever happens.', kind: 'trap', why: 'Fixed only holds within a relevant range; and this is about variable costs.' },
    { text: 'CVP assumes a constant sales mix.', kind: 'filler', why: 'True, but not about variable cost per unit.' },
    { text: 'Selling prices may be discounted for big customers.', kind: 'filler', why: 'That bends the revenue line, not the variable cost line.' },
    { text: 'Variable cost per unit always rises as volume rises.', kind: 'trap', why: 'It can go either way.' },
  ],
  model:
    'CVP assumes variable cost per unit is constant, but in practice it changes with volume. First, bulk purchase discounts: as volume rises the business can buy materials more cheaply per unit, so variable cost per unit falls. Second, scarcity of resources: at high output, labour may need to be paid overtime at premium rates, or scarce materials bought at higher prices, so variable cost per unit rises. Learning curves also cut labour time per unit as staff gain experience. So the total cost line is curved, and CVP is only reliable within a relevant range.',
};

export const opGearingBrief: BriefProblem = {
  kind: 'brief',
  id: 'op-gearing-brief',
  title: 'What is operating gearing?',
  host: 'aoife',
  concept: 'operating-gearing',
  prompt: [{ who: 'aoife', text: 'The board pack mentions “operating gearing”. Explain it to me, with a business you’d say has a lot of it.' }],
  question: 'Describe what is meant by operating gearing. Give an example of a business with high operating gearing and what this means for its key performance metrics.',
  cards: [
    { text: 'Operating gearing is the proportion of fixed costs in a business’s cost structure compared with variable costs.', kind: 'key', why: 'The definition.' },
    { text: 'High operating gearing means profit is very sensitive to volume: a small change in sales gives a large change in profit.', kind: 'key', why: 'The consequence.' },
    { text: 'An airline is a good example: aircraft, crew and airport costs are largely fixed for a flight; each extra passenger adds little cost.', kind: 'key', why: 'A clear example with a reason.' },
    { text: 'Its key metrics are volume measures: load factor against its break-even load factor, and its margin of safety.', kind: 'key', why: 'What it means for performance metrics.' },
    { text: 'Operating gearing is the ratio of debt to equity.', kind: 'trap', why: 'That’s financial gearing.' },
    { text: 'A business with high operating gearing has a low break-even point.', kind: 'trap', why: 'High fixed costs mean a high break-even point.' },
    { text: 'Hotels are similar: occupancy rate is watched closely.', kind: 'filler', why: 'True, a second example, but the question asks for one.' },
  ],
  model:
    'Operating gearing is the relationship between fixed and variable costs. A business with high operating gearing has a large proportion of fixed costs and low variable cost per unit, so its contribution margin ratio is high and its break-even point is high. Once past break-even, profit rises sharply with volume, but a small fall in volume can quickly cause losses. An airline is an example: the cost of flying a plane is mostly fixed, and each extra passenger adds little cost. So its key metrics are volume-based: load factor compared with the break-even load factor, and margin of safety. A few percentage points of load factor can turn a profit into a loss.',
};

export const ACT6_PROBLEMS: Problem[] = [fixedVariable, cvpCpu, cvpBe, cvpTarget, cvpMos, cvpWhatIf, cvpMachine, salesMixCalc, cvpLimitsBrief, opGearingBrief];
