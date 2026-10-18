# Footer 功能規格

**狀態：** cms-integrated（遠端 schema 與 API 內容流已驗證；Studio 編輯介面、正式內容及四個目的頁仍待驗收）

**範圍：** 全站 Footer 第一版

**依據：** `PRODUCT.md`、`DESIGN.md`、`docs/specs/header.md`、`docs/design/footer-concepts-v3-award.html` 的 L「靜默座標」及現有 `SiteFooter.vue`

## 目標與受眾

讓完成頁面閱讀、準備採取下一步的訪客，在頁尾辨識品牌、取得聯絡方式，並前往主要站內單元。沿用 L「靜默座標」構圖；2026-10-07 依使用者手動 CSS 改為樹皮棕底、暖白文字，以品牌訊息與低干擾感知路徑收束內容。動態只提供氛圍，不承載資訊或操作狀態。

## 範圍與非目標

第一版包含品牌識別、品牌主張、實體地址、電話、Email、社群入口、站內導覽、版權資訊、裝飾路徑動畫及無障礙替代行為。先整合至現有 `/` 與 `/course`，後續新增公開頁面時共用同一元件與內容來源。

使用者已同意先接續本機 Sanity 開發，將四個目的頁可到達性保留為正式發布門檻，不把完整 UI 驗收記為已完成。目前 production 頁面讀取共用設定，fixtures 僅供測試。不包含地圖、路線規劃、聯絡表單、電子報、會員、報名與付款流程，也不把舊站內容或 prototype 的 `#` 連結視為可發布資料。

## 需求確定度

- **已確認：** L 構圖、樹皮棕主色表面；Header、hero-menu、Footer 共用 5 項導覽，個案諮詢為 `/session`；單一全站設定內提供獨立 Footer Logo，不建立 Header／Footer 各自的文件。
- **合理假設：** 第一版先整合現有 `/` 與 `/course`；以伺服器端取得共用設定，不呈現獨立 loading；prototype 的 900px、560px 斷點與動畫生命週期作為 production 實作基準。
- **示範內容：** 現有中英文品牌句、地址、電話、Email、Facebook、LINE、版權文字及 Logo 版本尚未取得正式發布核准。
- **本機已實作：** 元件、`shared/types/siteSettings.ts` 型別、Sanity schema、Studio 單例入口、API、轉換驗證及首頁／課程頁串接。fixtures 不再作為 production 全站設定來源。
- **尚未完成：** Studio hostname／實際編輯介面、正式內容核准及四個導覽目的頁。遠端 schema、草稿隔離、發布後匿名讀取與還原已通過，但 CLI／API 驗證不取代 Studio 表單操作驗收。

## 內容契約

| 欄位 | 語意與型別 | 必填／長度與數量 | 編輯責任 | 預定資料來源 |
| --- | --- | --- | --- | --- |
| `brandName` | 品牌可讀名稱；字串 | 必填；2–20 個中文字 | 品牌負責人 | `siteSettings.brandName`；暫定「普那生活空間」待確認 |
| `footerLogo` | Footer 獨立標誌；圖片 | 選填；最多 1 張，提供時須有固有尺寸 | 品牌／內容負責人 | `siteSettings.footerLogo`；建議淺色版本，不使用 Header Logo 備援 |
| `closingStatement` | 收束頁面的中文品牌句；純文字 | 選填；10–28 個中文字 | 品牌／內容負責人 | `siteSettings.brandMessages.closingStatement`；prototype 文案僅為示範 |
| `brandStatement` | 品牌英文主張；純文字及語言標記 | 必填；20–80 個英文字元 | 品牌／內容負責人 | `siteSettings.brandMessages.englishStatement`；prototype 文案待確認 |
| `address` | 可公開的實體地址；純文字 | 選填；10–60 個中文字 | 內容負責人 | `siteSettings.contact.address`；舊站截圖內容待確認 |
| `phone.display` | 使用者看見的電話；字串 | 選填；8–25 字元 | 內容負責人 | `siteSettings.contact.phone` |
| `phone.href` | 國際格式 `tel:` URI；字串 | `phone.display` 存在時必填；1 個 | 內容／前端 | `siteSettings.contact.phone` |
| `email` | 可公開 Email；字串 | 選填；最長 254 字元 | 內容負責人 | `siteSettings.contact.email` |
| `socialLinks[]` | 社群名稱與 HTTPS 網址；物件陣列 | 選填；0–4 筆，名稱 2–20 字元 | 內容負責人 | `siteSettings.socialLinks`；Facebook、LINE 網址未提供 |
| `navigationItems[]` | 站內目的地名稱與路徑；物件陣列 | 必填；固定 5 筆，名稱 2–8 個中文字 | 產品／內容負責人 | `siteSettings.navigationItems`；與 Header、Banner 共用 |
| `copyrightText` | 著作權聲明；純文字 | 必填；10–100 字元 | 品牌／內容負責人 | `siteSettings.legal.copyrightText`；年份呈現方式待確認 |

