// Chapter VIII problems: standard costing and variances, using the formulas and sign convention on the exam sheet.
// The data is a single-product business with a standard cost card: materials, labour, variable overhead and a lump
// of fixed overhead. Numbers are built so every actual rate comes out as a tidy price (like the course examples).
import * as A from '../engine/accounting';
import { eur } from '../engine/format';
import { pickInt, pickOne } from '../engine/rng';
import type { BriefProblem, CalcProblem, ClassifyProblem, ConceptId, Problem, ProblemInstance, StatementItem, TableProblem, Unit } from '../engine/types';
import { defineCalc, defineStatement, table, w0, w2, whys } from './helpers';

/** Standard and actual data for one product. */
export interface VarData {
  product: string;
  budgetUnits: number;
  budgetPrice: number;
  actualUnits: number;
  actualPrice: number;
  /** Material: standard kg (or m) per unit, budget rate; actual quantity used and total cost. */
  stdQty: number;
  matRate: number;
  matUnit: string;
  actQty: number;
  actCost: number;
  /** Labour: standard hours per unit, budget rate; actual hours and total pay. */
  stdHrs: number;
  labRate: number;
  actHrs: number;
  actPay: number;
  /** Variable overhead cost per unit (standard hours × overhead rate). */
  otherVar: number;
  /** Variable overhead: budget rate per labour hour, and the actual total spent. */
  voRate?: number;
  actVo?: number;
  /** Fixed overhead for the year: budget and actual totals. */
  fixedBudget?: number;
  fixedActual?: number;
}

export const COATS: VarData = {
  product: 'wool coats',
  budgetUnits: 2000,
  budgetPrice: 400,
  actualUnits: 2200,
  actualPrice: 390,
  stdQty: 3,
  matRate: 20,
  matUnit: 'm',
  actQty: 6900,
  actCost: 144900,
  stdHrs: 6,
  labRate: 18,
  actHrs: 12800,
  actPay: 236800,
  otherVar: 12,
  voRate: 2,
  actVo: 24960,
  fixedBudget: 150000,
  fixedActual: 154500,
};

/** The boss: a scarf maker with a full standard cost card. */
export const SCARVES: VarData = {
  product: 'cashmere scarves',
  budgetUnits: 40000,
  budgetPrice: 60,
  actualUnits: 43000,
  actualPrice: 58,
  stdQty: 0.8,
  matRate: 12,
  matUnit: 'm',
  actQty: 36000,
  actCost: 450000,
  stdHrs: 1.5,
  labRate: 14,
  actHrs: 66500,
  actPay: 944300,
  otherVar: 3,
  voRate: 2,
  actVo: 139650,
  fixedBudget: 400000,
  fixedActual: 412000,
};

/** The past paper's company: no stocks, so materials bought = materials used. No overheads given. */
export const ONESALE: VarData = {
  product: 'bespoke units',
  budgetUnits: 250000,
  budgetPrice: 10,
  actualUnits: 280000,
  actualPrice: 9,
  stdQty: 2.2,
  matRate: 1,
  matUnit: 'kg',
  actQty: 640000,
  actCost: 620000,
  stdHrs: 0.2,
  labRate: 20,
  actHrs: 56000,
  actPay: 1120000,
  otherVar: 1.2,
};

export type VarKind = 'sales-price' | 'sales-volume' | 'mat-rate' | 'mat-qty' | 'lab-rate' | 'lab-eff' | 'vo-rate' | 'vo-eff' | 'fixed';
export const ALL_KINDS: VarKind[] = ['sales-price', 'sales-volume', 'mat-rate', 'mat-qty', 'lab-rate', 'lab-eff', 'vo-rate', 'vo-eff', 'fixed'];

interface VarP {
  kind: VarKind;
  d: VarData;
}

const jig = (rng: () => number, base: number, rel: number, step: number) => {
  let v = Math.round((base * (1 + (rng() * 2 - 1) * rel)) / step) * step;
  if (Math.abs(v - base) < step / 2) v = base + step * (rng() < 0.5 ? -1 : 1);
  return Math.round(v * 1e4) / 1e4;
};

export const cpuOf = (d: VarData) => d.budgetPrice - d.stdQty * d.matRate - d.stdHrs * d.labRate - d.otherVar;

export const varyData = (rng: () => number): VarData => {
  for (let tries = 0; ; tries++) {
    const budgetUnits = pickInt(rng, 5000, 60000, 1000);
    const budgetPrice = pickInt(rng, 60, 200, 5);
    const stdQty = pickOne(rng, [0.5, 1, 1.5, 2, 2.5, 3]);
    const matRate = pickInt(rng, 5, 20);
    const stdHrs = pickOne(rng, [1, 1.5, 2, 2.5, 3]);
    const labRate = pickInt(rng, 10, 24);
    const voRate = pickOne(rng, [1, 1.5, 2, 2.5, 3]);
    const otherVar = stdHrs * voRate;
    const cpu = budgetPrice - stdQty * matRate - stdHrs * labRate - otherVar;
    if ((cpu < 0.2 * budgetPrice || cpu > 0.6 * budgetPrice) && tries < 60) continue;
    const actualUnits = jig(rng, budgetUnits, 0.12, 100);
    const actQty = jig(rng, actualUnits * stdQty, 0.07, 100);
    const actHrs = jig(rng, actualUnits * stdHrs, 0.07, 100);
    const matActRate = jig(rng, matRate, 0.08, 0.05);
    const labActRate = jig(rng, labRate, 0.06, 0.05);
    const voActRate = jig(rng, voRate, 0.1, 0.05);
    const fixedBudget = Math.round((budgetUnits * budgetPrice * (0.1 + rng() * 0.1)) / 1000) * 1000;
    return {
      product: pickOne(rng, ['wool coats', 'silk dresses', 'linen suits', 'cashmere scarves']),
      budgetUnits,
      budgetPrice,
      actualUnits,
      actualPrice: jig(rng, budgetPrice, 0.06, 0.5),
      stdQty,
      matRate,
      matUnit: 'm',
      actQty,
      actCost: Math.round(actQty * matActRate),
      stdHrs,
      labRate,
      actHrs,
      actPay: Math.round(actHrs * labActRate),
      otherVar,
      voRate,
      actVo: Math.round(actHrs * voActRate),
      fixedBudget,
      fixedActual: jig(rng, fixedBudget, 0.05, 500),
    };
  }
};

