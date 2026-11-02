import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const workflow = (name: string) =>
  readFileSync(
    new URL(`../.github/workflows/${name}`, import.meta.url),
    "utf8",
  );
const exams = readdirSync(new URL("../exams/", import.meta.url));

// A new exam under exams/ that is missing from the CI matrix would never be
// validated or built by CI.
test("CI 的考試矩陣列出 exams/ 下的每個考試", () => {
  const listed = (workflow("ci.yml").match(/exam:\s*\[([^\]]*)\]/)?.[1] ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  assert.deepEqual([...listed].sort(), [...exams].sort());
});

// Likewise for the deploy workflow's exam choice: an exam that is not listed
// there can never be deployed.
test("部署 workflow 的考試選項列出 exams/ 下的每個考試", () => {
  const block =
    workflow("deploy-cloudflare.yml").match(
      /options:\n((?:\s+- \S+\n)+)/,
    )?.[1] ?? "";
  const listed = block
    .split("\n")
    .map((line) => line.replace(/^\s+- /, "").trim())
    .filter(Boolean);
  assert.deepEqual([...listed].sort(), [...exams].sort());
});