Footer 固定依序使用「近期活動」`/events`、「課程探索」`/course`、「個案諮詢」`/session`、「文章分享」`/articles`、「關於我們」`/about`，與 Header、Banner 完全一致。所有 prototype 聯絡資料皆為示範內容，核准前不得發布。

## 後臺共用設定方向

Sanity 使用 `siteSettings` 單例，全站只允許一份已發布設定。共用 `brandName` 與 `navigationItems`，`brandLogo` 專供 Header、`footerLogo` 專供 Footer；兩者可獨立上傳與省略。品牌入口為 `brandDestination: /`。Footer 的聯絡、社群、品牌主張與版權資料收在同一文件，不另建 `headerSettings`、`footerSettings` 或各頁副本。

已註冊 schema 與 Studio 單例入口，固定公開 ID 為 `site-settings`（不含句點），限制重複建立、複製、刪除及取消發布操作。`/api/site-settings` 以不帶 token、`published` perspective、`useCdn: false` 查詢固定 ID；頁面使用 `useSiteSettings` 一次取值，傳給 Header、HomeBanner 的 hero-menu 與 Footer。遠端 schema 與可復原內容流驗收已完成，公開文件已還原至驗收前內容。

共用文件依內容語意分組，不依畫面欄位位置命名：

| 群組 | 內容 | 使用端 |
| --- | --- | --- |
| 品牌識別 | `brandName`、`brandLogo`、`footerLogo`、`brandDestination` | 共用名稱；Header／Footer 各用獨立 Logo |
| 全站導覽 | `navigationItems` | Header、Banner、Footer |
| 品牌訊息 | `brandMessages` | Footer；其他頁面若使用同一訊息則直接共用 |
| 聯絡方式 | `contact`、`socialLinks` | Footer；其他聯絡區塊不得複製另一份正式資料 |
| 法務資訊 | `legal` | Footer 及未來需要顯示法務資訊的全站元件 |

Sanity 驗證須阻止缺少品牌名稱、5 項已確認導覽或版權文字的文件發布；選填聯絡欄位須成組驗證，例如電話顯示值與可操作值不可只填一項，社群名稱與 HTTPS 網址不可拆開。前端查詢只讀已發布的固定文件 ID，並為所有使用端回傳同一份型別化資料。正式上線前須另行確認快取及讀取失敗時使用的已核准備援資料；未確認的 prototype 文案不得作為備援。

## 狀態與行為

