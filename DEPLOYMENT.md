# 部署說明

## 首次推送

首次推送 `main` 只執行 CI。部署 workflow 只有 `workflow_dispatch` 觸發，且 job 需要 repository variable `CLOUDFLARE_DEPLOY_ENABLED=true`。

## Cloudflare 設定

在 GitHub repository 設定下列 Actions secrets，請勿寫入 repository：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

確認本機 gate 與 CI 通過後，將 `CLOUDFLARE_DEPLOY_ENABLED` 設為 `true`，再手動執行 **Deploy to Cloudflare Workers**。

## 本機 dry run

```powershell
npm ci
npm run build
npx wrangler deploy --dry-run
```

Worker 名稱為 `gh-600-agentic-ai-study-guide`；靜態輸出位於 `dist/`。
