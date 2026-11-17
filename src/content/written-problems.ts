// Written-answer rounds taken from the question types in the sample papers: a mark scheme of key points, with traps
// and fillers, marked by the player against the model answer. (Numbers don't appear here; the matching calculations
// are in the chapter files.)
import type { BriefProblem, Problem } from '../engine/types';

const brief = (b: Omit<BriefProblem, 'kind'>): BriefProblem => ({ kind: 'brief', ...b });

export const annualReportBrief = brief({
  id: 'fs-components-brief',
  title: 'What’s in the annual report?',
  host: 'niamh',
  concept: 'annual-report',
  prompt: [{ who: 'niamh', text: 'The annual report is the key governance document: it’s how outsiders judge what the managers have done. A new director asks what is actually in it.' }],
  question: 'Describe in brief the key components of the financial statements within the annual report.',
  cap: 5,
  cards: [
    { text: 'The income statement (profit and loss account) describes performance over the period, listing all revenues and expenses to arrive at profit.', kind: 'key', why: 'Performance.' },
    { text: 'The statement of financial position (balance sheet) shows the assets, liabilities and equity at the end of the period.', kind: 'key', why: 'Position.' },
    { text: 'The statement of cash flows shows the sources and uses of cash over the period, from operating, investing and financing activities.', kind: 'key', why: 'Cash.' },
    { text: 'The notes give added detail about the make-up of and movements in the items in the three statements, including accounting policies.', kind: 'key', why: 'The detail.' },
    { text: 'The auditor’s report gives an independent opinion on whether the statements give a true and fair view.', kind: 'key', why: 'The assurance.' },
    { text: 'The statement of changes in equity shows the movements in equity.', kind: 'filler', why: 'Real, but not on this syllabus; no mark needed.' },
    { text: 'The budget for next year.', kind: 'trap', why: 'Not part of the financial statements.' },
    { text: 'The cash budget showing next month’s overdraft.', kind: 'trap', why: 'Internal management information, not in the annual report.' },
  ],
  model:
    'The financial statements in the annual report have four key components. The income statement describes performance over the period by listing all revenues and expenses to arrive at profit. The statement of financial position shows the assets, liabilities and equity at the end of the period. The statement of cash flows describes the sources and uses of cash over the period, split into operating, financing and investing flows. The notes then give added detail about the make-up of, and movements in, the items in the three statements, including the accounting policies used. They are accompanied by the auditor’s report, giving an independent opinion on whether they are true and fair.',
});

export const annualReportEffectiveBrief = brief({
  id: 'fs-effectiveness-brief',
  title: 'How far can you trust the accounts?',
  host: 'idris',
  concept: 'annual-report',
  prompt: [{ who: 'idris', text: 'I read the annual report from cover to cover, and I still don’t know whether I’m looking at a good business. Why not?' }],
  question: 'In which ways do you consider financial statements to be effective as a means of assessing management, and in which ways may they not be effective? Draw a conclusion.',
  cap: 7,
  cards: [
    { text: 'Effective: universal accounting standards mean everyone accounts for events in the same way.', kind: 'key', why: 'Comparability.' },
    { text: 'Effective: universal reporting standards mean everyone reports the same things in the same format, so an informed user can read them and draw meaningful comparisons.', kind: 'key', why: 'Consistency.' },
    { text: 'Effective: they usually come with the professional opinion of an audit firm, and results are the primary assessment tool for stakeholders.', kind: 'key', why: 'Credibility.' },
    { text: 'Not effective: discretion remains despite the controls, so profit can be manipulated through depreciation policy, provisions and contingent liabilities.', kind: 'key', why: 'Discretion.' },
    { text: 'Not effective: a history of ethical and corporate failures shows that the controls don’t always work.', kind: 'key', why: 'Evidence of failure.' },
    { text: 'Not effective: they don’t capture non-financial performance such as customer engagement, employee satisfaction, ethics and sustainability.', kind: 'key', why: 'What’s missing.' },
    { text: 'Conclusion: they remain a reliable but purely financial assessment; supplementary disclosures or a scorecard are needed for a fuller picture.', kind: 'key', why: 'A reasoned view.' },
    { text: 'Because the accounts are audited, they are guaranteed accurate.', kind: 'trap', why: 'Audit gives reasonable assurance, not certainty.' },
    { text: 'Accounts are useless because they are historical.', kind: 'trap', why: 'Overstated: they’re effective for what they measure.' },
    { text: 'The annual report is published once a year.', kind: 'filler', why: 'True, but not an answer.' },
  ],
  model:
    'Financial statements are effective in several ways. Universal accounting and reporting standards mean everyone accounts for and reports events in the same way, so an informed user can read them and make meaningful comparisons, and they are usually accompanied by an audit opinion. They are the primary assessment tool for most stakeholders. But they have limits. Discretion remains despite the controls, so profit can be influenced through depreciation policy, provisions and contingent liabilities, and a history of ethical and corporate failure shows controls don’t always work. They also fail to capture non-financial performance such as customer engagement, employee satisfaction, ethical standards and sustainability. In my view they remain a reliable means of assessment, but only of financial performance; a fuller picture needs supplementary disclosures or a scorecard.',
});

