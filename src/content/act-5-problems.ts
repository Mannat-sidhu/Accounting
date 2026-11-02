// Chapter V problems: ratios (exam sheet definitions) and liquidity management (cost–benefit, as in the worked answers).
import * as A from '../engine/accounting';
import { eur, fmt } from '../engine/format';
import { pickInt, pickOne } from '../engine/rng';
import type { BriefProblem, CalcProblem, ClassifyProblem, ConceptId, InputSpec, Problem, Unit } from '../engine/types';
import { defineCalc, table, w0, w2, whys } from './helpers';

// ---------------------------------------------------------------- the data behind every ratio

export interface FinData {
  name: string;
  sales: number;
  creditSales: number;
  cos: number;
  opex: number;
  interest: number;
  tax: number;
  inv: [number, number];
  rec: [number, number];
  pay: [number, number];
  cash: number;
  otherCL: number;
  nca: number;
  ltd: number;
  shares: number;
  price: number;
  dividend: number;
}

/** The house's year: built round the worked example (sales 250k, OP 40k, debt 300k, equity 200k). */
export const HOUSE: FinData = {
  name: 'Atelier Noor',
  sales: 250000,
  creditSales: 200000,
  cos: 150000,
  opex: 60000,
  interest: 15000,
  tax: 0,
  inv: [26000, 34000],
  rec: [38000, 42000],
  pay: [22000, 26000],
  cash: 74000,
  otherCL: 44000,
  nca: 420000,
  ltd: 300000,
  shares: 100000,
  price: 2.5,
  dividend: 10000,
};

/** The past-paper company (one balance sheet, so averages use the closing figure). */
export const OVERLOAD: FinData = {
  name: 'Overload',
  sales: 1825000,
  creditSales: 1825000,
  cos: 1460000,
  opex: 265000,
  interest: 25000,
  tax: 0,
  inv: [400000, 400000],
  rec: [500000, 500000],
  pay: [600000, 600000],
  cash: 80000,
  otherCL: 40000,
  nca: 400000,
  ltd: 400000,
  shares: 220000,
  price: 1,
  dividend: 0,
};

const derive = (d: FinData) => {
  const gp = d.sales - d.cos;
  const op = gp - d.opex;
  const np = op - d.interest - d.tax;
  const ca = d.inv[1] + d.rec[1] + d.cash;
  const cl = d.pay[1] + d.otherCL;
  const equity = d.nca + ca - cl - d.ltd;
  const ce = equity + d.ltd;
  const avg = (x: [number, number]) => A.average(x[0], x[1]);
  return { gp, op, np, ca, cl, equity, ce, avgInv: avg(d.inv), avgRec: avg(d.rec), avgPay: avg(d.pay), eps: np / d.shares, dps: d.dividend / d.shares };
};

type RatioId = 'gpm' | 'opm' | 'roce' | 'roe' | 'inv-days' | 'debtor-days' | 'creditor-days' | 'current' | 'quick' | 'gearing' | 'int-cover' | 'eps' | 'pe' | 'div-cover' | 'div-yield';

interface RatioDef {
  name: string;
  unit: Unit;
  /** The question Aoife or Idris asks in plain words. */
  ask: string;
  ins: (d: FinData) => { key: string; label: string; value: number; explain: string }[];
  f: (a: number, b: number) => number;
  /** Higher is better for the house (for the comparison). */
  higherBetter: boolean;
  up: string;
  down: string;
  /** An equally arguable opposite reading of a rise (or a fall), with its marks out of 2. */
  altUp?: { text: string; score: number };
  altDown?: { text: string; score: number };
}

const two = (d: FinData) => d.inv[0] !== d.inv[1] || d.rec[0] !== d.rec[1];

