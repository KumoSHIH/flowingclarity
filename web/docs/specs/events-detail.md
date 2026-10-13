# 活動詳情頁規格

## 目標與範圍

`/events/[slug]` 協助已從活動總覽進入的訪客，在同一頁理解活動內容、確認時間／地點／費用與報名狀態，再前往外部表單。頁面採 Persuade 模式，但不得虛構成效、師資資格、價格或名額。目前已完成 `ui-verified`：建立 Vue 路由、共用心得元件、fixture 與明確頁面狀態，並通過桌機／手機實機檢查；Sanity schema、GROQ、正式 API 與可用報名連結仍不在本階段範圍。

舊網站只用來辨認可能欄位：標題、摘要、介紹、主視覺、帶領者、日期、時段流程、費用與報名入口；舊文案、圖片、順序及樣式均不沿用。設計稿使用明確標示的示意內容，不能視為發布素材。

## 內容契約

既有活動總覽欄位繼續作為共用事實來源：`title`、`slug`、`eventType`、`summary`、`startAt`、`endAt`、`timezone`、`scheduleNote`、`deliveryMode`、`city`、`venue`、`image`、`registrationStatus`、`registrationUrl`、`relatedCourse`、`archiveVisible` 與公開開關。詳情頁另需獨立 `detailIsPublished`，避免活動出現在總覽時連帶公開未完成的內頁。

建議新增詳情欄位：

| 欄位 | 型態與範圍 | 規則 |
|---|---|---|
| `intro` | text，40–240 字 | 活動緣起與核心內容；必填 |
| `body` | 可排序區塊陣列 | 可混排介紹、文字、引言、單圖、雙圖、帶領者、學員心得、適合對象、準備事項；至少一個 |
| `agenda` | 2–12 筆 | 每筆含時間標示、標題與選填說明；不可取代 `startAt/endAt` |
| `facilitators` | 1–6 筆 | 姓名、簡介、選填圖片與替代文字；資格需經核准 |
| `audience` | 1–8 筆 | 適合對象；不得寫成療效保證 |
| `preparation` | 0–8 筆 | 攜帶物品、服裝、行前提醒 |
| `feeLabel` | 2–40 字 | 由內容負責人確認；未確認時整區省略 |
| `registrationNote` | 0–240 字 | 付款、候補或取消說明；不得含敏感資訊 |
| `seoTitle/seoDescription` | 選填 | 不得超出頁面已核准內容 |

主視覺為選填；無圖時版型以品牌色塊、排版與細線成立，不顯示空白圖片框。`registrationStatus` 為 `open` 且外部網址通過 HTTPS 驗證時才顯示「前往報名」；其他狀態顯示清楚文字，不建立失效連結。活動開始後由前台時間推導截止，結束後仍可依 `archiveVisible` 顯示歷史內容，但移除報名操作。

## 共用元件與樣式邊界

正式實作以內容型元件命名，不使用活動專屬視覺命名，讓未來 `session-detail` 共用：

- `DetailHero`：標題、摘要、狀態與選填影像；每頁只輸出一個 `h1`。
- `DetailFacts`：日期、時間、形式、地點、費用；接受任意 label/value 陣列。
- `DetailSection`：標準章節容器，管理標題層級、閱讀寬度與留白。
- `DetailSchedule`：時間流程；使用 list 與 `time`，支援缺少精確時間的文字標示。
- `DetailFacilitator`、`DetailList`、`DetailMedia`：帶領者、清單與圖文內容。
- `SharedTestimonials`：文字與分享者名稱的可重複心得區塊；活動詳情與課程詳情共用相同資料契約。
- `DetailAction`：報名狀態、補充說明與主要行動；只接受已驗證 URL。
- `DetailAnchorNav`：內容較長時選配；DOM 順序不得因視覺位置改變。

共用 CSS 只定義 `.detail-*` 的排版、字級角色、1px 分隔線、焦點與狀態；各頁以 modifier 或 CSS custom properties 決定構圖。沿用 `main.css` 的 paper、sand、ink、clay、saffron、persimmon、night、字體與控制項 token，不把三款決策稿的特殊構圖升格為全站規則。

## 三款設計方向

前三輪不再是完整實作候選。第四輪只繼承第三輪 B「留白書頁」的 Banner 語言與「這一天，會怎麼進行」流程元件：展示標題最大值由 96px 降為 72px，主視覺改成選填的獨立圖片欄，不使用滿版背景。三案都移除原本的口號式結尾，並把課程介紹、帶領者、日期、時間、地點、費用及單一報名行動放回主要內容路徑。

- A「雙頁編輯」：Banner 與決策資訊列之後，以雜誌雙頁並置課程文字、情境圖片及帶領者，適合內容與照片品質相當的活動。
- B「固定邊欄」（已選定）：桌機把日期、時間、地點、費用與報名常駐左側，右側沿單一閱讀欄展開課程、純文字帶領者介紹及流程；手機依語意順序回到單欄。帶領者不使用照片或深色背景，章節上下留白採桌機 `70–108px`、手機 `64px`，讓閱讀節奏更連續。
- C「章節展頁」：以 paper、sand、night 三種大片段表面區分課程、人物與流程，圖片不做背景，也不把內容切成卡片。

