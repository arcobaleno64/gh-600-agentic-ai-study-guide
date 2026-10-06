<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { glossary, terms } from "../content";
import { progress, toggleFamiliarTerm, toggleFavoriteTerm } from "../store";
import { route } from "../router";
import { normalize, shuffled } from "../utils";
const query = ref("");
const category = ref("全部");
const status = ref("全部");
const flashDialog = ref<HTMLDialogElement | null>(null);
const flashFace = ref<HTMLButtonElement | null>(null);
const flashIndex = ref(0);
const reveal = ref(false);
const deck = ref([...terms]);
const filtered = computed(() =>
  terms.filter((t) => {
    const q = normalize(query.value);
    const search = !q || normalize(`${t.term} ${t.explanation}`).includes(q);
    const cat = category.value === "全部" || t.category === category.value;
    const st =
      status.value === "全部" ||
      (status.value === "收藏" && progress.favoriteTerms.includes(t.id)) ||
      (status.value === "待複習" && !progress.familiarTerms.includes(t.id)) ||
      (status.value === "已熟悉" && progress.familiarTerms.includes(t.id));
    return search && cat && st;
  }),
);
const card = computed(() => deck.value[flashIndex.value] ?? terms[0]);
function openDeck() {
  if (!filtered.value.length) return;
  deck.value = shuffled(filtered.value);
  flashIndex.value = 0;
  reveal.value = false;
  flashDialog.value?.showModal();
}
function next() {
  flashIndex.value = (flashIndex.value + 1) % deck.value.length;
  reveal.value = false;
  nextTick(() => flashFace.value?.focus({ preventScroll: true }));
}
function closeBackdrop(event: MouseEvent) {
  if (event.target !== flashDialog.value) return;
  const box = flashDialog.value.getBoundingClientRect();
  if (
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom
  )
    flashDialog.value.close();
}
async function focusRoute() {
  if (!route.param) return;
  query.value = "";
  category.value = "全部";
  status.value = "全部";
  await nextTick();
  const target = document.querySelector<HTMLElement>(
    `[data-term-id="${CSS.escape(route.param)}"]`,
  );
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
  target?.focus({ preventScroll: true });
}
watch(() => route.param, focusRoute, { immediate: true });
</script>
<template>
  <section class="page-stack">
    <div class="page-intro">
      <div>
        <span class="badge badge--accent"
          >{{ terms.length }} 個名詞／關鍵字</span
        >
        <h2>名詞庫</h2>
        <p>
          即時搜尋、考科與分類篩選、收藏、熟悉度標記及隨機抽卡。產品名稱再相似，也不必全部擠進同一個記憶抽屜。
        </p>
      </div>
      <button
        class="button button--primary"
        :disabled="!filtered.length"
        @click="openDeck"
      >
        隨機抽卡
      </button>
    </div>
    <div class="panel filter-bar">
      <label class="filter-bar__search search-field"
        ><span class="sr-only">搜尋名詞</span
        ><input
          v-model="query"
          type="search"
          placeholder="搜尋名詞、縮寫或解釋" /></label
      ><label
        >分類<select v-model="category">
          <option>全部</option>
          <option v-for="c in glossary.categories" :key="c.id">
            {{ c.title }}
          </option>
        </select></label
      ><label
        >狀態<select v-model="status">
          <option>全部</option>
          <option>收藏</option>
          <option>待複習</option>
          <option>已熟悉</option>
        </select></label
      >
    </div>
    <div class="panel__header">
      <div>
        <strong>{{ filtered.length }}</strong> 個結果
      </div>
      <span class="muted"
        >收藏 {{ progress.favoriteTerms.length }}／已熟悉
        {{ progress.familiarTerms.length }}</span
      >
    </div>
    <div class="glossary-grid">
      <article
        v-for="term in filtered"
        :key="term.id"
        class="term-card"
        :data-term-id="term.id"
        :data-familiar="progress.familiarTerms.includes(term.id)"
        tabindex="-1"
        :aria-labelledby="`term-${term.id}`"
      >
        <div class="term-card__top">
          <div class="term-card__tags">
            <span v-for="e in term.exams" :key="e" class="badge">{{ e }}</span>
          </div>
          <button
            class="favorite-button"
            :class="{ active: progress.favoriteTerms.includes(term.id) }"
            :aria-pressed="progress.favoriteTerms.includes(term.id)"
            :aria-label="
              progress.favoriteTerms.includes(term.id) ? '取消收藏' : '加入收藏'
            "
            @click="toggleFavoriteTerm(term.id)"
          >
            ★
          </button>
        </div>
        <h3 :id="`term-${term.id}`">{{ term.term }}</h3>
        <p>{{ term.explanation }}</p>
        <footer class="term-card__footer">
          <span class="muted">{{ term.category }}</span
          ><button
            class="button button--ghost"
            :aria-label="
              progress.familiarTerms.includes(term.id)
                ? '標記待複習'
                : '標記熟悉'
            "
            @click="toggleFamiliarTerm(term.id)"
          >
            {{
              progress.familiarTerms.includes(term.id)
                ? "改為待複習"
                : "標記熟悉"
            }}
          </button>
        </footer>
      </article>
    </div>
    <div v-if="!filtered.length" class="empty-card">
      <strong>沒有符合的名詞</strong
      ><span>請更換關鍵字或放寬分類、狀態篩選；抽卡使用目前的搜尋結果。</span>
    </div>
    <dialog
      ref="flashDialog"
      class="flashcard-modal"
      aria-labelledby="flashcard-title"
      @click="closeBackdrop"
    >
      <section class="flashcard-dialog">
        <header class="search-dialog__header">
          <div>
            <p class="eyebrow">
              FLASHCARD {{ flashIndex + 1 }}／{{ deck.length }}
            </p>
            <h2 id="flashcard-title">隨機名詞卡</h2>
          </div>
          <button
            class="icon-button"
            aria-label="關閉名詞抽卡"
            @click="flashDialog?.close()"
          >
            ×
          </button>
        </header>
        <button
          ref="flashFace"
          autofocus
          class="flashcard-face"
          :aria-label="`${card.term}：${reveal ? '隱藏解釋' : '顯示解釋'}`"
          :aria-expanded="reveal"
          aria-controls="flashcard-explanation"
          :aria-describedby="reveal ? 'flashcard-explanation' : undefined"
          @click="reveal = !reveal"
        >
          <div>
            <span class="badge">{{ card.exams.join("／") }}</span>
            <h2>{{ card.term }}</h2>
            <p
              v-show="reveal"
              id="flashcard-explanation"
              class="flashcard-answer"
            >
              {{ card.explanation }}
            </p>
            <p v-if="!reveal" class="muted">點選卡片顯示解釋</p>
          </div>
        </button>
        <div class="settings-actions">
          <button
            class="button button--ghost"
            @click="toggleFamiliarTerm(card.id)"
          >
            {{
              progress.familiarTerms.includes(card.id)
                ? "改為待複習"
                : "標記熟悉"
            }}</button
          ><button class="button button--primary" @click="next">下一張</button>
        </div>
      </section>
    </dialog>
  </section>
</template>
