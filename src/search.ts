import { normalize } from "./utils.ts";

export type SearchFilter = "全部" | "教材" | "名詞" | "題目" | "其他";
export const searchFilters: SearchFilter[] = [
  "全部",
  "教材",
  "名詞",
  "題目",
  "其他",
];

export interface SearchEntry {
  type: string;
  title: string;
  keywords: string;
  body: string;
}

const typeOrder: Record<string, number> = {
  章節: 0,
  教材: 0,
  名詞: 1,
  題目: 2,
  問答: 3,
  來源: 4,
};

export function rankSearch<T extends SearchEntry>(
  entries: readonly T[],
  query: string,
  filter: SearchFilter = "全部",
) {
  const q = normalize(query.trim());
  const matches = q
    ? entries
        .map((entry, index) => {
          const title = normalize(entry.title);
          const score =
            title === q
              ? 0
              : title.startsWith(q)
                ? 1
                : title.includes(q)
                  ? 2
                  : normalize(entry.keywords).includes(q)
                    ? 3
                    : normalize(entry.body).includes(q)
                      ? 4
                      : -1;
          return { entry, index, score, group: typeOrder[entry.type] ?? 4 };
        })
        .filter(
          ({ entry, score, group }) =>
            score >= 0 &&
            (filter === "全部" ||
              (filter === "教材"
                ? group === 0
                : filter === "其他"
                  ? group >= 3
                  : entry.type === filter)),
        )
        .sort(
          (a, b) => a.group - b.group || a.score - b.score || a.index - b.index,
        )
    : [];
  return {
    items: matches.slice(0, 50).map(({ entry }) => entry),
    total: matches.length,
  };
}

// Decompose first, then group the normalized graphemes before mapping them
// back. NFKC can compose across original grapheme boundaries (e.g. ㄱ + ㅏ).
export function matchRanges(text: string, query: string) {
  const q = normalize(query.trim());
  const normalized = normalize(text);
  if (!q || !normalized.includes(q)) return [];
  const decomposedOffsets: { start: number; end: number }[] = [];
  let decomposed = "";
  for (const { segment, index } of new Intl.Segmenter("zh-TW", {
    granularity: "grapheme",
  }).segment(text)) {
    const expansion = segment.toLocaleLowerCase("zh-TW").normalize("NFKD");
    decomposed += expansion;
    for (let i = 0; i < expansion.length; i++) {
      decomposedOffsets.push({ start: index, end: index + segment.length });
    }
  }
  const offsets: { start: number; end: number }[] = [];
  for (const { segment, index } of new Intl.Segmenter("zh-TW", {
    granularity: "grapheme",
  }).segment(decomposed)) {
    const start = decomposedOffsets[index]!.start;
    const end = decomposedOffsets[index + segment.length - 1]!.end;
    for (let i = 0; i < segment.normalize("NFC").length; i++) {
      offsets.push({ start, end });
    }
  }
  const ranges: { start: number; end: number }[] = [];
  for (
    let at = normalized.indexOf(q);
    at >= 0;
    at = normalized.indexOf(q, at + q.length)
  ) {
    const start = offsets[at]!.start;
    const end = offsets[at + q.length - 1]!.end;
    const previous = ranges[ranges.length - 1];
    if (previous && start <= previous.end)
      previous.end = Math.max(previous.end, end);
    else ranges.push({ start, end });
  }
  return ranges;
}

export function highlightText(text: string, query: string) {
  const parts: { text: string; match: boolean }[] = [];
  let start = 0;
  for (const range of matchRanges(text, query)) {
    if (start < range.start)
      parts.push({ text: text.slice(start, range.start), match: false });
    parts.push({ text: text.slice(range.start, range.end), match: true });
    start = range.end;
  }
  if (start < text.length)
    parts.push({ text: text.slice(start), match: false });
  return parts;
}