const RATIOS: Record<RatioId, RatioDef> = {
  gpm: {
    name: 'Gross Profit Margin',
    unit: 'pct',
    ask: 'How much of each euro of sales is left after the cost of the clothes?',
    ins: (d) => [
      { key: 'a', label: 'Gross profit', value: derive(d).gp, explain: `Sales ${w0(d.sales)} − cost of sales ${w0(d.cos)}.` },
      { key: 'b', label: 'Sales', value: d.sales, explain: `${w0(d.sales)}.` },
    ],
    f: (a, b) => (a / b) * 100,
    higherBetter: true,
    up: 'Better prices or cheaper materials.',
    down: 'Discounting, or fabric costs rising faster than prices.',
  },
  opm: {
    name: 'Operating Profit Margin',
    unit: 'pct',
    ask: 'After every running cost, how much of each euro of sales is profit?',
    ins: (d) => [
      { key: 'a', label: 'Operating profit', value: derive(d).op, explain: `Gross profit ${w0(derive(d).gp)} − operating expenses ${w0(d.opex)}.` },
      { key: 'b', label: 'Sales', value: d.sales, explain: `${w0(d.sales)}.` },
    ],
    f: (a, b) => (a / b) * 100,
    higherBetter: true,
    up: 'Costs are under better control relative to sales.',
    down: 'Overheads are growing faster than sales.',
  },
  roce: {
    name: 'Return on Capital Employed',
    unit: 'pct',
    ask: 'What return is the business making on all the long-term money in it?',
    ins: (d) => [
      { key: 'a', label: 'Operating profit', value: derive(d).op, explain: `${w0(derive(d).op)}, before interest.` },
      { key: 'b', label: 'Total capital employed', value: derive(d).ce, explain: `Equity ${w0(derive(d).equity)} + long-term liabilities ${w0(d.ltd)}.` },
    ],
    f: (a, b) => (a / b) * 100,
    higherBetter: true,
    up: 'Each euro invested is working harder.',
    down: 'Capital has grown faster than profit.',
  },
  roe: {
    name: 'Return on Equity',
    unit: 'pct',
    ask: 'What return are the owners getting on their stake?',
    ins: (d) => [
      { key: 'a', label: 'Net profit', value: derive(d).np, explain: `Operating profit ${w0(derive(d).op)} − interest ${w0(d.interest)}${d.tax ? ` − tax ${w0(d.tax)}` : ''}.` },
      { key: 'b', label: 'Equity', value: derive(d).equity, explain: `${w0(derive(d).equity)}.` },
    ],
    f: (a, b) => (a / b) * 100,
    higherBetter: true,
    up: 'More profit for the owners on each euro of their stake.',
    down: 'Owners are earning less on their stake.',
  },
  'inv-days': {
    name: 'Inventory Days',
    unit: 'days',
    ask: 'How long does stock sit on the rails before it’s sold?',
    ins: (d) => [
      { key: 'a', label: two(d) ? 'Average inventory' : 'Inventory (only one balance sheet)', value: derive(d).avgInv, explain: two(d) ? `(${w0(d.inv[0])} + ${w0(d.inv[1])}) ÷ 2.` : `${w0(d.inv[1])}: use the closing figure.` },
      { key: 'b', label: 'Cost of sales', value: d.cos, explain: `${w0(d.cos)}.` },
    ],
    f: (a, b) => (a / b) * 365,
    higherBetter: false,
    up: 'Stock is sitting longer, tying up cash.',
    down: 'Stock is turning over faster.',
  },
  'debtor-days': {
    name: 'Debtor Days',
    unit: 'days',
    ask: 'How long are customers taking to pay?',
    ins: (d) => [
      { key: 'a', label: two(d) ? 'Average trade receivables' : 'Trade receivables (only one balance sheet)', value: derive(d).avgRec, explain: two(d) ? `(${w0(d.rec[0])} + ${w0(d.rec[1])}) ÷ 2.` : `${w0(d.rec[1])}: use the closing figure.` },
      { key: 'b', label: 'Credit sales', value: d.creditSales, explain: `Credit sales only: ${w0(d.creditSales)}.` },
    ],
    f: (a, b) => (a / b) * 365,
    higherBetter: false,
    up: 'Customers are paying more slowly.',
    down: 'Customers are paying faster.',
  },
  'creditor-days': {
    name: 'Creditor Days',
    unit: 'days',
    ask: 'How long are we taking to pay our suppliers?',
    ins: (d) => [
      { key: 'a', label: two(d) ? 'Average trade payables' : 'Trade payables (only one balance sheet)', value: derive(d).avgPay, explain: two(d) ? `(${w0(d.pay[0])} + ${w0(d.pay[1])}) ÷ 2.` : `${w0(d.pay[1])}: use the closing figure.` },
      { key: 'b', label: 'Cost of sales', value: d.cos, explain: `The sheet uses cost of sales: ${w0(d.cos)}.` },
    ],
    f: (a, b) => (a / b) * 365,
    higherBetter: true,
    up: 'We hold cash longer, but suppliers may lose patience.',
    down: 'We pay faster, which uses cash sooner.',
    altUp: { text: 'Slower payment strains suppliers: we risk losing credit terms or early-payment discounts.', score: 2 },
    altDown: { text: 'Paying faster keeps suppliers happy and may earn early-payment discounts.', score: 2 },
  },
  current: {
    name: 'Current Ratio',
    unit: 'number',
    ask: 'Can we cover what’s due in the next year from our current assets?',
    ins: (d) => [
      { key: 'a', label: 'Current assets', value: derive(d).ca, explain: `Inventory ${w0(d.inv[1])} + receivables ${w0(d.rec[1])} + cash ${w0(d.cash)}.` },
      { key: 'b', label: 'Current liabilities', value: derive(d).cl, explain: `Trade payables ${w0(d.pay[1])} + other ${w0(d.otherCL)}.` },
    ],
    f: (a, b) => a / b,
    higherBetter: true,
    up: 'More current assets behind each euro due.',
    down: 'Less cover for the bills due this year.',
    altUp: { text: 'Too much cash, stock and debtors sitting idle earns nothing; a very high ratio can mean poor working-capital control.', score: 1.5 },
  },
  quick: {
    name: 'Quick-Acid Test Ratio',
    unit: 'number',
    ask: 'Leave the stock out. Can we still pay what’s due soon?',
    ins: (d) => [
      { key: 'a', label: 'Current assets less inventory', value: derive(d).ca - d.inv[1], explain: `${w0(derive(d).ca)} − ${w0(d.inv[1])}.` },
      { key: 'b', label: 'Current liabilities', value: derive(d).cl, explain: `${w0(derive(d).cl)}.` },
    ],
    f: (a, b) => a / b,
    higherBetter: true,
    up: 'Easier to pay bills without selling stock.',
    down: 'More reliant on selling stock to pay bills.',
  },
  gearing: {
    name: 'Gearing Ratio',
    unit: 'pct',
    ask: 'How much of the long-term money in this house is borrowed?',
    ins: (d) => [
      { key: 'a', label: 'Long-term liabilities', value: d.ltd, explain: `${w0(d.ltd)}.` },
      { key: 'b', label: 'Total capital employed', value: derive(d).ce, explain: `Equity ${w0(derive(d).equity)} + long-term liabilities ${w0(d.ltd)}.` },
    ],
    f: (a, b) => (a / b) * 100,
    higherBetter: false,
    up: 'More borrowed, so more financial risk.',
    down: 'Less reliant on lenders.',
  },
  'int-cover': {
    name: 'Interest Cover',
    unit: 'times',
    ask: 'How many times over could profit pay the interest bill?',
    ins: (d) => [
      { key: 'a', label: 'Operating profit', value: derive(d).op, explain: `${w0(derive(d).op)}.` },
      { key: 'b', label: 'Interest expense', value: d.interest, explain: `${w0(d.interest)}.` },
    ],
    f: (a, b) => a / b,
    higherBetter: true,
    up: 'A bigger cushion before interest becomes a problem.',
    down: 'Less room if profit dips.',
  },
  eps: {
    name: 'Earnings per Share',
    unit: 'number',
    ask: 'How much profit did each share earn (in euro)?',
    ins: (d) => [
      { key: 'a', label: 'Earnings for the year', value: derive(d).np, explain: `Net profit ${w0(derive(d).np)}.` },
      { key: 'b', label: 'Number of shares in issue', value: d.shares, explain: `${w0(d.shares)} shares.` },
    ],
    f: (a, b) => a / b,
    higherBetter: true,
    up: 'Each share earned more.',
    down: 'Each share earned less.',
  },
  pe: {
    name: 'Price Earnings Ratio',
    unit: 'number',
    ask: 'How many years of current earnings is a buyer paying for?',
    ins: (d) => [
      { key: 'a', label: 'Market price per share (€)', value: d.price, explain: `€${w2(d.price)}.` },
      { key: 'b', label: 'Earnings per share (€)', value: derive(d).eps, explain: `${w0(derive(d).np)} ÷ ${w0(d.shares)} = €${w2(derive(d).eps)}.` },
    ],
    f: (a, b) => a / b,
    higherBetter: true,
    up: 'Buyers expect more growth.',
    down: 'Buyers are less optimistic.',
    altUp: { text: 'The shares may be getting expensive compared with what they earn.', score: 1.5 },
    altDown: { text: 'The shares may now be cheap compared with what they earn: a buying opportunity.', score: 1.5 },
  },
  'div-cover': {
    name: 'Dividend Cover',
    unit: 'times',
    ask: 'How many times over could this year’s earnings pay the dividend?',
    ins: (d) => [
      { key: 'a', label: 'Earnings for the year', value: derive(d).np, explain: `${w0(derive(d).np)}.` },
      { key: 'b', label: 'Dividend declared', value: d.dividend, explain: `${w0(d.dividend)}.` },
    ],
    f: (a, b) => a / b,
    higherBetter: true,
    up: 'The dividend is safer.',
    down: 'The dividend is paid out of a thinner cushion.',
  },
  'div-yield': {
    name: 'Dividend Yield',
    unit: 'pct',
    ask: 'What cash return does a shareholder get on the share price?',
    ins: (d) => [
      { key: 'a', label: 'Dividend per share (€)', value: derive(d).dps, explain: `${w0(d.dividend)} ÷ ${w0(d.shares)} = €${w2(derive(d).dps)}.` },
      { key: 'b', label: 'Market price per share (€)', value: d.price, explain: `€${w2(d.price)}.` },
    ],
    f: (a, b) => (a / b) * 100,
    higherBetter: true,
    up: 'More cash back for each euro of share price.',
    down: 'Less cash back on the share price.',
  },
};

