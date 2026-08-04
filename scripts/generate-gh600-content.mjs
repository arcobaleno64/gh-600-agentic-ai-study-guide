import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const writeJson = (path, value) =>
  writeFileSync(
    join(root, path),
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8",
  );
const writeText = (path, value) =>
  writeFileSync(join(root, path), `${value.trim()}\n`, "utf8");

const domains = [
  {
    id: "D1",
    name: "準備代理架構與 SDLC 流程",
    weight: { min: 15, max: 20 },
    objectives: [
      { id: "D1-O1", name: "將代理整合至軟體開發生命週期" },
      { id: "D1-O2", name: "定義規劃、推理與行動的界線" },
      { id: "D1-O3", name: "設定自主代理的可觀測性與控制" },
    ],
  },
  {
    id: "D2",
    name: "實作工具使用與環境互動",
    weight: { min: 20, max: 25 },
    objectives: [
      { id: "D2-O1", name: "選擇與設定代理工具" },
      { id: "D2-O2", name: "設定 MCP 伺服器" },
      { id: "D2-O3", name: "將代理整合至開發環境" },
      { id: "D2-O4", name: "以安全執行路徑與健全錯誤處理操作代理" },
    ],
  },
  {
    id: "D3",
    name: "管理記憶、狀態與執行",
    weight: { min: 10, max: 15 },
    objectives: [
      { id: "D3-O1", name: "實作代理記憶策略" },
      { id: "D3-O2", name: "保留代理狀態並管理脈絡漂移" },
      { id: "D3-O3", name: "確保跨工具與環境的記憶及狀態連續性" },
    ],
  },
  {
    id: "D4",
    name: "執行評估、錯誤分析與調校",
    weight: { min: 15, max: 20 },
    objectives: [
      { id: "D4-O1", name: "定義成功標準與評估訊號" },
      { id: "D4-O2", name: "分析代理失敗並識別根因" },
      { id: "D4-O3", name: "依評估結果調整代理行為" },
    ],
  },
  {
    id: "D5",
    name: "協調多代理協作",
    weight: { min: 15, max: 20 },
    objectives: [
      { id: "D5-O1", name: "操作與管理多代理工作流程" },
      { id: "D5-O2", name: "設定多代理行為的可觀測性" },
      { id: "D5-O3", name: "偵測並回應多代理失敗與效能退化" },
      { id: "D5-O4", name: "管理多代理工作流程中的代理生命週期" },
    ],
  },
  {
    id: "D6",
    name: "實作護欄與課責",
    weight: { min: 10, max: 15 },
    objectives: [
      { id: "D6-O1", name: "定義自主程度" },
      { id: "D6-O2", name: "實作護欄與人工介入工作流程" },
    ],
  },
];

const sources = [
  [
    "GH600-CERT",
    "GitHub Certified: Agentic AI Developer",
    "https://learn.microsoft.com/en-us/credentials/certifications/agentic-ai-developer/",
    "Microsoft Learn",
  ],
  [
    "GH600-SG",
    "Exam GH-600 Study Guide",
    "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-600",
    "Microsoft Learn",
  ],
  [
    "GH-DOC-01",
    "About GitHub Copilot agents",
    "https://docs.github.com/en/copilot/concepts/agents",
    "GitHub Docs",
  ],
  [
    "GH-DOC-02",
    "About GitHub Copilot coding agent",
    "https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent",
    "GitHub Docs",
  ],
  [
    "GH-DOC-03",
    "Best practices for Copilot coding agent",
    "https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results",
    "GitHub Docs",
  ],
  [
    "GH-DOC-04",
    "Adding repository custom instructions",
    "https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions",
    "GitHub Docs",
  ],
  [
    "GH-DOC-05",
    "About custom agents",
    "https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents",
    "GitHub Docs",
  ],
  [
    "GH-DOC-06",
    "Custom agents configuration",
    "https://docs.github.com/en/copilot/reference/custom-agents-configuration",
    "GitHub Docs",
  ],
  [
    "GH-DOC-07",
    "About Model Context Protocol",
    "https://docs.github.com/en/copilot/concepts/context/mcp",
    "GitHub Docs",
  ],
  [
    "GH-DOC-08",
    "Extending Copilot coding agent with MCP",
    "https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-coding-agent-with-mcp",
    "GitHub Docs",
  ],
  [
    "GH-DOC-09",
    "Configuring access to MCP servers",
    "https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp",
    "GitHub Docs",
  ],
  [
    "GH-DOC-10",
    "About hooks for GitHub Copilot",
    "https://docs.github.com/en/copilot/concepts/agents/hooks",
    "GitHub Docs",
  ],
  [
    "GH-DOC-11",
    "GitHub Copilot hooks reference",
    "https://docs.github.com/en/copilot/reference/hooks-reference",
    "GitHub Docs",
  ],
  [
    "GH-DOC-12",
    "Customizing the development environment",
    "https://docs.github.com/en/copilot/customizing-copilot/customizing-the-development-environment-for-copilot-coding-agent",
    "GitHub Docs",
  ],
  [
    "GH-DOC-13",
    "About GitHub Actions",
    "https://docs.github.com/en/actions/about-github-actions/understanding-github-actions",
    "GitHub Docs",
  ],
  [
    "GH-DOC-14",
    "About protected branches",
    "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches",
    "GitHub Docs",
  ],
  [
    "GH-DOC-15",
    "About rulesets",
    "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets",
    "GitHub Docs",
  ],
  [
    "GH-DOC-16",
    "Reviewing pull requests",
    "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews",
    "GitHub Docs",
  ],
  [
    "GH-DOC-17",
    "About status checks",
    "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks",
    "GitHub Docs",
  ],
  [
    "GH-DOC-18",
    "About secret scanning",
    "https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning",
    "GitHub Docs",
  ],
  [
    "GH-DOC-19",
    "About code scanning",
    "https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning",
    "GitHub Docs",
  ],
  [
    "GH-DOC-20",
    "About dependency review",
    "https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review",
    "GitHub Docs",
  ],
  [
    "GH-DOC-21",
    "Responsible use of Copilot coding agent",
    "https://docs.github.com/en/copilot/responsible-use/copilot-coding-agent",
    "GitHub Docs",
  ],
  [
    "GH-DOC-22",
    "Troubleshooting Copilot coding agent",
    "https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-copilot-coding-agent",
    "GitHub Docs",
  ],
  [
    "GH-DOC-23",
    "About GitHub Copilot Memory",
    "https://docs.github.com/en/copilot/concepts/agents/copilot-memory",
    "GitHub Docs",
  ],
  [
    "GH-DOC-24",
    "About Copilot code review",
    "https://docs.github.com/en/copilot/concepts/agents/code-review",
    "GitHub Docs",
  ],
  [
    "GH-DOC-25",
    "About GitHub-hosted runners",
    "https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners",
    "GitHub Docs",
  ],
  [
    "GH-DOC-26",
    "Using secrets in GitHub Actions",
    "https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions",
    "GitHub Docs",
  ],
  [
    "GH-DOC-27",
    "Security hardening for GitHub Actions",
    "https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions",
    "GitHub Docs",
  ],
  [
    "GH-DOC-28",
    "Copilot customization cheat sheet",
    "https://docs.github.com/en/copilot/reference/customization-cheat-sheet",
    "GitHub Docs",
  ],
].map(([id, title, url, publisher]) => ({ id, title, url, publisher }));

const examMeta = {
  lastVerified: "2026-08-04",
  disclaimer:
    "本網站是繁體中文原創學習整理，並非 Microsoft 或 GitHub 官方出版品；不包含實際考題、考古題或外洩題庫。正式應考前請重新核對官方認證頁與 Study Guide。",
  exam: {
    code: "GH-600",
    certificationName: "GitHub Certified: Agentic AI Developer",
    examName: "Developing in Agentic AI Systems",
    durationMinutes: 120,
    passingScore: 700,
    languages: ["English"],
    studyGuideUpdatedAt: "2026-05-14",
    domains,
    studyGuide: sources[1].url,
    certificationPage: sources[0].url,
  },
};

