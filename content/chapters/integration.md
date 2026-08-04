# 跨領域整合速查

## 從 issue 到 PR 的控制鏈

先以 D1 定義輸入、輸出、成功標準與自主程度；D2 選工具、MCP、repository／branch scope 與錯誤處理；D3 保存 checkpoint 與決策；D4 以 tests、scans、logs、traces 評估；D5 在任務可安全切分時協調多代理；D6 以最小權限、hooks、approval gates 與 audit log 落實護欄。

## 題幹辨識順序

1. 找動詞：configure、prevent、evaluate、recover、orchestrate。
2. 找限制：least privilege、irreversible、specific repository、without disrupting。
3. 判斷生命週期：規劃、執行、評估、恢復或稽核。
4. 排除會擴權、跳過驗證、丟失狀態或增加無效摩擦的選項。
5. 選最小、直接、可驗證與可回滾的答案。

## 常見跨域陷阱

護欄不是評估：前者限制行動，後者量測品質。記憶不是狀態：前者保存可重用脈絡，後者代表目前任務進度。自主不是權限：代理即使能自行決策，也只能在授權工具與 scope 內行動。重試不是恢復策略的全部：永久錯誤、部分失敗與代理衝突需要升級、重派、整合或 rollback。來源：GH600-SG、GH-DOC-28。