export const ratioValue = (id: RatioId, d: FinData) => {
  const [a, b] = RATIOS[id].ins(d);
  return RATIOS[id].f(a.value, b.value);
};

interface RatioP {
  ratio: RatioId;
  d: FinData;
  /** Last year's figure for the comparison. */
  last: number;
}

function jitter(rng: () => number, d: FinData): FinData {
  const k = 0.6 + rng() * 1.2;
  const r = (n: number, spread = 0.15) => Math.round((n * k * (1 - spread + rng() * spread * 2)) / 100) * 100;
  const sales = r(d.sales, 0.05);
  return {
    ...d,
    sales,
    creditSales: Math.min(sales, r(d.creditSales, 0.05)),
    cos: Math.round(sales * (0.5 + rng() * 0.15)),
    opex: Math.round(sales * (0.15 + rng() * 0.12)),
    interest: r(d.interest),
    inv: [r(d.inv[0]), r(d.inv[1])],
    rec: [r(d.rec[0]), r(d.rec[1])],
    pay: [r(d.pay[0]), r(d.pay[1])],
    cash: r(d.cash),
    otherCL: r(d.otherCL),
    nca: r(d.nca),
    ltd: r(d.ltd),
    dividend: Math.max(1000, r(d.dividend)),
  };
}

const RATIO_HOST: Record<string, 'aoife' | 'idris'> = { investor: 'idris' };

function ratioProblem(id: string, concept: ConceptId, family: RatioId[], title: string, base: RatioP): CalcProblem<RatioP> {
  return defineCalc<RatioP>({
    kind: 'calc',
    id,
    title,
    host: RATIO_HOST[concept === 'investor-ratios' ? 'investor' : ''] ?? 'aoife',
    concept,
    uses: ['ratio-families'],
    base,
    vary: (rng) => {
      let d = jitter(rng, HOUSE);
      for (let i = 0; i < 10 && (derive(d).op <= 2000 || derive(d).np <= 1000 || derive(d).equity <= 20000); i++) d = jitter(rng, HOUSE);
      const ratio = pickOne(rng, family);
      const v = ratioValue(ratio, d);
      return { ratio, d, last: Math.round(v * (pickOne(rng, [0.8, 0.88, 1.12, 1.25])) * 100) / 100 };
    },
    build: ({ ratio, d, last }) => {
      const def = RATIOS[ratio];
      const ins = def.ins(d);
      const v = def.f(ins[0].value, ins[1].value);
      const rose = v > last;
      const better = rose === def.higherBetter;
      const dd = derive(d);
      const inputs: InputSpec[] = ins.map((x) => ({ key: x.key, symbol: x.key === 'a' ? '\\text{Top}' : '\\text{Bottom}', label: x.label, unit: x.label.includes('€') || def.unit === 'number' ? 'number' : 'eur', expected: x.value, explain: x.explain }));
      const others = (Object.keys(RATIOS) as RatioId[]).filter((r) => r !== ratio);
      const options = [ratio, ...family.filter((r) => r !== ratio), ...others.filter((r) => !family.includes(r))].slice(0, 4);
      const shown = (n: number) => fmt(n, def.unit, def.unit === 'pct' ? 1 : 2);
      return {
        prompt: [
          { who: concept === 'investor-ratios' ? 'idris' : 'aoife', text: def.ask },
          { who: 'margaux', text: `Last year it was ${shown(last)}. The figures are below.` },
        ],
        ask: `Work out ${def.name.toLowerCase()} for this year, then compare it with last year.`,
        data: table(`${d.name}: this year’s accounts (€)`, ['', 'Start', 'End'], [
          ['Sales (credit sales ' + w0(d.creditSales) + ')', '', w0(d.sales)],
          ['Cost of sales', '', w0(d.cos)],
          ['Operating expenses', '', w0(d.opex)],
          ['Interest expense', '', w0(d.interest)],
          ['Inventory', w0(d.inv[0]), w0(d.inv[1])],
          ['Trade receivables', w0(d.rec[0]), w0(d.rec[1])],
          ['Cash', '', w0(d.cash)],
          ['Trade payables', w0(d.pay[0]), w0(d.pay[1])],
          ['Other current liabilities', '', w0(d.otherCL)],
          ['Non-current assets', '', w0(d.nca)],
          ['Long-term loans', '', w0(d.ltd)],
          ['Equity', '', w0(dd.equity)],
          [`Shares in issue ${w0(d.shares)}; price €${w2(d.price)}; dividend declared ${w0(d.dividend)}`],
        ]),
        formula: {
          options,
          correct: ratio,
          explain: `${def.name} answers “${def.ask}”`,
        },
        stepNames: { formula: 'Pick the ratio', decision: 'Compare and call' },
        inputs,
        solve: (x) => def.f(x.a, x.b),
        answer: { label: def.name, unit: def.unit, explain: `${w0(ins[0].value)} ÷ ${ins[1].value < 100 ? w2(ins[1].value) : w0(ins[1].value)}${def.unit === 'pct' ? ' × 100' : def.unit === 'days' ? ' × 365' : ''} = ${shown(v)}.` },
        decision: {
          question: `This year ${shown(v)}, last year ${shown(last)}. Better or worse for the house?`,
          options: [
            { id: 'better', label: 'Better' },
            { id: 'worse', label: 'Worse' },
          ],
          correct: better ? 'better' : 'worse',
          why: whys(rose ? def.up : def.down, rose ? def.down : def.up, 'A ratio can’t be compared with last year’s.', ...((rose ? def.altUp : def.altDown) ? [(rose ? def.altUp : def.altDown)!.text] : [])),
          correctWhy: 'w0',
          alsoAccept: (rose ? def.altUp : def.altDown)
            ? [
                {
                  option: better ? 'worse' : 'better',
                  why: 'w3',
                  score: (rose ? def.altUp : def.altDown)!.score,
                  note: (rose ? def.altUp : def.altDown)!.score >= 2 ? 'Equally right: this ratio cuts both ways, and saying why is what earns the marks.' : 'Defensible: a fair reading, though the usual one is the other way.',
                },
              ]
            : undefined,
          explain: `${def.name} ${rose ? 'rose' : 'fell'} from ${shown(last)} to ${shown(v)}. ${rose ? def.up : def.down}`,
        },
        working: [`${def.name} = ${w0(ins[0].value)} ÷ ${ins[1].value < 100 ? w2(ins[1].value) : w0(ins[1].value)}${def.unit === 'pct' ? ' × 100%' : def.unit === 'days' ? ' × 365' : ''} = ${shown(v)}`, `Last year ${shown(last)}: ${better ? 'an improvement' : 'a deterioration'}. ${rose ? def.up : def.down}`],
        hints: {
          formula: 'Read the question in plain words. Which ratio answers exactly that?',
          inputs: 'Check the sheet for which profit and which balance to use. Averages when you have two balance sheets.',
          answer: 'Top ÷ bottom, then × 100 for a percentage or × 365 for days.',
          decision: 'Is a higher figure good or bad for this one?',
        },
        outcomes: {
          better: { valueDelta: better ? 1000 : -1000, news: better ? 'Aoife ticks another box on her checklist.' : 'Margaux spins a falling ratio as good news. Aoife writes that down too.' },
          worse: { valueDelta: better ? -500 : 1500, news: better ? 'The board worries about a ratio that actually improved.' : 'Margaux flags the problem before Aoife does. Aoife appreciates it.' },
        },
        cfoLine: `${def.name} ${shown(v)} (last year ${shown(last)}).`,
      };
    },
  });
}

