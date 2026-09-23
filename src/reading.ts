import { lexer } from "marked";
import { matchRanges } from "./search.ts";

export function readingSections(markdown: string) {
  const sections: {
    id: string;
    title: string;
    objectiveId: string;
    raw: string;
  }[] = [];
  let introduction = "";
  for (const token of lexer(markdown)) {
    if (token.type === "heading" && token.depth === 1) continue;
    if (token.type === "heading" && token.depth === 2) {
      const objectiveId = token.text.match(/^D\d+-O\d+\b/)?.[0] ?? "";
      sections.push({
        id: objectiveId.toLowerCase() || `section-${sections.length + 1}`,
        title: token.text.replace(/^D\d+-O\d+\s*/, ""),
        objectiveId,
        raw: "",
      });
    } else if (sections.length) {
      sections[sections.length - 1]!.raw += token.raw;
    } else {
      introduction += token.raw;
    }
  }
  return { introduction, sections };
}

export function readingExcerpt(markdown: string, query: string) {
  const plain = markdown
    .replace(/[#*`>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const found = matchRanges(plain, query)[0]?.start ?? -1;
  const start = Math.max(0, found - 28);
  return `${start ? "…" : ""}${plain.slice(start, start + 120)}${plain.length > start + 120 ? "…" : ""}`;
}
