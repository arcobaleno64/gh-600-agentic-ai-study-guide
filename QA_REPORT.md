# GH-600 品質驗證報告

資料與官方頁面最後核對：2026-08-04

Study Guide updated date：2026-05-14
專案版本：1.0.0

## 官方基準

- [完成] [認證頁](https://learn.microsoft.com/en-us/credentials/certifications/agentic-ai-developer/) 列出 120 分鐘、English 與六個技能領域。
- [完成] [Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-600) 說明 700 以上為及格量尺分數。
- [完成] 六領域權重與 19 個 objective 已寫入單考科 metadata。

## 內容契約

- [完成] 28 天、四週計畫；每日資料完整且日次連續。
- [完成] 60 題原創題：42 單選、12 複選、6 是非；領域題數為 10／14／8／10／10／8。
- [完成] 120 個術語、24 題 FAQ、24 題情境 Q&A、36 條必背句、30 個唯一官方來源。
- [完成] 每個 objective 至少有一題及一段教材；所有 domain／objective／source 參照有效。
- [完成] 來源 URL 只接受 `learn.microsoft.com` 與 `docs.github.com`。
- [完成] 內容驗證器會拒絕題號缺口、題型錯誤、無效參照、非官方 URL 與領域比例越界。

## 自動 gate

- [完成] `npm ci`
- [完成] `npm run format:check`
- [完成] `npm run validate`
- [完成] `npm test`：12／12 通過。
- [完成] `npm run build`
- [完成] `npm audit`：0 vulnerabilities。
- [完成] `npx wrangler deploy --dry-run`：讀取 13 個 production assets 並正常結束。

## 瀏覽器 QA

- [完成] 28 天全部顯示；勾選後進度由 0／28 更新並保存。
- [完成] 開始章、六領域章與跨領域速查共 8 個教材分頁；D6 顯示 D6-O1、D6-O2。
- [完成] 複選題選取三個正解後顯示「答對了」；`false` 是非答案視為已作答且判分正確；單選錯答顯示解析。
- [完成] 錯題重練只顯示剛建立的 `GH600-004`。
- [完成] 搜尋 `MCP` 同時找到詞條、問答、來源、題目與教材。
- [完成] 官方來源頁顯示 30 筆，全部為允許網域。
- [完成] valid GH-600 JSON 匯入後日期與主題立即更新；不支援 schema 會顯示 warning 且不覆寫資料。
- [完成] 匯出 helper 的 object URL、檔名與 click 行為由自動測試覆蓋；瀏覽器按鈕未產生應用程式例外。
- [完成] 列印按鈕進入瀏覽器原生列印 UI；`@media print` 規則存在。
- [完成] 390×844 手機版無橫向溢位；導覽可開啟，題卡與四個選項均落在 viewport 內。
- [完成] PWA manifest、Service Worker 註冊與新 cache key 均存在；安裝提示可見。
- [完成] 應用程式自身 console／page error 為 0。Edge 擴充橋接層另有 9 筆訊息通道／舊 origin HMR 雜訊，未包含本站堆疊。

## 發布控制

- [完成] CI 與 deployment workflow 分離，Actions 皆 pinned 到完整 commit SHA。
- [完成] 推送 `main` 只執行 CI；deployment 只有 `workflow_dispatch`。
- [完成] deployment job 需要 `CLOUDFLARE_DEPLOY_ENABLED=true`，且 secrets 不在 repository 中。
- [注意] production deployment 尚未執行；需先設定兩個 Cloudflare secrets 與啟用變數。
