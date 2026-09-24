import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

// WCAG 2.2 AA contrast for the text/background pairs the design tokens promise.
// Both themes are read from src/styles.css so a token change cannot silently
// ship unreadable text (white on the light dark-theme primary did once).
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

function block(selector: string) {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `找不到 ${selector} 區塊`);
  return css.slice(start, css.indexOf("}", start));
}
function tokens(body: string) {
  const out: Record<string, string> = {};
  for (const [, name, value] of body.matchAll(/--([\w-]+):\s*([^;]+);/g))
    out[name] = value.trim();
  return out;
}
const light = tokens(block(":root"));
const themes = {
  light,
  dark: { ...light, ...tokens(block(':root[data-theme="dark"]')) },
};

type Rgb = [number, number, number];
function resolve(value: string, set: Record<string, string>): string {
  const ref = value.match(/^var\(--([\w-]+)\)$/);
  return ref ? resolve(set[ref[1]], set) : value;
}
function rgb(value: string): Rgb {
  const hex = value.replace("#", "");
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
  assert.match(full, /^[0-9a-f]{6}$/i, `不是 hex 色碼：${value}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb;
}
// color-mix(in srgb, a p%, b): interpolates the gamma-encoded channels.
function mix(a: Rgb, b: Rgb, p: number): Rgb {
  return a.map((v, i) => v * p + b[i] * (1 - p)) as Rgb;
}
function luminance([r, g, b]: Rgb) {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function ratio(a: Rgb, b: Rgb) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [foreground, background, where it is used]
const pairs: [string, string, string][] = [
  ["text", "bg", "內文"],
  ["text", "surface", "卡片內文"],
  ["soft", "surface", "次要說明"],
  ["faint", "surface", "eyebrow 與小字"],
  ["faint", "bg", "頁面小字"],
  ["primary", "bg", "連結"],
  ["primary", "surface", "卡片內連結"],
  ["on-primary", "primary", "主要按鈕"],
  ["on-primary", "primary2", "主要按鈕 hover"],
  ["on-danger", "danger", "危險按鈕"],
  ["success", "success-soft", "答對標記"],
  ["danger", "danger-soft", "答錯標記"],
  ["warning", "warning-soft", "未作答標記"],
];

for (const [name, set] of Object.entries(themes)) {
  test(`${name} 主題的文字對比符合 WCAG AA 4.5:1`, () => {
    const failures = pairs
      .map(([fg, bg, use]) => {
        assert.ok(set[fg] && set[bg], `${name} 缺少 --${fg} 或 --${bg}`);
        const value = ratio(
          rgb(resolve(set[fg], set)),
          rgb(resolve(set[bg], set)),
        );
        return { use, fg, bg, value };
      })
      .filter((pair) => pair.value < 4.5)
      .map((p) => `${p.use}（--${p.fg} on --${p.bg}）${p.value.toFixed(2)}:1`);
    assert.deepEqual(failures, []);
  });

  test(`${name} 主題的強調 badge 對比符合 WCAG AA`, () => {
    const rule = css.match(
      /\.badge--accent\s*\{[^}]*color:\s*color-mix\(in srgb, var\(--accent\) (\d+)%, var\(--text\)\)/,
    );
    assert.ok(rule, ".badge--accent 的文字色不再是 accent 與 text 的混色");
    const fg = mix(rgb(set.accent), rgb(set.text), Number(rule[1]) / 100);
    const value = ratio(fg, rgb(set["accent-soft"]));
    assert.ok(value >= 4.5, `強調 badge ${value.toFixed(2)}:1`);
  });
}

test("填滿主色或危險色的元件不寫死白色文字", () => {
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const offenders = rules
    .filter(
      ([, , body]) =>
        /background:\s*var\(--(primary2?|danger)\)/.test(body) &&
        /(^|[\s;])color:\s*(#fff\b|#ffffff\b|white\b)/.test(body),
    )
    .map(([, selector]) => selector.trim());
  assert.deepEqual(offenders, []);
});
