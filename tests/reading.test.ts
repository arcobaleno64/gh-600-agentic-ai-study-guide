import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { readingSections, readingExcerpt } from "../src/reading.ts";

test("章節目錄保留教材順序、考試目標及全文", () => {
  const raw = readFileSync(
    new URL("../content/chapters/d2.md", import.meta.url),
    "utf8",
  );
  const { sections } = readingSections(raw);
  assert.deepEqual(
    sections.map((section) => section.id),
    ["d2-o1", "d2-o2", "d2-o3", "d2-o4"],
  );
  assert.equal(sections[1]!.title, "設定 MCP 伺服器");
  assert.match(sections[1]!.raw, /GH-DOC-09/);
  assert.match(sections[3]!.raw, /rollback/);
});

test("程式碼區塊的標題不會被拆成小節，重複標題仍有不同位置", () => {
  const raw =
    "# 書名\n\n導讀\n\n## 範例\n\n```md\n## 程式碼\n```\n\n### 細節\n\n保留\n\n## 範例\n\n結語";
  const result = readingSections(raw);
  assert.match(result.introduction, /導讀/);
  assert.deepEqual(
    result.sections.map((section) => section.id),
    ["section-1", "section-2"],
  );
  assert.match(result.sections[0]!.raw, /## 程式碼/);
  assert.match(result.sections[0]!.raw, /### 細節/);
  assert.match(result.sections[1]!.raw, /結語/);
});

test("搜尋摘要顯示命中位置附近的文字，英文不區分大小寫", () => {
  const excerpt = readingExcerpt(
    "前言".repeat(100) +
      " 使用 MCP 工具，限定可讀取的資源。" +
      "後文".repeat(100),
    "mcp",
  );
  assert.match(excerpt, /使用 MCP 工具/);
  assert.ok(excerpt.startsWith("…"));
  assert.ok(excerpt.endsWith("…"));
  assert.ok(excerpt.length <= 122);
});
