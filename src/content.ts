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
import { rankSearch, type SearchFilter, type SearchEntry } from "./search";
import { readingSections, readingExcerpt } from "./reading";
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
type ContentEntry = SearchEntry & {
  result: SearchResult & { section?: string };
  markdown?: string;
  prefix?: string;
};
const searchEntries: ContentEntry[] = chapters.flatMap((chapter) => {
  const { introduction, sections } = readingSections(chapter.raw);
  return [
    {
      type: "章節",
      title: chapter.title,
      keywords: `${chapter.id} ${chapter.domain}`,
      body: introduction,
      markdown: introduction || chapter.raw,
      result: {
        id: chapter.id,
        type: "章節",
        title: chapter.title,
        excerpt: "",
        route: "knowledge",
        param: chapter.id,
      },
    },
    ...sections.map((section): ContentEntry => ({
      type: "教材",
      title: section.title,
      keywords: section.objectiveId,
      body: section.raw,
      markdown: section.raw,
      prefix: `${chapter.title}｜`,
      result: {
        id: `${chapter.id}-${section.id}`,
        type: "教材",
        title: section.title,
        excerpt: "",
        route: "knowledge",
        param: chapter.id,
        section: section.id,
      },
    })),
  ];
});
searchEntries.push(
  ...terms.map((t): ContentEntry => ({
    type: "名詞",
    title: t.term,
    keywords: `${t.id} ${t.category}`,
    body: t.explanation,
    result: {
      id: t.id,
      type: "名詞",
      title: t.term,
      excerpt: t.explanation,
      route: "glossary",
      param: t.id,
    },
  })),
  ...questions.map((item): ContentEntry => ({
    type: "題目",
    title: item.question,
    keywords: `${item.id} ${item.domain} ${item.objectiveIds.join(" ")}`,
    body: `${item.explanation} ${item.trap}`,
    result: {
      id: item.id,
      type: "題目",
      title: `${item.exam} 第 ${item.number} 題`,
      excerpt: item.question,
      route: "quiz",
      param: item.id,
    },
  })),
  ...[...faqs, ...qas].map((item): ContentEntry => ({
    type: "問答",
    title: item.question,
    keywords: `${item.id} ${item.category}`,
    body: item.answer,
    result: {
      id: item.id,
      type: "問答",
      title: item.question,
      excerpt: item.answer,
      route: "faq",
      param: item.id,
    },
  })),
  ...sources.map((s): ContentEntry => ({
    type: "來源",
    title: s.title,
    keywords: s.id,
    body: s.url,
    result: {
      id: s.id,
      type: "來源",
      title: s.title,
      excerpt: s.url,
      route: "sources",
      param: s.id,
    },
  })),
);
export function searchContent(query: string, filter: SearchFilter = "全部") {
  const { items, total } = rankSearch(searchEntries, query, filter);
  return Object.assign(
    items.map((item) => ({
      ...item.result,
      excerpt:
        item.markdown === undefined
          ? item.result.excerpt
          : `${item.prefix ?? ""}${readingExcerpt(item.markdown, query)}`,
    })),
    { total },
  );
}
