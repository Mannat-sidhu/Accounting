// Chapter IX lessons: non-financial information and the balanced scorecard. No slides in the materials yet;
// built from Topic 1's note on intangibles and the past paper (Q3C). Check against the slides when they arrive.
import type { Concept } from '../engine/types';

const c = (x: Omit<Concept, 'act'>): Concept => ({ act: 9, ...x });

export const ACT9_CONCEPTS: Concept[] = [
  c({
    id: 'balanced-scorecard',
    name: 'The balanced scorecard',
    summary: 'Four perspectives: financial, customer, internal business process, and learning and growth.',
    lesson: {
      plain: [
        'Financial numbers look backwards and miss things that drive future profit: reputation, staff morale, skills, supplier relationships.',
        'A balanced scorecard measures performance from four perspectives.',
        'Financial: how do we look to shareholders? Margins, ROCE, cash flow. Customer: how do customers see us? Satisfaction, repeat orders, returns, complaints.',
        'Internal business process: what must we be good at? Defect rates, time from design to rail, on-time delivery. Learning and growth: can we keep improving? Training hours, staff turnover, engagement scores.',
        'The perspectives link up. Better-trained staff make fewer defects, so customers are happier and order again, and that’s what drives profit later.',
      ],
      traps: ['Non-financial measures are often lead indicators: they move before profit does.', 'Pick a few measures for each perspective, each tied to the strategy, not dozens.'],
    },
  }),
  c({
    id: 'staff-and-profit',
    name: 'People and long-term profit',
    summary: 'Unhappy staff show up first in turnover, absence and quality, and later in customers and profit.',
    lesson: {
      plain: [
        'Employee discontent rarely shows in this year’s profit. It shows first in the learning and growth measures: staff turnover, absence, engagement surveys, grievances.',
        'Then in internal processes: more defects and rework, slower production as experienced staff leave and new ones learn (the learning curve, in reverse).',
        'Then in customers: late deliveries, lower quality, complaints, lost repeat business, and damage to the brand.',
        'And only then in the financial perspective: higher recruitment and training costs, lower sales and margins. By the time profit falls, the problem is old.',
        'For a business that depends on highly skilled staff, losing them can cost knowledge that took years to build.',
      ],
      traps: ['In a scorecard answer, name actual measures under each perspective, then trace the chain from staff to profit.'],
    },
  }),
];
