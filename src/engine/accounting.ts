// Every accounting calculation in the game. All numbers shown to the player come from these.
// Definitions follow the course's sheet of key ratios and formulae and its worked solutions.

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

// ---------------------------------------------------------------- the jar rule

/** Start + in − out = end. Pass the unknown as null and get it back. */
export function jar(start: number | null, ins: number | null, outs: number | null, end: number | null): number {
  if (start === null) return end! - ins! + outs!;
  if (ins === null) return end! - start + outs!;
  if (outs === null) return start + ins - end!;
  return start + ins - outs;
}

// ---------------------------------------------------------------- balance sheet

export const netAssets = (assets: number, liabilities: number) => assets - liabilities;

// ---------------------------------------------------------------- income statement

export const costOfSales = (opening: number, purchases: number, closing: number) => opening + purchases - closing;

/** Expense for the period from cash paid and the opening and closing accrual (amount owed). */
export const expenseFromAccrual = (paid: number, openingAccrual: number, closingAccrual: number) => paid - openingAccrual + closingAccrual;

/** Expense for the period from cash paid and the opening and closing prepayment (paid in advance). */
export const expenseFromPrepayment = (paid: number, openingPrepaid: number, closingPrepaid: number) => paid + openingPrepaid - closingPrepaid;

export const straightLine = (cost: number, residual: number, life: number) => (cost - residual) / life;

/** Reducing balance: depreciation in year `year` (1-based) at `rate` percent. */
export const reducingBalance = (cost: number, ratePct: number, year: number) => cost * Math.pow(1 - ratePct / 100, year - 1) * (ratePct / 100);

export const carryingAmount = (cost: number, accDep: number) => cost - accDep;

export interface Lot {
  qty: number;
  cost: number;
}

/** Cost of sales and closing inventory under FIFO, LIFO or weighted average (periodic). */
export function inventoryCost(lots: Lot[], sold: number, method: 'fifo' | 'lifo' | 'avco') {
  const totalQty = sum(lots.map((l) => l.qty));
  const totalCost = sum(lots.map((l) => l.qty * l.cost));
  if (method === 'avco') {
    const avg = totalCost / totalQty;
    return { cos: sold * avg, closing: (totalQty - sold) * avg, avg };
  }
  const order = method === 'fifo' ? lots : [...lots].reverse();
  let left = sold;
  let cos = 0;
  for (const l of order) {
    const take = Math.min(l.qty, left);
    cos += take * l.cost;
    left -= take;
  }
  return { cos, closing: totalCost - cos, avg: totalCost / totalQty };
}

// ---------------------------------------------------------------- cash flow: workings

/** Depreciation charge: closing acc. dep. − opening acc. dep. + acc. dep. on assets sold. */
export const depreciationCharge = (openingAccDep: number, closingAccDep: number, accDepOnDisposals: number) =>
  closingAccDep - openingAccDep + accDepOnDisposals;

/** Additions: closing cost − opening cost + cost of assets sold. */
export const additions = (openingCost: number, closingCost: number, costOfDisposals: number) => closingCost - openingCost + costOfDisposals;

/** Sale proceeds: carrying amount at sale + gain (a loss is a negative gain). */
export const disposalProceeds = (cost: number, accDep: number, gain: number) => cost - accDep + gain;

export const disposalGain = (cost: number, accDep: number, proceeds: number) => proceeds - (cost - accDep);

/** Cash paid against a liability: owed at start + charge for the year − owed at end (tax, dividends, interest). */
export const liabilityPaid = (owedStart: number, charge: number, owedEnd: number) => owedStart + charge - owedEnd;

/** Cash from customers: opening receivables + sales − closing receivables. */
export const cashFromCustomers = (openingRec: number, sales: number, closingRec: number) => openingRec + sales - closingRec;

/** Cash paid to suppliers: opening payables + purchases − closing payables. */
export const cashToSuppliers = (openingPay: number, purchases: number, closingPay: number) => openingPay + purchases - closingPay;

export interface WorkingCapital {
  inventory: [number, number];
  receivables: [number, number];
  payables: [number, number];
  /** Other operating liabilities that behave like payables (accruals). */
  accruals?: [number, number];
}

/** Indirect method adjustments for working capital, as [opening, closing] pairs. Increase in an asset is cash out. */
export function workingCapitalAdjustments(w: WorkingCapital) {
  const d = ([a, b]: [number, number]) => b - a;
  return {
    inventory: -d(w.inventory),
    receivables: -d(w.receivables),
    payables: d(w.payables),
    accruals: w.accruals ? d(w.accruals) : 0,
  };
}

