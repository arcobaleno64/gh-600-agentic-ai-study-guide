import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import { compileScript, parse } from "vue/compiler-sfc";
import * as vue from "vue";
import { readingSections } from "../src/reading.ts";

const require = createRequire(import.meta.url);
function execute(
  source: string,
  imports: Record<string, unknown>,
  globals = {},
) {
  const exports: Record<string, any> = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      structuredClone,
      crypto: globalThis.crypto,
      ...globals,
      require: (name: string) => imports[name] ?? require(name),
    },
  );
  return exports;
}

test("進度寫入失敗保留記憶體資料，恢復寫入後才解除警告", async () => {
  let blocked = true;
  let saved = "";
  const store = execute(
    readFileSync(new URL("../src/store.ts", import.meta.url), "utf8"),
    {},
    {
      localStorage: {
        getItem: () => null,
        setItem: (_key: string, value: string) => {
          if (blocked) throw new Error("QuotaExceededError");
          saved = value;
        },
      },
      matchMedia: () => ({ matches: false, addEventListener() {} }),
      document: { documentElement: { dataset: {}, style: {} } },
    },
  );
  store.toggleDay(1);
  await vue.nextTick();
  assert.equal(store.storageStatus.value, "error");
  assert.deepEqual(Array.from(store.exportProgress().completedDays), [1]);
  blocked = false;
  store.toggleDay(2);
  await vue.nextTick();
  assert.equal(store.storageStatus.value, "saved");
  assert.deepEqual(JSON.parse(saved).completedDays, [1, 2]);
});

test("名詞抽卡遵守篩選，零筆不另抽全庫；下一張收起解釋並聚焦卡片", async () => {
  const source = readFileSync(
    new URL("../src/views/GlossaryView.vue", import.meta.url),
    "utf8",
  );
  const terms = [
    {
      id: "a",
      term: "MCP",
      explanation: "工具介面",
      category: "工具",
      exams: ["GH-600"],
    },
    {
      id: "b",
      term: "Checkpoint",
      explanation: "恢復紀錄",
      category: "恢復",
      exams: ["GH-600"],
    },
  ];
  const script = compileScript(parse(source).descriptor, {
    id: "glossary-test",
  });
  const module = execute(script.content, {
    vue,
    "../content": { terms, glossary: { categories: [] } },
    "../store": { progress: { familiarTerms: [], favoriteTerms: [] } },
    "../router": { route: { param: "" } },
    "../utils": {
      normalize: (s: string) => s.toLowerCase(),
      shuffled: (items: unknown[]) => [...items],
    },
  });
  const scope = vue.effectScope();
  const state = vue.proxyRefs(
    scope.run(() => module.default.setup({}, { expose() {} })),
  );
  let opened = 0;
  let focused = 0;
  state.flashDialog = { showModal: () => opened++ };
  state.flashFace = { focus: () => focused++ };
  try {
    state.query = "missing";
    state.openDeck();
    assert.equal(opened, 0);
    state.query = "MCP";
    state.openDeck();
    assert.equal(opened, 1);
    assert.deepEqual(
      Array.from(state.deck, (t: { id: string }) => t.id),
      ["a"],
    );
    state.reveal = true;
    state.next();
    await vue.nextTick();
    assert.equal(state.reveal, false);
    assert.equal(focused, 1);
    state.query = "";
    state.category = "恢復";
    state.openDeck();
    assert.equal(state.card.id, "b");
  } finally {
    scope.stop();
  }
});

