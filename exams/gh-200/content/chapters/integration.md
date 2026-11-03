# 跨領域整合速查

## 從觸發到部署的控制鏈

五個領域描述的是同一條路徑上的不同責任：事件觸發工作流程、工作流程組合成 job 與矩陣、重複的邏輯被抽成可重用工作流程與 actions、組織用政策決定誰能用什麼、runner 與 secrets 提供執行環境，最後用環境核准、OIDC 與證明把部署管住。某一段沒有證據，就不能用「它通常會跑」替代。

### orders-api 的控制鏈

延續全書案例：Contoso 的 orders-api 在 pull request 上跑矩陣測試，合併後呼叫平台團隊的可重用工作流程部署到雲端。以下表格是本書設計的檢查方式，可依團隊既有流程調整；它不是官方固定程序。

| 階段               | 應作的決定                                                   | 可查的證據                                                                | 對應領域 |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------- | -------- |
| 觸發               | 哪個事件、在哪個分支的檔案上才會觸發；拿到哪個 commit 與 ref | `on:` 設定、`github.event_name`、`GITHUB_SHA` 與 `GITHUB_REF`             | D1       |
| 結構與矩陣         | job 如何相依、矩陣組合是否被 `include`／`exclude` 改變       | job 相依圖、`needs`、展開後的矩陣組合                                     | D1       |
| 傳遞資料與快取     | 資料用輸出、環境檔還是成品傳；快取鍵是否隨相依檔變動         | `GITHUB_OUTPUT`、`GITHUB_ENV`、成品與快取鍵                               | D1       |
| 失敗後診斷與重跑   | 失敗在哪個 job 與步驟；重跑會不會拿到新的程式碼              | 日誌、除錯記錄、重新執行的 `GITHUB_SHA`                                   | D2       |
| 重用               | 重用的是整個工作流程、一組步驟，還是新工作流程的範本         | `workflow_call`、複合 action 的 `runs.steps`、組織的 `workflow-templates` | D2、D3   |
| 自訂 action 與發佈 | action 類型、輸入輸出、版本標籤如何維護                      | `action.yml`、發佈的 release 與主版本標籤                                 | D3       |
| 組織政策           | 允許哪些 actions、fork PR 是否需核准、預設權杖權限           | 組織與企業的 Actions 政策設定                                             | D4       |
| runner 與機密      | 用哪種 runner、哪個群組、secrets 設在哪一層                  | runner 群組存取設定、`_diag` 日誌、secrets 的層級與存取政策               | D4       |
| 部署核准與憑證     | 誰能核准部署、雲端憑證是否為長期                             | 環境保護規則、`id-token: write` 與雲端信任條件                            | D5       |
| 供應鏈證據與成本   | 成品來源能否驗證、這次執行的限制與費用                       | 成品證明與 `gh attestation verify`、保留期與使用量                        | D5       |

若某一段無法提供證據，先處理該缺口。例如一個排程工作流程「這週沒有失敗」，但它的檔案在功能分支，那麼它根本沒有執行，沒有失敗不是健康的證據。

### 紙上實作：把一個 repository 的自動化寫成一頁

用自己的 repository 寫出：每個工作流程由哪些事件觸發、檔案在哪個分支；矩陣展開後有幾個 job；資料怎麼在 job 之間傳；快取鍵是什麼；有哪些重用的元件、各用在 job 還是步驟層級；部署用哪個環境、有哪些保護規則；憑證是長期 secret 還是 OIDC；第三方 actions 固定到什麼；用什麼 runner。寫完之後，指出哪一格你只是「覺得是這樣」，而沒有在日誌或設定看到證據。

## 題幹辨識順序

1. 找動詞：trigger、reuse、publish、restrict、approve、authenticate、optimize。
2. 找限制：預設分支或功能分支、組織或 repository 層級、公開或私有、GitHub 代管或自管 runner、job 層級或步驟層級。
3. 判斷發生的時間點：解析工作流程時、執行時、核准前或核准後、發佈前或發佈後。
4. 排除在題目條件下不成立的選項（例如在 `if` 裡直接用 `secrets`、在 Windows runner 上用 Docker 容器 action、把 `workflow_dispatch` 的檔案放在非預設分支）。
5. 在滿足需求的方案中，優先選擇官方文件明示、最直接的做法；若操作涉及不受信任的輸入或長期憑證，先想「它怎麼被濫用」，再選方案。

### 把限制放進判斷

**情境一：** 團隊為了讓 fork 的貢獻也能跑測試，把工作流程改成 `pull_request_target`，並在工作流程裡 checkout PR 的程式碼來建置。

