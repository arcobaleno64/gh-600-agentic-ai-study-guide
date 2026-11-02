import type { Question } from "./types.ts";

// 闖關遊戲的關卡資料。題目沿用 data/questions.json（依 objectiveId 取用），
// 這裡只放世界、小知識與四個「實驗室」的情境；每一處措辭都對應 content/chapters
// 的既有段落，不新增教材沒有的等級名稱或分類。

export type WorldId = "d1" | "d2" | "d3" | "d4" | "d5" | "d6";

export interface World {
  id: WorldId;
  domainId: string;
  name: string;
  glyph: string;
  tagline: string;
}

export const worlds: World[] = [
  {
    id: "d1",
    domainId: "D1",
    name: "契約工坊",
    glyph: "約",
    tagline: "先把任務說清楚，再把工作交給代理。",
  },
  {
    id: "d2",
    domainId: "D2",
    name: "工具群島",
    glyph: "具",
    tagline: "只帶任務需要的工具，並分清連線與授權。",
  },
  {
    id: "d3",
    domainId: "D3",
    name: "記憶水晶洞",
    glyph: "憶",
    tagline: "記得該記的，也會對帳過期的。",
  },
  {
    id: "d4",
    domainId: "D4",
    name: "評估實驗室",
    glyph: "測",
    tagline: "綠燈不等於通過；先看證據，再談根因。",
  },
  {
    id: "d5",
    domainId: "D5",
    name: "編排競技場",
    glyph: "協",
    tagline: "多代理的重點是責任切分與可追溯交接。",
  },
  {
    id: "d6",
    domainId: "D6",
    name: "護欄要塞",
    glyph: "衛",
    tagline: "把人的注意力放在值得判斷的動作上。",
  },
];

export interface LevelInfo {
  objectiveId: string;
  title: string;
  story: string;
  tip: string;
}

