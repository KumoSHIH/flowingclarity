# 待處理事項

## 首頁 Banner Canvas 動畫

**狀態：** 已實作（2026-10-04）；實機手機效能待量測  
**目標元件：** `app/components/HomeBanner.vue`

在現有 `home-banner__plate` 靜態底圖上疊加透明 Canvas 動畫層，不重繪或取代底圖。動畫包含少量光點沿玫瑰花瓣緩慢移動，以及使用者點選課程分類時，由對應的 `atlas-category__marker` 位置產生一次擴散波紋。動畫不得阻擋分類按鈕、連結或其他互動。

### 實作與驗收重點

- 使用原生 Canvas API，不新增動畫套件。
- Canvas 尺寸隨 Banner 調整，並限制高像素密度裝置的渲染倍率。
- Banner 離開視窗或頁面隱藏時暫停動畫，避免持續耗用資源。
- 手機版降低光點數量；`prefers-reduced-motion: reduce` 時停用持續移動，只保留簡短且低動態的點選回饋。
- 保留原圖片的替代文字與語意，Canvas 設為裝飾性元素。
- 驗證桌面、手機、鍵盤操作及連續快速切換分類時的顯示與效能。

### 實作紀錄

- `app/composables/useRoseAtlasAnimation.ts` 使用原生 Canvas；桌面 6 個光點、手機 3 個，沿底圖花瓣曲線移動，使用與圖片相同的置中 cover 縮放。
- `HomeBanner.vue` 保留底圖與替代文字，加入 `aria-hidden`、`pointer-events: none` 的透明層。點選或鍵盤啟動分類時，從標記中心產生 700ms 波紋，最多保留 4 個；移除原本持續循環的 hover 波紋。
- 渲染倍率上限為 2；尺寸由 ResizeObserver 同步。離開畫面或切換至背景頁籤時停止繪製，卸載時清除監聽與動畫。
- 減少動態模式不繪製持續光點，點選時只顯示 180ms 原地淡出的圓環；支援即時切換系統偏好。

### 驗證結果與後續

- `npm run test -w web`：動畫測試 6 項通過。舊輪播測試已於 2026-10-04 後續 CMS 調整中改為四欄內容與首頁串接驗證；目前前端 30 項測試全數通過。
- `npm run typecheck -w web`、`npm run build -w web`：通過。建置仍有 Nuxt／Tailwind 外掛 sourcemap 警告。
- Chrome 無頭瀏覽器以 1440×1000 與 390×844、DPR 2 驗證：無水平溢位，四個標記命中正確，連續 16 次點選及 Enter 選取均正常；已檢視桌面與手機截圖。
- 自動化測試另涵蓋 DPR 上限、尺寸變動、背景與離屏暫停、卸載清理、減少動態偏好及 Canvas 不可用時的操作。
- 實機複查：開啟首頁，快速切換分類、捲離 Banner、切換頁籤，再啟用系統減少動態設定；確認暫停／恢復與短暫回饋。尚未量測實機手機 FPS／耗電。
