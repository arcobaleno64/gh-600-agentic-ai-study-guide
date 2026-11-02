# 部署說明

## 首次推送

首次推送 `main` 只執行 CI。部署 workflow 只有 `workflow_dispatch` 觸發，且 job 需要 repository variable `CLOUDFLARE_DEPLOY_ENABLED=true`。

## Cloudflare 設定

在 GitHub repository 設定下列 Actions secrets，請勿寫入 repository：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

確認本機 gate 與 CI 通過後，將 `CLOUDFLARE_DEPLOY_ENABLED` 設為 `true`，再手動執行 **Deploy to Cloudflare Workers**，並在 `exam` 選項選擇要部署的考試。每個考試一個獨立的 Worker，名稱記在 `exams/<code>/data/site.json` 的 `workerName`，網址（`siteUrl`）的主機名稱必須以它開頭；新增考試時，也要把它加進 workflow 的 `exam` 選項。

## 本機 dry run

```powershell
npm ci
npm run build
npx wrangler deploy --dry-run
```

GH-600 的 Worker 名稱為 `gh-600-agentic-ai-study-guide`（`wrangler.jsonc` 的預設），GH-500 為 `gh-500-ghas-study-guide`（部署時以 `--name` 覆蓋）；靜態輸出位於 `dist/`。