const days = [
  [
    "建立考試地圖",
    "讀認證頁、Study Guide 與六領域權重。",
    "畫出六領域與 19 個 objective 的一頁地圖。",
    "能不看資料說出六領域順序與權重區間。",
    "D1",
  ],
  [
    "代理系統與 SDLC",
    "代理工作流程、適合交給代理的步驟與常見反模式。",
    "列出一個開發任務的輸入、輸出及成功標準。",
    "能區分目標不清、範圍過大與缺乏驗證三種反模式。",
    "D1",
  ],
  [
    "規劃、推理與行動",
    "結構化計畫、審查閘門與行動延後。",
    "把一個高風險任務拆成 plan／approve／act。",
    "能說明為何計畫核准不等於所有動作都獲准。",
    "D1",
  ],
  [
    "自主程度",
    "依風險調整自主程度、護欄與人工介入。",
    "建立低、中、高風險動作矩陣。",
    "每一級都能指出允許動作與升級條件。",
    "D1",
  ],
  [
    "可檢查產物",
    "讓代理產生 diff、測試、log、trace 與 PR。",
    "設計一份最小審查證據清單。",
    "清單能讓另一人重現代理做了什麼。",
    "D1",
  ],
  [
    "D1 題組",
    "重讀 D1 三個 objectives 並做題。",
    "完成 D1 錯題分類。",
    "D1 題組達 80%，且每個錯誤都有原因。",
    "D1",
  ],
  [
    "週一回顧",
    "整合 SDLC、界線與控制。",
    "口述一個從 issue 到 PR 的受控代理流程。",
    "能在五分鐘內完成且不混淆護欄與評估。",
    "D1",
  ],
  [
    "工具選擇",
    "工具能力、工具說明、最小權限與輸入驗證。",
    "替一個代理列出必要工具與拒絕工具。",
    "每個工具都有可驗證的必要性。",
    "D2",
  ],
  [
    "工具權限",
    "讀寫範圍、分支範圍、憑證與危險操作。",
    "建立工具權限表。",
    "權限符合最小權限且沒有萬用範圍。",
    "D2",
  ],
  [
    "MCP 核心",
    "MCP server、tool、resource、transport 與信任邊界。",
    "畫出代理到 MCP 再到外部系統的資料流。",
    "能指出憑證、輸入與輸出的三個邊界。",
    "D2",
  ],
  [
    "MCP 設定",
    "遠端 MCP、registry、allowlist 與工具命名空間。",
    "審查一份 MCP 設定範例。",
    "能找出未限制工具與不當 secret 傳遞。",
    "D2",
  ],
  [
    "開發環境",
    "repo、branch、runner、setup steps 與環境限制。",
    "定義一個可重現的代理執行環境。",
    "從乾淨環境可安裝、測試並產生相同結果。",
    "D2",
  ],
  [
    "CI 中的代理",
    "工作流程觸發、權限、產物與 PR 路徑。",
    "設計一條只在必要事件啟動的代理 CI。",
    "觸發條件與權限均可解釋。",
    "D2",
  ],
  [
    "健全錯誤處理",
    "retry、timeout、cancel、escalation 與冪等性。",
    "為三種失敗指定 retry 或停止策略。",
    "不會對永久錯誤盲目重試。",
    "D2",
  ],
  [
    "追溯與課責",
    "動作 log、actor、輸入、工具結果與核准紀錄。",
    "定義一次代理執行的 audit record。",
    "能回答誰、何時、為何、用什麼工具做了什麼。",
    "D2",
  ],
  [
    "D2 題組",
    "完成工具、MCP、環境與錯誤處理題組。",
    "整理五個最常混淆點。",
    "D2 題組達 80%。",
    "D2",
  ],
  [
    "記憶策略",
    "短期、長期與外部記憶的用途與風險。",
    "為一個任務選擇記憶層級。",
    "只保存任務需要且可治理的資訊。",
    "D3",
  ],
  [
    "過期與裁剪",
    "expiry、pruning、reset 與敏感資料最小化。",
    "定義三條記憶生命週期規則。",
    "能防止過期脈絡繼續影響決策。",
    "D3",
  ],
  [
    "狀態與脈絡漂移",
    "決策紀錄、checkpoint、resume 與 drift detection。",
    "建立可恢復的任務 checkpoint。",
    "恢復後不重做已完成步驟。",
    "D3",
  ],
  [
    "跨工具連續性",
    "共享狀態、衝突來源與 source of truth。",
    "指定跨 IDE／CI 的唯一權威狀態。",
    "能解決矛盾與陳舊脈絡。",
    "D3",
  ],
  [
    "成功標準",
    "預期成果、操作限制、定量與定性訊號。",
    "為一個代理任務寫驗收標準。",
    "標準可在執行後客觀判定。",
    "D4",
  ],
  [
    "自動評估訊號",
    "測試、lint、code scanning、secret scanning 與產物。",
    "把三個自動訊號連到失敗處理。",
    "每個訊號都有明確閾值與責任人。",
    "D4",
  ],
  [
    "錯誤與根因",
    "利用 log、plan、trace、output 分類失敗。",
    "完成一張 reasoning／tool／context／environment 魚骨圖。",
    "能區分症狀與根因。",
    "D4",
  ],
  [
    "行為調校",
    "調整 instructions、workflow、constraints、memory 與 tools。",
    "針對一個根因只改一個主要變因。",
    "重新評估可證明改善而非偶然。",
    "D4",
  ],
  [
    "多代理協調",
    "主管／工作者、管線、平行分工與共享黑板。",
    "替一個任務選擇協調模式。",
    "分工邊界清楚且輸出可合併。",
    "D5",
  ],
  [
    "隔離與衝突",
    "worktree、檔案所有權、重複工作與矛盾輸出。",
    "定義平行代理的隔離規則。",
    "沒有兩個代理同時修改同一範圍。",
    "D5",
  ],
  [
    "恢復與生命週期",
    "partial、stalled、rollback、replacement 與 audit continuity。",
    "設計一個失敗代理的替換流程。",
    "更換代理不會遺失決策與稽核鏈。",
    "D5",
  ],
  [
    "總模擬與補弱",
    "完成 60 題混合模擬並複習最低兩領域。",
    "產出最後一頁弱點清單。",
    "總正確率達 85%，且六領域皆不低於 75%。",
    "D6",
  ],
];
const studyPlan = {
  version: "1.0.0",
  weeks: Array.from({ length: 4 }, (_, week) => ({
    id: `week-${week + 1}`,
    week: week + 1,
    title: [
      "架構與 SDLC",
      "工具、MCP 與環境",
      "記憶、評估與調校",
      "多代理、護欄與總複習",
    ][week],
    days: days.slice(week * 7, week * 7 + 7).map((d, index) => ({
      day: week * 7 + index + 1,
      title: d[0],
      reading: d[1],
      output: d[2],
      passCriteria: d[3],
      domainId: d[4],
    })),
  })),
  wrongAnswerMethod: [
    {
      type: "觀念錯置",
      symptom: "把不同控制層或生命週期階段混在一起。",
      remedy: "回到 objective，寫出邊界與反例。",
    },
    {
      type: "題幹漏讀",
      symptom: "忽略最小權限、不可逆或跨環境等限制詞。",
      remedy: "圈出動詞與限制後再看選項。",
    },
    {
      type: "產品記憶",
      symptom: "只憑產品名稱選答案。",
      remedy: "先判斷能力與風險，再對應產品。",
    },
    {
      type: "過度設計",
      symptom: "替題目加入未要求的元件與流程。",
      remedy: "選能直接滿足全部明示條件的最小方案。",
    },
  ],
};

const domainSources = {
  D1: ["GH600-SG", "GH-DOC-02", "GH-DOC-03", "GH-DOC-04"],
  D2: ["GH600-SG", "GH-DOC-07", "GH-DOC-08", "GH-DOC-09", "GH-DOC-12"],
  D3: ["GH600-SG", "GH-DOC-23", "GH-DOC-04"],
  D4: ["GH600-SG", "GH-DOC-19", "GH-DOC-24", "GH-DOC-22"],
  D5: ["GH600-SG", "GH-DOC-05", "GH-DOC-06", "GH-DOC-17"],
  D6: ["GH600-SG", "GH-DOC-10", "GH-DOC-11", "GH-DOC-14", "GH-DOC-21"],
};
const o = (...texts) =>
  texts.map((text, index) => ({ id: String.fromCharCode(65 + index), text }));