三案共用 `DetailHero`、`DetailFacts`、`DetailSection`、`DetailFacilitator`、`DetailSchedule` 與 `DetailAction` 的內容契約，不把特殊構圖寫進 schema。`agenda` 為後台可新增、刪除與排序的重複欄位；每筆包含時間標示、標題與選填說明。第四輪互動稿位於 `docs/design/events-detail-concepts.html`，驗證證據位於 `docs/design/review/events-detail-concepts-round-4/`。

## 響應式、狀態與無障礙

桌面可採分欄、sticky 摘要或跨欄流程；`<= 1023px` 必須依語意順序回到單欄，`320–390px` 不得水平捲動。正文約 65–75ch，操作目標至少 44×44px，焦點在 paper、sand、night 與 persimmon 表面均需可見。支援 ready、loading、error、not-found、open、scheduled、full、closed、cancelled、completed、缺圖、缺帶領者、缺流程與長內容；reduced-motion 下移除平滑捲動與位移。

學員心得採 `sharedTestimonialBlock`，詳細後台欄位、發布同意與桌機三款比較見 [學員心得分享共用元件規格](shared-testimonials.md)。桌機已選定內容頁內嵌單欄長文，手機首版已完成 390px／320px 模擬；尚未納入活動詳情 schema。

考量心得可能為長文，已確認採單欄連續閱讀，作為 B「固定邊欄」右側內容欄中的可排序區塊。接續課程介紹、帶領者與流程的桌機情境稿位於 `docs/design/student-testimonial-in-context.html`；前台不顯示版型說明文字，內容區大標統一縮小為 38px。

## 目前狀態與下一階段

- 目前狀態：`ui-verified`。
- 已完成：舊頁欄位盤點、資料契約、共用元件邊界、前三輪歷史紀錄、第四輪三款互動原型、B「固定邊欄」選案精修，以及 `/events/[slug]` fixture 路由、詳情元件、共用心得元件與 ready／loading／error／not-found 狀態。
- 已驗證：2026-10-13 以 Chrome 檢查第四輪三案的 320、390、768、1023、1024 與 1440 寬度。18 組均無水平溢位、只有一個可見 `h1`、標題與 Banner 圖片位於 viewport 內、自託管字體載入，且非停用操作項目最小高度為 48px；真實 `ArrowRight` 鍵可同步移動 tab 選取與焦點。另檢查六張完整頁面截圖。
- 品質檢查：Impeccable detector 第四輪執行一次；已修正概念說明文字對比。首輪畫面檢查修正 B 的平板圖片比例及焦點證據；選案後再移除帶領者照片與深色背景、縮短章節間距，並重拍 18 組驗證證據。頁面專屬展示字級與構圖不提升為全站 token，`DESIGN.md` 維持不變。
- 心得元件驗證：2026-10-13 以 Chrome 檢查 A／B／C 的 1280px、1440px 桌機畫面；六組均無水平溢位，C 案方向鍵、焦點與內容切換同步。證據位於 `docs/design/review/student-testimonial-concepts-desktop/`；桌機最終選用內容頁內嵌單欄長文，並已建立 Vue 共用元件原型。
- 長文接續示意：2026-10-13 以 Chrome 於 1440px 驗證 B「固定邊欄」的內嵌單欄心得，無水平溢位，兩則長文與名稱完整，心得區不含圖片；完整頁證據位於 `docs/design/review/student-testimonial-in-context-desktop/`。
- 前端實作驗證：2026-10-13 以 Chrome 檢查 1440×1000、390×844 與 320×720。三組 `scrollWidth` 均等於 `clientWidth`；皆只有一個可見 `h1`、4 筆活動資訊、3 筆流程、2 則心得、0 張心得圖片及 0 個啟用報名連結。桌機為 grid／sticky，手機為 block／static；內容標題為 38px／32px，介紹與心得正文均為 16px，操作高度 76px。完整頁與數值證據位於 `.impeccable/review/event-detail-frontend-prototype/`。
- 自動驗證：活動詳情新增 6 項行為測試；全站 22 個測試檔、133 項測試通過，`nuxt typecheck` 與 production build 完成。typecheck 仍輸出既有 `vue-router/volar/sfc-route-blocks` 套件相容性警告，但命令成功結束。
- 品質檢測：Impeccable detector 執行一次，只回報本頁已核准且刻意保留的頁面專屬字級；依既有決策不修改 `DESIGN.md`。
- 待處理：下一階段為 Sanity 詳情欄位、published-only API、parser 與 production 內容流驗收。課程詳情尚未接入心得元件。
- 未執行：正式素材審核、Sanity schema 部署、遠端內容寫入、Safari／Firefox、實體觸控裝置與螢幕閱讀器驗收。


#### 筆記，不需要執行，可忽略
- 使用 `web/.agents/skills/develop-feature/SKILL.md` 從 `docs/specs/events-detail.md` 接續下一個流程
