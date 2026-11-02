<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { starsFor, type Lab } from "../quest";

const props = defineProps<{ lab: Lab }>();
const emit = defineEmits<{
  done: [stars: number];
  exit: [];
  textbook: [];
}>();

const round = ref(0);
const picked = ref<string | null>(null);
const followPicked = ref<string | null>(null);
const wrongs = ref(0);
const finished = ref(false);
const nextButton = ref<HTMLButtonElement | null>(null);

const current = computed(() => props.lab.rounds[round.value]!);
const answered = computed(() => picked.value !== null);
const followDone = computed(
  () => !current.value.followUp || followPicked.value !== null,
);
const stars = computed(() => starsFor(wrongs.value, 2));
const isLast = computed(() => round.value === props.lab.rounds.length - 1);

function focusNext() {
  void nextTick(() => nextButton.value?.focus());
}
function pick(id: string) {
  if (answered.value) return;
  picked.value = id;
  if (id !== current.value.answer) wrongs.value += 1;
  if (!current.value.followUp) focusNext();
}
function pickFollow(id: string) {
  if (!answered.value || followPicked.value !== null) return;
  followPicked.value = id;
  if (id !== current.value.followUp!.answer) wrongs.value += 1;
  focusNext();
}
function next() {
  if (isLast.value) {
    finished.value = true;
    emit("done", stars.value);
    return;
  }
  round.value += 1;
  picked.value = null;
  followPicked.value = null;
}
function replay() {
  round.value = 0;
  picked.value = null;
  followPicked.value = null;
  wrongs.value = 0;
  finished.value = false;
}
function cardState(id: string) {
  if (!answered.value) return "";
  if (id === current.value.answer) return "is-right";
  if (id === picked.value) return "is-wrong";
  return "is-dim";
}
</script>
<template>
  <section class="quest-lab" :class="`quest-lab--${lab.layout}`">
    <header class="quest-lab__head">
      <span class="quest-chip">實驗室</span>
      <h2>{{ lab.title }}</h2>
      <p>{{ lab.story }}</p>
      <p class="quest-note">{{ lab.note }}</p>
    </header>

    <template v-if="!finished">
      <div
        class="quest-pips"
        role="img"
        :aria-label="`第 ${round + 1} 題，共 ${lab.rounds.length} 題`"
      >
        <span
          v-for="(_, index) in lab.rounds"
          :key="index"
          :class="{ done: index < round, now: index === round }"
        ></span>
      </div>

      <div class="quest-board" role="group" aria-label="選擇最符合的類別">
        <button
          v-for="(category, index) in lab.categories"
          :key="category.id"
          type="button"
          class="quest-card"
          :class="cardState(category.id)"
          :style="{ '--step': index }"
          :aria-disabled="answered"
          @click="pick(category.id)"
        >
          <svg
            v-if="category.diagram"
            class="quest-diagram"
            viewBox="0 0 120 56"
            aria-hidden="true"
          >
            <g v-if="category.diagram === 'single'">
              <circle cx="60" cy="28" r="9" />
            </g>
            <g v-else-if="category.diagram === 'supervisor'">
              <circle cx="60" cy="10" r="8" />
              <circle cx="22" cy="46" r="7" />
              <circle cx="60" cy="46" r="7" />
              <circle cx="98" cy="46" r="7" />
              <path d="M56 17 L25 40 M60 18 V39 M64 17 L95 40" />
            </g>
            <g v-else-if="category.diagram === 'pipeline'">
              <circle cx="16" cy="28" r="8" />
              <circle cx="60" cy="28" r="8" />
              <circle cx="104" cy="28" r="8" />
              <path d="M25 28 H50 M69 28 H94 M46 24 L51 28 L46 32 M90 24 L95 28 L90 32" />
            </g>
            <g v-else>
              <circle cx="14" cy="28" r="7" />
              <circle cx="60" cy="10" r="7" />
              <circle cx="60" cy="46" r="7" />
              <circle cx="106" cy="28" r="7" />
              <path d="M20 24 L54 12 M20 32 L54 44 M66 12 L100 24 M66 44 L100 32" />
            </g>
          </svg>
          <span class="quest-card__label">{{ category.label }}</span>
          <span class="quest-card__summary">{{ category.summary }}</span>
          <span v-if="answered" class="quest-card__detail">{{
            category.detail
          }}</span>
          <span v-if="answered && category.id === current.answer" class="quest-mark"
            >✓ 正解</span
          >
          <span
            v-else-if="answered && category.id === picked"
            class="quest-mark quest-mark--wrong"
            >✗ 你的選擇</span
          >
        </button>
      </div>

      <div class="quest-prompt">
        <span class="quest-chip quest-chip--soft"
          >情境 {{ round + 1 }}／{{ lab.rounds.length }}</span
        >
        <p>{{ current.prompt }}</p>
      </div>

      <div class="quest-feedback" aria-live="polite">
        <template v-if="answered">
          <p>
            <strong>{{
              picked === current.answer ? "答對了。" : "再想想看。"
            }}</strong>
            {{ current.why }}
          </p>
          <div v-if="current.followUp" class="quest-followup">
            <p>
              <strong>{{ current.followUp.prompt }}</strong>
            </p>
            <div class="quest-options">
              <button
                v-for="option in current.followUp.options"
                :key="option.id"
                type="button"
                class="quest-option"
                :class="{
                  'is-right':
                    followPicked !== null &&
                    option.id === current.followUp.answer,
                  'is-wrong':
                    followPicked === option.id &&
                    option.id !== current.followUp.answer,
                }"
                :aria-disabled="followPicked !== null"
                @click="pickFollow(option.id)"
              >
                {{ option.text }}
                <span
                  v-if="followPicked !== null && option.id === current.followUp.answer"
                  class="quest-mark"
                  >✓ 正解</span
                >
                <span
                  v-else-if="followPicked === option.id"
                  class="quest-mark quest-mark--wrong"
                  >✗ 你的選擇</span
                >
              </button>
            </div>
            <p v-if="followPicked !== null">{{ current.followUp.why }}</p>
          </div>
          <button
            v-if="followDone"
            ref="nextButton"
            type="button"
            class="button button--primary quest-cta"
            @click="next"
          >
            {{ isLast ? "完成實驗室" : "下一題" }}
          </button>
        </template>
        <p v-else class="muted">點選上方最符合的卡片。</p>
      </div>
    </template>

    <div v-else class="quest-result">
      <p class="quest-result__stars" role="img" :aria-label="`${stars} 顆星`">
        <span v-for="n in 3" :key="n" :class="{ on: n <= stars }">★</span>
      </p>
      <h3>實驗室完成</h3>
      <p class="quest-tip"><strong>小知識</strong>{{ lab.tip }}</p>
      <div class="quest-actions">
        <button type="button" class="button button--primary" @click="emit('exit')">
          回到地圖
        </button>
        <button type="button" class="button button--soft" @click="replay">
          再玩一次
        </button>
        <button type="button" class="button button--ghost" @click="emit('textbook')">
          讀對應教材
        </button>
      </div>
    </div>
  </section>
</template>
