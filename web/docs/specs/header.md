# Header 功能規格

**狀態：** draft

**範圍：** 首頁 Header 第一版

**依據：** `PRODUCT.md`、`DESIGN.md`、`.impeccable/mocks/home-header-scroll-behavior.md`、現有首頁與測試

## 目標與受眾

協助正在了解身心課程的訪客隨時辨識品牌，並前往各主要單元的首頁或獨立頁面。桌面訪客在首屏先使用 Banner 內導覽；離開首屏後由固定 Header 接續。平板與手機訪客進站即看見固定 Header，透過展開選單前往目標頁面。

## 範圍與非目標

第一版包含品牌入口、五項站內頁面導覽、桌面捲動顯示規則、行動選單及無障礙行為。本規格定義連結與後臺內容契約，但本階段不負責建立各目的頁面、不修改 UI 或 Sanity schema、不管理 Banner 文案，也不涵蓋會員、報名或付款流程。其他頁面是否共用同一個 Header 是後續依賴，不列入第一版驗收。

## 內容契約

| 欄位 | 語意與型別 | 必填／長度與數量 | 編輯責任 | 預定資料來源 |
| --- | --- | --- | --- | --- |
| `brandName` | 品牌可讀名稱；字串 | 必填；2–20 個中文字 | 品牌／內容負責人 | `siteSettings.brandName`；暫定「普那生活空間」待確認 |
| `brandLogo` | 品牌圖像；圖片 | 選填；1 張 SVG／PNG，須提供固有尺寸 | 品牌／內容負責人 | `siteSettings.brandLogo`；現有資產僅供遷移參考 |
| `brandDestination` | 品牌入口；站內路徑 | 必填；1 個 | 產品負責人 | `siteSettings.brandDestination`；確認為 `/` |
| `navigationItems[].label` | 目的地名稱；字串 | 必填；2–8 個中文字 | 內容負責人 | `siteSettings.navigationItems` |
| `navigationItems[].destination` | 以 `/` 開頭的站內頁面路徑；字串 | 必填；不得指向不存在目標 | 產品／內容負責人 | `siteSettings.navigationItems` |
| `navigationItems[].accessibleLabel` | 僅在可見文字不足時補充；字串 | 選填；最長 30 個中文字 | 內容負責人 | `siteSettings.navigationItems` |

第一版固定使用下列 5 項導覽，名稱、順序與目的地均已確認：

| 順序 | 顯示名稱 | 目的地 | 目的地類型 |
| --- | --- | --- | --- |
| 1 | 近期活動 | `/events` | 單元首頁或頁面 |
| 2 | 課程探索 | `/course` | 單元首頁或頁面 |
| 3 | 個案諮詢 | `/session` | 單元首頁或頁面 |
| 4 | 文章分享 | `/articles` | 單元首頁或頁面 |
| 5 | 關於我們 | `/about` | 單元首頁或頁面 |

固定 Header、Banner 的 hero-menu 與 Footer 導覽共用 `siteSettings.navigationItems`；頁面透過 `useSiteSettings` 取得一次設定再傳入三處。無有效設定時 Header／hero-menu 保留已確認的五項導覽常數，但不代表可發布。第一版 schema 固定五項名稱、順序及目的地；新增項目須先修改規格與 validation，並完成目的頁。

## 後臺共用設定方向

Sanity 使用 `siteSettings` 單例（固定 ID `site-settings`）。Header 與 Footer 共用品牌名稱與導覽，但依使用者要求分別使用 `brandLogo`（Header Logo）與 `footerLogo`（Footer Logo）；兩者不互相備援，缺圖顯示品牌名稱。不另建 `headerSettings` 或 `footerSettings`。Footer 聯絡、社群、品牌主張及版權仍放在同一文件的語意群組。

2026-10-08 已部署 schema，並以現有公開文件完成草稿隔離、發布後匿名讀取、Header／hero-menu／Footer 同步及原內容還原。Studio 網頁尚無 hostname，未完成實際編輯介面的欄位操作驗收；Header 整體功能驗收也仍受四個目的頁阻擋。

