import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { validateContentData } from "../scripts/content-contract.mjs";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) =>
  JSON.parse(readFileSync(join(root, path), "utf8"));
function fixture() {
  const chapterDir = join(root, "content", "chapters");
  return {
    plan: read("data/study-plan.json"),
    questions: read("data/questions.json"),
    glossary: read("data/glossary.json"),
    sources: read("data/sources.json"),
    faq: read("data/faq.json"),
    qa: read("data/qa.json"),
    review: read("data/review.json"),
    meta: read("data/exam-meta.json"),
    summary: read("data/content-summary.json"),
    chapters: Object.fromEntries(
      readdirSync(chapterDir)
        .filter((name) => name.endsWith(".md"))
        .map((name) => [name, readFileSync(join(chapterDir, name), "utf8")]),
    ),
  };
}
const has = (errors: string[], text: string) =>
  errors.some((error) => error.includes(text));

test("完整內容契約通過", () =>
  assert.deepEqual(validateContentData(fixture()), []));
test("拒絕無效 domain、objective 與 source 參照", () => {
  const data = fixture();
  data.questions[0].domainId = "D9";
  data.questions[1].objectiveIds = ["D1-O99"];
  data.questions[2].sourceIds = ["UNKNOWN"];
  const errors = validateContentData(data);
  assert.equal(has(errors, "domainId 無效"), true);
  assert.equal(has(errors, "objectiveIds 無效"), true);
  assert.equal(has(errors, "sourceIds 無效"), true);
});
test("拒絕題號缺口與非官方 URL", () => {
  const data = fixture();
  data.questions[5].number = 99;
  data.sources[0].url = "https://example.com/not-official";
  const errors = validateContentData(data);
  assert.equal(has(errors, "題號必須"), true);
  assert.equal(has(errors, "不是允許的官方 URL"), true);
});
test("拒絕領域權重越界", () => {
  const data = fixture();
  data.meta.exam.domains[0].weight = { min: 1, max: 2 };
  assert.equal(has(validateContentData(data), "題數比例"), true);
});
