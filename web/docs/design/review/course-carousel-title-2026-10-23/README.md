# 課程輪播章節標題驗證

## 修正範圍

2026-10-23 將課程詳情上方章節導覽的圖片輪播標籤，從前端固定字樣「圖片輪播」改為讀取該輪播區塊的後台 `title`。內容區本來已使用同一欄位，因此修正後導覽與內容標題會同步顯示，例如 production 課程目前設定的「課程花絮」。圖文內容原有的動態標題行為不變，其他固定角色章節也不受影響。

## 驗證結果

- production build `/course/rebalancing` 的導覽文字與輪播 `h2` 均為「課程花絮」。
- 點擊章節後，連結 `aria-current="location"` 正確，桌機固定列頂端為 87px；手機作用中項目自動進入可視範圍。
- 1440 × 1000 與 390 × 844 的 `scrollWidth` 分別等於 `innerWidth`，沒有水平溢位。
- 代表截圖：`desktop-1440.png`、`mobile-390.png`。
- Web 43 個測試檔、261 項測試、typecheck 與 production build 通過。

本次未修改 Studio schema 或 production 內容，也未執行遠端寫入。Safari／Firefox、真實 iOS／Android 與螢幕閱讀器仍待發布前交叉驗證。
