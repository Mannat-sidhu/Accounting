// Extra practice built from the weekly question banks: question types the chapters didn't yet drill, each with its own
// numbers. Working backwards from days to a balance, the most a facility fee could be, and CVP from a contribution ratio.
import { eur } from '../engine/format';
import { pickInt, pickOne } from '../engine/rng';
import type { CalcProblem, Problem, ProblemInstance } from '../engine/types';
import { defineCalc, w0, w2, whys } from './helpers';

// ---------------------------------------------------------------- working backwards from days

interface RevP {
  kind: 'debtors' | 'cos-margin';
  sales: number;
  debtorDays: number;
  invDays: number;
  inventory: number;
}

export const ratioReverse = defineCalc<RevP>({
  kind: 'calc',
  id: 'ratio-reverse',
  title: 'Back from the days',
  host: 'aoife',
  concept: 'efficiency',
  base: { kind: 'debtors', sales: 7300000, debtorDays: 45, invDays: 40, inventory: 520000 },
  vary: (rng) => {
    const sales = 365 * pickInt(rng, 3000, 40000, 500);
    const perDay = Math.round((sales / 365) * pickOne(rng, [0.55, 0.6, 0.65, 0.7, 0.75]) / 100) * 100;
    const invDays = pickOne(rng, [30, 40, 45, 50, 60, 70]);
    return { kind: pickOne(rng, ['debtors', 'cos-margin'] as const), sales, debtorDays: pickInt(rng, 25, 90, 5), invDays, inventory: perDay * invDays };
  },
  build: (p): ProblemInstance => {
    if (p.kind === 'debtors') {
      const perDay = p.sales / 365;
      const bal = perDay * p.debtorDays;
      return {
        prompt: [{ who: 'aoife', text: `A customer of yours has credit sales of ${eur(p.sales)} a year and debtor days of ${p.debtorDays}. I want its average trade debtor balance.` }],
        ask: 'What is the average trade debtor balance?',
        formula: { options: ['debtors-from-days', 'debtor-days', 'debtors-days-wrong'], correct: 'debtors-from-days', explain: 'Debtor days = debtors ÷ credit sales × 365. Turn it around to find the balance.' },
        stepNames: { formula: 'Turn the ratio round' },
        inputs: [
          { key: 'X', symbol: '\\text{Per day}', label: 'Credit sales per day', unit: 'eur', expected: perDay, explain: `${w0(p.sales)} ÷ 365 = ${w2(perDay)}.`, given: false },
          { key: 'Y', symbol: '\\text{Days}', label: 'Debtor days', unit: 'days', expected: p.debtorDays, explain: `${p.debtorDays}.` },
        ],
        solve: (v) => v.X * v.Y,
        answer: { label: 'Average trade debtors', unit: 'eur', explain: `${w2(perDay)} × ${p.debtorDays} = ${w0(bal)}.` },
        decision: {
          question: `Customers take ${p.debtorDays} days on average. What does that mean?`,
          options: [
            { id: 'right', label: `About ${p.debtorDays} days of sales are owed to the business at any time` },
            { id: 'wrong', label: `Customers pay ${p.debtorDays}% of invoices late` },
          ],
          correct: 'right',
          why: whys('Debtor days measures how many days’ worth of credit sales are still unpaid.', 'It’s a percentage of invoices.', 'It measures the days suppliers wait.'),
          correctWhy: 'w0',
          explain: `${p.debtorDays} days of ${w2(perDay)} a day is ${eur(bal)} tied up in customers.`,
        },
        working: [`Debtor days = debtors ÷ credit sales × 365`, `Debtors = ${p.debtorDays} ÷ 365 × ${w0(p.sales)} = ${w0(bal)}`],
        hints: { formula: 'The ratio has the balance on top. Solve for it.', inputs: 'One day’s credit sales is the annual figure ÷ 365.', answer: 'Days × sales per day.', decision: 'Days, not a percentage.' },
        outcomes: { right: { valueDelta: 500, news: 'Aoife has the balance she needs.' }, wrong: { valueDelta: -500, news: 'Aoife reads the ratio the wrong way round.' } },
        cfoLine: `Debtors ${eur(bal)}.`,
      };
    }
    const cos = (p.inventory / p.invDays) * 365;
    const gm = ((p.sales - cos) / p.sales) * 100;
    return {
      prompt: [{ who: 'aoife', text: `Another customer has sales of ${eur(p.sales)}, an average inventory of ${eur(p.inventory)} and inventory days of ${p.invDays}. No income statement was provided. What’s its gross margin?` }],
      ask: 'What is the gross profit margin?',
      formula: { options: ['cos-from-days', 'gpm', 'cos-days-wrong'], correct: 'cos-from-days', explain: 'Inventory days = inventory ÷ cost of sales × 365, so cost of sales comes out of the ratio. Then margin = (sales − cost of sales) ÷ sales.' },
      stepNames: { formula: 'Find the missing figure' },
      inputs: [
        { key: 'X', symbol: '\\text{COS}', label: 'Cost of sales', unit: 'eur', expected: cos, explain: `${w0(p.inventory)} ÷ ${p.invDays} × 365 = ${w0(cos)}.`, given: false },
        { key: 'Y', symbol: '\\text{Sales}', label: 'Sales', unit: 'eur', expected: p.sales, explain: `${w0(p.sales)}.` },
      ],
      solve: (v) => ((v.Y - v.X) / v.Y) * 100,
      answer: { label: 'Gross profit margin', unit: 'pct', explain: `(${w0(p.sales)} − ${w0(cos)}) ÷ ${w0(p.sales)} = ${w2(gm)}%.` },
      decision: {
        question: `A ${w2(gm)}% gross margin: what does it mean?`,
        options: [
          { id: 'right', label: `Each euro of sales leaves about ${w2(gm)} cent after the cost of the goods sold` },
          { id: 'wrong', label: `Profit is ${w2(gm)}% of sales after every cost` },
        ],
        correct: 'right',
        why: whys('Gross margin is before operating expenses.', 'That’s the net margin, not the gross margin.', 'It’s measured on cost, not sales.'),
        correctWhy: 'w0',
        explain: `Gross profit = ${w0(p.sales - cos)}, which is ${w2(gm)}% of sales. Overheads and interest still come off.`,
      },
      working: [`Cost of sales = ${w0(p.inventory)} ÷ ${p.invDays} × 365 = ${w0(cos)}`, `Gross profit = ${w0(p.sales)} − ${w0(cos)} = ${w0(p.sales - cos)}`, `Gross margin = ${w0(p.sales - cos)} ÷ ${w0(p.sales)} = ${w2(gm)}%`],
      hints: { formula: 'Inventory days has cost of sales underneath. Turn it round.', inputs: 'Inventory ÷ days × 365.', answer: '(Sales − cost of sales) ÷ sales × 100.', decision: 'Gross margin comes before overheads.' },
      outcomes: { right: { valueDelta: 500, news: 'Aoife has a margin without ever seeing the income statement.' }, wrong: { valueDelta: -500, news: 'A gross margin is reported as a net one.' } },
      cfoLine: `Gross margin ${w2(gm)}%.`,
    };
  },
}) as CalcProblem<RevP>;

