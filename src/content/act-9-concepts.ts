// Chapter IX lessons: non-financial information and the balanced scorecard.
// Built from the non-financial measures slides (limits of financial measures, value drivers, the four perspectives,
// objectives/measures/goals/initiatives, poor design, what makes a good measurement system, limitations) and the
// written-answer technique in the sample papers.
import type { Concept } from '../engine/types';

const c = (x: Omit<Concept, 'act'>): Concept => ({ act: 9, ...x });

export const ACT9_CONCEPTS: Concept[] = [
  c({
    id: 'financial-limits',
    name: 'What financial measures miss',
    summary: 'Financial measures are simple and universal but they lag, promote a short-term view, give little guidance for the future and ignore value drivers.',
    lesson: {
      plain: [
        'Financial measures have real appeal: they’re simple and unequivocal, universally understood, and they link directly to performance.',
        'But they have limits. They’re lag indicators: they report what has already happened, so an organisation that watches only financial data is always reactive, not proactive.',
        'They promote a short-term view (profit this year), give limited guidance for future action, may not be complete, and ignore other value drivers such as customers and people.',
        'Businesses now compete on delivery times, set-up times, defect levels and customer satisfaction. Budgets and targets don’t have to be only financial: non-financial targets can be reported alongside them.',
      ],
      traps: ['A good answer gives both sides: the appeal of financial measures, and then their limits.', 'Lag indicator means “reports after the event”, not “unimportant”.'],
    },
  }),
  c({
    id: 'nonfin-measures',
    name: 'Non-financial measures and value drivers',
    summary: 'Non-financial measures are lead indicators of value drivers such as employee satisfaction, customer loyalty and innovation. They’re hard to identify and measure.',
    lesson: {
      plain: [
        'Value drivers are the things that make future profit happen: employee satisfaction, customer loyalty, the level of product innovation.',
        'Non-financial measures reflect them. They promote the activities that drive performance (they’re lead indicators), they’re often not measurable in money, and they let managers respond quickly to gaps between actual and target.',
        'Examples: customer conversion, retention and satisfaction, product defects, on-time delivery, production efficiency, employee turnover and satisfaction, salary competitiveness, community and social media engagement.',
        'But measurement is a challenge. Value drivers can be hard to identify and measure. Measuring is time-consuming and can be expensive. It’s hard to prove cause and effect. There’s a sea of possible measures, so choosing the key ones is hard. And measuring increases transparency and accountability, which can cause resistance to change.',
      ],
      traps: ['Don’t say non-financial measures replace financial ones. They sit alongside them.', 'Cheap to say, costly to measure: “employee morale” needs a survey, a method and a follow-up.'],
    },
  }),
  c({
    id: 'balanced-scorecard',
    name: 'The balanced scorecard: four perspectives',
    summary: 'Financial (how do shareholders see us?), customer (how do customers see us?), internal business (what must we be good at?), learning and growth (can we keep improving?).',
    lesson: {
      plain: [
        'The balanced scorecard is a performance management and measurement system that identifies and reports measures for each strategic area of the business.',
        'Financial: how do shareholders see us? It summarises the financial outcomes of decisions: revenue and cost management, cost of capital, working capital, project appraisal.',
        'Customer: how do customers see us? What do they value, want and need? Product and service quality, timeliness of delivery, cost.',
        'Internal business: what must we do to meet customer expectations, and shareholder expectations? Marketing, sales, service processes, product design, productivity, IT systems.',
        'Learning and growth: what must we do to keep improving and creating value now and in the future? New product development, employee learning, leadership, creativity. It’s what secures long-term growth.',
        'Each perspective links to the strategy. A low-cost, fast-turnaround strategy needs the financial lever (cut costs), the customer lever (be on time), the process lever (digital ordering) and the people lever (skills and suggestions).',
      ],
      diagram: {
        kind: 'table',
        title: 'Example measures',
        head: ['Perspective', 'Example measures'],
        rows: [
          ['Financial', 'Revenue per customer, revenue per employee, ROCE'],
          ['Customer', 'Satisfaction, retention, complaints, market share, new customers'],
          ['Internal business', 'Error rate, downtime, efficiency after re-engineering, defect rate'],
          ['Learning and growth', 'Employee satisfaction, retention, training, suggestions, culture'],
        ],
      },
      traps: ['Name actual measures under each perspective in a written answer, and tie them to the strategy.', 'The perspectives are linked: staff skills → process quality → customer satisfaction → financial results.'],
    },
  }),
  c({
    id: 'bsc-design',
    name: 'Designing a scorecard',
    summary: 'For each perspective: an objective, a measure, a goal (target) and an initiative, all set relative to the organisation’s own strategy. Poor designs are unlinked, top-down, unbalanced, unrealistic or untimely.',
    lesson: {
      plain: [
        'Read a scorecard across. For each perspective there are four things. The objective: what do we want to achieve relative to our strategy (increase customer retention)? The measure: how do we track it (number of repeat customers)? The goal: what is the target (retain 75% of customers)? The initiative: what will we do to get there (a loyalty scheme)?',
        'They’re linked: objectives follow the strategy, measures follow the objectives, goals follow the objectives and measures, and initiatives follow all three. Strategy is unique to the organisation, so its scorecard must be too.',
        'A poorly designed scorecard is not linked to strategy; imposed top-down rather than driven by employees; unbalanced (all financial outcomes and no drivers); unrealistic and complex (which can demotivate staff); or untimely.',
        'To design one for a given organisation, start from its strategy, then fill in each perspective with one or two objectives and a handful of measures, targets and initiatives.',
      ],
      diagram: {
        kind: 'table',
        title: 'A ferry operator: one row per perspective',
        head: ['', 'Objective', 'Measure', 'Goal', 'Initiative'],
        rows: [
          ['Financial', 'Grow revenue per sailing', 'Revenue per sailing', '+8%', 'Onboard premium offers'],
          ['Customer', 'Be the reliable choice', 'On-time departures', '95%', 'Faster loading bays'],
          ['Internal', 'Cut turnaround time', 'Minutes in port', '40 min', 'Self-service check-in'],
          ['Learning', 'Build crew skills', 'Training days a year', '12', 'Cross-training scheme'],
        ],
      },
      traps: ['Don’t write one generic scorecard for every business. Tie each line to this organisation’s strategy.', 'More measures isn’t better: a few, well chosen.'],
    },
  }),
  c({
    id: 'pms-features',
    name: 'What a good measurement system looks like',
    summary: 'Measures track progress, find problem areas, widen the view beyond cost, assign accountability and support change. A good system is linked to strategy, simple, controllable, positive, timely and benchmarked.',
    lesson: {
      plain: [
        'What do performance measures do? They help track performance against target and monitor strategy; help identify problem areas; widen the focus beyond cost and money (reducing short-termism); assign accountability to individuals or divisions (measurement is management); and can be used to facilitate organisational change.',
        'Features of a good measurement system: it links to strategy and goals; is simple; recognises controllability; emphasises the positive; is timely; includes benchmarking; embraces participation and empowerment; includes only a few measures; and links to rewards.',
        'Controllability matters: judging someone on something they can’t influence is unfair and demotivating. The same idea runs through variance analysis.',
      ],
      traps: ['“Include only a few measures” is a feature of a good system, not a weakness.', 'Link to rewards, but beware: people manage what they’re paid on.'],
    },
  }),
  c({
    id: 'bsc-limits',
    name: 'Limits of the scorecard',
    summary: 'It leaves out stakeholders such as the community and sustainability, needs more evidence of cause and effect, can’t rank its measures, and needs qualitative data quantified.',
    lesson: {
      plain: [
        'Stakeholder perspectives such as the community, sustainability and government relations are not part of the four perspectives.',
        'Is it a fad? We need more empirical evidence of the cause-and-effect links between intangibles and financial performance.',
        'It’s hard to judge the relative importance of each measure: is a point of customer satisfaction worth more than a day of training?',
        'It requires quantification of qualitative data, which can be crude (a happiness score).',
      ],
      traps: ['In an evaluate-the-scorecard answer, give both strengths (balance, strategy link, lead indicators) and limits.'],
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