export const ratioProfit = ratioProblem('ratio-profit', 'profitability', ['gpm', 'opm', 'roce', 'roe'], 'Aoife’s checklist: profit', { ratio: 'roce', d: HOUSE, last: 9.5 });
export const ratioEfficiency = ratioProblem('ratio-efficiency', 'efficiency', ['inv-days', 'debtor-days', 'creditor-days'], 'Aoife’s checklist: how fast?', { ratio: 'debtor-days', d: HOUSE, last: 70 });
export const ratioLiquidity = ratioProblem('ratio-liquidity', 'liquidity', ['current', 'quick'], 'Aoife’s checklist: paying the bills', { ratio: 'quick', d: HOUSE, last: 1.8 });
export const ratioGearing = ratioProblem('ratio-gearing', 'gearing-cover', ['gearing', 'int-cover'], 'Aoife’s checklist: the debt', { ratio: 'int-cover', d: HOUSE, last: 3.4 });
export const ratioInvestor = ratioProblem('ratio-investor', 'investor-ratios', ['eps', 'pe', 'div-cover', 'div-yield'], 'What’s my share worth?', { ratio: 'pe', d: HOUSE, last: 8.5 });

// ---------------------------------------------------------------- cash conversion cycle

interface CycleP {
  inv: number;
  deb: number;
  cred: number;
  sales: number;
  funds: number;
}

export const cashCycleCalc = defineCalc<CycleP>({
  kind: 'calc',
  id: 'cash-cycle',
  title: 'How long is our cash tied up?',
  host: 'margaux',
  concept: 'efficiency',
  base: { inv: 50, deb: 60, cred: 30, sales: 10950000, funds: 8 },
  vary: (rng) => ({ inv: pickInt(rng, 20, 120, 5), deb: pickInt(rng, 25, 100, 5), cred: pickInt(rng, 15, 75, 5), sales: pickInt(rng, 200000, 2000000, 50000), funds: pickInt(rng, 5, 10) }),
  build: ({ inv, deb, cred }) => {
    const cyc = A.cashCycle(inv, deb, cred);
    return {
      prompt: [`Stock sits for ${inv} days on average. Customers take ${deb} days to pay. We take ${cred} days to pay our suppliers.`, 'How many days is our own cash stuck in the business?'],
      ask: 'What is the cash conversion cycle, in days?',
      formula: {
        options: ['cash-cycle', 'cash-cycle-plus', 'cash-cycle-debtors'],
        correct: 'cash-cycle',
        explain: 'Stock days plus debtor days, less the days suppliers fund for us.',
      },
      inputs: [
        { key: 'I', symbol: '\\text{Inventory days}', label: 'Inventory days', unit: 'days', expected: inv, explain: `${inv}.` },
        { key: 'D', symbol: '\\text{Debtor days}', label: 'Debtor days', unit: 'days', expected: deb, explain: `${deb}.` },
        { key: 'C', symbol: '\\text{Creditor days}', label: 'Creditor days', unit: 'days', expected: cred, explain: `${cred}.` },
      ],
      solve: (v) => v.I + v.D - v.C,
      answer: { label: 'Cash conversion cycle', unit: 'days', explain: `${inv} + ${deb} − ${cred} = ${cyc} days.` },
      decision: {
        question: 'Which change shortens the cycle?',
        options: [
          { id: 'faster', label: 'Collect from customers faster' },
          { id: 'pay', label: 'Pay suppliers faster' },
        ],
        correct: 'faster',
        why: whys('Fewer debtor days means less of our cash waiting in receivables.', 'Paying suppliers faster frees up cash.', 'The cycle only depends on stock.'),
        correctWhy: 'w0',
        explain: 'Cutting inventory or debtor days shortens the cycle; paying suppliers faster lengthens it.',
      },
      working: [`Cash conversion cycle = inventory days + debtor days − creditor days`, `= ${inv} + ${deb} − ${cred} = ${cyc} days`],
      hints: { formula: 'Suppliers waiting for their money helps us.', answer: 'Add two, take one away.', decision: 'Which days are we waiting, and which are suppliers waiting?' },
      outcomes: {
        faster: { valueDelta: 1000, news: 'Margaux tightens the credit terms for new boutiques.' },
        pay: { valueDelta: -1000, news: 'Theo pays every supplier on day one. The overdraft notices.' },
      },
      cfoLine: `Cash cycle ${cyc} days.`,
    };
  },
});

// ---------------------------------------------------------------- liquidity management

/**
 * Real-world caveat: these questions ask about profit, but a house that is short of cash may take a measure that costs a
 * little profit, and one that saves money may still lose customers. Defensible, for part of the mark.
 */
