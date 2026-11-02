import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { loadSite, renderSite } from "../scripts/site.mjs";

const files = [
  "index.html",
  "public/manifest.webmanifest",
  "public/robots.txt",
  "public/404.html",
];
const read = (name: string) =>
  readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
const exams = readdirSync(new URL("../exams/", import.meta.url));

test("gh-600 建置不改動任何帶有網站名稱的檔案", () => {
  const site = loadSite("gh-600");
  for (const name of files)
    assert.equal(renderSite(read(name), site), read(name), name);
});

test("每個考試的網站名稱、網址與領域清單都換成自己的，沒有殘留 GH-600", () => {
  for (const code of exams.filter((name) => name !== "gh-600")) {
    const site = loadSite(code);
    for (const name of files) {
      const out = renderSite(read(name), site);
      assert.ok(!/gh-?600/i.test(out), `${code} ${name} 殘留 GH-600`);
    }
    const index = renderSite(read("index.html"), site);
    assert.ok(index.includes(site.siteUrl), `${code} 的網址`);
    for (const domain of site.domains)
      assert.ok(
        index.includes(`${domain.id} ${domain.name}`),
        `${code} ${domain.id}`,
      );
  }
});

test("每個考試都有完整的 site.json 欄位", () => {
  const keys = [
    "siteUrl",
    "siteName",
    "shortName",
    "brand",
    "footer",
    "metaDescription",
    "summary",
    "cachePrefix",
    "quest",
  ];
  for (const code of exams) {
    const site = loadSite(code) as Record<string, unknown>;
    for (const key of keys)
      assert.notEqual(site[key], undefined, `${code}.${key}`);
    assert.ok(
      String(site.brand).startsWith(String(site.code)),
      `${code} brand`,
    );
  }
});