const hasOh = (d: VarData) => d.voRate !== undefined && d.actVo !== undefined && d.fixedBudget !== undefined && d.fixedActual !== undefined;
export const revenueOf = (d: VarData) => d.actualUnits * d.actualPrice;
export const budgetProfit = (d: VarData) => d.budgetUnits * cpuOf(d) - (d.fixedBudget ?? 0);
export const flexedProfit = (d: VarData) => d.actualUnits * cpuOf(d) - (d.fixedBudget ?? 0);
export const actualProfit = (d: VarData) => revenueOf(d) - d.actCost - d.actPay - (d.actVo ?? 0) - (d.fixedActual ?? 0);

export const NAMES: Record<VarKind, { name: string; method: string; concept: ConceptId; good: boolean }> = {
  'sales-price': { name: 'Sales Price Variance', method: 'sales-price-var', concept: 'sales-variances', good: true },
  'sales-volume': { name: 'Sales Volume Variance', method: 'sales-volume-var', concept: 'sales-variances', good: true },
  'mat-rate': { name: 'Materials Price (Rate) Variance', method: 'mat-rate-var', concept: 'material-variances', good: false },
  'mat-qty': { name: 'Materials Usage (Quantity) Variance', method: 'mat-qty-var', concept: 'material-variances', good: false },
  'lab-rate': { name: 'Labour Rate Variance', method: 'lab-rate-var', concept: 'labour-variances', good: false },
  'lab-eff': { name: 'Labour Efficiency Variance', method: 'lab-eff-var', concept: 'labour-variances', good: false },
  'vo-rate': { name: 'Variable Overhead Rate (Spending) Variance', method: 'vo-rate-var', concept: 'overhead-variances', good: false },
  'vo-eff': { name: 'Variable Overhead Efficiency Variance', method: 'vo-eff-var', concept: 'overhead-variances', good: false },
  fixed: { name: 'Fixed Overhead (Expenditure) Variance', method: 'fixed-oh-var', concept: 'overhead-variances', good: false },
};

const CAUSES: Record<VarKind, { F: string; A: string; wrong: string }> = {
  'sales-price': { F: 'We sold at higher prices than planned: stronger demand or less discounting.', A: 'We sold at lower prices than planned: discounting or price cuts.', wrong: 'The studio wasted fabric.' },
  'sales-volume': { F: 'We sold more units than planned.', A: 'We sold fewer units than planned.', wrong: 'Silk prices went up.' },
  'mat-rate': { F: 'We paid less per metre than planned: a cheaper supplier, a quantity discount or a lower grade.', A: 'We paid more per metre than planned: supplier price rises or rush orders.', wrong: 'Customers paid late.' },
  'mat-qty': { F: 'We used less material than the standard for this output: less waste.', A: 'We used more material than the standard for this output: waste or poor-quality material.', wrong: 'We sold at a discount.' },
  'lab-rate': { F: 'We paid less per hour than planned: a cheaper grade of staff.', A: 'We paid more per hour than planned: overtime, a pay rise or a higher grade.', wrong: 'The fabric was cheaper.' },
  'lab-eff': { F: 'Fewer hours than the standard for this output: skilled, motivated staff.', A: 'More hours than the standard for this output: training gaps, breakdowns or difficult material.', wrong: 'Selling prices were higher.' },
  'vo-rate': { F: 'Overheads cost less per hour than planned: lower power prices or cheaper indirect labour.', A: 'Overheads cost more per hour than planned: higher power prices or a higher grade of indirect labour.', wrong: 'We sold fewer units.' },
  'vo-eff': { F: 'Fewer hours than the standard, so less overhead was driven: the same reason as labour efficiency.', A: 'More hours than the standard, so more overhead was driven: the same causes as labour efficiency.', wrong: 'The price of power rose.' },
  fixed: { F: 'Fixed costs came in under budget: the budget was pessimistic or a cost fell.', A: 'Fixed costs came in over budget: an inaccurate estimate or an unexpected rise, such as insurance.', wrong: 'We made fewer units than planned.' },
};

interface Op {
  label: string;
  value: number;
  unit: Unit;
  explain: string;
}

