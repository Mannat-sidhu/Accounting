// Chapter I problems: sorting rounds and one written answer.
import type { BriefProblem, ClassifyProblem, Problem } from '../engine/types';

export const finVsMgmt: ClassifyProblem = {
  kind: 'classify',
  id: 'fin-v-mgmt-sort',
  title: 'Which kind of accounting?',
  host: 'margaux',
  concept: 'fin-v-mgmt',
  prompt: ['Year one is over and everyone wants numbers. Which kind of accounting does each request need?'],
  categories: [
    { id: 'fin', label: 'Financial accounting' },
    { id: 'mgmt', label: 'Management accounting' },
  ],
  show: 6,
  items: [
    { text: 'The annual accounts filed for the shareholders, audited', category: 'fin', why: 'For outsiders, in a prescribed format, audited.' },
    { text: 'A monthly report comparing studio costs with budget', category: 'mgmt', why: 'Internal, frequent, against budget.' },
    { text: 'The profit of each collection, to decide which to drop', category: 'mgmt', why: 'Supports a management decision.' },
    { text: 'A balance sheet in the format the standards require', category: 'fin', why: 'Prescribed by standards.' },
    { text: 'Next season’s cash budget', category: 'mgmt', why: 'Forward-looking planning.' },
    { text: 'Accounts the bank asks for before renewing a loan', category: 'fin', why: 'For an external user.' },
    { text: 'A quick estimate of a new boutique’s break-even point', category: 'mgmt', why: 'Quick, free-form, for a decision.' },
    { text: 'This year compared with last year, in the annual report', category: 'fin', why: 'Financial accounts compare with the prior year.' },
  ],
};

export const usersSort: ClassifyProblem = {
  kind: 'classify',
  id: 'users-sort',
  title: 'Who’s asking?',
  host: 'margaux',
  concept: 'users',
  prompt: ['Match each question to who’s most likely to ask it.'],
  categories: [
    { id: 'owner', label: 'Owners' },
    { id: 'lender', label: 'Lenders' },
    { id: 'staff', label: 'Employees' },
    { id: 'supplier', label: 'Suppliers' },
    { id: 'gov', label: 'Government' },
  ],
  show: 6,
  items: [
    { text: 'Is the house earning a decent return on my stake?', category: 'owner', why: 'Idris, as a shareholder.' },
    { text: 'Can it keep up the loan repayments and the interest?', category: 'lender', why: 'Aoife at the bank.' },
    { text: 'Can the house afford the pay rise we’re asking for?', category: 'staff', why: 'Employees and their representatives.' },
    { text: 'Will the house pay for this silk within 30 days?', category: 'supplier', why: 'The mill.' },
    { text: 'How much corporation tax is due?', category: 'gov', why: 'The tax authority.' },
    { text: 'Is the business worth more than last year?', category: 'owner', why: 'An owner’s question.' },
    { text: 'Is there enough security for a bigger overdraft?', category: 'lender', why: 'The bank again.' },
    { text: 'Is my job secure for the next few years?', category: 'staff', why: 'Employees care about stability.' },
  ],
};

export const qualitiesSort: ClassifyProblem = {
  kind: 'classify',
  id: 'qualities-sort',
  title: 'Useful, or not?',
  host: 'niamh',
  concept: 'qualities',
  prompt: ['Niamh reads Margaux’s draft notes. Which quality is each one about?'],
  categories: [
    { id: 'rel', label: 'Relevance' },
    { id: 'reli', label: 'Reliability' },
    { id: 'comp', label: 'Comparability' },
    { id: 'und', label: 'Understandability' },
    { id: 'mat', label: 'Materiality' },
  ],
  show: 5,
  items: [
    { text: 'The board gets the sales figures in time for the pricing meeting.', category: 'rel', why: 'Information that can change a decision.' },
    { text: 'Inventory is counted and checked, not guessed.', category: 'reli', why: 'Free from error and bias.' },
    { text: 'Same depreciation policy as last year, so the years line up.', category: 'comp', why: 'Consistent methods allow comparison.' },
    { text: 'Notes written in plain English for the shareholders.', category: 'und', why: 'Readers can make sense of it.' },
    { text: 'A €6 stapler is expensed rather than listed as an asset.', category: 'mat', why: 'Too small to matter.' },
    { text: 'The same layout as other fashion houses use.', category: 'comp', why: 'Comparison with others.' },
  ],
};

export const companyTF: ClassifyProblem = {
  kind: 'classify',
  id: 'company-tf',
  title: 'The house is a company',
  host: 'idris',
  concept: 'limited-company',
  prompt: ['Idris is filling in a form. True or false?'],
  categories: [
    { id: 'true', label: 'True' },
    { id: 'false', label: 'False' },
  ],
  show: 5,
  items: [
    { text: 'If the house failed, I could lose more than the money I put in.', category: 'false', why: 'Limited liability caps the loss at the investment.' },
    { text: 'The house can own its studio in its own name.', category: 'true', why: 'A separate legal entity.' },
    { text: 'If I sell my shares, the company carries on.', category: 'true', why: 'Perpetual life.' },
    { text: 'The auditors report to the directors.', category: 'false', why: 'They report to the shareholders.' },
    { text: 'The shareholders elect the directors.', category: 'true', why: 'That’s how control works.' },
    { text: 'My own car belongs on the company’s balance sheet.', category: 'false', why: 'Business entity: the company is separate from its owners.' },
  ],
};

export const limitsBrief: BriefProblem = {
  kind: 'brief',
  id: 'limits-brief',
  title: 'What the numbers miss',
  host: 'idris',
  concept: 'qualities',
  prompt: [{ who: 'idris', text: 'The accounts say we had a good year. Is that the whole story?' }],
  question: 'Describe the main shortcomings of accounting information.',
  cards: [
    { text: 'It’s historical: it reports the past, while decisions are about the future.', kind: 'key', why: 'A core limitation.' },
    { text: 'It rests partly on estimates and judgement (depreciation, provisions), so it isn’t precise.', kind: 'key', why: 'Accounting isn’t a precise science.' },
    { text: 'It leaves out non-financial information: staff morale, customer loyalty, skills, reputation.', kind: 'key', why: 'Hard to measure in money.' },
    { text: 'It often ignores effects on the natural environment and on people’s welfare.', kind: 'key', why: 'Outside the money measure.' },
    { text: 'Accounts are always 100% accurate because they are audited.', kind: 'trap', why: 'Audit gives reasonable assurance, not certainty.' },
    { text: 'Accounts are prepared every year.', kind: 'filler', why: 'True, but not a shortcoming.' },
  ],
  model:
    'Accounting information has limits. It is historical, while users need to make decisions about the future. It rests partly on estimates and judgements, such as depreciation lives and provisions, so it is not a precise science. Because it measures in money, it leaves out important non-financial information like the skills and morale of staff and customer loyalty, and it often ignores the effects of the business on the natural environment and on people’s welfare.',
};

export const ACT1_PROBLEMS: Problem[] = [finVsMgmt, usersSort, qualitiesSort, companyTF, limitsBrief];
