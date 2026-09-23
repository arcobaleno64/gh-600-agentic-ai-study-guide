<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type Component,
} from "vue";
import { cycleTheme, progress, storageStatus } from "./store";
import { route, routeTitles } from "./router";
import DashboardView from "./views/DashboardView.vue";
import PlanView from "./views/PlanView.vue";
import KnowledgeView from "./views/KnowledgeView.vue";
import GlossaryView from "./views/GlossaryView.vue";
import QuizView from "./views/QuizView.vue";
import FaqView from "./views/FaqView.vue";
import ReviewView from "./views/ReviewView.vue";
import SourcesView from "./views/SourcesView.vue";
import SettingsView from "./views/SettingsView.vue";
import SearchOverlay from "./components/SearchOverlay.vue";
import ToastHost from "./components/ToastHost.vue";
import { showToast } from "./toast";
import { chapters, examMeta } from "./content";
import type { RouteName } from "./types";

const menu = ref<HTMLDialogElement | null>(null);
const searchOpen = ref(false);
const online = ref(navigator.onLine);
const installPrompt = ref<Event | null>(null);
const views: Record<RouteName, Component> = {
  dashboard: DashboardView,
  plan: PlanView,
  knowledge: KnowledgeView,
  glossary: GlossaryView,
  quiz: QuizView,
  faq: FaqView,
  review: ReviewView,
  sources: SourcesView,
  settings: SettingsView,
};
const currentView = computed(() => views[route.name]);
const title = computed(() => routeTitles[route.name]);
const themeLabels: Record<string, string> = {
  system: "跟隨系統",
  light: "淺色",
  dark: "深色",
};
const themeLabel = computed(
  () => themeLabels[progress.theme] ?? progress.theme,
);
const nav = [
  { name: "dashboard" as RouteName, label: "總覽", icon: "總" },
  { name: "plan" as RouteName, label: "四週計畫", icon: "週" },
  { name: "knowledge" as RouteName, label: "必備知識", icon: "知" },
  { name: "glossary" as RouteName, label: "名詞庫", icon: "詞" },
  { name: "quiz" as RouteName, label: "模擬題", icon: "題" },
  { name: "faq" as RouteName, label: "FAQ／Q&A", icon: "問" },
  { name: "review" as RouteName, label: "考前速查", icon: "查" },
  { name: "sources" as RouteName, label: "官方來源", icon: "源" },
  { name: "settings" as RouteName, label: "設定", icon: "設" },
];
watch(
  () => [route.name, route.param],
  () => {
    menu.value?.close();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  },
);
function onKey(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchOpen.value = true;
  }
  if (event.key === "Escape") {
    searchOpen.value = false;
    menu.value?.close();
  }
}
function updateOnline() {
  online.value = navigator.onLine;
}
function closeMenuBackdrop(event: MouseEvent) {
  if (event.target !== menu.value) return;
  const box = menu.value!.getBoundingClientRect();
  if (
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom
  )
    menu.value?.close();
}
function focusReading() {
  document.getElementById("main-content")?.focus();
}
function captureInstall(event: Event) {
  event.preventDefault();
  installPrompt.value = event;
}
async function install() {
  const prompt = installPrompt.value as Event & {
    prompt?: () => Promise<void>;
    userChoice?: Promise<{ outcome: string }>;
  };
  if (!prompt.prompt) return;
  await prompt.prompt();
  const choice = await prompt.userChoice;
  if (choice?.outcome === "accepted") showToast("已送出安裝要求。", "success");
  installPrompt.value = null;
}
onMounted(() => {
  window.addEventListener("keydown", onKey);
  window.addEventListener("online", updateOnline);
  window.addEventListener("offline", updateOnline);
  window.addEventListener(
    "beforeinstallprompt",
    captureInstall as EventListener,
  );
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
  window.removeEventListener("online", updateOnline);
  window.removeEventListener("offline", updateOnline);
  window.removeEventListener(
    "beforeinstallprompt",
    captureInstall as EventListener,
  );
});
</script>
<template>
  <a class="skip-link" href="#main-content" @click.prevent="focusReading"
    >跳到主要內容</a
  >
  <div class="app-shell textbook-shell">
    <header class="book-header">
      <div class="book-header__inner">
        <a class="book-brand" href="#/knowledge/start-here"
          >GH-600 數位教科書</a
        >
        <button class="book-menu-button" @click="menu?.showModal()">
          目錄
        </button>
        <button
          class="book-search"
          aria-label="開啟全站搜尋"
          @click="searchOpen = true"
        >
          <span>搜尋章節、概念或關鍵字</span
          ><span class="book-search__mobile">搜尋</span><kbd>Ctrl K</kbd>
        </button>
        <nav class="book-quick-nav" aria-label="常用功能">
          <a
            href="#/glossary"
            :aria-current="route.name === 'glossary' ? 'page' : undefined"
            >詞彙表</a
          >
          <a
            href="#/quiz"
            :aria-current="route.name === 'quiz' ? 'page' : undefined"
            >測驗</a
          >
          <a
            href="#/dashboard"
            :aria-current="route.name === 'dashboard' ? 'page' : undefined"
            >我的進度</a
          >
        </nav>
      </div>
    </header>
    <main id="main-content" class="content-area" tabindex="-1">
      <p v-if="storageStatus === 'error'" class="notice" role="alert">
        最新進度尚未保存，關閉或重新整理可能會遺失。
        <a href="#/settings">前往設定匯出學習紀錄</a>。
      </p>
      <h1 v-if="route.name !== 'knowledge'" class="sr-only">
        {{ title }}
      </h1>
      <component :is="currentView" />
    </main>
    <footer class="book-footer">
      <span>GH-600 · Agentic AI 學習指南</span>
      <span
        >{{ online ? "已連線" : "目前離線" }} ·
        {{
          storageStatus === "saved"
            ? "進度已保存在此瀏覽器"
            : storageStatus === "error"
              ? "最新進度尚未保存"
              : "進度僅存於此瀏覽器"
        }}</span
      >
      <button
        class="text-button"
        :aria-label="`切換顯示主題，目前為${themeLabel}`"
        @click="cycleTheme"
      >
        {{ themeLabel }}
      </button>
      <button v-if="installPrompt" class="text-button" @click="install">
        安裝離線版
      </button>
    </footer>
  </div>
  <dialog
    ref="menu"
    class="book-menu"
    aria-labelledby="book-menu-title"
    @click="closeMenuBackdrop"
  >
    <header>
      <div>
        <p class="eyebrow">GH-600</p>
        <h2 id="book-menu-title">全書目錄</h2>
      </div>
      <button class="book-menu-button" @click="menu?.close()">關閉</button>
    </header>
    <nav aria-label="全書章節">
      <a
        v-for="(chapter, index) in chapters"
        :key="chapter.id"
        :href="`#/knowledge/${chapter.id}`"
        :aria-current="
          route.name === 'knowledge' && route.param === chapter.id
            ? 'page'
            : undefined
        "
        @click="menu?.close()"
      >
        <span>{{
          index === 0
            ? "導讀"
            : index === chapters.length - 1
              ? "附錄"
              : String(index).padStart(2, "0")
        }}</span>
        <strong>{{ chapter.title }}</strong>
      </a>
    </nav>
    <nav class="book-menu__resources" aria-label="學習工具">
      <a
        v-for="item in nav.filter((item) => item.name !== 'knowledge')"
        :key="item.name"
        :href="`#/${item.name}`"
        @click="menu?.close()"
        >{{ item.label }}</a
      >
    </nav>
    <p class="muted">資料基準：{{ examMeta.lastVerified }}</p>
  </dialog>
  <SearchOverlay :open="searchOpen" @close="searchOpen = false" />
  <ToastHost />
</template>