/** The formula's own answer (positive = adverse for costs, favourable for sales) and the figures that go into it. */
export function variance(kind: VarKind, d: VarData): { v: number; ops: Op[] } {
  const matActRate = d.actCost / d.actQty;
  const labActRate = d.actPay / d.actHrs;
  const stdQtyAll = d.actualUnits * d.stdQty;
  const stdHrsAll = d.actualUnits * d.stdHrs;
  const cpu = cpuOf(d);
  switch (kind) {
    case 'sales-price': {
      const price = revenueOf(d) / d.actualUnits;
      return {
        v: A.salesPriceVariance(price, d.budgetPrice, d.actualUnits),
        ops: [
          { label: 'Actual price', value: price, unit: 'eur', explain: `${w0(revenueOf(d))} ÷ ${w0(d.actualUnits)} = ${w2(price)}.` },
          { label: 'Budget price', value: d.budgetPrice, unit: 'eur', explain: `${w2(d.budgetPrice)}.` },
          { label: 'Actual quantity sold', value: d.actualUnits, unit: 'count', explain: `${w0(d.actualUnits)}.` },
        ],
      };
    }
    case 'sales-volume':
      return {
        v: A.salesVolumeVariance(d.actualUnits, d.budgetUnits, cpu),
        ops: [
          { label: 'Actual quantity sold', value: d.actualUnits, unit: 'count', explain: `${w0(d.actualUnits)}.` },
          { label: 'Budget quantity', value: d.budgetUnits, unit: 'count', explain: `${w0(d.budgetUnits)}.` },
          { label: 'Budget contribution per unit', value: cpu, unit: 'eur', explain: `${w2(d.budgetPrice)} − ${w2(d.stdQty * d.matRate)} − ${w2(d.stdHrs * d.labRate)} − ${w2(d.otherVar)} = ${w2(cpu)}.` },
        ],
      };
    case 'mat-rate':
      return {
        v: A.rateVariance(matActRate, d.matRate, d.actQty),
        ops: [
          { label: `Actual price per ${d.matUnit}`, value: matActRate, unit: 'number', explain: `${w0(d.actCost)} ÷ ${w0(d.actQty)} = ${w2(matActRate)}.` },
          { label: `Standard price per ${d.matUnit}`, value: d.matRate, unit: 'number', explain: `${w2(d.matRate)}.` },
          { label: `Actual quantity (${d.matUnit})`, value: d.actQty, unit: 'count', explain: `${w0(d.actQty)}.` },
        ],
      };
    case 'mat-qty':
      return {
        v: A.quantityVariance(d.actQty, stdQtyAll, d.matRate),
        ops: [
          { label: `Actual quantity used (${d.matUnit})`, value: d.actQty, unit: 'count', explain: `${w0(d.actQty)}.` },
          { label: 'Standard quantity for actual output', value: stdQtyAll, unit: 'count', explain: `${w0(d.actualUnits)} × ${w2(d.stdQty)} = ${w0(stdQtyAll)}.` },
          { label: `Standard price per ${d.matUnit}`, value: d.matRate, unit: 'number', explain: `${w2(d.matRate)}.` },
        ],
      };
    case 'lab-rate':
      return {
        v: A.rateVariance(labActRate, d.labRate, d.actHrs),
        ops: [
          { label: 'Actual rate per hour', value: labActRate, unit: 'number', explain: `${w0(d.actPay)} ÷ ${w0(d.actHrs)} = ${w2(labActRate)}.` },
          { label: 'Standard rate per hour', value: d.labRate, unit: 'number', explain: `${w2(d.labRate)}.` },
          { label: 'Actual hours', value: d.actHrs, unit: 'count', explain: `${w0(d.actHrs)}.` },
        ],
      };
    case 'lab-eff':
      return {
        v: A.quantityVariance(d.actHrs, stdHrsAll, d.labRate),
        ops: [
          { label: 'Actual hours', value: d.actHrs, unit: 'count', explain: `${w0(d.actHrs)}.` },
          { label: 'Standard hours for actual output', value: stdHrsAll, unit: 'count', explain: `${w0(d.actualUnits)} × ${w2(d.stdHrs)} = ${w0(stdHrsAll)}.` },
          { label: 'Standard rate per hour', value: d.labRate, unit: 'number', explain: `${w2(d.labRate)}.` },
        ],
      };
    case 'vo-rate': {
      const rate = d.actVo! / d.actHrs;
      return {
        v: A.rateVariance(rate, d.voRate!, d.actHrs),
        ops: [
          { label: 'Actual overhead rate per hour', value: rate, unit: 'number', explain: `${w0(d.actVo!)} ÷ ${w0(d.actHrs)} = ${w2(rate)}.` },
          { label: 'Standard overhead rate per hour', value: d.voRate!, unit: 'number', explain: `${w2(d.voRate!)}.` },
          { label: 'Actual hours', value: d.actHrs, unit: 'count', explain: `${w0(d.actHrs)}.` },
        ],
      };
    }
    case 'vo-eff':
      return {
        v: A.quantityVariance(d.actHrs, stdHrsAll, d.voRate!),
        ops: [
          { label: 'Actual hours', value: d.actHrs, unit: 'count', explain: `${w0(d.actHrs)}.` },
          { label: 'Standard hours for actual output', value: stdHrsAll, unit: 'count', explain: `${w0(d.actualUnits)} × ${w2(d.stdHrs)} = ${w0(stdHrsAll)}.` },
          { label: 'Standard overhead rate per hour', value: d.voRate!, unit: 'number', explain: `${w2(d.voRate!)}.` },
        ],
      };
    case 'fixed':
      return {
        v: A.fixedOverheadVariance(d.fixedActual!, d.fixedBudget!),
        ops: [
          { label: 'Actual fixed overhead', value: d.fixedActual!, unit: 'eur', explain: `${w0(d.fixedActual!)}.` },
          { label: 'Budget fixed overhead', value: d.fixedBudget!, unit: 'eur', explain: `${w0(d.fixedBudget!)}.` },
        ],
      };
  }
}

/** Positive = adds to profit. */
export const profitEffect = (kind: VarKind, d: VarData) => {
  const v = variance(kind, d).v;
  return NAMES[kind].good ? v : -v;
};

/** The standard cost card and the year's actual figures, as one table. */
export function cardTable(d: VarData) {
  const rows: string[][] = [
    ['Units made and sold', w0(d.budgetUnits), w0(d.actualUnits)],
    ['Sales', `${eur(d.budgetPrice, 2)} a unit`, eur(revenueOf(d))],
    ['Materials', `${w2(d.stdQty)} ${d.matUnit} a unit at ${eur(d.matRate, 2)} per ${d.matUnit}`, `${w0(d.actQty)} ${d.matUnit} costing ${eur(d.actCost)}`],
    ['Direct labour', `${w2(d.stdHrs)} hours a unit at ${eur(d.labRate, 2)} an hour`, `${w0(d.actHrs)} hours costing ${eur(d.actPay)}`],
  ];
  if (hasOh(d)) {
    rows.push(['Variable overhead', `${w2(d.stdHrs)} hours a unit at ${eur(d.voRate!, 2)} an hour`, eur(d.actVo!)]);
    rows.push(['Fixed overhead for the year', eur(d.fixedBudget!), eur(d.fixedActual!)]);
  }
  return table('The standards and what happened', ['', 'Budget (standard)', 'Actual'], rows);
}

const STORY = (d: VarData): string => `Silk cost more than budgeted, Theo says the studio was flat out, and Idris wants to know who to blame. The standards and the year’s results for our ${d.product} are below.`;