export const cvpAssumptionsBrief = brief({
  id: 'cvp-assumptions-brief',
  title: 'What does the break-even chart assume?',
  host: 'idris',
  concept: 'cvp-limits',
  prompt: [{ who: 'idris', text: 'Your break-even chart is beautiful. What do I have to believe for it to be right?' }],
  question: 'Describe three of the simplifying assumptions that underpin cost–volume–profit analysis.',
  cap: 3,
  cards: [
    { text: 'The selling price per unit is constant. In practice there are discounts to build interest and for bulk buyers.', kind: 'key', why: 'Price assumption.' },
    { text: 'The variable cost per unit is constant. In practice bulk discounts, learning curves and overtime make it vary.', kind: 'key', why: 'Variable cost assumption.' },
    { text: 'Costs can be cleanly classed as fixed or variable. Step costs and semi-variable costs are hard to classify, and costs can change class over time.', kind: 'key', why: 'Classification.' },
    { text: 'Fixed costs stay constant, but only within a relevant range of output.', kind: 'key', why: 'Fixed cost assumption.' },
    { text: 'The sales mix is constant when there are several products.', kind: 'key', why: 'Mix assumption.' },
    { text: 'What is produced is sold: there are no changes in stock.', kind: 'key', why: 'Production = sales.' },
    { text: 'Fixed costs rise in proportion to volume.', kind: 'trap', why: 'That’s the definition of a variable cost.' },
    { text: 'Customers always pay on time.', kind: 'filler', why: 'Not a CVP assumption.' },
  ],
  model:
    'CVP rests on simplifying assumptions. First, the selling price per unit is constant, whereas in practice prices are often discounted to build interest or to win bulk orders. Second, the variable cost per unit is constant, whereas bulk discounts, learning curves and overtime rates make it vary. Third, costs can be easily classified as fixed or variable, whereas step costs and semi-variable costs are hard to classify. It also assumes fixed costs stay constant within a relevant range, the sales mix is constant, and that what is produced is sold.',
});

export const outsourceBrief = brief({
  id: 'outsource-brief',
  title: 'Outsource it?',
  host: 'theo',
  concept: 'operating-gearing',
  prompt: [{ who: 'theo', text: 'A supplier will do part of our production for a fixed fee and take a chunk out of our variable cost per unit. Profit goes up on the budget. Done?' }],
  question: 'Explain whether you would recommend the company takes up an opportunity that replaces some variable cost with a larger fixed cost, when the budgeted profit rises.',
  cap: 3,
  cards: [
    { text: 'Give a clear recommendation, such as: yes, take it, because the budgeted profit rises.', kind: 'key', why: 'The question asks for a recommendation: give one.' },
    { text: 'It raises the break-even point and operating gearing, so profit becomes far more sensitive to volume and the margin of safety shrinks.', kind: 'key', why: 'The risk side.' },
    { text: 'Volume measures, such as sales against break-even, become more important to monitor.', kind: 'key', why: 'What it means in practice.' },
    { text: 'Consider qualitative factors: the quality, reliability and control of the external provider.', kind: 'key', why: 'Non-financial points.' },
    { text: 'Whether the volume forecast is secure matters: the gain only holds if sales stay above the new break-even.', kind: 'key', why: 'Dependence on the forecast.' },
    { text: 'Fixed costs are always better than variable costs.', kind: 'trap', why: 'They’re riskier when volume is uncertain.' },
    { text: 'It changes nothing, costs are costs.', kind: 'trap', why: 'The cost structure changes the risk.' },
  ],
  model:
    'I would recommend taking the opportunity because the budgeted profit rises. However, it increases the break-even point and the company’s operating gearing, so results become much more sensitive to volume and the margin of safety falls; volume measures such as sales against break-even would need closer monitoring. The gain depends on the volume forecast holding up. I would also consider qualitative factors such as the quality and reliability of the external provider and how much control the company would lose.',
});

