import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { validateContentData } from "./content-contract.mjs";

const root = resolve(process.cwd());
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const chapterDir = join(root, "content", "chapters");
const chapterFiles = readdirSync(chapterDir).filter((name) =>
  name.endsWith(".md"),
);
const chapters = Object.fromEntries(
  chapterFiles.map((name) => [
    name,
    readFileSync(join(chapterDir, name), "utf8"),
  ]),
);
const data = {
  plan: read("data/study-plan.json"),
  questions: read("data/questions.json"),
  glossary: read("data/glossary.json"),
  sources: read("data/sources.json"),
  faq: read("data/faq.json"),
  qa: read("data/qa.json"),
  review: read("data/review.json"),
  meta: read("data/exam-meta.json"),
  summary: read("data/content-summary.json"),
  chapters,
};
const errors = validateContentData(data);
for (const name of [
  "start-here.md",
  "d1.md",
  "d2.md",
  "d3.md",
  "d4.md",
  "d5.md",
  "d6.md",
  "integration.md",
]) {
  if (
    !chapterFiles.includes(name) ||
    statSync(join(chapterDir, name)).size < 500
  )
    errors.push(`${name} 不存在或內容過短。`);
}
if (errors.length) {
  errors.forEach((error) => console.error(`[錯誤] ${error}`));
  process.exit(1);
}
console.log(
  `[完成] 內容驗證通過：28 天、${data.questions.length} 題、${data.glossary.categories.flatMap((category) => category.terms).length} 個名詞、${data.sources.length} 項官方來源、${data.faq.length} 題 FAQ、${data.qa.length} 題情境 Q&A。`,
);
