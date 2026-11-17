// Chapter IX problems: financial and non-financial measures, the balanced scorecard, and written answers about them.
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
    { text: 'Revenue per employee', category: 'fin', why: 'Financial.' },
    { text: 'Customer retention and market share', category: 'cust', why: 'How customers see us.' },
    { text: 'Number of customers lost to a rival each quarter', category: 'cust', why: 'Customer churn.' },
    { text: 'Downtime of the online ordering system', category: 'proc', why: 'Process reliability.' },
    { text: 'Number of staff suggestions that are adopted', category: 'learn', why: 'Innovation and learning.' },
    { text: 'Salary competitiveness against rival houses', category: 'learn', why: 'Keeping the skills we need.' },
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

export const leadLagSort: ClassifyProblem = {
  kind: 'classify',
  id: 'lead-lag-sort',
  title: 'Looking back or looking ahead?',
  host: 'margaux',
  concept: 'financial-limits',
  prompt: ['Idris wants to know which numbers warn us early and which only tell us what already happened. Lead indicator or lag indicator?'],
  categories: [
    { id: 'lag', label: 'Lag: reports what happened' },
    { id: 'lead', label: 'Lead: moves before results' },
  ],
  show: 8,
  items: [
    { text: 'Net profit for the year', category: 'lag', why: 'The result, reported after the event.' },
    { text: 'Annual revenue', category: 'lag', why: 'A result.' },
    { text: 'Return on capital employed', category: 'lag', why: 'Built from the year’s results.' },
    { text: 'Cash at the year end', category: 'lag', why: 'A past balance.' },
    { text: 'Last quarter’s gross margin', category: 'lag', why: 'Already happened.' },
    { text: 'Customer satisfaction scores this month', category: 'lead', why: 'Satisfied customers come back: sales follow.', concept: 'nonfin-measures' },
    { text: 'Staff turnover this quarter', category: 'lead', why: 'A warning of lost skills, then quality, then profit.', concept: 'nonfin-measures' },
    { text: 'Training days per seamstress', category: 'lead', why: 'Skills now drive quality and productivity later.', concept: 'nonfin-measures' },
    { text: 'Orders on hand for next season', category: 'lead', why: 'Future revenue, visible today.', concept: 'nonfin-measures' },
    { text: 'Defect rate on the production line', category: 'lead', why: 'Defects today become returns and complaints tomorrow.', concept: 'nonfin-measures' },
    { text: 'Number of staff suggestions made', category: 'lead', why: 'A sign of engagement and innovation.', concept: 'nonfin-measures' },
  ],
};

export const bscGridSort: ClassifyProblem = {
  kind: 'classify',
  id: 'bsc-grid-sort',
  title: 'Objective, measure, goal or initiative?',
  host: 'margaux',
  concept: 'bsc-design',
  prompt: ['Margaux is filling in the house’s scorecard grid. Which column does each entry belong in?'],
  categories: [
    { id: 'obj', label: 'Objective' },
    { id: 'meas', label: 'Measure' },
    { id: 'goal', label: 'Goal (target)' },
    { id: 'init', label: 'Initiative' },
  ],
  show: 8,
  items: [
    { text: 'Increase customer retention', category: 'obj', why: 'What we want to achieve.' },
    { text: 'Cut the time from design to rail', category: 'obj', why: 'What we want to achieve.' },
    { text: 'Build staff skills', category: 'obj', why: 'What we want to achieve.' },
    { text: 'Number of repeat customers', category: 'meas', why: 'How we track the objective.' },
    { text: 'Days from design sign-off to the rail', category: 'meas', why: 'How we track the objective.' },
    { text: 'Training days per seamstress', category: 'meas', why: 'How we track the objective.' },
    { text: 'Retain 75% of customers', category: 'goal', why: 'The target performance.' },
    { text: '30 days or fewer', category: 'goal', why: 'The target performance.' },
    { text: '12 training days a year', category: 'goal', why: 'The target performance.' },
    { text: 'Launch a loyalty scheme', category: 'init', why: 'What we will do to reach the goal.' },
    { text: 'Introduce digital pattern-cutting', category: 'init', why: 'What we will do to reach the goal.' },
    { text: 'Start a mentoring programme', category: 'init', why: 'What we will do to reach the goal.' },
  ],
};

