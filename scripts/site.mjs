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

// One run of consecutive domain links (the list in index.html).
const DOMAIN_RUN =
  /^([ \t]*)<li><a href="\/knowledge\/d\d+\/">[^\n]*<\/a><\/li>(\r?\n)(?:\1<li><a href="\/knowledge\/d\d+\/">[^\n]*<\/a><\/li>\r?\n)*/m;

// Longest value first so a value that contains another one is replaced whole.
export function renderSite(text, to, from = loadSite(BASELINE)) {
  let out = text;
  for (const field of [...TEXT_FIELDS].sort(
    (a, b) => from[b].length - from[a].length,
  ))
    out = out.split(from[field]).join(to[field]);
  // The run of domain links is replaced as a whole, so an exam with fewer or
  // more domains than gh-600 gets exactly its own list.
  return out.replace(DOMAIN_RUN, (_run, indent, eol) =>
    to.domains.map((d) => `${indent}${domainLine(d)}${eol}`).join(""),
  );
}