export const levelInfos: LevelInfo[] = [
  {
    objectiveId: "D1-O1",
    title: "契約之門",
    story:
      "報表匯出的 CSV 又把含逗號的欄位拆成兩欄。放行代理之前，先決定誰負責什麼。",
    tip: "只要求「測試全綠」，代理可能刪掉失敗測試也得到綠燈；把輸入與預期輸出寫清楚，才能指出真正要保護的行為。",
  },
  {
    objectiveId: "D1-O2",
    title: "計畫迷宮",
    story: "代理遞上一份計畫，最後一步寫著「推送並部署正式站」。",
    tip: "核准要對應實際待執行的動作、資源與版本；核准方向不等於授權所有後續衍生操作。",
  },
  {
    objectiveId: "D1-O3",
    title: "瞭望塔",
    story: "代理回報 20 項測試通過，但看不出測的是哪一個版本。",
    tip: "只有日誌而不能阻止越界，是看得見卻管不住；只有核准按鈕而沒有差異與測試，則是要求人盲目決定。",
  },
  {
    objectiveId: "D2-O1",
    title: "最小工具箱",
    story: "任務只需要讀 issue、改匯出模組、跑測試。工具箱要裝多滿？",
    tip: "custom agent 的 tools 欄位若省略，依教材核對時的官方文件會開放所有可用工具；「沒設定」不等於唯讀。",
  },
  {
    objectiveId: "D2-O2",
    title: "連線橋",
    story: "MCP 伺服器連上了，但它值得信任嗎？目前身分有權使用嗎？",
    tip: "設定成功只代表客戶端知道怎麼連線；伺服器可信度、工具適合度與業務授權要分開檢查。",
  },
  {
    objectiveId: "D2-O3",
    title: "環境對照站",
    story: "同一組指令，本機通過、runner 失敗。是模型的問題嗎？",
    tip: "SDK、作業系統、套件快取、網路規則與工作目錄都可能不同；先把執行脈絡視為輸入的一部分。",
  },
  {
    objectiveId: "D2-O4",
    title: "逾時迷霧",
    story: "建立 PR 的要求逾時了。看起來沒成功，但真的沒成功嗎？",
    tip: "寫入逾時、結果未知時先對帳再決定是否重送；取消只停止後續工作，不會撤回已發生的副作用。",
  },
  {
    objectiveId: "D3-O1",
    title: "記憶水晶",
    story: "代理記得很多事，但有些已經不是現況。",
    tip: "短期／長期描述保存期限，外部記憶描述存放方式；外部記憶不必然是長期記憶。",
  },
  {
    objectiveId: "D3-O2",
    title: "檢查點洞窟",
    story: "任務做到一半中斷，只留下一句「修正完成一半」。",
    tip: "恢復時先把紀錄與環境對帳：checkpoint 說 PR 已建立，就到遠端確認，不是照單相信。",
  },
  {
    objectiveId: "D3-O3",
    title: "權威之河",
    story: "兩份狀態互相矛盾，一份說測試通過，一份說未執行。",
    tip: "不能單純把「時間較新」當成勝出規則；需求、程式碼與執行結果各有各的權威來源。",
  },
  {
    objectiveId: "D4-O1",
    title: "訊號儀表廊",
    story: "PR 上有四種綠燈。它們各自證明了什麼，又各自缺了什麼？",
    tip: "掃描無告警不能證明匯出規格已滿足；每種證據只回答它自己的那個問題。",
  },
  {
    objectiveId: "D4-O2",
    title: "診斷室",
    story: "代理說「CSV 測試通過」，審查者用換行資料卻看到錯誤。",
    tip: "先保存可重跑的失敗輸入與版本，整理時間線，最後才提出根因假設。",
  },
  {
    objectiveId: "D4-O3",
    title: "調校工坊",
    story: "指令加長了幾段，題庫全對。真的變強了嗎？",
    tip: "每次只動一個主要變因，保留基線與每次結果，不只留最好的一次；看過失敗的案例就不再是未見案例。",
  },
  {
    objectiveId: "D5-O1",
    title: "編排廣場",
    story: "兩位代理同時被要求「改善匯出模組」。",
    tip: "各自建 branch 不等於切分責任；先約定誰修改實作、誰唯讀檢查邊界案例。",
  },
  {
    objectiveId: "D5-O2",
    title: "航跡塔",
    story: "日誌只說「A 完成、B 完成」，卻看不出它們讀的是不是同一版規格。",
    tip: "跨機器時鐘可能不同，不能只用時間先後推定因果；交接關聯與產物版本是更直接的線索。",
  },
  {
    objectiveId: "D5-O3",
    title: "急救站",
    story: "實作代理中斷，寫入已送出但結果未知。",
    tip: "先核對遠端，不能直接交給另一個代理重送；已核對的規格也不必重新產生。",
  },
  {
    objectiveId: "D5-O4",
    title: "交接口",
    story: "新版代理表現更好，想直接接手舊代理正在建立的 PR。",
    tip: "品質提升不會消除重複寫入風險；交接完成的判準，是新代理能指出從哪個狀態續作，舊代理不再競爭操作。",
  },
  {
    objectiveId: "D6-O1",
    title: "自主之橋",
    story: "要放手到什麼程度？先分清楚自主程度與權限。",
    tip: "自主程度是代理可以自行決定到哪一步；權限是它實際可以操作的資源。兩者必須一起設計。",
  },
  {
    objectiveId: "D6-O2",
    title: "護欄要塞",
    story: "事後 hook 發現代理已刪了外部測試資料，並把結果標為失敗。",
    tip: "必要防線至少驗三種輸入：允許的能執行、禁止的會被阻止、控制本身失效時走向預定路徑。",
  },
];

export interface LabCategory {
  id: string;
  label: string;
  summary: string;
  detail: string;
  diagram?: "single" | "supervisor" | "pipeline" | "parallel";
}

export interface LabFollowUp {
  prompt: string;
  options: { id: string; text: string }[];
  answer: string;
  why: string;
}

export interface LabRound {
  prompt: string;
  answer: string;
  why: string;
  followUp?: LabFollowUp;
}

export interface Lab {
  id: string;
  objectiveId: string;
  worldId: WorldId;
  title: string;
  story: string;
  tip: string;
  layout: "stairs" | "tiles" | "lanes" | "topology";
  note: string;
  categories: LabCategory[];
  rounds: LabRound[];
}

