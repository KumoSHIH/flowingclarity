# Footer 功能規格

**狀態：** frontend-ready（L 本機資料版已完成；UI 全流程驗收受四個未建立目的頁阻擋）

**範圍：** 全站 Footer 第一版

**依據：** `PRODUCT.md`、`DESIGN.md`、`docs/specs/header.md`、`docs/design/footer-concepts-v3-award.html` 的 L「靜默座標」及現有 `SiteFooter.vue`

## 目標與受眾

讓完成頁面閱讀、準備採取下一步的訪客，在頁尾辨識品牌、取得聯絡方式，並前往主要站內單元。第一版沿用已選定的 L「靜默座標」方向，以暖砂底面、品牌訊息與低干擾的感知路徑收束內容；動態只提供氛圍，不承載資訊或操作狀態。

## 範圍與非目標

第一版包含品牌識別、品牌主張、實體地址、電話、Email、社群入口、站內導覽、版權資訊、裝飾路徑動畫及無障礙替代行為。先整合至現有 `/` 與 `/course`，後續新增公開頁面時共用同一元件與內容來源。

前端階段以型別化本機 fixtures 實作；Sanity schema 與正式資料留待 UI 驗收通過後串接。不包含地圖、路線規劃、聯絡表單、電子報、會員、報名與付款流程，也不把舊站內容或 prototype 的 `#` 連結視為可發布資料。

## 需求確定度

- **已確認：** 採用 L「靜默座標」方向；Footer 使用與 Header、Banner 相同的 5 項導覽，個案諮詢路徑為 `/session`；未來後臺採單一全站共用設定，不建立 Header／Footer 各自的設定文件。
- **合理假設：** 第一版先整合現有 `/` 與 `/course`；以伺服器端取得共用設定，不呈現獨立 loading；prototype 的 900px、560px 斷點與動畫生命週期作為 production 實作基準。
- **示範內容：** 現有中英文品牌句、地址、電話、Email、Facebook、LINE、版權文字及 Logo 版本尚未取得正式發布核准。
- **前端已實作：** L 案已元件化並接至首頁與課程頁，內容介面為 `app/types/siteSettings.ts`，目前資料來自明確標示未核准的 `app/fixtures/siteSettings.ts`。
- **目前未實作：** Sanity `siteSettings` schema、Studio 單例入口、共用查詢、正式資料、核准備援及四個導覽目的頁。

## 內容契約

| 欄位 | 語意與型別 | 必填／長度與數量 | 編輯責任 | 預定資料來源 |
| --- | --- | --- | --- | --- |
| `brandName` | 品牌可讀名稱；字串 | 必填；2–20 個中文字 | 品牌負責人 | `siteSettings.brandName`；暫定「普那生活空間」待確認 |
| `brandLogo` | 品牌標誌；圖片 | 選填；最多 1 張，提供時須有固有尺寸 | 品牌／內容負責人 | `siteSettings.brandLogo`；現有資產僅供遷移參考 |
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

後續在 Sanity 建立工作名稱為 `siteSettings` 的單例文件，全站只允許一份已發布設定。Header 與 Footer 共用 `brandName`、`brandLogo` 及 `navigationItems`；品牌入口由需要連回首頁的元件共用 `brandDestination`。Footer 的聯絡、社群、品牌主張與版權資料收在同一文件的語意群組中。不得另外建立 `headerSettings`、`footerSettings`，也不得在各頁面文件複製全站資料。

目前 `studio/schemaTypes/index.ts` 未註冊此 schema，前端導覽仍暫由 `app/constants/siteNavigation.ts` 提供。本節只確認資料關係與後續方向，不代表 schema、Studio 表單、查詢或正式資料已完成。建立 schema 時須提供單例結構、固定文件 ID、欄位驗證、預覽及防止新增重複文件的 Studio 結構設定；Header、Banner 與 Footer 應透過同一查詢或共用資料層取得設定。

預定共用文件依內容語意分組，不依畫面欄位位置命名：