function varianceProblem(id: string, kinds: VarKind[], title: string, base: VarP): CalcProblem<VarP> {
  return defineCalc<VarP>({
    kind: 'calc',
    id,
    title,
    host: 'niamh',
    concept: NAMES[base.kind].concept,
    base,
    vary: (rng) => {
      const k = pickOne(rng, kinds);
      return { kind: k, d: varyData(rng) };
    },
    build: ({ kind, d }) => {
      const n = NAMES[kind];
      const r = variance(kind, d);
      const fa = A.fa(r.v, n.good);
      const fav = fa === 'F';
      const ops = r.ops;
      const others = ALL_KINDS.filter((k) => k !== kind && (hasOh(d) || !k.startsWith('vo') && k !== 'fixed')).map((k) => NAMES[k].method);
      const options = [n.method, ...others.slice(0, 2), 'var-budget-qty'];
      const cause = CAUSES[kind];
      const two = ops.length === 2;
      const calc = (x: number[]) => (two ? x[0] - x[1] : (x[0] - x[1]) * x[2]);
      const nums = ops.map((o) => w2(o.value));
      return {
        prompt: [{ who: 'margaux', text: STORY(d) }, `Let’s start with one number: the ${n.name.toLowerCase()}.`],
        data: cardTable(d),
        ask: `Calculate the ${n.name.toLowerCase()}, and say whether it is favourable or adverse.`,
        formula: { options: Array.from(new Set(options)), correct: n.method, explain: `${n.name}: as on the sheet.` },
        stepNames: { formula: 'Pick the variance', decision: 'F or A, and why' },
        inputs: ops.map((o, i) => ({
          key: ['X', 'Y', 'Z'][i],
          symbol: two ? ['\\text{Actual}', '\\text{Budget}'][i] : ['\\text{Actual}', '\\text{Budget/Std}', '\\text{Multiplier}'][i],
          label: o.label,
          unit: o.unit,
          expected: o.value,
          explain: o.explain,
        })),
        solve: (v) => calc(ops.map((_, i) => v[['X', 'Y', 'Z'][i]])),
        answer: { label: `${n.name} (size; sign checked in the next move)`, unit: 'eur', signless: true, explain: `${two ? `${nums[0]} − ${nums[1]}` : `(${nums[0]} − ${nums[1]}) × ${nums[2]}`} = ${w0(r.v)}: ${eur(Math.abs(r.v))} ${fav ? 'favourable' : 'adverse'}.` },
        decision: {
          question: 'Favourable or adverse?',
          options: [
            { id: 'F', label: 'Favourable' },
            { id: 'A', label: 'Adverse' },
          ],
          correct: fav ? 'F' : 'A',
          why: whys(fav ? cause.F : cause.A, fav ? cause.A : cause.F, cause.wrong),
          correctWhy: 'w0',
          explain: `${eur(Math.abs(r.v))} ${fav ? 'favourable' : 'adverse'}. ${n.good ? 'For sales, a positive figure is good for profit.' : 'For costs, a positive figure means we spent more than standard.'}`,
        },
        working: [
          two ? `${n.name} = ${ops[0].label} − ${ops[1].label}` : `${n.name} = (${ops[0].label} − ${ops[1].label}) × ${ops[2].label}`,
          two ? `= ${nums[0]} − ${nums[1]} = ${w0(r.v)}` : `= (${nums[0]} − ${nums[1]}) × ${nums[2]} = ${w0(r.v)}`,
          `= €${w0(Math.abs(r.v))} ${fav ? 'F' : 'A'}`,
        ],
        hints: {
          formula: 'The sheet lists them all. Match price, volume, rate, efficiency or quantity.',
          inputs: 'Actual rate = total cost ÷ actual quantity. Standard quantity = actual units × standard per unit. Contribution = price − every variable cost.',
          answer: two ? 'Actual less budget.' : '(Actual − budget) × the multiplier.',
          decision: n.good ? 'For sales, positive is favourable.' : 'For costs, positive is adverse.',
        },
        outcomes: {
          F: { valueDelta: fav ? 500 : -1000, news: fav ? 'The board hears good news, correctly labelled.' : 'An overspend is reported as a saving. Niamh corrects it.' },
          A: { valueDelta: fav ? -500 : 1000, news: fav ? 'A saving is reported as an overspend; someone is blamed for nothing.' : 'Margaux flags the overspend and asks the right person why.' },
        },
        cfoLine: `${n.name} ${eur(Math.abs(r.v))} ${fa}.`,
      };
    },
  });
}

export const varSales = varianceProblem('var-sales', ['sales-price', 'sales-volume'], 'Did we sell well?', { kind: 'sales-price', d: COATS });
export const varMaterials = varianceProblem('var-materials', ['mat-rate', 'mat-qty'], 'The silk bill', { kind: 'mat-rate', d: COATS });
export const varLabour = varianceProblem('var-labour', ['lab-rate', 'lab-eff'], 'The studio hours', { kind: 'lab-eff', d: COATS });
export const varOverheads = varianceProblem('var-overheads', ['vo-rate', 'vo-eff', 'fixed'], 'The running costs', { kind: 'vo-eff', d: COATS });

// ---------------------------------------------------------------- budget profit and the flexed budget

interface BudP {
  d: VarData;
  kind: 'budget' | 'flexed';
}

export const varBudgetProfit = defineCalc<BudP>({
  kind: 'calc',
  id: 'var-budget-profit',
  title: 'What profit were we expecting?',
  host: 'margaux',
  concept: 'standard-cost',
  base: { d: COATS, kind: 'budget' },
  vary: (rng) => ({ d: varyData(rng), kind: pickOne(rng, ['budget', 'flexed'] as const) }),
  build: ({ d, kind }) => {
    const cpu = cpuOf(d);
    const units = kind === 'budget' ? d.budgetUnits : d.actualUnits;
    const fixed = d.fixedBudget ?? 0;
    const profit = units * cpu - fixed;
    const flexed = kind === 'flexed';
    return {
      prompt: [
        { who: 'idris', text: flexed ? 'We made a different number of coats from the plan. What profit would the plan have promised for the number we really made?' : 'Before we judge the year, what profit did the budget promise?' },
        'The standard card sets the price and every variable cost. Fixed overhead is a lump sum for the year.',
      ],
      data: cardTable(d),
      ask: flexed ? 'Work out the flexed budget profit: the budget’s standards applied to the units actually made.' : 'Work out the budgeted profit for the year.',
      formula: { options: ['budget-profit', 'budget-profit-no-fixed', 'budget-profit-revenue'], correct: 'budget-profit', explain: 'Contribution per unit × units, less the fixed overhead.' },
      stepNames: { formula: 'Pick the method', decision: 'Which budget?' },
      inputs: [
        { key: 'X', symbol: '\\text{CPU}', label: 'Budget contribution per unit', unit: 'eur', expected: cpu, explain: `${w2(d.budgetPrice)} − ${w2(d.stdQty * d.matRate)} − ${w2(d.stdHrs * d.labRate)} − ${w2(d.otherVar)} = ${w2(cpu)}.` },
        { key: 'Y', symbol: '\\text{Units}', label: flexed ? 'Units actually made and sold' : 'Budgeted units', unit: 'count', expected: units, explain: `${w0(units)}.` },
        { key: 'Z', symbol: '\\text{Fixed}', label: 'Budget fixed overhead', unit: 'eur', expected: fixed, explain: `${w0(fixed)}: a lump sum, not flexed.` },
      ],
      solve: (v) => v.X * v.Y - v.Z,
      answer: { label: flexed ? 'Flexed budget profit' : 'Budgeted profit', unit: 'eur', explain: `${w2(cpu)} × ${w0(units)} − ${w0(fixed)} = ${w0(profit)}.` },
      decision: {
        question: `We actually made ${w0(d.actualUnits)} units against a budget of ${w0(d.budgetUnits)}. To judge the costs, which budget do we compare them with?`,
        options: [
          { id: 'flex', label: 'The flexed budget: the same standards at the units we made' },
          { id: 'orig', label: 'The original budget as printed' },
        ],
        correct: 'flex',
        why: whys('Costs rise and fall with output, so we compare like with like.', 'The original budget is the plan, and plans shouldn’t change.', 'Either is fine: the totals are close enough.'),
        correctWhy: 'w0',
        explain: 'Flex the budget to the actual output, then the differences that remain are real ones. The fixed overhead stays as budgeted.',
      },
      working: [`Contribution per unit = ${w2(d.budgetPrice)} − ${w2(d.stdQty * d.matRate)} − ${w2(d.stdHrs * d.labRate)} − ${w2(d.otherVar)} = ${w2(cpu)}`, `Profit = ${w2(cpu)} × ${w0(units)} − ${w0(fixed)} = ${w0(profit)}`],
      hints: { formula: 'Contribution covers the fixed costs first, then it’s profit.', inputs: 'Price less materials, labour and variable overhead per unit.', answer: 'Units × contribution, then take off the fixed overhead.', decision: 'What should we compare actual costs against?' },
      outcomes: {
        flex: { valueDelta: 1000, news: 'Niamh nods: the costs are compared like with like.' },
        orig: { valueDelta: -1000, news: 'The board is told the studio overspent. It had simply made more coats.' },
      },
      cfoLine: `${flexed ? 'Flexed budget' : 'Budgeted'} profit ${eur(profit)}.`,
    };
  },
});