// ---------------------------------------------------------------- the most a facility fee could be

interface FeeP {
  receivables: number;
  eligible: number;
  advance: number;
  facility: number;
  funds: number;
}

export const maxFee = defineCalc<FeeP>({
  kind: 'calc',
  id: 'max-fee',
  title: 'How much is too much?',
  host: 'aoife',
  concept: 'debt-finance-options',
  uses: ['liquidity-management'],
  base: { receivables: 2000000, eligible: 80, advance: 75, facility: 3, funds: 8 },
  vary: (rng) => ({ receivables: pickInt(rng, 500000, 3000000, 100000), eligible: pickInt(rng, 60, 90, 5), advance: pickInt(rng, 70, 85, 5), facility: pickOne(rng, [2, 3, 4]), funds: pickInt(rng, 6, 10) }),
  build: (p) => {
    const borrowed = p.receivables * (p.eligible / 100) * (p.advance / 100);
    const rate = p.funds - p.facility;
    const max = borrowed * (rate / 100);
    const offer = Math.round((max * (p.receivables % 200000 === 0 ? 0.8 : 1.25)) / 1000) * 1000;
    const good = offer < max;
    return {
      prompt: [{ who: 'aoife', text: `We’d advance ${p.advance}% of the ${p.eligible}% of your invoices that are eligible, at ${p.facility}% interest. Trade receivables are ${eur(p.receivables)}, and you fund working capital at ${p.funds}% today.` }],
      ask: 'The facility fee would have to be less than what amount for the facility to be worth taking?',
      formula: { options: ['max-fee', 'max-fee-wrong', 'invoice-discounting'], correct: 'max-fee', explain: 'The fee is the cost. The facility pays when the interest it saves is more than that cost, so the saving is the ceiling.' },
      stepNames: { formula: 'Cost v. benefit' },
      inputs: [
        { key: 'B', symbol: '\\text{Borrowed}', label: 'Amount we could borrow', unit: 'eur', expected: borrowed, explain: `${w0(p.receivables)} × ${p.eligible}% × ${p.advance}% = ${w0(borrowed)}.`, given: false },
        { key: 'R', symbol: 'r_{funds} - r_{facility}', label: 'Rate saved (our rate − facility rate)', unit: 'pct', expected: rate, explain: `${p.funds}% − ${p.facility}% = ${rate}%.`, given: false },
      ],
      solve: (v) => v.B * (v.R / 100),
      answer: { label: 'The fee must be below', unit: 'eur', explain: `${w0(borrowed)} × ${rate}% = ${w0(max)}.` },
      decision: {
        question: `The bank quotes a fee of ${eur(offer)}. Take the facility?`,
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ],
        correct: good ? 'yes' : 'no',
        why: whys(good ? `${eur(offer)} is below the ${eur(max)} saved, so profit rises.` : `${eur(offer)} is above the ${eur(max)} saved, so profit falls.`, 'Cheaper borrowing always wins.', 'The fee should be below the amount borrowed.'),
        correctWhy: 'w0',
        explain: `Saving ${eur(max)} against a fee of ${eur(offer)}: net ${eur(max - offer)}.`,
      },
      working: [`Amount borrowed = ${w0(p.receivables)} × ${p.eligible}% × ${p.advance}% = ${w0(borrowed)}`, `Saving = ${w0(borrowed)} × (${p.funds}% − ${p.facility}%) = ${w0(max)}`, `The fee must be below ${w0(max)}.`],
      hints: { formula: 'Break-even: the fee equals the saving.', inputs: 'Borrowing = receivables × eligible × advance. Rate saved = our rate less the facility’s.', answer: 'Borrowing × rate saved.', decision: 'Fee against saving.' },
      outcomes: {
        yes: { valueDelta: good ? 1500 : -1500, news: good ? 'The facility goes live and costs less than it saves.' : 'The fee swallows the interest saved.' },
        no: { valueDelta: good ? -1000 : 1000, news: good ? 'A profitable facility left on the table.' : 'Margaux passes on a fee that wouldn’t pay.' },
      },
      cfoLine: `Fee ceiling ${eur(max)}.`,
    };
  },
}) as CalcProblem<FeeP>;

