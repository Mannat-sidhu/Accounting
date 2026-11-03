// Content contract. Acts are plain data written against these types; the engine never
// needs to change when an act is added or edited.

export type ConceptId = string;
export type Stage = 'locked' | 'new' | 'practising' | 'common';
export type CharacterId = 'margaux' | 'theo' | 'idris' | 'ferriter' | 'aoife' | 'niamh' | 'narrator' | 'news';

/** Formula strings use a small TeX subset: \frac{a}{b}, x^{n}, x_{n}, \times, \cdot, \approx, \to, \le, \ge, \text{}. */
export type Tex = string;

export type Unit = 'eur' | 'pct' | 'days' | 'times' | 'count' | 'number';

/**
 * How much help a round gives. Guided: every move, a formula menu, tips, feedback after each move.
 * Unguided ("on your own"): no formula menu or spot move, no tips; feedback after each move.
 * Exam: as unguided, and marks and corrections only at the end; boss rounds are also timed.
 */
export type Tier = 'guided' | 'unguided' | 'exam';

// ---------- Lesson diagrams ----------

export interface JarDiagram {
  kind: 'jar';
  title: string;
  start: { label: string; value?: number };
  ins: { label: string; value?: number }[];
  outs: { label: string; value?: number }[];
  end: { label: string; value?: number };
  caption?: string;
}

/** A waterfall from one figure to another (e.g. operating profit to operating cash flow). */
export interface BridgeDiagram {
  kind: 'bridge';
  title: string;
  start: { label: string; value: number };
  steps: { label: string; value: number }[];
  end: string;
  caption?: string;
}

export interface TableDiagram {
  kind: 'table';
  title?: string;
  head: string[];
  rows: string[][];
  /** Index of rows drawn bold as totals. */
  totals?: number[];
  caption?: string;
}

export interface CycleDiagram {
  kind: 'cycle';
  title?: string;
  /** Stops round the circle, in order. */
  stops: string[];
  caption?: string;
}

export type Diagram = JarDiagram | BridgeDiagram | TableDiagram | CycleDiagram;

// ---------- Lessons ----------

export interface Lesson {
  /** Plain-English explanation, one bubble per entry. Written for a beginner. */
  plain: string[];
  diagram?: Diagram;
  formula?: { tex: Tex; where?: string[]; onSheet?: boolean };
  example?: { prompt: string; working: Tex[]; answer: string };
  traps: string[];
}

export interface Concept {
  id: ConceptId;
  act: number;
  name: string;
  /** One-line summary shown in the ledger and by Margaux once it is common knowledge. */
  summary: string;
  lesson: Lesson;
}

// ---------- Step-by-step calculation problems ----------

export type StepKey = 'spot' | 'formula' | 'inputs' | 'answer' | 'decision';

/** Move 1: pick the right items from a list (accounts affected, which jar, which items count as cash...). */
export interface SpotSpec {
  question: string;
  options: DecisionOption[];
  /** Ids of every correct option. One correct id makes it a single choice. */
  correct: string[];
  explain: string;
}

export interface Method {
  id: string;
  name: string;
  tex: Tex;
  /** True if this is on the exam's sheet of key ratios and formulae. */
  sheet?: boolean;
}

export interface FormulaSpec {
  options: string[]; // Method ids
  correct: string;
  explain: string;
}

export interface InputSpec {
  key: string;
  symbol: Tex;
  label: string;
  unit: Unit;
  expected: number;
  explain: string;
  /** Accept the value with either sign (a cost may be typed as 23000 or −23000). */
  signless?: boolean;
}

export interface DecisionOption {
  id: string;
  label: string;
}

/** Another answer a good examiner would also give credit for: the call and the reason together. */
export interface Defensible {
  option: string;
  why: string;
  /** Marks out of 2. */
  score: number;
  /** Margaux's comment when this is chosen. */
  note: string;
}

export interface DecisionSpec {
  question: string;
  options: DecisionOption[];
  correct: string;
  why: DecisionOption[];
  correctWhy: string;
  explain: string;
  /** Judgement calls often have more than one defensible answer. */
  alsoAccept?: Defensible[];
}

export interface Outcome {
  valueDelta: number;
  cashDelta?: number;
  news: string;
}

export type Hints = Partial<Record<StepKey, string>>;

/** A cost–volume–profit chart, drawn on the summary card. */
export interface BreakEvenChart {
  price: number;
  varCost: number;
  fixed: number;
  /** Planned volume, marked on the chart. */
  budget?: number;
  unitLabel: string;
}

