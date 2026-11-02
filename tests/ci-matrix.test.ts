import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

// A new exam under exams/ that is missing from the CI matrix would never be
// validated or built by CI.
test("CI 的考試矩陣列出 exams/ 下的每個考試", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/ci.yml", import.meta.url),
    "utf8",
  );
  const listed = (workflow.match(/exam:\s*\[([^\]]*)\]/)?.[1] ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  const exams = readdirSync(new URL("../exams/", import.meta.url));
  assert.deepEqual([...listed].sort(), [...exams].sort());
});