const questionSpecs = {
  D1: [
    [
      "multiple",
      "一個團隊要讓代理處理 issue 到 PR 的流程。哪些定義應在執行前完成？",
      o("輸入與輸出", "成功標準", "每次都使用最高權限", "失敗與升級路徑"),
      ["A", "B", "D"],
      "D1-O1",
    ],
    [
      "multiple",
      "哪些做法能清楚分離規劃與行動？",
      o(
        "先輸出結構化計畫",
        "核准前禁止寫入",
        "把計畫與執行混成一個不可中斷步驟",
        "驗證計畫涵蓋限制",
      ),
      ["A", "B", "D"],
      "D1-O2",
    ],
    [
      "true-false",
      "只要代理產生了可讀的計畫，就可以視為後續所有工具動作都已獲授權。",
      null,
      false,
      "D1-O2",
    ],
    [
      "single",
      "哪一項最能讓代理工作在標準開發工具中接受審查？",
      o(
        "只回報口頭摘要",
        "產生包含 diff、測試結果與來源 issue 的 PR",
        "隱藏失敗 log",
        "直接寫入受保護分支",
      ),
      "B",
      "D1-O3",
    ],
    [
      "single",
      "把模糊的大型需求直接交給代理、未定義完成條件，最接近哪種問題？",
      o("良好委派", "代理反模式", "狀態連續性", "工具 allowlist"),
      "B",
      "D1-O1",
    ],
    [
      "single",
      "高風險資料刪除工作應採用哪種最小控制？",
      o(
        "提高 temperature",
        "執行前人工核准並保留回滾",
        "增加長期記憶",
        "平行啟動更多代理",
      ),
      "B",
      "D1-O3",
    ],
    [
      "single",
      "何者是可驗證的成功標準？",
      o(
        "結果看起來不錯",
        "代理盡力完成",
        "指定測試全數通過且只修改授權檔案",
        "回覆內容很長",
      ),
      "C",
      "D1-O1",
    ],
    [
      "single",
      "要避免代理一邊規劃一邊進行未審查的部署，最直接的設計是什麼？",
      o("增加提示長度", "建立 plan approval gate", "改用長期記憶", "移除 log"),
      "B",
      "D1-O2",
    ],
    [
      "single",
      "低風險且可回滾的格式修正，適合哪種自主程度？",
      o(
        "在明確範圍內自動執行並驗證",
        "一律要求高階主管逐字核准",
        "完全禁止代理",
        "賦予組織管理權限",
      ),
      "A",
      "D1-O3",
    ],
    [
      "single",
      "可觀測性資料最重要的用途是什麼？",
      o(
        "增加模型上下文直到無限",
        "重建代理決策、工具動作與結果",
        "取代所有測試",
        "讓輸出更像人類",
      ),
      "B",
      "D1-O3",
    ],
  ],
  D2: [
    [
      "multiple",
      "選擇代理工具時應同時評估哪些項目？",
      o("任務必要性", "最小權限", "輸入輸出驗證", "圖示顏色"),
      ["A", "B", "C"],
      "D2-O1",
    ],
    [
      "multiple",
      "健全的代理錯誤處理通常包含哪些能力？",
      o("有界重試", "取消與逾時", "升級路徑", "對所有錯誤無限重試"),
      ["A", "B", "C"],
      "D2-O4",
    ],
    [
      "true-false",
      "MCP server 已列入設定檔，就代表它提供的每個工具都應自動獲得完整權限。",
      null,
      false,
      "D2-O2",
    ],
    [
      "single",
      "代理只需讀取 repository 內容時，最佳權限為何？",
      o(
        "組織擁有者",
        "repository 唯讀",
        "所有 repository 寫入",
        "雲端帳戶管理員",
      ),
      "B",
      "D2-O1",
    ],
    [
      "single",
      "MCP allowlist 的主要作用是什麼？",
      o(
        "控制允許連線或使用的 MCP 來源與工具",
        "自動修正程式",
        "保存長期記憶",
        "提高題庫分數",
      ),
      "A",
      "D2-O2",
    ],
    [
      "single",
      "哪項資訊不應硬編碼在 repository 的 MCP 設定？",
      o("server 名稱", "工具描述", "存取權杖", "允許的工具名稱"),
      "C",
      "D2-O2",
    ],
    [
      "single",
      "要讓代理從乾淨 runner 重現本機結果，應優先提供什麼？",
      o(
        "setup steps 與鎖定依賴",
        "個人 shell history",
        "未記錄的全域套件",
        "本機快取",
      ),
      "A",
      "D2-O3",
    ],
    [
      "single",
      "限制代理只在指定 branch 工作，主要降低哪一種風險？",
      o("脈絡視窗太短", "未授權範圍被修改", "測試執行太快", "題目太少"),
      "B",
      "D2-O3",
    ],
    [
      "single",
      "暫時性網路 503 適合什麼處理？",
      o("有上限的指數退避重試", "永久忽略", "立即刪除資料", "無限快速重試"),
      "A",
      "D2-O4",
    ],
    [
      "single",
      "權限拒絕錯誤重試三次仍相同，下一步應是什麼？",
      o("繼續重試", "停止並沿升級路徑回報", "提高權限且不記錄", "清除所有 log"),
      "B",
      "D2-O4",
    ],
    [
      "single",
      "哪個紀錄最能支援工具動作課責？",
      o(
        "只有最終自然語言摘要",
        "時間、actor、工具、輸入摘要、結果與核准者",
        "只有 CPU 使用率",
        "只有模型名稱",
      ),
      "B",
      "D2-O4",
    ],
    [
      "single",
      "代理在 CI 建立 PR 時，哪個設計較安全？",
      o(
        "直接 push 到受保護 main",
        "使用受限 token 建分支與 PR，再經 checks/review",
        "關閉 branch protection",
        "跳過所有 hooks",
      ),
      "B",
      "D2-O3",
    ],
    [
      "single",
      "工具描述含糊最可能造成什麼問題？",
      o(
        "代理誤選或誤用工具",
        "repository 自動封存",
        "MCP transport 加密",
        "測試自動變快",
      ),
      "A",
      "D2-O1",
    ],
    [
      "single",
      "取消訊號應如何處理？",
      o(
        "代理停止新動作、清理可安全清理的資源並記錄狀態",
        "忽略直到任務完成",
        "改寫 main",
        "刪除稽核資料",
      ),
      "A",
      "D2-O4",
    ],
  ],
  D3: [
    [
      "multiple",
      "長期記憶治理應包含哪些規則？",
      o("相關性範圍", "到期與裁剪", "重設條件", "永久保存所有提示"),
      ["A", "B", "C"],
      "D3-O1",
    ],
    [
      "multiple",
      "哪些產物有助於長時間任務恢復而不重做？",
      o("checkpoint", "決策紀錄", "已完成步驟清單", "未保存的口頭假設"),
      ["A", "B", "C"],
      "D3-O2",
    ],
    [
      "true-false",
      "跨工具共享狀態時，來源越多越好，不需要指定權威來源。",
      null,
      false,
      "D3-O3",
    ],
    [
      "single",
      "只供本次工具呼叫使用的中間結果，最適合哪種記憶？",
      o("短期記憶", "永久組織記憶", "公開 wiki", "憑證庫"),
      "A",
      "D3-O1",
    ],
    [
      "single",
      "偵測到代理開始違反先前已核准決策，這稱為什麼？",
      o("脈絡漂移", "有界重試", "工具 allowlist", "依賴掃描"),
      "A",
      "D3-O2",
    ],
    [
      "single",
      "跨 IDE 與 CI 出現矛盾任務狀態時，最佳處理為何？",
      o(
        "選最新但未驗證的訊息",
        "依指定 source of truth 對帳並記錄解決結果",
        "同時保留兩個矛盾狀態",
        "刪除全部紀錄",
      ),
      "B",
      "D3-O3",
    ],
    [
      "single",
      "敏感資料已不再與任務相關，記憶策略應如何處理？",
      o(
        "永久保留",
        "依到期或重設規則移除",
        "複製到更多工具",
        "放進 prompt 範例",
      ),
      "B",
      "D3-O1",
    ],
    [
      "single",
      "恢復中斷任務前最應先讀什麼？",
      o(
        "checkpoint、決策與剩餘工作",
        "隨機另一個 repo",
        "模型行銷頁",
        "所有歷史聊天全文",
      ),
      "A",
      "D3-O2",
    ],
  ],
  D4: [
    [
      "multiple",
      "有效的代理評估可包含哪些訊號？",
      o("測試通過率", "安全掃描結果", "人工品質評分", "回覆字數越多越好"),
      ["A", "B", "C"],
      "D4-O1",
    ],
    [
      "multiple",
      "分析代理失敗時應檢查哪些證據？",
      o(
        "plan 與 trace",
        "工具呼叫與 log",
        "輸出與 workflow artifacts",
        "只看最終一句話",
      ),
      ["A", "B", "C"],
      "D4-O2",
    ],
    [
      "true-false",
      "評估分數變差時，同時更換模型、工具、記憶與工作流程最容易找出根因。",
      null,
      false,
      "D4-O3",
    ],
    [
      "single",
      "哪一項是定量評估訊號？",
      o("reviewer 覺得合理", "測試通過 98/100", "語氣專業", "解釋清楚"),
      "B",
      "D4-O1",
    ],
    [
      "single",
      "代理呼叫正確工具但使用錯誤參數，根因類別最接近什麼？",
      o("工具誤用", "記憶到期", "多代理生命週期", "自主程度"),
      "A",
      "D4-O2",
    ],
    [
      "single",
      "runner 缺少必要 SDK 造成 build 失敗，根因類別為何？",
      o("推理錯誤", "環境問題", "護欄過強", "人工審查"),
      "B",
      "D4-O2",
    ],
    [
      "single",
      "評估顯示代理持續讀取不相關檔案，最小調校為何？",
      o(
        "收窄指令與工具範圍",
        "加入更多長期記憶",
        "移除所有限制",
        "加倍平行代理",
      ),
      "A",
      "D4-O3",
    ],
    [
      "single",
      "要判斷調校是否有效，應怎麼做？",
      o(
        "用同一評估集重新測量並比較",
        "只看單一成功案例",
        "改完立即宣告完成",
        "刪除基準結果",
      ),
      "A",
      "D4-O3",
    ],
    [
      "single",
      "成功標準應與什麼對齊？",
      o("開發意圖與操作限制", "模型偏好的格式", "最長輸出", "工具數量"),
      "A",
      "D4-O1",
    ],
    [
      "single",
      "code scanning 找到新增高風險弱點時，這是什麼類型訊號？",
      o("自動評估與安全訊號", "短期記憶", "協調模式", "考試語言"),
      "A",
      "D4-O1",
    ],
  ],
  D5: [
    [
      "multiple",
      "平行多代理隔離可使用哪些控制？",
      o(
        "獨立 worktree 或 branch",
        "明確檔案所有權",
        "避免重疊任務",
        "共享同一未鎖定工作目錄",
      ),
      ["A", "B", "C"],
      "D5-O1",
    ],
    [
      "multiple",
      "多代理 audit artifact 應記錄哪些內容？",
      o("任務交接", "關鍵決策", "各代理結果", "只記錄成功代理"),
      ["A", "B", "C"],
      "D5-O2",
    ],
    [
      "true-false",
      "替換失敗代理時，為了乾淨起見應丟棄先前全部決策與稽核紀錄。",
      null,
      false,
      "D5-O4",
    ],
    [
      "single",
      "兩個代理修改同一檔案造成衝突，首先應做什麼？",
      o(
        "讓第三個代理也修改",
        "停止重疊工作、比較意圖並指定單一整合者",
        "直接選較長的 diff",
        "刪除兩邊紀錄",
      ),
      "B",
      "D5-O1",
    ],
    [
      "single",
      "多代理流程中某代理長時間無進度，屬於哪種狀態？",
      o("stalled", "success", "pruned", "allowlisted"),
      "A",
      "D5-O3",
    ],
    [
      "single",
      "部分代理完成、部分失敗時，最合理的恢復起點是什麼？",
      o(
        "從可驗證 checkpoint 判定可保留產物，再重派失敗範圍",
        "全部盲目重跑",
        "直接合併所有輸出",
        "關閉 log",
      ),
      "A",
      "D5-O3",
    ],
    [
      "single",
      "哪種模式適合先由多個專家各自分析，再由一個角色整合？",
      o("主管／工作者模式", "無協調共享寫入", "永久重試", "單一工具 allowlist"),
      "A",
      "D5-O1",
    ],
    [
      "single",
      "post-hoc 分析需要哪種資料？",
      o(
        "代理 log、artifact、交接與操作訊號",
        "只看最終 PR 標題",
        "只看 token 數",
        "只看執行時間",
      ),
      "A",
      "D5-O2",
    ],
    [
      "single",
      "更新代理而不干擾進行中工作，應優先使用什麼策略？",
      o(
        "版本化設定、受控切換與狀態交接",
        "直接覆寫執行中程序",
        "刪除 checkpoint",
        "取消全部 audit",
      ),
      "A",
      "D5-O4",
    ],
    [
      "single",
      "兩個代理回報互相矛盾的結論，整合者應怎麼做？",
      o(
        "隨機選一個",
        "回到共享證據與驗收標準裁決並記錄原因",
        "同時宣稱兩者正確",
        "增加輸出字數",
      ),
      "B",
      "D5-O3",
    ],
  ],
  D6: [
    [
      "multiple",
      "哪些動作通常需要較強人工介入？",
      o(
        "不可逆資料刪除",
        "擴大正式環境權限",
        "影響合規的政策變更",
        "讀取公開文件",
      ),
      ["A", "B", "C"],
      "D6-O1",
    ],
    [
      "multiple",
      "有效護欄可包含哪些控制？",
      o("最小權限", "policy block", "明確核准路徑", "隱藏稽核紀錄"),
      ["A", "B", "C"],
      "D6-O2",
    ],
    [
      "true-false",
      "為了維持速度，任何人工核准都應移除，即使它能降低不可逆變更風險。",
      null,
      false,
      "D6-O2",
    ],
    [
      "single",
      "自主程度最應依什麼調整？",
      o("操作、資安與合規風險", "模型名稱長度", "代理頭像", "輸出語言"),
      "A",
      "D6-O1",
    ],
    [
      "single",
      "哪一種核准最可能是無效摩擦？",
      o(
        "不降低實質風險卻對每個唯讀動作逐次核准",
        "部署正式環境前核准",
        "刪除資料前核准",
        "提高權限前核准",
      ),
      "A",
      "D6-O2",
    ],
    [
      "single",
      "代理嘗試執行政策禁止的命令時，護欄應如何反應？",
      o("阻擋並留下可稽核原因", "靜默放行", "改寫政策", "刪除 log"),
      "A",
      "D6-O2",
    ],
    [
      "single",
      "最低權限的核心是什麼？",
      o(
        "只授予完成明確任務所需的最小存取",
        "預先給全部權限",
        "每次都用管理員",
        "把 token 寫入設定",
      ),
      "A",
      "D6-O2",
    ],
    [
      "single",
      "受控路徑對敏感變更的價值是什麼？",
      o(
        "把授權、執行、驗證與稽核串成可追溯流程",
        "保證模型永不出錯",
        "取代所有測試",
        "取消責任歸屬",
      ),
      "A",
      "D6-O1",
    ],
  ],
};

