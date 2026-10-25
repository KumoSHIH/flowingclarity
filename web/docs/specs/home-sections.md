# 首頁內容區塊規格

**狀態：** `verified`

## 目標

在首頁 Banner 後補上品牌介紹、近期活動、近期課程與聯絡資訊，讓第一次造訪的使用者依序理解空間理念、可參與的內容及聯絡方式。視覺與資訊順序先以示範資料確認，目前已改由 Sanity 提供正式內容契約。

## 區塊與內容

- 圖文介紹：一張情境圖片、段落標籤、標題與兩段品牌介紹。
- 近期活動：最多三筆，呈現月份、日期、類型、名稱與時間。
- 近期課程：至多三筆，呈現圖片、課程類型、名稱與摘要；日期及梯次結構沿用 [課程總覽頁規格](course.md)。
- 聯絡我們：簡短邀請文字與電子郵件入口。

## 近期課程選取規則

首頁不另存一份課程清單，從已發布的課程與梯次動態選取：

1. 排除未發布、`cancelled`、`completed`，以及沒有未來開始日期的梯次。
2. 同一課程若有多個未來梯次，只採用最早的梯次，避免首頁重複顯示同一課程。
3. 以梯次所有階段中最早的 `dateRange.startDate` 作為 `firstStartDate`；先選取從查詢當日（Asia/Taipei）起六個曆月內開課的課程。
4. 候選依 `firstStartDate` 由近到遠排序。若六個月內不足三則，再用六個月後、已有確定日期的課程依序補足，總數仍不得超過三則。
5. 若全部未來課程仍不足三則，顯示實際筆數；不得以已開課、無日期或示範課程補位。

「六個曆月」以日期運算，例如 2026-10-05 的截止日為 2027-04-05，包含首尾日。多階段課程若一次報名涵蓋全部階段，只以整個梯次的第一階首日判斷是否即將開課，不以後續階段重新進入首頁；若各階段可獨立報名，應依課程規格建立為不同梯次後再選取。

## 近期活動選取規則

首頁從已發布活動選取結束時間晚於查詢當下、狀態為 `scheduled`、`open`、`full` 或 `closed` 的資料；取消、完成、日期無效及未發布資料不顯示。候選依開始時間、同時間排序值與文件 ID 排序，最多三筆。年月、日期及時段由 `startAt`／`endAt` 以 Asia/Taipei 推導；只有無法由起訖時間表達時才使用 `scheduleNote`。

## 驗收條件

1. 首頁內容順序為 Banner、圖文介紹、近期活動、近期課程、聯絡我們。
2. 桌面版導覽可移動至各內容區塊；鍵盤操作時連結具有清楚的焦點樣式。
3. 手機版維持單欄閱讀順序，文字不超出畫面，互動區域至少 48px 高。
4. 圖片提供替代文字並延遲載入；頁面標題階層由一個 `h1` 與各區 `h2` 組成。
5. 視覺延續暖白、陶土與棕色，主要樣式使用 Tailwind CSS。
6. 近期課程遵守六個月優先與最多三則規則；以邊界當日、少於三則、同課多梯次、多階段、取消及無日期資料建立測試。
7. 近期活動整列與近期課程整張卡片皆連到各自詳情頁；hover 與鍵盤焦點需有清楚且不造成版面位移的視覺回饋，並尊重 reduced motion。

首頁主導覽來源與目的地以 [Header 規格](header.md) 及共用 `siteSettings.navigationItems` 為準，導向活動、課程、個案、文章與關於總覽頁；首頁內容區塊的 `id` 保留給深連結與跳轉使用，不再要求共用主導覽逐區捲動。

## Sanity 內容模型

`home-page` 是公開安全固定 ID 的 `homePage` 單例，管理品牌介紹圖片與文字、活動／課程區標題與空狀態，以及聯絡區文案。聯絡信箱沿用 `site-settings`；列表沿用已發布的 `event`、`course` 與 `courseRun`，不建立首頁專用複本。伺服器以 published perspective 查詢並經明確 parser 轉為前端型別；單例缺少時顯示準備中，欄位無效或查詢失敗時不回退示範內容，活動／課程無結果則顯示 CMS 編輯的空狀態文字。固定單例可透過共用安全 seed 建立最小 `drafts.home-page`，且已有文件時拒絕覆寫。

## 2026-10-24 字體角色遷移

品牌介紹、近期活動、近期課程與聯絡區已統一使用八個全站角色：區塊主標採 `title-lg/xl`、項目標題採 `title-sm`、敘述採 `body`、日期與標示採 `meta/label`。元件已無局部數字字級；完整 Web 測試、typecheck 與 build 通過，視覺與文字放大驗收待補。

## 2026-10-24 聯絡區手動微調