/** A problem with its numbers filled in. Everything here is derived from one parameter set. */
export interface ProblemInstance {
  /** The story, spoken by the cast. Plain strings are said by the problem's host. */
  prompt: (string | StoryBeat)[];
  ask: string;
  /** Data the player needs, shown as a small statement extract. */
  data?: TableDiagram;
  /** Optional first move. Without it the problem has four moves. */
  spot?: SpotSpec;
  formula: FormulaSpec;
  inputs: InputSpec[];
  /** Computes the answer from input values (percentages entered as percent, e.g. 6 for 6%). */
  solve: (values: Record<string, number>) => number;
  /** `tolerance` overrides the default ±0.5% with an absolute band (in the answer's unit). */
  answer: { label: string; unit: Unit; explain: string; tolerance?: number; signless?: boolean };
  decision: DecisionSpec;
  /** Renames moves for this problem type, e.g. formula → "Pick the ratio". */
  stepNames?: Partial<Record<StepKey, string>>;
  chart?: BreakEvenChart;
  /** Model written answer, one line each. */
  working: Tex[];
  hints: Hints;
  /** Consequence for the house, by decision option id. */
  outcomes: Record<string, Outcome>;
  /** One-line result Margaux reports once the concept is common knowledge. */
  cfoLine: string;
}

export interface CalcProblem<P = any> {
  kind: 'calc';
  id: string;
  title: string;
  /** Who brings this problem to you. */
  host: CharacterId;
  concept: ConceptId;
  /** Earlier concepts this problem reuses. */
  uses?: ConceptId[];
  base: P;
  vary: (rng: () => number) => P;
  build: (p: P) => ProblemInstance;
}

// ---------- Statement builder ----------

export interface StatementSection {
  id: string;
  label: string;
  /** Label of the subtotal the player types for this section. Omit for no subtotal. */
  subtotal?: string;
}

export interface StatementItem {
  id: string;
  label: string;
  /** Always positive; `sign` gives its direction. */
  amount: number;
  /** Correct section id, or 'none' for an item that does not belong in the statement. */
  section: string;
  /** Other sections also accepted (e.g. interest paid in operating or financing). */
  accept?: string[];
  /** +1 adds to its section, −1 deducts. Only asked of the player when the statement is `signed`. */
  sign: 1 | -1;
  why: string;
}

export interface StatementTotal {
  key: string;
  label: string;
  /** Computes the total from section subtotals (signed sums of placed items). */
  calc: (sub: Record<string, number>) => number;
  explain: string;
}

export interface StatementInstance {
  prompt: (string | StoryBeat)[];
  ask: string;
  /** The heading of the statement being built. */
  heading: string;
  data?: TableDiagram;
  sections: StatementSection[];
  items: StatementItem[];
  /** True if the player chooses + or − for each item (cash flows, adjustments). */
  signed: boolean;
  totals: StatementTotal[];
  decision: DecisionSpec;
  working: Tex[];
  hints: { place: string; sign?: string; subtotals: string; totals: string; decision: string };
  outcomes: Record<string, Outcome>;
}

export interface StatementProblem<P = any> {
  kind: 'statement';
  id: string;
  title: string;
  host: CharacterId;
  concept: ConceptId;
  uses?: ConceptId[];
  base: P;
  vary: (rng: () => number) => P;
  build: (p: P) => StatementInstance;
}

// ---------- Classification problems (for conceptual topics) ----------

export interface ClassifyItem {
  text: string;
  category: string;
  why: string;
}

export interface ClassifyProblem {
  kind: 'classify';
  id: string;
  title: string;
  host: CharacterId;
  concept: ConceptId;
  prompt: string[];
  categories: DecisionOption[];
  /** Pool of items; a play shows `show` of them. Items can be tagged with a further concept. */
  items: (ClassifyItem & { concept?: ConceptId })[];
  show: number;
  outcome?: { allRight: Outcome; someWrong: Outcome };
}

// ---------- Written answers: "Brief the board" ----------

export interface BriefCard {
  text: string;
  /** key: earns a mark. trap: wrong, costs a mark. filler: true but not worth a mark here. */
  kind: 'key' | 'trap' | 'filler';
  why: string;
}