export const varianceFactorsBrief = brief({
  id: 'variance-factors-brief',
  title: 'Whose fault is it?',
  host: 'niamh',
  concept: 'variance-causes',
  prompt: [{ who: 'niamh', text: 'For each variance I’d like one cause, and a sentence on how or why it produced the number.' }],
  question: 'For each of four variances (a favourable sales price, an adverse materials quantity, a favourable labour rate, an adverse sales volume), identify and explain one causal factor that may have given rise to it.',
  cap: 4,
  cards: [
    { text: 'Favourable sales price: an effective marketing campaign or strong demand let us sell at higher prices than budgeted.', kind: 'key', why: 'A cause and why.' },
    { text: 'Adverse materials quantity: lower-quality materials caused more waste and production defects.', kind: 'key', why: 'A cause and why.' },
    { text: 'Favourable labour rate: a lower-skilled, cheaper blend of labour than budgeted.', kind: 'key', why: 'A cause and why.' },
    { text: 'Adverse sales volume: selling at a higher price than planned cut demand, or a competitor took customers.', kind: 'key', why: 'A cause and why. Price and volume are linked.' },
    { text: 'Adverse materials quantity: because the supplier raised its price.', kind: 'trap', why: 'That’s a price variance, not a quantity variance.' },
    { text: 'Favourable labour rate: because the team worked more efficiently.', kind: 'trap', why: 'That’s efficiency, not rate.' },
    { text: 'The variances are all because of Theo.', kind: 'trap', why: 'Not a cause: a name isn’t an explanation.' },
  ],
  model:
    'A favourable sales price variance could arise from an effective marketing campaign that lifted demand even at higher prices. An adverse materials quantity variance could arise from the use of lower-quality materials giving more production defects and waste. A favourable labour rate variance is likely to come from using a lower-skilled, cheaper blend of labour than budgeted. An adverse sales volume variance may in part be due to selling at a higher price than planned, which reduced demand.',
});

export const useItBrief = brief({
  id: 'use-it-brief',
  title: 'Use it or lose it',
  host: 'theo',
  concept: 'budget-behaviour',
  prompt: [{ who: 'theo', mood: 'happy', text: 'Every November I find a lot of very urgent things to buy for the studio.' }, { who: 'niamh', text: 'I’m sure you do.' }],
  question: 'Explain what is meant by the risk of “use it or lose it” behaviour in budget setting.',
  cap: 3,
  cards: [
    { text: 'When budgets are incremental, based partly on last period’s performance, there’s little incentive to under-spend or over-perform, in case that is built into the next budget.', kind: 'key', why: 'The cause.' },
    { text: 'Cost centre managers spend their full allocation even if they didn’t need to, so that next year’s budget isn’t cut.', kind: 'key', why: 'The behaviour.' },
    { text: 'The result is wasted money and budgets that protect costs rather than lowering them. Fixes include zero-based budgeting or rewarding savings.', kind: 'key', why: 'The consequence, and a remedy.' },
    { text: 'Managers always spend carefully because the budget is monitored.', kind: 'trap', why: 'The opposite of the point.' },
    { text: 'It only affects sales targets.', kind: 'trap', why: 'It’s about cost centres and spending.' },
  ],
  model:
    'When budgets are incremental, being based partly on performance in previous periods, managers have little incentive to under-spend or to over-perform, because the saving or extra performance will be built into the next budget and may be hard to repeat. So cost centre managers spend their full budget allocation even if they didn’t need to, to protect next year’s budget. This wastes money and means budgets protect costs rather than lower them. Zero-based budgeting or rewarding savings can reduce the risk.',
});

export const cashBenefitsBrief = brief({
  id: 'cash-benefits-brief',
  title: 'Why bother with a cash budget?',
  host: 'aoife',
  concept: 'cash-budget',
  prompt: [{ who: 'aoife', text: 'A cash budget takes someone a week to build. Convince me it’s worth it.' }],
  question: 'Describe four benefits of the cash budgeting process.',
  cap: 4,
  cards: [
    { text: 'Planning: it predicts cash shortfalls in advance, so remedies such as an overdraft or delaying a purchase can be arranged.', kind: 'key', why: 'The headline benefit.' },
    { text: 'Control: like all budgets it can be compared with actual cash flows to assess subsequent performance.', kind: 'key', why: 'Control.' },
    { text: 'Target setting: cash targets can be set for areas such as collections and spending.', kind: 'key', why: 'Targets.' },
    { text: 'Co-ordination: it makes sales, purchasing, production and finance work to the same timetable.', kind: 'key', why: 'Co-ordination.' },
    { text: 'Communication with lenders: a bank can see when and how much will be borrowed and repaid.', kind: 'key', why: 'Credibility with Aoife.' },
    { text: 'It guarantees we will never run out of cash.', kind: 'trap', why: 'It’s a forecast, not a guarantee.' },
    { text: 'It shows the profit for the year.', kind: 'trap', why: 'A cash budget is about cash, not profit.' },
  ],
  model:
    'A cash budget has several benefits. First, planning: it predicts shortfalls so remedies such as an overdraft can be arranged in advance. Second, control: it can be compared with actual cash flows to assess performance. Third, target setting: cash targets can be set for areas such as collections and spending. Fourth, co-ordination: it makes sales, purchasing, production and finance work to the same plan. It also shows a bank when and how much will need to be borrowed.',
});

