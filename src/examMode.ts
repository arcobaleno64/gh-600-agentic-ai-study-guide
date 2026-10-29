import type { Question } from "./types.ts";

export const EXAM_MODE = "仿真考模式";
export const EXAM_PART1_COUNT = 10;
export const EXAM_PART2_COUNT = 42;
export const EXAM_MINUTES = 100;

export interface ExamScenario {
  title: string;
  intro: string;
  facts: string[];
  context: string;
  observations: string[];
}

// Largest-remainder split of `total` across domains, in proportion to how many
// bank questions each domain has.
export function allocateByDomain(
  counts: Record<string, number>,
  total: number,
): Record<string, number> {
  const sum = Object.values(counts).reduce((a, b) => a + b, 0);
  const rows = Object.entries(counts).map(([id, n]) => ({
    id,
    exact: (total * n) / sum,
  }));
  const result: Record<string, number> = Object.fromEntries(
    rows.map((row) => [row.id, Math.floor(row.exact)]),
  );
  let rest = total - Object.values(result).reduce((a, b) => a + b, 0);
  for (const row of [...rows].sort((a, b) => (b.exact % 1) - (a.exact % 1)))
    if (rest-- > 0) result[row.id] += 1;
  return result;
}

// Part 1 (the shared-scenario questions) keeps its authored order; Part 2 is
// drawn from the bank by domain share and mixed across domains.
export function buildExamQuestions(
  part1: Question[],
  bank: Question[],
  shuffle: <T>(items: T[]) => T[],
): Question[] {
  const taken = new Set(part1.map((question) => question.id));
  const byDomain: Record<string, Question[]> = {};
  for (const question of bank)
    if (!taken.has(question.id))
      (byDomain[question.domainId] ??= []).push(question);
  const sizes = Object.fromEntries(
    Object.entries(byDomain).map(([id, list]) => [id, list.length]),
  );
  const total = Math.min(
    EXAM_PART2_COUNT,
    Object.values(sizes).reduce((a, b) => a + b, 0),
  );
  const counts = allocateByDomain(sizes, total);
  const part2 = shuffle(
    Object.entries(byDomain).flatMap(([id, list]) =>
      shuffle(list).slice(0, counts[id]),
    ),
  );
  return [...part1, ...part2];
}

// Before Part 1 is submitted only Part 1 can be visited; after, only Part 2.
export function canVisit(index: number, part1Locked: boolean): boolean {
  return part1Locked ? index >= EXAM_PART1_COUNT : index < EXAM_PART1_COUNT;
}