**解析：** 這是危險組合。`pull_request_target` 在基底 repository 預設分支的 context 執行，屬於特權觸發條件；再加上 checkout 並執行不受信任的 PR 程式碼，就可能被利用。改用 `pull_request`（fork PR 預設要核准、不傳 secrets），或把需要特權的部分用 `workflow_run` 分離，並謹慎處理來自其他工作流程的成品。這題同時涉及 D1 的觸發條件與 D5 的安全做法。

**情境二：** 平台團隊的可重用工作流程在 job 上設了 `environment: production`，環境裡有 `DEPLOY_KEY`。呼叫端 job 想用 `environment` 關鍵字，也一併傳入 secret，卻失敗。

**解析：** 環境要設在**被呼叫**的 job，呼叫端 job 不能使用 `environment` 關鍵字；呼叫端仍必須傳遞 secret（用 `secrets: inherit` 或具名傳遞）。環境 secret 優先於同名的 repository 或組織 secret，且必要審核者核准之前拿不到。這題涉及 D1 的可重用工作流程、D4 的 secrets 層級與 D5 的環境保護。

**情境三：** 公開 repository 想用自管 runner 省錢，團隊把 runner 放進組織的預設群組。

**解析：** 預設只有私有 repository 能使用群組內的 runner，公開 repository 要覆寫才能使用；而且官方警告自管 runner 幾乎不應該用在公開 repository，因為任何人都能開 PR 在上面執行程式碼，並可能長期入侵。若真的要用，考慮暫時性（`--ephemeral`）或 just-in-time runner，並限制網路與機器上的敏感資料。這題涉及 D4 的 runner 群組與 D5 的自管 runner 風險。

**情境四：** 雲端供應商的信任條件限定 `sub` 為 `repo:acme/orders-api:environment:production`，部署改成由平台團隊的可重用工作流程執行後，權杖被拒絕。

**解析：** 要讓雲端能分辨「是哪個工作流程」，可以用 REST API 自訂 `sub` 的格式（例如加上 `job_workflow_ref`），並先在雲端供應商建立對應條件再改範本，否則權杖可能被拒絕。這題涉及 D5 的 OIDC 與 D1 的可重用工作流程。

以上為本書原創情境。若題目改成「這次部署為什麼沒有觸發」，重點就會移到事件與預設分支；不能不看動詞而永遠選同一種功能。

## 常見跨域陷阱

| 容易混淆的概念                    | 區分問題                                           | 誤判的後果                                           |
| --------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| 重新執行與新的推送                | 重跑會沿用原本的 `GITHUB_SHA` 嗎？                 | 以為重跑舊執行就能驗證新程式碼                       |
| `github.event.inputs` 與 `inputs` | boolean 還保留型別嗎？                             | 條件永遠不成立                                       |
| `outcome` 與 `conclusion`         | 有沒有套用 `continue-on-error`？                   | 在條件裡讀到錯誤的結果                               |
| 可重用工作流程與複合 action       | 在 job 層級還是步驟層級呼叫？能直接用 secrets 嗎？ | 選錯重用機制，或以為複合 action 能直接讀 secrets     |
| 起始工作流程與可重用工作流程      | 複製後是否獨立？更新能否集中套用？                 | 以為改了範本，各專案就跟著更新                       |
| SHA 固定、標籤與 lockfile         | 這是 action 還是可重用工作流程？組織是否要求 SHA？ | 以為可重用工作流程也必須釘 SHA，或以為標籤不會被移動 |
| `GITHUB_TOKEN` 與 PAT             | 要觸發新的工作流程嗎？要跨 repository 嗎？         | 用 `GITHUB_TOKEN` 推送後預期會觸發下一個工作流程     |
| secrets 與 variables              | 值是機密嗎？是否會被遮蔽？                         | 把機密放進 variables，或在 `if` 直接比較 secret      |
| 企業與組織政策                    | 企業是啟用還是停用該政策？                         | 以為組織能啟用企業停用的政策                         |
| 長期 secret 與 OIDC               | 有沒有長期憑證存在 GitHub？信任條件寫了嗎？        | 只加 `id-token: write` 卻沒設雲端信任條件            |

來源：[Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)（GH200-DOC-01）、[Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)（GH200-DOC-08）、[Re-run workflows and jobs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs)（GH200-DOC-14）、[Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)（GH200-DOC-44）、[OIDC reference](https://docs.github.com/en/actions/reference/security/oidc)（GH200-DOC-49）、[Manage access to self-hosted runners](https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/manage-access)（GH200-DOC-33）；整合章整理自領域一到五的內容，各細節與核對範圍見各領域章節末尾的來源說明。表格與情境屬本書的教學設計，並未宣稱經外部專家審訂。