- 一般狀態顯示品牌、可用聯絡資訊、站內導覽與版權；電話開啟撥號、Email 開啟郵件程式。保留使用者手動設定的 Footer 社群及站內導覽新分頁行為（`target="_blank"`），補上 `rel="noopener noreferrer"`；Header／hero-menu 維持原導覽行為。
- `site-footer__brand` 是同分頁開啟的首頁連結，使用共用 `brandDestination`（目前固定 `/`）並提供「品牌名稱＋首頁」的可存取名稱；只包住 Footer Logo／品牌文字，下方中文收束句不納入點擊區。
- 目前路徑與某個站內導覽目的地相符時，該連結標記 `aria-current="page"`；視覺提示不得只依賴顏色，其他連結不帶此屬性。
- 第一版應以伺服器端取得或建置期可用的內容渲染，不顯示獨立 loading 骨架。若未來改為用戶端取得資料，須另定避免版面位移與重複朗讀的 loading 契約。
- API 區分 `ready`、`unconfigured`、`empty`、`invalid`、`error`。非 ready 時不呈現示範品牌／聯絡／版權，改顯示「聯絡資訊暫時無法顯示，請稍後再試。」與已確認五項導覽。這是中性 unavailable 狀態，不是已核准的正式品牌備援；仍阻擋 production 發布。錯誤只記錄泛用伺服器訊息。
- `footerLogo` 未填、無有效尺寸或圖片載入失敗時顯示 `brandName`，不回退至 `brandLogo`；更換圖片後可恢復顯示。
- 地址、電話、Email、中文收束句及社群入口均可獨立省略；缺少選填欄位時移除整個對應元素與間距。必要品牌或導覽設定缺失屬發布阻擋，不得以 prototype 值靜默補位。
- 長地址、Email、品牌句與導覽名稱允許換行，不截斷核心資訊，不造成水平捲動；Email 與長網址須能安全斷行。
- 三條白色路徑為靜態裝飾；兩組稀疏白點可用不同速度與相位沿路徑流動。Footer 未進入視窗、文件不可見或元件卸載時停止動畫；重新可見時可恢復。Hover 或鍵盤焦點可提高光點可見度，但不可成為理解連結狀態的唯一線索。
- `prefers-reduced-motion: reduce` 時不顯示移動點群，只保留靜態路徑；內容與操作能力不得減少。

## 響應式與無障礙

### 2026-10-07 手動 CSS 同步

- 背景採主色 `var(--color-bark)`（`#766254`），一般文字／品牌備援／焦點用 `paper`；保留暖白大主張及三條裝飾線。
- 保留 36%／64% 雙欄、850px 最小高度、聯絡及連結 2.4px 字距、0.3s 色彩過渡、每項導覽底部分隔線（`rgba(202,198,191,.813)`），不新增頂線。
- 目前手動 CSS 的 Hover／目前頁使用純 saffron；其在 bark 上對比約 3.44:1，尚未達一般文字 4.5:1 門檻，正式發布前需另行核准調色或增加非色彩提示。品牌首頁連結保持 paper，hover 以透明度回饋；所有連結焦點為 2px paper 外框、4px offset。
- 光點每輪位移等於 dash pattern 週期：第一組 `0.222 / 4.44s`，第二組 `0.282 / 7.614s`。保持原 20s／27s 完整路徑流速；首尾圖樣重合，消除舊 `1` 單位重設的跳接。呼吸週期維持 3.6s／5.1s；reduced motion 同時停用連結過渡。

### 2026-10-18 手動 CSS 同步

- 桌面英文品牌主張取消 `11em` 最大寬度，改為 `clamp(48px, 5vw, 92px) / 1.18`，字距固定 `3.6px`，讓長句依內容區自然換行。
- `<= 900px` 的內容區上內距縮為 `40px`；法務列改為置中，頂部間距 `20px`、底部留白 `50px`。
- `<= 560px` 的品牌主張為 `clamp(36px, 8.4vw, 47px) / 1.5`；底部資訊區上內距與欄距皆為 `40px`，導覽項目增加 `20px` 下間距。聯絡與連結目前取消固定最小高度並保留 `10px` 下內距，須在最新瀏覽器驗收確認實際操作區仍至少 `44 × 44px`；未達時應修正 CSS，不降低無障礙驗收門檻。

桌面延續 L 案的偏軸雙欄資訊結構；`<= 900px` 改為單欄並隱藏僅供桌面構圖使用的中文收束句，改由行動版品牌標誌開始閱讀；`<= 560px` 收斂內距並確保從 320px 起無水平溢位。視覺排列改變不得改變 DOM 的品牌、主張、聯絡、導覽、版權閱讀順序。

根元素使用 `footer`；聯絡資料使用 `address`，頁尾導覽使用有「頁尾導覽」名稱的 `nav`。品牌標誌位於具「品牌名稱＋首頁」名稱的首頁連結內，因此圖片使用空 `alt`，避免重複朗讀；品牌文字備援沿用同一連結名稱。英文主張標記 `lang="en"`。裝飾 SVG 使用 `aria-hidden="true"` 且不可聚焦。所有連結保留可見焦點，鍵盤順序與 DOM 一致，觸控目標至少 44 × 44px；純裝飾箭頭不提供替代文字。

