# 開始使用：GH-500 四週備考指南

## 官方基準

本指南以 **GH-500: GitHub Advanced Security** 的技能範圍組織內容，對應 **GitHub Advanced Security** 認證。讀者應已熟悉 repository、branch、pull request 與基本 GitHub Actions；本書把重點放在每項安全功能「在什麼條件下可用、在哪個時間點作用、由誰設定」，以及遇到警示時該先做什麼決定。

教材於 2026-11-02 依官方 Study Guide 與 GitHub Docs 的功能頁面整理，來源網址與標題列在來源頁（共 60 項）。這是本站自行整理，不代表經過官方或專家審訂。Study Guide 標示的更新日為 2026-05-14；考試時間、語言、預約條件與最新範圍，請在報名前查閱[認證頁](https://learn.microsoft.com/en-us/credentials/certifications/github-advanced-security/)與[Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-500)（GH500-CERT、GH500-SG）。

### 分清三種內容

**官方技能範圍**說明需要掌握的能力；**產品文件**描述特定方案與設定下的功能行為；**本書案例與練習**用來訓練判斷，不是官方固定程序，也不是實際考題。GitHub 的安全功能會依方案（例如 Free、Pro、Team、Enterprise Cloud）、repository 類型（公開或私有）與授權（Secret Protection、Code Security）而不同，所以讀每個功能時都要先問：「這個條件下它還存在嗎？」

各章末尾的來源說明寫明該章是逐句對照，還是只對照了讀到的頁面段落；沒讀到的部分，備考前請讀來源原文。

## 使用方式

第一次閱讀可依第一章到第六章建立完整流程，再讀整合章；查找概念時，直接搜尋 push protection、default setup、auto-triage、security configuration 等詞彙，進入對應小節。每個技能小節都保留判斷練習，先自己寫下答案再看解析。

### 全書貫穿案例

假設 Contoso 的訂單團隊維護私有 repository orders-api，組織已啟用 GitHub Secret Protection 與 GitHub Code Security。有人在 commit 裡放了權杖、有人引入一個有弱點的套件、有一段程式碼被 CodeQL 標出命令注入，而安全團隊要確保所有 repository 都用同一套設定。

第一章分清有哪些功能、誰能用；第二章處理機密外洩；第三章處理相依性風險；第四章設定並判讀程式碼掃描；第五章決定警示的優先順序與修復；第六章在組織層級大規模推出。

### 每次閱讀的實際產物

1. 選一個小節，先讀情境，寫下自己的下一步及理由。
2. 閱讀解析，指出原答案漏掉的條件；不只抄結論。
3. 用自己的 repository 設定其中一項功能，截圖或記下實際看到的畫面。
4. 做對應練習題，記錄答錯原因，再回到教材補足因果關係。

28 天計畫是安排節奏的輔助，不是完成天數就代表學會。對熟悉的領域可以快速檢核；對尚無實作經驗的內容，保留時間在可拋棄的環境驗證。

### 在可拋棄的環境驗證

公開 repository 可以免費使用 secret scanning 與 push protection、code scanning、Dependabot 與 dependency review，所以最省錢的練習方式，是建立一個專門練習用的公開 repository。組織層級的功能（security configuration、campaigns、delegated bypass、security manager、global settings）需要付費方案，無法在個人公開 repository 驗證，這部分只能讀文件。

練習時只用文件列出的測試字串，不要使用任何真實的憑證；刻意放入有弱點的程式碼時，要在 repository 標明不可部署。本站作者另有一個實作對照 repository：[gh500-ghas-lab](https://github.com/arcobaleno64/gh500-ghas-lab)，記錄了實測結果與本站敘述一致、不一致或無法測試的地方；它只是對照紀錄，不是本站內容的審訂。

## 六領域配置

| 領域                                  | 官方權重 | 本站題數 |
| ------------------------------------- | -------: | -------: |
| D1 GitHub 安全套件、功能與生態系      |  15%–20% |       14 |
| D2 設定與使用 Secret Protection       |  15%–20% |       14 |
| D3 設定與使用供應鏈安全               |  15%–20% |       14 |
| D4 設定與使用 Code Security           |  10%–15% |       12 |
| D5 安全營運：最佳做法、優先順序與修復 |  15%–20% |       15 |
| D6 GitHub 安全套件管理                |  10%–15% |       12 |

權重表示官方技能配置，不保證每次考試固定出現相同比例的題數。本站 81 題題庫（另有 10 題情境題組供仿真考使用）是原創練習集合，不能用來推算正式試卷題數。題庫的盲測分數只能當作粗略參考，因為出題與作答的是同一類模型；尚未有真人作答校準。

## 應考原則

先找題幹要達成的結果與限制，再比較選項是否真的解決那個問題。常見的限制詞是公開或私有、組織或 repository 層級、預設分支、事前或事後；看到某個功能名稱就選，卻沒確認它在題目的條件下是否可用，是最常見的失誤。

兩個方案都可行時，優先選擇官方文件明示的做法，不替題目增加未寫出的條件。數字題（天數、則數、上限）要連同它所指的對象一起記，例如 25 是一次指派給 Copilot 的警示數，1000 是一個 campaign 的警示上限。

官方及格量尺分數不能直接換成固定答對率。本站設定的練習目標只是提醒，未經校準，不能預測正式考試通過。比數字更重要的是：每一題答錯，都能指出是哪個條件看漏了。

**暖身練習：** 安全主管看到 security overview 沒有任何 secret scanning 警示，說「所以沒有外洩」。你最先確認什麼？

**解析：** 先用 Coverage 檢視確認 secret scanning 在這些 repository 真的啟用。沒有警示，可能是真的沒有問題，也可能是功能沒啟用，或弱點尚未被偵測；功能沒啟用時，「沒有警示」不是證據。

來源：[GitHub Advanced Security 認證頁](https://learn.microsoft.com/en-us/credentials/certifications/github-advanced-security/)（GH500-CERT）、[Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-500)（GH500-SG）、[Security overview](https://docs.github.com/en/code-security/security-overview/about-security-overview)（GH500-DOC-08）。本頁的暖身練習與使用方式屬教學設計，並未宣稱經外部專家審訂。