export const bscFlawsSort: ClassifyProblem = {
  kind: 'classify',
  id: 'bsc-flaws-sort',
  title: 'Spot the flaw',
  host: 'niamh',
  concept: 'bsc-design',
  prompt: ['Niamh is reviewing three scorecards. Is each feature a sign of a well-designed or a poorly designed one?'],
  categories: [
    { id: 'good', label: 'Well designed' },
    { id: 'poor', label: 'Poorly designed' },
  ],
  show: 8,
  items: [
    { text: 'Every measure traces back to the house’s strategy.', category: 'good', why: 'Strategy is the starting point.' },
    { text: 'The scorecard was imposed by head office; the studio had no say.', category: 'poor', why: 'Top-down rather than driven by employees.' },
    { text: 'Forty measures, almost all financial outcomes.', category: 'poor', why: 'Unbalanced and too complex: no drivers.' },
    { text: 'Each perspective has a few measures with clear targets.', category: 'good', why: 'Balanced and manageable.' },
    { text: 'Targets are so ambitious that staff have stopped trying.', category: 'poor', why: 'Unrealistic goals demotivate.' },
    { text: 'Results are reported once a year, after the books close.', category: 'poor', why: 'Untimely: too late to act.' },
    { text: 'Staff helped choose the measures.', category: 'good', why: 'Participation drives ownership.' },
    { text: 'The same generic scorecard is used by every business in the group.', category: 'poor', why: 'Strategy is unique, so the scorecard must be.' },
  ],
};

export const pmsTF: ClassifyProblem = {
  kind: 'classify',
  id: 'pms-tf',
  title: 'A measurement system that works',
  host: 'niamh',
  concept: 'pms-features',
  prompt: ['True or false: is this a feature of a good performance measurement system?'],
  categories: [
    { id: 'true', label: 'True' },
    { id: 'false', label: 'False' },
  ],
  show: 6,
  items: [
    { text: 'It links to the strategy and goals of the organisation.', category: 'true', why: 'Measures should serve the strategy.' },
    { text: 'It includes as many measures as possible, so nothing is missed.', category: 'false', why: 'A good system includes only a few.' },
    { text: 'It recognises controllability: people are judged on what they can influence.', category: 'true', why: 'Otherwise it’s unfair and demotivating.' },
    { text: 'It emphasises the positive as well as the negative.', category: 'true', why: 'It should motivate, not just police.' },
    { text: 'It is timely: results arrive while action is still possible.', category: 'true', why: 'Late data can’t change anything.' },
    { text: 'It avoids benchmarking, because every business is unique.', category: 'false', why: 'Benchmarking is a feature of a good system.' },
    { text: 'It is kept complex, to capture every detail.', category: 'false', why: 'A good system is simple.' },
    { text: 'It involves the people being measured.', category: 'true', why: 'Participation and empowerment.' },
    { text: 'Measures can be used to assign accountability to people or divisions.', category: 'true', why: 'Measurement is management.' },
  ],
};

export const bscDesignBrief: BriefProblem = {
  kind: 'brief',
  id: 'bsc-design-brief',
  title: 'The ferry scorecard',
  host: 'niamh',
  concept: 'bsc-design',
  prompt: [
    { who: 'niamh', text: 'A client has just been asked to run a passenger ferry service across the Irish Sea. Its strategy is to be the reliable, good-value choice for commuters and holidaymakers.' },
    { who: 'margaux', text: 'Four perspectives, with real measures under each. And tie them to the strategy.' },
  ],
  question: 'Imagine you have been asked to run a ferry service. What might you consider to be the key metrics for inclusion in a balanced scorecard?',
  cap: 8,
  cards: [
    { text: 'Financial: revenue per sailing or per passenger, operating margin, cost per passenger, return on capital employed.', kind: 'key', why: 'How shareholders see us.' },
    { text: 'Customer: on-time departures and arrivals, customer satisfaction scores, complaints, repeat bookings, market share.', kind: 'key', why: 'How customers see us. Reliability is the strategy.' },
    { text: 'Internal business: turnaround time in port, load factor and vessel utilisation, safety incidents, fuel efficiency, breakdown downtime.', kind: 'key', why: 'What the ferry must be good at.' },
    { text: 'Learning and growth: crew training days and safety certification, staff turnover and engagement, number of improvement suggestions adopted.', kind: 'key', why: 'Skills and morale behind future performance.' },
    { text: 'Each measure should link to the strategy (reliable and good value), with a target and an initiative to reach it.', kind: 'key', why: 'The scorecard must be tied to this organisation’s strategy.' },
    { text: 'Keep it to a few key measures in each perspective, so the scorecard stays simple and balanced between outcomes and drivers.', kind: 'key', why: 'A feature of a good system.' },
    { text: 'The perspectives link: trained crew turn ships round faster, so departures are on time, customers rebook and revenue grows.', kind: 'key', why: 'Cause and effect across the perspectives.' },
    { text: 'A ferry is a service, so only financial measures are needed.', kind: 'trap', why: 'Financial measures lag; a service lives on reliability and customers.' },
    { text: 'List every measure that could possibly be collected.', kind: 'trap', why: 'Too many measures dilutes focus.' },
    { text: 'Ferries were first used in ancient times.', kind: 'filler', why: 'True, but not an answer.' },
  ],
  model:
    'A balanced scorecard for the ferry service would be tied to its strategy of being the reliable, good-value choice, and would use four perspectives. Financial: revenue per sailing or per passenger, operating margin, cost per passenger and ROCE. Customer: on-time departures and arrivals, satisfaction scores, complaints, repeat bookings and market share. Internal business: turnaround time in port, load factor, safety incidents, fuel efficiency and breakdown downtime. Learning and growth: crew training days and safety certification, staff turnover and engagement, and improvement suggestions adopted. Each would have a target and an initiative, and the perspectives link: trained crew turn ships round faster, so departures are on time, customers rebook and revenue grows. Only a few key measures should be chosen in each, so the scorecard stays simple and balanced.',
};