## 驗收條件

1. `/` 與 `/course` 顯示同一個共用 Footer，且品牌、聯絡、導覽與版權資料來自同一份全站設定，不由頁面各自複製。
2. 核准資料存在時，電話產生有效 `tel:` URI、Email 產生有效 `mailto:` URI、社群使用 HTTPS 網址；頁面不得出現 `href="#"` 或「待確認」內容。
3. Header、Banner 與 Footer 的導覽名稱、順序及目的地皆取自同一份 `siteSettings.navigationItems`；點選後 URL 與目標頁正確，目的頁不存在時不得通過驗收。
4. 任一選填聯絡欄位缺少、全部選填聯絡欄位缺少、內容讀取失敗或文字達建議上限時，Footer 仍保留必要資訊，沒有空控制項、重疊或水平捲動。
5. 320、560、900、1024 與 1440px 寬度下，內容順序正確、文字可讀、連結可操作，且行動版不顯示桌面專用收束句。
6. 僅使用鍵盤可依序操作所有連結，焦點清楚可見；語意檢查可辨識 `footer`、具名稱的 `nav`、`address` 與品牌替代文字，裝飾 SVG 不進入無障礙樹。
7. 位於 5 個導覽目的頁時，只有符合目前路徑的 Footer 連結具有 `aria-current="page"`；首頁或其他未列入導覽的頁面沒有錯誤的目前頁標記。
8. Footer 進入／離開視窗、頁籤顯示／隱藏及元件卸載時，動畫啟停與監聽器清理可由測試觀察；reduced motion 下移動點群不存在但三條靜態路徑保留。
9. 相關 Vitest 行為測試、`npm run typecheck -w web` 與 `npm run build -w web` 通過，並完成 320px 起的桌面／行動視覺驗收後，才能把 production 整合標示為完成。
10. Studio 只提供一個全站設定入口，Header、hero-menu 與 Footer 讀取相同的 `siteSettings.navigationItems`；品牌名稱共用，Header Logo／Footer Logo 獨立且不互相備援。
11. `siteSettings` 發布驗證會拒絕缺少必要品牌、任一已確認導覽或版權內容的文件，並拒絕只有名稱沒有網址、只有顯示電話沒有可操作值等不完整成組資料。

## 待決事項、依賴與下一階段輸入

- 內容負責人須核准品牌中英文主張、地址、電話、Email、社群名稱與實際網址、版權文字及年份策略；這些項目阻擋正式發布。
- Footer 已確認完整沿用 Header 的 5 項導覽。L prototype 暫放 4 項且把 `/course` 標為「創藝身心路徑」，屬尚未同步的舊稿差異；production 實作必須補上「文章分享」並使用已確認名稱。
- 三處導覽以 CMS 共用設定為主要來源；第一版 validation 固定已確認五項名稱、順序及路徑，並可填寫最長 30 字輔助說明。
- 已確認 `app/pages/` 只有首頁與課程頁；`/events`、`/session`、`/articles` 與 `/about` 尚未建立，阻擋完整導覽驗收及 `ui-verified`。目的頁需在各自功能範圍完成，不能用空白頁假裝通過。
- 使用者已同意上述目的頁問題不阻擋 CMS 階段；2026-10-08 已取得並使用遠端 schema、草稿／發布／還原授權。Studio 部署因未設定 hostname 而停止，未建立未核准的新網址。
- 真實編輯驗收須確認：草稿不改變公開內容、發布後匿名可讀、Header／hero-menu／Footer 同步、Logo 可獨立替換、空值／錯誤不洩漏示範資料。正式社群網址與版權年份仍待核准。

## 本階段完成與驗證