首頁聯絡區由 bark 深色表面改為 `--color-sand` 淺砂底，標題與說明繼承／使用 `--color-muted`；區塊外距、桌機雙欄與手機單欄閱讀順序維持不變。「寫信給我們」由底線文字連結改用全站 `.button-primary`，外距為 `24px`，沿用共用的寬度、高度、柿橘色、焦點與 hover 規則，不建立首頁專用按鈕樣式。電子郵件目的地及內容契約沒有變更。

目前狀態為程式調整與文件同步完成。2026-10-24 重新執行 Web 全套 44 檔／292 項測試、typecheck 與 production build，結果皆通過；只保留既有的 Volar package export、sourcemap 與字型 runtime resolve 警告。尚未完成淺砂底文字對比、主要按鈕互動、200% 文字放大及桌機／手機實際畫面驗收；下一步應在 1440px、1023px、390px 檢查標題與說明對比、按鈕 48px 以上操作區、鍵盤焦點及是否產生水平溢位，先前深色聯絡區截圖不代表目前版本。

## 2026-10-24 近期活動年月顯示

近期活動的英文月份縮寫改為 `YYYY/MM` 數字格式，例如 `2026/10`。顯示值直接由活動 `date` 產生，不另行維護月份欄位；`time` 的 `datetime` 仍保留完整 ISO 日期。已新增元件回歸測試；Web 全套 45 檔／293 項測試、typecheck、production build、Impeccable detector 與 `git diff --check` 皆通過。typecheck／build 保留既有的 Volar package export、sourcemap 與字型 runtime resolve 警告；實際桌機與手機畫面驗收仍待執行。

## 2026-10-24 UI 驗收

完成 `verify-ui-behavior`，並將狀態更新為 `ui-verified`。修正近期課程超過三筆且重複 key 的 fixture，首頁 Banner 桌機導覽操作區提升至 44px，並新增區塊標示、內容筆數、圖片 alt 與 lazy loading 回歸測試。Chrome 實測 320、390、768、1023、1024、1440px 與 720px／200% 等效寬度，無水平溢位，區塊順序、單一 `h1`、圖片載入、鍵盤焦點、reduced motion 與極長文字均通過。Web 全套 46 檔／299 項測試、typecheck、production build 與 Impeccable detector 通過；詳細證據見 [首頁內容區塊 UI 驗收](../design/review/home-sections-ui-verified/README.md)。Safari、Firefox、實體觸控裝置與螢幕閱讀器未於本階段執行；下一階段為 `integrate-sanity-content`。

## 2026-10-24 CMS 串接

完成 `integrate-sanity-content`，並將狀態更新為 `cms-integrated`。Studio 新增 `homePage` 單例、語意分組、欄位 validation、固定 ID 結構入口與安全空白草稿測試；Web 新增最小 GROQ、published server API、Sanity 邊界 parser，以及 loading／empty／invalid／error 行為。首頁四區已移除主要硬編碼資料，活動採數字年月 `YYYY/MM`，課程依六個曆月規則從既有梯次選出。

本機驗證通過 Web 48 檔／307 項測試、Studio 40 項測試、兩端 typecheck 與 production build；另重跑兩項首頁整合測試並通過。保留既有 Volar package export、sourcemap 與字型 runtime resolve 警告。本階段未部署 Studio schema、未建立或發布 `home-page`，也未修改遠端 dataset；下一階段需取得遠端操作授權後執行 `validate-content-flow`，驗證草稿、發布、匿名 published 查詢、前台顯示與清理／恢復編輯流程。

## 2026-10-24 Production 內容流驗收

完成 `validate-content-flow`，狀態更新為 `verified`。`production` schema 部署 1/1 成功；前置檢查確認沒有既有 `home-page`，並沿用公開安全課程分類、已發布聯絡信箱與既有 Sanity 圖片資產。以隔離前綴建立 1 個首頁、4 筆活動、4 門課程及 4 個梯次，驗證草稿隔離、首次發布、第二版草稿不外洩、更新發布、匿名 Data API、共用 reference、圖片公開讀取、最多三筆與 `YYYY/MM` 顯示。

本機 Nuxt 搭配 production 內容在 320–1440px 與 200% 等效寬度完成瀏覽器驗收，無水平溢位、破圖或缺少 alt，區塊順序、操作區、焦點與 reduced motion 均通過。登入 Studio 後實際確認 `首頁內容` 單例、四個分組、中文欄位說明、字數提示、必填錯誤及可編輯輸入。驗收文件已精準清除，匿名與登入查詢皆確認無殘留；最後只建立最小、未發布的 `drafts.home-page`，本機 API 回傳 `empty`，供編輯者後續安全開始填寫。詳細證據見 [首頁內容流驗收](../design/review/home-sections-content-flow/README.md)。

