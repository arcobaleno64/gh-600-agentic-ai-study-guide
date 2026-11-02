# 跨領域整合速查

## 從 commit 到組織的安全控制鏈

六個領域描述的是同一條路徑上的不同責任：機密在推送時被擋下，相依性與程式碼在 pull request 被檢查，警示在合併後被排序與修復，組織再用同一套設定確保每個 repository 都走這條路。某一段沒有作用，不能用另一段的結果替代；例如 push protection 沒開，事後的 secret scanning 警示只能補救，不能算預防。

### orders-api 的控制鏈

延續全書案例：Contoso 的 orders-api 是私有 repository，組織已啟用 Secret Protection 與 Code Security。以下表格是本書設計的檢查方式，可依團隊既有流程調整；它不是官方固定程序。

| 階段            | 應作的決定                             | 可查的證據                                         | 對應領域 |
| --------------- | -------------------------------------- | -------------------------------------------------- | -------- |
| 推送 commit     | 機密能否進入 Git 歷史                  | push protection 的阻擋與繞過紀錄                   | D2       |
| 開 pull request | 這次變更是否引入有弱點的相依性或程式碼 | dependency review 結果、Code scanning results 檢查 | D3、D4   |
| 合併前把關      | 哪些結果必須通過才能合併               | ruleset 的 code scanning 規則、必要工具            | D4       |
| 合併後處理      | 既有警示的優先順序與修復方式           | Dependabot 警示、EPSS、campaign、autofix           | D3、D5   |
| 組織層級        | 所有 repository 是否由同一套設定管理   | security configuration 的狀態與涵蓋指標            | D6       |
| 看全貌與留證據  | 功能是否都已啟用、合規資料從哪取得     | Coverage 檢視、稽核日誌                            | D1       |

若某一段無法提供證據，先處理該缺口，不用「警示很少」替代。例如 security overview 顯示沒有 secret scanning 警示，但 Coverage 顯示該功能沒啟用，這時「沒有警示」不是安全的證據。

### 紙上實作：把一個 repository 的安全設定寫成一頁

用自己的 repository 寫出：它是公開還是私有、組織有沒有啟用 Secret Protection 與 Code Security、push protection 與 code scanning 的設定方式（default 或 advanced）、有沒有 ruleset 要求 code scanning 結果、Dependabot 的警示與更新設定、以及它由哪一份 security configuration 管理。再請另一位讀者只依這一頁回答：新推送的權杖會被擋嗎？有弱點的新套件會在哪一步被看見？哪些警示會阻擋合併？

## 題幹辨識順序

1. 找動詞：enable、prevent、detect、triage、remediate、enforce。
2. 找限制：公開或私有、組織或 repository 層級、預設分支、at scale、without disrupting。
3. 判斷發生的時間點：推送前、合併前，或合併後的事後處理。
4. 排除在題目條件下不可用的功能（例如私有 repository 卻沒有對應授權），以及只能事後補救卻被當成預防的選項。
5. 在滿足需求的方案中，優先選擇官方文件明示、最直接的做法；若操作本質不可逆（例如外洩的憑證），先撤銷或輪替，再談其他處理。

### 把限制放進判斷

**情境一：** 題目要求「防止」權杖進入 repository，選項是 secret scanning 警示、push protection、或每週掃描歷史。

**解析：** 選 push protection。動詞是 prevent，它在推送時阻擋；secret scanning 是事後找出已存在的 secret，每週掃描同樣晚於推送。這題與「已經外洩該怎麼辦」不同：後者應先撤銷或輪替憑證，因為憑證一外洩就該視為已被取得。

**情境二：** 同一個 pull request 上，dependency review 檢查失敗，Code scanning results 檢查通過。團隊問：這代表程式碼沒有問題嗎？

**解析：** 不代表。兩個檢查看的是不同風險：dependency review 檢查 pull request 引入的相依性變更，code scanning 檢查程式碼的新警示。一個通過不能抵銷另一個失敗，要分別處理。這同時涉及 D3 的相依性防護與 D4 的程式碼掃描。

**情境三：** 組織想為所有 repository 建立同一份 configuration，但已有部分 repository 使用 advanced setup，不能被破壞。

**解析：** 在 configuration 的 Default setup 選「Enabled with advanced setup allowed」：它只在 CodeQL 分析目前沒有執行的 repository 啟用 default setup。這同時涉及 D4 的 setup 類型與 D6 的大規模推出。

以上為本書原創情境。若題目改成「找出哪些 repository 還沒有啟用」，重點就會移到 Coverage 與 configuration 狀態；不能不看動詞而永遠選同一種功能。

## 常見跨域陷阱

| 容易混淆的概念        | 區分問題                                           | 誤判的後果                                   |
| --------------------- | -------------------------------------------------- | -------------------------------------------- |
| 預防與事後處理        | 發生在變更進入之前，還是之後？                     | 用警示處理取代阻擋                           |
| 公開與私有            | 這個功能在私有 repository 需要授權嗎？             | 把公開可用的功能當成私有也可用               |
| Repository 與組織層級 | 設定在單一 repository，還是由 configuration 管理？ | 在 repository 自行改設定，使狀態變成 removed |
| 預設分支與其他分支    | 警示頁面看的是哪個分支？                           | 以為功能分支修好就等於警示已關閉             |
| 沒有警示與沒有弱點    | 功能啟用了嗎？該語言在掃描範圍內嗎？               | 把沒有警示當成安全證明                       |
| 版本更新與警示處理    | dependabot.yml 管的是 version updates，還是警示？  | 以為設定檔能篩選要處理的 Dependabot 警示     |

### 反向檢核你的理解

讀完後，試著不用術語回答下面的問題：

1. 為什麼 push protection 開著，secret scanning 仍然需要？指出各自作用的時間點。
2. 為什麼功能分支修好警示，警示頁面仍可能顯示開啟中？指出頁面反映的是哪個分支。
3. 為什麼 SBOM 找不到「誰依賴我」？指出 SBOM 描述的方向。
4. 為什麼 repository 狀態顯示 removed，不等於與 configuration 完全斷開？指出差別。
5. 為什麼沒有 code scanning 警示的 PHP 程式碼，不能說沒有弱點？指出該語言的支援狀況。

參考回答分別是：前者阻擋、後者找出已存在的 secret；頁面只反映預設分支，其他分支看 Affected branches；SBOM 描述專案依賴什麼，不含 dependents；removed 仍與 configuration 關聯、只是不再繼承全部設定，完全斷開的是 detached；CodeQL 不支援 PHP。若只能記住這五句而無法舉例，請回到相應章節，把例子寫出來。

技能對照：[GH-500 Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-500)（GH500-SG）。本章延伸閱讀：GH500-DOC-02（push protection）、GH500-DOC-15（dependency review）、GH500-DOC-31（code scanning 警示）、GH500-DOC-56（configuration 狀態）。本章整合案例與驗收方式為教學設計，並未宣稱經外部專家審訂。
