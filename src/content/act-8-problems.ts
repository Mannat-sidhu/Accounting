// Chapter VIII problems: variances, using the formulas and sign convention on the exam sheet.
// The boss uses the past paper's single-product company (Q3A).
import * as A from '../engine/accounting';
import { eur } from '../engine/format';
import { pickInt, pickOne } from '../engine/rng';
import type { CalcProblem, ClassifyProblem, ConceptId, Problem, TableProblem } from '../engine/types';
import { defineCalc, w0, w2, whys } from './helpers';

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
  /** Other variable cost per unit (for budget contribution). */
  otherVar: number;
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
};

/** The past paper's company: no stocks, so materials bought = materials used. */
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

type VarKind = 'sales-price' | 'sales-volume' | 'mat-rate' | 'mat-qty' | 'lab-rate' | 'lab-eff';

interface VarP {
  kind: VarKind;
  d: VarData;
}

export const varyData = (rng: () => number): VarData => {
  const budgetUnits = pickInt(rng, 1000, 20000, 100);
  const budgetPrice = pickInt(rng, 50, 500, 5);
  const stdQty = pickOne(rng, [1.5, 2, 2.5, 3, 4]);
  const matRate = pickInt(rng, 5, 40);
  const stdHrs = pickOne(rng, [1, 2, 3, 4, 5, 6]);
  const labRate = pickInt(rng, 12, 30);
  const actualUnits = Math.round(budgetUnits * (0.85 + rng() * 0.3));
  const actQty = Math.round(actualUnits * stdQty * (0.92 + rng() * 0.16));
  const actHrs = Math.round(actualUnits * stdHrs * (0.9 + rng() * 0.2));
  return {
    product: pickOne(rng, ['wool coats', 'silk dresses', 'linen suits']),
    budgetUnits,
    budgetPrice,
    actualUnits,
    actualPrice: budgetPrice + pickInt(rng, -20, 20, 5) || budgetPrice - 5,
    stdQty,
    matRate,
    matUnit: 'm',
    actQty,
    actCost: Math.round(actQty * matRate * (0.92 + rng() * 0.16)),
    stdHrs,
    labRate,
    actHrs,
    actPay: Math.round(actHrs * labRate * (0.94 + rng() * 0.12)),
    otherVar: pickInt(rng, 2, 20),
  };
};

const NAMES: Record<VarKind, { name: string; method: string; concept: ConceptId; good: boolean }> = {
  'sales-price': { name: 'Sales Price Variance', method: 'sales-price-var', concept: 'sales-variances', good: true },
  'sales-volume': { name: 'Sales Volume Variance', method: 'sales-volume-var', concept: 'sales-variances', good: true },
  'mat-rate': { name: 'Materials Rate Variance', method: 'mat-rate-var', concept: 'material-variances', good: false },
  'mat-qty': { name: 'Materials Quantity Variance', method: 'mat-qty-var', concept: 'material-variances', good: false },
  'lab-rate': { name: 'Labour Rate Variance', method: 'lab-rate-var', concept: 'labour-variances', good: false },
  'lab-eff': { name: 'Labour Efficiency Variance', method: 'lab-eff-var', concept: 'labour-variances', good: false },
};

const CAUSES: Record<VarKind, { F: string; A: string; wrong: string }> = {
  'sales-price': { F: 'We sold at higher prices than planned: stronger demand or less discounting.', A: 'We sold at lower prices than planned: discounting or price cuts.', wrong: 'The studio wasted fabric.' },
  'sales-volume': { F: 'We sold more units than planned.', A: 'We sold fewer units than planned.', wrong: 'Silk prices went up.' },
  'mat-rate': { F: 'We paid less per metre than planned: a cheaper supplier or a lower grade.', A: 'We paid more per metre than planned: supplier price rises or rush orders.', wrong: 'Customers paid late.' },
  'mat-qty': { F: 'We used less material than the standard for this output: less waste.', A: 'We used more material than the standard for this output: waste or poor-quality material.', wrong: 'We sold at a discount.' },
  'lab-rate': { F: 'We paid less per hour than planned: a cheaper grade of staff.', A: 'We paid more per hour than planned: overtime or a pay rise.', wrong: 'The fabric was cheaper.' },
  'lab-eff': { F: 'Fewer hours than the standard for this output: skilled, motivated staff.', A: 'More hours than the standard for this output: training gaps, breakdowns or difficult material.', wrong: 'Selling prices were higher.' },
};

