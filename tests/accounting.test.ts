// Solvers checked against the course's worked answers.
import * as A from '../src/engine/accounting';

const near = (a: number, e: number, dp = 2) => expect(a).toBeCloseTo(e, dp);

describe('cash flow: the class example (equipment and litigation provision)', () => {
  it('depreciation charge 40,000', () => near(A.depreciationCharge(60000, 80000, 20000), 40000));
  it('additions 70,000', () => near(A.additions(180000, 200000, 50000), 70000));
  it('proceeds 40,000', () => near(A.disposalProceeds(50000, 20000, 10000), 40000));
  it('operating cash (15,000)', () =>
    near(A.cashFromOperations({ operatingProfit: 30000, depreciation: 40000, gainOnDisposal: 10000, provisionIncrease: 20000, wc: { inventory: [70000, 120000], receivables: [90000, 150000], payables: [60000, 75000] } }), -15000));
  it('net cash flow 15,000 = change in cash 30,000 → 45,000', () => near(-15000 + (-70000 + 40000) + (40000 + 80000 - 40000 - 20000), 45000 - 30000));
});

describe('cash flow: Frozen Ltd worked solution (€000)', () => {
  it('C&CE 200 → (5), change (205)', () => {
    near(A.cashAndEquivalents(120, 100, 20), 200);
    near(A.cashAndEquivalents(95, 500, 600), -5);
  });
  it('deposit opened 16 Nov, matures 15 Feb, is a cash equivalent', () => expect(A.isCashEquivalent(3)).toBe(true));
  it('W1 depreciation 900', () => near(A.depreciationCharge(3200, 4000, 100), 900));
  it('W2 gain 120', () => near(A.disposalGain(500, 100, 520), 120));
  it('W7 tax paid 830', () => near(A.liabilityPaid(900, 170, 240), 830));
  it('W8 dividends paid 600', () => near(A.liabilityPaid(200, 500, 100), 600));
  it('W9 additions 1,400', () => near(A.additions(9000, 9900, 500), 1400));
  it('operating subtotal 850 and net operating (1,100)', () => {
    const sub = A.cashFromOperations({ operatingProfit: 1890, depreciation: 900, gainOnDisposal: 120, provisionIncrease: 0, wc: { inventory: [350, 1600], receivables: [320, 1450], payables: [1300, 1520], accruals: [120, 460] } });
    near(sub, 850);
    near(sub + 4 - 524 - 830 - 600, -1100);
  });
  it('investing (880), financing 1,775, net (205)', () => {
    const inv = -1400 + 520;
    const fin = 1500 + 700 - 625 + 200;
    near(inv, -880);
    near(fin, 1775);
    near(-1100 + inv + fin, -205);
  });
});

describe('income statement and balance sheet examples', () => {
  it('cost of sales 154,000 (Example 3.2)', () => near(A.costOfSales(40000, 189000, 75000), 154000));
  it('commission accrual: expense 6,000 from 5,000 paid + 1,000 owed', () => near(A.expenseFromAccrual(5000, 0, 1000), 6000));
  it('rent: 20,000 paid, 4,000 prepaid → expense 16,000', () => near(A.expenseFromPrepayment(20000, 0, 4000), 16000));
  it('FIFO 101,000; AVCO 103,500 at £115; LIFO 107,000 (Example 3.8)', () => {
    const lots = [{ qty: 100, cost: 100 }, { qty: 500, cost: 110 }, { qty: 800, cost: 120 }];
    near(A.inventoryCost(lots, 900, 'fifo').cos, 101000);
    near(A.inventoryCost(lots, 900, 'avco').cos, 103500);
    near(A.inventoryCost(lots, 900, 'avco').avg, 115);
    near(A.inventoryCost(lots, 900, 'lifo').cos, 107000);
  });
  it('Clontarf: GP margin 18.71%, net margin 5.07%, net assets 2,456', () => {
    near(A.grossMargin(3229, 17251), 18.72, 1);
    near(A.pctOf(874, 17251), 5.07);
    near(A.netAssets(4960, 100 + 300 + 2039 + 65), 2456);
  });
});

describe('ratios: the worked example (sales 250k, OP 40k, debt 300k, equity 200k)', () => {
  it('GP 40%, OP 16%, ROCE 8%, ROE 12.5%, gearing 60%, cover 2.67', () => {
    near(A.grossMargin(100000, 250000), 40);
    near(A.operatingMargin(40000, 250000), 16);
    near(A.roce(40000, 500000), 8);
    near(A.roe(25000, 200000), 12.5);
    near(A.gearing(300000, 500000), 60);
    near(A.interestCover(40000, 15000), 2.67);
  });
  it('Overload (past paper): inventory days 100, debtor days 100, interest cover 4', () => {
    near(A.inventoryDays(400000, 1460000), 100);
    near(A.debtorDays(500000, 1825000), 100);
    near(A.interestCover(100000, 25000), 4);
  });
});

