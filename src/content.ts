import planData from "../data/study-plan.json";
import questionData from "../data/questions.json";
import glossaryData from "../data/glossary.json";
import sourcesData from "../data/sources.json";
import faqData from "../data/faq.json";
import qaData from "../data/qa.json";
import reviewData from "../data/review.json";
import metaData from "../data/exam-meta.json";
import summaryData from "../data/content-summary.json";
import startHere from "../content/chapters/start-here.md?raw";
import d1 from "../content/chapters/d1.md?raw";
import d2 from "../content/chapters/d2.md?raw";
import d3 from "../content/chapters/d3.md?raw";
import d4 from "../content/chapters/d4.md?raw";
import d5 from "../content/chapters/d5.md?raw";
import d6 from "../content/chapters/d6.md?raw";
import integration from "../content/chapters/integration.md?raw";
import type {
  ExamMeta,
  FaqItem,
  GlossaryTerm,
  Question,
  SearchResult,
  SourceItem,
  StudyDay,
  StudyWeek,
} from "./types";
import { normalize } from "./utils";
export const studyPlan = planData as {
  version: string;
  weeks: StudyWeek[];
  wrongAnswerMethod: { type: string; symptom: string; remedy: string }[];
};
export const studyDays = studyPlan.weeks.flatMap((w) => w.days) as StudyDay[];
export const questions = questionData as Question[];
export const glossary = glossaryData as {
  version: string;
  categories: { id: string; title: string; terms: GlossaryTerm[] }[];
};
export const terms = glossary.categories.flatMap((c) => c.terms);
export const sources = sourcesData as SourceItem[];
export const faqs = faqData as FaqItem[];
export const qas = qaData as FaqItem[];
export const review = reviewData as {
  mustRemember: Record<string, string[]>;
  cheatsheet: { combination: string; summary: string }[];
  examDayChecklist: string[];
};
export const examMeta = metaData as {
  lastVerified: string;
  disclaimer: string;
  exam: ExamMeta;
};
export const summary = {
  ...summaryData,
  questions: questions.length,
  domainQuestions: Object.fromEntries(
    examMeta.exam.domains.map((domain) => [
      domain.id,
      questions.filter((q) => q.domainId === domain.id).length,
    ]),
  ),
};
const domainMarkdown = { D1: d1, D2: d2, D3: d3, D4: d4, D5: d5, D6: d6 };
export const chapters = [
  { id: "start-here", title: "開始使用", domain: "總覽", raw: startHere },
  ...examMeta.exam.domains.map((domain) => ({
    id: domain.id.toLowerCase(),
    title: domain.name,
    domain: domain.id,
    raw: domainMarkdown[domain.id as keyof typeof domainMarkdown],
  })),
  {
    id: "integration",
    title: "跨領域整合速查",
    domain: "整合",
    raw: integration,
  },
];
export function searchContent(query: string): SearchResult[] {
  const q = normalize(query.trim());
  if (!q) return [];
  const hit = (...values: string[]) => normalize(values.join(" ")).includes(q);
  const out: SearchResult[] = [];
  for (const t of terms)
    if (hit(t.term, t.explanation, t.category))
      out.push({
        id: t.id,
        type: "名詞",
        title: t.term,
        excerpt: t.explanation,
        route: "glossary",
        param: t.id,
      });
  for (const item of [...faqs, ...qas])
    if (hit(item.question, item.answer, item.category))
      out.push({
        id: item.id,
        type: "問答",
        title: item.question,
        excerpt: item.answer,
        route: "faq",
        param: item.id,
      });
  for (const s of sources)
    if (hit(s.title, s.id))
      out.push({
        id: s.id,
        type: "來源",
        title: s.title,
        excerpt: s.url,
        route: "sources",
        param: s.id,
      });
  for (const item of questions)
    if (hit(item.question, item.explanation, item.domain, item.trap))
      out.push({
        id: item.id,
        type: "題目",
        title: `${item.exam} 第 ${item.number} 題`,
        excerpt: item.question,
        route: "quiz",
        param: item.id,
      });
  for (const c of chapters)
    if (hit(c.title, c.raw))
      out.push({
        id: c.id,
        type: "章節",
        title: c.title,
        excerpt: "在教材章節內找到相關內容。",
        route: "knowledge",
        param: c.id,
      });
  return out.slice(0, 50);
}
