import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  EXAM_PART1_COUNT,
  EXAM_PART2_COUNT,
  allocateByDomain,
  buildExamQuestions,
  canVisit,
  type ExamScenario,
} from "../src/examMode.ts";
import { isQuestionCorrect, questionOptions } from "../src/quiz.ts";
import {
  SESSION_KEY,
  loadSession,
  saveSession,
  type SavedSession,
} from "../src/quizSession.ts";
import type { Question } from "../src/types.ts";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const part1 = read("data/exam-part1.json") as {
  scenario: ExamScenario;
  questions: Question[];
};
const bank = read("data/questions.json") as Question[];
const sources = read("data/sources.json") as { id: string }[];
const meta = read("data/exam-meta.json").exam.domains as {
  id: string;
  name: string;
  objectives: { id: string }[];
}[];
const identity = <T>(items: T[]) => [...items];
const reversed = <T>(items: T[]) => [...items].reverse();

test("第一部分是同一情境的 10 題，欄位、來源與 objective 都對得上現有資料", () => {
  assert.equal(part1.questions.length, EXAM_PART1_COUNT);
  assert.ok(
    part1.scenario.facts.length >= 3 && part1.scenario.observations.length >= 5,
  );
  const ids = part1.questions.map((question) => question.id);
  assert.equal(new Set(ids).size, EXAM_PART1_COUNT);
  assert.ok(ids.every((id) => !bank.some((question) => question.id === id)));
  const sourceIds = new Set(sources.map((source) => source.id));
  for (const question of part1.questions) {
    const domain = meta.find((item) => item.id === question.domainId);
    assert.ok(domain, `${question.id} 領域不存在`);
    assert.equal(question.domain, domain.name, `${question.id} 領域名稱不符`);
    assert.ok(
      question.objectiveIds.every((id) =>
        domain.objectives.some((objective) => objective.id === id),
      ),
      `${question.id} objective 不屬於該領域`,
    );
    assert.ok(
      question.sourceIds.every((id) => sourceIds.has(id)),
      `${question.id} 來源不存在`,
    );
    assert.ok(question.explanation.length >= 30 && question.trap.length >= 10);
    if (question.type !== "true-false") {
      assert.equal(question.options.length, 4);
      const optionIds = question.options.map((option) => option.id);
      const answers = Array.isArray(question.answer)
        ? question.answer
        : [question.answer];
      assert.ok(
        answers.every((id) => optionIds.includes(id)),
        `${question.id} 正解不在選項內`,
      );
    }
  }
});

test("第一部分的正解判得出來、錯誤答案判錯，複選不看點選順序", () => {
  for (const question of part1.questions) {
    assert.equal(
      isQuestionCorrect(question, question.answer),
      true,
      `${question.id} 正解應通過`,
    );
    const wrong =
      question.type === "true-false"
        ? !question.answer
        : question.type === "multiple"
          ? [question.answer[0]]
          : questionOptions(question).find(
              (option) => option.id !== question.answer,
            )!.id;
    assert.equal(
      isQuestionCorrect(question, wrong),
      false,
      `${question.id} 錯誤答案應判錯`,
    );
  }
  const multiple = part1.questions.find(
    (question) => question.type === "multiple",
  )!;
  assert.equal(
    isQuestionCorrect(multiple, [...(multiple.answer as string[])].reverse()),
    true,
  );
});

test("第一部分的正解選項不是固定最長，也不集中在同一個字母", () => {
  const singles = part1.questions.filter(
    (question) => question.type === "single",
  );
  const longest = singles.filter((question) => {
    const lengths = question.options.map((option) => option.text.length);
    const correct = question.options.find(
      (option) => option.id === question.answer,
    )!;
    return lengths.filter((n) => n >= correct.text.length).length === 1;
  });
  assert.ok(
    longest.length <= Math.ceil(singles.length / 2),
    `正解最長的有 ${longest.length}/${singles.length} 題`,
  );
  assert.ok(new Set(singles.map((question) => question.answer)).size >= 3);
});

test("仿真考共 52 題：前 10 題是第一部分，後 42 題取自題庫、不重複、依領域比例配置", () => {
  const exam = buildExamQuestions(part1.questions, bank, identity);
  assert.equal(exam.length, EXAM_PART1_COUNT + EXAM_PART2_COUNT);
  assert.deepEqual(
    exam.slice(0, EXAM_PART1_COUNT).map((q) => q.id),
    part1.questions.map((q) => q.id),
  );
  const part2 = exam.slice(EXAM_PART1_COUNT);
  assert.equal(new Set(part2.map((q) => q.id)).size, EXAM_PART2_COUNT);
  assert.ok(part2.every((q) => bank.some((item) => item.id === q.id)));
  const sizes: Record<string, number> = {};
  for (const q of bank) sizes[q.domainId] = (sizes[q.domainId] ?? 0) + 1;
  const expected = allocateByDomain(sizes, EXAM_PART2_COUNT);
  for (const [id, count] of Object.entries(expected))
    assert.equal(
      part2.filter((q) => q.domainId === id).length,
      count,
      `${id} 題數`,
    );
  assert.notDeepEqual(
    buildExamQuestions(part1.questions, bank, reversed)
      .slice(EXAM_PART1_COUNT)
      .map((q) => q.id),
    part2.map((q) => q.id),
  );
});

test("allocateByDomain：總數精確、不超過各領域題數", () => {
  const result = allocateByDomain({ A: 10, B: 7, C: 3 }, 12);
  assert.equal(
    Object.values(result).reduce((a, b) => a + b, 0),
    12,
  );
  assert.deepEqual(result, { A: 6, B: 4, C: 2 });
  assert.ok(
    Object.entries(allocateByDomain({ A: 1, B: 9 }, 10)).every(
      ([k, v]) => v <= { A: 1, B: 9 }[k as "A" | "B"],
    ),
  );
});

test("送出第一部分前只能到第一部分，送出後只能到第二部分", () => {
  for (let i = 0; i < 52; i += 1) {
    assert.equal(canVisit(i, false), i < EXAM_PART1_COUNT, `未送出 ${i}`);
    assert.equal(canVisit(i, true), i >= EXAM_PART1_COUNT, `已送出 ${i}`);
  }
});

test("仿真考的進行中紀錄會保存鎖定狀態；第一部分題目不在題庫時整份丟棄", () => {
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  };
  const exam = buildExamQuestions(part1.questions, bank, identity);
  const saved: SavedSession = {
    version: 1,
    mode: "仿真考模式",
    items: exam.map((q) => ({
      id: q.id,
      optionIds: questionOptions(q).map((o) => o.id),
    })),
    answers: { [part1.questions[0].id]: "B" },
    flagged: [],
    revealed: [],
    current: 12,
    deadline: Date.now() + 60_000,
    part1Locked: true,
    savedAt: Date.now(),
  };
  assert.equal(saveSession(storage, saved), true);
  const restored = loadSession(
    storage,
    [...bank, ...part1.questions],
    questionOptions,
  )!;
  assert.equal(restored.mode, "仿真考模式");
  assert.equal(restored.part1Locked, true);
  assert.equal(restored.items.length, 52);
  assert.equal(restored.deadline, saved.deadline);
  assert.equal(
    loadSession(storage, bank, questionOptions),
    null,
    "只有題庫、沒有第一部分題目時不能還原",
  );
  store.set(
    SESSION_KEY,
    JSON.stringify({ ...saved, mode: "練習模式", part1Locked: true }),
  );
  assert.equal(
    loadSession(storage, [...bank, ...part1.questions], questionOptions)!
      .part1Locked,
    false,
  );
});
