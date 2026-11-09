// Registries the engine reads. Adding an act means adding its files here, nothing else.
import type { CalcProblem, Concept, ConceptId, ParamProblem, Problem, Session } from '../engine/types';
import { ACT1_CONCEPTS } from './act-1-concepts';
import { ACT1_PROBLEMS } from './act-1-problems';
import { ACT2_CONCEPTS } from './act-2-concepts';
import { ACT2_PROBLEMS } from './act-2-problems';
import { ACT3_CONCEPTS } from './act-3-concepts';
import { ACT3_PROBLEMS } from './act-3-problems';
import { ACT4_CONCEPTS } from './act-4-concepts';
import { ACT4_PROBLEMS } from './act-4-problems';
import { ACT5_CONCEPTS } from './act-5-concepts';
import { ACT5_PROBLEMS } from './act-5-problems';
import { ACT6_CONCEPTS } from './act-6-concepts';
import { ACT6_PROBLEMS } from './act-6-problems';
import { ACT7_CONCEPTS } from './act-7-concepts';
import { ACT7_PROBLEMS } from './act-7-problems';
import { ACT8_CONCEPTS } from './act-8-concepts';
import { ACT8_PROBLEMS } from './act-8-problems';
import { ACT9_CONCEPTS } from './act-9-concepts';
import { ACT9_PROBLEMS } from './act-9-problems';
import { BANK_PROBLEMS } from './bank-problems';
import { ACTS } from './acts';

export { ACTS } from './acts';
export { CHARACTERS, FORMULA_SHEET, METHODS } from './methods';

export const CONCEPTS: Record<ConceptId, Concept> = Object.fromEntries(
  [ACT1_CONCEPTS, ACT2_CONCEPTS, ACT3_CONCEPTS, ACT4_CONCEPTS, ACT5_CONCEPTS, ACT6_CONCEPTS, ACT7_CONCEPTS, ACT8_CONCEPTS, ACT9_CONCEPTS].flat().map((c) => [c.id, c]),
);

export const PROBLEMS: Record<string, Problem> = Object.fromEntries(
  [ACT1_PROBLEMS, ACT2_PROBLEMS, ACT3_PROBLEMS, ACT4_PROBLEMS, ACT5_PROBLEMS, ACT6_PROBLEMS, ACT7_PROBLEMS, ACT8_PROBLEMS, ACT9_PROBLEMS, BANK_PROBLEMS].flat().map((p) => [p.id, p]),
);

export const ALL_CONCEPT_IDS: ConceptId[] = ACTS.flatMap((a) => a.concepts);

/** Problems that can practise a concept (a classify item tagged with it also counts). */
export function problemsFor(concept: ConceptId): Problem[] {
  return Object.values(PROBLEMS).filter(
    (p) => p.concept === concept || (p.kind === 'classify' && p.items.some((i) => i.concept === concept)),
  );
}

export const PRACTISABLE: ConceptId[] = ALL_CONCEPT_IDS.filter((id) => problemsFor(id).length > 0);

export function findSession(id: string): { session: Session; act: (typeof ACTS)[number]; index: number } | null {
  for (const act of ACTS) {
    const index = act.sessions.findIndex((s) => s.id === id);
    if (index >= 0) return { session: act.sessions[index], act, index };
  }
  return null;
}

export const isCalc = (p: Problem): p is CalcProblem => p.kind === 'calc';
export const hasParams = (p: Problem): p is ParamProblem => p.kind === 'calc' || p.kind === 'statement' || p.kind === 'grid';
