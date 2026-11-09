import { PROBLEMS } from '../src/content';
import { derived, varyTrans, type TransP } from '../src/content/trans-problems';
import { markWorksheet, sectionSums, truePlacements } from '../src/engine/grading';
import { mulberry32 } from '../src/engine/rng';
import type { CalcProblem, GridProblem, StatementProblem } from '../src/engine/types';

// The accounts-preparation question and the cash budget question from the question banks, rebuilt as data: the
// engine must reproduce the worked answers. (The game’s own questions use different numbers.)
const DEF: TransP = { capital: 50000, equip: 120000, depPct: 25, sales: 320000, debtors: 60000, purchases: 150000, closingInv: 50000, creditors: 40000, loan: 100000, interestPct: 6.5, admin: 80000, adminPaid: 66000 };

describe('preparing accounts from transactions', () => {
  it('reproduces the worked answer: profit 103,500, and net assets equal to equity of 153,500', () => {
    const d = derived(DEF);
    expect(d.gross).toBe(220000);
    expect(d.op).toBe(110000);
    expect(d.profit).toBe(103500);
    expect(d.cash).toBe(107500);
    const bs = (PROBLEMS['trans-bs'] as StatementProblem<TransP>).build(DEF);
    const sums = sectionSums(bs, truePlacements(bs));
    expect(sums.nca + sums.ca - sums.cl - sums.ncl).toBe(153500);
    expect(sums.eq).toBe(153500);
  });
  it('the balance sheet balances for 300 random businesses, and the cash answer matches', () => {
    const rng = mulberry32(11);
    const bsP = PROBLEMS['trans-bs'] as StatementProblem<TransP>;
    const cashP = PROBLEMS['trans-cash'] as CalcProblem<TransP>;
    for (let i = 0; i < 300; i++) {
      const p = varyTrans(rng);
      const bs = bsP.build(p);
      const sums = sectionSums(bs, truePlacements(bs));
      expect(sums.nca + sums.ca - sums.cl - sums.ncl, `set ${i}`).toBeCloseTo(sums.eq, 6);
      const inst = cashP.build(p);
      expect(inst.solve(Object.fromEntries(inst.inputs.map((x) => [x.key, x.expected])))).toBeCloseTo(derived(p).cash, 6);
    }
  });
});

describe('the quarter’s cash budget', () => {
  it('reproduces the worked answers: closing cash 41,000, 77,000 and 58,000', () => {
    const p = PROBLEMS['quarter-budget'] as GridProblem;
    const inst = p.build({ open: 25000, debtors: 90000, creditors: 55000, accrual: 7000, sales: [200000, 250000, 280000], purch: [60000, 65000, 70000], wages: [80000, 85000, 90000], admin: [40000, 45000, 50000], capex: 80000, capexMonth: 1, cashPct: 50, adminPct: 80 });
    expect(markWorksheet(inst.rows, 3, {}).truth.close).toEqual([41000, 77000, 58000]);
    expect(markWorksheet(inst.rows, 3, {}).truth.net).toEqual([16000, 36000, -19000]);
  });
});

describe('liquidity and CVP questions from the banks', () => {
  const answer = (id: string, params: unknown) => {
    const inst = (PROBLEMS[id] as CalcProblem).build(params);
    return inst.solve(Object.fromEntries(inst.inputs.map((x) => [x.key, x.expected])));
  };
  it('Fastpay: debtors 1,800,000; gross margin 33.33%; the fee must be below 46,080', () => {
    expect(answer('ratio-reverse', { kind: 'debtors', sales: 10950000, debtorDays: 60, invDays: 50, inventory: 1000000 })).toBeCloseTo(1800000, 4);
    expect(answer('ratio-reverse', { kind: 'cos-margin', sales: 10950000, debtorDays: 60, invDays: 50, inventory: 1000000 })).toBeCloseTo(33.3333, 3);
    expect(answer('max-fee', { receivables: 1800000, eligible: 80, advance: 80, facility: 4, funds: 8 })).toBeCloseTo(46080, 4);
  });
  it('CVP bank: break-even 60,000 units; revised break-even value 1,066,667; new margin of safety 7.78%', () => {
    expect(answer('cvp-cmr', { kind: 'bep-cmr', units: 80000, price: 20, cmr: 25, fixed: 300000, priceUp: 4, fixedUp: 100000, voPerUnit: 8 })).toBeCloseTo(60000, 4);
    expect(answer('cvp-cmr', { kind: 'bep-value', units: 80000, price: 20, cmr: 25, fixed: 300000, priceUp: 4, fixedUp: 100000, voPerUnit: 8 })).toBeCloseTo(1066666.67, 1);
    expect(answer('cvp-cmr', { kind: 'fixed-fee', units: 36000, price: 50, cmr: 14, fixed: 210000, priceUp: 4, fixedUp: 100000, voPerUnit: 8 })).toBeCloseTo(7.78, 1);
  });
});
