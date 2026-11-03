// One everyday picture for every idea, so the finance makes sense before the jargon arrives.
// Shown at the top of each cheat card and as Margaux's first line when an idea is new.
import type { ConceptId } from '../engine/types';

export const EVERYDAY: Record<ConceptId, string> = {
  // Chapter I
  'fin-v-mgmt': 'Your bank statement is for the bank, in a set format. The note on your phone where you plan the month is just for you, in any shape you like. Same money, different readers.',
  users: 'Think of a flat you might rent. The landlord wants to know you can pay, the bank wants to know you can repay, you want to know the place is worth it. One set of facts, a different question each time.',
  qualities: 'A good group-chat summary is on time, honest, easy to read and in the same format as last week. Bad accounts fail the same tests.',
  'limited-company': 'Put your savings in a flat-share bill kitty. If the kitty goes bust, you lose what you put in, not your own wardrobe. That’s limited liability.',

  // Chapter II
  equation: 'Buy a €1,000 laptop with €600 of your own money and a €400 loan. The laptop (what you own) equals the loan (what you owe) plus your €600 (what’s yours). That’s the whole equation.',
  'asset-test': 'Your phone is an asset: you own it and it helps you. A concert you went to last month is not: the benefit is gone. A friend’s promise to lend you money doesn’t count either.',
  'dual-effect': 'Pay for a coffee with your card: the coffee goes up, your bank balance goes down. Every deal has two sides, and both must be written down.',
  'current-noncurrent': 'Cash and the lunch in your bag are for now. Your laptop is for years. Your credit card bill is due this month, your student loan is due much later.',
  'sfp-layout': 'A snapshot of your finances on one day: everything you own on one side, everything you owe plus your own stake on the other. Both sides always match.',
  conventions: 'You keep your own money separate from your club’s. You note what you paid, not what it might be worth today. You assume you’re carrying on, not closing tomorrow. Those are the rules of the game.',

  // Chapter III
  'is-layout': 'Your month in one line: money earned, less what you spent earning it, less everything else you spent, equals what’s left. The order tells you where the squeeze is.',
  'cost-of-sales': 'You buy 100 stickers and sell 70. Only the 70 count as the cost of what you sold. The other 30 are still in the box, waiting.',
  recognition: 'You “earned” the money when you did the job, not when the client pays. And a bill belongs to the month you used the thing, not the month it arrives.',
  'accruals-prepayments': 'Your electricity: you used it in March, the bill arrives in April. That’s owed now (accrual). Your annual gym pass: paid in January, used over twelve months (prepayment).',
  depreciation: 'A new phone loses value every year. Spreading its cost over the years you’ll use it, not charging it all on the day you buy it, is depreciation.',
  'inventory-methods': 'A shop buys the same drink at €1, then €1.20, then €1.40. When it sells one, which price do we say it cost? Oldest first (FIFO), newest first (LIFO), or the average?',
  provisions: 'You think your friend probably won’t pay back the €100. You don’t wait for them to say no: you mentally write some of it off now. That’s a provision.',
  discretion: 'Two honest people can price a second-hand car differently. Profit depends on estimates like that, and someone with a bonus on the line may lean one way.',

  // Chapter IV
  'cash-v-profit': 'Your friend owes you €50 for a night out. You’ve “earned” it, but you can’t spend it. Meanwhile you paid €300 for a bike that isn’t “used up” yet. Profit and cash are different scoreboards.',
  'cash-jar': 'A piggy bank: what was in it, plus what went in, minus what came out, is what’s in it now. If you know three of those, you can find the fourth.',
  'cash-equivalents': 'Money in your wallet and your current account is cash. A 2-month savings pot you can break at once is nearly cash. A 5-year bond isn’t.',
  ofi: 'Your bank account has three kinds of activity: living (wages, groceries), buying big things (a laptop), and borrowing or investing (a loan, a gift from parents).',
  'interest-dividends': 'Is the interest on your student loan part of “living costs” or “borrowing costs”? Reasonable people file it either way. The rule is: pick one and stay consistent.',
  'free-cash-flow': 'Your pay, minus the rent and the bike repairs you must do to keep working: what’s left is truly free to spend or save.',
  'indirect-method': 'Start from “I made €1,000 this month” and correct it: add back things that weren’t cash (phone depreciating), take off things that aren’t cash yet (friend still owes you).',
  'working-capital': 'If you lend friends money and buy stock for a market stall, your cash is tied up. The more you lend or stock, the less is in your pocket.',
  'dep-charge': 'Your “value lost so far” tally was €60 at the start of the year and €80 at the end, but €20 of it left with the tablet you sold. So this year’s loss was €80 − €60 + €20 = €40.',
  capex: 'How much did you spend on new stuff this year? Look at what you own at the end, what you had at the start, and what you sold.',
  disposal: 'You sell your old laptop for more than its “book value”. The profit on paper isn’t the cash: the whole price you got is the cash.',
  'liability-jars': 'You owed the tax office €900 at the start of the year, this year’s bill added €170, and you still owe €240. So you must have paid €900 + €170 − €240 = €830. Same piggy-bank rule.',
  'scf-layout': 'A year of your bank account, sorted into three headings, ending with: “my balance went from X to Y, and here’s why”.',

  // Chapter V
  'ratio-families': 'A football player isn’t judged on one number. Goals, passes, fitness, discipline: ratios are the stats, and you compare them to last season and to rivals.',
  profitability: 'Out of every €100 a café takes in, how much does it keep? And for every €100 the owner put in, what comes back each year?',
  efficiency: 'How many days does a bottle sit on the shelf? How long do customers take to pay? How long do you take to pay the supplier? That’s a business’s speed.',
  liquidity: 'Can you pay this month’s bills without selling your sofa? Liquidity is about the next few months, not the next few years.',
  'gearing-cover': 'Borrowing to buy a flat boosts your gains when prices rise, but the mortgage is due whatever happens. Gearing is how much of your life is borrowed.',
  'investor-ratios': 'A share is like a slice of a café. EPS is each slice’s share of profit; P/E is how many years of profit you’re paying for the slice.',
  'ratio-limits': 'A selfie can make anyone look fit. A ratio at one date, from accounts someone chose how to present, can too. Always ask what it’s hiding.',
  'liquidity-management': 'Your best friend takes 90 days to pay you back. Offering a 2% discount for paying early costs you something, but gets cash in sooner. Is it worth it?',
  'debt-finance-options': 'Borrow against your unpaid invoices (they’re collateral), or sell them to a company for less than they’re worth in exchange for cash today.',

  // Chapter VI
  'cost-behaviour': 'A coffee stall pays €100 a day to rent the pitch whether it sells 5 coffees or 500. That’s fixed. The milk and cups cost more with every coffee. That’s variable.',
  contribution: 'A coffee sells for €3 and the milk, beans and cup cost €1. Each coffee “contributes” €2 towards the rent, and once the rent’s paid, towards profit.',
  'break-even': 'The stall pays €100 rent and makes €2 per coffee. It needs to sell 50 coffees just to break even: the 51st is profit.',
  'target-profit': 'You want to make €60 a day. The stall must cover the €100 rent and your €60: that’s 80 coffees.',
  'margin-of-safety': 'The stall usually sells 80 coffees and needs 50 to break even. If footfall drops by about 37% you start losing money. That cushion is the margin of safety.',
  'operating-gearing': 'A gym with a flat fee has high fixed costs: lots of members is brilliant, few is painful. A pay-per-visit gym has low fixed costs: safer, but never big money.',
  'sales-mix': 'A café sells coffee (€2 profit) and cake (€1 profit). If customers switch from coffee to cake, the same number of sales makes less money.',
  'cvp-limits': 'A straight line is a handy guess. In real life, suppliers give bulk discounts and overtime costs more, so the line bends. Use it as a guide, not gospel.',

  // Chapter VII
  'budget-purpose': 'Your holiday budget: you decide in advance what to spend on flights, food and fun, and check as you go. It’s a plan in numbers, not a prediction.',
  'budget-process': 'Planning a festival trip, you start with the thing that limits you (tickets sell out), then plan travel and food round it, then check it all adds up.',
  'operating-budgets': 'Throwing a party for 40: you work out how much food to make, then how much to buy, remembering what’s already in the fridge and what you’d like left for tomorrow.',
  'receipts-timing': 'You sell concert tickets on credit: some friends pay now, some next week. Next week’s cash includes this week’s sales and last week’s leftovers.',
  'cash-budget': 'A month-by-month view of your bank balance before it happens: pay day, rent day, the annual bill. You can see the dip coming and plan for it.',
  'budget-behaviour': 'If you’re told “use your allowance or lose it”, you’ll buy things you don’t need in December. People respond to the rules around the budget.',
  'budget-criticisms': 'Your family budget copied from last year, with 3% on top, never asks whether you still need that subscription. Rigid yearly plans can’t cope with surprises.',
  'budget-methods': 'Zero-based budgeting is a spring clean: every subscription must earn its place again. Activity-based means budgeting by what you do (commuting, eating out), not by account.',

  // Chapter VIII
  'standard-cost': 'A recipe says a cake needs 200g of flour at €1 per kg. If you made 10 cakes, you “should” have used 2kg. That’s the standard.',
  'sales-variances': 'You planned to sell 100 hoodies at €40 and sold 110 at €38. You made a sale-volume gain and a price loss. Two different stories in one number.',
  'material-variances': 'You paid more per kilo of flour (a price problem) and also wasted some in the bowl (a usage problem). Variances split those apart.',
  'labour-variances': 'You paid your helper more per hour than planned (rate), and they took longer per cake than planned (efficiency).',
  'variance-causes': 'Cheaper flour might be gritty, so you use more and the cakes take longer. One decision can show up as good news in one variance and bad in two others.',

  // Chapter IX
  'balanced-scorecard': 'A footballer’s season isn’t just goals. Fitness, team spirit and training all decide next season’s goals. The scorecard tracks the stuff that drives results.',
  'staff-and-profit': 'A restaurant’s best chef leaves. Profit is fine this month. Then dishes get worse, regulars drift away, and a few months later the profit falls.',
};
