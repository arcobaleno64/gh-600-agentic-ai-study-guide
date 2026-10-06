import type { Question, QuestionAnswer, QuestionOption } from "./types.ts";

// An in-progress quiz, persisted so a reload or a mobile tab eviction does not
// throw away a 120-minute mock exam. Only ids are stored; question text always
// comes from the current bank, and a session that no longer matches it is dropped.
export const SESSION_KEY = "gh600-quiz-session-v1";
export type QuizMode = "練習模式" | "模擬考模式";

export interface SavedSession {
  version: 1;
  mode: QuizMode;
  items: { id: string; optionIds: string[] }[];
  answers: Record<string, QuestionAnswer>;
  flagged: string[];
  revealed: string[];
  current: number;
  deadline: number | null; // epoch ms; null outside mock-exam mode
  savedAt: number;
}

export interface RestoredSession {
  mode: QuizMode;
  items: { question: Question; options: QuestionOption[] }[];
  answers: Record<string, QuestionAnswer>;
  flagged: string[];
  revealed: string[];
  current: number;
  deadline: number | null;
}

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function saveSession(storage: Store, session: SavedSession): boolean {
  try {
    storage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function clearSession(storage: Store) {
  try {
    storage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable: nothing to clear */
  }
}

export function loadSession(
  storage: Store,
  bank: Question[],
  optionsOf: (question: Question) => QuestionOption[],
): RestoredSession | null {
  let raw: unknown;
  try {
    raw = JSON.parse(storage.getItem(SESSION_KEY) ?? "null");
  } catch {
    return null;
  }
  const data = raw as Partial<SavedSession> | null;
  if (
    !data ||
    data.version !== 1 ||
    (data.mode !== "練習模式" && data.mode !== "模擬考模式") ||
    !Array.isArray(data.items) ||
    !data.items.length
  )
    return null;
  const byId = new Map(bank.map((question) => [question.id, question]));
  const items: RestoredSession["items"] = [];
  for (const item of data.items) {
    const question = byId.get(item?.id);
    if (!question || !Array.isArray(item.optionIds)) return null;
    const options = optionsOf(question);
    const ordered = item.optionIds.map((id) =>
      options.find((option) => option.id === id),
    );
    // The bank changed under a saved session: its option ids no longer match.
    if (ordered.length !== options.length || ordered.some((option) => !option))
      return null;
    items.push({ question, options: ordered as QuestionOption[] });
  }
  const ids = new Set(items.map((item) => item.question.id));
  const answers: Record<string, QuestionAnswer> = {};
  for (const [id, answer] of Object.entries(data.answers ?? {}))
    if (ids.has(id)) answers[id] = answer;
  const keep = (list: unknown) =>
    Array.isArray(list)
      ? list.filter((id): id is string => typeof id === "string" && ids.has(id))
      : [];
  const current = Number.isInteger(data.current) ? Number(data.current) : 0;
  return {
    mode: data.mode,
    items,
    answers,
    flagged: keep(data.flagged),
    revealed: keep(data.revealed),
    current: Math.min(Math.max(current, 0), items.length - 1),
    deadline:
      data.mode === "模擬考模式" && typeof data.deadline === "number"
        ? data.deadline
        : null,
  };
}

// Whole seconds left before the deadline, never negative.
export function secondsLeft(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
