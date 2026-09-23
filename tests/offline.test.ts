import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { build } from "vite";

test("正式產物預存完整資源，離線可讀；安裝失敗不強制接管", async () => {
  const result = await build({ build: { write: false }, logLevel: "silent" });
  assert.ok(!Array.isArray(result) && "output" in result);
  const worker = result.output.find((item) => item.fileName === "sw.js");
  assert.ok(
    worker && worker.type === "asset",
    "build 必須產生含資源清單的 sw.js",
  );
  const source = String(worker.source);
  const base = "https://example.test/book/";
  const address = (r: any) =>
    new URL(typeof r === "string" ? r : r.url, base).href;
  const stores = new Map<string, Map<string, unknown>>();
  stores.set("unrelated-app", new Map());
  const events: Record<string, (event: any) => void> = {};
  let failInstall = false;
  let forced = false;
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (key: string) => stores.delete(key),
    open: async (key: string) => {
      if (!stores.has(key)) stores.set(key, new Map());
      const entries = stores.get(key)!;
      return {
        addAll: async (paths: string[]) => {
          if (failInstall) throw new Error("network failure");
          // Cloudflare redirects index.html to "/"; addAll keeps that
          // redirected response, which a navigation must never receive.
          paths.forEach((p) =>
            entries.set(address(p), {
              url: address(p),
              redirected: address(p).endsWith("/index.html"),
            }),
          );
        },
        // Precache requests have no Origin header. Vary: Origin must reject
        // a later browser module/stylesheet request carrying that header.
        match: async (r: any) =>
          r.headers?.get("Origin") ? undefined : entries.get(address(r)),
      };
    },
  };
  vm.runInNewContext(source, {
    URL,
    caches,
    fetch: async () => {
      throw new Error("offline");
    },
    self: {
      location: { origin: new URL(base).origin },
      addEventListener: (name: string, fn: any) => {
        events[name] = fn;
      },
      skipWaiting: () => {
        forced = true;
      },
      clients: { claim: async () => {} },
    },
  });
  let pending: Promise<any>;
  events.install({
    waitUntil: (p: Promise<any>) => {
      pending = p;
    },
  });
  await pending!;
  events.activate({
    waitUntil: (p: Promise<any>) => {
      pending = p;
    },
  });
  await pending!;
  assert.ok(stores.has("unrelated-app"));
  for (const file of result.output.filter(
    (item) => /\.(js|css)$/.test(item.fileName) && item.fileName !== "sw.js",
  )) {
    events.fetch({
      request: {
        method: "GET",
        mode: "cors",
        url: address(file.fileName),
        headers: new Headers({ Origin: new URL(base).origin }),
      },
      respondWith: (p: Promise<any>) => {
        pending = p;
      },
    });
    assert.ok(await pending!, `離線缺少 ${file.fileName}`);
  }
  events.fetch({
    request: { method: "GET", mode: "navigate", url: base },
    respondWith: (p: Promise<any>) => {
      pending = p;
    },
  });
  const page = await pending!;
  assert.ok(page, "離線導覽須有快取頁面");
  assert.equal(page.redirected, false, "導覽不得回應重新導向過的快取");
  failInstall = true;
  events.install({
    waitUntil: (p: Promise<any>) => {
      pending = p;
    },
  });
  await assert.rejects(pending!, /network failure/);
  assert.equal(forced, false);
});