const LIQ_WHY = (good: boolean) =>
  good ? 'It saves money on paper, but tighter credit could drive boutiques to rivals.' : 'It costs profit, but if the house is short of cash, getting paid sooner may still be worth it.';
const liqAlt = (good: boolean) => [
  {
    option: good ? 'no' : 'yes',
    why: 'w3',
    score: 1,
    note: good
      ? 'A fair commercial worry, and worth a sentence in the exam, but on the numbers asked for it helps profit. Part marks.'
      : 'A real reason firms do this, and worth a sentence in the exam. But the question asks about profit, and on profit it loses. Part marks.',
  },
];

interface CcP {
  sales: number;
  /** Either debtor days now, or the receivables balance (then the player finds the days). */
  daysNow: number | null;
  receivables: number | null;
  /** Target days, or a reduction in days. */
  to: number | null;
  by: number | null;
  funds: number;
  cost: number;
  name: string;
}

const daysOf = (p: CcP) => (p.daysNow ?? Math.round(A.debtorDays(p.receivables!, p.sales) * 100) / 100);
const savedOf = (p: CcP) => (p.by ?? daysOf(p) - p.to!);

export const creditControlCalc = defineCalc<CcP>({
  kind: 'calc',
  id: 'credit-control',
  title: 'Chasing the boutiques',
  host: 'margaux',
  concept: 'liquidity-management',
  uses: ['efficiency'],
  base: { sales: 8000000, daysNow: 70, receivables: null, to: 50, by: null, funds: 8, cost: 30000, name: 'the wholesale arm' },
  vary: (rng) => {
    const sales = pickInt(rng, 500000, 9000000, 50000);
    const daysNow = pickInt(rng, 45, 110, 5);
    const useBal = rng() < 0.4;
    return {
      sales,
      daysNow: useBal ? null : daysNow,
      receivables: useBal ? Math.round((sales * daysNow) / 365 / 1000) * 1000 : null,
      to: rng() < 0.5 ? daysNow - pickInt(rng, 10, 40, 5) : null,
      by: null,
      funds: pickInt(rng, 5, 12),
      cost: pickInt(rng, 5000, 80000, 5000),
      name: 'the wholesale arm',
    } as CcP;
  },
  build: (p) => {
    const p2 = { ...p, to: p.to ?? (p.by === null ? daysOf(p) - 20 : null) };
    const now = daysOf(p2);
    const saved = savedOf(p2);
    const r = A.creditControl(p.sales, saved, p.funds, p.cost);
    const good = r.net > 0;
    return {
      prompt: [
        `Credit sales are ${eur(p.sales)} a year. ${p.daysNow !== null ? `Customers take ${now} days to pay on average.` : `Trade receivables stand at ${eur(p.receivables!)}.`} We fund working capital at ${p.funds}% a year.`,
        `A credit-control firm wants ${eur(p.cost)} a year to ${p2.by !== null ? `cut our debtor days by ${p2.by}` : `get debtor days down to ${p2.to}`}.`,
      ],
      ask: 'What’s the net effect on profit each year?',
      spot:
        p.daysNow === null
          ? {
              question: `First, what are debtor days now? (${w0(p.receivables!)} ÷ ${w0(p.sales)} × 365)`,
              options: [
                { id: 'right', label: `${w2(now)} days` },
                { id: 'wrong1', label: `${w2((p.sales / p.receivables!) )} days` },
                { id: 'wrong2', label: `${w2(now / 2)} days` },
              ],
              correct: ['right'],
              explain: `Receivables ÷ credit sales × 365 = ${w2(now)} days.`,
            }
          : undefined,
      stepNames: { spot: 'Debtor days now', formula: 'Cost v. benefit' },
      formula: {
        options: ['days-saving', 'financing-saving', 'net-impact'],
        correct: 'days-saving',
        explain: 'The benefit is funding saved on the days cut: days saved ÷ 365 × credit sales × cost of funds. Then take off the cost.',
      },
      inputs: [
        { key: 'S', symbol: '\\text{Credit sales}', label: 'Credit sales', unit: 'eur', expected: p.sales, explain: `${eur(p.sales)}.` },
        { key: 'D', symbol: '\\text{Days saved}', label: 'Debtor days saved', unit: 'days', expected: saved, explain: p2.by !== null ? `${saved} days.` : `${w2(now)} − ${p2.to} = ${w2(saved)} days.` },
        { key: 'R', symbol: 'r', label: 'Cost of funds', unit: 'pct', expected: p.funds, explain: `${p.funds}%.` },
        { key: 'C', symbol: '\\text{Cost}', label: 'Yearly cost of the measure', unit: 'eur', expected: p.cost, explain: `${eur(p.cost)}.`, signless: true },
      ],
      solve: (v) => (v.D / 365) * v.S * (v.R / 100) - Math.abs(v.C),
      answer: { label: 'Net effect on profit (negative for a cost)', unit: 'eur', explain: `Saving ${w2(saved)} ÷ 365 × ${w0(p.sales)} × ${p.funds}% = ${w2(r.saving)}; less ${w0(p.cost)} = ${w2(r.net)}.` },
      decision: {
        question: 'Sign the credit-control contract?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ],
        correct: good ? 'yes' : 'no',
        why: whys(good ? 'The funding saved is more than the yearly cost.' : 'It costs more each year than it saves in funding.', 'Any cut in debtor days is worth paying for.', 'Debtor days don’t affect profit.', LIQ_WHY(good)),
        correctWhy: 'w0',
        alsoAccept: liqAlt(good),
        explain: good ? `A net saving of ${eur(r.net, 2)} a year.` : `A net cost of ${eur(-r.net, 2)} a year: it helps cash flow, but not profit.`,
      },
      working: [
        ...(p.daysNow === null ? [`Debtor days = ${w0(p.receivables!)} ÷ ${w0(p.sales)} × 365 = ${w2(now)}`] : []),
        `Cost = ${w0(p.cost)}`,
        `Saving = ${w2(saved)} ÷ 365 × ${w0(p.sales)} × ${p.funds}% = ${w2(r.saving)}`,
        `Net = ${w2(r.saving)} − ${w0(p.cost)} = ${w2(r.net)}  (${good ? 'worth doing' : 'not advised'})`,
      ],
      hints: { spot: 'Receivables over credit sales, times 365.', formula: 'It’s linear: go straight to the days saved.', inputs: 'Days saved = days now − target days.', answer: 'Saving − cost.', decision: 'Is the net positive?' },
      outcomes: {
        yes: { valueDelta: good ? Math.round(r.net / 4) : -Math.round(-r.net / 4), news: good ? 'The credit controllers earn their fee in the first quarter.' : 'Debtors pay faster, but the fee eats more than the interest saved.' },
        no: { valueDelta: good ? -1000 : 1500, news: good ? 'A cheap win left on the table.' : 'Margaux turns the contract down politely and chases the slow payers herself.' },
      },
      cfoLine: `Credit control: net ${eur(r.net, 0)} a year.`,
    };
  },
});

