<script setup lang="ts">
import { computed, nextTick, ref } from "vue";

const stages = [
  {
    id: "d1",
    section: "d1-o2",
    title: "界定任務",
    artifact: "任務契約",
    observation:
      "CSV 的逗號欄位被拆錯。需求只允許修正匯出與測試，代理的計畫卻加入登入模組重構。",
    choices: [
      {
        text: "讓代理完成整份計畫，最後再審查",
        reason: "事後審查無法代替執行前的範圍判斷；登入重構已超出這次授權。",
      },
      {
        text: "先移除越界步驟，核對修復與驗收",
        reason:
          "計畫應對準已授權的匯出行為。先限定差異與驗收，再讓代理執行；若登入變更確實是必要條件，另提證據與範圍。",
        sound: true,
      },
      {
        text: "把成功條件改成所有測試通過即可",
        reason: "測試全綠不會補足授權，也不能防止代理跳過原本要修的案例。",
      },
    ],
    evidence: "一份能指出輸入、預期 CSV、允許修改與停止條件的計畫。",
  },
  {
    id: "d2",
    section: "d2-o1",
    title: "限制能力",
    artifact: "工具與權限表",
    observation:
      "這一階段只要閱讀需求並提出測試計畫。可用工具卻包含改檔、任意命令與發布。",
    choices: [
      {
        text: "先限縮到必要的讀取與搜尋能力",
        reason:
          "本階段的交付是計畫。工具可見性與底層資源權限都要符合範圍；進入已授權實作時，才重新配置必要能力。",
        sound: true,
      },
      {
        text: "保留全部工具，請代理自行克制",
        reason:
          "文字能表達規則，不能代替能力與資源限制。任意命令仍可能接觸不該使用的資源。",
      },
      {
        text: "讓代理先試發布，確認工具可用",
        reason:
          "測試工具是否可用也可能產生副作用。發布不在此次計畫階段的授權內。",
      },
    ],
    evidence: "實際可用工具與可讀資源符合範圍；修改與發布能力未開放。",
  },
  {
    id: "d3",
    section: "d3-o2",
    title: "恢復工作",
    artifact: "Checkpoint",
    observation:
      "流程已另行授權建立 PR。要求送出後逾時，checkpoint 只寫「待重試」，沒有記錄遠端結果。",
    choices: [
      {
        text: "照 checkpoint 重送建立 PR 要求",
        reason:
          "逾時不表示寫入沒有生效。照舊紀錄重送，可能再次產生外部副作用。",
      },
      {
        text: "刪除本機差異，讓新代理從頭做",
        reason: "重新開始會丟失可用產物，仍無法判斷上一個遠端操作是否成功。",
      },
      {
        text: "先對帳遠端 PR，再更新任務狀態",
        reason:
          "核對 repository、head/base 與預期 commit，找出已發生的副作用。若查詢也失敗，保留結果未知並升級處理。",
        sound: true,
      },
    ],
    evidence:
      "可核對版本、已完成步驟、PR 識別或未知結果，以及安全續作條件的狀態紀錄。",
  },
  {
    id: "d4",
    section: "d4-o1",
    title: "判讀證據",
    artifact: "驗收紀錄",
    observation:
      "檢查列呈現綠燈。執行紀錄顯示逗號與引號通過，但原定的換行案例沒有執行。",
    choices: [
      {
        text: "依綠燈記為匯出格式全部通過",
        reason:
          "檢查狀態無法代替各項行為的證據。未執行的換行案例仍是驗收缺口。",
      },
      {
        text: "在交付版本補跑換行與相鄰案例",
        reason:
          "把結果對回同一交付版本，補足原契約的缺口。保留通過與未測的區別，不能靠改分母提高通過率。",
        sound: true,
      },
      {
        text: "用安全掃描的結果取代換行測試",
        reason:
          "掃描與功能測試驗證不同問題；沒有弱點告警不能證明 CSV 欄位正確。",
      },
    ],
    evidence: "每個必要案例都有對應輸入、預期輸出、實際結果與受測版本。",
  },
  {
    id: "d5",
    section: "d5-o1",
    title: "整合協作",
    artifact: "交接與整合紀錄",
    observation:
      "兩位代理分別修改實作與測試，一位把空值當成空欄位，另一位預期輸出文字 null。各自都回報完成。",
    choices: [
      {
        text: "先對齊格式契約，再整合與重測",
        reason:
          "先依需求與既有行為處理衝突，不能靠兩份完成摘要決定。整合後的版本仍須執行共同驗收。",
        sound: true,
      },
      {
        text: "採用較晚完成的版本當作標準",
        reason: "時間較新不表示依據正確；較新的代理也可能使用錯誤格式假設。",
      },
      {
        text: "讓第三位代理投票決定空值格式",
        reason:
          "多數意見不能補足規格。缺少決策依據時，應由權責者確認共同契約。",
      },
    ],
    evidence: "共同格式約定、差異歸屬、衝突決策，以及整合版本的測試。",
  },
  {
    id: "d6",
    section: "d6-o2",
    title: "核對交付",
    artifact: "核准與交付包",
    observation:
      "人已核准發布版本 A。代理又修改出版本 B，卻準備沿用 A 的測試與核准紀錄發布。",
    choices: [
      {
        text: "沿用舊核准，因為修改目的相同",
        reason:
          "相同目的不表示相同產物。版本 B 的行為與副作用可能不在原核准對象內。",
      },
      {
        text: "只查 B 的檔名，再繼續發布",
        reason: "檔名無法識別受測與核准的內容，仍缺版本、差異與授權對帳。",
      },
      {
        text: "先核對 B 的差異、驗證與授權",
        reason:
          "核准必須對應實際產物。先確認 B 的改動與驗證，再由權責者判斷是否需要重新核准；未確認前不發布。",
        sound: true,
      },
    ],
    evidence: "需求、差異、受測版本、待發布產物與核准紀錄能相互對帳。",
  },
];

