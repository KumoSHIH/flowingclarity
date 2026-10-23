# 首頁 Banner 功能規格

## 目標

讓具有 Sanity Studio 編輯權限的成員維護首頁 Banner 的大標題、敘述及主要行動按鈕。玫瑰底圖、課程分類與 Canvas 動畫由前端維護。

## 內容模型

Banner 為 ID 固定為 `homeBanner` 的單一文件，只有以下四個必填欄位：

| 欄位 | 用途 |
| --- | --- |
| `title` | 大標題，可換行，前台保留換行並依可用寬度折行 |
| `summary` | 敘述 |
| `buttonText` | 按鈕文字 |
| `buttonLink` | HTTP(S) 網址、以 `/` 開頭的站內路徑或頁面錨點 |

不再提供圖片、替代文字及輪播內容欄位。底圖仍保有前端替代文字。舊資料不需刪除，但不再由 API 讀取；既有文件需補上按鈕欄位並重新發布。

### 全站導覽資料

2026-10-07：`hero-menu` 改由首頁將 `useSiteSettings` 的 `navigationItems` 傳入，與 Header、Footer 共用 `site-settings` 單例中的五項名稱、順序、目的地及輔助說明；不在 `homeBanner` 增設另一份選單。個案諮詢為 `/session`。無有效全站設定時保留已確認的五項本機導覽，但四個目的頁與正式設定發布仍是上線門檻。Banner 自身四欄位及其 fallback 政策不受本次變更影響。

本機整合測試已驗證共用設定傳遞及 hero-menu 輔助說明更新。2026-10-08 遠端內容流以第一項 `accessibleLabel` 測試標記驗證：草稿不影響公開版，發布後 Header、hero-menu、Footer 同步，還原後標記移除且完整內容雜湊一致。Studio 編輯介面與完整目的頁仍待驗收，詳見 [Footer 規格](footer.md)。

## 文字、按鈕與版面

文字及按鈕的候選共用值見 [全站文字與按鈕候選規格](design-system.md)。Banner 對應「展示標題」「引導敘述」「大型主要按鈕」；目前已使用共用 CSS class 與 token，未另建 Vue 按鈕元件。

樣式對應：大標題使用 `.display-title`，淺色 Story 欄的敘述使用 `.lead-text`，按鈕使用 `.button-primary`，箭頭使用 `.button-primary__icon`。主要按鈕隨 Story 欄可用寬度縮小，最大寬度固定為 `360px`；`.hero-story-copy` 與 `.hero-cta` 只保留 Banner 的排列與外距。

### 已確認的版面規則

- 大標題、敘述與按鈕外框的左右邊界對齊；外側間距只由 `.hero-story-copy` 管理。按鈕內距屬於按鈕自身樣式。
- 桌面採左側 Atlas、右側淺砂色 Story；Atlas 佔 67%、Story 佔 33%。不大於 1250px 且大於 1023px 時改為 60%／40%；手機為 Atlas 在上、Story 在下。
- 大標題保留 CMS 換行，仍允許長文字折行；內容不得裁切或互相重疊。
- 手機首頁需預留固定 header 的高度；錨點捲動也需避開 header。桌面首屏不預留此空間。
- 桌面 Banner 選單位於 Atlas 上方中央並水平排列；深色品牌 logo 位於 Story 文案上方。手機隱藏 Banner 內的 logo、選單與地圖說明文字，改由固定 header 提供品牌與選單。
- 地圖中的「愛身體、撫慰心、究生命、展現美」皆為站內連結，依序前往 `/course#body`、`/course#heart`、`/course#life`、`/course#beauty`；課程總覽須在資料稍後載入時仍套用 hash，且定位後不被固定 Header 遮住。

### 目前實作基準

以下記錄現有 CSS，尚未視為全站通用規則：

| 範圍 | 版面與間距 |
| --- | --- |
| 共用左右間距 | `.hero-story-copy` 的 `padding-inline: clamp(28px, 3vw, 48px)`；目前手機也繼承，不是固定 `24px` |
| 桌面文字區 | 絕對定位，頂部 `18%`、底部 `8%`；logo 寬度為 `clamp(168px, 18vw, 190px)`，下方間距 `30px` |
| 桌面選單 | Atlas 上方中央水平排列，使用 `--hero-top` 定位；hover 與鍵盤焦點會降低透明度並上移 `2px` |
| 桌面垂直間距 | 敘述上方 `30px`、下方 `10px`；按鈕上方另加 `clamp(12px, 1.8vh, 20px)`。Flex 排列不折疊 margin，敘述至按鈕的間距是兩者相加 |
| 不大於 1023px | Atlas 最小高度 `64svh`；文字區回到正常排版，上下內距各 `50px`；敘述上方 `34px`、下方 `0`；按鈕上方 `20px` |
| 手機 header | 共用 `--home-header-height: 87px` 設定預留空間、header 最小高度及選單起點；區塊錨點預留此高度再加 `32px` |

