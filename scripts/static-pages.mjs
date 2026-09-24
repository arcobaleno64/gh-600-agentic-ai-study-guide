// Read-only HTML pages for crawlers and answer engines. The interactive app
// lives at "/" and routes by hash, which crawlers treat as one empty page, so
// every content unit also gets a JavaScript-free page at its own path, plus
// sitemap.xml, llms.txt and llms-full.txt. The app itself is untouched.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Marked } from "marked";

export const SITE_URL =
  "https://gh-600-agentic-ai-study-guide.t11306458.workers.dev";
export const SITE_NAME = "GH-600 Agentic AI Developer 四週備考指南";

const root = fileURLToPath(new URL("..", import.meta.url));

export function loadContent(dir = root) {
  const json = (name) =>
    JSON.parse(readFileSync(join(dir, "data", name), "utf8"));
  const md = (name) =>
    readFileSync(join(dir, "content/chapters", `${name}.md`), "utf8");
  const meta = json("exam-meta.json");
  // Same order and ids as src/content.ts.
  const chapters = [
    { id: "start-here", title: "開始使用", raw: md("start-here") },
    ...meta.exam.domains.map((domain) => ({
      id: domain.id.toLowerCase(),
      title: domain.name,
      domainId: domain.id,
      raw: md(domain.id.toLowerCase()),
    })),
    { id: "integration", title: "跨領域整合速查", raw: md("integration") },
  ];
  return {
    meta,
    chapters,
    questions: json("questions.json"),
    glossary: json("glossary.json"),
    faqs: json("faq.json"),
    qas: json("qa.json"),
    review: json("review.json"),
    plan: json("study-plan.json"),
    sources: json("sources.json"),
  };
}

const escapeHtml = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
// JSON-LD sits in a <script> block; "<" must not be able to close it.
const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

function markdown() {
  const marked = new Marked();
  let section = 0;
  marked.use({
    renderer: {
      // Same anchors as the app's reading sections (src/reading.ts).
      heading({ tokens, depth, text }) {
        const body = this.parser.parseInline(tokens);
        if (depth !== 2) return `<h${depth}>${body}</h${depth}>\n`;
        section += 1;
        const id =
          text.match(/^D\d+-O\d+\b/)?.[0]?.toLowerCase() ||
          `section-${section}`;
        return `<h2 id="${id}">${body}</h2>\n`;
      },
    },
  });
  return marked;
}

