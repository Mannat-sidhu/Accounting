// Chapter I lessons: an introduction to accountancy (Topic 1). A short refresher.
import type { Concept } from '../engine/types';

const c = (x: Omit<Concept, 'act'>): Concept => ({ act: 1, ...x });

export const ACT1_CONCEPTS: Concept[] = [
  c({
    id: 'fin-v-mgmt',
    name: 'Financial and management accounting',
    summary: 'Financial accounting reports to outsiders, by the rules, yearly and audited. Management accounting serves managers: free-form, frequent, forward-looking.',
    lesson: {
      plain: [
        'Accounting means identifying, measuring and communicating economic information so that people can make informed judgements and decisions.',
        'It comes in four kinds: bookkeeping (the systematic record), financial accounting, management accounting, and tax accounting.',
        'Financial accounting is for people outside the business. It covers the legal entity, follows a prescribed format under accounting standards, is usually yearly and audited, slow to prepare, and compared with last year.',
        'Management accounting is for managers. It follows the strategy, has no set format, is often monthly, isn’t audited, is quick to prepare, and is compared with the budget. It helps managers plan, control and decide.',
      ],
      traps: ['Neither is “more accurate”. They answer different people’s questions.', 'Accounting is partly fact and partly estimate. It isn’t a precise science.'],
    },
  }),
  c({
    id: 'users',
    name: 'Who reads the accounts, and why',
    summary: 'Owners, lenders, managers, employees, suppliers, customers, government, analysts, competitors and the community.',
    lesson: {
      plain: [
        'Lots of people want our accounts, each for their own reason.',
        'Owners and investors: is the business making a good return, and is it worth more? Lenders: can it repay the loan and the interest? Suppliers: will they be paid?',
        'Employees and unions: is the business stable, and can it afford a pay rise? Customers: will it be around to honour warranties? Government and the tax authority: what tax is due?',
        'Managers use other firms’ accounts too: credit managers check customers before giving credit, buyers check suppliers can deliver.',
      ],
      traps: ['The shareholders elect the directors; the directors prepare the accounts; the auditors report on them to the shareholders.'],
    },
  }),
  c({
    id: 'qualities',
    name: 'What makes accounting information useful',
    summary: 'Relevance, reliability, comparability, understandability; subject to materiality and cost v. benefit.',
    lesson: {
      plain: [
        'Four qualities make information useful. Relevance: it can change a decision. Reliability: it’s free from error and bias. Comparability: it can be compared over time and with others. Understandability: the reader can make sense of it.',
        'Two limits apply. Materiality: only include things big enough to matter. Cost v. benefit: more information is only worth it if its value exceeds its cost.',
        'Accounts have shortcomings too. They’re historical. Numbers are easy to add up, but qualitative things are hard to capture. They leave out non-financial information, like staff morale, the environment and customer loyalty.',
      ],
      traps: ['Relevance and reliability can pull against each other: a fast estimate is relevant but less reliable.'],
    },
  }),
  c({
    id: 'limited-company',
    name: 'Limited companies',
    summary: 'A separate legal entity with limited liability and perpetual life. Shareholders elect directors; auditors report to shareholders.',
    lesson: {
      plain: [
        'Businesses can be sole traders, partnerships, co-operatives or limited companies.',
        'A limited company is a separate legal person. It can own property, sue and be sued, and it carries on when shareholders change: perpetual life.',
        'Shareholders have limited liability. If the company fails, they can lose what they put in, but no more.',
        'There are legal safeguards in return: published accounts, an audit for larger companies, and rules about paying dividends.',
      ],
      traps: ['Directors run the company for the shareholders, who are often different people. That separation of ownership and control is why accounts and audits matter.'],
    },
  }),
];
