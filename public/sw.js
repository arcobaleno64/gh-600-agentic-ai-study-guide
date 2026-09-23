const CACHE = "gh-600-study-guide-dev";
// The production build injects all emitted assets and a content-based cache name.
const ASSETS = [];
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  ...ASSETS,
];
self.addEventListener("install", (e) =>
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([...new Set(SHELL)]))),
);
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("gh-600-study-guide-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  // Keep HTML and bundles from the same installed release. A new worker waits
  // for existing tabs to close before activation; do not force skipWaiting.
  // This cache contains only public static build files. Match the URL used
  // during precaching so Vary: Origin does not miss module/style requests.
  e.respondWith(
    caches
      .open(CACHE)
      .then(
        async (cache) =>
          (await cache.match(r.mode === "navigate" ? "./index.html" : r.url)) ||
          fetch(r),
      ),
  );
});
