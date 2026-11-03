import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { BASELINE } from "../scripts/site.mjs";

const root = new URL("../", import.meta.url);
const baseline = readFileSync(new URL("public/og.png", root));
const others = readdirSync(new URL("exams/", root)).filter(
  (code) => code !== BASELINE,
);

// A new exam that forgets its image would share a link preview that names
// the baseline exam.
for (const code of others) {
  test(`${code} 有自己的分享預覽圖，不沿用 ${BASELINE} 的`, () => {
    const file = new URL(`exams/${code}/og.png`, root);
    assert.ok(existsSync(file), `exams/${code}/og.png is missing`);
    const png = readFileSync(file);
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.ok(!png.equals(baseline), "same bytes as public/og.png");
    // IHDR width/height: link previews expect about 1.91:1.
    const ratio = png.readUInt32BE(16) / png.readUInt32BE(20);
    assert.ok(ratio > 1.8 && ratio < 2, `unexpected ratio ${ratio}`);
  });
}