function plainIntro(raw) {
  const paragraph = new Marked()
    .lexer(raw)
    .find((token) => token.type === "paragraph");
  const text = (paragraph?.text ?? "")
    .replace(/[*`_[\]]/g, "")
    .replace(/\(https?:[^)]*\)/g, "");
  return text.length > 110 ? `${text.slice(0, 110)}…` : text;
}

export function answerText(question) {
  if (question.type === "true-false") return question.answer ? "正確" : "錯誤";
  const ids = Array.isArray(question.answer)
    ? question.answer
    : [question.answer];
  return ids
    .map((id) => question.options.find((option) => option.id === id).text)
    .join("；");
}

const pageUrl = (path) => `${SITE_URL}${path}`;

function layout(site, page) {
  const nav = site.nav
    .map(
      (item) =>
        `<li><a href="${item.path}"${item.path === page.path ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a></li>`,
    )
    .join("");
  return `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(page.title)} | ${SITE_NAME}</title>
<meta name="description" content="${escapeHtml(page.description)}">
<link rel="canonical" href="${pageUrl(page.path)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${escapeHtml(page.title)}">
<meta property="og:description" content="${escapeHtml(page.description)}">
<meta property="og:url" content="${pageUrl(page.path)}">
<meta property="og:image" content="${SITE_URL}/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/icon-192.png" type="image/png">
<link rel="stylesheet" href="/static.css">
${jsonLd({ "@context": "https://schema.org", ...page.schema, url: pageUrl(page.path), inLanguage: "zh-Hant-TW" })}
</head>
<body>
<a class="skip" href="#main">跳到主要內容</a>
<header class="top">
<a class="brand" href="/">GH-600 數位教科書</a>
<a class="open-app" href="/#/${page.app}">開啟互動版</a>
</header>
<div class="shell">
<nav aria-label="教材目錄"><ul>${nav}</ul></nav>
<main id="main">
<h1>${escapeHtml(page.title)}</h1>
${page.body}
</main>
</div>
<footer><p>${escapeHtml(site.disclaimer)}</p><p>內容最後核對：${escapeHtml(site.lastVerified)}</p></footer>
</body>
</html>
`;
}

function chapterPage(chapter) {
  const description = plainIntro(chapter.raw);
  // The chapter's own H1 duplicates the page title.
  const body = markdown().parse(chapter.raw.replace(/^# .*\n+/, ""));
  return {
    path: `/knowledge/${chapter.id}/`,
    label: chapter.domainId
      ? `${chapter.domainId} ${chapter.title}`
      : chapter.title,
    title: chapter.domainId
      ? `${chapter.domainId}：${chapter.title}`
      : chapter.title,
    description,
    app: `knowledge/${chapter.id}`,
    group: "教材",
    body,
    schema: {
      "@type": "LearningResource",
      name: chapter.title,
      description,
      learningResourceType: "教材",
      isPartOf: { "@type": "Course", name: SITE_NAME, url: `${SITE_URL}/` },
    },
  };
}

function questionHtml(question, sources) {
  const options =
    question.type === "true-false"
      ? "<p>是非題：判斷敘述是否正確。</p>"
      : `<p>${question.type === "multiple" ? "複選題" : "單選題"}，選項：</p><ul>${question.options.map((option) => `<li>${escapeHtml(option.text)}</li>`).join("")}</ul>`;
  const cited = question.sourceIds
    .map((id) => sources.find((source) => source.id === id))
    .filter(Boolean)
    .map(
      (source) =>
        `<a href="${escapeHtml(source.url)}" rel="noopener">${escapeHtml(source.title)}</a>`,
    )
    .join("、");
  return `<article class="question" id="${question.id.toLowerCase()}">
<h2>第 ${question.number} 題（${escapeHtml(question.objectiveIds.join("、"))}）</h2>
<p class="stem">${escapeHtml(question.question)}</p>
${options}
<details><summary>看答案與解析</summary>
<p><strong>正確答案：</strong>${escapeHtml(answerText(question))}</p>
<p><strong>解析：</strong>${escapeHtml(question.explanation)}</p>
<p><strong>常見陷阱：</strong>${escapeHtml(question.trap)}</p>
${cited ? `<p><strong>依據：</strong>${cited}</p>` : ""}
</details>
<p><a href="/#/quiz/${encodeURIComponent(question.id)}">在互動版作答這題</a></p>
</article>`;
}

function quizPages(content) {
  const domains = content.meta.exam.domains;
  const pages = domains.map((domain) => {
    const items = content.questions.filter((q) => q.domainId === domain.id);
    const description = `${domain.id}「${domain.name}」${items.length} 題原創模擬題，附正確答案、解析與常見陷阱。`;
    return {
      path: `/quiz/${domain.id.toLowerCase()}/`,
      label: `${domain.id} 模擬題`,
      title: `${domain.id} 模擬題：${domain.name}`,
      description,
      app: "quiz",
      group: "模擬題",
      body: `<p>${escapeHtml(description)}選項順序在互動版會隨機排列。</p>\n${items.map((q) => questionHtml(q, content.sources)).join("\n")}`,
      schema: {
        "@type": "Quiz",
        name: `${domain.id} 模擬題：${domain.name}`,
        about: content.meta.exam.examName,
        hasPart: items.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${answerText(q)}。${q.explanation}`,
          },
        })),
      },
    };
  });
  const index = {
    path: "/quiz/",
    label: "模擬題總覽",
    title: "GH-600 模擬題",
    description: `依六個領域分組的 ${content.questions.length} 題原創模擬題，每題附正確答案、解析與常見陷阱。`,
    app: "quiz",
    group: "模擬題",
    body: `<p>依六個領域分組的 ${content.questions.length} 題原創模擬題。題目為學習用途自行撰寫，不是實際考題。</p><ul>${pages
      .map((page, i) => {
        const weight = domains[i].weight;
        return `<li><a href="${page.path}">${escapeHtml(page.title)}</a>（考試權重 ${weight.min}–${weight.max}%）</li>`;
      })
      .join("")}</ul>`,
    schema: { "@type": "CollectionPage", name: "GH-600 模擬題" },
  };
  return [index, ...pages];
}