function readerHarness(id: string, section: string) {
  const chapters = ["start-here", "d1", "d2", "d3", "integration"].map(
    (id) => ({
      id,
      title: id,
      raw: readFileSync(
        new URL(`../content/chapters/${id}.md`, import.meta.url),
        "utf8",
      ),
    }),
  );
  const questions = JSON.parse(
    readFileSync(new URL("../data/questions.json", import.meta.url), "utf8"),
  );
  const source = readFileSync(
    new URL("../src/views/KnowledgeView.vue", import.meta.url),
    "utf8",
  );
  const script = compileScript(parse(source).descriptor, { id: "reader-test" });
  const calls: unknown[][] = [];
  const positions: string[] = [];
  const focused: string[] = [];
  const replaced: unknown[][] = [];
  const mounted: (() => void)[] = [];
  const cleanup: (() => void)[] = [];
  const listeners = new Map<string, () => void>();
  const frames = new Map<number, () => void>();
  let serial = 0;
  let disconnected = false;
  const route = vue.reactive({ param: id, query: { section } });
  const win = {
    scrollY: 0,
    innerHeight: 800,
    scrollTo() {},
    addEventListener: (name: string, fn: () => void) => listeners.set(name, fn),
    removeEventListener: (name: string) => listeners.delete(name),
  };
  const sectionIds = readingSections(
    chapters.find((c) => c.id === id)!.raw,
  ).sections.map((s) => s.id);
  const doc = {
    documentElement: { scrollHeight: 10000 },
    querySelector: () => ({ getBoundingClientRect: () => ({ height: 72 }) }),
    getElementById: (target: string) =>
      sectionIds.includes(target.replace("reading-", ""))
        ? {
            getBoundingClientRect: () => ({
              top:
                300 +
                sectionIds.indexOf(target.replace("reading-", "")) * 1000 -
                win.scrollY,
            }),
            scrollIntoView: () => positions.push(target),
            focus: () => focused.push(target),
          }
        : null,
  };
  const module = execute(
    script.content,
    {
      vue: {
        ...vue,
        onMounted: (fn: () => void) => mounted.push(fn),
        onBeforeUnmount: (fn: () => void) => cleanup.push(fn),
      },
      "../content": {
        chapters,
        terms: [],
        sources: [],
        questions,
        examMeta: {},
      },
      "../router": {
        route,
        navigate: (...args: unknown[]) => calls.push(args),
      },
      "../reading": { readingSections },
      "../components/CaseWalkthrough.vue": {},
      "../components/DeliveryTrace.vue": {},
    },
    {
      document: doc,
      window: win,
      URLSearchParams,
      history: {
        state: { existing: true },
        replaceState: (...args: unknown[]) => replaced.push(args),
      },
      requestAnimationFrame: (fn: () => void) => {
        frames.set(++serial, fn);
        return serial;
      },
      cancelAnimationFrame: (id: number) => frames.delete(id),
      ResizeObserver: class {
        observe() {}
        disconnect() {
          disconnected = true;
        }
      },
    },
  );
  const scope = vue.effectScope();
  const state = vue.proxyRefs(
    scope.run(() => module.default.setup({}, { expose() {} })),
  );
  mounted.forEach((fn) => fn());
  return {
    state,
    route,
    calls,
    positions,
    focused,
    replaced,
    win,
    doc,
    listeners,
    frames,
    get disconnected() {
      return disconnected;
    },
    flush() {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((fn) => fn());
    },
    dispose() {
      cleanup.forEach((fn) => fn());
      scope.stop();
    },
  };
}

test("教材解析可展開，原文、來源與程式碼內容維持完整", () => {
  const h = readerHarness("d2", "d2-o1");
  try {
    const html = h.state.render(
      "**情境：** 該重試嗎？\n\n**解析：** 先查副作用。[來源](https://docs.github.com/)\n\n```text\n**解析：** 這是資料。\n```",
    );
    assert.equal((html.match(/class="reading-answer"/g) ?? []).length, 1);
    assert.match(html, /<summary>查看解析<\/summary>/);
    assert.doesNotMatch(html, /<details[^>]*\bopen\b/);
    assert.match(html, /先查副作用/);
    assert.match(html, /href="https:\/\/docs.github.com\/"/);
    assert.match(html, /<pre[^>]*tabindex="0"/);
    assert.match(html, /<pre[^>]*><code[^>]*>\*\*解析：\*\* 這是資料。/);
    assert.match(html, /<p><strong>情境：<\/strong> 該重試嗎？<\/p>/);
  } finally {
    h.dispose();
  }
});

test("同章的表格與程式碼區域名稱唯一，重新渲染保持一致", () => {
  const h = readerHarness("d2", "d2-o1");
  try {
    const renderChapter = () =>
      h.state.parsed.sections
        .map((section: { id: string; raw: string }) =>
          h.state.render(section.raw, section.id),
        )
        .join("");
    const html = renderChapter();
    const names = [...html.matchAll(/role="region" aria-label="([^"]+)"/g)].map(
      (match) => match[1],
    );
    assert.ok(names.some((name) => name.includes("程式碼範例")));
    assert.ok(names.some((name) => name.includes("教材表格")));
    assert.equal(new Set(names).size, names.length);
    assert.equal(renderChapter(), html);
  } finally {
    h.dispose();
  }
});