`clamp(30px, 7vh, 30px)` 的上下限相同，目前實際固定為 `30px`。此處只記錄結果，未修改 CSS。

### 地圖互動與動畫

- 四個課程分類以絕對座標分布在玫瑰地圖上；每個分類以完整 marker 與文字區作為連結，暖白光暈會在 hover、鍵盤焦點與點擊狀態加強。手機縮小 marker 與類別文字，並隱藏課程清單。
- Canvas 光點沿六條花瓣曲線緩慢往返，使用暖白核心、金黃徑向漸層、`lighter` 混合模式與兩組不同週期的亮度變化，形成螢火蟲式呼吸光。桌面最多六顆，手機最多三顆。
- 點選分類會從 marker 中心產生漣漪。動畫在 Banner 離開視窗或文件隱藏時停止；Canvas DPR 上限為 2。
- `prefers-reduced-motion: reduce` 不播放漂移光點，只保留短暫、不擴張的分類點擊回饋。

## 驗收條件

1. 四個欄位皆必填；按鈕連結不得使用 JavaScript、data URL 或 `//` 開頭的網址。
2. 發布後重新開啟首頁，顯示四個欄位內容；點選按鈕在同一頁籤前往設定連結。
3. 草稿不出現在公開首頁；API 僅讀取已發布的固定文件。
4. 沒有可用文件、欄位不完整、連結無效或讀取失敗時，顯示本機示範內容。
5. CMS 內容不影響底圖、四個課程分類連結、點擊漣漪及動畫。桌面維持雙欄，手機維持上下排列。
6. 不使用 Swiper、輪播計時器或輪播頁碼。
7. 四個地圖分類可用滑鼠與鍵盤前往課程總覽的對應分類；直接或延後載入 `/course#body`、`#heart`、`#life`、`#beauty` 時，URL、作用中目錄及內容定位一致，目標不被固定 Header 遮住。

## 驗證方式

在儲存庫根目錄執行 `npm run test -w web`、`npm run test -w studio`，再執行兩個 workspace 的 `typecheck` 與 `build`。

人工發布驗證：在 Studio 填入不同標題、敘述、按鈕文字及連結並發布，重新整理首頁確認顯示與導向。再只儲存草稿，確認公開首頁內容不變。這個步驟需使用實際 Sanity 編輯帳號，不由本機測試代替。

樣式驗收：以 390px、1023px、1024px、1250px、1251px、1440px 視窗檢查雙欄比例、文案邊界、logo 與選單，並測試 CMS 長標題、手動換行及長按鈕文字。手機初次載入及點選課程探索錨點後，Banner 圖片頂端均不得被 header 蓋住；選單應從 header 下緣展開。檢查分類 hover、鍵盤焦點、Canvas 光暈、分頁隱藏／恢復與減少動態模式，記錄結果與截圖。本文件新增的是驗收條件，並非上述項目已全部通過的宣告。

## 2026-10-20 修正紀錄

首頁 Atlas 的四個分類由選取按鈕改為語意連結，保留既有 hover、鍵盤焦點、點擊漣漪與 active 視覺；課程總覽補上 loading 轉 ready 後的 hash 初始化與一次性捲動。Chrome CDP 以 production 公開資料驗證 1440×1000 與 390×844：四個 href 正確，實際點擊「撫慰心」到達 `/course#heart`；兩尺寸無水平溢位、手機操作區至少 44px、焦點框 2px、hover 色彩回饋成立，四個桌機 target 與手機 `#beauty` 均位於固定 Header 下方並同步 `aria-current="location"`。Web 39 檔／229 項測試、typecheck、production build 與 `git diff --check` 通過；Impeccable detector 為 0 個 anti-pattern，10 項 advisory 皆為既有且已核准的角色字級與色值。證據見 [首頁 Banner 課程分類連結驗收](../design/review/home-banner-course-targets-2026-10-20/README.md)。未執行 Safari、Firefox、實體觸控裝置或螢幕閱讀器人工驗收；本次不涉及 CMS schema、部署或遠端內容寫入。

## 人工測試後修正清單
- [x] banner: 左側地圖裡面的四個項目的連結（愛身體、撫慰心、究生命、展現美），幫我移動到 course 總覽頁的相關 target；2026-10-20 已分別連至 `/course#body`、`#heart`、`#life`、`#beauty`，並完成桌機／手機跨頁定位驗證