function variance(kind: VarKind, d: VarData) {
  const matActRate = d.actCost / d.actQty;
  const labActRate = d.actPay / d.actHrs;
  const cpu = d.budgetPrice - d.stdQty * d.matRate - d.stdHrs * d.labRate - d.otherVar;
  switch (kind) {
    case 'sales-price':
      return { v: A.salesPriceVariance(d.actualPrice, d.budgetPrice, d.actualUnits), ins: [['Actual price', d.actualPrice, 'eur'], ['Budget price', d.budgetPrice, 'eur'], ['Actual quantity sold', d.actualUnits, 'count']] as const, f: (a: number, b: number, c: number) => (a - b) * c };
    case 'sales-volume':
      return { v: A.salesVolumeVariance(d.actualUnits, d.budgetUnits, cpu), ins: [['Actual quantity sold', d.actualUnits, 'count'], ['Budget quantity', d.budgetUnits, 'count'], ['Budget contribution per unit', cpu, 'eur']] as const, f: (a: number, b: number, c: number) => (a - b) * c, cpu };
    case 'mat-rate':
      return { v: A.rateVariance(matActRate, d.matRate, d.actQty), ins: [['Actual rate per ' + d.matUnit, matActRate, 'number'], ['Budget rate per ' + d.matUnit, d.matRate, 'number'], ['Actual quantity (' + d.matUnit + ')', d.actQty, 'count']] as const, f: (a: number, b: number, c: number) => (a - b) * c };
    case 'mat-qty':
      return { v: A.quantityVariance(d.actQty, d.actualUnits * d.stdQty, d.matRate), ins: [['Actual quantity (' + d.matUnit + ')', d.actQty, 'count'], ['Standard quantity for actual output', d.actualUnits * d.stdQty, 'count'], ['Budget rate per ' + d.matUnit, d.matRate, 'number']] as const, f: (a: number, b: number, c: number) => (a - b) * c };
    case 'lab-rate':
      return { v: A.rateVariance(labActRate, d.labRate, d.actHrs), ins: [['Actual rate per hour', labActRate, 'number'], ['Budget rate per hour', d.labRate, 'number'], ['Actual hours', d.actHrs, 'count']] as const, f: (a: number, b: number, c: number) => (a - b) * c };
    case 'lab-eff':
      return { v: A.quantityVariance(d.actHrs, d.actualUnits * d.stdHrs, d.labRate), ins: [['Actual hours', d.actHrs, 'count'], ['Standard hours for actual output', d.actualUnits * d.stdHrs, 'count'], ['Budget rate per hour', d.labRate, 'number']] as const, f: (a: number, b: number, c: number) => (a - b) * c };
  }
}

const dataLines = (d: VarData) => [
  `Budget: ${w0(d.budgetUnits)} ${d.product} at ${eur(d.budgetPrice, 2)}. Standard per unit: ${w2(d.stdQty)} ${d.matUnit} of material at ${eur(d.matRate, 2)}, ${w2(d.stdHrs)} hours of labour at ${eur(d.labRate, 2)}, other variable costs ${eur(d.otherVar, 2)}.`,
  `Actual: sold ${w0(d.actualUnits)} at ${eur(d.actualPrice, 2)}. Bought and used ${w0(d.actQty)} ${d.matUnit} for ${eur(d.actCost)}. Labour ${w0(d.actHrs)} hours costing ${eur(d.actPay)}.`,
];