test("交付推演區分同版驗收、未測情境及發布授權，不讓綠燈代替三者", () => {
  const source = readFileSync(
    new URL("../src/components/DeliveryTrace.vue", import.meta.url),
    "utf8",
  );
  const script = compileScript(parse(source).descriptor, {
    id: "delivery-trace-test",
  });
  const module = execute(script.content, { vue });
  const scope = vue.effectScope();
  const state = vue.proxyRefs(
    scope.run(() => module.default.setup({}, { expose() {} })),
  );
  try {
    for (const version of ["A", "B"]) {
      for (const newline of [false, true]) {
        state.testedVersion = version;
        state.newlineChecked = newline;
        const missing = Number(version !== "B") + Number(!newline);
        assert.equal(state.gaps.length, missing);
        state.action = "review";
        assert.equal(
          state.conclusion,
          missing ? "交付差異，明列缺口" : "交付已核對的差異",
        );
        state.action = "publish";
        assert.equal(state.conclusion, "暫停發布");
        assert.match(state.explanation, /授權|核准/);
      }
    }
    state.reset();
    assert.equal(state.testedVersion, "A");
    assert.equal(state.newlineChecked, false);
    assert.equal(state.action, "review");
    assert.equal(state.gaps.length, 2);
  } finally {
    scope.stop();
  }
});

function walkthroughHarness() {
  const source = readFileSync(
    new URL("../src/components/CaseWalkthrough.vue", import.meta.url),
    "utf8",
  );
  const script = compileScript(parse(source).descriptor, { id: "case-test" });
  const module = execute(script.content, { vue });
  const scope = vue.effectScope();
  const state = vue.proxyRefs(
    scope.run(() => module.default.setup({}, { expose() {} })),
  );
  return { state, dispose: () => scope.stop() };
}

test("案例須先選行動才核對；改選與換段清除舊回饋，重試不重複計數", () => {
  const h = walkthroughHarness();
  try {
    h.state.check();
    assert.equal(h.state.feedback, undefined);
    assert.equal(h.state.reviewed.length, 0);
    h.state.chooseAction(0);
    h.state.check();
    assert.match(h.state.feedback.reason, /超出這次授權/);
    assert.equal(h.state.reviewed.length, 1);
    h.state.chooseAction(1);
    assert.equal(h.state.feedback, undefined);
    h.state.check();
    assert.equal(h.state.feedback.sound, true);
    assert.equal(h.state.reviewed.length, 1);
    h.state.chooseStage(2);
    assert.equal(h.state.stage.id, "d3");
    assert.equal(h.state.selected, null);
    assert.equal(h.state.feedback, undefined);
    h.state.check();
    assert.equal(h.state.reviewed.length, 1);
  } finally {
    h.dispose();
  }
});

test("六段案例的教材連結都對應真實 objective，且各選項回饋可取得", () => {
  const h = walkthroughHarness();
  try {
    assert.deepEqual(
      Array.from(h.state.stages, (stage: { id: string }) => stage.id),
      ["d1", "d2", "d3", "d4", "d5", "d6"],
    );
    for (const stage of h.state.stages) {
      const chapter = readFileSync(
        new URL(`../content/chapters/${stage.id}.md`, import.meta.url),
        "utf8",
      );
      assert.ok(
        readingSections(chapter).sections.some((s) => s.id === stage.section),
      );
      assert.equal(
        stage.choices.filter((choice: { sound?: boolean }) => choice.sound)
          .length,
        1,
      );
      assert.ok(
        stage.choices.every(
          (choice: { reason: string }) => choice.reason.trim() !== "",
        ),
      );
    }
  } finally {
    h.dispose();
  }
});

test("章末前往下一章，不受目前小節影響；最後一章不回跳", async () => {
  for (const [id, section, expected] of [
    ["start-here", "section-1", "d1"],
    ["d2", "d2-o1", "d3"],
    ["d2", "d2-o4", "d3"],
    ["integration", "section-1", undefined],
  ]) {
    const h = readerHarness(id!, section!);
    try {
      await vue.nextTick();
      await vue.nextTick();
      h.state.continueReading();
      assert.deepEqual(h.calls, expected ? [["knowledge", expected]] : []);
    } finally {
      h.dispose();
    }
  }
});

