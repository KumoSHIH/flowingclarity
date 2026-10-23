# 課程內頁待修正項目驗收

2026-10-20 以本機 fixture 經正式 `/course/[slug]` 元件鏈完成 Chrome CDP 驗收；fixture 只供驗證，正式 API 未加入 fallback。桌機使用 1440×1000，手機使用 390×844。

## 結果

- 兩尺寸皆無水平溢位，頁面維持單一 `h1`，圖片均有 `alt`。
- 內容 `h2` 桌機為 38px、手機為 26px；Hero 展示標題不受影響。
- 學員心得只出現一個區塊；Studio 與 parser 會拒絕第二個區塊。
- 圖片輪播桌機為左圖右文，手機依標題、圖片、控制、固定文字排列；前進控制由 `01 / 03` 切換為 `02 / 03`，按鈕為 48×48px，鍵盤焦點框為 2px。
- 延伸閱讀位於報名區之後；卡片 hover 標題由 `rgb(56, 52, 46)` 變為 `rgb(164, 107, 84)`。
- `prefers-reduced-motion: reduce` 下圖片輪播與延伸閱讀軌道的 transition duration 均為 `0s`。

## 證據

- `course-detail-desktop.png`：桌機頁首與章節導覽。
- `course-detail-carousel-desktop.png`：桌機左圖右文輪播。
- `course-detail-carousel-mobile.png`：手機輪播堆疊與控制。
- `course-detail-related-mobile.png`：手機報名後的延伸閱讀。

本輪未執行 Safari、Firefox、實體觸控裝置或螢幕閱讀器人工驗收；更新後的 Sanity schema 尚未部署，production 草稿／發布／匿名讀取／清除流程仍待下一階段。
