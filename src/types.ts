export type ExamCode = "GH-600";
export type RouteName =
  | "dashboard"
  | "plan"
  | "knowledge"
  | "glossary"
  | "quiz"
  | "faq"
  | "review"
  | "sources"
  | "settings";
export type ThemeMode = "system" | "light" | "dark";

export interface StudyDay {
  day: number;
  title: string;
  reading: string;
  output: string;
  passCriteria: string;
  domainId: string;
}
export interface StudyWeek {
  id: string;
  week: number;
  title: string;
  days: StudyDay[];
}
export interface QuestionOption {
  id: string;
  text: string;
}
export type QuestionType = "single" | "multiple" | "true-false";
export type QuestionAnswer = string | string[] | boolean;
export interface QuestionBase {
  id: string;
  exam: ExamCode;
  number: number;
  domainId: string;
  objectiveIds: string[];
  sourceIds: string[];
  question: string;
  explanation: string;
  trap: string;
  domain: string;
  difficulty: string;
  keywords: string[];
}
export interface SingleQuestion extends QuestionBase {
  type: "single";
  options: QuestionOption[];
  answer: string;
}
export interface MultipleQuestion extends QuestionBase {
  type: "multiple";
  options: QuestionOption[];
  answer: string[];
}
export interface TrueFalseQuestion extends QuestionBase {
  type: "true-false";
  answer: boolean;
}
export type Question = SingleQuestion | MultipleQuestion | TrueFalseQuestion;
export interface GlossaryTerm {
  id: string;
  term: string;
  explanation: string;
  exams: ExamCode[];
  category: string;
}
export interface SourceItem {
  id: string;
  title: string;
  url: string;
  publisher: string;
}
export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  related?: string[];
  keyWords?: string[];
}
export interface ExamMeta {
  code: ExamCode;
  certificationName: string;
  examName: string;
  durationMinutes: number;
  passingScore: number;
  languages: string[];
  studyGuideUpdatedAt: string;
  domains: DomainMeta[];
  studyGuide: string;
  certificationPage: string;
}
export interface ObjectiveMeta {
  id: string;
  name: string;
}
export interface DomainMeta {
  id: string;
  name: string;
  weight: { min: number; max: number };
  objectives: ObjectiveMeta[];
}
export interface QuizAttempt {
  id: string;
  exam: ExamCode;
  mode: string;
  date: string;
  correct: number;
  total: number;
  score: number;
  domains: Record<string, { correct: number; total: number }>;
}
export interface QuestionStat {
  attempts: number;
  correct: number;
  wrong: number;
  lastAnsweredAt: string;
}
export interface ProgressData {
  version: number;
  completedDays: number[];
  dayNotes: Record<string, string>;
  favoriteTerms: string[];
  familiarTerms: string[];
  questionStats: Record<string, QuestionStat>;
  wrongQuestionIds: string[];
  quizAttempts: QuizAttempt[];
  reviewChecks: string[];
  examDates: Partial<Record<ExamCode, string>>;
  theme: ThemeMode;
}
export interface SearchResult {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  route: RouteName;
  param?: string;
}