// ---------------------------------------------------------------- working backwards, and idle time

interface RevP {
  d: VarData;
  kind: 'back-rate' | 'back-qty' | 'idle';
  /** Hours lost to an event outside anyone's control (idle). */
  lost: number;
}

export const varReverse = defineCalc<RevP>({
  kind: 'calc',
  id: 'var-reverse',
  title: 'Working it back',
  host: 'niamh',
  concept: 'variance-reverse',
  base: { d: COATS, kind: 'back-rate', lost: 400 },
  vary: (rng) => {
    const d = varyData(rng);
    return { d, kind: pickOne(rng, ['back-rate', 'back-qty', 'idle'] as const), lost: pickInt(rng, 2, 12) * 100 };
  },
  build: ({ d, kind, lost }): ProblemInstance => {
    const stdHrsAll = d.actualUnits * d.stdHrs;
    if (kind === 'back-rate') {
      const v = variance('lab-rate', d).v;
      const actRate = d.actPay / d.actHrs;
      const diff = v / d.actHrs;
      const adverse = v > 0;
      return {
        prompt: [
          { who: 'niamh', text: `The labour rate variance for the year was ${eur(Math.abs(v))} ${adverse ? 'adverse' : 'favourable'}. Nobody has the payroll to hand. The studio worked ${w0(d.actHrs)} hours against a standard rate of ${eur(d.labRate, 2)} an hour.` },
        ],
        ask: 'What was the actual labour rate paid per hour?',
        formula: { options: ['back-rate', 'back-rate-standard-hrs', 'lab-rate-var'], correct: 'back-rate', explain: 'Variance ÷ actual hours gives the difference per hour. Add it to the standard rate.' },
        stepNames: { formula: 'Pick the method', decision: 'What does it tell us?' },
        inputs: [
          { key: 'X', symbol: '\\text{Diff}', label: 'Rate difference per hour (adverse +, favourable −)', unit: 'number', expected: diff, explain: `${adverse ? '' : '−'}${w0(Math.abs(v))} ÷ ${w0(d.actHrs)} = ${w2(diff)}.`, given: false },
          { key: 'Y', symbol: '\\text{Std}', label: 'Standard rate per hour', unit: 'number', expected: d.labRate, explain: `${w2(d.labRate)}.` },
        ],
        solve: (x) => x.Y + x.X,
        answer: { label: 'Actual rate per hour', unit: 'number', explain: `${w2(d.labRate)} ${diff < 0 ? '−' : '+'} ${w2(Math.abs(diff))} = ${w2(actRate)}.` },
        decision: {
          question: `We paid ${eur(actRate, 2)} an hour against a ${eur(d.labRate, 2)} standard. What kind of variance is that?`,
          options: [
            { id: adverse ? 'A' : 'F', label: adverse ? 'Adverse: we paid more per hour than planned' : 'Favourable: we paid less per hour than planned' },
            { id: adverse ? 'F' : 'A', label: adverse ? 'Favourable: we paid more per hour than planned' : 'Adverse: we paid less per hour than planned' },
          ],
          correct: adverse ? 'A' : 'F',
          why: whys(adverse ? 'Actual rate above standard costs us more.' : 'Actual rate below standard saves us money.', 'Paying more is always good news for staff, so it’s good news.', 'It depends on the hours, not the rate.'),
          correctWhy: 'w0',
          explain: `Actual ${eur(actRate, 2)} against a ${eur(d.labRate, 2)} standard: ${adverse ? 'adverse' : 'favourable'}.`,
        },
        working: [`Difference per hour = ${w0(v)} ÷ ${w0(d.actHrs)} = ${w2(diff)}`, `Actual rate = ${w2(d.labRate)} + ${w2(diff)} = ${w2(actRate)}`],
        hints: { formula: 'Rate variance = rate difference × hours. Turn it around.', inputs: 'Divide the variance by the actual hours (not the standard hours).', answer: 'Add the difference to the standard rate.', decision: 'Compare the rate with the standard.' },
        outcomes: {
          A: { valueDelta: adverse ? 500 : -500, news: 'Margaux notes the rate and asks why.' },
          F: { valueDelta: adverse ? -500 : 500, news: 'Margaux notes the rate and asks why.' },
        },
        cfoLine: `Actual labour rate ${eur(actRate, 2)} an hour.`,
      };
    }
    if (kind === 'back-qty') {
      const v = variance('mat-qty', d).v;
      const std = d.actualUnits * d.stdQty;
      const extra = v / d.matRate;
      const adverse = v > 0;
      return {
        prompt: [
          { who: 'niamh', text: `The materials usage variance was ${eur(Math.abs(v))} ${adverse ? 'adverse' : 'favourable'}. The standard price is ${eur(d.matRate, 2)} per ${d.matUnit}, and the ${w0(d.actualUnits)} ${d.product} we made should have used ${w0(std)} ${d.matUnit}.` },
        ],
        ask: `How many ${d.matUnit} were actually used?`,
        formula: { options: ['back-qty', 'mat-qty-var', 'back-rate'], correct: 'back-qty', explain: 'Variance ÷ standard price gives the extra (or saved) quantity. Add it to the standard quantity.' },
        stepNames: { formula: 'Pick the method', decision: 'What does it tell us?' },
        inputs: [
          { key: 'X', symbol: '\\text{Diff}', label: `Extra ${d.matUnit} used (adverse +, favourable −)`, unit: 'count', expected: extra, explain: `${adverse ? '' : '−'}${w0(Math.abs(v))} ÷ ${w2(d.matRate)} = ${w0(extra)}.`, given: false },
          { key: 'Y', symbol: '\\text{Std}', label: `Standard quantity (${d.matUnit})`, unit: 'count', expected: std, explain: `${w0(std)}.` },
        ],
        solve: (x) => x.Y + x.X,
        answer: { label: `Actual quantity used (${d.matUnit})`, unit: 'count', explain: `${w0(std)} ${extra < 0 ? '−' : '+'} ${w0(Math.abs(extra))} = ${w0(d.actQty)}.` },
        decision: {
          question: `We used ${w0(d.actQty)} ${d.matUnit} against a standard of ${w0(std)}. Which is the likelier cause?`,
          options: [
            { id: 'right', label: adverse ? 'Waste, or material that was harder to work with' : 'Less waste, or more careful cutting' },
            { id: 'wrong', label: 'Suppliers raised their prices' },
          ],
          correct: 'right',
          why: whys(adverse ? 'More used than the standard points at waste or poor material.' : 'Less used than the standard points at care and skill.', 'A supplier’s price shows up in the price variance, not the usage variance.', 'Selling fewer units changes the standard quantity, not the usage variance.'),
          correctWhy: 'w0',
          explain: 'Usage is about quantity. Price changes belong in the price variance.',
        },
        working: [`Extra quantity = ${w0(v)} ÷ ${w2(d.matRate)} = ${w0(extra)}`, `Actual quantity = ${w0(std)} + ${w0(extra)} = ${w0(d.actQty)}`],
        hints: { formula: 'Usage variance = quantity difference × standard price. Turn it around.', inputs: 'Divide the variance by the standard price.', answer: 'Add it to the standard quantity.', decision: 'Is this about price or quantity?' },
        outcomes: { right: { valueDelta: 500, news: 'Margaux sends the right question to the right person.' }, wrong: { valueDelta: -500, news: 'The wrong person gets blamed.' } },
        cfoLine: `Actual usage ${w0(d.actQty)} ${d.matUnit}.`,
      };
    }
    // idle time
    const before = (d.actHrs - stdHrsAll) * d.labRate;
    const productive = d.actHrs - lost;
    const after = (productive - stdHrsAll) * d.labRate;
    const fav = after < 0;
    return {
      prompt: [
        { who: 'theo', text: `The studio worked ${w0(d.actHrs)} hours to make ${w0(d.actualUnits)} ${d.product}, which should take ${w2(d.stdHrs)} hours each at ${eur(d.labRate, 2)} an hour. But a power cut meant ${w0(lost)} of those hours were spent waiting. That wasn’t our fault.` },
        { who: 'niamh', text: `The efficiency variance as first reported is ${eur(Math.abs(before))} ${before > 0 ? 'adverse' : 'favourable'}. Set the lost hours aside and recalculate.` },
      ],
      ask: 'What is the labour efficiency variance once the hours lost to the power cut are set aside?',
      formula: { options: ['idle-eff', 'idle-eff-ignore', 'idle-eff-plus'], correct: 'idle-eff', explain: 'Take the lost hours off the actual hours, then compare with the standard hours.' },
      stepNames: { formula: 'Pick the method', decision: 'Who answers for it?' },
      inputs: [
        { key: 'X', symbol: '\\text{Hours}', label: 'Hours available for work (actual less lost)', unit: 'count', expected: productive, explain: `${w0(d.actHrs)} − ${w0(lost)} = ${w0(productive)}.`, given: false },
        { key: 'Y', symbol: '\\text{Std}', label: 'Standard hours for actual output', unit: 'count', expected: stdHrsAll, explain: `${w0(d.actualUnits)} × ${w2(d.stdHrs)} = ${w0(stdHrsAll)}.` },
        { key: 'Z', symbol: '\\text{Rate}', label: 'Standard rate per hour', unit: 'number', expected: d.labRate, explain: `${w2(d.labRate)}.` },
      ],
      solve: (x) => (x.X - x.Y) * x.Z,
      answer: { label: 'Efficiency variance, power cut set aside (size; F or A next)', unit: 'eur', signless: true, explain: `(${w0(productive)} − ${w0(stdHrsAll)}) × ${w2(d.labRate)} = ${w0(after)}: ${eur(Math.abs(after))} ${fav ? 'favourable' : 'adverse'}.` },
      decision: {
        question: 'Who should answer for the lost hours?',
        options: [
          { id: 'report', label: 'Nobody in the studio. Show them as idle time, separately' },
          { id: 'studio', label: 'The studio manager, as part of efficiency' },
        ],
        correct: 'report',
        why: whys('A variance should land on someone who could have controlled it.', 'All hours worked are the manager’s responsibility, whatever the cause.', 'Idle time is always the supervisor’s fault.'),
        correctWhy: 'w0',
        explain: `Setting the ${w0(lost)} hours aside, efficiency is ${eur(Math.abs(after))} ${fav ? 'favourable' : 'adverse'}. The lost time still cost ${eur(lost * d.labRate)}: report it, but don’t charge it to the studio.`,
      },
      working: [`Hours available = ${w0(d.actHrs)} − ${w0(lost)} = ${w0(productive)}`, `Standard hours = ${w0(d.actualUnits)} × ${w2(d.stdHrs)} = ${w0(stdHrsAll)}`, `Efficiency = (${w0(productive)} − ${w0(stdHrsAll)}) × ${w2(d.labRate)} = ${w0(after)}`],
      hints: { formula: 'Which hours could the studio actually have used?', inputs: 'Actual hours minus the lost hours; standard hours as before.', answer: '(Hours available − standard hours) × standard rate.', decision: 'Can the studio control a power cut?' },
      outcomes: { report: { valueDelta: 1000, news: 'The power cut is reported as idle time. The studio gets the credit it earned.' }, studio: { valueDelta: -1000, news: 'The studio is told off for a power cut.' } },
      cfoLine: `Efficiency ${eur(Math.abs(after))} ${fav ? 'F' : 'A'} excluding idle time.`,
    };
  },
});