test("捲動追蹤不改路由；尺寸更新節流，離開頁面清理", async () => {
  const h = readerHarness("d2", "d2-o1");
  try {
    await vue.nextTick();
    await vue.nextTick();
    await new Promise<void>((resolve) => setImmediate(resolve));
    h.flush();
    assert.equal(h.state.currentId, "d2-o1");
    h.win.scrollY = 3300;
    h.listeners.get("scroll")!();
    h.listeners.get("scroll")!();
    h.listeners.get("resize")!();
    assert.equal(h.frames.size, 1);
    h.flush();
    assert.equal(h.state.currentId, "d2-o4");
    const nav = {
      scrollLeft: 0,
      getBoundingClientRect: () => ({
        left: 20,
        right: 300,
        bottom: 130,
        height: 58,
      }),
      querySelector: () => ({
        getBoundingClientRect: () => ({ left: 500, right: 650 }),
      }),
    };
    h.state.sectionNav = nav;
    h.listeners.get("resize")!();
    h.flush();
    await vue.nextTick();
    assert.ok(nav.scrollLeft > 0, "縮窄後即使目前小節未變仍保持可見");
    assert.equal(h.win.scrollY, 3300, "橫向顯示小節不得改變垂直位置");
    assert.equal(h.route.query.section, "d2-o1");
    assert.deepEqual(h.calls, []);
    assert.deepEqual(h.replaced, []);
    h.win.scrollY = 0;
    h.state.updatePosition();
    assert.equal(h.state.currentId, "d2-o1");
    h.win.scrollY = 2500;
    h.doc.documentElement.scrollHeight = 3300;
    h.state.updatePosition();
    assert.equal(h.state.currentId, "d2-o4");
    h.listeners.get("scroll")!();
  } finally {
    h.dispose();
  }
  assert.equal(h.listeners.size, 0);
  assert.equal(h.frames.size, 0);
  assert.equal(h.disconnected, true);
});

test("各節題目固定；一般點擊保存來源，修飾鍵保留原生連結", async () => {
  const h = readerHarness("d2", "d2-o4");
  try {
    await vue.nextTick();
    await vue.nextTick();
    assert.equal(h.state.practiceQuestions["d2-o2"], "GH600-013");
    assert.equal(h.state.practiceQuestions["d2-o4"], "GH600-012");
    let prevented = 0;
    const event = {
      button: 0,
      preventDefault() {
        prevented++;
      },
    };
    for (const key of ["ctrlKey", "metaKey", "shiftKey", "altKey"])
      h.state.startPractice({ ...event, [key]: true }, "d2-o2");
    h.state.startPractice({ ...event, button: 1 }, "d2-o2");
    assert.equal(prevented, 0);
    assert.deepEqual(h.calls, []);
    assert.deepEqual(h.replaced, []);
    h.state.startPractice(event, "d2-o2");
    assert.equal(prevented, 1);
    assert.deepEqual(h.calls, [["quiz", "GH600-013"]]);
    assert.equal(h.replaced[0]![2], "#/knowledge/d2?section=d2-o2");
    h.win.scrollY = 3300;
    h.state.updatePosition();
    h.state.startPractice(event, "d2-o4");
    assert.deepEqual(h.calls[1], ["quiz", "GH600-012"]);
  } finally {
    h.dispose();
  }
});

test("相同小節路由重新解析仍定位及聚焦", async () => {
  const h = readerHarness("d2", "d2-o2");
  try {
    await vue.nextTick();
    await vue.nextTick();
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.deepEqual(h.positions, [], "瀏覽器完成目前更新前不搶先定位");
    h.flush();
    h.route.query = { section: "d2-o2" };
    await vue.nextTick();
    await vue.nextTick();
    await vue.nextTick();
    await new Promise<void>((resolve) => setImmediate(resolve));
    h.flush();
    assert.deepEqual(h.positions, ["reading-d2-o2", "reading-d2-o2"]);
    assert.deepEqual(h.focused, h.positions);
  } finally {
    h.dispose();
  }
});