export interface IndirectInput {
  operatingProfit: number;
  depreciation: number;
  /** Gain on disposal (negative for a loss). */
  gainOnDisposal: number;
  /** Increase in provisions (non-cash expense). */
  provisionIncrease: number;
  wc: WorkingCapital;
  /** Interest, tax and dividends treated as operating (signed: received +, paid −). */
  operatingFinanceFlows?: number;
}

export function cashFromOperations(x: IndirectInput) {
  const a = workingCapitalAdjustments(x.wc);
  return (
    x.operatingProfit +
    x.depreciation -
    x.gainOnDisposal +
    x.provisionIncrease +
    a.inventory +
    a.receivables +
    a.payables +
    a.accruals +
    (x.operatingFinanceFlows ?? 0)
  );
}

/** Cash and cash equivalents: cash + qualifying short deposits − overdrafts repayable on demand. */
export const cashAndEquivalents = (cash: number, equivalents: number, overdraft: number) => cash + equivalents - overdraft;

/** A deposit is a cash equivalent if it matures within 3 months of the date it was made. */
export const isCashEquivalent = (monthsFromAcquisitionToMaturity: number) => monthsFromAcquisitionToMaturity <= 3;

export const freeCashFlow = (cfo: number, capex: number) => cfo - capex;

// ---------------------------------------------------------------- ratios (as on the sheet)

export const pctOf = (part: number, whole: number) => (part / whole) * 100;
export const grossMargin = (gp: number, sales: number) => pctOf(gp, sales);
export const operatingMargin = (op: number, sales: number) => pctOf(op, sales);
export const roe = (netProfit: number, equity: number) => pctOf(netProfit, equity);
/** Total capital employed = equity + long-term liabilities. */
export const roce = (op: number, capitalEmployed: number) => pctOf(op, capitalEmployed);
export const inventoryDays = (avgInventory: number, cos: number) => (avgInventory / cos) * 365;
export const debtorDays = (avgReceivables: number, creditSales: number) => (avgReceivables / creditSales) * 365;
export const creditorDays = (avgPayables: number, cos: number) => (avgPayables / cos) * 365;
export const currentRatio = (ca: number, cl: number) => ca / cl;
export const quickRatio = (ca: number, inventory: number, cl: number) => (ca - inventory) / cl;
export const gearing = (longTermLiabilities: number, capitalEmployed: number) => pctOf(longTermLiabilities, capitalEmployed);
export const interestCover = (op: number, interest: number) => op / interest;
export const dividendCover = (earnings: number, dividend: number) => earnings / dividend;
export const dividendYield = (dps: number, price: number) => pctOf(dps, price);
export const eps = (earnings: number, shares: number) => earnings / shares;
export const peRatio = (price: number, epsValue: number) => price / epsValue;
export const average = (a: number, b: number) => (a + b) / 2;

/** Receivables balance implied by a number of debtor days. */
export const receivablesAtDays = (creditSales: number, days: number) => (creditSales * days) / 365;

/** Yearly finance cost saved by releasing cash tied up in receivables. */
export const financingSaving = (released: number, costPct: number) => released * (costPct / 100);

/** Cash released by cutting debtor days: days saved ÷ 365 × credit sales. */
export const releasedByDays = (creditSales: number, daysSaved: number) => (daysSaved / 365) * creditSales;

/** Credit control or any measure that cuts debtor days: funding saved − yearly cost. */
export function creditControl(creditSales: number, daysSaved: number, fundsPct: number, cost: number) {
  const saving = financingSaving(releasedByDays(creditSales, daysSaved), fundsPct);
  return { saving, cost, net: saving - cost };
}

/** Prompt-payment discount: cost is the discount on sales that take it up; saving is funding on the days cut. */
export function promptDiscount(creditSales: number, takeUpPct: number, discountPct: number, daysSaved: number, fundsPct: number) {
  const cost = creditSales * (takeUpPct / 100) * (discountPct / 100);
  const saving = financingSaving(releasedByDays(creditSales, daysSaved), fundsPct);
  return { saving, cost, net: saving - cost };
}

/**
 * Invoice discounting: borrow against eligible invoices at the facility rate instead of the house's own cost of funds.
 * Saving = amount borrowed × (own rate − facility rate); cost = the fee. An optional limit caps the borrowing.
 */
