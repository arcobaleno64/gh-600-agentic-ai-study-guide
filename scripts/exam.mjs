// The exam this build is for, chosen with the EXAM environment variable
// (default gh-600). Each exam keeps its own data/ and content/ under exams/<code>/.
import { join } from "node:path";

export const EXAM = process.env.EXAM || "gh-600";
export const repoRoot = join(import.meta.dirname, "..");
export const examRoot = join(repoRoot, "exams", EXAM);