export const finNonfinBrief: BriefProblem = {
  kind: 'brief',
  id: 'fin-nonfin-brief',
  title: 'Reactive or proactive?',
  host: 'idris',
  concept: 'financial-limits',
  prompt: [{ who: 'idris', text: 'A consultant says: “Organisations that monitor purely financial data will always be reactive rather than proactive.” I think profit is the only number that matters.' }],
  question: 'Describe the relative merits of financial and non-financial data.',
  cards: [
    { text: 'Financial data is simple and unequivocal, universally understood, and directly linked to performance.', kind: 'key', why: 'The appeal of financial measures.' },
    { text: 'But it is a lag indicator: it reports what has already happened, so it promotes a short-term view and gives limited guidance for future action.', kind: 'key', why: 'Why purely financial monitoring is reactive.' },
    { text: 'Financial data may be incomplete and ignores value drivers such as customer loyalty, employee satisfaction and innovation.', kind: 'key', why: 'What the accounts leave out.' },
    { text: 'Non-financial data are lead indicators that reflect value drivers, so they let managers act early and respond quickly to gaps against target.', kind: 'key', why: 'The merit of non-financial data.' },
    { text: 'But non-financial data is harder to identify and measure, can be costly and time-consuming, and its cause-and-effect link to profit is hard to prove.', kind: 'key', why: 'The cost of non-financial data.' },
    { text: 'There are so many possible measures that choosing the key ones is difficult; too many leaves the business unfocused.', kind: 'key', why: 'A further limit.' },
    { text: 'Best practice is to use both, linked by a framework such as the balanced scorecard.', kind: 'key', why: 'A conclusion.' },
    { text: 'Non-financial data is better in every way and financial data should be dropped.', kind: 'trap', why: 'They complement each other.' },
    { text: 'Financial data is a lead indicator.', kind: 'trap', why: 'It lags.' },
    { text: 'Profit is calculated once a year.', kind: 'filler', why: 'True, but not a merit.' },
  ],
  model:
    'Financial data has real merits: it is simple and unequivocal, universally understood and directly linked to performance. But it is a lag indicator that reports what has already happened, so it promotes a short-term view, gives limited guidance for future action, may be incomplete and ignores value drivers such as customer loyalty and employee satisfaction. An organisation that monitors only financial data is therefore reactive. Non-financial data are lead indicators that reflect those value drivers and let managers respond quickly to changes against target, so they make an organisation more proactive. Their drawbacks are that value drivers are hard to identify and measure, measurement can be costly and time-consuming, cause and effect is hard to prove, and there are so many possible measures that choosing the key ones is difficult. The best approach uses both together, for instance through a balanced scorecard.',
};

export const bscLimitsBrief: BriefProblem = {
  kind: 'brief',
  id: 'bsc-limits-brief',
  title: 'A fad, or the real thing?',
  host: 'idris',
  concept: 'bsc-limits',
  prompt: [{ who: 'idris', text: 'Margaux has built a scorecard for the house. Before I tell the bank about it: what is wrong with it?' }],
  question: 'Describe three limitations of the balanced scorecard.',
  cap: 3,
  cards: [
    { text: 'It omits wider stakeholder perspectives such as the community, sustainability and government relations.', kind: 'key', why: 'Only four perspectives.' },
    { text: 'There is limited empirical evidence of the cause-and-effect link between the intangibles and financial performance, so it may be a fad.', kind: 'key', why: 'Unproven links.' },
    { text: 'It is difficult to evaluate the relative importance of each measure.', kind: 'key', why: 'No way to rank them.' },
    { text: 'It requires qualitative data, such as morale, to be quantified, which can be crude or misleading.', kind: 'key', why: 'Measurement challenge.' },
    { text: 'It replaces the need for financial statements.', kind: 'trap', why: 'It’s used alongside them.' },
    { text: 'It can only be used by large companies.', kind: 'trap', why: 'Not a stated limitation.' },
  ],
  model:
    'The balanced scorecard has several limitations. First, it leaves out wider stakeholder perspectives such as the community, sustainability and government relations. Second, there is limited empirical evidence of cause and effect between intangibles like staff morale and financial performance, so critics call it a fad. Third, it is hard to judge the relative importance of each measure, and it requires qualitative data to be quantified, which can be crude.',
};

export const ACT9_PROBLEMS: Problem[] = [leadLagSort, finNonfinBrief, scorecardSort, nonfinBrief, staffBrief, bscGridSort, bscFlawsSort, bscDesignBrief, pmsTF, bscLimitsBrief];
