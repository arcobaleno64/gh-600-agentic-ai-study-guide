import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  SITE_URL,
  answerText,
  buildStaticSite,
  loadContent,
} from "../scripts/static-pages.mjs";

// The read-only pages are what crawlers and answer engines see; the hash app
// at "/" is invisible to them. These tests guard what those readers get.
const content = loadContent();
const { pages, files, urls } = buildStaticSite(content);
const html = (path: string) =>
  files.get(`${path.slice(1)}index.html`) as string;
const allHtml = pages.map((page) => html(page.path)).join("\n");
const escape = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

test("每一章、每個名詞、每則問答與每一題都有不需 JavaScript 的頁面", () => {
  for (const chapter of content.chapters)
    assert.ok(files.has(`knowledge/${chapter.id}/index.html`), chapter.id);
  const missing = [
    ...content.glossary.categories.flatMap((c: { terms: { term: string }[] }) =>
      c.terms.map((t) => t.term),
    ),
    ...[...content.faqs, ...content.qas].map(
      (item: { question: string }) => item.question,
    ),
    ...content.questions.map((q: { question: string }) => q.question),
  ].filter((text) => !allHtml.includes(escape(text)));
  assert.deepEqual(missing, []);
});

test("題目頁寫出正確答案的文字，不是隨機排列後會失效的代號", () => {
  const page = html("/quiz/d1/");
  const first = content.questions.find(
    (q: { domainId: string }) => q.domainId === "D1",
  );
  assert.equal(answerText(first), "可以驗證的驗收條件；不得修改的檔案與行為");
  assert.ok(page.includes(`正確答案：</strong>${escape(answerText(first))}`));
  const tf = content.questions.find(
    (q: { type: string }) => q.type === "true-false",
  );
  assert.match(answerText(tf), /^(正確|錯誤)$/);
});

test("站內連結都指向產生的頁面、首頁或互動版的 hash 路由", () => {
  const known = new Set([...pages.map((page) => page.path), "/"]);
  const assets = new Set(["/static.css", "/icon-192.png"]);
  const broken = [...allHtml.matchAll(/href="(\/[^"]*)"/g)]
    .map(([, href]) => href)
    .filter(
      (href) =>
        !href.startsWith("/#/") && !known.has(href) && !assets.has(href),
    );
  assert.deepEqual([...new Set(broken)], []);
  const fallback = readFileSync(
    new URL("../index.html", import.meta.url),
    "utf8",
  );
  const fallbackBroken = [...fallback.matchAll(/<a href="(\/[^"]*)"/g)]
    .map(([, href]) => href)
    .filter((href) => !known.has(href));
  assert.deepEqual(fallbackBroken, []);
});

test("sitemap 與 llms.txt 列出的網址剛好是首頁加上所有產生的頁面", () => {
  const expected = [
    `${SITE_URL}/`,
    ...pages.map((page) => `${SITE_URL}${page.path}`),
  ].sort();
  assert.deepEqual([...urls].sort(), expected);
  const sitemap = [
    ...(files.get("sitemap.xml") as string).matchAll(/<loc>([^<]+)<\/loc>/g),
  ].map(([, url]) => url);
  assert.deepEqual(sitemap.sort(), expected);
  for (const url of expected)
    assert.match(url, /\/$/, `${url} 需以 / 結尾，避免轉址`);
  const llms = files.get("llms.txt") as string;
  for (const page of pages)
    assert.ok(llms.includes(`(${SITE_URL}${page.path})`), page.path);
});

test("canonical 指向自己，JSON-LD 可解析且關不掉 script 區塊", () => {
  for (const page of pages) {
    const text = html(page.path);
    assert.ok(
      text.includes(`<link rel="canonical" href="${SITE_URL}${page.path}">`),
      page.path,
    );
    const block = text.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    assert.ok(block, page.path);
    assert.ok(!block[1].includes("<"), page.path);
    assert.equal(JSON.parse(block[1]).url, `${SITE_URL}${page.path}`);
  }
});

test("資料中的 HTML 字元會被跳脫", () => {
  const tampered = structuredClone(content);
  tampered.faqs[0].question = '<img src=x onerror="alert(1)">';
  const page = buildStaticSite(tampered).files.get("faq/index.html") as string;
  assert.ok(!page.includes("<img src=x"));
  assert.ok(page.includes("&lt;img src=x"));
});

test("首頁、robots.txt 與產生器使用同一個正式網址", () => {
  const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.ok(
    new RegExp(`rel="canonical"\\s+href="${SITE_URL}/"`).test(index),
    "index.html 的 canonical",
  );
  assert.ok(index.includes(`content="${SITE_URL}/og.png"`));
  const robots = readFileSync(
    new URL("../public/robots.txt", import.meta.url),
    "utf8",
  );
  assert.ok(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
});
