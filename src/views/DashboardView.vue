<script setup lang="ts">
import { computed } from "vue";
import {
  examMeta,
  questions,
  studyDays,
  studyPlan,
  summary,
  terms,
} from "../content";
import { completedCount, progress, wrongCount } from "../store";
import { navigate } from "../router";
import { daysUntil, formatDateTime, percent } from "../utils";
const nextDay = computed(
  () =>
    studyDays.find((d) => !progress.completedDays.includes(d.day)) ??
    studyDays.at(-1)!,
);
const recentAttempts = computed(() => progress.quizAttempts.slice(0, 4));
const questionAttempts = computed(() =>
  Object.values(progress.questionStats).reduce((sum, s) => sum + s.attempts, 0),
);
const accuracy = computed(() => {
  const stats = Object.values(progress.questionStats);
  const total = stats.reduce((s, x) => s + x.attempts, 0);
  const correct = stats.reduce((s, x) => s + x.correct, 0);
  return percent(correct, total);
});
const weakDomains = computed(() => {
  const map = new Map<string, { correct: number; total: number }>();
  for (const q of questions) {
    const s = progress.questionStats[q.id];
    if (!s) continue;
    const v = map.get(q.domain) ?? { correct: 0, total: 0 };
    v.correct += s.correct;
    v.total += s.attempts;
    map.set(q.domain, v);
  }
  return [...map]
    .map(([name, v]) => ({
      name,
      score: percent(v.correct, v.total),
      total: v.total,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 4);
});
// 權重長條的刻度上限：比最大的區間上限（25%）多留一格，避免長條頂到邊。
const weightScale = 30;
const weights = computed(() =>
  examMeta.exam.domains.map((domain) => ({
    id: domain.id,
    name: domain.name,
    label: `${domain.weight.min}%–${domain.weight.max}%`,
    left: `${(domain.weight.min / weightScale) * 100}%`,
    width: `${((domain.weight.max - domain.weight.min) / weightScale) * 100}%`,
  })),
);
type DayState = "done" | "next" | "todo";
function dayState(day: number): DayState {
  if (progress.completedDays.includes(day)) return "done";
  return day === nextDay.value.day ? "next" : "todo";
}
const dayStateLabel: Record<DayState, string> = {
  done: "已完成",
  next: "下一步",
  todo: "未完成",
};
// 進度格是一個二維格線：左右鍵移動一天，上下鍵移動一週，只有一個 Tab 停點。
function moveInCalendar(event: KeyboardEvent) {
  const step =
    event.key === "ArrowRight"
      ? 1
      : event.key === "ArrowLeft"
        ? -1
        : event.key === "ArrowDown"
          ? 7
          : event.key === "ArrowUp"
            ? -7
            : 0;
  if (!step) return;
  const cells = [
    ...(event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
      ".calendar__day",
    ),
  ];
  const index = cells.indexOf(document.activeElement as HTMLElement);
  const target = cells[index + step];
  if (index < 0 || !target) return;
  event.preventDefault();
  cells.forEach((cell) => cell.setAttribute("tabindex", "-1"));
  target.setAttribute("tabindex", "0");
  target.focus();
}
function countdown(date: string) {
  const d = daysUntil(date);
  return d === null
    ? "未設定"
    : d < 0
      ? `已過 ${Math.abs(d)} 天`
      : d === 0
        ? "今天"
        : `還有 ${d} 天`;
}
</script>
<template>
  <section class="page-stack ledger">
    <div class="page-intro">
      <div>
        <h2>總覽</h2>
        <p>查看學習進度與作答紀錄。無須註冊，資料保存在目前使用的瀏覽器。</p>
      </div>
    </div>
    <section class="today" aria-labelledby="today-title">
      <div class="today__lead">
        <h2 id="today-title">第 {{ nextDay.day }} 天：{{ nextDay.title }}</h2>
        <p>{{ nextDay.reading }}</p>
        <div class="hero-card__actions">
          <button
            class="button button--primary"
            @click="navigate('plan', String(nextDay.day))"
          >
            繼續學習</button
          ><button class="button button--ghost" @click="navigate('quiz')">
            開始練習
          </button>
        </div>
        <dl class="figures" aria-label="作答統計">
          <div>
            <dt>作答次數</dt>
            <dd>{{ questionAttempts }}</dd>
            <dd class="figures__note">題庫共 {{ summary.questions }} 題</dd>
          </div>
          <div>
            <dt>累積正確率</dt>
            <dd>{{ accuracy }}%</dd>
            <dd class="figures__note">只計入已作答題目</dd>
          </div>
          <div>
            <dt>待複習錯題</dt>
            <dd>{{ wrongCount }}</dd>
            <dd class="figures__note">從錯題簿重新練習</dd>
          </div>
        </dl>
      </div>
      <div class="calendar" @keydown="moveInCalendar">
        <p class="calendar__summary">
          四週進度：已完成 <strong>{{ completedCount }}</strong
          >／{{ studyDays.length }} 天
        </p>
        <ol class="calendar__weeks">
          <li
            v-for="week in studyPlan.weeks"
            :key="week.id"
            class="calendar__week"
          >
            <span class="calendar__name"
              >第 {{ week.week }} 週　{{ week.title }}</span
            >
            <ol class="calendar__days">
              <li v-for="d in week.days" :key="d.day">
                <a
                  class="calendar__day"
                  :href="`#/plan/${d.day}`"
                  :data-state="dayState(d.day)"
                  :style="{ '--i': d.day }"
                  :title="`第 ${d.day} 天：${d.title}`"
                  :tabindex="d.day === nextDay.day ? 0 : -1"
                  :aria-current="d.day === nextDay.day ? 'step' : undefined"
                  :aria-label="`第 ${d.day} 天，${d.title}，${dayStateLabel[dayState(d.day)]}`"
                  ><span aria-hidden="true">{{
                    dayState(d.day) === "done" ? "✓" : d.day
                  }}</span></a
                >
              </li>
            </ol>
          </li>
        </ol>
      </div>
    </section>
    <div class="dashboard-grid">
      <section class="panel panel--span-2">
        <div class="panel__header">
          <h2>GH-600 考試地圖</h2>
          <span class="muted">最後核對：{{ examMeta.lastVerified }}</span>
        </div>
        <dl class="exam-facts">
          <div>
            <dt>認證</dt>
            <dd>{{ examMeta.exam.code }} {{ examMeta.exam.examName }}</dd>
          </div>
          <div>
            <dt>作答時間</dt>
            <dd>{{ examMeta.exam.durationMinutes }} 分鐘</dd>
          </div>
          <div>
            <dt>及格量尺分數</dt>
            <dd>{{ examMeta.exam.passingScore }}</dd>
          </div>
          <div>
            <dt>Study Guide 更新</dt>
            <dd>{{ examMeta.exam.studyGuideUpdatedAt }}</dd>
          </div>
        </dl>
        <ul class="weights" aria-label="六領域的考試權重區間">
          <li class="weights__axis" aria-hidden="true">
            <span></span
            ><span
              ><i v-for="tick in [0, 10, 20, 30]" :key="tick"
                >{{ tick }}%</i
              ></span
            ><span></span>
          </li>
          <li v-for="item in weights" :key="item.id">
            <span class="weights__name">{{ item.id }} {{ item.name }}</span>
            <span class="weights__bar" aria-hidden="true"
              ><i :style="{ left: item.left, width: item.width }"></i
            ></span>
            <strong>{{ item.label }}</strong>
          </li>
        </ul>
        <div class="inline-actions">
          <a :href="examMeta.exam.studyGuide" target="_blank" rel="noopener"
            >官方 Study Guide</a
          ><button @click="navigate('knowledge', 'd1')">閱讀教材</button>
        </div>
      </section>
      <section class="panel">
        <div class="panel__header">
          <h2>目前弱項</h2>
          <button class="text-button" @click="navigate('quiz')">去練習</button>
        </div>
        <div v-if="weakDomains.length" class="weak-list">
          <div v-for="item in weakDomains" :key="item.name" class="weak-item">
            <div>
              <strong>{{ item.name }}</strong
              ><span>累積 {{ item.total }} 次作答</span>
            </div>
            <span
              class="score-pill"
              :data-level="
                item.score >= 85 ? 'good' : item.score >= 70 ? 'mid' : 'low'
              "
              >{{ item.score }}%</span
            >
          </div>
        </div>
        <div v-else class="empty-card">
          <strong>尚無作答資料</strong
          ><span>完成練習後，這裡會顯示各領域的作答表現。</span>
        </div>
      </section>
      <section class="panel">
        <div class="panel__header">
          <h2>考試倒數</h2>
          <button class="text-button" @click="navigate('settings')">
            設定日期
          </button>
        </div>
        <div class="countdown-list">
          <div class="countdown-item">
            <div>
              <strong>{{ examMeta.exam.code }}</strong
              ><span>{{
                progress.examDates[examMeta.exam.code] || "尚未設定考試日期"
              }}</span>
            </div>
            <span class="score-pill">{{
              countdown(progress.examDates[examMeta.exam.code] || "")
            }}</span>
          </div>
        </div>
      </section>
      <section class="panel panel--span-2">
        <div class="panel__header">
          <h2>最近模擬紀錄</h2>
          <button class="text-button" @click="navigate('quiz')">
            開啟題庫
          </button>
        </div>
        <div v-if="recentAttempts.length" class="attempt-list">
          <div
            v-for="item in recentAttempts"
            :key="item.id"
            class="attempt-item"
          >
            <div>
              <strong>{{ item.exam }}／{{ item.mode }}</strong
              ><span
                >{{ formatDateTime(item.date) }}・{{ item.correct }}／{{
                  item.total
                }}
                題</span
              >
            </div>
            <span
              class="score-pill"
              :data-level="
                item.score >= 85 ? 'good' : item.score >= 70 ? 'mid' : 'low'
              "
              >{{ item.score }}%</span
            >
          </div>
        </div>
        <div v-else class="empty-card">
          <strong>還沒有模擬紀錄</strong
          ><span
            >題庫有 {{ questions.length }} 題，名詞庫有
            {{ terms.length }} 個詞。可先從 10 題練習開始。</span
          >
        </div>
      </section>
    </div>
  </section>
</template>
