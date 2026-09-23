<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { navigate } from "../router";
import { searchContent } from "../content";
import { highlightText, searchFilters, type SearchFilter } from "../search";
const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();
const query = ref("");
const input = ref<HTMLInputElement | null>(null);
const dialog = ref<HTMLDialogElement | null>(null);
const filter = ref<SearchFilter>("全部");
const resultList = ref<HTMLElement | null>(null);
const results = computed(() => searchContent(query.value, filter.value));
watch([query, filter], async () => {
  await nextTick();
  resultList.value?.scrollTo({ top: 0, behavior: "instant" });
});
watch(
  () => props.open,
  async (open) => {
    if (open) {
      query.value = "";
      filter.value = "全部";
      await nextTick();
      dialog.value?.showModal();
      input.value?.focus();
    } else dialog.value?.close();
  },
);
function choose(item: ReturnType<typeof searchContent>[number]) {
  navigate(item.route, item.param ?? "", { section: item.section });
  emit("close");
}
</script>
<template>
  <dialog
    ref="dialog"
    class="book-search-modal"
    aria-label="全站搜尋"
    @cancel="emit('close')"
    @close="emit('close')"
  >
    <section class="search-dialog">
      <header class="search-dialog__header">
        <div>
          <h2>搜尋章節與概念</h2>
        </div>
        <button
          class="book-menu-button"
          aria-label="關閉搜尋"
          @click="emit('close')"
        >
          關閉
        </button>
      </header>
      <label class="search-field search-field--large"
        ><span class="sr-only">搜尋關鍵字</span
        ><input
          ref="input"
          v-model="query"
          type="search"
          placeholder="例如：MCP、最小權限、狀態"
        /><kbd>Esc</kbd></label
      >
      <div class="search-filters" role="group" aria-label="結果類型">
        <button
          v-for="type in searchFilters"
          :key="type"
          :aria-pressed="filter === type"
          @click="filter = type"
        >
          {{ type }}
        </button>
      </div>
      <p class="search-count" role="status">
        {{
          query.trim()
            ? `符合 ${results.total} 筆${results.total > 50 ? "，只顯示前 50 筆" : ""}`
            : "輸入關鍵字開始搜尋"
        }}
      </p>
      <div ref="resultList" class="search-results">
        <button
          v-for="item in results"
          :key="`${item.type}-${item.id}`"
          class="search-result"
          @click="choose(item)"
        >
          <span class="chip">{{ item.type }}</span
          ><strong
            ><template
              v-for="(part, index) in highlightText(item.title, query)"
              :key="index"
              ><mark v-if="part.match">{{ part.text }}</mark
              ><template v-else>{{ part.text }}</template></template
            ></strong
          ><span
            ><template
              v-for="(part, index) in highlightText(item.excerpt, query)"
              :key="index"
              ><mark v-if="part.match">{{ part.text }}</mark
              ><template v-else>{{ part.text }}</template></template
            ></span
          >
        </button>
        <div v-if="query.trim() && !results.length" class="empty-card">
          <strong>沒有找到結果</strong
          ><span>請改用產品名稱、縮寫或題幹動詞。</span>
        </div>
        <div v-if="!query.trim()" class="empty-card">
          <strong>搜尋教材、題目、名詞與問答</strong
          ><span>可輸入中文、英文或縮寫。教材結果會直接帶你到對應小節。</span>
        </div>
      </div>
    </section>
  </dialog>
</template>
