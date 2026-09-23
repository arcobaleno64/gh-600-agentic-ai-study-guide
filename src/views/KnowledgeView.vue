<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
} from "vue";
import { marked, Renderer } from "marked";
import { chapters, examMeta, questions, sources, terms } from "../content";
import { navigate, route } from "../router";
import { readingSections } from "../reading";

const active = computed(
  () => chapters.find((chapter) => chapter.id === route.param) ?? chapters[0]!,
);
const chapterIndex = computed(() => chapters.indexOf(active.value));
const chapterLabel = computed(() =>
  chapterIndex.value === 0
    ? "導讀"
    : chapterIndex.value === chapters.length - 1
      ? "附錄"
      : `第 ${chapterIndex.value} 章`,
);
const parsed = computed(() => readingSections(active.value.raw));
const currentId = ref("");
const sectionNav = ref<HTMLElement | null>(null);
const headerHeight = ref(0);
const navHeight = ref(0);
const practiceQuestions = computed(() =>
  Object.fromEntries(
    parsed.value.sections.map((section) => [
      section.id,
      section.objectiveId
        ? questions.find((question) =>
            question.objectiveIds.includes(section.objectiveId),
          )?.id
        : undefined,
    ]),
  ),
);
let frame = 0;
let navigationFrame = 0;
let disposed = false;
let observer: ResizeObserver | undefined;
function measureNavigation() {
  headerHeight.value =
    document.querySelector(".book-header")?.getBoundingClientRect().height ?? 0;
  navHeight.value = sectionNav.value?.getBoundingClientRect().height ?? 0;
}
function revealCurrent() {
  const nav = sectionNav.value;
  const link = nav?.querySelector<HTMLElement>("[aria-current]");
  if (!nav || !link) return;
  const box = nav.getBoundingClientRect();
  const item = link.getBoundingClientRect();
  if (item.left < box.left) nav.scrollLeft += item.left - box.left;
  else if (item.right > box.right)
    nav.scrollLeft += Math.min(item.right - box.right, item.left - box.left);
}
function updatePosition() {
  frame = 0;
  measureNavigation();
  const line =
    (sectionNav.value?.getBoundingClientRect().bottom ?? headerHeight.value) +
    16;
  let id = parsed.value.sections[0]?.id ?? "";
  for (const section of parsed.value.sections) {
    const target = document.getElementById(`reading-${section.id}`);
    if (target && target.getBoundingClientRect().top <= line + 1)
      id = section.id;
  }
  if (
    window.scrollY > 0 &&
    window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 2
  ) {
    id = parsed.value.sections.at(-1)?.id ?? id;
  }
  currentId.value = id;
  nextTick(() => {
    if (!disposed) revealCurrent();
  });
}
function schedulePosition() {
  if (!frame) frame = requestAnimationFrame(updatePosition);
}
function ordinaryClick(event: MouseEvent) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
function chooseSection(event: MouseEvent, id: string) {
  if (!ordinaryClick(event)) return;
  event.preventDefault();
  navigate("knowledge", active.value.id, { section: id });
}
function startPractice(event: MouseEvent, id: string) {
  if (!ordinaryClick(event)) return;
  const question = practiceQuestions.value[id];
  if (!question) return;
  event.preventDefault();
  const query = new URLSearchParams({ ...route.query, section: id });
  history.replaceState(
    history.state,
    "",
    `#/knowledge/${active.value.id}?${query}`,
  );
  navigate("quiz", question);
}
onMounted(() => {
  measureNavigation();
  observer = new ResizeObserver(schedulePosition);
  const header = document.querySelector(".book-header");
  if (header) observer.observe(header);
  if (sectionNav.value) observer.observe(sectionNav.value);
  window.addEventListener("scroll", schedulePosition, { passive: true });
  window.addEventListener("resize", schedulePosition);
  schedulePosition();
});
onBeforeUnmount(() => {
  disposed = true;
  cancelAnimationFrame(frame);
  cancelAnimationFrame(navigationFrame);
  observer?.disconnect();
  window.removeEventListener("scroll", schedulePosition);
  window.removeEventListener("resize", schedulePosition);
});
const nextChapter = computed(() => chapters[chapterIndex.value + 1]);
const selectedTerm = ref("");
const relatedTerms = computed(() =>
  terms
    .filter((term) => {
      const english = term.term.match(/^[^(（]+/)?.[0].trim() ?? term.term;
      return (
        active.value.raw
          .toLocaleLowerCase()
          .includes(english.toLocaleLowerCase()) ||
        active.value.raw.includes(
          term.term.match(/[（(](.*?)[）)]/)?.[1] || term.term,
        )
      );
    })
    .slice(0, 6),
);
const chapterSources = computed(() =>
  sources.filter((source) => active.value.raw.includes(source.id)),
);
const renderer = new Renderer();
renderer.link = ({ href, title, text }) =>
  `<a href="${href}" ${title ? `title="${title}"` : ""} target="_blank" rel="noopener">${text}</a>`;
renderer.table = ({ header, rows }) =>
  `<div class="markdown-table" tabindex="0" role="region" aria-label="教材表格，可左右捲動"><table><thead>${renderer.tablerow({ text: header.map((cell) => renderer.tablecell(cell)).join("") })}</thead><tbody>${rows.map((row) => renderer.tablerow({ text: row.map((cell) => renderer.tablecell(cell)).join("") })).join("")}</tbody></table></div>`;
function render(raw: string) {
  return marked.parse(raw, { renderer });
}
function continueReading() {
  if (nextChapter.value) navigate("knowledge", nextChapter.value.id);
}
watch(
  () => [active.value.id, route.query],
  async () => {
    cancelAnimationFrame(navigationFrame);
    selectedTerm.value = "";
    currentId.value =
      parsed.value.sections.find(
        (section) => section.id === route.query.section,
      )?.id ||
      parsed.value.sections[0]?.id ||
      "";
    await nextTick();
    if (disposed) return;
    measureNavigation();
    await nextTick();
    if (disposed) return;
    // Wait for the browser's history/layout work before applying section focus.
    navigationFrame = requestAnimationFrame(() => {
      if (disposed) return;
      const target =
        route.query.section &&
        document.getElementById(`reading-${route.query.section}`);
      if (target) {
        target.scrollIntoView({ behavior: "instant", block: "start" });
        target.focus({ preventScroll: true });
      } else window.scrollTo({ top: 0, behavior: "instant" });
      schedulePosition();
    });
  },
  { immediate: true },
);
</script>

<template>
  <section
    class="textbook-reader"
    :style="{
      '--reading-header-height': `${headerHeight}px`,
      '--reading-offset': `${headerHeight + navHeight + 16}px`,
    }"
  >
    <nav class="reading-breadcrumb" aria-label="目前位置">
      <a href="#/knowledge/start-here">全書導讀</a>
      <span aria-hidden="true">/</span><span>{{ chapterLabel }}</span>
      <span v-if="chapterIndex > 0" aria-hidden="true">/</span>
      <span v-if="chapterIndex > 0">{{ active.title }}</span>
    </nav>
    <nav ref="sectionNav" class="reading-sections" aria-label="本章小節">
      <a
        v-for="(section, index) in parsed.sections"
        :key="section.id"
        :href="`#/knowledge/${active.id}?section=${section.id}`"
        :aria-current="currentId === section.id ? 'location' : undefined"
        @click="chooseSection($event, section.id)"
      >
        <span>{{ String(index + 1).padStart(2, "0") }}</span
        >{{ section.title }}
      </a>
    </nav>
    <div class="reading-layout">
      <article class="reading-article">
        <header class="reading-title">
          <p>{{ chapterLabel }}<span>AGENTIC AI DEVELOPER</span></p>
          <h1>{{ active.title }}</h1>
          <p class="reading-deck">
            {{
              chapterIndex === 0
                ? "從 GitHub 與 Copilot，走向代理系統的設計與實作。"
                : "本章內容與考試目標對照"
            }}
          </p>
        </header>
        <div
          v-if="parsed.introduction.trim()"
          class="markdown-body"
          v-html="render(parsed.introduction)"
        ></div>
        <section
          v-for="section in parsed.sections"
          :id="`reading-${section.id}`"
          :key="section.id"
          class="reading-section"
          :data-section="section.id"
          tabindex="-1"
        >
          <h2>{{ section.title }}</h2>
          <div class="markdown-body" v-html="render(section.raw)"></div>
          <a
            v-if="practiceQuestions[section.id]"
            class="reading-practice"
            :href="`#/quiz/${practiceQuestions[section.id]}`"
            @click="startPractice($event, section.id)"
            >練習本節題目<span class="sr-only">：{{ section.title }}</span></a
          >
        </section>
      </article>
      <aside class="reading-margin" aria-label="閱讀輔助">
        <section v-if="relatedTerms.length">
          <h2>本章詞彙</h2>
          <ul class="margin-terms">
            <li v-for="term in relatedTerms" :key="term.id">
              <button
                :aria-expanded="selectedTerm === term.id"
                :aria-controls="`term-${term.id}`"
                @click="selectedTerm = selectedTerm === term.id ? '' : term.id"
              >
                {{ term.term }}
              </button>
              <p v-if="selectedTerm === term.id" :id="`term-${term.id}`">
                {{ term.explanation }}
              </p>
            </li>
          </ul>
        </section>
        <section v-if="chapterIndex === 0">
          <h2>給讀者</h2>
          <p>
            如果你已熟悉 GitHub 與
            Copilot，可以從第一章開始，依序閱讀代理的工具、狀態、評估與協作。
          </p>
          <a href="#/knowledge/d1">開始第一章</a>
        </section>
        <section v-else>
          <h2>閱讀與練習</h2>
          <p>
            讀完各節後，可用節末的「練習本節題目」檢查理解。遇到不熟悉的概念，可展開詞彙說明。
          </p>
        </section>
        <section>
          <details>
            <summary>
              本章來源 <span>{{ chapterSources.length }}</span>
            </summary>
            <ul class="margin-sources">
              <li v-for="source in chapterSources" :key="source.id">
                <a :href="source.url" target="_blank" rel="noopener">{{
                  source.title
                }}</a>
              </li>
            </ul>
          </details>
          <small>資料基準：{{ examMeta.lastVerified }}</small>
        </section>
      </aside>
    </div>
    <footer class="reading-next">
      <div>
        <strong>{{ nextChapter ? "接著閱讀" : "全書閱讀完成" }}</strong>
        <p>
          {{
            nextChapter?.title || "你已讀到全書最後一章，可回顧重點或開始練習。"
          }}
        </p>
      </div>
      <button
        v-if="nextChapter"
        class="button button--primary"
        @click="continueReading"
      >
        閱讀下一章
      </button>
      <a v-else class="button button--primary" href="#/quiz">開始練習</a>
    </footer>
  </section>
</template>