const questions = [];
for (const domain of domains) {
  const specs = questionSpecs[domain.id];
  specs.forEach(([type, question, options, answer, objectiveId], index) => {
    questions.push({
      id: `GH600-${String(questions.length + 1).padStart(3, "0")}`,
      exam: "GH-600",
      number: questions.length + 1,
      domainId: domain.id,
      objectiveIds: [objectiveId],
      sourceIds: domainSources[domain.id].slice(0, 2),
      type,
      ...(options ? { options } : {}),
      answer,
      question,
      explanation: `本題對應 ${objectiveId}。應先辨識題幹的控制目標，再選擇能直接滿足需求且保留驗證與課責的做法。`,
      trap: "不要因代理能自動化就推定它已獲得更大範圍或更高權限。",
      domain: domain.name,
      difficulty: index < 3 ? "中等" : index < 7 ? "基礎" : "進階",
      keywords: [domain.id, objectiveId],
    });
  });
}

const glossaryGroups = {
  D1: [
    [
      "Agentic AI system",
      "能以目標為導向規劃、使用工具並在環境中採取行動的 AI 系統。",
    ],
    ["Agent workflow", "代理從接收任務、規劃、執行到驗證與回報的受控流程。"],
    ["SDLC", "軟體從規劃、開發、測試、部署到維護的生命週期。"],
    ["Input contract", "代理可接受資料的格式、範圍與前置條件。"],
    ["Output contract", "代理必須產出的格式、內容與品質條件。"],
    ["Success criteria", "能客觀判定任務是否完成的驗收條件。"],
    [
      "Agent anti-pattern",
      "容易造成失控、不可驗證或低品質結果的代理設計模式。",
    ],
    ["Planning", "在行動前建立步驟、依賴、風險與驗證方式。"],
    ["Reasoning", "依目標與脈絡選擇下一步的判斷過程。"],
    ["Action", "透過工具對 repository、服務或環境造成可觀察效果。"],
    ["Approval gate", "在特定風險點要求授權後才允許流程繼續。"],
    ["Structured plan", "具有明確步驟、狀態、輸入與完成條件的計畫。"],
    ["Autonomy level", "代理在不需人工介入下可採取行動的程度。"],
    ["Human intervention", "由人類審查、核准、修正或停止代理行動。"],
    ["Inspectability", "能由產物重建與檢查代理工作內容的特性。"],
    ["Artifact", "代理產生且可保存、審查或稽核的輸出。"],
    ["Control plane", "集中套用權限、政策、觀測與治理的管理層。"],
    ["System of record", "特定狀態與決策的權威資料來源。"],
    ["Rollback", "把變更恢復到已知良好狀態的程序。"],
    ["Reversibility", "動作能否以清楚、低成本方式撤回的性質。"],
  ],
  D2: [
    ["Tool", "代理可呼叫以讀取資訊或執行動作的明確能力。"],
    ["Tool schema", "描述工具參數、型別與回傳格式的契約。"],
    ["Tool permission", "限制代理可使用哪些工具及操作範圍。"],
    ["Least privilege", "只授予完成明確任務所需的最小權限。"],
    ["MCP", "Model Context Protocol，讓 AI 應用以標準方式連接工具與資料來源。"],
    ["MCP server", "透過 MCP 暴露工具、資源或提示的服務。"],
    ["MCP client", "連線 MCP server 並代表代理呼叫能力的應用端。"],
    ["MCP registry", "提供可發現與管理 MCP server 資訊的登錄來源。"],
    ["MCP allowlist", "限定可使用 MCP server 或工具的允許清單。"],
    ["Remote MCP server", "透過網路端點提供 MCP 能力的伺服器。"],
    [
      "Execution context",
      "代理執行時可見的 repository、分支、環境與權限集合。",
    ],
    ["Repository scope", "代理被允許讀寫的 repository 範圍。"],
    ["Branch scope", "代理可操作的分支或分支命名範圍。"],
    ["Runner", "執行 CI job 或代理工作負載的運算環境。"],
    ["Setup step", "在代理開始工作前安裝依賴與準備環境的步驟。"],
    ["Retry", "對暫時性失敗重新嘗試的受限策略。"],
    ["Backoff", "在重試之間逐步增加等待時間的機制。"],
    ["Cancellation", "安全停止進行中代理工作的訊號與處理。"],
    ["Timeout", "超過指定時間後終止或升級工作的限制。"],
    ["Escalation path", "代理無法安全前進時交由人類或更高權限流程處理的路徑。"],
  ],
  D3: [
    ["Short-term memory", "只服務目前工作階段或局部步驟的暫時脈絡。"],
    ["Long-term memory", "跨工作階段保存且需治理的持久知識。"],
    ["External memory", "由文件、資料庫或其他外部系統保存的代理記憶。"],
    ["Memory scope", "限定記憶能包含的任務、repository 或使用者範圍。"],
    ["Memory expiry", "記憶在指定時間或條件後失效的規則。"],
    ["Memory pruning", "移除不再相關、重複或低價值記憶的程序。"],
    ["Memory reset", "清除或重建特定範圍記憶的受控動作。"],
    ["State", "代理任務目前進度、決策、產物與待辦的可恢復表示。"],
    ["Checkpoint", "可讓中斷工作從已驗證位置恢復的狀態快照。"],
    ["Resume", "根據 checkpoint 繼續工作而不重複已完成步驟。"],
    ["Context drift", "代理在長時間執行中逐漸偏離目標或既有決策。"],
    ["Decision log", "保存重要選擇、理由與影響的持久紀錄。"],
    ["Task continuity", "跨中斷、工具或代理持續推進同一任務的能力。"],
    ["Shared state", "多個工具或代理依共同格式讀寫的任務狀態。"],
    ["Stale context", "已過期但仍可能影響新決策的脈絡。"],
    ["Conflicting context", "不同來源對同一事實或決策給出矛盾資訊。"],
    ["Source of truth", "發生矛盾時被指定為權威的資料來源。"],
    ["Context window", "模型在單次推理中可使用的有限輸入範圍。"],
    ["State handoff", "把可恢復狀態與責任從一個執行者交給另一個。"],
    ["Idempotency", "相同操作重做時不會產生額外非預期效果的性質。"],
  ],
  D4: [
    ["Evaluation", "以明確標準衡量代理輸出與行為品質的程序。"],
    ["Evaluation signal", "用於判斷品質、風險或成功程度的觀測值。"],
    ["Qualitative signal", "由人工判斷清晰度、適切性或可用性的評估。"],
    ["Quantitative signal", "以數值表達的通過率、錯誤率、延遲或成本。"],
    ["Baseline", "調校前用於比較的固定評估結果。"],
    ["Test suite", "可重複執行以驗證正確性的一組測試。"],
    ["Code scanning", "分析程式碼以找出安全弱點的自動化能力。"],
    ["Secret scanning", "偵測 repository 中權杖與憑證等機密的能力。"],
    ["Dependency review", "評估相依套件變更所帶來供應鏈風險的程序。"],
    ["Error analysis", "從證據分類失敗並追查原因的過程。"],
    ["Root cause", "造成失敗的底層原因，而非表面症狀。"],
    ["Reasoning error", "代理判斷或步驟選擇不正確造成的失敗。"],
    ["Tool misuse", "選錯工具、參數錯誤或超出工具預期用途。"],
    ["Context issue", "缺漏、矛盾或過期脈絡導致的錯誤。"],
    ["Environment issue", "依賴、權限、網路或 runner 狀態造成的失敗。"],
    ["Trace", "記錄代理步驟與工具互動的可分析事件序列。"],
    ["Tuning", "依評估結果調整指令、流程、記憶或工具設定。"],
    ["Regression", "變更使原本正常的能力退化或失效。"],
    ["Evaluation set", "固定且具代表性、用來重複比較的任務集合。"],
    [
      "Operational constraint",
      "代理執行時必須遵守的成本、時間、權限或安全限制。",
    ],
  ],
  D5: [
    ["Multi-agent system", "由多個代理分工並協調完成共同目標的系統。"],
    ["Orchestration", "安排代理角色、順序、依賴、交接與整合的控制。"],
    ["Supervisor pattern", "由主管代理分派工作並整合多個工作者結果的模式。"],
    ["Pipeline pattern", "讓不同代理依固定階段串接處理工作的模式。"],
    ["Parallel execution", "讓互不衝突的代理工作同時執行。"],
    ["Agent isolation", "以 branch、worktree、權限或環境隔離代理影響。"],
    ["Worktree", "同一 Git repository 的獨立工作目錄與分支檢出。"],
    ["Task ownership", "明確指定每個代理負責的範圍與產物。"],
    ["Overlap conflict", "多個代理同時修改相同範圍造成的衝突。"],
    ["Duplicate effort", "多個代理未協調而重複完成同一工作。"],
    ["Contradictory output", "代理對同一問題產生無法同時成立的結果。"],
    ["Handoff", "代理間移交任務、脈絡、決策與產物。"],
    ["Audit continuity", "代理替換或失敗後仍保留完整稽核鏈。"],
    ["Partial failure", "多代理流程中只有部分工作成功的狀態。"],
    ["Stalled agent", "沒有完成也未明確失敗、長時間無進展的代理。"],
    ["Degraded coordination", "代理仍運作但衝突、延遲或品質已顯著惡化。"],
    ["Recovery pattern", "從部分失敗、衝突或中斷恢復的預定方式。"],
    ["Agent lifecycle", "代理加入、更新、替換與停止的完整過程。"],
    ["Post-hoc analysis", "執行結束後利用 log 與產物分析整體行為。"],
    ["Integrator", "負責裁決衝突並合併多代理輸出的單一角色。"],
  ],
  D6: [
    ["Guardrail", "限制、阻擋或引導代理行動符合政策的控制。"],
    ["Accountability", "能把代理動作、授權與結果歸屬到明確責任。"],
    ["Human-in-the-loop", "在代理流程的特定風險點納入人工判斷。"],
    ["Risk classification", "依操作、資安與合規衝擊對動作分級。"],
    ["Operational risk", "代理動作造成服務中斷、資料損失或流程失敗的風險。"],
    ["Security risk", "代理造成未授權存取、機密外洩或弱點的風險。"],
    ["Compliance risk", "代理行為違反法律、政策或稽核要求的風險。"],
    ["Policy block", "偵測到違規動作時直接拒絕執行的控制。"],
    ["Explicit authorization", "由具權限者對特定敏感動作清楚授權。"],
    ["Sensitive action", "可能影響機密、權限、正式環境或合規的動作。"],
    ["Irreversible action", "無法合理恢復原狀或回復成本極高的動作。"],
    ["Controlled path", "把授權、執行、驗證與稽核串連的受管流程。"],
    ["Scope restriction", "限制代理只能在指定資源與脈絡內行動。"],
    ["Execution boundary", "代理不得跨越的環境、權限或資源界線。"],
    ["Pre-tool hook", "工具執行前可檢查、核准或阻擋呼叫的 hook。"],
    ["Post-tool hook", "工具完成後可記錄或驗證結果的 hook。"],
    ["Audit log", "保存可追溯事件、actor、時間與結果的紀錄。"],
    ["Responsible AI", "讓 AI 系統符合公平、可靠、安全、隱私與課責等原則。"],
    ["Approval fatigue", "過多無效核准使人類降低注意力的風險。"],
    ["Material risk reduction", "能實質降低失敗機率或衝擊的控制效果。"],
  ],
};
const glossary = {
  version: "1.0.0",
  categories: domains.map((domain) => ({
    id: domain.id,
    title: domain.name,
    terms: glossaryGroups[domain.id].map(([term, explanation], index) => ({
      id: `${domain.id}-T${String(index + 1).padStart(2, "0")}`,
      term,
      explanation,
      exams: ["GH-600"],
      category: domain.name,
    })),
  })),
};

