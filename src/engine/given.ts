// Which inputs of a calculation are simply stated in the question or the accounts shown with it.
// Retyping a figure that is printed on screen tests nothing, so below exam level those are filled in for the player
// and only the figures that have to be worked out are asked for.
import type { ProblemInstance } from './types';

const numbersIn = (text: string): number[] =>
  (text.replace(/(\d),(?=\d{3}(\D|$))/g, '$1').match(/\d+(?:\.\d+)?/g) ?? []).map(Number);

/** Every number printed in the brief (what is said) and in the accounts table. */
export function printedNumbers(inst: Pick<ProblemInstance, 'prompt' | 'data' | 'ask'>): number[] {
  const texts = inst.prompt.map((b) => (typeof b === 'string' ? b : b.text));
  if (inst.data) texts.push(...inst.data.head, ...inst.data.rows.flat());
  return texts.flatMap(numbersIn);
}

/** Keys of the inputs whose value is printed as it stands. An input can opt out with `given: false`. */
export function givenKeys(inst: ProblemInstance): Set<string> {
  const printed = printedNumbers(inst);
  const out = new Set<string>();
  for (const s of inst.inputs) {
    if (s.given === false) continue;
    const v = Math.abs(s.expected);
    if (s.given === true || (v > 0 && printed.some((n) => Math.abs(n - v) < 1e-9))) out.add(s.key);
  }
  return out;
}
