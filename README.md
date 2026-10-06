# GH-600 Agentic AI Developer 四週備考指南

繁體中文／臺灣用語的單頁互動式備考站，對應 **Exam GH-600: Developing in Agentic AI Systems** 與 **GitHub Certified: Agentic AI Developer**。

## 內容

- 28 天、四週學習計畫與本機進度。
- 六個官方領域、19 個 objectives 的結構化教材。
- 60 題原創情境題：42 單選、12 複選、6 是非。
- 120 個術語、24 題 FAQ、24 題情境 Q&A、36 條必背句。
- 36 個 Microsoft Learn／GitHub Docs 官方來源。
- 錯題重練、全站搜尋、列印、JSON 匯入匯出與 PWA 離線站殼。

本站不含實際考題、考古題或 exam dump，亦非 Microsoft 或 GitHub 官方出版品。

## 官方基準

截至 2026-08-04，官方資料列出：120 分鐘、英文考試、700 以上及格量尺分數，以及六個技能領域。Study Guide 顯示最後更新為 2026-05-14：

- [認證頁](https://learn.microsoft.com/en-us/credentials/certifications/agentic-ai-developer/)
- [GH-600 Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-600)

## 本機執行

```powershell
npm ci
npm run dev
```

## 驗證

```powershell
npm run format:check
npm run validate
npm test
npm run build
npm audit
npx wrangler deploy --dry-run
git diff --check
```

內容契約會驗證題號連續、三種題型、領域權重、objective／source 參照、官方網域與各 objective 的教材及題目覆蓋。

## 內容維護

1. 更新 `scripts/generate-gh600-content.mjs` 的 metadata、資料與教材。
2. 執行 `npm run generate:content`。
3. 執行完整驗證 gate，並把當日官方核對日期寫入 `lastVerified`。

## 部署

推送 `main` 只會執行 CI。Cloudflare production deployment 只能手動啟動，且 repository variable `CLOUDFLARE_DEPLOY_ENABLED` 必須為 `true`；另需在 GitHub 設定 `CLOUDFLARE_API_TOKEN` 與 `CLOUDFLARE_ACCOUNT_ID` secrets。請勿把 secret 寫入檔案或命令輸出。

## 基線來源

網站結構取自原 AZ-900／SC-900 備考站的 `15dfe32` 檔案快照，但本 repository 使用全新 Git 歷史、獨立內容契約與獨立部署設定。

本專案未附加 LICENSE。