最終完整回歸通過 Web 48 檔／307 項測試、Studio 41 項測試、兩端 typecheck 與 production build；僅保留既有 Volar package export、sourcemap 與字型 runtime resolve 警告。正式首頁內容仍待內容負責人在 `drafts.home-page` 填寫、審核及發布。

## 2026-10-24 活動與課程詳情連結

近期活動整列與近期課程整張卡片已改為詳情連結，分別使用 `/events/{slug}` 與 `/course/{slug}`。首頁 API 同步讀取已發布文件的 `slug.current`，邊界 parser 只接受安全的 kebab-case slug；缺少或不安全者不顯示，避免首頁產生失效或越界路徑。活動 hover／focus 以淡陶土底與標題色回饋；課程以圖片微幅放大與標題色回饋，兩者皆不顯示箭頭，並在 reduced motion 下取消轉場與縮放。

首頁近期活動列保留原有日期樣式：數字年月置於上方，日期採陶土色 `title-md` 置於下方；右側依序為 `label` 類型、`title-sm` 名稱，以及 `label` 星期與時間。列高、間距及細分隔線維持目前節奏。首頁維持精簡內容，不重複總覽頁的地點、摘要與報名狀態；整列連結及既有 hover／focus 行為不變。

跨日活動須顯示開始日至實際涵蓋結束日，不得只顯示第一天。日期範圍依 Asia/Taipei 計算，並將 `endAt` 視為結束時間而非額外活動日：同月兩日以 `30-31`／`2027/01` 顯示，跨月以 `30-01`／`2026/11–12` 顯示；若活動恰於次日 00:00 結束，日期仍只計到前一日。星期置於右側時間資訊列並由相同起訖時間自動產生，單日如 `週六`，兩日如 `週六、週日`；520px 以下星期與時段改為上下排列，不得要求編輯者在 `scheduleNote` 重複維護。

Chrome 於 1440px 與 390px 驗證日期樣式、兩日活動 `30-31` 及右側 `週六、週日` 顯示：桌機星期與時段並排，手機同欄上下排列；兩種尺寸皆無文字碰撞、截字或水平溢位。Web 全套 48 檔／313 項測試、typecheck、production build 與 `git diff --check` 皆通過；typecheck／build 僅保留既有的 Volar package export、sourcemap 與字型 runtime resolve 警告。詳細證據見 [首頁近期活動與總覽格式對齊](../design/review/home-events-overview-alignment/README.md)。Safari、Firefox、實體觸控裝置與螢幕閱讀器仍待發布前交叉驗證。

Chrome 於 1440 × 1000 與 390 × 844 的代表內容驗證通過：活動與課程 href 正確、鍵盤焦點外框為 2px、手機無水平溢位，操作區最小高度分別約 178px 與 518px，reduced-motion 轉場為 `0s`。Web 全套 48 檔／310 項測試、typecheck、production build、Impeccable detector 與 `git diff --check` 通過；保留既有 Volar package export、sourcemap 與字型 runtime resolve 警告。證據見 [首頁活動與課程連結驗收](../design/review/home-sections-linked-cards/README.md)。未執行 Safari、Firefox、實體觸控裝置或螢幕閱讀器驗收；本次未修改 Sanity schema、部署或遠端內容。

## 2026-10-25 區塊 More 操作與課程圖片比例

近期活動與近期課程的 `more` 使用共用 `.button-primary--small`，沿用 hero CTA 的色彩、箭頭與互動，尺寸為 170 × 56px，文字桌機 16px、手機 14px。每筆活動的按鈕位於該列最右側，與整列主連結相同皆連往該筆 `event.href`；每張課程的按鈕位於內容下方靠左，與整卡主連結相同皆連往該筆 `course.href`。按鈕的輔助名稱包含活動或課程標題，空狀態不顯示沒有詳情目標的按鈕。

近期課程維持原有雙欄錯落卡片；桌機固定保留兩欄軌道，即使只有一筆也只占單欄，不橫向撐滿，手機則維持單欄。每筆依序顯示 5:4 圖片、分類日期、`title-sm` 課名、摘要、靠左小按鈕及底部分隔線。整卡詳情連結、內容契約與最多三筆規則不變。Chrome 於 1440px 與 390px 逐筆驗證詳情 href、圖片比例、按鈕尺寸與字級、活動列右側／窄版下方排列、課程靠左排列、hover 變色與箭頭位移及無水平溢位；詳細證據見 [首頁活動與課程 More 操作驗收](../design/review/home-sections-more-actions/README.md)。Safari、Firefox、實體觸控裝置與螢幕閱讀器仍待發布前交叉驗證。

Web 全套 48 檔／313 項測試、typecheck、production build、Impeccable detector 與 `git diff --check` 通過；typecheck／build 僅保留既有的 Volar package export、sourcemap 與字型 runtime resolve 警告。本階段未修改 Sanity schema、部署或遠端內容。