const faqPairs = [
  [
    "考試資訊",
    "GH-600 的正式考試名稱是什麼？",
    "Exam GH-600: Developing in Agentic AI Systems；通過後對應 GitHub Certified: Agentic AI Developer。",
  ],
  [
    "考試資訊",
    "考試時間多久？",
    "官方認證頁目前列為 120 分鐘。報名前仍應重新核對預約頁。",
  ],
  [
    "考試資訊",
    "及格分數是多少？",
    "Microsoft Learn 的 Study Guide 說明量尺分數 700 以上為及格；它不是固定答對百分比。",
  ],
  [
    "考試資訊",
    "考試提供哪些語言？",
    "截至本站最後核對日，認證頁只列 English。",
  ],
  [
    "考試資訊",
    "哪個領域占比最高？",
    "實作工具使用與環境互動占 20%–25%，是六領域中最高。",
  ],
  [
    "備考方法",
    "四週計畫一定要每天完成嗎？",
    "不必固定日曆日期，但應維持順序並完成每日輸出與通關標準。",
  ],
  [
    "備考方法",
    "模擬題是實際考題嗎？",
    "不是。本站題目皆依公開 objectives 原創，用於概念辨析，不含 exam dump。",
  ],
  [
    "備考方法",
    "為何建議 85% 而官方是 700？",
    "700 是量尺分數，無法直接換算固定答對率；85% 只是本站較保守的練習門檻。",
  ],
  [
    "備考方法",
    "如何使用 objectiveIds？",
    "每題與教材段落都標記 objective，可由錯題快速回到對應範圍補強。",
  ],
  [
    "備考方法",
    "先背產品名稱有效嗎？",
    "效果有限。先判斷目標、風險、權限與生命週期，再對應 GitHub 功能。",
  ],
  [
    "網站操作",
    "學習進度儲存在哪裡？",
    "只存在目前瀏覽器的 localStorage，不會上傳到伺服器。",
  ],
  [
    "網站操作",
    "更換電腦如何保留進度？",
    "先在設定頁匯出 JSON，再到另一裝置匯入。",
  ],
  [
    "網站操作",
    "舊 AZ／SC 進度能匯入嗎？",
    "不能；本站只接受 schema 為 gh-600-study-progress、版本 1 的檔案。",
  ],
  [
    "網站操作",
    "離線能使用嗎？",
    "完成首次載入後，PWA 會快取站殼；外部官方來源仍需網路。",
  ],
  [
    "網站操作",
    "如何只練錯題？",
    "到模擬題頁啟用只練目前錯題；答對後該題會移出錯題簿。",
  ],
  [
    "網站操作",
    "複選答案順序重要嗎？",
    "不重要；必須選齊所有正確項目，且重複答案會被契約拒絕。",
  ],
  [
    "內容維護",
    "資料最後查核日代表考綱生效日嗎？",
    "不是。lastVerified 是本站重新核對官方頁面的日期；Study Guide 另記 updated date。",
  ],
  [
    "內容維護",
    "官方來源有哪些網域？",
    "驗證器只接受 learn.microsoft.com 與 docs.github.com。",
  ],
  [
    "內容維護",
    "內容更新時先改哪裡？",
    "先更新 exam-meta 的 domains/objectives，再調整教材與題目參照，最後跑內容驗證。",
  ],
  [
    "內容維護",
    "為何每題要保留 sourceIds？",
    "讓解析可回查官方文件，也讓文件變動時能定位受影響題目。",
  ],
  [
    "應考策略",
    "英文題幹應先看什麼？",
    "先抓動詞與風險限制詞，例如 configure、prevent、least privilege、irreversible。",
  ],
  [
    "應考策略",
    "遇到兩個都可行的選項怎麼辦？",
    "選直接滿足所有明示限制、權限更小、較可驗證且較易回滾者。",
  ],
  [
    "應考策略",
    "考前最後一天應做什麼？",
    "只補最弱 objectives、重讀必背句與錯題原因，不再開新主題。",
  ],
  [
    "應考策略",
    "如何避免在單題耗時過久？",
    "先排除違反安全或範圍的選項；仍不確定就標記，完成其餘題目後再回看。",
  ],
];
const faqs = faqPairs.map(([category, question, answer], i) => ({
  id: `FAQ-${String(i + 1).padStart(2, "0")}`,
  category,
  question,
  answer,
  keyWords: [],
}));

