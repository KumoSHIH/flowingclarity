# Footer 前端驗證

2026-10-07：從已選定 L「靜默座標」接續，前端狀態為 `frontend-ready`。首頁及課程頁共用 typed fixture，尚非 CMS 正式內容。

## 實際檢查

- Vitest 57 項、typecheck、build 通過。Vue Router 型別插件與 sourcemap 仍有既有警告。
- Chrome 於兩頁量測 320、560、900、1024、1440px；`results.json` 保留原始結果。`contentOverflow` 皆為空；`overflow` 包含刻意裁切的裝飾 SVG，手機為 true 並不表示內容越界。
- PNG 為頁面載入後隱藏其他區塊的 Footer 取景；已檢視桌面、中間、手機代表截圖。
- 200% 字體與最長 Email 的 DOM 壓力檢查無內容越界；非完整 OS 文字縮放認證。
- Tab 由近期活動移到課程探索，焦點 outline 為 solid。reduced motion 移除點群並停止 flowing，保留三條線。
- Vitest 驗證缺值、Logo 失敗、聯絡操作、五項導覽、目前頁狀態與動畫生命週期。

## 技術審核

Implementation integrity：L 方向、共用資料與既有 token 一致。Detector 0 errors、2 個字級 advisory；保留 prototype 的版權小字及窄螢幕主張字級。

| 面向 | 分數（0–4） | 結果／限制 |
| --- | --- | --- |
| 無障礙 | 3 | 語意、焦點、減少動態具備；完整讀屏與逐項鍵盤驗收待做 |
| 效能 | 3 | 離屏暫停與卸載清理已測；未做裝置效能 profiling |
| 響應式 | 3 | 五寬度與文字壓力檢查通過；缺值 fixtures 的瀏覽器截圖仍待補 |
| 主題 | 3 | 主色字體共用 token；分隔線沿用局部透明墨色 |
| 實作一致性 | 3 | 元件契約一致；正式內容與四個目的頁尚缺 |

合計 15/20，屬本機原型技術審核，不代表 production 通過。

## 阻擋與下一階段

- P1：`/events`、`/session`、`/articles`、`/about` 沒有頁面，連結無法完成目標任務；需各自功能實作後再執行完整 UI 驗收。
- P1（發布）：目前使用未核准示範內容；Sanity 單例與正式資料尚未建立，不能發布為正式內容。
- 完成上述依賴與剩餘人工檢查後才可標記 `ui-verified`，再進入 `integrate-sanity-content`。