export const labs: Lab[] = [
  {
    id: "LAB-signals",
    objectiveId: "D4-O1",
    worldId: "d4",
    title: "訊號儀表板",
    story: "把每個觀察放到它真正回答的那一格，再看哪個數字在說謊。",
    tip: "成功先問使用者要得到什麼，再選能觀察它的訊號。通過率、耗時與成本有助於比較，但不能替代行為定義。",
    layout: "tiles",
    note: "四類訊號取自 D4-O1 的對照表。",
    categories: [
      {
        id: "result",
        label: "功能結果",
        summary: "使用者要的行為是否真的成立",
        detail: "對照輸入與預期欄位，不只檢查檔案存在。",
      },
      {
        id: "limit",
        label: "操作限制",
        summary: "有沒有越過不該碰的邊界",
        detail: "檢查差異與工具操作紀錄。",
      },
      {
        id: "quality",
        label: "品質判斷",
        summary: "好不好理解、好不好維護",
        detail: "審查者依事先約定的準則評估。",
      },
      {
        id: "efficiency",
        label: "效率訊號",
        summary: "花了多少時間與工具成本",
        detail: "同時確認正確性沒有退步。",
      },
    ],
    rounds: [
      {
        prompt: "含逗號、引號與換行的資料都能正確還原成原本的欄位。",
        answer: "result",
        why: "這是在對照輸入與預期欄位，驗的是使用者要的行為。",
      },
      {
        prompt: "差異中沒有任何資料庫或正式資料的存取。",
        answer: "limit",
        why: "不修改資料庫、不接觸正式資料是操作限制，要靠差異與工具操作紀錄檢查。",
      },
      {
        prompt: "審查者依事先約定的準則，認為這個修正容易理解與維護。",
        answer: "quality",
        why: "品質判斷沒有單一指令能算出來，需要事先約定準則，再由審查者評估。",
      },
      {
        prompt: "同一工作量，這次的執行時間與工具成本都比上次低。",
        answer: "efficiency",
        why: "這是效率訊號；它有意義的前提，是正確性沒有同時退步。",
      },
      {
        prompt:
          "測試通過率從 90% 升到 100%，但失敗的換行案例被排除在外。這個漂亮的數字讓哪一類訊號失真？",
        answer: "result",
        why: "分母改變了，使用者需要的換行行為反而失去檢查。比較前後要用相同案例集合，另列新增或移除案例的理由。",
      },
    ],
  },
  {
    id: "LAB-rootcause",
    objectiveId: "D4-O2",
    worldId: "d4",
    title: "根因分診台",
    story: "先把症狀放進候選原因，再挑出真正能區分它的實驗。",
    tip: "這些分類可以同時出現，不能只依錯誤字串硬選一類；找出可修正的因果鏈，比貼標籤更有用。",
    layout: "lanes",
    note: "四類候選原因取自 D4-O2 的對照表，教材中是四類，不是三類。",
    categories: [
      {
        id: "reasoning",
        label: "推理錯誤",
        summary: "例：認為只用逗號分隔就能處理所有欄位",
        detail: "能區分它的檢查：對照明確規格與失敗輸入。",
      },
      {
        id: "tool",
        label: "工具誤用",
        summary: "例：測試指令跑到另一個模組",
        detail: "能區分它的檢查：核對參數、工作目錄與實際執行的測試。",
      },
      {
        id: "context",
        label: "脈絡問題",
        summary: "例：沿用另一個分支的格式約定",
        detail: "能區分它的檢查：比對來源文件、commit 與 checkpoint。",
      },
      {
        id: "environment",
        label: "環境問題",
        summary: "例：runner 缺套件或無法存取測試服務",
        detail: "能區分它的檢查：在相同版本下補齊環境再重跑。",
      },
    ],
    rounds: [
      {
        prompt: "代理在報告中寫道：「欄位只要用逗號分隔，所有欄位都能處理。」",
        answer: "reasoning",
        why: "症狀是對規格的錯誤推論，而不是執行環節出錯。",
        followUp: {
          prompt: "哪個實驗最能區分「推理錯誤」？",
          options: [
            { id: "a", text: "對照明確規格與失敗輸入" },
            { id: "b", text: "在相同版本補齊 runner 套件後重跑" },
            { id: "c", text: "比對來源文件、commit 與 checkpoint" },
          ],
          answer: "a",
          why: "把明確規格與失敗輸入並排，才看得出結論是否違反規格。",
        },
      },
      {
        prompt:
          "代理說「CSV 測試通過」，但它跑的是另一個模組的測試，結束碼為 0。",
        answer: "tool",
        why: "是指令與工作目錄對不上，工具被用在錯誤的位置。",
        followUp: {
          prompt: "哪個實驗最能區分「工具誤用」？",
          options: [
            { id: "a", text: "對照明確規格與失敗輸入" },
            { id: "b", text: "核對參數、工作目錄與實際執行的測試" },
            { id: "c", text: "在相同版本補齊 runner 套件後重跑" },
          ],
          answer: "b",
          why: "核對實際執行了哪些測試，才能證明綠燈沒有涵蓋匯出模組。",
        },
      },
      {
        prompt: "代理沿用了另一個分支才有效的格式約定來修改匯出。",
        answer: "context",
        why: "它拿到的是過期或不屬於這條分支的脈絡。",
        followUp: {
          prompt: "哪個實驗最能區分「脈絡問題」？",
          options: [
            { id: "a", text: "比對來源文件、commit 與 checkpoint" },
            { id: "b", text: "核對參數、工作目錄與實際執行的測試" },
            { id: "c", text: "對照明確規格與失敗輸入" },
          ],
          answer: "a",
          why: "追到約定來自哪份文件、哪個 commit，才能證明它屬於另一個分支。",
        },
      },
      {
        prompt: "同一份程式在本機正常，在 runner 上卻因缺少套件而失敗。",
        answer: "environment",
        why: "程式版本相同，差異在執行環境。",
        followUp: {
          prompt: "哪個實驗最能區分「環境問題」？",
          options: [
            { id: "a", text: "比對來源文件、commit 與 checkpoint" },
            { id: "b", text: "對照明確規格與失敗輸入" },
            { id: "c", text: "固定程式版本，補齊缺少的執行階段後重跑" },
          ],
          answer: "c",
          why: "只改一個變因：同一測試恢復通過，才支持環境假設；若仍失敗，就撤回這個結論。",
        },
      },
    ],
  },
  {
    id: "LAB-topology",
    objectiveId: "D5-O1",
    worldId: "d5",
    title: "編排拓撲沙盤",
    story: "依任務之間的依賴關係，選出最小而夠用的編排方式。",
    tip: "多代理適合責任與驗收清楚的拆分。匯出修正很小時，一個代理即可完成。",
    layout: "topology",
    note: "三種模式取自 D5-O1 的對照表；「單一代理」來自該節對小任務的說明。",
    categories: [
      {
        id: "single",
        label: "單一代理",
        summary: "任務小、沒有可獨立進行的子工作",
        detail: "不付交接成本；不為了「多代理」而多代理。",
        diagram: "single",
      },
      {
        id: "supervisor",
        label: "主管／工作者",
        summary: "任務可切分，但需要集中裁決",
        detail: "管理成本：主管必須掌握驗收與衝突。",
        diagram: "supervisor",
      },
      {
        id: "pipeline",
        label: "管線",
        summary: "後一階段依賴前一階段的產物",
        detail: "管理成本：每次交接都要驗證版本與完整性。",
        diagram: "pipeline",
      },
      {
        id: "parallel",
        label: "平行後整合",
        summary: "輸入固定、子任務互相獨立",
        detail: "管理成本：必須處理重疊修改與語意衝突。",
        diagram: "parallel",
      },
    ],
    rounds: [
      {
        prompt: "只需要修正一個含逗號欄位的小錯誤，沒有可獨立進行的子工作。",
        answer: "single",
        why: "匯出修正很小時，一個代理即可完成；多代理只會增加交接成本。",
      },
      {
        prompt:
          "必須先整理格式規格，才能實作，之後才能驗收；每一階段都要前一階段的產物。",
        answer: "pipeline",
        why: "後一階段依賴前一階段產物，適合管線，並要在每次交接驗證版本與完整性。",
      },
      {
        prompt:
          "格式規格整理與跨平台測試盤點的輸入已固定、彼此不依賴，之後由一位實作者整合。",
        answer: "parallel",
        why: "先讓兩個唯讀工作平行，再由一位實作者整合；整合時要處理重疊與語意衝突。",
      },
      {
        prompt:
          "任務能切成幾塊，但各塊結果可能互相衝突，需要有人統一裁決與驗收。",
        answer: "supervisor",
        why: "任務可切分、又需要集中裁決，是主管／工作者的場合；主管必須掌握驗收與衝突。",
      },
      {
        prompt:
          "下一步必須等上一個決策才能開始，團隊卻想用平行來縮短時間。較合適的編排是？",
        answer: "pipeline",
        why: "必須等待上一個決策時，平行無法縮短等待；仍可因專業分工採用管線，但要評估交接成本。",
      },
    ],
  },
  {
    id: "LAB-autonomy",
    objectiveId: "D6-O1",
    worldId: "d6",
    title: "自主程度調度台",
    story: "同一個代理，不同的動作與資料，該放手的程度並不一樣。",
    tip: "不要只為整個代理貼上「安全」或「危險」標籤；要依動作與資料判斷。唯讀也未必低風險。",
    layout: "stairs",
    note: "四種配置取自 D6-O1 的教學用對照表，教材明說這不是 GH-600 官方的固定等級名稱。",
    categories: [
      {
        id: "advise",
        label: "只提供建議",
        summary: "需求、風險或授權尚未清楚",
        detail: "人需要掌握：問題、選項與決策依據。",
      },
      {
        id: "plan",
        label: "核准明確計畫後執行",
        summary: "範圍與副作用可事先界定",
        detail: "人需要掌握：動作、目標、版本與停止條件。",
      },
      {
        id: "auto",
        label: "邊界內自動執行",
        summary: "有限權限、可驗證、失敗可控",
        detail: "人需要掌握：產物、異常與可用的停止機制。",
      },
      {
        id: "human",
        label: "由人處理關鍵步驟",
        summary: "不可逆、敏感或需責任判斷",
        detail: "人需要掌握：精確差異、風險與恢復方案。",
      },
    ],
    rounds: [
      {
        prompt: "issue 只寫「讓報表更好用」，產品取捨都還沒決定。",
        answer: "advise",
        why: "需求尚未清楚時直接實作，只會把產品取捨交給代理猜測；先要問題、選項與決策依據。",
      },
      {
        prompt:
          "已確認只改匯出模組與測試，動作與副作用能事先寫成計畫；團隊希望人核准計畫後才開始。",
        answer: "plan",
        why: "範圍與副作用可事先界定，適合核准明確計畫後執行；人要掌握動作、目標、版本與停止條件。",
      },
      {
        prompt:
          "在獨立工作目錄、指定分支與合成測試資料上修正並重跑測試；權限有限、結果可驗證、失敗可控。",
        answer: "auto",
        why: "條件都落在邊界之內，可以自動執行；人看產物與異常，並保有停止機制。",
      },
      {
        prompt:
          "驗證需要把含個人資料的正式客戶資料送往外部服務，揭露後無法撤回。",
        answer: "human",
        why: "不可逆又敏感，需要責任判斷。應優先用去識別化或合成資料；仍不足時，由資料權責者決定可用範圍。",
      },
      {
        prompt:
          "讀取公開文件，並搜尋匯出實作所在的檔案。團隊現在每次都要人工核准。",
        answer: "auto",
        why: "低風險的重複操作，用清楚邊界降低不必要摩擦即可；核准次數不是風險控制的替代指標。",
      },
    ],
  },
];