- 已完成 Footer 的功能範圍、內容契約、共用後臺資料關係、狀態、響應式、無障礙及可測試驗收條件。
- 已比對 `PRODUCT.md`、`DESIGN.md`、Header 規格、L prototype、現有 `SiteFooter.vue`、共用導覽常數與 `studio/schemaTypes/index.ts`。
- 2026-10-07 接續 `develop-feature`：沿用已選定 L 設計，更新 surface brief，完成 Vue 元件、型別化典型／最長／缺值 fixtures、動畫生命週期與兩頁整合。
- `npm run test -w web`：57 項通過；`npm run typecheck -w web`、`npm run build -w web` 通過。保留既有 Vue Router 型別插件與 Nuxt／Tailwind sourcemap 警告。
- Impeccable detector：0 個反模式錯誤、2 項字級 advisory；12px 版權與手機主張字級屬此 surface 的既有構圖，不提升成全站 token。
- Chrome 已量測首頁與課程頁 320、560、900、1024、1440px；Footer 文字與操作元素均在容器內，五項導覽高度皆為 58px。裝飾 SVG 在手機刻意超出容器並裁切，不能以包含 SVG 的 scrollWidth 判為文字溢位。
- 已檢視 320px、1024px 與 1440px 截圖，確認 L 構圖、換行與目前頁底線；鍵盤 Tab 可進入下一導覽且有實線焦點。瀏覽器 reduced motion 測得光點 0 組、靜態線 3 條、flowing=false；320px 的 200% 文字與最長 Email 壓力檢查未見內容水平溢位。
- 截圖與量測存於 [footer-frontend](../design/review/footer-frontend/)；截圖為實際頁面載入後暫時隱藏 Header／main 的 Footer 區域取景。缺值、Logo 錯誤、社群及動畫清理另由 Vitest 驗證。尚未完成所有焦點的人工逐項驗收、完整輔助技術驗收、正式內容及目的頁端到端驗收。
- 上述 57 項測試與 footer-frontend 截圖屬先前暖砂 fixture 階段的歷史證據，不代表新版 CMS／樹皮棕視覺驗收。

### 本機 CMS 與手動樣式修正

- 完成 schema／單例、API／parser、共用 composable、三處導覽串接及獨立 Footer Logo；production 頁面已移除全站設定 fixture。
- 2026-10-08 將 `site-footer__brand` 改為同分頁導向 `/` 的品牌首頁連結；Logo 與品牌文字備援共用明確連結名稱，中文收束句保留在點擊區外。SSR 實際輸出確認 `href="/"`、沒有 `target`，且收束句為相鄰段落。
- 本次 `npm run test -w web`：79 項通過；`npm run test -w studio`：11 項通過。兩個 workspace 的 `typecheck` 與 `build` 均通過；修正了共用導覽在 SSR build 的匯入路徑。既有 Vue Router 型別插件與 Nuxt／Tailwind sourcemap 警告仍存在，指令退出碼為 0。
- 新版 Impeccable detector：0 個反模式錯誤、3 項 advisory；分隔線色、12px 版權及手機主張字級為保留的 Footer 區域樣式，已記錄於本規格，不擴張為全站 token。檢查促成深底品牌備援／焦點可讀性與黃色互動對比修正，未重設使用者構圖。
- 新版 Chrome 量測典型內容 320、560、900、1024、1440px，以及最少／最長內容 320、1440px，文字與操作元素均無水平溢位，五項導覽高度 58px。檢視桌面典型與手機長內容截圖；證據見 [footer-cms](../design/review/footer-cms/README.md)。此為本機元件測試頁，不是遠端發布資料。
- 2026-10-18 已將最新手動 Footer CSS 同步至本規格；完整 Web Vitest 220/220、`nuxt typecheck` 與 production build 通過。既有 58px 導覽高度與截圖早於本次手機 `min-height: auto` 變更，不視為最新視覺驗收；320／390／560px 的操作區尺寸、換行與完整 Footer 截圖仍待重驗。
- 瀏覽器 seek 動畫週期交界前後 0.1ms，模週期位移差分別約 0.000010／0.0000077，符合原流速、無額外跳接；reduced motion 為光點 0 組、靜態線 3 條、flowing=false。鍵盤量測的 Email、社群與前四項導覽均有實線焦點；完整輔助技術及目的頁驗收仍待完成。
- 截至 2026-10-07 的本機整合階段尚未部署或寫入遠端；後續 2026-10-08 的授權操作另記於下方，不回寫為當時已完成。