interface PdP {
  sales: number;
  takeUp: number;
  discount: number;
  daysNow: number;
  daysAfter: number;
  funds: number;
}

export const promptDiscountCalc = defineCalc<PdP>({
  kind: 'calc',
  id: 'prompt-discount',
  title: 'Pay early, pay less',
  host: 'theo',
  concept: 'liquidity-management',
  base: { sales: 8000000, takeUp: 50, discount: 2, daysNow: 70, daysAfter: 45, funds: 8 },
  vary: (rng) => {
    const daysNow = pickInt(rng, 50, 100, 5);
    return { sales: pickInt(rng, 500000, 9000000, 50000), takeUp: pickInt(rng, 20, 70, 10), discount: pickOne(rng, [1, 1.5, 2, 2.5]), daysNow, daysAfter: daysNow - pickInt(rng, 10, 35, 5), funds: pickInt(rng, 5, 12) };
  },
  build: ({ sales, takeUp, discount, daysNow, daysAfter, funds }) => {
    const r = A.promptDiscount(sales, takeUp, discount, daysNow - daysAfter, funds);
    const good = r.net > 0;
    return {
      prompt: [
        { who: 'theo', mood: 'happy', text: `Easy fix: give boutiques a ${discount}% discount if they pay early! I reckon ${takeUp}% of our sales would take it.` },
        { who: 'margaux', text: `Credit sales ${eur(sales)}; debtor days ${daysNow}, falling to ${daysAfter} if Theo’s right. Our cost of funds is ${funds}%.` },
      ],
      ask: 'What’s the net effect on profit each year?',
      formula: {
        options: ['days-saving', 'net-impact', 'financing-saving'],
        correct: 'days-saving',
        explain: 'Benefit: funding saved on the days cut. Cost: the discount given away on the sales that take it.',
      },
      stepNames: { formula: 'Cost v. benefit' },
      inputs: [
        { key: 'S', symbol: '\\text{Credit sales}', label: 'Credit sales', unit: 'eur', expected: sales, explain: `${eur(sales)}.` },
        { key: 'T', symbol: '\\text{Take-up}', label: 'Share of sales taking the discount', unit: 'pct', expected: takeUp, explain: `${takeUp}%.` },
        { key: 'K', symbol: '\\text{Discount}', label: 'Discount', unit: 'pct', expected: discount, explain: `${discount}%.` },
        { key: 'D', symbol: '\\text{Days saved}', label: 'Debtor days saved', unit: 'days', expected: daysNow - daysAfter, explain: `${daysNow} − ${daysAfter} = ${daysNow - daysAfter}.` },
        { key: 'R', symbol: 'r', label: 'Cost of funds', unit: 'pct', expected: funds, explain: `${funds}%.` },
      ],
      solve: (v) => (v.D / 365) * v.S * (v.R / 100) - v.S * (v.T / 100) * (v.K / 100),
      answer: { label: 'Net effect on profit (negative for a cost)', unit: 'eur', explain: `Saving ${w2(r.saving)} − discount cost ${w2(r.cost)} = ${w2(r.net)}.` },
      decision: {
        question: 'Offer the discount?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ],
        correct: good ? 'yes' : 'no',
        why: whys(good ? 'The funding saved is bigger than the discount given away.' : 'The discount given away is bigger than the funding saved.', 'Faster payment is always worth a discount.', 'A discount doesn’t cost anything because it’s not cash.', LIQ_WHY(good)),
        correctWhy: 'w0',
        alsoAccept: liqAlt(good),
        explain: good ? `Net saving ${eur(r.net, 2)} a year.` : `Net cost ${eur(-r.net, 2)} a year. Discounts are an expensive way to borrow.`,
      },
      working: [`Cost = ${discount}% × ${takeUp}% × ${w0(sales)} = ${w2(r.cost)}`, `Saving = ${daysNow - daysAfter} ÷ 365 × ${w0(sales)} × ${funds}% = ${w2(r.saving)}`, `Net = ${w2(r.net)}`],
      hints: { formula: 'Two parts: what we give away, and what we save.', inputs: 'The discount applies only to the sales that take it.', answer: 'Saving − cost.', decision: 'Is it positive?' },
      outcomes: {
        yes: { valueDelta: good ? 1500 : -2000, news: good ? 'Boutiques pay early and the overdraft shrinks.' : 'Everyone takes the discount. Margin drops more than interest does.' },
        no: { valueDelta: good ? -800 : 1500, news: good ? 'A useful lever left unpulled.' : 'Theo’s idea goes in the drawer marked “nice try”.' },
      },
      cfoLine: `Prompt-payment discount: net ${eur(r.net, 0)} a year.`,
    };
  },
});

interface IdP {
  /** Receivables balance, or null to work it out from sales and days. */
  receivables: number | null;
  sales: number;
  days: number;
  eligible: number;
  advance: number;
  facility: number;
  fee: number;
  funds: number;
  limit: number | null;
}

