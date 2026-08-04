const nonEmpty = (value) =>
  typeof value === "string" && value.trim().length > 0;
const unique = (values) => new Set(values).size === values.length;

export function validateContentData(data) {
  const errors = [];
  const fail = (message) => errors.push(message);
  const ok = (condition, message) => {
    if (!condition) fail(message);
  };
  const {
    plan,
    questions,
    glossary,
    sources,
    faq,
    qa,
    review,
    meta,
    summary,
    chapters = {},
  } = data;
  const exam = meta?.exam;
  const domains = exam?.domains ?? [];
  const domainIds = domains.map((domain) => domain.id);
  const objectiveIds = domains.flatMap(
    (domain) => domain.objectives?.map((objective) => objective.id) ?? [],
  );
  const sourceIds = new Set(sources?.map((source) => source.id) ?? []);
  const days = plan?.weeks?.flatMap((week) => week.days ?? []) ?? [];
  const terms =
    glossary?.categories?.flatMap((category) => category.terms ?? []) ?? [];

  ok(exam?.code === "GH-600", "考試代碼必須為 GH-600。");
  ok(domains.length === 6 && unique(domainIds), "必須定義六個不重複的領域。");
  ok(
    objectiveIds.length > 0 && unique(objectiveIds),
    "objective ID 不得為空或重複。",
  );
  ok(
    domains.every(
      (domain) =>
        Number.isFinite(domain.weight?.min) &&
        Number.isFinite(domain.weight?.max) &&
        domain.weight.min <= domain.weight.max,
    ),
    "領域權重格式錯誤。",
  );
  ok(
    plan?.weeks?.length === 4 && days.length === 28,
    "四週計畫必須有 4 週、28 天。",
  );
  ok(
    days.every(
      (day, index) =>
        day.day === index + 1 &&
        nonEmpty(day.title) &&
        nonEmpty(day.reading) &&
        nonEmpty(day.output) &&
        nonEmpty(day.passCriteria) &&
        domainIds.includes(day.domainId),
    ),
    "每日資料不完整、日次不連續或 domainId 無效。",
  );

  ok(
    Array.isArray(questions) && questions.length >= 60,
    "題庫至少需要 60 題，之後可持續擴充。",
  );
  ok(unique(questions.map((question) => question.id)), "題目 ID 重複。");
  const numbers = questions
    .map((question) => question.number)
    .sort((a, b) => a - b);
  ok(
    unique(numbers) &&
      numbers.every(
        (number, index) => Number.isInteger(number) && number === index + 1,
      ),
    "題號必須從 1 開始連續且不得重複。",
  );
  const allowedTypes = new Set(["single", "multiple", "true-false"]);
  for (const question of questions) {
    ok(question.exam === "GH-600", `${question.id} 考試代碼無效。`);
    ok(domainIds.includes(question.domainId), `${question.id} domainId 無效。`);
    ok(
      Array.isArray(question.objectiveIds) &&
        question.objectiveIds.length > 0 &&
        unique(question.objectiveIds) &&
        question.objectiveIds.every((id) => objectiveIds.includes(id)),
      `${question.id} objectiveIds 無效。`,
    );
    ok(
      Array.isArray(question.sourceIds) &&
        question.sourceIds.length > 0 &&
        unique(question.sourceIds) &&
        question.sourceIds.every((id) => sourceIds.has(id)),
      `${question.id} sourceIds 無效。`,
    );
    ok(allowedTypes.has(question.type), `${question.id} 題型不支援。`);
    ok(
      [
        question.question,
        question.explanation,
        question.trap,
        question.domain,
        question.difficulty,
      ].every(nonEmpty),
      `${question.id} 缺少必要文字欄位。`,
    );
    ok(
      Array.isArray(question.keywords) && question.keywords.every(nonEmpty),
      `${question.id} keywords 格式錯誤。`,
    );
    if (question.type === "true-false") {
      ok(
        typeof question.answer === "boolean" && question.options === undefined,
        `${question.id} 是非題契約錯誤。`,
      );
      continue;
    }
    const options = question.options ?? [];
    const optionIds = options.map((option) => option.id);
    ok(
      options.length >= 2 &&
        unique(optionIds) &&
        options.every((option) => nonEmpty(option.id) && nonEmpty(option.text)),
      `${question.id} 選項契約錯誤。`,
    );
    if (question.type === "multiple") {
      ok(
        Array.isArray(question.answer) &&
          question.answer.length >= 2 &&
          unique(question.answer) &&
          question.answer.every((id) => optionIds.includes(id)),
        `${question.id} 複選答案契約錯誤。`,
      );
    } else {
      ok(
        typeof question.answer === "string" &&
          optionIds.includes(question.answer),
        `${question.id} 單選答案契約錯誤。`,
      );
    }
  }

  for (const domain of domains) {
    const count = questions.filter(
      (question) => question.domainId === domain.id,
    ).length;
    const ratio = (count / questions.length) * 100;
    ok(
      ratio >= domain.weight.min && ratio <= domain.weight.max,
      `${domain.id} 題數比例 ${ratio.toFixed(2)}% 超出 ${domain.weight.min}%–${domain.weight.max}%。`,
    );
  }
  for (const objectiveId of objectiveIds) {
    ok(
      questions.some((question) => question.objectiveIds.includes(objectiveId)),
      `${objectiveId} 沒有題目覆蓋。`,
    );
    ok(
      Object.values(chapters).some((chapter) =>
        chapter.includes(`## ${objectiveId} `),
      ),
      `${objectiveId} 沒有教材段落覆蓋。`,
    );
  }

  ok(
    terms.length >= 120 && unique(terms.map((term) => term.id)),
    "名詞庫至少需要 120 個不重複詞條。",
  );
  ok(
    Array.isArray(sources) &&
      sources.length === 30 &&
      unique(sources.map((source) => source.id)),
    "官方來源必須正好 30 項且 ID 不重複。",
  );
  for (const source of sources) {
    let host = "";
    try {
      host = new URL(source.url).hostname;
    } catch {}
    ok(
      nonEmpty(source.id) &&
        nonEmpty(source.title) &&
        nonEmpty(source.publisher) &&
        ["learn.microsoft.com", "docs.github.com"].includes(host),
      `${source.id || "未知來源"} 不是允許的官方 URL。`,
    );
  }
  ok(
    faq?.length >= 24 &&
      qa?.length >= 24 &&
      unique([...faq, ...qa].map((item) => item.id)),
    "FAQ 與情境 Q&A 各至少 24 題且 ID 不重複。",
  );
  ok(
    review?.mustRemember?.["GH-600"]?.length >= 36,
    "GH-600 必背句至少需要 36 條。",
  );
  ok(
    summary?.studyDays === days.length &&
      summary?.glossaryTerms === terms.length &&
      summary?.officialSources === sources.length &&
      summary?.faqItems === faq.length &&
      summary?.scenarioItems === qa.length &&
      summary?.mustRemember === review.mustRemember["GH-600"].length,
    "內容摘要與實際資料不一致。",
  );
  return errors;
}