| 群組 | 內容 | 使用端 |
| --- | --- | --- |
| 品牌識別 | `brandName`、`brandLogo`、`brandDestination` | Header、Footer 共用名稱與 Logo；需要品牌入口的元件另讀目的地 |
| 全站導覽 | `navigationItems` | Header、Banner、Footer |
| 品牌訊息 | `brandMessages` | Footer；其他頁面若使用同一訊息則直接共用 |
| 聯絡方式 | `contact`、`socialLinks` | Footer；其他聯絡區塊不得複製另一份正式資料 |
| 法務資訊 | `legal` | Footer 及未來需要顯示法務資訊的全站元件 |

Sanity 驗證須阻止缺少品牌名稱、5 項已確認導覽或版權文字的文件發布；選填聯絡欄位須成組驗證，例如電話顯示值與可操作值不可只填一項，社群名稱與 HTTPS 網址不可拆開。前端查詢只讀已發布的固定文件 ID，並為所有使用端回傳同一份型別化資料。正式上線前須另行確認快取及讀取失敗時使用的已核准備援資料；未確認的 prototype 文案不得作為備援。

## 狀態與行為

- 一般狀態顯示品牌、可用聯絡資訊、站內導覽與版權；電話開啟系統撥號、Email 開啟郵件程式、社群連結前往已核准的 HTTPS 網址，站內導覽使用 Nuxt 路由。
- 目前路徑與某個站內導覽目的地相符時，該連結標記 `aria-current="page"`；視覺提示不得只依賴顏色，其他連結不帶此屬性。
- 第一版應以伺服器端取得或建置期可用的內容渲染，不顯示獨立 loading 骨架。若未來改為用戶端取得資料，須另定避免版面位移與重複朗讀的 loading 契約。
- 全站設定缺失或讀取失敗時，只能使用事先核准且受版本控制的必要品牌、導覽與版權備援；尚未建立該備援時應阻擋 production 發布。畫面不得顯示未確認值、`#`、空連結或「待確認」文字；錯誤可記錄於伺服器端，但不得把敏感內容寫入瀏覽器紀錄。
- 地址、電話、Email、中文收束句及社群入口均可獨立省略；缺少選填欄位時移除整個對應元素與間距。必要品牌或導覽設定缺失屬發布阻擋，不得以 prototype 值靜默補位。
- 長地址、Email、品牌句與導覽名稱允許換行，不截斷核心資訊，不造成水平捲動；Email 與長網址須能安全斷行。
- 三條白色路徑為靜態裝飾；兩組稀疏白點可用不同速度與相位沿路徑流動。Footer 未進入視窗、文件不可見或元件卸載時停止動畫；重新可見時可恢復。Hover 或鍵盤焦點可提高光點可見度，但不可成為理解連結狀態的唯一線索。
- `prefers-reduced-motion: reduce` 時不顯示移動點群，只保留靜態路徑；內容與操作能力不得減少。

## 響應式與無障礙

桌面延續 L 案的偏軸雙欄資訊結構；`<= 900px` 改為單欄並隱藏僅供桌面構圖使用的中文收束句，改由行動版品牌標誌開始閱讀；`<= 560px` 收斂內距並確保從 320px 起無水平溢位。視覺排列改變不得改變 DOM 的品牌、主張、聯絡、導覽、版權閱讀順序。

根元素使用 `footer`；聯絡資料使用 `address`，頁尾導覽使用有「頁尾導覽」名稱的 `nav`。品牌標誌若同時提供可讀品牌名稱，可使用空 `alt`；若標誌是唯一品牌名稱，替代文字使用核准的 `brandName`。英文主張標記 `lang="en"`。裝飾 SVG 使用 `aria-hidden="true"` 且不可聚焦。所有連結保留可見焦點，鍵盤順序與 DOM 一致，觸控目標至少 44 × 44px；純裝飾箭頭不提供替代文字。

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
10. 後臺資料化完成後，Studio 只提供一個全站設定入口，Header、Banner 與 Footer 讀取相同的 `siteSettings` 文件及 `navigationItems`，schema 中不存在重複的元件專屬品牌或導覽欄位。
11. `siteSettings` 發布驗證會拒絕缺少必要品牌、任一已確認導覽或版權內容的文件，並拒絕只有名稱沒有網址、只有顯示電話沒有可操作值等不完整成組資料。