export type PathNode =
  | { kind: "level"; id: string; worldId: WorldId; info: LevelInfo }
  | { kind: "lab"; id: string; worldId: WorldId; lab: Lab };

const labAfter: Record<string, string> = {
  "D4-O1": "LAB-signals",
  "D4-O2": "LAB-rootcause",
  "D5-O1": "LAB-topology",
  "D6-O1": "LAB-autonomy",
};

// 路徑：每個 objective 一關，四個實驗室插在各自教材段落之後。
export function buildPath(): PathNode[] {
  const path: PathNode[] = [];
  for (const info of levelInfos) {
    const worldId = `d${info.objectiveId[1]}` as WorldId;
    path.push({ kind: "level", id: info.objectiveId, worldId, info });
    const lab = labs.find((item) => item.id === labAfter[info.objectiveId]);
    if (lab) path.push({ kind: "lab", id: lab.id, worldId: lab.worldId, lab });
  }
  return path;
}

export const MAX_LEVEL_QUESTIONS = 3;

export function levelQuestions(
  all: Question[],
  objectiveId: string,
): Question[] {
  return all
    .filter((question) => question.objectiveIds.includes(objectiveId))
    .slice(0, MAX_LEVEL_QUESTIONS);
}

// 全對 3 星；錯在容許範圍內 2 星；其餘 1 星（完成即算過關）。
export function starsFor(wrong: number, tolerance: number): number {
  if (wrong <= 0) return 3;
  return wrong <= tolerance ? 2 : 1;
}

export function isUnlocked(
  path: PathNode[],
  index: number,
  cleared: Record<string, number>,
  freeRoam: boolean,
): boolean {
  if (freeRoam || index <= 0) return true;
  return (cleared[path[index - 1]!.id] ?? 0) >= 1;
}

// 讀教材的連結：與 reading.ts 的 section 錨點一致（d1-o1）。
export function textbookLink(objectiveId: string) {
  return {
    chapter: objectiveId.slice(0, 2).toLowerCase(),
    section: objectiveId.toLowerCase(),
  };
}