const qaPairs = [
  [
    "D1",
    "代理收到『改善整個平台』便直接改 40 個檔案，缺少哪個核心？",
    "缺少明確輸入、輸出、成功標準與範圍；應先把任務拆成可審查的小步驟。",
  ],
  [
    "D1",
    "代理已完成計畫，但下一步要部署正式環境，能直接繼續嗎？",
    "不能因計畫核准推定部署獲准；正式部署是獨立高風險動作，應走明確核准閘門。",
  ],
  [
    "D1",
    "低風險文件拼字修正也要逐字人工核准嗎？",
    "通常不需要；可在明確檔案範圍內自動修正並用 diff 與檢查驗證。",
  ],
  [
    "D1",
    "代理只回報『已完成』但沒有 diff 或測試，問題在哪裡？",
    "缺少可檢查產物，審查者無法重建變更與驗證完成狀態。",
  ],
  [
    "D2",
    "代理只需查 issue，卻取得所有 repo 寫入權限，應如何評估？",
    "違反最小權限；工具能力與 scope 應收窄到完成查詢所需的唯讀範圍。",
  ],
  [
    "D2",
    "MCP server 回傳內容含不受信任指令，代理應直接照做嗎？",
    "不應。MCP 輸出跨越信任邊界，必須視為資料並依政策與工具權限驗證。",
  ],
  [
    "D2",
    "CI runner 缺少 SDK，重跑五次是否合理？",
    "不合理；這是持續性環境問題，應停止重試、保留證據並修正 setup steps。",
  ],
  [
    "D2",
    "API 暫時回 503，最佳反應是什麼？",
    "使用有上限的退避重試，達上限後停止並升級；避免無限重試放大負載。",
  ],
  [
    "D3",
    "代理把每次聊天完整永久保存，有何問題？",
    "缺少相關性、到期、裁剪與重設規則，會增加隱私、過期脈絡與衝突風險。",
  ],
  [
    "D3",
    "長任務中斷後代理從頭重做，應補哪項設計？",
    "建立 checkpoint、決策紀錄與已完成步驟，讓 resume 從已驗證狀態開始。",
  ],
  [
    "D3",
    "IDE 與 CI 對任務狀態說法不同，應相信哪個？",
    "依事先指定的 source of truth 對帳，處理矛盾並記錄裁決，不能任意選一個。",
  ],
  [
    "D3",
    "昨天正確的環境資訊今天已失效，這是什麼風險？",
    "stale context；應依 expiry 或重新驗證規則更新，不讓舊資訊主導新決策。",
  ],
  [
    "D4",
    "測試失敗只顯示症狀，如何找根因？",
    "沿 plan、trace、工具輸入輸出、runner log 與 artifact 追查，再分類為推理、工具、脈絡或環境。",
  ],
  [
    "D4",
    "調整後一次成功就能宣告改善嗎？",
    "不能；應用固定 evaluation set 與基準重測，確認改善可重現且沒有 regression。",
  ],
  [
    "D4",
    "代理經常選錯相似工具，最小調校是什麼？",
    "先澄清工具描述與適用條件，必要時收窄 allowlist；不要同時大改所有設定。",
  ],
  [
    "D4",
    "code scanning 新增高風險告警，但功能測試通過，算成功嗎？",
    "不算；成功標準應同時納入功能與安全操作限制。",
  ],
  [
    "D5",
    "兩代理平行修改同檔，如何預防？",
    "以獨立 worktree／branch、明確檔案所有權與不重疊任務隔離。",
  ],
  [
    "D5",
    "代理 A 完成研究、代理 B 失敗，是否全部重跑？",
    "先驗證 A 的 artifact 是否可保留，再只重派失敗範圍，避免重複工作。",
  ],
  [
    "D5",
    "代理被替換時哪些資訊必須交接？",
    "任務狀態、關鍵決策、已驗證產物、剩餘工作與 audit chain。",
  ],
  [
    "D5",
    "兩代理給出矛盾結論，誰負責裁決？",
    "指定 integrator 依共享證據與驗收標準裁決，並保存理由。",
  ],
  [
    "D6",
    "所有工具呼叫都要人工核准會更安全嗎？",
    "不一定；無效核准會造成 approval fatigue。人工介入應集中在能實質降低風險的節點。",
  ],
  [
    "D6",
    "代理要刪除正式資料，最小護欄是什麼？",
    "阻擋未授權執行，要求明確核准、可驗證備份／回滾與完整 audit log。",
  ],
  [
    "D6",
    "代理嘗試越過 repository scope，應如何處理？",
    "policy block 應拒絕動作並記錄原因，不得自動擴權。",
  ],
  [
    "D6",
    "如何兼顧速度與人工介入？",
    "依風險分級：低風險自動化，中風險抽查或閘門，高風險及不可逆動作明確核准。",
  ],
];
const qas = qaPairs.map(([category, question, answer], i) => ({
  id: `QA-${String(i + 1).padStart(2, "0")}`,
  category,
  question,
  answer,
  keyWords: [category],
}));