export interface BriefProblem {
  kind: 'brief';
  id: string;
  title: string;
  host: CharacterId;
  concept: ConceptId;
  prompt: (string | StoryBeat)[];
  /** The exam-style question being answered. */
  question: string;
  /** Most marks available, when the question asks for a set number of points ("describe four"). Defaults to the key points. */
  cap?: number;
  cards: BriefCard[];
  /** The paragraph Margaux would write, to copy out on paper. */
  model: string;
}

// ---------- Table-fill rounds ----------

export interface TableProblem {
  kind: 'table';
  id: string;
  title: string;
  host: CharacterId;
  concept: ConceptId;
  prompt: (string | StoryBeat)[];
  /** Each column has its own set of choices. */
  columns: { label: string; options: string[] }[];
  rows: { label: string; answers: string[]; why: string }[];
}

// ---------- Grid (budget) rounds ----------

export interface GridRow {
  key: string;
  label: string;
  /** Shown filled in; the player doesn't type it. */
  given?: boolean;
  /** Which columns the player fills; other columns show the computed value greyed out. Defaults to all. */
  cells?: number[];
  concept?: ConceptId;
  hint: string;
  explain: string;
  /** Computes the row from earlier rows. Fed the player's own earlier rows for error carried forward. */
  calc: (rows: Record<string, number[]>) => number[];
  /** Drawn bold, as a total. */
  total?: boolean;
}

export interface GridInstance {
  prompt: (string | StoryBeat)[];
  ask: string;
  data?: TableDiagram;
  columns: string[];
  unitLabel: string;
  rows: GridRow[];
  decision: DecisionSpec;
  working: Tex[];
  outcomes: Record<string, Outcome>;
}

export interface GridProblem<P = any> {
  kind: 'grid';
  id: string;
  title: string;
  host: CharacterId;
  concept: ConceptId;
  base: P;
  vary: (rng: () => number) => P;
  build: (p: P) => GridInstance;
}

// ---------- Judgement rounds: no single right answer ----------

export type Verdict = 'best' | 'defensible' | 'stretch' | 'wrong';

export interface JudgementOption {
  id: string;
  label: string;
  /** Effect on profit (negative reduces it). */
  effect: number;
  verdict: Verdict;
  why: string;
}

export interface JudgementItem {
  id: string;
  title: string;
  situation: string;
  options: JudgementOption[];
}

export interface JudgementProblem {
  kind: 'judgement';
  id: string;
  title: string;
  host: CharacterId;
  concept: ConceptId;
  uses?: ConceptId[];
  prompt: (string | StoryBeat)[];
  ask: string;
  /** Profit before any of the judgement calls. */
  startProfit: number;
  startLabel: string;
  items: JudgementItem[];
  /** Two people with opposite incentives: the treatment each would push for is shown at the end. */
  sides: { who: CharacterId; wants: 'high' | 'low'; floor?: number; label: string }[];
  model: string;
}

export type Problem = CalcProblem | StatementProblem | ClassifyProblem | BriefProblem | TableProblem | GridProblem | JudgementProblem;
/** Problems built from parameters, which can be replayed with new numbers. */
export type ParamProblem = CalcProblem | StatementProblem | GridProblem;

// ---------- Sessions and acts ----------

export type Mood = 'neutral' | 'happy' | 'worried';

export interface StoryBeat {
  who: CharacterId;
  text: string;
  mood?: Mood;
}

export type SessionPart =
  | { kind: 'story'; scene?: string; beats: StoryBeat[] }
  | { kind: 'lesson'; concepts: ConceptId[] }
  | { kind: 'problem'; problem: string; params?: unknown; /** At least this much independence, whatever the concept's stage. */ tier?: Tier }
  | { kind: 'spotcheck' };

export interface Session {
  id: string;
  title: string;
  /** Short teaser for the act map. */
  blurb: string;
  parts: SessionPart[];
}

export interface BossRound {
  title: string;
  intro: StoryBeat[];
  problems: { problem: string; params?: unknown }[];
  paper: { ref: string; note: string }[];
}

export interface Act {
  number: number;
  numeral: string;
  title: string;
  /** Source topic, for maintainers only. Never shown to the player. */
  topic: string;
  concepts: ConceptId[];
  sessions: Session[];
  boss?: BossRound;
  /** True while the act is only a placeholder awaiting content. */
  draft?: boolean;
  /** Refresher chapters can be played in any order and are shown as such on the map. */
  refresher?: boolean;
  blurb: string;
}

export interface Character {
  id: CharacterId;
  name: string;
  role: string;
  /** One-line personality, shown on the cast card. */
  vibe: string;
}