// ---------------------------------------------------------------- CVP from a contribution ratio

interface CmrP {
  kind: 'bep-cmr' | 'bep-value' | 'fixed-fee';
  units: number;
  price: number;
  cmr: number;
  fixed: number;
  priceUp: number;
  fixedUp: number;
  /** Variable overhead per unit, replaced by a fixed fee in the third kind. */
  voPerUnit: number;
}

export const cvpCmr = defineCalc<CmrP>({
  kind: 'calc',
  id: 'cvp-cmr',
  title: 'Working from the ratio',
  host: 'idris',
  concept: 'break-even',
  uses: ['contribution', 'margin-of-safety'],
  base: { kind: 'bep-cmr', units: 60000, price: 30, cmr: 40, fixed: 480000, priceUp: 3, fixedUp: 120000, voPerUnit: 4 },
  vary: (rng) => {
    const price = pickInt(rng, 20, 80, 5);
    const cmr = pickOne(rng, [20, 25, 30, 40, 50]);
    const units = pickInt(rng, 20000, 90000, 5000);
    const cpu = (price * cmr) / 100;
    return {
      kind: pickOne(rng, ['bep-cmr', 'bep-value', 'fixed-fee'] as const),
      units,
      price,
      cmr,
      fixed: Math.round((units * cpu * pickOne(rng, [0.5, 0.6, 0.7, 0.75])) / 10000) * 10000,
      priceUp: pickOne(rng, [2, 3, 4, 5]),
      fixedUp: pickInt(rng, 5, 15, 1) * 10000,
      voPerUnit: Math.max(1, Math.round(price * (1 - cmr / 100) * 0.2)),
    };
  },
  build: (p): ProblemInstance => {
    const cpu = (p.price * p.cmr) / 100;
    if (p.kind === 'bep-cmr') {
      const bep = p.fixed / cpu;
      return {
        prompt: [{ who: 'idris', text: `A new line should sell ${w0(p.units)} units next year at ${eur(p.price)} each, with a contribution margin ratio of ${p.cmr}%. Fixed overheads are ${eur(p.fixed)} for the year. I haven’t been given the variable cost per unit.` }],
        ask: 'What is the break-even point in units?',
        formula: { options: ['be-units', 'be-value-cmr', 'be-units-price'], correct: 'be-units', explain: 'The ratio gives the contribution per unit (price × CMR); then fixed costs ÷ contribution per unit.' },
        stepNames: { formula: 'Pick the method' },
        inputs: [
          { key: 'C', symbol: '\\text{CPU}', label: 'Contribution per unit', unit: 'eur', expected: cpu, explain: `${p.cmr}% × ${w2(p.price)} = ${w2(cpu)}.`, given: false },
          { key: 'F', symbol: '\\text{Fixed}', label: 'Fixed costs', unit: 'eur', expected: p.fixed, explain: `${w0(p.fixed)}.` },
        ],
        solve: (v) => v.F / v.C,
        answer: { label: 'Break-even point (units)', unit: 'count', explain: `${w0(p.fixed)} ÷ ${w2(cpu)} = ${w0(bep)} units.` },
        decision: {
          question: `Planned sales are ${w0(p.units)} units. Is the line safe?`,
          options: [
            { id: 'yes', label: `Yes: ${w0(p.units - bep)} units above break-even` },
            { id: 'no', label: 'No: sales are below break-even' },
          ],
          correct: p.units > bep ? 'yes' : 'no',
          why: whys(p.units > bep ? 'Planned sales exceed break-even, so the line makes a profit.' : 'Planned sales are below break-even, so it makes a loss.', 'A break-even point is a target, not a limit.', 'The ratio alone says nothing about profit.'),
          correctWhy: 'w0',
          explain: `Break-even is ${w0(bep)} units; planned sales are ${w0(p.units)}.`,
        },
        working: [`CPU = ${p.cmr}% × ${w2(p.price)} = ${w2(cpu)}`, `Break-even = ${w0(p.fixed)} ÷ ${w2(cpu)} = ${w0(bep)} units`],
        hints: { formula: 'Break-even always needs contribution per unit.', inputs: 'CMR = CPU ÷ price, so CPU = price × CMR.', answer: 'Fixed costs ÷ CPU.', decision: 'Compare planned sales with break-even.' },
        outcomes: { yes: { valueDelta: p.units > bep ? 1000 : -1000, news: 'Idris approves the line.' }, no: { valueDelta: p.units > bep ? -1000 : 1000, news: 'Idris asks for a rethink.' } },
        cfoLine: `Break-even ${w0(bep)} units.`,
      };
    }
    if (p.kind === 'bep-value') {
      const newCpu = cpu + p.priceUp;
      const newPrice = p.price + p.priceUp;
      const newFixed = p.fixed + p.fixedUp;
      const newCmr = (newCpu / newPrice) * 100;
      const bepVal = newFixed / (newCmr / 100);
      return {
        prompt: [{ who: 'idris', text: `The line sells at ${eur(p.price)} with a contribution margin ratio of ${p.cmr}% and fixed overheads of ${eur(p.fixed)}. Now fixed overheads rise by ${eur(p.fixedUp)} and the price rises to ${eur(newPrice)}. Variable costs per unit don’t change.` }],
        ask: 'What is the revised break-even point as a total sales value?',
        formula: { options: ['be-value-cmr', 'be-units', 'be-revenue'], correct: 'be-value-cmr', explain: 'Extra price is all extra contribution, so the new CPU is the old plus the rise. Then the new ratio, then fixed costs ÷ ratio.' },
        stepNames: { formula: 'Pick the method' },
        inputs: [
          { key: 'C', symbol: '\\text{New CPU}', label: 'New contribution per unit', unit: 'eur', expected: newCpu, explain: `${w2(cpu)} + ${w2(p.priceUp)} = ${w2(newCpu)}.`, given: false },
          { key: 'F', symbol: '\\text{New fixed}', label: 'New fixed costs', unit: 'eur', expected: newFixed, explain: `${w0(p.fixed)} + ${w0(p.fixedUp)} = ${w0(newFixed)}.`, given: false },
          { key: 'R', symbol: '\\text{New CMR}', label: 'New contribution margin ratio', unit: 'pct', expected: newCmr, explain: `${w2(newCpu)} ÷ ${w2(newPrice)} = ${w2(newCmr)}%.`, given: false },
        ],
        solve: (v) => v.F / (v.R / 100),
        answer: { label: 'Break-even sales value', unit: 'eur', explain: `${w0(newFixed)} ÷ ${w2(newCmr)}% = ${w0(bepVal)}.` },
        decision: {
          question: 'Why does the whole price rise count as extra contribution?',
          options: [
            { id: 'right', label: 'Variable costs per unit are unchanged, so every extra euro of price drops straight to contribution' },
            { id: 'wrong', label: 'Because a higher price always lowers variable costs' },
          ],
          correct: 'right',
          why: whys('Contribution = price − variable cost. Change only the price and contribution moves by the same amount.', 'Price and variable cost are independent.', 'The contribution ratio stays the same.'),
          correctWhy: 'w0',
          explain: `New CPU ${w2(newCpu)}; new ratio ${w2(newCmr)}%; break-even ${eur(bepVal)} of sales.`,
        },
        working: [`New CPU = ${w2(cpu)} + ${w2(p.priceUp)} = ${w2(newCpu)}`, `New CMR = ${w2(newCpu)} ÷ ${w2(newPrice)} = ${w2(newCmr)}%`, `New fixed costs = ${w0(newFixed)}`, `Break-even value = ${w0(newFixed)} ÷ ${w2(newCmr)}% = ${w0(bepVal)}`],
        hints: { formula: 'Break-even in value uses the ratio.', inputs: 'Price up with variable costs unchanged: CPU goes up by the same amount.', answer: 'New fixed costs ÷ new ratio.', decision: 'What changed, and what didn’t?' },
        outcomes: { right: { valueDelta: 800, news: 'The revised break-even is on Idris’s desk by lunchtime.' }, wrong: { valueDelta: -800, news: 'The break-even is miscalculated.' } },
        cfoLine: `Revised break-even ${eur(bepVal)}.`,
      };
    }
    // fixed fee replaces variable overhead
    const newCpu = cpu + p.voPerUnit;
    const fee = p.voPerUnit * p.units;
    const newFixed = p.fixed + fee;
    const newBep = newFixed / newCpu;
    const mos = ((p.units - newBep) / p.units) * 100;
    return {
      prompt: [{ who: 'idris', text: `We expect to sell ${w0(p.units)} units at ${eur(p.price)}, with a contribution margin ratio of ${p.cmr}% and fixed overheads of ${eur(p.fixed)}. Variable overhead is ${eur(p.voPerUnit)} a unit. A supplier offers to take it all on for a fixed fee of ${eur(fee)} a year instead.` }],
      ask: 'If we accept, what would the new margin of safety be, as a percentage?',
      formula: { options: ['mos', 'mos-be', 'be-units'], correct: 'mos', explain: 'New contribution per unit, new fixed costs, new break-even, then (planned sales − break-even) ÷ planned sales.' },
      stepNames: { formula: 'Pick the method' },
      inputs: [
        { key: 'C', symbol: '\\text{New CPU}', label: 'New contribution per unit', unit: 'eur', expected: newCpu, explain: `${w2(cpu)} + ${w2(p.voPerUnit)} = ${w2(newCpu)}: the variable overhead is no longer variable.`, given: false },
        { key: 'F', symbol: '\\text{New fixed}', label: 'New fixed costs', unit: 'eur', expected: newFixed, explain: `${w0(p.fixed)} + ${w0(fee)} = ${w0(newFixed)}.`, given: false },
        { key: 'U', symbol: '\\text{Planned}', label: 'Planned sales (units)', unit: 'count', expected: p.units, explain: `${w0(p.units)}.` },
      ],
      solve: (v) => ((v.U - v.F / v.C) / v.U) * 100,
      answer: { label: 'New margin of safety', unit: 'pct', explain: `New break-even ${w0(newBep)} units; (${w0(p.units)} − ${w0(newBep)}) ÷ ${w0(p.units)} = ${w2(mos)}%.` },
      decision: {
        question: 'What has the fixed fee done to the business?',
        options: [
          { id: 'right', label: 'Raised its break-even point: more fixed cost to cover, but each unit then earns more' },
          { id: 'wrong', label: 'Lowered its risk, because costs are now certain' },
        ],
        correct: 'right',
        why: whys('More of the cost base is fixed, so break-even rises and the margin of safety shrinks.', 'A fixed cost has to be paid even when sales are poor.', 'Nothing changes: costs are costs.'),
        correctWhy: 'w0',
        explain: `Break-even moves to ${w0(newBep)} units and the margin of safety to ${w2(mos)}%: higher operating gearing.`,
      },
      working: [`New CPU = ${w2(cpu)} + ${w2(p.voPerUnit)} = ${w2(newCpu)}`, `New fixed costs = ${w0(p.fixed)} + ${w0(fee)} = ${w0(newFixed)}`, `New break-even = ${w0(newFixed)} ÷ ${w2(newCpu)} = ${w0(newBep)}`, `Margin of safety = (${w0(p.units)} − ${w0(newBep)}) ÷ ${w0(p.units)} = ${w2(mos)}%`],
      hints: { formula: 'Break-even first, then the margin of safety.', inputs: 'Variable overhead disappears from per-unit costs and appears as a fixed cost.', answer: '(Planned − break-even) ÷ planned.', decision: 'More fixed cost: what happens to break-even?' },
      outcomes: { right: { valueDelta: 800, news: 'Idris understands the trade: bigger upside, narrower cushion.' }, wrong: { valueDelta: -800, news: 'Idris signs, expecting the risk to fall.' } },
      cfoLine: `Margin of safety ${w2(mos)}%.`,
    };
  },
}) as CalcProblem<CmrP>;

export const BANK_PROBLEMS: Problem[] = [ratioReverse, maxFee, cvpCmr];
