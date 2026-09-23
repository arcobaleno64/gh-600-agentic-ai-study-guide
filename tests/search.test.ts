import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as search from "../src/search.ts";
import * as reading from "../src/reading.ts";

const entry = (title: string, body = "", type = "教材", keywords = "") => ({
  title,
  body,
  type,
  keywords,
});

test("同類依完全、開頭、標題包含、識別碼、正文排序，同分保持原順序", () => {
  const data = [
    entry("正文一", "MCP"),
    entry("正文二", "MCP"),
    entry("分類", "", "教材", "MCP"),
    entry("設定 MCP 伺服器"),
    entry("MCP 設定"),
    entry("MCP"),
  ];
  assert.deepEqual(
    search.rankSearch(data, "mcp").items.map((x) => x.title),
    ["MCP", "MCP 設定", "設定 MCP 伺服器", "分類", "正文一", "正文二"],
  );
});

test("教材優先，篩選完整集合後才取 50 筆，回傳未截斷總數", () => {
  const data = [
    entry("MCP", "", "來源"),
    entry("MCP", "", "問答"),
    entry("MCP", "", "題目"),
    entry("MCP", "", "名詞"),
    ...Array.from({ length: 55 }, (_, i) =>
      entry(`導讀${i}`, "MCP", i % 2 ? "教材" : "章節"),
    ),
  ];
  const all = search.rankSearch(data, "MCP");
  assert.equal(all.total, 59);
  assert.equal(all.items.length, 50);
  assert.ok(all.items.every((x) => ["教材", "章節"].includes(x.type)));
  assert.equal(search.rankSearch(data, "MCP", "名詞").items[0]?.type, "名詞");
  assert.equal(search.rankSearch(data, "MCP", "題目").total, 1);
  assert.deepEqual(
    search.rankSearch(data, "MCP", "其他").items.map((x) => x.type),
    ["問答", "來源"],
  );
  assert.deepEqual(
    search.rankSearch(data.slice(0, 5), "MCP").items.map((x) => x.type),
    ["章節", "名詞", "題目", "問答", "來源"],
  );
});

test("大小寫、NFKC、特殊符號使用相同比對與反白，原文完整保留", () => {
  for (const [text, query, expected] of [
    ["使用 ＭＣＰ 與 mcp", "MCP", ["ＭＣＰ", "mcp"]],
    ["A [x].* + $ (a)", "[x].*", ["[x].*"]],
    ["<img onerror=alert(1)>", "<img", ["<img"]],
    ["oﬃce", "ffi", ["ﬃ"]],
    ["e\u0301 與 é", "é", ["e\u0301", "é"]],
    ["😀 MCP", "ＭＣＰ", ["MCP"]],
    ["ㄱㅏx", "x", ["x"]],
    ["ㄱㅏx", "가", ["ㄱㅏ"]],
  ] as const) {
    assert.equal(search.rankSearch([entry(text)], query).total, 1);
    const parts = search.highlightText(text, query);
    assert.equal(parts.map((part) => part.text).join(""), text);
    assert.deepEqual(
      parts.filter((part) => part.match).map((part) => part.text),
      expected,
    );
  }
  assert.deepEqual(search.rankSearch([entry("MCP")], "  "), {
    items: [],
    total: 0,
  });
  assert.equal(search.rankSearch([entry("MCP")], "missing").total, 0);
  assert.deepEqual(search.highlightText("MCP", ""), [
    { text: "MCP", match: false },
  ]);
  assert.deepEqual(search.highlightText("MCP", "missing"), [
    { text: "MCP", match: false },
  ]);
});

test("真實教材 MCP 排序、名詞查找、題幹相關程度及既有呼叫相容", () => {
  const exports: Record<string, any> = {};
  vm.runInNewContext(
    ts.transpileModule(
      readFileSync(new URL("../src/content.ts", import.meta.url), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
    {
      exports,
      require(name: string) {
        if (name === "./search") return search;
        if (name === "./reading") return reading;
        const path = new URL(
          name.replace(/\?raw$/, ""),
          new URL("../src/content.ts", import.meta.url),
        );
        const raw = readFileSync(path, "utf8");
        return { default: name.endsWith("?raw") ? raw : JSON.parse(raw) };
      },
    },
  );
  const results = exports.searchContent("MCP");
  assert.ok(Array.isArray(results));
  assert.ok(
    results.findIndex((x: any) => x.title === "設定 MCP 伺服器") <
      results.findIndex((x: any) => x.param === "start-here"),
  );
  assert.ok(exports.searchContent("MCP", "名詞").length > 0);
  assert.equal(exports.searchContent("GH600-013", "題目")[0].id, "GH600-013");
  const question = exports.questions.find((q: any) => q.id === "GH600-013");
  assert.equal(
    exports.searchContent(question.question, "題目")[0].id,
    question.id,
  );
  assert.equal(exports.searchContent("ＭＣＰ").total, results.total);
  const excerpt = reading.readingExcerpt(
    "前言".repeat(100) + " ＭＣＰ 測試" + "後文".repeat(100),
    "mcp",
  );
  assert.match(excerpt, /ＭＣＰ/);
  const composed = reading.readingExcerpt(
    "a".repeat(50) + "ㄱㅏx" + "b".repeat(100),
    "x",
  );
  assert.ok(composed.startsWith(`…${"a".repeat(26)}`));
  assert.match(composed, /ㄱㅏx/);
});
