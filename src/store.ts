import { computed, reactive, ref, watch } from "vue";
import type {
  ExamCode,
  ProgressData,
  QuestionStat,
  QuestProgress,
  QuizAttempt,
  ThemeMode,
} from "./types";
import { examCode, progressKey } from "./site";

const KEY = `${progressKey}-v1`;
const themes: ThemeMode[] = ["system", "light", "dark"];
// Only this build's exam has saved dates and attempts.
const examCodes: ExamCode[] = [examCode];

const defaults: ProgressData = {
  version: 1,
  completedDays: [],
  dayNotes: {},
  favoriteTerms: [],
  familiarTerms: [],
  questionStats: {},
  wrongQuestionIds: [],
  quizAttempts: [],
  reviewChecks: [],
  quest: { cleared: {}, freeRoam: false },
  examDates: {},
  theme: "system",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter((item): item is string => typeof item === "string"),
    ),
  ];
}

function sanitizeQuestionStats(value: unknown): Record<string, QuestionStat> {
  if (!isRecord(value)) return {};
  const result: Record<string, QuestionStat> = {};
  for (const [id, raw] of Object.entries(value)) {
    if (!id || !isRecord(raw)) continue;
    const attempts = Number(raw.attempts);
    const correct = Number(raw.correct);
    const wrong = Number(raw.wrong);
    if (![attempts, correct, wrong].every(Number.isFinite)) continue;
    result[id] = {
      attempts: Math.max(0, Math.floor(attempts)),
      correct: Math.max(0, Math.floor(correct)),
      wrong: Math.max(0, Math.floor(wrong)),
      lastAnsweredAt:
        typeof raw.lastAnsweredAt === "string" ? raw.lastAnsweredAt : "",
    };
  }
  return result;
}

function sanitizeDomains(
  value: unknown,
): Record<string, { correct: number; total: number }> {
  if (!isRecord(value)) return {};
  const result: Record<string, { correct: number; total: number }> = {};
  for (const [name, raw] of Object.entries(value)) {
    if (!name || !isRecord(raw)) continue;
    const correct = Number(raw.correct);
    const total = Number(raw.total);
    if (!Number.isFinite(correct) || !Number.isFinite(total)) continue;
    result[name] = {
      correct: Math.max(0, Math.floor(correct)),
      total: Math.max(0, Math.floor(total)),
    };
  }
  return result;
}

function sanitizeAttempts(value: unknown): QuizAttempt[] {
  if (!Array.isArray(value)) return [];
  const result: QuizAttempt[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    const exam = raw.exam;
    if (!examCodes.includes(String(exam) as ExamCode)) continue;
    const correct = Number(raw.correct);
    const total = Number(raw.total);
    const score = Number(raw.score);
    if (![correct, total, score].every(Number.isFinite)) continue;
    result.push({
      id: typeof raw.id === "string" ? raw.id : crypto.randomUUID(),
      exam: exam as ExamCode,
      mode: typeof raw.mode === "string" ? raw.mode : "練習",
      date: typeof raw.date === "string" ? raw.date : new Date().toISOString(),
      correct: Math.max(0, Math.floor(correct)),
      total: Math.max(0, Math.floor(total)),
      score: Math.max(0, Math.min(100, Math.round(score))),
      domains: sanitizeDomains(raw.domains),
    });
  }
  return result.slice(0, 30);
}

function sanitizeQuest(value: unknown): QuestProgress {
  const result: QuestProgress = { cleared: {}, freeRoam: false };
  if (!isRecord(value)) return result;
  result.freeRoam = value.freeRoam === true;
  if (isRecord(value.cleared)) {
    for (const [id, stars] of Object.entries(value.cleared)) {
      if (!/^[A-Za-z0-9-]{1,24}$/.test(id)) continue;
      if (!Number.isInteger(stars) || Number(stars) < 1 || Number(stars) > 3)
        continue;
      if (Object.keys(result.cleared).length >= 64) break;
      result.cleared[id] = Number(stars);
    }
  }
  return result;
}

