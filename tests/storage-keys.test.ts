import assert from "node:assert/strict";
import test from "node:test";
import { SESSION_KEY } from "../src/quizSession.ts";
import { progressKeyFor, sessionKeyFor } from "../src/storageKeys.ts";

// Existing GH-600 learners hold data under these names; changing them would
// silently drop their progress and any in-progress mock exam.
test("GH-600 的儲存鍵與既有使用者資料所在的名稱完全相同", () => {
  assert.equal(progressKeyFor("GH-600"), "gh-600-study-progress");
  assert.equal(sessionKeyFor("GH-600"), "gh600-quiz-session-v1");
  assert.equal(sessionKeyFor("GH-600"), SESSION_KEY);
});

test("不同考試的儲存鍵互不相同，不會讀到對方的進度", () => {
  assert.notEqual(progressKeyFor("GH-500"), progressKeyFor("GH-600"));
  assert.notEqual(sessionKeyFor("GH-500"), sessionKeyFor("GH-600"));
});