## 待決事項、依賴與下一階段輸入

- 內容負責人須核准品牌中英文主張、地址、電話、Email、社群名稱與實際網址、版權文字及年份策略；這些項目阻擋正式發布。
- Footer 已確認完整沿用 Header 的 5 項導覽。L prototype 暫放 4 項且把 `/course` 標為「創藝身心路徑」，屬尚未同步的舊稿差異；production 實作必須補上「文章分享」並使用已確認名稱。
- 共用導覽常數與首頁回歸測試已改為 `/session`；Header、Banner 與 Footer 的五項連結共用相同常數。
- 已確認 `app/pages/` 只有首頁與課程頁；`/events`、`/session`、`/articles` 與 `/about` 尚未建立，阻擋完整導覽驗收及 `ui-verified`。目的頁需在各自功能範圍完成，不能用空白頁假裝通過。
- 資料整合階段需建立 Sanity `siteSettings` 單例、共享查詢、型別、缺值／備援政策與發布驗證；在此之前不得把現有前端常數記載為已完成的 Sanity 整合。視覺開發階段需把已選定的 SVG 路徑、動畫參數及斷點轉為 production 規格。
- `SiteFooter.vue`、跨頁整合與本機行為測試已完成；下一階段為補齊導覽目的頁後完成 UI 驗收，再進入 Sanity 串接。Facebook、LINE 因無核准網址暫不顯示，長內容測試的 example.com 僅用於 fixtures。

## 本階段完成與驗證

- 已完成 Footer 的功能範圍、內容契約、共用後臺資料關係、狀態、響應式、無障礙及可測試驗收條件。
- 已比對 `PRODUCT.md`、`DESIGN.md`、Header 規格、L prototype、現有 `SiteFooter.vue`、共用導覽常數與 `studio/schemaTypes/index.ts`。
- 2026-10-07 接續 `develop-feature`：沿用已選定 L 設計，更新 surface brief，完成 Vue 元件、型別化典型／最長／缺值 fixtures、動畫生命週期與兩頁整合。
- `npm run test -w web`：57 項通過；`npm run typecheck -w web`、`npm run build -w web` 通過。保留既有 Vue Router 型別插件與 Nuxt／Tailwind sourcemap 警告。
- Impeccable detector：0 個反模式錯誤、2 項字級 advisory；12px 版權與手機主張字級屬此 surface 的既有構圖，不提升成全站 token。
- Chrome 已量測首頁與課程頁 320、560、900、1024、1440px；Footer 文字與操作元素均在容器內，五項導覽高度皆為 58px。裝飾 SVG 在手機刻意超出容器並裁切，不能以包含 SVG 的 scrollWidth 判為文字溢位。
- 已檢視 320px、1024px 與 1440px 截圖，確認 L 構圖、換行與目前頁底線；鍵盤 Tab 可進入下一導覽且有實線焦點。瀏覽器 reduced motion 測得光點 0 組、靜態線 3 條、flowing=false；320px 的 200% 文字與最長 Email 壓力檢查未見內容水平溢位。
- 截圖與量測存於 [footer-frontend](../design/review/footer-frontend/)；截圖為實際頁面載入後暫時隱藏 Header／main 的 Footer 區域取景。缺值、Logo 錯誤、社群及動畫清理另由 Vitest 驗證。尚未完成所有焦點的人工逐項驗收、完整輔助技術驗收、正式內容及目的頁端到端驗收。
- Sanity、遠端 dataset、正式發布內容與核准備援均未建立或修改。