const mustRemember = [
  "先定義輸入、輸出與成功標準，再讓代理行動。",
  "計畫核准不等於每個後續動作都獲授權。",
  "自主程度應隨操作、資安與合規風險調整。",
  "可檢查 artifact 是代理課責的基礎。",
  "工具只給完成任務所需的最小權限。",
  "MCP server 與其輸出都跨越信任邊界。",
  "secret 應由受管機制注入，不得寫入 repository。",
  "暫時性錯誤才適合有界重試。",
  "取消、逾時與升級是安全執行路徑的一部分。",
  "乾淨 runner 能重現結果，才算環境設定完整。",
  "記憶只保留與任務相關且可治理的資訊。",
  "長期記憶必須有到期、裁剪與重設規則。",
  "checkpoint 讓任務恢復而不重做。",
  "source of truth 用來解決跨工具狀態衝突。",
  "stale context 必須重新驗證或淘汰。",
  "評估要同時包含定量與定性訊號。",
  "測試通過不代表安全與操作限制也通過。",
  "根因不是錯誤訊息本身，而是造成它的底層原因。",
  "調校時先改最小主要變因，再用固定基準重測。",
  "推理、工具、脈絡與環境是四個常見失敗類別。",
  "多代理平行化前先切清任務與檔案所有權。",
  "共享工作目錄會放大重疊修改風險。",
  "多代理交接必須保存決策與 audit chain。",
  "partial failure 不等於所有可驗證產物都要丟棄。",
  "stalled agent 需要逾時、重派或人工介入。",
  "integrator 應依共享證據裁決矛盾輸出。",
  "代理生命週期包含加入、更新、替換與停止。",
  "post-hoc 分析依賴完整 log、artifact 與交接紀錄。",
  "護欄應阻擋違規行動並留下可稽核原因。",
  "不可逆與合規敏感動作需要明確授權。",
  "最小權限同時限制工具、資源與執行脈絡。",
  "人工介入應集中在能實質降低風險的節點。",
  "過多無效核准會造成 approval fatigue。",
  "受控路徑串起授權、執行、驗證與稽核。",
  "700 是量尺分數，不是固定答對百分比。",
  "正式應考前重新核對認證頁與 Study Guide。",
];
const review = {
  mustRemember: { "GH-600": mustRemember },
  cheatsheet: [
    {
      combination: "Plan vs Act",
      summary: "計畫描述要做什麼；行動會對環境造成效果，應分開授權。",
    },
    {
      combination: "Guardrail vs Evaluation",
      summary: "護欄在執行前後限制行為；評估衡量結果是否符合標準。",
    },
    {
      combination: "Retry vs Escalate",
      summary: "暫時性錯誤有界重試；權限或永久錯誤停止並升級。",
    },
    {
      combination: "Memory vs State",
      summary: "記憶保存可重用脈絡；狀態表示目前任務進度與決策。",
    },
    {
      combination: "Short vs Long term",
      summary: "短期服務當前步驟；長期跨工作階段且必須治理。",
    },
    {
      combination: "Log vs Trace",
      summary: "log 是事件紀錄；trace 串起一次執行的因果序列。",
    },
    {
      combination: "Tool vs MCP server",
      summary: "tool 是能力；MCP server 以協定提供工具與資料來源。",
    },
    {
      combination: "Scope vs Permission",
      summary: "scope 限定資源範圍；permission 限定允許的操作。",
    },
    {
      combination: "Symptom vs Root cause",
      summary: "症狀是觀察到的失敗；根因是造成失敗的底層原因。",
    },
    {
      combination: "Parallel vs Pipeline",
      summary: "平行處理互不依賴工作；管線按階段交接輸出。",
    },
    {
      combination: "Partial vs Stalled",
      summary: "partial 已有部分結果；stalled 尚未完成且無進展。",
    },
    {
      combination: "Autonomy vs Authority",
      summary: "自主是無人介入程度；權限是代理實際能做的範圍。",
    },
  ],
  examDayChecklist: [
    "確認英文考試、時間與預約資訊。",
    "完成官方 exam sandbox 操作熟悉。",
    "只帶考試中心允許的身分證明。",
    "先讀題幹動詞與風險限制詞。",
    "不確定題先標記，完成後回看。",
    "交卷前檢查複選題是否選齊。",
  ],
};