export const invoiceDiscountCalc = defineCalc<IdP>({
  kind: 'calc',
  id: 'invoice-discounting',
  title: 'Borrowing against the invoices',
  host: 'aoife',
  concept: 'debt-finance-options',
  uses: ['liquidity-management'],
  base: { receivables: 240000, sales: 912500, days: 96, eligible: 75, advance: 80, facility: 4, fee: 15000, funds: 10, limit: null },
  vary: (rng) => ({
    receivables: pickInt(rng, 100000, 1500000, 10000),
    sales: 0,
    days: 0,
    eligible: pickInt(rng, 60, 90, 5),
    advance: pickInt(rng, 70, 85, 5),
    facility: pickOne(rng, [2, 2.5, 3, 4]),
    fee: pickInt(rng, 5000, 50000, 5000),
    funds: pickInt(rng, 6, 12),
    limit: null,
  }),
  build: ({ receivables, sales, days, eligible, advance, facility, fee, funds, limit }) => {
    const rec = receivables ?? (days / 365) * sales;
    const r = A.invoiceDiscounting(rec, eligible, advance, facility, fee, funds, limit ?? Infinity);
    const good = r.net > 0;
    const capped = limit !== null && rec * (eligible / 100) * (advance / 100) > limit;
    return {
      prompt: [
        { who: 'aoife', text: `We can offer an invoice discounting facility. ${eligible}% of your invoices would be eligible, and we’d advance ${advance}% of those, at ${facility}% interest, with a ${eur(fee)} yearly fee.${limit !== null ? ` Borrowing is capped at ${eur(limit)}.` : ''}` },
        { who: 'margaux', text: `${receivables !== null ? `Trade receivables are ${eur(receivables)}.` : `Credit sales ${eur(sales)}, debtor days ${days}.`} We fund working capital at ${funds}% right now.` },
      ],
      ask: 'What’s the net effect on profit each year?',
      formula: {
        options: ['invoice-discounting', 'days-saving', 'net-impact'],
        correct: 'invoice-discounting',
        explain: 'Discounting doesn’t cut debtor days. It swaps our funding rate for the facility’s cheaper rate on the amount borrowed.',
      },
      stepNames: { formula: 'Cost v. benefit' },
      inputs: [
        { key: 'B', symbol: '\\text{Receivables}', label: 'Trade receivables', unit: 'eur', expected: rec, explain: receivables !== null ? `${eur(rec)}.` : `${days} ÷ 365 × ${w0(sales)} = ${w2(rec)}.` },
        { key: 'E', symbol: '\\text{Eligible}', label: 'Eligible share', unit: 'pct', expected: eligible, explain: `${eligible}%.` },
        { key: 'A', symbol: '\\text{Advance}', label: 'Advance rate', unit: 'pct', expected: advance, explain: `${advance}%.` },
        { key: 'R', symbol: 'r_{funds} - r_{facility}', label: 'Rate saved (our rate − facility rate)', unit: 'pct', expected: funds - facility, explain: `${funds}% − ${facility}% = ${w2(funds - facility)}%.` },
        { key: 'F', symbol: '\\text{Fee}', label: 'Yearly fee', unit: 'eur', expected: fee, explain: `${eur(fee)}.`, signless: true },
      ],
      solve: (v) => Math.min(limit ?? Infinity, v.B * (v.E / 100) * (v.A / 100)) * (v.R / 100) - Math.abs(v.F),
      answer: { label: 'Net effect on profit (negative for a cost)', unit: 'eur', explain: `Borrowed ${w2(r.advanced)}${capped ? ' (capped)' : ''} × ${w2(funds - facility)}% = ${w2(r.saving)}; less fee ${w0(fee)} = ${w2(r.net)}.` },
      decision: {
        question: 'Take the facility?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ],
        correct: good ? 'yes' : 'no',
        why: whys(good ? 'The interest saved on the amount borrowed is more than the fee.' : 'The fee is bigger than the interest saved.', 'It cuts our debtor days, so it must help.', 'Cheaper borrowing always beats a fee.', LIQ_WHY(good)),
        correctWhy: 'w0',
        alsoAccept: liqAlt(good),
        explain: good ? `Net saving ${eur(r.net, 2)} a year.` : `Net cost ${eur(-r.net, 2)} a year.`,
      },
      working: [
        `Cost = fee ${w0(fee)}`,
        `Amount borrowed = ${w2(rec)} × ${eligible}% × ${advance}% = ${w2(rec * (eligible / 100) * (advance / 100))}${capped ? `, capped at ${w0(limit!)}` : ''}`,
        `Saving = ${w2(r.advanced)} × (${funds}% − ${facility}%) = ${w2(r.saving)}`,
        `Net = ${w2(r.saving)} − ${w0(fee)} = ${w2(r.net)}`,
      ],
      hints: { formula: 'Does it change the days, or the rate?', inputs: 'Receivables × eligible × advance gives the borrowing.', answer: 'Borrowed × rate saved − fee.', decision: 'Positive net?' },
      outcomes: {
        yes: { valueDelta: good ? 2000 : -2000, news: good ? 'The facility goes live; interest costs drop the next quarter.' : 'The facility’s fee shows up on every month’s accounts.' },
        no: { valueDelta: good ? -1000 : 1500, news: good ? 'Aoife offers it again next year, at a higher fee.' : 'Margaux thanks Aoife and passes.' },
      },
      cfoLine: `Invoice discounting: net ${eur(r.net, 0)} a year.`,
    };
  },
});

interface FacP {
  sales: number;
  factored: number;
  price: number;
  days: number;
  funds: number;
  saved: number;
}

export const factoringCalc = defineCalc<FacP>({
  kind: 'calc',
  id: 'factoring',
  title: 'Sell the invoices?',
  host: 'idris',
  concept: 'debt-finance-options',
  base: { sales: 8000000, factored: 70, price: 96, days: 70, funds: 8, saved: 20000 },
  vary: (rng) => ({ sales: pickInt(rng, 500000, 9000000, 50000), factored: pickInt(rng, 50, 90, 10), price: pickOne(rng, [95, 96, 97, 98, 99]), days: pickInt(rng, 40, 120, 5), funds: pickInt(rng, 6, 12), saved: pickInt(rng, 0, 40000, 5000) }),
  build: ({ sales, factored, price, days, funds, saved }) => {
    const r = A.factoring(sales, factored, price, days, funds, saved);
    const good = r.net > 0;
    return {
      prompt: [
        { who: 'idris', mood: 'happy', text: `A factor I know will buy ${factored}% of our invoices, every one we raise all year, for ${price}% of face value. Cash on day one!` },
        { who: 'margaux', text: `Credit sales ${eur(sales)}, debtor days ${days}, cost of funds ${funds}%. We’d save ${eur(saved)} a year on credit control.` },
      ],
      ask: 'What’s the net effect on profit each year?',
      formula: {
        options: ['factoring-net', 'days-saving', 'invoice-discounting'],
        correct: 'factoring-net',
        explain: 'Cost: the slice of face value given up on all the sales factored. Benefit: no funding on those debts, plus the credit-control saving.',
      },
      stepNames: { formula: 'Cost v. benefit' },
      inputs: [
        { key: 'S', symbol: '\\text{Credit sales}', label: 'Credit sales', unit: 'eur', expected: sales, explain: `${eur(sales)}.` },
        { key: 'P', symbol: '\\text{Factored}', label: 'Share factored', unit: 'pct', expected: factored, explain: `${factored}%.` },
        { key: 'G', symbol: '\\text{Given up}', label: 'Share of face value given up', unit: 'pct', expected: 100 - price, explain: `100% − ${price}% = ${100 - price}%.` },
        { key: 'D', symbol: '\\text{Days}', label: 'Debtor days on those invoices', unit: 'days', expected: days, explain: `${days}.` },
        { key: 'R', symbol: 'r', label: 'Cost of funds', unit: 'pct', expected: funds, explain: `${funds}%.` },
        { key: 'X', symbol: '\\text{Other saving}', label: 'Credit-control saving', unit: 'eur', expected: saved, explain: `${eur(saved)}.` },
      ],
      solve: (v) => {
        const f = v.S * (v.P / 100);
        return (f / 365) * v.D * (v.R / 100) + v.X - f * (v.G / 100);
      },
      answer: { label: 'Net effect on profit (negative for a cost)', unit: 'eur', explain: `Saving ${w2(r.saving)} − cost ${w2(r.cost)} = ${w2(r.net)}.` },
      decision: {
        question: 'Factor the invoices?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ],
        correct: good ? 'yes' : 'no',
        why: whys(good ? 'The funding and credit-control savings outweigh the discount to the factor.' : 'Giving up part of every invoice costs far more than the funding saved.', 'Cash on day one is always worth it.', 'Factoring is free because the factor takes the risk.', LIQ_WHY(good)),
        correctWhy: 'w0',
        alsoAccept: liqAlt(good),
        explain: `${good ? 'Net saving' : 'Net cost'} ${eur(Math.abs(r.net), 2)} a year. ${good ? '' : 'Factoring is expensive, and we’d lose the customer relationship too.'}`,
      },
      working: [
        `Factored sales = ${factored}% × ${w0(sales)} = ${w0(r.factored)}`,
        `Cost = ${100 - price}% × ${w0(r.factored)} = ${w2(r.cost)}`,
        `Funding saved = ${w0(r.factored)} ÷ 365 × ${days} × ${funds}% = ${w2(r.saving - saved)}; plus ${w0(saved)}`,
        `Net = ${w2(r.saving)} − ${w2(r.cost)} = ${w2(r.net)}`,
      ],
      hints: { formula: 'It’s all year, so the cost is on sales, not on the year-end balance.', inputs: 'Given up = 100% − the price the factor pays.', answer: 'Saving − cost.', decision: 'Positive net?' },
      outcomes: {
        yes: { valueDelta: good ? 2000 : -6000, news: good ? 'Cash arrives on day one; credit control shrinks to one desk.' : 'The factor’s cut shows up in every month’s margin. Two boutiques complain about its debt collectors.' },
        no: { valueDelta: good ? -1000 : 2000, news: good ? 'Idris says “told you so” for a month.' : 'Idris’s friend finds another client.' },
      },
      cfoLine: `Factoring: net ${eur(r.net, 0)} a year.`,
    };
  },
});