function glossaryPage(content) {
  const count = content.glossary.categories.reduce(
    (n, c) => n + c.terms.length,
    0,
  );
  const description = `GH-600 六個領域共 ${count} 個名詞的繁體中文解釋。`;
  return {
    path: "/glossary/",
    label: "名詞庫",
    title: "GH-600 名詞庫",
    description,
    app: "glossary",
    group: "速查",
    body: content.glossary.categories
      .map(
        (category) =>
          `<section id="${category.id.toLowerCase()}"><h2>${escapeHtml(category.id)} ${escapeHtml(category.title)}</h2><dl>${category.terms
            .map(
              (term) =>
                `<dt id="${term.id.toLowerCase()}">${escapeHtml(term.term)}</dt><dd>${escapeHtml(term.explanation)}</dd>`,
            )
            .join("")}</dl></section>`,
      )
      .join("\n"),
    schema: {
      "@type": "DefinedTermSet",
      name: "GH-600 名詞庫",
      hasDefinedTerm: content.glossary.categories.flatMap((c) =>
        c.terms.map((term) => ({
          "@type": "DefinedTerm",
          name: term.term,
          description: term.explanation,
        })),
      ),
    },
  };
}

function faqPage(content) {
  const items = [...content.faqs, ...content.qas];
  const groups = new Map();
  for (const item of items)
    groups.set(item.category, [...(groups.get(item.category) ?? []), item]);
  return {
    path: "/faq/",
    label: "FAQ／Q&A",
    title: "GH-600 常見問題",
    description: `GH-600 考試資訊與六領域觀念的 ${items.length} 則問答。`,
    app: "faq",
    group: "速查",
    body: [...groups]
      .map(
        ([category, list]) =>
          `<section><h2>${escapeHtml(category)}</h2>${list
            .map(
              (item) =>
                `<div class="qa" id="${item.id.toLowerCase()}"><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></div>`,
            )
            .join("")}</section>`,
      )
      .join("\n"),
    schema: {
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  };
}

function reviewPage(content) {
  const { mustRemember, cheatsheet, examDayChecklist } = content.review;
  return {
    path: "/review/",
    label: "考前速查",
    title: "GH-600 考前速查",
    description: "考前必記重點、易混淆觀念對照與考試當天檢查清單。",
    app: "review",
    group: "速查",
    body: `<h2>必記重點</h2>${Object.values(mustRemember)
      .map(
        (list) =>
          `<ul>${list.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`,
      )
      .join("")}
<h2>易混淆觀念</h2><dl>${cheatsheet.map((row) => `<dt>${escapeHtml(row.combination)}</dt><dd>${escapeHtml(row.summary)}</dd>`).join("")}</dl>
<h2>考試當天檢查清單</h2><ul>${examDayChecklist.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`,
    schema: { "@type": "WebPage", name: "GH-600 考前速查" },
  };
}

function planPage(content) {
  const { weeks, wrongAnswerMethod } = content.plan;
  return {
    path: "/plan/",
    label: "四週計畫",
    title: "GH-600 四週讀書計畫",
    description: "28 天的每日閱讀、產出與過關標準，以及錯題分類與補強方法。",
    app: "plan",
    group: "速查",
    body: `${weeks
      .map(
        (week) =>
          `<section><h2>第 ${week.week} 週：${escapeHtml(week.title)}</h2><ol class="days">${week.days
            .map(
              (day) =>
                `<li value="${day.day}"><strong>${escapeHtml(day.title)}</strong><br>閱讀：${escapeHtml(day.reading)}<br>產出：${escapeHtml(day.output)}<br>過關標準：${escapeHtml(day.passCriteria)}</li>`,
            )
            .join("")}</ol></section>`,
      )
      .join("\n")}
<h2>錯題分類與補強</h2><dl>${wrongAnswerMethod.map((row) => `<dt>${escapeHtml(row.type)}</dt><dd>症狀：${escapeHtml(row.symptom)}<br>補強：${escapeHtml(row.remedy)}</dd>`).join("")}</dl>`,
    schema: { "@type": "WebPage", name: "GH-600 四週讀書計畫" },
  };
}

function sourcesPage(content) {
  return {
    path: "/sources/",
    label: "官方來源",
    title: "GH-600 官方來源",
    description: "本指南引用的 Microsoft Learn 與 GitHub Docs 官方文件清單。",
    app: "sources",
    group: "速查",
    body: `<ul>${content.sources
      .map(
        (source) =>
          `<li id="${source.id.toLowerCase()}"><a href="${escapeHtml(source.url)}" rel="noopener">${escapeHtml(source.title)}</a>（${escapeHtml(source.publisher)}）</li>`,
      )
      .join("")}</ul>`,
    schema: { "@type": "WebPage", name: "GH-600 官方來源" },
  };
}

function llmsTxt(pages, content) {
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> 繁體中文（臺灣）的 GitHub Certified: Agentic AI Developer（Exam GH-600: ${content.meta.exam.examName}）備考教材：六領域教材、名詞庫、問答與 ${content.questions.length} 題附解析的原創模擬題。`,
    "",
    content.meta.disclaimer,
    "",
  ];
  for (const group of ["教材", "模擬題", "速查"]) {
    lines.push(`## ${group}`, "");
    for (const page of pages.filter((p) => p.group === group))
      lines.push(
        `- [${page.title}](${pageUrl(page.path)}): ${page.description}`,
      );
    lines.push("");
  }
  lines.push(
    "## Optional",
    "",
    `- [全文（Markdown）](${SITE_URL}/llms-full.txt): 上述所有頁面的純文字合輯`,
    "",
  );
  return lines.join("\n");
}

function llmsFullTxt(content) {
  const out = [`# ${SITE_NAME}`, "", content.meta.disclaimer, ""];
  for (const chapter of content.chapters) out.push(chapter.raw.trim(), "");
  out.push("# 名詞庫", "");
  for (const category of content.glossary.categories) {
    out.push(`## ${category.id} ${category.title}`, "");
    for (const term of category.terms)
      out.push(`- **${term.term}**：${term.explanation}`);
    out.push("");
  }
  out.push("# 常見問題", "");
  for (const item of [...content.faqs, ...content.qas])
    out.push(`## ${item.question}`, "", item.answer, "");
  out.push("# 模擬題", "");
  for (const q of content.questions) {
    out.push(
      `## 第 ${q.number} 題（${q.domainId}，${q.objectiveIds.join("、")}）`,
      "",
      q.question,
      "",
    );
    if (q.type !== "true-false")
      for (const option of q.options) out.push(`- ${option.text}`);
    out.push(
      "",
      `正確答案：${answerText(q)}`,
      "",
      `解析：${q.explanation}`,
      "",
      `常見陷阱：${q.trap}`,
      "",
    );
  }
  return out.join("\n");
}

export function buildStaticSite(content = loadContent()) {
  const pages = [
    ...content.chapters.map(chapterPage),
    ...quizPages(content),
    glossaryPage(content),
    faqPage(content),
    reviewPage(content),
    planPage(content),
    sourcesPage(content),
  ];
  const site = {
    nav: pages.filter((page) => !/^\/quiz\/d\d\/$/.test(page.path)),
    disclaimer: content.meta.disclaimer,
    lastVerified: content.meta.lastVerified,
  };
  const files = new Map();
  for (const page of pages)
    files.set(`${page.path.slice(1)}index.html`, layout(site, page));
  const urls = [`${SITE_URL}/`, ...pages.map((page) => pageUrl(page.path))];
  files.set(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `<url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`,
  );
  files.set("llms.txt", llmsTxt(pages, content));
  files.set("llms-full.txt", llmsFullTxt(content));
  return { pages, files, urls };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const out = join(root, "dist");
  const { files } = buildStaticSite();
  for (const [name, text] of files) {
    mkdirSync(dirname(join(out, name)), { recursive: true });
    writeFileSync(join(out, name), text);
  }
  console.log(`static pages: ${files.size} files`);
}