export const beyondBudgetingBrief = brief({
  id: 'beyond-budgeting-brief',
  title: 'Beyond budgeting?',
  host: 'idris',
  concept: 'budget-methods',
  prompt: [{ who: 'idris', text: 'I read an article about “Beyond Budgeting”. The house has a design studio, a production line and an admin office. Could it work for us?' }],
  question: 'Explain briefly what is meant by Beyond Budgeting and advise whether it could be appropriate for a business with a design department, a production department and an administration department.',
  cap: 5,
  cards: [
    { text: 'Beyond Budgeting is an approach that does not use traditional budgets: planning is goal-focused and measured by goal achievement and peer benchmarking.', kind: 'key', why: 'The definition.' },
    { text: 'It increases flexibility, agility and the capacity to embrace change and innovation, and suits laterally structured, creative organisations.', kind: 'key', why: 'Where it works.' },
    { text: 'It isn’t widely used because many organisations fear losing control and detailed planning.', kind: 'key', why: 'Its drawback.' },
    { text: 'The design department could try it: creative work can innovate towards goals without a fixed budget.', kind: 'key', why: 'Advice for the creative department.' },
    { text: 'Production and administration need control, so a traditional or activity-based budget (which reflects the work done and keeps actual v. budget control) would suit them better.', kind: 'key', why: 'Advice for the others.' },
    { text: 'Beyond Budgeting means having no plans at all.', kind: 'trap', why: 'It still plans, but around goals rather than a fixed annual budget.' },
    { text: 'It suits every department of every business.', kind: 'trap', why: 'The advice must be tailored.' },
  ],
  model:
    'Beyond Budgeting is an approach that does not use traditional budgets. Planning is goal-focused, and performance is measured by goal achievement and peer benchmarking, which increases flexibility, agility and the capacity to embrace change and innovation. It suits laterally structured, creative organisations, but it is not widely used because many organisations fear the loss of control and detailed planning. For this business I would suggest a targeted approach: the design department could use it to innovate towards goals, while production and administration, which need cost control, would be better suited to traditional budgets or activity-based budgeting, which reflects the work done and still provides actual-versus-budget control.',
});

export const ratioContextBrief = brief({
  id: 'ratio-context-brief',
  title: 'Is 5.5 good?',
  host: 'aoife',
  concept: 'ratio-limits',
  prompt: [{ who: 'aoife', text: 'Your interest cover is 5.5. Is that good or bad? Give me a straight answer.' }],
  question: 'Is it possible to conclude whether an interest cover figure is “good” or “bad”?',
  cap: 3,
  cards: [
    { text: 'Interest cover is how many times operating profit covers the interest expense. A figure below 1 is worrying, but beyond extremes it can’t be judged alone.', kind: 'key', why: 'What it measures, and its limit.' },
    { text: 'We need comparative prior data to see which way the ratio is trending.', kind: 'key', why: 'Trend.' },
    { text: 'We need benchmark data from similar companies, and any target the company set itself.', kind: 'key', why: 'Context.' },
    { text: 'Qualitative factors, such as how stable profits are, also matter.', kind: 'key', why: 'A holistic assessment.' },
    { text: 'Yes: anything above 3 is good.', kind: 'trap', why: 'No fixed threshold: it depends on context.' },
    { text: 'No: ratios are meaningless.', kind: 'trap', why: 'They’re useful when set in context.' },
  ],
  model:
    'Interest cover shows how many times the operating profit covers the interest expense. In extreme cases a figure below 1 is clearly worrying, but like most ratios it can only be assessed in context. To judge it “good” or “bad” we would need comparative prior data to see the trend, benchmark data from similar companies and any target the company set for itself, and we would also consider qualitative factors such as how stable the profits are.',
});

export const WRITTEN_PROBLEMS: Problem[] = [annualReportBrief, annualReportEffectiveBrief, cvpAssumptionsBrief, outsourceBrief, varianceFactorsBrief, useItBrief, cashBenefitsBrief, beyondBudgetingBrief, ratioContextBrief];
