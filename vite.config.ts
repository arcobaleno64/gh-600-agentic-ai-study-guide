import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { loadSite, renderSite } from "./scripts/site.mjs";

// One exam per build: EXAM picks exams/<code>/ (default gh-600).
const exam = process.env.EXAM || "gh-600";
const site = loadSite(exam);
// Files that carry the site identity; see scripts/site.mjs.
const siteFile = (name: string) =>
  renderSite(
    readFileSync(new URL(`./public/${name}`, import.meta.url), "utf8"),
    site,
  );
const siteFiles = ["manifest.webmanifest", "robots.txt", "404.html"];
export default defineConfig({
  plugins: [
    vue(),
    {
      name: "exam-site",
      transformIndexHtml: (html: string) => renderSite(html, site),
    },
    {
      // An exam may bring its own social preview image (exams/<code>/og.png);
      // without one the build keeps public/og.png, the gh-600 baseline.
      name: "exam-og-image",
      apply: "build",
      writeBundle(options) {
        const own = new URL(`./exams/${exam}/og.png`, import.meta.url);
        if (existsSync(own))
          copyFileSync(own, join(options.dir ?? "dist", "og.png"));
      },
    },
    {
      name: "textbook-offline-assets",
      apply: "build",
      enforce: "post",
      generateBundle(_options, bundle) {
        const template = readFileSync(
          new URL("./public/sw.js", import.meta.url),
          "utf8",
        );
        const files = Object.keys(bundle)
          .filter((name) => !name.endsWith(".map"))
          .sort();
        const hash = createHash("sha256").update(template);
        for (const name of files) {
          const item = bundle[name];
          hash
            .update(name)
            .update(item.type === "chunk" ? item.code : item.source);
        }
        hash.update(siteFile("manifest.webmanifest"));
        for (const name of ["icon-192.png", "icon-512.png"]) {
          hash.update(
            readFileSync(new URL(`./public/${name}`, import.meta.url)),
          );
        }
        for (const name of siteFiles)
          this.emitFile({
            type: "asset",
            fileName: name,
            source: siteFile(name),
          });
        this.emitFile({
          type: "asset",
          fileName: "sw.js",
          source: renderSite(template, site)
            .replace(
              JSON.stringify(`${site.cachePrefix}-dev`),
              JSON.stringify(
                `${site.cachePrefix}-${hash.digest("hex").slice(0, 16)}`,
              ),
            )
            .replace(
              "const ASSETS = [];",
              `const ASSETS = ${JSON.stringify(files.map((name) => `./${name}`))};`,
            ),
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@exam": fileURLToPath(new URL(`./exams/${exam}`, import.meta.url)),
    },
  },
  base: "./",
  build: { target: "es2022", sourcemap: true },
});
