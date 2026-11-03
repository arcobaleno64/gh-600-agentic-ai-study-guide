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

// A new exam does not have to have six domains.
for (const count of [5, 7]) {
  test(`${count} 個領域的考試，首頁領域清單剛好是自己的 ${count} 項`, () => {
    const base = loadSite("gh-500");
    const domains = Array.from({ length: count }, (_, i) => ({
      id: `D${i + 1}`,
      name: `第 ${i + 1} 領域`,
    }));
    const index = renderSite(read("index.html"), { ...base, domains });
    const links = index.match(/<li><a href="\/knowledge\/d\d+\/">/g) ?? [];
    assert.equal(links.length, count);
    assert.ok(!index.includes("準備代理架構"), "殘留 GH-600 的領域名稱");
    assert.ok(index.includes(`D${count} 第 ${count} 領域`));
  });
}

// The deploy workflow publishes each exam to its own Worker and its own
// custom domain; siteUrl must be that domain or the canonical and og URLs
// point somewhere else than the site that was deployed.
test("每個考試的網址就是它部署的自訂網域，且各考試不重複", () => {
  const domains = new Set<string>();
  for (const code of exams) {
    const site = loadSite(code) as {
      workerName: string;
      domain: string;
      siteUrl: string;
    };
    assert.ok(site.workerName, `${code} 缺少 workerName`);
    assert.ok(
      site.domain.endsWith(".satenvision.com"),
      `${code} 的 domain 不在 satenvision.com`,
    );
    assert.equal(
      site.siteUrl,
      `https://${site.domain}`,
      `${code} 的網址與 domain 不一致`,
    );
    assert.ok(!domains.has(site.domain), `${code} 的 domain 與其他考試重複`);
    domains.add(site.domain);
  }
});