export function invoiceDiscounting(receivables: number, eligiblePct: number, advancePct: number, facilityPct: number, fee: number, fundsPct: number, limit = Infinity) {
  const advanced = Math.min(limit, receivables * (eligiblePct / 100) * (advancePct / 100));
  const saving = advanced * ((fundsPct - facilityPct) / 100);
  return { advanced, cost: fee, saving, net: saving - fee };
}

/** Factoring over a year: give up (100 − price)% of the sales factored; save funding on their debtor days, plus any credit-control cost. */
export function factoring(creditSales: number, factoredPct: number, pricePct: number, debtorDays: number, fundsPct: number, otherSaving: number) {
  const factored = creditSales * (factoredPct / 100);
  const cost = factored * ((100 - pricePct) / 100);
  const saving = financingSaving((factored / 365) * debtorDays, fundsPct) + otherSaving;
  return { factored, cost, saving, net: saving - cost };
}

/** Days in the cash conversion cycle. */
export const cashCycle = (inventoryDays: number, debtorDaysN: number, creditorDaysN: number) => inventoryDays + debtorDaysN - creditorDaysN;

// ---------------------------------------------------------------- CVP

export const contributionPerUnit = (price: number, varCost: number) => price - varCost;
export const contributionRatio = (price: number, varCost: number) => pctOf(price - varCost, price);
export const breakEvenUnits = (fixed: number, cpu: number) => fixed / cpu;
export const breakEvenRevenue = (fixed: number, price: number, varCost: number) => (fixed / (price - varCost)) * price;
export const marginOfSafetyPct = (budget: number, breakEven: number) => pctOf(budget - breakEven, budget);
export const targetUnits = (fixed: number, target: number, cpu: number) => (fixed + target) / cpu;
export const profitAt = (units: number, cpu: number, fixed: number) => units * cpu - fixed;

// ---------------------------------------------------------------- budgets

/**
 * Cash received each month from sales, given the share collected in the month of sale, the month after, and so on.
 * `opening` lists receipts already owed from before the first month (by month).
 */
export function receipts(sales: number[], pattern: number[], opening: number[] = []) {
  return sales.map((_, m) => {
    let r = opening[m] ?? 0;
    pattern.forEach((share, lag) => {
      if (m - lag >= 0) r += sales[m - lag] * share;
    });
    return r;
  });
}

/** Payments lagged by `lag` months; `opening` covers months before purchases from the plan arrive. */
export function laggedPayments(amounts: number[], lag: number, opening: number[] = []) {
  return amounts.map((_, m) => (m - lag >= 0 ? amounts[m - lag] : (opening[m] ?? 0)));
}

/** Running balance: closing = opening + receipts − payments, month by month. */
export function runningBalance(opening: number, net: number[]) {
  const open: number[] = [];
  const close: number[] = [];
  let bal = opening;
  for (const n of net) {
    open.push(bal);
    bal += n;
    close.push(bal);
  }
  return { open, close };
}

// ---------------------------------------------------------------- variances (sign as on the sheet)

/** Materials/labour/variable overhead rate: (actual rate − budget rate) × actual quantity. Positive = adverse. */
export const rateVariance = (actualRate: number, budgetRate: number, actualQty: number) => (actualRate - budgetRate) * actualQty;
/** Materials quantity / labour efficiency: (actual qty − standard qty) × budget rate. Positive = adverse. */
export const quantityVariance = (actualQty: number, standardQty: number, budgetRate: number) => (actualQty - standardQty) * budgetRate;
/** Sales price: (actual price − budget price) × actual quantity. Positive = favourable. */
export const salesPriceVariance = (actualPrice: number, budgetPrice: number, actualQty: number) => (actualPrice - budgetPrice) * actualQty;
/** Sales volume: (actual qty − budget qty) × budget contribution per unit. Positive = favourable. */
export const salesVolumeVariance = (actualQty: number, budgetQty: number, budgetCpu: number) => (actualQty - budgetQty) * budgetCpu;
export const fixedOverheadVariance = (actual: number, budget: number) => actual - budget;

/** Favourable or adverse, given whether a positive number is good for profit. */
export const fa = (v: number, positiveIsGood: boolean): 'F' | 'A' | '–' => (Math.abs(v) < 1e-9 ? '–' : v > 0 === positiveIsGood ? 'F' : 'A');