// ---------------------------------------------------------------- the statement for the managing director

const LAYOUT_ORDER: VarKind[] = ALL_KINDS;

export const varReconcile = defineStatement<VarData>({
  kind: 'statement',
  id: 'var-reconcile',
  title: 'The statement for the board',
  host: 'idris',
  concept: 'variance-report',
  uses: ['sales-variances', 'material-variances', 'labour-variances', 'overhead-variances'],
  base: COATS,
  vary: (rng) => varyData(rng),
  build: (d) => {
    const bp = budgetProfit(d);
    const ap = actualProfit(d);
    const kinds = LAYOUT_ORDER.filter((k) => Math.abs(variance(k, d).v) >= 0.5);
    const effect = (k: VarKind) => profitEffect(k, d);
    const items: StatementItem[] = [
      { id: 'budget', label: 'Budgeted profit', amount: Math.abs(bp), section: 'budget', sign: bp >= 0 ? 1 : -1, why: 'The starting point of the bridge.' },
      ...kinds.map((k): StatementItem => {
        const e = effect(k);
        const raw = variance(k, d).v;
        return {
          id: k,
          label: NAMES[k].name,
          amount: Math.abs(raw),
          section: NAMES[k].good ? 'sales' : 'cost',
          sign: e >= 0 ? 1 : -1,
          why: `${NAMES[k].good ? 'A sales variance' : 'A cost variance'}: ${w0(raw)} is ${e >= 0 ? 'favourable, so it’s added' : 'adverse, so it’s deducted'}.`,
        };
      }),
      { id: 'flexed', label: 'Flexed budget profit', amount: Math.abs(flexedProfit(d)), section: 'none', sign: flexedProfit(d) >= 0 ? 1 : -1, why: 'Leave it out: it’s a stage on the way (the budget at the units made), not a variance. Counting it would count the volume variance twice.' },
    ];
    const ranked = [...kinds].sort((a, b) => Math.abs(effect(b)) - Math.abs(effect(a)));
    const top = ranked[0];
    const others = ranked.slice(1, 4);
    const net = (s: 'sales' | 'cost') => kinds.filter((k) => (NAMES[k].good ? 'sales' : 'cost') === s).reduce((t, k) => t + effect(k), 0);
    const salesNet = net('sales');
    const costNet = net('cost');
    return {
      prompt: [
        { who: 'idris', text: 'I’ve got a budgeted profit and an actual profit and I don’t understand the gap. Give me one page that explains it, line by line.' },
        { who: 'margaux', text: 'The variances are worked out below, exactly as the formulas give them. Mind the signs: a positive cost variance is bad news; a positive sales variance is good.' },
      ],
      ask: 'Lay out the statement from budgeted profit to actual profit.',
      data: table('The variances, as the formulas give them', ['Variance', 'Result (€)'], [...kinds.map((k) => [NAMES[k].name, w0(variance(k, d).v)]), ['Budgeted profit', w0(bp)]], [kinds.length]),
      heading: 'Budgeted profit to actual profit (€)',
      sections: [
        { id: 'budget', label: 'Where we started' },
        { id: 'sales', label: 'Sales variances', subtotal: 'Net sales variances' },
        { id: 'cost', label: 'Cost variances', subtotal: 'Net cost variances' },
      ],
      items,
      signed: true,
      totals: [{ key: 'actual', label: 'Actual profit', calc: (s) => s.budget + s.sales + s.cost, explain: 'Budgeted profit plus the net sales variances plus the net cost variances.' }],
      decision: {
        question: 'Which single variance moved profit the most?',
        options: [{ id: 'top', label: NAMES[top].name }, ...others.map((k, i) => ({ id: `o${i}`, label: NAMES[k].name }))],
        correct: 'top',
        why: whys('It’s the biggest figure on the statement, so it’s where the money moved.', 'It’s the first line, so it matters most.', 'Adverse variances matter more than favourable ones.'),
        correctWhy: 'w0',
        explain: `${NAMES[top].name} moved profit by ${eur(Math.abs(effect(top)))} ${effect(top) >= 0 ? 'up' : 'down'}: the largest line. Budgeted ${eur(bp)} plus ${eur(salesNet)} from sales plus ${eur(costNet)} from costs gives ${eur(ap)}.`,
      },
      working: [`Budgeted profit = ${w0(bp)}`, `Net sales variances = ${w0(salesNet)}`, `Net cost variances = ${w0(costNet)}`, `Actual profit = ${w0(bp)} + ${w0(salesNet)} + ${w0(costNet)} = ${w0(ap)}`],
      hints: {
        place: 'Two sales variances, the rest are costs. “Flexed budget profit” isn’t a variance.',
        sign: 'Favourable adds to profit; adverse deducts. For costs, a positive formula answer is adverse; for sales, positive is favourable.',
        subtotals: 'Add each group with its signs.',
        totals: 'Budgeted profit plus both subtotals. It should equal the actual profit.',
        decision: 'Look for the biggest figure.',
      },
      outcomes: {
        top: { valueDelta: 2000, news: 'Idris asks about the right line first. It takes one phone call.' },
        o0: { valueDelta: -500, news: 'Idris spends a week on a minor line.' },
        o1: { valueDelta: -500, news: 'Idris spends a week on a minor line.' },
        o2: { valueDelta: -500, news: 'Idris spends a week on a minor line.' },
      },
    };
  },
});

