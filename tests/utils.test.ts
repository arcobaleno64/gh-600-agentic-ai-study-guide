import assert from "node:assert/strict";
import test from "node:test";
import { decodeRouteParam, downloadJson } from "../src/utils.ts";

test("路由參數解碼正常百分比編碼", () => {
  assert.equal(decodeRouteParam("GH-600%20%E9%A1%8C%E5%BA%AB"), "GH-600 題庫");
});

test("路由參數遇到畸形百分比編碼時安全回退", () => {
  assert.equal(decodeRouteParam("%"), "");
  assert.equal(decodeRouteParam("%E0%A4"), "");
});

test("進度匯出建立具檔名的 JSON 下載", () => {
  let clicked = false;
  let filename = "";
  const originalDocument = globalThis.document;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement: () => ({
        href: "",
        set download(value: string) {
          filename = value;
        },
        click: () => {
          clicked = true;
        },
      }),
    },
  });
  try {
    downloadJson("gh-600-progress.json", { schema: "gh-600-study-progress" });
    assert.equal(clicked, true);
    assert.equal(filename, "gh-600-progress.json");
  } finally {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
    });
  }
});