describe('liquidity management: the course answers', () => {
  it('Apex 1: credit control saves 35,068, net +5,068', () => {
    const r = A.creditControl(8000000, 20, 8, 30000);
    near(r.saving, 35068.49, 0);
    near(r.net, 5068.49, 0);
  });
  it('Apex 2: prompt discount costs 80,000, saves 43,836, net (36,164)', () => {
    const r = A.promptDiscount(8000000, 50, 2, 25, 8);
    near(r.cost, 80000);
    near(r.saving, 43835.62);
    near(r.net, -36164.38);
  });
  it('Apex 3: invoice discounting saves 50,630, net +15,630', () => {
    const rec = A.receivablesAtDays(8000000, 70);
    const r = A.invoiceDiscounting(rec, 80, 75, 2.5, 35000, 8, 1000000);
    near(r.advanced, 920547.95);
    near(r.net, 15630.14);
  });
  it('Apex 4: factoring net (118,082)', () => near(A.factoring(8000000, 70, 96, 70, 8, 20000).net, -118082.19));
  it('LM1–LM2: Slowpay 96 days; 20 days saved = (5,000)', () => {
    near(A.debtorDays(240000, 912500), 96);
    near(A.creditControl(912500, 20, 10, 10000).net, -5000);
  });
  it('LM3: discount 20,000 for 35 days = (11,250)', () => near(A.financingSaving(A.releasedByDays(912500, 35), 10) - 20000, -11250));
  it('LM4: discounting = (6,360)', () => near(A.invoiceDiscounting(240000, 75, 80, 4, 15000, 10).net, -6360));
  it('LM5: cash cycle 80 days', () => near(A.cashCycle(50, 60, 30), 80));
  it('LM9: break-even fee 46,080', () => near(A.invoiceDiscounting(1800000, 80, 80, 4, 0, 8).saving, 46080));
  it('LM11–12: Sluggish (12,500) and +4,800', () => {
    near(A.creditControl(3650000, 75, 9, 80000).net, -12500);
    near(A.invoiceDiscounting(1000000, 80, 80, 2, 40000, 9).net, 4800);
  });
  it('Overload proposals: (29,000) and (13,000)', () => {
    near(A.creditControl(1825000, 70, 6, 50000).net, -29000);
    near(A.invoiceDiscounting(500000, 80, 75, 2, 25000, 6).net, -13000);
  });
});

describe('CVP: course examples and the past paper', () => {
  it('Example 1: BEP 6,000; 9,000 for 30k profit; MoS 33%', () => {
    near(A.breakEvenUnits(60000, 10), 6000);
    near(A.targetUnits(60000, 30000, 10), 9000);
    near(A.marginOfSafetyPct(9000, 6000), 33.33);
  });
  it('Cottage Industries: CpU 2, BEP 250; with machine BEP 428.6, profit 500 both ways; 4,000 target 2,250 v 1,000', () => {
    near(A.contributionPerUnit(14, 12), 2);
    near(A.breakEvenUnits(500, 2), 250);
    near(A.breakEvenUnits(3000, 7), 428.57);
    near(A.profitAt(500, 2, 500), 500);
    near(A.profitAt(500, 7, 3000), 500);
    near(A.targetUnits(500, 4000, 2), 2250);
    near(A.targetUnits(3000, 4000, 7), 1000);
  });
  it('Knotted: CpU 40, BEP 61,000 / €5,282,600, MoS 39%, 141,000 units, price cut profit 1,240,000 and BEP 76,250', () => {
    near(A.contributionPerUnit(86.6, 46.6), 40);
    near(A.breakEvenUnits(2440000, 40), 61000);
    near(A.breakEvenRevenue(2440000, 86.6, 46.6), 5282600);
    near(A.marginOfSafetyPct(100000, 61000), 39);
    near(A.targetUnits(2440000, 3200000, 40), 141000);
    near(A.profitAt(115000, 32, 2440000), 1240000);
    near(A.breakEvenUnits(2440000, 32), 76250);
  });
});

describe('variances: the past paper (Onesale) and the sheet’s sign convention', () => {
  it('sales price (280,000) adverse', () => {
    const v = A.salesPriceVariance(9, 10, 280000);
    near(v, -280000);
    expect(A.fa(v, true)).toBe('A');
  });
  it('materials quantity 24,000 adverse', () => {
    const v = A.quantityVariance(640000, 280000 * 2.2, 1);
    near(v, 24000);
    expect(A.fa(v, false)).toBe('A');
  });
  it('materials rate (20,000) favourable', () => {
    const v = A.rateVariance(620000 / 640000, 1, 640000);
    near(v, -20000);
    expect(A.fa(v, false)).toBe('F');
  });
});

describe('budgets', () => {
  it('receipts: 40% this month + 60% last month, with an opening balance', () => expect(A.receipts([45000, 70000], [0.4, 0.6], [24000])).toEqual([42000, 55000]));
  it('running balance', () => expect(A.runningBalance(25000, [-17000, -35000, 10000]).close).toEqual([8000, -27000, -17000]));
});