// ---------------------------------------------------------------- written and sorting rounds

export const causesTable: TableProblem = {
  kind: 'table',
  id: 'variance-causes',
  title: 'Follow the knock-on',
  host: 'margaux',
  concept: 'variance-causes',
  prompt: ['Each event moves more than one variance. Which way does each go? (– means no effect.)'],
  columns: [
    { label: 'Materials price', options: ['F', 'A', '–'] },
    { label: 'Materials usage', options: ['F', 'A', '–'] },
    { label: 'Labour efficiency', options: ['F', 'A', '–'] },
  ],
  rows: [
    { label: 'Theo buys cheaper, lower-grade silk that frays in the machines', answers: ['F', 'A', 'A'], why: 'Cheaper per metre, but more wasted, and slower to sew.' },
    { label: 'A new, skilled cutter lays out patterns with less waste', answers: ['–', 'F', 'F'], why: 'Less material used, and quicker work.' },
    { label: 'The mill raises its prices', answers: ['A', '–', '–'], why: 'Only the price per metre changes.' },
    { label: 'A machine breaks down for a week; staff wait around', answers: ['–', '–', 'A'], why: 'Paid hours with nothing made.' },
    { label: 'Premium Italian wool: dearer, but almost no waste', answers: ['A', 'F', 'F'], why: 'Higher price; less waste, easier to work.' },
    { label: 'The mill gives us a discount for a bigger order', answers: ['F', '–', '–'], why: 'Only the price per metre changes.' },
  ],
};

export const flexTF: ClassifyProblem = {
  kind: 'classify',
  id: 'flex-tf',
  title: 'Standards first',
  host: 'niamh',
  concept: 'standard-cost',
  prompt: ['Before any variance: true or false?'],
  categories: [
    { id: 'true', label: 'True' },
    { id: 'false', label: 'False' },
  ],
  show: 6,
  items: [
    { text: 'Standard quantity = actual units made × standard quantity per unit.', category: 'true', why: 'Flex to the output actually made.' },
    { text: 'Compare actual material cost with the original budget, even if we made more units.', category: 'false', why: 'Flex the budget to actual output first.' },
    { text: 'If the total materials cost is given, actual price = total cost ÷ actual quantity.', category: 'true', why: 'That’s how you get the price the sheet asks for.' },
    { text: 'A favourable variance is always good news.', category: 'false', why: 'Cheap material can cause adverse usage and labour variances.' },
    { text: 'For cost variances on the sheet, a positive figure is adverse.', category: 'true', why: 'Actual above standard means we spent more.' },
    { text: 'For sales variances on the sheet, a positive figure is adverse.', category: 'false', why: 'For sales, positive is favourable.' },
    { text: 'The sales volume variance is valued at the budgeted selling price.', category: 'false', why: 'At the budgeted contribution per unit: each unit only adds its contribution.' },
    { text: 'Fixed overhead is flexed to the actual output like the other costs.', category: 'false', why: 'A fixed cost doesn’t move with output: compare actual with budget as it stands.' },
    { text: 'Budgeted profit + favourable variances − adverse variances = actual profit.', category: 'true', why: 'That’s the bridge. If it doesn’t land on actual profit, a variance is wrong.' },
    { text: 'The materials price variance uses the quantity purchased; the usage variance uses the quantity used.', category: 'true', why: 'Each is valued on what it applies to.' },
    { text: 'Variable overhead efficiency uses the labour rate per hour.', category: 'false', why: 'It uses the variable overhead rate per hour.' },
  ],
};

