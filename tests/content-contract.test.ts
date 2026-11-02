import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { validateContentData } from "../scripts/content-contract.mjs";

const root = resolve(import.meta.dirname, "..", "exams", "gh-600");
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
    rules: read("data/contract.json"),
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
test("缺少規則時回報錯誤，不套用其他考試的門檻", () => {
  const data = fixture() as Record<string, unknown>;
  delete data.rules;
  const errors = validateContentData(data);
  assert.equal(errors.length, 1);
  assert.equal(has(errors, "缺少 contract.json"), true);
});
test("門檻來自該考試的規則，不是寫死的數字", () => {
  const data = fixture();
  data.rules.minQuestions = data.questions.length + 1;
  data.rules.sources = { min: 1, max: 2 };
  data.rules.code = "GH-999";
  const errors = validateContentData(data);
  assert.equal(
    has(errors, `題庫至少需要 ${data.questions.length + 1} 題`),
    true,
  );
  assert.equal(has(errors, "官方來源必須在 1 至 2 項之間"), true);
  assert.equal(has(errors, "考試代碼必須為 GH-999"), true);
});
test("GH-500 已寫的內容遵守題目層級規則（答案、選項長度、解析不重複）", () => {
  const gh500 = resolve(import.meta.dirname, "..", "exams", "gh-500");
  const load = (path: string) =>
    JSON.parse(readFileSync(join(gh500, path), "utf8"));
  const errors = validateContentData({
    plan: { weeks: [] },
    questions: load("data/questions.json"),
    glossary: load("data/glossary.json"),
    sources: load("data/sources.json"),
    faq: [],
    qa: [],
    review: { mustRemember: {} },
    meta: load("data/exam-meta.json"),
    summary: {},
    rules: load("data/contract.json"),
    chapters: Object.fromEntries(
      readdirSync(join(gh500, "content/chapters"))
        .filter((name) => name.endsWith(".md"))
        .map((name) => [
          name,
          readFileSync(join(gh500, "content/chapters", name), "utf8"),
        ]),
    ),
  });
  // Totals (question count, term count, other domains) are expected to fail
  // until every domain is written; only the per-question and answer-balance
  // rules apply to the D2 sample.
  const perQuestion = errors.filter(
    (error) =>
      /^GH500-\d+ /.test(error) ||
      error.includes("最長選項即正解") ||
      error.includes("是非題的") ||
      error.includes("複選題的正解數量") ||
      error.includes("每題解析與陷阱") ||
      error.includes("題號必須") ||
      error.includes("題目 ID 重複"),
  );
  assert.deepEqual(perQuestion, []);
});
