// Chapter IX problems: the balanced scorecard.
import type { BriefProblem, ClassifyProblem, Problem } from '../engine/types';

export const scorecardSort: ClassifyProblem = {
  kind: 'classify',
  id: 'scorecard-sort',
  title: 'Four ways to keep score',
  host: 'margaux',
  concept: 'balanced-scorecard',
  prompt: ['Margaux is drafting the house’s first balanced scorecard. Which perspective does each measure belong to?'],
  categories: [
    { id: 'fin', label: 'Financial' },
    { id: 'cust', label: 'Customer' },
    { id: 'proc', label: 'Internal process' },
    { id: 'learn', label: 'Learning and growth' },
  ],
  show: 8,
  items: [
    { text: 'Return on capital employed', category: 'fin', why: 'A shareholder measure.' },
    { text: 'Operating cash flow', category: 'fin', why: 'Financial.' },
    { text: 'Repeat orders from boutiques', category: 'cust', why: 'How customers see us.' },
    { text: 'Returns and complaints per 1,000 garments', category: 'cust', why: 'Customer satisfaction.' },
    { text: 'Garments needing rework before dispatch', category: 'proc', why: 'Quality of the process.' },
    { text: 'Days from design sign-off to the shop floor', category: 'proc', why: 'Process speed.' },
    { text: 'On-time delivery to boutiques', category: 'proc', why: 'How well the process performs.' },
    { text: 'Training hours per seamstress', category: 'learn', why: 'Building skills.' },
    { text: 'Staff turnover', category: 'learn', why: 'Keeping skills in the house.' },
    { text: 'Staff engagement survey score', category: 'learn', why: 'Morale drives future performance.' },
    { text: 'Gross profit margin', category: 'fin', why: 'Financial.' },
  ],
};

export const staffBrief: BriefProblem = {
  kind: 'brief',
  id: 'staff-brief',
  title: 'Trouble in the studio',
  host: 'theo',
  concept: 'staff-and-profit',
  prompt: [
    { who: 'theo', mood: 'worried', text: 'The pattern cutters are unhappy about pay and the overtime. Two have already left. But profit’s fine, so it’s fine. Right?' },
    { who: 'margaux', text: 'Profit is the last place this will show up.' },
  ],
  question: 'Describe how a balanced scorecard might look for a business that relies on highly skilled staff, and how unaddressed employee discontent could affect its long-term profitability.',
  cards: [
    { text: 'Learning and growth: staff turnover, absence, training hours and engagement scores would show the discontent first.', kind: 'key', why: 'Where it first appears.' },
    { text: 'Internal process: losing skilled staff raises defects and rework and slows production, as new staff climb the learning curve.', kind: 'key', why: 'The knock-on to processes.' },
    { text: 'Customer: late deliveries and lower quality lead to complaints, lost repeat orders and damage to the brand.', kind: 'key', why: 'The knock-on to customers.' },
    { text: 'Financial: recruitment and training costs rise, while sales and margins fall, so long-term profit and ROCE suffer.', kind: 'key', why: 'Where it ends up.' },
    { text: 'Specialist skills take years to build, so losing them is hard to reverse.', kind: 'key', why: 'Why it matters long term.' },
    { text: 'Because current profit is fine, there is no long-term risk.', kind: 'trap', why: 'Profit is a lagging indicator.' },
    { text: 'Staff costs are fixed, so morale doesn’t affect profit.', kind: 'trap', why: 'Morale affects productivity, quality and turnover costs.' },
    { text: 'The scorecard was popularised in the 1990s.', kind: 'filler', why: 'True, but not what was asked.' },
  ],
  model:
    'A balanced scorecard would measure four perspectives. Financial: margins, ROCE and cash flow. Customer: satisfaction, repeat orders and complaints. Internal process: defect and rework rates, production time and on-time delivery. Learning and growth: staff turnover, absence, training and engagement. Unaddressed discontent would show first in learning and growth, as turnover and absence rise. Losing skilled staff would then raise defects and slow production while replacements learn, which leads to late, lower-quality work, customer complaints and lost repeat business. Finally the financial perspective would suffer: recruitment and training costs rise and sales and margins fall. Because skills take years to build, the damage to long-term profitability may be lasting, even while this year’s profit still looks healthy.',
};


export const nonfinBrief: BriefProblem = {
  kind: 'brief',
  id: 'nonfin-brief',
  title: 'Beyond the bottom line',
  host: 'margaux',
  concept: 'balanced-scorecard',
  prompt: [
    { who: 'idris', text: 'We report profit, cash and ratios. Margaux wants to add “non-financial measures”. Why would I clutter the report?' },
    { who: 'margaux', text: 'Because profit tells you where you’ve been. Not where you’re going.' },
  ],
  question: 'Explain four reasons why a business should use non-financial measures alongside financial ones, with an example of each.',
  cap: 4,
  cards: [
    { text: 'Financial measures look backwards. Non-financial ones (customer satisfaction, staff turnover, defect rates) are early warnings of what profit will do next.', kind: 'key', why: 'Leading, not lagging.' },
    { text: 'Accounts leave out much that matters: customers, quality, skills and processes. Measures like on-time delivery or training hours capture them.', kind: 'key', why: 'They cover what the accounts can’t.' },
    { text: 'A balanced scorecard links the measures to strategy across four perspectives, so every team can see how its work drives the goals.', kind: 'key', why: 'Strategy made measurable.' },
    { text: 'They discourage short-termism: a manager judged only on profit might cut training and quality to hit this year’s figure.', kind: 'key', why: 'Profit alone can be gamed in the short term.' },
    { text: 'They are often more immediate and easier for staff to influence than profit, so they motivate action day to day.', kind: 'key', why: 'Closer to what people actually do.' },
    { text: 'Non-financial measures replace the need for financial ones.', kind: 'trap', why: 'They complement the financial measures; they don’t replace them.' },
    { text: 'Non-financial measures are always easy and cheap to measure.', kind: 'trap', why: 'Some, like employee morale, are hard to measure well.' },
    { text: 'Financial statements are prepared by accountants.', kind: 'filler', why: 'True, but not an answer to the question.' },
  ],
  model:
    'A business should use non-financial measures alongside financial ones for several reasons. First, financial measures look backwards, while measures such as customer satisfaction, staff turnover and defect rates are leading indicators that warn of changes in future profit. Second, the accounts leave out much that drives success, such as customers, quality, skills and processes, which measures like on-time delivery or training hours capture. Third, a balanced scorecard links measures to strategy across four perspectives, so each team can see how it contributes. Fourth, they discourage short-termism: a manager judged only on profit might cut training or quality to hit this year’s figure, whereas a scorecard exposes the cost of doing so.',
};

export const ACT9_PROBLEMS: Problem[] = [scorecardSort, nonfinBrief, staffBrief];