const index = ref(0);
const selected = ref<number | null>(null);
const checked = ref(false);
const reviewed = ref<string[]>([]);
const prompt = ref<HTMLElement | null>(null);
const stage = computed(() => stages[index.value]!);
const feedback = computed(() =>
  checked.value && selected.value !== null
    ? stage.value.choices[selected.value]
    : undefined,
);
// 狀態線與符號依判斷結果決定；文字標題仍是唯一的語意來源，顏色與符號只是加強。
const verdict = computed(() =>
  feedback.value
    ? "sound" in feedback.value && feedback.value.sound
      ? "sound"
      : "gap"
    : undefined,
);
function chooseStage(next: number, focusPrompt = false) {
  index.value = next;
  selected.value = null;
  checked.value = false;
  if (focusPrompt) nextTick(() => prompt.value?.focus());
}
function check() {
  if (selected.value === null) return;
  checked.value = true;
  if (!reviewed.value.includes(stage.value.id))
    reviewed.value.push(stage.value.id);
}
function chooseAction(choice: number) {
  selected.value = choice;
  checked.value = false;
}
</script>

<template>
  <section class="case-walkthrough" aria-labelledby="case-title">
    <header class="case-intro">
      <div>
        <p class="case-intro__context">從一個匯出缺陷開始</p>
        <h1 id="case-title">從一次修復，<br />學會監督代理。</h1>
      </div>
      <div class="case-intro__description">
        <p>
          沿著 CSV
          匯出修復，練習需求、權限、恢復、評估、協作與交付。每一段先做判斷，再核對證據。
        </p>
        <a href="#/knowledge/start-here?section=section-1">直接閱讀教材</a>
      </div>
    </header>
    <div class="case-workbench">
      <nav class="case-stages" aria-label="代理交付案例階段">
        <ol>
          <li v-for="(item, position) in stages" :key="item.id">
            <button
              type="button"
              :aria-current="index === position ? 'step' : undefined"
              @click="chooseStage(position)"
            >
              <span class="case-stage__domain">{{
                item.id.toUpperCase()
              }}</span>
              <span>{{ item.title }}</span>
              <span
                v-if="reviewed.includes(item.id)"
                class="case-stage__reviewed"
                >已核對</span
              >
            </button>
          </li>
        </ol>
      </nav>
      <div class="case-decision">
        <div class="case-observation">
          <span>目前看到的證據</span>
          <p :id="`case-observation-${stage.id}`">{{ stage.observation }}</p>
        </div>
        <fieldset
          :key="stage.id"
          ref="prompt"
          tabindex="-1"
          :aria-describedby="`case-observation-${stage.id}`"
          class="case-choices"
        >
          <legend>{{ stage.title }}：你會先做哪一步？</legend>
          <label v-for="(choice, position) in stage.choices" :key="position">
            <input
              type="radio"
              :name="`case-${stage.id}`"
              :value="position"
              :checked="selected === position"
              @change="chooseAction(position)"
            />
            <span>{{ choice.text }}</span>
          </label>
        </fieldset>
        <div class="case-actions">
          <button
            type="button"
            class="button button--primary"
            :disabled="selected === null"
            @click="check"
          >
            核對我的判斷
          </button>
          <span>已核對 {{ reviewed.length }} / {{ stages.length }} 段</span>
        </div>
        <div
          class="case-feedback"
          :data-verdict="verdict"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <template v-if="feedback">
            <strong>{{
              verdict === "sound" ? "這一步有依據" : "先查清這個缺口"
            }}</strong>
            <p>{{ feedback.reason }}</p>
            <div class="case-evidence">
              <span>應留下的產物 · {{ stage.artifact }}</span>
              <p>{{ stage.evidence }}</p>
            </div>
            <div class="case-feedback__links">
              <a :href="`#/knowledge/${stage.id}?section=${stage.section}`"
                >閱讀這個判斷的原理</a
              >
              <button
                v-if="index < stages.length - 1"
                type="button"
                @click="chooseStage(index + 1, true)"
              >
                前往下一段
              </button>
              <a v-else href="#/knowledge/integration">查看完整交付包</a>
            </div>
          </template>
        </div>
      </div>
    </div>
    <p class="case-note">
      本站原創案例，非官方考題。暖身不計入題庫成績，僅在本次教材閱讀保留。
    </p>
  </section>
</template>
