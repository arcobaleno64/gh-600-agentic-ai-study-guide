import assert from "node:assert/strict";
import test from "node:test";
import { questionOptions } from "../src/quiz.ts";
import {
  SESSION_KEY,
  clearSession,
  loadSession,
  saveSession,
  secondsLeft,
  type SavedSession,
} from "../src/quizSession.ts";
import type { MultipleQuestion, SingleQuestion } from "../src/types.ts";

const base = {
  exam: "GH-600" as const,
  domainId: "D1",
  objectiveIds: ["D1-O1"],
  sourceIds: ["A1"],
  question: "測試題",
  explanation: "測試解析",
  trap: "測試陷阱",
  domain: "測試領域",
};
const options = ["A", "B", "C", "D"].map((id) => ({ id, text: `選項${id}` }));
const single: SingleQuestion = {
  ...base,
  id: "q-1",
  number: 1,
  type: "single",
  options,
  answer: "A",
};
const multi: MultipleQuestion = {
  ...base,
  id: "q-2",
  number: 2,
  type: "multiple",
  options,
  answer: ["A", "B"],
};
const bank = [single, multi];

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    data,
  };
}
const saved = (patch: Partial<SavedSession> = {}): SavedSession => ({
  version: 1,
  mode: "模擬考模式",
  items: [
    { id: "q-2", optionIds: ["D", "B", "A", "C"] },
    { id: "q-1", optionIds: ["C", "A", "D", "B"] },
  ],
  answers: { "q-2": ["B", "D"], "q-1": "C" },
  flagged: ["q-1"],
  revealed: [],
  current: 1,
  deadline: 1_000_000,
  savedAt: 0,
  ...patch,
});

test("重新整理後還原同一輪：題序、選項順序、答案、標記與截止時間都不變", () => {
  const storage = memoryStorage();
  assert.equal(saveSession(storage, saved()), true);
  const restored = loadSession(storage, bank, questionOptions);
  assert.ok(restored);
  assert.deepEqual(
    restored.items.map((item) => item.question.id),
    ["q-2", "q-1"],
  );
  assert.deepEqual(
    restored.items[0].options.map((option) => option.id),
    ["D", "B", "A", "C"],
  );
  assert.deepEqual(restored.answers, { "q-2": ["B", "D"], "q-1": "C" });
  assert.deepEqual(restored.flagged, ["q-1"]);
  assert.equal(restored.current, 1);
  assert.equal(restored.deadline, 1_000_000);
});

test("題庫已改版、找不到題目或選項對不上時，捨棄舊的作答", () => {
  const storage = memoryStorage();
  saveSession(storage, saved({ items: [{ id: "gone", optionIds: ["A"] }] }));
  assert.equal(loadSession(storage, bank, questionOptions), null);
  saveSession(
    storage,
    saved({ items: [{ id: "q-1", optionIds: ["A", "B", "C", "X"] }] }),
  );
  assert.equal(loadSession(storage, bank, questionOptions), null);
});

test("毀損或不認得的資料不會讓頁面壞掉", () => {
  const storage = memoryStorage();
  storage.setItem(SESSION_KEY, "{not json");
  assert.equal(loadSession(storage, bank, questionOptions), null);
  storage.setItem(SESSION_KEY, JSON.stringify({ version: 2 }));
  assert.equal(loadSession(storage, bank, questionOptions), null);
});

test("練習模式沒有截止時間；題號超出範圍時夾回最後一題", () => {
  const storage = memoryStorage();
  saveSession(storage, saved({ mode: "練習模式", current: 99 }));
  const restored = loadSession(storage, bank, questionOptions);
  assert.equal(restored?.deadline, null);
  assert.equal(restored?.current, 1);
});

test("交卷或放棄後清除保存的作答", () => {
  const storage = memoryStorage();
  saveSession(storage, saved());
  clearSession(storage);
  assert.equal(storage.data.has(SESSION_KEY), false);
});

test("儲存空間不可用時回報失敗，不丟出例外", () => {
  const broken = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("quota");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };
  assert.equal(saveSession(broken, saved()), false);
  assert.equal(loadSession(broken, bank, questionOptions), null);
  assert.doesNotThrow(() => clearSession(broken));
});

test("剩餘秒數以截止時間計算，背景分頁節流也不會少算", () => {
  assert.equal(secondsLeft(10_000, 0), 10);
  assert.equal(secondsLeft(10_000, 9_001), 1);
  assert.equal(secondsLeft(10_000, 10_000), 0);
  assert.equal(secondsLeft(10_000, 99_999), 0);
});