function sanitizeProgress(value: unknown): ProgressData {
  if (!isRecord(value)) return structuredClone(defaults);

  const completedDays = Array.isArray(value.completedDays)
    ? [
        ...new Set(
          value.completedDays.filter(
            (day): day is number =>
              Number.isInteger(day) && Number(day) >= 1 && Number(day) <= 28,
          ),
        ),
      ].sort((a, b) => a - b)
    : [];

  const dayNotes: Record<string, string> = {};
  if (isRecord(value.dayNotes)) {
    for (const [day, note] of Object.entries(value.dayNotes)) {
      const numericDay = Number(day);
      if (
        Number.isInteger(numericDay) &&
        numericDay >= 1 &&
        numericDay <= 28 &&
        typeof note === "string"
      ) {
        dayNotes[day] = note.slice(0, 4000);
      }
    }
  }

  const examDates: Partial<Record<ExamCode, string>> = {};
  if (isRecord(value.examDates)) {
    for (const code of examCodes) {
      const date = value.examDates[code];
      if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        examDates[code] = date;
      }
    }
  }

  return {
    version: 1,
    completedDays,
    dayNotes,
    favoriteTerms: uniqueStrings(value.favoriteTerms),
    familiarTerms: uniqueStrings(value.familiarTerms),
    questionStats: sanitizeQuestionStats(value.questionStats),
    wrongQuestionIds: uniqueStrings(value.wrongQuestionIds),
    quizAttempts: sanitizeAttempts(value.quizAttempts),
    reviewChecks: uniqueStrings(value.reviewChecks),
    quest: sanitizeQuest(value.quest),
    examDates,
    theme: themes.includes(value.theme as ThemeMode)
      ? (value.theme as ThemeMode)
      : "system",
  };
}

function load(): ProgressData {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? sanitizeProgress(JSON.parse(raw)) : structuredClone(defaults);
  } catch {
    return structuredClone(defaults);
  }
}

export const progress = reactive<ProgressData>(load());
export const storageStatus = ref<"idle" | "saved" | "error">("idle");

watch(
  progress,
  (value) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
      storageStatus.value = "saved";
    } catch {
      storageStatus.value = "error";
    }
  },
  { deep: true },
);

export const completedCount = computed(() => progress.completedDays.length);
export const wrongCount = computed(() => progress.wrongQuestionIds.length);

function toggleArray<T extends string | number>(list: T[], value: T): void {
  const index = list.indexOf(value);
  if (index >= 0) list.splice(index, 1);
  else list.push(value);
}

export const toggleDay = (day: number) =>
  toggleArray(progress.completedDays, day);

export const setDayNote = (day: number, note: string) => {
  progress.dayNotes[String(day)] = note.slice(0, 4000);
};

export const toggleFavoriteTerm = (id: string) =>
  toggleArray(progress.favoriteTerms, id);

export const toggleFamiliarTerm = (id: string) =>
  toggleArray(progress.familiarTerms, id);

export const toggleReviewCheck = (id: string) =>
  toggleArray(progress.reviewChecks, id);

export function recordQuestion(id: string, correct: boolean): void {
  const stat: QuestionStat = progress.questionStats[id] ?? {
    attempts: 0,
    correct: 0,
    wrong: 0,
    lastAnsweredAt: "",
  };
  stat.attempts += 1;
  if (correct) {
    stat.correct += 1;
    const index = progress.wrongQuestionIds.indexOf(id);
    if (index >= 0) progress.wrongQuestionIds.splice(index, 1);
  } else {
    stat.wrong += 1;
    if (!progress.wrongQuestionIds.includes(id))
      progress.wrongQuestionIds.push(id);
  }
  stat.lastAnsweredAt = new Date().toISOString();
  progress.questionStats[id] = stat;
}

export function recordQuestClear(id: string, stars: number): void {
  const best = Math.max(progress.quest.cleared[id] ?? 0, stars);
  progress.quest.cleared[id] = Math.min(3, Math.max(1, Math.floor(best)));
}

export function addAttempt(attempt: QuizAttempt): void {
  progress.quizAttempts.unshift(attempt);
  progress.quizAttempts.splice(30);
}

export const clearWrongAnswers = () => {
  progress.wrongQuestionIds.splice(0);
};

export function setTheme(theme: ThemeMode): void {
  progress.theme = theme;
  applyTheme();
}

export function applyTheme(): void {
  const dark =
    progress.theme === "dark" ||
    (progress.theme === "system" &&
      matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function cycleTheme(): void {
  setTheme(themes[(themes.indexOf(progress.theme) + 1) % themes.length]);
}

export const setExamDate = (exam: ExamCode, date: string) => {
  if (date) progress.examDates[exam] = date;
  else delete progress.examDates[exam];
};

export function exportProgress() {
  return {
    schema: progressKey,
    exportedAt: new Date().toISOString(),
    ...JSON.parse(JSON.stringify(progress)),
  };
}

export function importProgress(value: unknown): void {
  if (!isRecord(value) || value.schema !== progressKey || value.version !== 1) {
    throw new Error("檔案格式或版本不是本網站支援的學習紀錄。");
  }
  Object.assign(progress, sanitizeProgress(value));
  applyTheme();
}

export function resetProgress(): void {
  Object.assign(progress, structuredClone(defaults));
  applyTheme();
}

applyTheme();
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (progress.theme === "system") applyTheme();
});