export const controlSort: ClassifyProblem = {
  kind: 'classify',
  id: 'control-sort',
  title: 'Before or after?',
  host: 'margaux',
  concept: 'standard-cost',
  prompt: ['Idris asks how the house should keep the budget under control. Is each action feedback or feedforward control?'],
  categories: [
    { id: 'back', label: 'Feedback' },
    { id: 'forward', label: 'Feedforward' },
  ],
  show: 6,
  items: [
    { text: 'At month end, compare actual results with the budget and investigate the gaps.', category: 'back', why: 'The event has already happened.' },
    { text: 'Forecast the year’s likely outcome now and compare it with budget to act early.', category: 'forward', why: 'It predicts and acts before the end.' },
    { text: 'Adjust next quarter’s plan after seeing this quarter’s overspend.', category: 'back', why: 'Learning from what happened.' },
    { text: 'A rising silk price is spotted in the forecast, so orders are placed early.', category: 'forward', why: 'Action taken on a prediction.' },
    { text: 'The quarterly variance report goes to the studio manager.', category: 'back', why: 'It reports on past performance.' },
    { text: 'Revise the sales forecast before the season and re-plan staffing.', category: 'forward', why: 'Anticipating deviations in advance.' },
  ],
};

export const usageReasonsBrief: BriefProblem = {
  kind: 'brief',
  id: 'usage-reasons-brief',
  title: 'Why did we use so much?',
  host: 'niamh',
  concept: 'variance-causes',
  prompt: [{ who: 'niamh', text: 'The usage variance is adverse. Idris wants an explanation he can take to the studio, and he wants it in one breath.' }],
  question: 'Give two possible reasons for an adverse materials usage variance.',
  cap: 2,
  cards: [
    { text: 'Wastage from using inferior-quality material that frays, tears or is cut badly.', kind: 'key', why: 'Poor material means more is lost in the making.' },
    { text: 'Lower worker efficiency: less skilled or poorly trained staff cut and sew carelessly and waste more.', kind: 'key', why: 'Efficiency affects how much material is used.' },
    { text: 'Spoilage or breakdowns: machine faults or accidents that ruin material.', kind: 'key', why: 'A genuine cause of extra usage.' },
    { text: 'Theft or losses in the stores.', kind: 'key', why: 'Material missing from the stores shows as extra usage.' },
    { text: 'A higher-quality material than the standard allowed for would normally reduce usage, so it isn’t a cause of an adverse variance.', kind: 'filler', why: 'True, but it explains a favourable usage variance, not this one.' },
    { text: 'The supplier raised its price per metre.', kind: 'trap', why: 'That’s a price variance, not a usage variance.' },
    { text: 'We sold fewer coats than budgeted.', kind: 'trap', why: 'That moves the sales volume variance. The standard quantity is for the output made.' },
  ],
  model: 'Two possible reasons for an adverse materials usage variance are, first, wastage caused by using inferior-quality materials, which fray or tear and are cut badly, so more has to be used for each garment. Second, lower worker efficiency: staff who are less skilled, poorly trained or careless waste more material in cutting and sewing. Machine breakdowns and spoilage are other possible causes. A supplier’s price rise is not one of them, because that belongs in the price variance.',
};

export const standardsLimitsBrief: BriefProblem = {
  kind: 'brief',
  id: 'standards-limits-brief',
  title: 'Can we trust the standards?',
  host: 'niamh',
  concept: 'standards-limits',
  prompt: [{ who: 'theo', text: 'Fine, but my standards were set two years ago and half the silk now comes from a new mill. The variances are nonsense.' }, { who: 'niamh', text: 'He has a point. Several, in fact.' }],
  question: 'Explain four problems with applying standard costing.',
  cap: 4,
  cards: [
    { text: 'Standards can quickly become outdated as prices, methods and technology change, so the variances stop meaning anything.', kind: 'key', why: 'The standard is only as good as its last review.' },
    { text: 'Factors beyond the manager’s control, such as a supplier’s price or a power cut, can drive a variance.', kind: 'key', why: 'A manager is judged on something they couldn’t influence.' },
    { text: 'It’s difficult to demarcate responsibility: poor material bought by purchasing can cause the studio’s usage variance.', kind: 'key', why: 'Variances are linked across departments.' },
    { text: 'There’s no incentive to beat the standard: once it’s hit, there’s nothing to gain from going further.', kind: 'key', why: 'The standard becomes a ceiling on effort.' },
    { text: 'Standards can create perverse incentives: buying cheap, poor-quality material for a favourable price variance, or rushing work so quality falls.', kind: 'key', why: 'People manage the measure, not the business.' },
    { text: 'Standard costing is illegal for external reporting.', kind: 'trap', why: 'No such rule: it is a management accounting tool.' },
    { text: 'Standards remove the need for judgement.', kind: 'trap', why: 'Variances need judgement to interpret.' },
    { text: 'Standard costing began in the early 1900s.', kind: 'filler', why: 'True, but not what was asked.' },
  ],
  model:
    'Standard costing has several problems. First, standards can quickly become outdated as prices, methods and technology change, which makes the variances meaningless. Second, factors beyond a manager’s control, such as a supplier’s price change or a power cut, can cause a variance, so managers may be judged on things they cannot influence. Third, it is hard to demarcate responsibility: poor material bought by purchasing can cause an adverse usage variance in the studio. Fourth, there is no incentive to beat the standard once it has been achieved. Standards can also create perverse incentives, such as buying cheap, poor-quality material to earn a favourable price variance.',
};

export const ACT8_PROBLEMS: Problem[] = [flexTF, controlSort, varBudgetProfit, varSales, varMaterials, varLabour, varOverheads, varReconcile, causesTable, usageReasonsBrief, varReverse, standardsLimitsBrief];
