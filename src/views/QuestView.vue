<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import QuestLab from "../components/QuestLab.vue";
import { examMeta, questions } from "../content";
import { navigate, route } from "../router";
import { progress, recordQuestClear } from "../store";
import {
  buildPath,
  isUnlocked,
  levelQuestions,
  resolveNode,
  starsFor,
  textbookLink,
  worlds,
  type PathNode,
} from "../quest";
import {
  answerText,
  isCorrectOption,
  isOptionSelected,
  isQuestionCorrect,
  questionOptions,
} from "../quiz";
import type { QuestionAnswer } from "../types";

const path = buildPath();
const node = computed(() =>
  resolveNode(
    path,
    route.param,
    progress.quest.cleared,
    progress.quest.freeRoam,
  ),
);
const nodeIndex = computed(() =>
  path.findIndex((item) => item.id === route.param),
);
const cleared = computed(() => progress.quest.cleared);
const totalStars = computed(() =>
  Object.values(cleared.value).reduce((sum, n) => sum + n, 0),
);
const clearedCount = computed(
  () => path.filter((item) => (cleared.value[item.id] ?? 0) >= 1).length,
);
const allClear = computed(() => clearedCount.value === path.length);
const nextOpen = computed(() =>
  path.findIndex((item) => (cleared.value[item.id] ?? 0) < 1),
);

const domainName = (domainId: string) =>
  examMeta.exam.domains.find((domain) => domain.id === domainId);
const groups = computed(() =>
  worlds.map((world) => ({
    world,
    domain: domainName(world.domainId),
    nodes: path
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.worldId === world.id),
  })),
);
const unlocked = (index: number) =>
  isUnlocked(path, index, cleared.value, progress.quest.freeRoam);

// ---- 關卡進行狀態 ----
type Phase = "intro" | "ask" | "result";
const phase = ref<Phase>("intro");
const qIndex = ref(0);
const answer = ref<QuestionAnswer | undefined>(undefined);
const submitted = ref(false);
const wrongs = ref(0);
const feedback = ref<HTMLElement | null>(null);

const levelQs = computed(() =>
  node.value?.kind === "level" ? levelQuestions(questions, node.value.id) : [],
);
const question = computed(() => levelQs.value[qIndex.value]);
const stars = computed(() => starsFor(wrongs.value, 1));

function resetPlay() {
  phase.value = "intro";
  qIndex.value = 0;
  answer.value = undefined;
  submitted.value = false;
  wrongs.value = 0;
}
watch(() => route.param, resetPlay);