function varianceProblem(id: string, kinds: VarKind[], title: string, base: VarP): CalcProblem<VarP> {
  return defineCalc<VarP>({
    kind: 'calc',
    id,
    title,
    host: 'niamh',
    concept: NAMES[base.kind].concept,
    base,
    vary: (rng) => ({ kind: pickOne(rng, kinds), d: varyData(rng) }),
    build: ({ kind, d }) => {
      const n = NAMES[kind];
      const r = variance(kind, d);
      const fa = A.fa(r.v, n.good);
      const fav = fa === 'F';
      const ins = r.ins;
      const others = (Object.keys(NAMES) as VarKind[]).filter((k) => k !== kind).map((k) => NAMES[k].method);
      const options = [n.method, ...others.slice(0, 2), 'var-budget-qty'];
      const cause = CAUSES[kind];
      return {
        prompt: [{ who: 'margaux', text: `Silk cost more than budgeted, Theo says the studio was flat out, and Idris wants to know who to blame. Let’s start with one number: the ${n.name.toLowerCase()}.` }, ...dataLines(d)],
        ask: `Calculate the ${n.name.toLowerCase()}, and say whether it is favourable or adverse.`,
        formula: { options: Array.from(new Set(options)), correct: n.method, explain: `${n.name}: as on the sheet.` },
        stepNames: { formula: 'Pick the variance', decision: 'F or A, and why' },
        inputs: ins.map(([label, value, unit], i) => ({
          key: ['X', 'Y', 'Z'][i],
          symbol: ['\\text{Actual}', '\\text{Budget/Std}', '\\text{Multiplier}'][i],
          label,
          unit,
          expected: value,
          explain:
            label.startsWith('Actual rate')
              ? `${w0(label.includes('hour') ? d.actPay : d.actCost)} ÷ ${w0(label.includes('hour') ? d.actHrs : d.actQty)} = ${w2(value)}.`
              : label.startsWith('Standard')
                ? `${w0(d.actualUnits)} × ${w2(label.includes('hours') ? d.stdHrs : d.stdQty)} = ${w0(value)}.`
                : label.startsWith('Budget contribution')
                  ? `${w2(d.budgetPrice)} − ${w2(d.stdQty * d.matRate)} − ${w2(d.stdHrs * d.labRate)} − ${w2(d.otherVar)} = ${w2(value)}.`
                  : `${w2(value)}.`,
        })),
        solve: (v) => r.f(v.X, v.Y, v.Z),
        answer: { label: `${n.name} (size; sign checked in the next move)`, unit: 'eur', signless: true, explain: `(${w2(ins[0][1])} − ${w2(ins[1][1])}) × ${w2(ins[2][1])} = ${w0(r.v)}: ${eur(Math.abs(r.v))} ${fav ? 'favourable' : 'adverse'}.` },
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
        working: [`${n.name} = (${ins[0][0]} − ${ins[1][0]}) × ${ins[2][0]}`, `= (${w2(ins[0][1])} − ${w2(ins[1][1])}) × ${w2(ins[2][1])} = ${w0(r.v)}`, `= €${w0(Math.abs(r.v))} ${fav ? 'F' : 'A'}`],
        hints: { formula: 'The sheet lists them all. Match price, volume, rate or quantity.', inputs: 'Actual rate = total cost ÷ actual quantity. Standard quantity = actual units × standard per unit.', answer: '(Actual − budget) × the multiplier.', decision: n.good ? 'For sales, positive is favourable.' : 'For costs, positive is adverse.' },
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

export const causesTable: TableProblem = {
  kind: 'table',
  id: 'variance-causes',
  title: 'Follow the knock-on',
  host: 'margaux',
  concept: 'variance-causes',
  prompt: ['Each event moves more than one variance. Which way does each go? (– means no effect.)'],
  columns: [
    { label: 'Materials rate', options: ['F', 'A', '–'] },
    { label: 'Materials quantity', options: ['F', 'A', '–'] },
    { label: 'Labour efficiency', options: ['F', 'A', '–'] },
  ],
  rows: [
    { label: 'Theo buys cheaper, lower-grade silk that frays in the machines', answers: ['F', 'A', 'A'], why: 'Cheaper per metre, but more wasted, and slower to sew.' },
    { label: 'A new, skilled cutter lays out patterns with less waste', answers: ['–', 'F', 'F'], why: 'Less material used, and quicker work.' },
    { label: 'The mill raises its prices', answers: ['A', '–', '–'], why: 'Only the price per metre changes.' },
    { label: 'A machine breaks down for a week; staff wait around', answers: ['–', '–', 'A'], why: 'Paid hours with nothing made.' },
    { label: 'Premium Italian wool: dearer, but almost no waste', answers: ['A', 'F', 'F'], why: 'Higher rate; less waste, easier to work.' },
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
  show: 5,
  items: [
    { text: 'Standard quantity = actual units made × standard quantity per unit.', category: 'true', why: 'Flex to the output actually made.' },
    { text: 'Compare actual material cost with the original budget, even if we made more units.', category: 'false', why: 'Flex the budget to actual output first.' },
    { text: 'If the total materials cost is given, actual rate = total cost ÷ actual quantity.', category: 'true', why: 'That’s how you get the rate the sheet asks for.' },
    { text: 'A favourable variance is always good news.', category: 'false', why: 'Cheap material can cause adverse usage and labour variances.' },
    { text: 'For cost variances on the sheet, a positive figure is adverse.', category: 'true', why: 'Actual above standard means we spent more.' },
    { text: 'For sales variances on the sheet, a positive figure is adverse.', category: 'false', why: 'For sales, positive is favourable.' },
  ],
};

export const ACT8_PROBLEMS: Problem[] = [flexTF, varSales, varMaterials, varLabour, causesTable];
