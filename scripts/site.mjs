// Per-exam site identity (exams/<code>/data/site.json). The files committed in
// index.html and public/ are the gh-600 baseline; renderSite swaps every gh-600
// value in a text for the target exam's value, so a gh-600 build is unchanged.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "./exam.mjs";

export const BASELINE = "gh-600";
const readJson = (code, name) =>
  JSON.parse(readFileSync(join(repoRoot, "exams", code, "data", name), "utf8"));

export function loadSite(code) {
  return {
    ...readJson(code, "site.json"),
    code: readJson(code, "exam-meta.json").exam.code,
    domains: readJson(code, "exam-meta.json").exam.domains,
  };
}

const TEXT_FIELDS = [
  "siteUrl",
  "siteName",
  "shortName",
  "brand",
  "footer",
  "metaDescription",
  "summary",
  "cachePrefix",
];
const domainLine = (d) =>
  `<li><a href="/knowledge/${d.id.toLowerCase()}/">${d.id} ${d.name}</a></li>`;

// Longest value first so a value that contains another one is replaced whole.
export function renderSite(text, to, from = loadSite(BASELINE)) {
  let out = text;
  for (const field of [...TEXT_FIELDS].sort(
    (a, b) => from[b].length - from[a].length,
  ))
    out = out.split(from[field]).join(to[field]);
  from.domains.forEach((d, i) => {
    if (to.domains[i])
      out = out.split(domainLine(d)).join(domainLine(to.domains[i]));
  });
  return out;
}