function open(index: number) {
  if (!unlocked(index)) return;
  navigate("quest", path[index]!.id);
}
function back() {
  navigate("quest");
}
function toggleOption(id: string) {
  const q = question.value;
  if (!q || submitted.value) return;
  if (q.type === "multiple") {
    const list = Array.isArray(answer.value) ? [...answer.value] : [];
    const at = list.indexOf(id);
    if (at >= 0) list.splice(at, 1);
    else list.push(id);
    answer.value = list;
  } else if (q.type === "true-false") {
    answer.value = id === "true";
  } else {
    answer.value = id;
  }
}
const canSubmit = computed(() => {
  const a = answer.value;
  return Array.isArray(a) ? a.length > 0 : a !== undefined;
});
async function submit() {
  const q = question.value;
  if (!q || submitted.value || !canSubmit.value) return;
  submitted.value = true;
  if (!isQuestionCorrect(q, answer.value)) wrongs.value += 1;
  await nextTick();
  feedback.value?.focus();
}
function advance() {
  if (qIndex.value < levelQs.value.length - 1) {
    qIndex.value += 1;
    answer.value = undefined;
    submitted.value = false;
    return;
  }
  phase.value = "result";
  if (node.value) recordQuestClear(node.value.id, stars.value);
}
function labDone(value: number) {
  if (node.value) recordQuestClear(node.value.id, value);
}
function readTextbook(item: PathNode) {
  const objectiveId =
    item.kind === "level" ? item.info.objectiveId : item.lab.objectiveId;
  const link = textbookLink(objectiveId);
  navigate("knowledge", link.chapter, { section: link.section });
}
function goNext() {
  const target = path[nodeIndex.value + 1];
  if (target) navigate("quest", target.id);
  else back();
}
const nextLabel = computed(() => {
  const target = path[nodeIndex.value + 1];
  if (!target) return "回到地圖";
  return `下一關：${target.kind === "level" ? target.info.title : target.lab.title}`;
});
const optionIdOf = (id: string) => id;
</script>
<template>
  <div class="quest" :class="node ? `quest--${node.worldId}` : ''">
    <div class="quest-aurora" aria-hidden="true"></div>

    <!-- 地圖 -->
    <template v-if="!node">
      <header class="quest-hero">
        <span class="quest-chip">GH-600 · Agentic AI 闖關</span>
        <h2>代理任務闖關地圖</h2>
        <p>
          跟著同一個 CSV
          匯出案例，從任務契約一路走到護欄與課責。每關用教材題庫的情境題過關，
          四間實驗室讓你親手操作「訊號、根因、編排、自主程度」。
        </p>
        <div class="quest-stats">
          <div>
            <strong>{{ clearedCount }}／{{ path.length }}</strong>
            <span>已過關</span>
          </div>
          <div>
            <strong>{{ totalStars }}／{{ path.length * 3 }}</strong>
            <span>星星</span>
          </div>
          <button
            v-if="nextOpen >= 0"
            type="button"
            class="button button--primary"
            @click="open(nextOpen)"
          >
            {{ clearedCount ? "繼續闖關" : "開始闖關" }}
          </button>
          <p v-else class="quest-win">全部通關，辛苦了。</p>
        </div>
        <label class="toggle-control quest-free"
          ><input
            v-model="progress.quest.freeRoam"
            type="checkbox"
          />自由探索（解除關卡鎖定）</label
        >
        <p class="quest-note">
          遊戲內容改寫自本站教材，不含實際考題；教材中的分類與配置是教學用整理，並非官方固定等級。
        </p>
      </header>

      <section
        v-for="group in groups"
        :key="group.world.id"
        class="quest-world"
        :class="`quest--${group.world.id}`"
        :aria-labelledby="`world-${group.world.id}`"
      >
        <header class="quest-world__head">
          <span class="quest-glyph" aria-hidden="true">{{
            group.world.glyph
          }}</span>
          <div>
            <h3 :id="`world-${group.world.id}`">
              {{ group.world.domainId }} · {{ group.world.name }}
            </h3>
            <p>{{ group.domain?.name }}　{{ group.world.tagline }}</p>
          </div>
        </header>
        <ol class="quest-trail">
          <li v-for="{ item, index } in group.nodes" :key="item.id">
            <button
              type="button"
              class="quest-node"
              :class="{
                'is-lab': item.kind === 'lab',
                'is-locked': !unlocked(index),
                'is-cleared': (cleared[item.id] ?? 0) >= 1,
                'is-next': index === nextOpen,
              }"
              :aria-disabled="!unlocked(index)"
              :aria-current="index === nextOpen ? 'step' : undefined"
              @click="open(index)"
            >
              <span class="quest-node__badge" aria-hidden="true">{{
                item.kind === "lab" ? "實" : index + 1
              }}</span>
              <span class="quest-node__body">
                <strong>{{
                  item.kind === "level" ? item.info.title : item.lab.title
                }}</strong>
                <small
                  >{{
                    item.kind === "level" ? item.info.objectiveId : "實驗室"
                  }}
                  ·
                  {{
                    !unlocked(index)
                      ? "尚未解鎖"
                      : (cleared[item.id] ?? 0) >= 1
                        ? `${cleared[item.id]} 顆星`
                        : index === nextOpen
                          ? "下一關"
                          : "可挑戰"
                  }}</small
                >
              </span>
              <span
                class="quest-node__stars"
                role="img"
                :aria-label="`${cleared[item.id] ?? 0} 顆星`"
              >
                <span
                  v-for="n in 3"
                  :key="n"
                  :class="{ on: n <= (cleared[item.id] ?? 0) }"
                  >★</span
                >
              </span>
            </button>
          </li>
        </ol>
      </section>
    </template>

    <!-- 實驗室 -->
    <template v-else-if="node.kind === 'lab'">
      <nav class="quest-bar" aria-label="闖關導覽">
        <button type="button" class="button button--ghost" @click="back">
          ← 地圖
        </button>
        <button
          type="button"
          class="button button--ghost"
          @click="readTextbook(node)"
        >
          讀對應教材
        </button>
      </nav>
      <QuestLab
        :key="node.id"
        :lab="node.lab"
        @done="labDone"
        @exit="back"
        @textbook="readTextbook(node)"
      />
    </template>

    <!-- 關卡 -->
    <template v-else>
      <nav class="quest-bar" aria-label="闖關導覽">
        <button type="button" class="button button--ghost" @click="back">
          ← 地圖
        </button>
        <button
          type="button"
          class="button button--ghost"
          @click="readTextbook(node)"
        >
          讀對應教材
        </button>
      </nav>

      <section v-if="phase === 'intro'" class="quest-stage">
        <span class="quest-chip">{{ node.info.objectiveId }}</span>
        <h2>{{ node.info.title }}</h2>
        <p class="quest-story">{{ node.info.story }}</p>
        <p class="quest-tip">
          <strong>闖關前小知識</strong>{{ node.info.tip }}
        </p>
        <button
          type="button"
          class="button button--primary quest-cta"
          :disabled="!levelQs.length"
          @click="phase = 'ask'"
        >
          出發（{{ levelQs.length }} 題）
        </button>
      </section>

      <section v-else-if="phase === 'ask' && question" class="quest-stage">
        <div
          class="quest-pips"
          role="img"
          :aria-label="`第 ${qIndex + 1} 題，共 ${levelQs.length} 題`"
        >
          <span
            v-for="(_, index) in levelQs"
            :key="index"
            :class="{ done: index < qIndex, now: index === qIndex }"
          ></span>
        </div>
        <p class="quest-q">{{ question.question }}</p>
        <p v-if="question.type === 'multiple'" class="quest-note">
          這題是複選，選出所有正確的項目。
        </p>
        <div class="quest-options" role="group" aria-label="作答選項">
          <button
            v-for="option in questionOptions(question)"
            :key="option.id"
            type="button"
            class="quest-option"
            :class="{
              'is-picked':
                !submitted && isOptionSelected(question, answer, option.id),
              'is-right': submitted && isCorrectOption(question, option.id),
              'is-wrong':
                submitted &&
                isOptionSelected(question, answer, option.id) &&
                !isCorrectOption(question, option.id),
            }"
            :aria-pressed="isOptionSelected(question, answer, option.id)"
            :aria-disabled="submitted"
            @click="toggleOption(optionIdOf(option.id))"
          >
            <span class="quest-option__key" aria-hidden="true">{{
              question.type === "true-false"
                ? option.id === "true"
                  ? "○"
                  : "✕"
                : option.id
            }}</span>
            <span>{{ option.text }}</span>
            <span
              v-if="submitted && isCorrectOption(question, option.id)"
              class="quest-mark"
              >✓ 正解</span
            >
            <span
              v-else-if="
                submitted && isOptionSelected(question, answer, option.id)
              "
              class="quest-mark quest-mark--wrong"
              >✗ 你的選擇</span
            >
          </button>
        </div>
        <button
          v-if="!submitted"
          type="button"
          class="button button--primary quest-cta"
          :disabled="!canSubmit"
          @click="submit"
        >
          送出答案
        </button>
        <div
          v-else
          ref="feedback"
          class="quest-feedback"
          tabindex="-1"
          aria-live="polite"
        >
          <p>
            <strong>{{
              isQuestionCorrect(question, answer) ? "答對了。" : "再想想看。"
            }}</strong>
            你的答案：{{ answerText(question, answer) }}
          </p>
          <p>{{ question.explanation }}</p>
          <p class="quest-tip"><strong>陷阱</strong>{{ question.trap }}</p>
          <button
            type="button"
            class="button button--primary quest-cta"
            @click="advance"
          >
            {{ qIndex < levelQs.length - 1 ? "下一題" : "看結果" }}
          </button>
        </div>
      </section>

      <section v-else class="quest-stage quest-result">
        <div class="quest-confetti" aria-hidden="true">
          <span v-for="n in 18" :key="n" :style="{ '--i': n }"></span>
        </div>
        <p class="quest-result__stars" role="img" :aria-label="`${stars} 顆星`">
          <span v-for="n in 3" :key="n" :class="{ on: n <= stars }">★</span>
        </p>
        <h2>{{ node.info.title }} 通過</h2>
        <p>
          答錯 {{ wrongs }} 題。{{
            stars === 3 ? "完美過關。" : "想拿滿星可以再挑戰一次。"
          }}
        </p>
        <p class="quest-tip"><strong>小知識</strong>{{ node.info.tip }}</p>
        <div class="quest-actions">
          <button type="button" class="button button--primary" @click="goNext">
            {{ nextLabel }}
          </button>
          <button type="button" class="button button--soft" @click="resetPlay">
            再玩一次
          </button>
          <button
            type="button"
            class="button button--ghost"
            @click="readTextbook(node)"
          >
            讀對應教材
          </button>
        </div>
        <p v-if="allClear" class="quest-win">全部關卡都通過了。</p>
      </section>
    </template>
  </div>
</template>