## 狀態與行為

- 桌面（`>= 1024px`）：Banner 與視窗相交時固定 Header 隱藏；Banner 完全離開後由上方顯示，重新進入時隱藏。Banner 內導覽仍可操作。
- 平板與手機（`<= 1023px`）：固定 Header 始終顯示；選單預設收合。展開後鎖定背景捲動，點選品牌或項目、按 `Escape`、切換至桌面寬度時收合。
- 開啟選單後焦點移至第一個項目；關閉後回到選單按鈕。收合內容不可見、不可點擊、不可被鍵盤聚焦。
- 全站設定應由伺服器端取得，Header 不顯示獨立 loading 骨架。Logo 缺圖時仍顯示品牌可讀名稱；選填欄位缺少時不留下空白控制項。讀取失敗、必要導覽設定缺失或路徑無效時視為設定錯誤，不得以失效連結發布。
- 標籤超過建議長度時允許換行，不截斷文字；行動選單內容超出可用高度時可垂直捲動。選取項目後進行站內頁面導覽，URL 更新為對應路徑並顯示該單元首頁或頁面。

## 響應式與無障礙

Header 使用 `header`，主要導覽使用具名稱的 `nav`；品牌為可操作連結，Logo 為裝飾圖時使用空 `alt` 並由連結提供可讀名稱。選單按鈕維護 `aria-controls`、`aria-expanded` 與符合狀態的名稱。DOM 與鍵盤順序須和視覺順序一致，所有控制項保留可見焦點；觸控目標至少 44 × 44px，行動選項至少 72px 高。各目的頁面須為固定 Header 保留足夠的頂部空間。動畫遵守 `prefers-reduced-motion`，停用位移轉場但不可改變可見狀態。

## 驗收條件

1. 桌面首屏只呈現 Banner 導覽；Banner 完全離屏後固定 Header 出現，返回首屏時隱藏。
2. 1023px 以下進站即可見品牌與選單按鈕；展開、`Escape`、點選項目及跨越 breakpoint 的收合行為可由測試觀察。
3. Header、Banner 與 Footer 導覽都從同一份共用設定依序顯示「近期活動、課程探索、個案諮詢、文章分享、關於我們」，並分別連到 `/events`、`/course`、`/session`、`/articles`、`/about`。
4. 選單收合時無隱藏項目可被 Tab 聚焦；開關選單後焦點位置符合本規格，背景捲動只在展開期間鎖定。
5. 選取每個項目後，URL 變更為指定站內路徑，對應頁面可載入，且頁面主要內容不被固定 Header 遮住。
6. Logo 載入失敗、選填欄位缺少、最長標籤、窄螢幕及 reduced motion 下仍可辨識並完成導覽。
7. 行為測試、鍵盤手動驗證及 `npm run typecheck -w web` 通過；任一目的頁面不存在時不通過驗收。
8. 後臺資料化完成後，Studio 只提供一個全站設定入口，Header、Banner 與 Footer 讀取相同的 `siteSettings` 文件及 `navigationItems`，schema 中不存在重複的元件專屬導覽欄位。

## 待決事項與下一階段輸入

- `/events`、`/course`、`/session`、`/articles`、`/about` 的頁面內容與交付時程是 Header 實作的依賴。
- 若 Header 要跨頁共用，需確認目前頁標示方式，以及品牌入口在首頁是否重新載入或捲回頂端。
- 全站設定串接、遠端 schema 與 API 層草稿／發布驗收已完成；仍需正式內容核准、Studio hostname／編輯介面驗收及四個目的頁。查詢失敗時品牌入口只顯示「首頁」，不使用未核准品牌 fixture。
- 設計階段需提供桌面／行動視覺稿與品牌文字備援樣式；開發階段需統一三處導覽資料，並補齊焦點、路由與目的頁面可到達性的回歸測試。


## 人工測試後修正清單
- [] 當前單元需要加上 下底線，目前只有關於我們和文章分享有這個效果