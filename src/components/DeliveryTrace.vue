<script setup lang="ts">
import { computed, ref } from "vue";

const testedVersion = ref("A");
const newlineChecked = ref(false);
const action = ref("review");
const sameVersion = computed(() => testedVersion.value === "B");
const gaps = computed(() => {
  const missing: string[] = [];
  if (!sameVersion.value) missing.push("測試指向版本 A，待交付產物是版本 B。");
  if (!newlineChecked.value) missing.push("欄位內換行尚未驗收。");
  return missing;
});
const conclusion = computed(() => {
  if (action.value === "publish") return "暫停發布";
  return gaps.value.length ? "交付差異，明列缺口" : "交付已核對的差異";
});
const explanation = computed(() => {
  if (action.value === "publish") {
    return gaps.value.length
      ? "先補齊同一版本的驗收證據；發布還需要針對具體版本、目標環境與動作的明確授權。"
      : "本例的驗收證據已齊，但原始任務只授權修正與測試。發布仍需另行核准。";
  }
  return gaps.value.length
    ? "可以把已確認的修改交給人審查，同時列出未驗證事項；不能宣稱整份產物已通過驗收。"
    : "本例的四項輸入已在版本 B 驗收，可交付差異與證據供審查。這仍不代表已獲發布核准。";
});
function reset() {
  testedVersion.value = "A";
  newlineChecked.value = false;
  action.value = "review";
}
</script>

<template>
  <section class="delivery-trace" aria-labelledby="delivery-trace-title">
    <header class="delivery-trace__intro">
      <h3 id="delivery-trace-title">拆開一盞綠燈</h3>
      <p>
        CSV 修正已成為版本
        B，原任務只授權修正與測試。切換下面的假設，觀察交付判斷如何改變。
      </p>
    </header>
    <fieldset class="delivery-trace__controls">
      <legend class="sr-only">設定交付情境</legend>
      <label>
        測試指向的版本
        <select v-model="testedVersion">
          <option value="A">版本 A · 先前版本</option>
          <option value="B">版本 B · 待交付</option>
        </select>
      </label>
      <label>
        欄位內換行
        <select v-model="newlineChecked">
          <option :value="false">尚未驗收</option>
          <option :value="true">已驗收通過</option>
        </select>
      </label>
      <label>
        下一個動作
        <select v-model="action">
          <option value="review">交付差異供審查</option>
          <option value="publish">發布版本 B</option>
        </select>
      </label>
    </fieldset>
    <div class="delivery-trace__chain">
      <div class="delivery-trace__artifact">
        <span class="delivery-trace__label">待交付產物</span>
        <strong class="delivery-trace__version">B</strong>
        <span>CSV 修正與測試差異</span>
        <p>原授權：修正與測試</p>
      </div>
      <div class="delivery-trace__connector" aria-hidden="true">→</div>
      <div class="delivery-trace__evidence">
        <span class="delivery-trace__label"
          >驗收證據 · 版本 {{ testedVersion }}</span
        >
        <ul>
          <li><span>逗號欄位</span><strong>通過</strong></li>
          <li><span>引號跳脫</span><strong>通過</strong></li>
          <li><span>空值欄位</span><strong>通過</strong></li>
          <li :data-missing="!newlineChecked">
            <span>欄位內換行</span
            ><strong>{{ newlineChecked ? "通過" : "未測" }}</strong>
          </li>
        </ul>
        <p :data-missing="!sameVersion">
          {{ sameVersion ? "版本與產物相同" : "版本與產物不同" }}
        </p>
      </div>
    </div>
    <div
      class="delivery-trace__decision"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span class="delivery-trace__label">依這些假設，下一步</span>
      <strong>{{ conclusion }}</strong>
      <p>{{ explanation }}</p>
      <ul v-if="gaps.length" class="delivery-trace__gaps">
        <li v-for="gap in gaps" :key="gap">{{ gap }}</li>
      </ul>
      <p v-if="action === 'publish'" class="delivery-trace__authorization">
        授權缺口：原任務不包含發布。
      </p>
    </div>
    <footer class="delivery-trace__footer">
      <p>本站原創紙上推演；不執行測試或發布，通過只涵蓋本例四項輸入。</p>
      <button type="button" class="text-button" @click="reset">還原情境</button>
    </footer>
  </section>
</template>