const chapterBodies = {
  "start-here": `# 開始使用：GH-600 四週備考指南

## 官方基準

本指南對應 **GH-600: Developing in Agentic AI Systems**，通過後取得 **GitHub Certified: Agentic AI Developer**。截至 2026-08-04，官方認證頁列出 120 分鐘、英文考試；Study Guide 說明 700 以上為及格量尺分數，並於 2026-05-14 更新。資料來源：GH600-CERT、GH600-SG。

## 使用方式

依 28 天計畫完成每日閱讀、可交付輸出與通關標準。題目不是考古題；每題以 objectiveIds 對回官方技能，以 sourceIds 對回 Microsoft Learn 或 GitHub Docs。答錯時先判斷是觀念錯置、題幹漏讀、產品記憶或過度設計，再回到對應領域教材。

## 六領域配置

| 領域 | 官方權重 | 本站題數 |
| --- | ---: | ---: |
${domains.map((d) => `| ${d.id} ${d.name} | ${d.weight.min}%–${d.weight.max}% | ${questionSpecs[d.id].length} |`).join("\n")}

## 應考原則

先抓題幹動詞與限制，再選擇最小權限、可驗證、可回滾且能保留課責的答案。兩個方案都可行時，不替題目增加未寫出的架構。700 是量尺分數，不可直接換算固定答對率；本站以六領域皆達 75%、整體連續兩次達約 85% 作為較保守的練習門檻。`,
  D1: `# 領域一：準備代理架構與 SDLC 流程

## D1-O1 將代理整合至軟體開發生命週期

先識別哪些步驟適合交給代理，再定義輸入、輸出、範圍與成功標準。代理適合處理可重複、具明確工具與驗證的工作；「改善整個系統」這類無界目標、缺少可重現環境、沒有失敗路徑，都是常見反模式。GitHub 作為 system of record 時，issue、branch、commit、checks 與 PR 讓工作留下可審查鏈。來源：GH600-SG、GH-DOC-02、GH-DOC-03。

## D1-O2 定義規劃、推理與行動的界線

規劃描述步驟、依賴、風險與驗證；行動則透過工具造成環境效果。高風險流程應先輸出結構化計畫、驗證它涵蓋限制，再經 approval gate 才開放行動。核准計畫只代表同意方向，不會自動授權每一個未列出的工具動作。來源：GH600-SG、GH-DOC-04。

## D1-O3 設定自主代理的可觀測性與控制

自主程度應依操作、資安與合規風險分級。低風險可回滾工作可自動執行並驗證；敏感或不可逆動作需要人工介入。代理應產生 diff、測試、log、trace、PR 等可檢查 artifact，並提供取消、停止與回滾方式。來源：GH600-SG、GH-DOC-03。`,
  D2: `# 領域二：實作工具使用與環境互動

## D2-O1 選擇與設定代理工具

只提供完成任務必要的工具，並以清楚 schema 說明輸入、輸出與失敗。權限要同時限制操作與資源 scope；只需讀 issue 的代理不應擁有 repository 寫入權限。工具結果也必須驗證，不能把外部輸出當成受信任指令。來源：GH600-SG、GH-DOC-06。

## D2-O2 設定 MCP 伺服器

MCP 讓代理連接工具與資料來源，但每個 server 都形成新的信任邊界。設定遠端 MCP、registry 與 allowlist 時，要限制可用 server、工具與命名空間；憑證由受管 secrets 注入，不得硬編碼。來源：GH600-SG、GH-DOC-07、GH-DOC-08、GH-DOC-09。

## D2-O3 將代理整合至開發環境

執行脈絡包含 repository、branch、runner、網路、權限與 setup steps。代理在 CI 建立 branch 與 PR 時，應使用受限 token，接受 branch protection、ruleset、status checks 與 review；乾淨 runner 能依 lockfile 重現建置結果。來源：GH600-SG、GH-DOC-12、GH-DOC-13、GH-DOC-14。

## D2-O4 安全執行與錯誤處理

對暫時性錯誤使用有上限的退避重試；權限拒絕、無效設定等永久性錯誤則停止並升級。流程必須支援 timeout、cancellation、idempotency 與 rollback。audit record 應包含 actor、時間、工具、輸入摘要、結果與核准資訊。來源：GH600-SG、GH-DOC-10、GH-DOC-11。`,
  D3: `# 領域三：管理記憶、狀態與執行

## D3-O1 實作代理記憶策略

短期記憶支援目前步驟；長期記憶跨工作階段；外部記憶由文件或資料庫保存。選擇策略時只保留任務相關資訊，並定義 expiry、pruning 與 reset。敏感或過期資訊不應因「以後可能有用」而永久保存。來源：GH600-SG、GH-DOC-23。

## D3-O2 保留狀態並管理脈絡漂移

長時間任務要把進度、決策、已驗證產物與剩餘工作寫成 checkpoint。resume 前先讀 checkpoint，避免重做。持續比較目前行動與目標、已核准決策及範圍，可偵測 context drift 並在偏離時停止修正。來源：GH600-SG、GH-DOC-04。

## D3-O3 確保跨工具與環境連續性

跨 IDE、CI 與多代理共享狀態時，需指定 source of truth、版本與衝突解決方式。交接要傳遞狀態而非整段無篩選聊天；遇到 stale 或 conflicting context，應重新驗證並記錄裁決。來源：GH600-SG、GH-DOC-23。`,
  D4: `# 領域四：執行評估、錯誤分析與調校

## D4-O1 定義成功標準與評估訊號

成功標準要對齊開發意圖與操作限制。定量訊號可包含測試通過率、告警數、延遲與成本；定性訊號可由 reviewer 評估清晰度與適切性。code scanning、secret scanning、dependency review 與 status checks 都能產生自動評估證據。來源：GH600-SG、GH-DOC-17、GH-DOC-18、GH-DOC-19、GH-DOC-20。

## D4-O2 分析代理失敗並識別根因

以 plan、log、trace、工具輸入輸出與 workflow artifact 重建失敗，再分類為 reasoning error、tool misuse、context issue 或 environment issue。錯誤訊息只是症狀；例如 build 缺 SDK 的根因在環境，不應只叫代理重寫程式。來源：GH600-SG、GH-DOC-22、GH-DOC-24。

## D4-O3 依評估結果調整代理行為

根據根因調整 instructions、workflow、constraints、memory 或 tools。一次先改最小主要變因，再用固定 evaluation set 與 baseline 重測；同時大改所有設定會失去因果判斷，也較難發現 regression。來源：GH600-SG、GH-DOC-03。`,
  D5: `# 領域五：協調多代理協作

## D5-O1 操作與管理多代理工作流程

依依賴選擇主管／工作者、管線或平行模式。平行前要用獨立 worktree、branch、執行環境或權限隔離，並指定 task ownership，避免重疊修改、重複工作與矛盾輸出。整合者負責依共享驗收標準合併結果。來源：GH600-SG、GH-DOC-05、GH-DOC-06。

## D5-O2 設定多代理可觀測性

多代理流程應記錄任務分派、交接、關鍵決策、工具結果與最終 artifact。這些資料既支援即時監控，也支援 post-hoc 分析，讓 reviewer 能追查是哪個代理在何種脈絡下產生結果。來源：GH600-SG、GH-DOC-17。

## D5-O3 回應失敗與效能退化

系統要區分 failed、partial、stalled 與 degraded。部分失敗時先保留已驗證產物，再重派失敗範圍；衝突時停止重疊工作並由 integrator 裁決；需要時使用 rollback 與 human-in-the-loop。來源：GH600-SG、GH-DOC-22。

## D5-O4 管理代理生命週期

新增、更新、替換或停止代理時，應以版本化設定、受控切換與 state handoff 維持進行中工作。替換失敗代理不能丟棄先前決策與 audit continuity，否則後續結果無法課責。來源：GH600-SG、GH-DOC-05。`,
  D6: `# 領域六：實作護欄與課責

## D6-O1 定義自主程度

先依操作、資安與合規風險分類動作，再設定自主程度。唯讀、低風險、可回滾工作可高度自動化；提升權限、正式部署、資料刪除與合規政策變更則需要更強控制。速度來自把人工注意力放在實質風險，而不是取消所有控制。來源：GH600-SG、GH-DOC-21。

## D6-O2 實作護欄與人工介入

護欄可透過最小權限、scope restriction、policy block、hooks 與 approval gate 執行。pre-tool hook 可在命令執行前核准或拒絕，post-tool hook 可記錄與驗證結果。不可逆或合規敏感變更需要明確授權與受控路徑；無效的逐次核准會造成 approval fatigue，應移除不能實質降低風險的摩擦。來源：GH600-SG、GH-DOC-10、GH-DOC-11、GH-DOC-14。`,
  integration: `# 跨領域整合速查

## 從 issue 到 PR 的控制鏈

先以 D1 定義輸入、輸出、成功標準與自主程度；D2 選工具、MCP、repository／branch scope 與錯誤處理；D3 保存 checkpoint 與決策；D4 以 tests、scans、logs、traces 評估；D5 在任務可安全切分時協調多代理；D6 以最小權限、hooks、approval gates 與 audit log 落實護欄。

## 題幹辨識順序

1. 找動詞：configure、prevent、evaluate、recover、orchestrate。
2. 找限制：least privilege、irreversible、specific repository、without disrupting。
3. 判斷生命週期：規劃、執行、評估、恢復或稽核。
4. 排除會擴權、跳過驗證、丟失狀態或增加無效摩擦的選項。
5. 選最小、直接、可驗證與可回滾的答案。

## 常見跨域陷阱

護欄不是評估：前者限制行動，後者量測品質。記憶不是狀態：前者保存可重用脈絡，後者代表目前任務進度。自主不是權限：代理即使能自行決策，也只能在授權工具與 scope 內行動。重試不是恢復策略的全部：永久錯誤、部分失敗與代理衝突需要升級、重派、整合或 rollback。來源：GH600-SG、GH-DOC-28。`,
};

mkdirSync(join(root, "content", "chapters"), { recursive: true });
writeJson("data/exam-meta.json", examMeta);
writeJson("data/sources.json", sources);
writeJson("data/study-plan.json", studyPlan);
writeJson("data/questions.json", questions);
writeJson("data/glossary.json", glossary);
writeJson("data/faq.json", faqs);
writeJson("data/qa.json", qas);
writeJson("data/review.json", review);
writeJson("data/content-summary.json", {
  studyDays: 28,
  glossaryTerms: 120,
  officialSources: 30,
  faqItems: 24,
  scenarioItems: 24,
  mustRemember: 36,
});
writeText("content/chapters/start-here.md", chapterBodies["start-here"]);
for (const domain of domains)
  writeText(
    `content/chapters/${domain.id.toLowerCase()}.md`,
    chapterBodies[domain.id],
  );
writeText("content/chapters/integration.md", chapterBodies.integration);
console.log(
  `[完成] 已產生 ${questions.length} 題、${glossary.categories.flatMap((c) => c.terms).length} 詞、${sources.length} 來源與 8 章教材。`,
);
