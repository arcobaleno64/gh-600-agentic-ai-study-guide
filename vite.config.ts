import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
export default defineConfig({
  plugins: [
    vue(),
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
        for (const name of [
          "manifest.webmanifest",
          "icon-192.png",
          "icon-512.png",
        ]) {
          hash.update(
            readFileSync(new URL(`./public/${name}`, import.meta.url)),
          );
        }
        this.emitFile({
          type: "asset",
          fileName: "sw.js",
          source: template
            .replace(
              '"gh-600-study-guide-dev"',
              JSON.stringify(
                `gh-600-study-guide-${hash.digest("hex").slice(0, 16)}`,
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
  base: "./",
  build: { target: "es2022", sourcemap: true },
});