// ---------------------------------------------------------------- written and sorting rounds

export const ratioSort: ClassifyProblem = {
  kind: 'classify',
  id: 'ratio-sort',
  title: 'Which family?',
  host: 'aoife',
  concept: 'ratio-families',
  prompt: ['Aoife’s checklist has five headings. Which one does each ratio go under?'],
  categories: [
    { id: 'profit', label: 'Profitability' },
    { id: 'eff', label: 'Efficiency' },
    { id: 'liq', label: 'Liquidity' },
    { id: 'gear', label: 'Gearing' },
    { id: 'inv', label: 'Investment' },
  ],
  show: 7,
  items: [
    { text: 'Gross profit margin', category: 'profit', why: 'Profit as a share of sales.' },
    { text: 'Return on capital employed', category: 'profit', why: 'Profit on all the long-term money.' },
    { text: 'Return on equity', category: 'profit', why: 'Profit for the owners on their stake.' },
    { text: 'Debtor days', category: 'eff', why: 'How fast customers pay.' },
    { text: 'Inventory days', category: 'eff', why: 'How fast stock sells.' },
    { text: 'Creditor days', category: 'eff', why: 'How fast we pay suppliers.' },
    { text: 'Current ratio', category: 'liq', why: 'Can current assets cover current liabilities?' },
    { text: 'Acid test ratio', category: 'liq', why: 'Liquidity without relying on stock.' },
    { text: 'Interest cover', category: 'gear', why: 'How safely profit covers interest.' },
    { text: 'Long-term liabilities ÷ capital employed', category: 'gear', why: 'The gearing ratio itself.' },
    { text: 'Price/earnings ratio', category: 'inv', why: 'What the market pays for each euro of earnings.' },
    { text: 'Dividend yield', category: 'inv', why: 'Cash return on the share price.' },
    { text: 'Earnings per share', category: 'inv', why: 'Profit per share.' },
  ],
};

export const debtorInfoBrief: BriefProblem = {
  kind: 'brief',
  id: 'debtor-info',
  title: 'Is 100 days really that bad?',
  host: 'aoife',
  concept: 'ratio-limits',
  prompt: [
    { who: 'aoife', text: 'Debtor days of 100. On its own that looks dreadful. But I want to know more before I judge it.' },
    { who: 'margaux', text: 'Fair. What else would you look at?' },
  ],
  question: 'Describe three useful additional sources of information to assess the merits of a debtor days figure.',
  cards: [
    { text: 'An aged debtor listing: how much is current, 30, 60, 90+ days overdue, and who owes it.', kind: 'key', why: 'Shows whether the average hides a few very old debts or bad debts.' },
    { text: 'The credit terms the business offers, to compare against the actual days.', kind: 'key', why: '100 days against 90-day terms is very different from 100 against 30.' },
    { text: 'Industry averages or competitors’ debtor days.', kind: 'key', why: 'Some sectors routinely give long credit.' },
    { text: 'The trend over previous years, and month by month (seasonality around the year end).', kind: 'key', why: 'A year-end snapshot can be distorted by a big sale just before the year end.' },
    { text: 'Cash received from customers after the year end.', kind: 'key', why: 'Proves whether the year-end debts were actually collected.' },
    { text: 'The inventory days figure.', kind: 'filler', why: 'Useful elsewhere, but it doesn’t tell you about collections.' },
    { text: 'The share price on the day the accounts were published.', kind: 'trap', why: 'Says nothing about how fast customers pay.' },
    { text: 'The total of sales, which already tells you if debtors are fine.', kind: 'trap', why: 'Sales alone can’t judge collection.' },
  ],
  model:
    'Debtor days of 100 needs context. First, an aged debtor analysis shows whether it reflects a few large overdue balances (a bad-debt risk) or general slowness. Second, compare it with the credit terms offered: 100 days against 30-day terms means customers are paying very late. Third, benchmark it against the industry and the business’s own trend, including seasonality, since a year-end figure may be inflated by a large sale just before the year end. Cash received after the year end also confirms whether the debts are recoverable.',
};

export const ACT5_PROBLEMS: Problem[] = [ratioSort, ratioProfit, ratioEfficiency, ratioLiquidity, ratioGearing, ratioInvestor, cashCycleCalc, creditControlCalc, promptDiscountCalc, invoiceDiscountCalc, factoringCalc, debtorInfoBrief];
