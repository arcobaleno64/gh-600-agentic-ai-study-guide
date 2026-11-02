import assert from "node:assert/strict";
import test from "node:test";
import questionData from "../exams/gh-600/data/questions.json" with { type: "json" };
import {
  buildPath,
  isUnlocked,
  levelQuestions,
  MAX_LEVEL_QUESTIONS,
  resolveNode,
  starsFor,
} from "../src/quest.ts";
import type { Question } from "../src/types.ts";

const questions = questionData as Question[];
const path = buildPath();

test("全新進度時，網址指向後面的關卡不會進入該關，回到地圖", () => {
  assert.equal(resolveNode(path, "D6-O2", {}, false), undefined);
  assert.equal(resolveNode(path, "LAB-autonomy", {}, false), undefined);
});

test("第一關永遠可進入；通過前一關後下一關解鎖", () => {
  const first = path[0]!;
  const second = path[1]!;
  assert.equal(resolveNode(path, first.id, {}, false)?.id, first.id);
  assert.equal(resolveNode(path, second.id, {}, false), undefined);
  assert.equal(
    resolveNode(path, second.id, { [first.id]: 1 }, false)?.id,
    second.id,
  );
});

test("自由探索可進入任何關卡，但不存在的網址仍回到地圖", () => {
  assert.equal(resolveNode(path, "D6-O2", {}, true)?.id, "D6-O2");
  assert.equal(resolveNode(path, "NOPE", {}, true), undefined);
  assert.equal(resolveNode(path, "", {}, true), undefined);
});

test("只通過前一關不會解鎖再下一關", () => {
  const cleared = { [path[0]!.id]: 3 };
  assert.equal(isUnlocked(path, 2, cleared, false), false);
});

test("每關最多 3 題，且取題庫檔案中的前三題", () => {
  for (const id of ["D1-O3", "D2-O4", "D4-O1", "D6-O2"]) {
    const all = questions.filter((q) => q.objectiveIds.includes(id));
    assert.ok(all.length > MAX_LEVEL_QUESTIONS, `${id} 題庫應多於上限`);
    assert.deepEqual(
      levelQuestions(questions, id).map((q) => q.id),
      all.slice(0, MAX_LEVEL_QUESTIONS).map((q) => q.id),
    );
  }
});

test("星數：全對 3 星，容許範圍內 2 星，其餘 1 星", () => {
  assert.equal(starsFor(0, 1), 3);
  assert.equal(starsFor(1, 1), 2);
  assert.equal(starsFor(2, 1), 1);
});