### 真實 Published 內容流預檢

- 2026-10-07 23:20（Asia/Taipei）以目前設定的 Sanity 專案與 dataset 執行唯讀驗證。不帶 token、`published` perspective 的 Data API 回傳 HTTP 200；固定 ID／類型、必要文字及五項導覽皆符合契約。登入後唯讀計數確認 published 1、draft 0。
- 遠端已有 Header Logo、尚無 Footer Logo；本機 API 回傳 `ready`，首頁與課程頁顯示公開內容，Footer 正確使用品牌文字備援。未使用 Header Logo 取代 Footer Logo。
- 本機路由狀態為 `/`、`/course` 回傳 200；`/events`、`/session`、`/articles`、`/about` 回傳 404，故正式發布門檻維持不變。
- Chrome 以真實 published 資料檢查首頁／課程頁 320、1440px：無內容溢位，200% zoom 無水平捲動；九個 Footer 連結依序 Tab 且焦點清楚；首頁 hero-menu 與 Footer 導覽一致，課程頁僅 `/course` 為目前頁。reduced motion 為光點 0、靜態線 3、flowing=false。
- 截圖與量測見 [footer-content-flow](../design/review/footer-content-flow/README.md)。2026-10-07 此預檢尚未寫入遠端；所列草稿隔離、發布後匿名讀取及三處同步已於 2026-10-08 完成。Footer Logo 實際上傳、Studio 表單與四個目的頁仍待驗收。

### 遠端草稿、發布與還原驗收

- 2026-10-08 部署 Sanity schema 成功（1/1）。Studio deploy dry-run 完成 build 與本機內容檢查，但因 `sanity.cli.ts` 沒有 `studioHost`、命令也未指定 `--url` 而被 CLI 阻擋；未建立新 Studio 網址。
- 操作前以匿名 published API 備份完整 `site-settings`，內容摘要雜湊為 `a7539e20838f`。確認遠端起始狀態為 published 1、draft 0，再建立 `drafts.site-settings`，只將第一項 `accessibleLabel` 改為「近期活動（內容流驗收）」。
- 登入 raw 查詢確認 draft 1、標記 1；匿名查詢仍為 published 1、公開標記 0、草稿不可見，草稿隔離通過。
- 短暫發布測試版本後，匿名查詢公開標記為 1，本機 API 回傳 `ready`；Chrome 確認 Header、hero-menu、Footer 三處的第一項 `aria-label` 同步為測試值。
- 隨即以備份覆寫還原公開文件並刪除測試草稿。匿名查詢為 published 1、公開標記 0；登入 raw 查詢為 draft 0。還原後完整內容雜湊仍為 `a7539e20838f`，公開文件與原始備份完全相同。
- 還原文件通過目前 Studio schema validation：1 valid、0 errors、0 warnings、0 info markers；reference existence 檢查通過。結構化紀錄見 [lifecycle-results.json](../design/review/footer-content-flow/lifecycle-results.json)。
- 尚未在實際 Studio 表單逐項檢查群組、說明、preview 與錯誤訊息，也未實際上傳 Footer Logo；因此維持 `cms-integrated`。待提供既有 Studio hostname 或核准新 hostname 後部署並完成編輯介面驗收；四個 404 目的頁仍是整體發布門檻。

## 人工測試後修正清單

- [x] hero-menu 同步後臺共用導覽。
- [x] Footer Logo 提供獨立欄位與品牌文字備援。
- [x] 光點循環首尾對齊並維持原流速。
- [x] 保留手動 CSS，更新設計文件；背景統一引用 bark 主色 token。
- [x] `site-footer__brand` 改為導向 `/` 的首頁連結，收束句維持連結外文字。
- [ ] 純 saffron 互動文字在 bark 背景的對比或非色彩提示仍待視覺核准。
- [ ] 重新量測 320／390／560px Footer 聯絡與導覽連結；最新手動 CSS 取消固定最小高度後，操作區仍須至少 `44 × 44px`。

#### 筆記，不需要執行，可忽略
- 使用 `web/.agents/skills/develop-feature/SKILL.md` 從 web/docs/specs/footer.md 接續下一個流程
