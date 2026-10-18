# 關於我們頁面規格

**狀態：** frontend-ready

**路由：** `/about`

**依據：** `PRODUCT.md`、`DESIGN.md`、`docs/specs/header.md`、`docs/specs/footer.md`、現有 `siteSettings` 聯絡資料契約

## 目標與受眾

協助正在評估課程、活動或個案諮詢的訪客理解品牌理念、認識空間與團隊，透過少量真實片段感受現場氛圍，最後取得一致且可操作的聯絡與到訪資訊。頁面應建立信任，但不使用未經核准的療效、見證或人物資料。

## 已確認方向與合理假設

- **已確認：** 頁面依序包含「品牌理念」、「空間／團隊介紹」、「精選片段」及「聯絡我們」四區；品牌理念圖片可省略，空間／團隊圖片必填；精選片段在桌面採左側圖片 Swiper、右側文字；聯絡區沿用現有聯絡資料、營業時間並顯示 Google Maps 地圖。桌面設計選定 A「顯影室」，頁面內容區改採暖紙與淺砂色，標題及正文沿用既有網站字級。
- **合理假設：** 精選片段為一組共用敘述搭配少量圖片，不建立獨立花絮文章；Swiper 只由使用者手動切換，不自動播放；About 內容以 `aboutPage` 單例管理，聯絡與地圖定位由 `siteSettings.contact` 提供，避免和 Footer 重複維護。
- **尚非正式內容：** 現有首頁、Footer、舊稿或 fixture 中的品牌文案、人物、地址、電話、Email、社群及照片，未經內容負責人核准前皆不得直接發布。

## 範圍與非目標

第一版包含四個固定內容區、圖片切換控制、聯絡連結、嵌入式 Google Maps、共用 Header／Footer、讀取失敗狀態及響應式與無障礙行為。不包含獨立團隊成員詳情、花絮列表或詳情頁、聯絡表單、預約流程、評論、路線規劃、地圖搜尋及使用者定位。頁面不複製一份 Footer 聯絡資料，也不允許後臺貼入任意 iframe HTML。

## 內容與資訊順序

1. 頁面首區：頁面標題與選填導言。
2. 品牌理念：選填圖片加文字敘述。
3. 空間／團隊介紹：圖片加文字敘述。
4. 精選片段：桌面左側圖片 Swiper、右側共用文字。
5. 聯絡我們：邀請文字、現有聯絡資訊、營業時間、社群入口及 Google Maps。
6. 共用 Footer。

視覺設計可調整留白與區塊構圖，但不得改變上述閱讀順序或把文字烘焙進圖片。

## 內容契約

### `aboutPage` 單例

| 欄位 | 語意與型別 | 必填／長度與數量 | 編輯責任 | 預定資料來源 |
| --- | --- | --- | --- | --- |
| `title` | 頁面主標題；純文字 | 必填；2–20 個中文字 | 品牌／內容負責人 | `aboutPage` |
| `introduction` | 頁面導言；純文字 | 選填；30–160 個中文字 | 內容負責人 | `aboutPage` |
| `brandStory.heading` | 品牌理念區標題；純文字 | 必填；2–20 個中文字 | 品牌負責人 | `aboutPage` |
| `brandStory.body` | 品牌理念；受限 Portable Text，只允許段落、強調與安全連結 | 必填；1–5 段，建議 120–800 個中文字 | 品牌負責人 | `aboutPage` |
| `brandStory.image` | 支持品牌理念的圖片 | 選填；0–1 張 | 品牌／內容負責人 | Sanity image asset |
| `brandStory.imageAlt` | 圖片替代文字；純文字 | 有圖片且承載資訊時必填；最長 120 個中文字 | 內容負責人 | `aboutPage` |
| `placeAndTeam.heading` | 空間／團隊區標題；純文字 | 必填；2–20 個中文字 | 品牌負責人 | `aboutPage` |
| `placeAndTeam.body` | 空間與團隊介紹；受限 Portable Text | 必填；1–6 段，建議 150–1,000 個中文字 | 品牌／內容負責人 | `aboutPage` |
| `placeAndTeam.image` | 真實空間或團隊圖片 | 必填；1 張，須保留焦點／裁切資訊 | 內容負責人 | Sanity image asset |
| `placeAndTeam.imageAlt` | 圖片替代文字；純文字 | 必填；最長 120 個中文字 | 內容負責人 | `aboutPage` |
| `featuredMoments.heading` | 精選片段區標題；純文字 | 必填；2–20 個中文字 | 內容負責人 | `aboutPage` |
| `featuredMoments.body` | 整組片段的共用敘述；受限 Portable Text | 必填；1–4 段，建議 80–500 個中文字 | 內容負責人 | `aboutPage` |
| `featuredMoments.items[]` | 可排序片段圖片 | 必填；最少 3、典型 5、最多 10 張 | 內容負責人 | `aboutPage`／Sanity image asset |
| `featuredMoments.items[].imageAlt` | 單張圖片替代文字；純文字 | 必填；最長 120 個中文字 | 內容負責人 | `aboutPage` |
| `featuredMoments.items[].caption` | 可見的簡短圖說；純文字 | 選填；最長 80 個中文字 | 內容負責人 | `aboutPage` |
| `contactHeading` | 聯絡區標題；純文字 | 必填；2–20 個中文字 | 內容負責人 | `aboutPage` |
| `contactIntroduction` | 聯絡邀請文字；純文字 | 選填；20–180 個中文字 | 內容負責人 | `aboutPage` |
| `seo.title` | 瀏覽器與搜尋結果標題 | 選填；建議 20–60 個字元 | 內容負責人 | `aboutPage` |
| `seo.description` | 搜尋結果摘要 | 選填；建議 60–160 個字元 | 內容負責人 | `aboutPage` |

圖片以內容意義決定替代文字；純裝飾圖片使用空字串，不得把檔名當替代文字。若照片中有可辨識人物，內容負責人須在上傳前確認具備公開使用權與當事人同意；第一版不在每張圖片建立公開同意欄位。

### 共用聯絡與地圖資料

聯絡區直接讀取既有 `siteSettings.contact.address`、`phone`、`email` 與 `siteSettings.socialLinks`。營業時間與地圖同樣擴充在共用聯絡資料，不在 `aboutPage` 複製：

| 欄位 | 語意與型別 | 必填／長度與數量 | 編輯責任 | 預定資料來源 |
| --- | --- | --- | --- | --- |
| `contact.businessHours[]` | 公開營業時段；每筆包含 `days` 與 `hours` 純文字 | About 發布必填；1–3 筆，各 2–40 字元 | 內容負責人 | `siteSettings.contact` |
| `contact.businessHoursNote` | 營業時間補充，如預約制或例外說明；純文字 | 選填；最長 80 個中文字 | 內容負責人 | `siteSettings.contact` |
| `contact.map.placeName` | 地圖地點可讀名稱；純文字 | 有地圖時必填；2–40 個中文字 | 內容負責人 | `siteSettings.contact` |
| `contact.map.embedUrl` | Google Maps 嵌入網址；HTTPS URL | 有地圖時必填；只接受核准的 Google Maps embed 網域，不接受 HTML | 內容／前端 | `siteSettings.contact` |
| `contact.map.externalUrl` | 在 Google Maps 開啟的公開網址；HTTPS URL | 有地圖時必填 | 內容負責人 | `siteSettings.contact` |

正式發布時，聯絡區須有公開地址、至少一組營業時段，以及電話、Email、社群入口其中一項；地圖必須對應相同公開地址。外部地圖連結應清楚標示並以新分頁開啟，使用 `rel="noopener noreferrer"`。

## 狀態與行為

- 頁面以伺服器端 published-only 資料渲染，不呈現獨立 loading 骨架，避免首屏位移。`aboutPage` 不存在、必要欄位缺失或查詢失敗時顯示中性「頁面內容暫時無法顯示」狀態，不回退到示範文案。
- 品牌理念圖片缺少時移除圖片容器，文字自然使用可用寬度；空間／團隊圖片及少於 3 張精選片段屬無效發布內容。
- Swiper 預設顯示第一張，提供上一張、下一張、目前張數與總張數；到達首尾時控制項保持可理解的 disabled 狀態。切換只改變圖片及其圖說，右側共用文字不變，不自動輪播、不循環，也不攔截頁面垂直捲動。
- 圖片載入失敗時保留替代文字與固定比例空間，其他內容仍可閱讀；單張失敗不應使整個頁面崩潰。
- `siteSettings` 讀取失敗時，其餘 About 內容仍顯示；聯絡區改呈中性 unavailable 訊息並省略地圖，不顯示未核准備援資料。地圖載入失敗時仍保留地址與「在 Google Maps 開啟」連結。
- 選填導言、品牌理念圖片、圖片圖說或聯絡邀請缺少時，移除對應元素與間距，不留下空標題或空控制項。長文字允許自然換行，正文維持合理行寬，不截斷核心資訊。

## 響應式與無障礙

- 桌面版精選片段維持圖片在左、文字在右；`<= 1023px` 改為單欄，依序顯示標題、圖片與控制、圖說、共用文字。其他圖文區在窄螢幕也維持 DOM 閱讀順序，不以 CSS 視覺重排造成鍵盤與閱讀順序不一致。
- 320px 起不得出現內容水平捲動；圖片維持已定義比例與焦點裁切，正文遵守 `DESIGN.md` 的字級、行距及主要頁面留白。所有控制與連結的觸控區至少 44 × 44px。
- 頁面只使用一個 `h1`；四個內容區使用具可讀標題的 `section` 與 `h2`。聯絡資料使用 `address`；Google Maps iframe 使用明確 `title`、`loading="lazy"` 並位於有標題的地標區域。
- Swiper 使用具名稱的 carousel／region 語意。上一張與下一張使用原生 `button`，具狀態相關名稱；鍵盤可操作，焦點清楚可見，切換後以非干擾方式更新目前張數，不強制搬移焦點。圖片順序也是不支援 JavaScript 時的內容順序。
- 動畫與切換遵守 `prefers-reduced-motion`；減少動態時取消滑動位移，改為立即或淡入切換。Google Maps 為第三方嵌入內容，不得阻擋使用者閱讀地址與聯絡方式。

## 驗收條件

1. `/about` 依序呈現頁面首區、品牌理念、空間／團隊介紹、精選片段與聯絡我們，並使用全站共用 Header 與 Footer；導覽中的「關於我們」正確標記目前頁。
2. 品牌理念在有圖與無圖資料下均保持完整閱讀；空間／團隊必須有圖片與替代文字，必要內容不完整時不得被 parser 視為 ready。
3. 精選片段可用滑鼠、觸控及鍵盤逐張切換，首尾 disabled、張數、圖說及替代文字正確；沒有自動播放、無限循環或垂直捲動攔截。
4. About 聯絡資訊與 Footer 來自同一份 `siteSettings`；About 額外顯示共用聯絡資料中的營業時間。修改已發布的地址、電話、Email、營業時間或社群後，所有使用該欄位的位置同步，頁面不存在第二份正式聯絡欄位。
5. Google Maps 對應公開地址，iframe 有可讀名稱且延遲載入；地圖失敗或被封鎖時，地址及外部 Google Maps 連結仍可操作，網址不是 `#` 或任意 iframe HTML。
6. 測試涵蓋 ready、empty、invalid、error、品牌圖缺少、最少／最多片段、圖片失敗、聯絡資料失敗及地圖失敗；任何狀態都不洩漏 fixture 或草稿內容。
7. 在 320、390、768、1024 與 1440px 下沒有文字重疊或內容水平溢位；手機閱讀順序正確，桌面精選片段符合左圖右文方向。
8. 頁面標題階層、`section`、`address`、carousel、按鈕、替代文字、iframe title 與焦點行為通過自動化與鍵盤檢查；200% 縮放及 reduced motion 下仍可完成閱讀與操作。
9. `aboutPage` 與 `siteSettings` 均只讀已發布內容；草稿不影響公開頁，發布後前台更新，內容還原流程可重複驗證。

## 待決事項、依賴與下一階段

- 內容負責人需提供並核准品牌理念、空間／團隊介紹、聯絡邀請、3–10 張精選片段、圖片替代文字、公開聯絡資料、營業時間及 Google Maps 嵌入／外部網址。
- 需確認照片授權與可辨識人物的公開同意；此項未完成前不得將相片視為正式內容。
- Google Maps 第三方載入可能涉及隱私與同意管理；UI 驗收完成前須確認網站的隱私揭露及是否需要先取得同意才載入 iframe。若需要，CMS 串接前應補上地圖占位與啟用按鈕狀態。
- `/about` 前端原型已完成，下一階段為 UI 行為驗收；通過後才進入 Sanity 串接。CMS 階段須建立 `aboutPage` 單例、擴充 `siteSettings.contact.businessHours`／`map`，並以共用 `siteSettings` 取代目前僅供原型展示的聯絡 fixture。
- 內容負責人仍需核准正式文案、人物與照片授權、地址、電話、Email、營業時間、社群及 Google Maps 網址；原型資料不得直接發布。

## 設計探索狀態

- 2026-10-18 完成 [三款桌面候選](../design/about-page-concepts.html)：A 以深色顯影與影像沉浸建立情緒；B 以照片前後景強調空間與人的連結；C 以大型中文排版與嚴格格線維持安靜閱讀。
- 2026-10-18 使用者選定 A；已將 A 的深色內容表面改為暖紙／淺砂色，主標題、章節標題、引言與正文分別對齊 `DESIGN.md` 的既有 `detailHero`、`detailSection`、`detailSummary` 與 `detailBody` 字級，並在聯絡區加入營業時間。B、C 保留為未選用比較稿。
- 2026-10-18 第二輪修訂將 Banner 標題固定為桌面單行呈現；品牌理念取消過高的固定區塊高度，改為雙欄頂端對齊並縮短上下留白，使標題與正文形成集中內容群組。
- 2026-10-18 第三輪修訂依使用者回饋，將品牌理念改為標題在上、正文在下的單欄結構；標題、分隔線與正文整組水平置中，正文維持受控行寬。
- 2026-10-18 第四輪修訂移除品牌理念標題與正文之間的分隔線，並開始 A 的手機版設計：Header 改用 44px 選單按鈕，各區改為單欄，精選片段依標題、圖片、圖說、控制與正文的自然閱讀順序排列，聯絡資訊與地圖上下堆疊。
- 三案皆包含品牌理念、空間／團隊、左圖右文精選片段、聯絡資訊、Google Maps 示意及共用 Footer；圖片、人物、地點和文案均為設計示意，不是正式內容。
- 已完成 A 桌面 1440 × 900，以及手機 390 × 844／平板 768 × 1024 的實際渲染檢查；證據與限制記錄於 [桌面設計檢查](../design/review/about-page-concepts-desktop/README.md) 與 [手機設計檢查](../design/review/about-page-a-mobile/README.md)。2026-10-18 使用者確認手機稿並同意進入前端原型，因此狀態更新為 `design-approved`；完整互動與無障礙驗收仍屬後續 UI 驗證階段。
- 2026-10-18 完成 `/about` 前端原型：共用 Header／Footer、A 桌機與手機構圖、垂直置中的品牌理念、空間／團隊、手動精選片段、營業時間、Google Maps、loading／empty／error 與圖片失敗備援均已實作。狀態更新為 `frontend-ready`。

## 本階段完成與驗證

- 已完成 About 第一版的範圍、內容契約、共用資料關係、狀態、響應式、無障礙及可測試驗收條件。
- 已比對 `PRODUCT.md`、`DESIGN.md`、Header／Footer／首頁內容規格、現有 `siteSettings` 型別、API 與 Sanity schema；`/about` 前端路由現已建立，正式聯絡資料仍規劃由 `siteSettings` 共用。
- 已新增三款桌面設計候選與四張生成示意圖片；設計稿已完成 1440px、390px 與 768px 渲染檢查。前端原型未修改 Sanity schema、正式資料或進行遠端寫入。
- 前端原型新增 `AboutOverview.vue`、`/about` 頁面、共用型別、典型／長內容／缺少選填／空集合 fixtures、四張原型靜態圖片與頁面測試。所有示意資料在頁面明確標註未核准。
- 已執行 About 測試 7/7、完整 Vitest 218/218、`nuxt typecheck`、production build 與 `git diff --check`，皆為成功；型別檢查仍輸出既有 `vue-router/volar/sfc-route-blocks` 套件相容警告，未造成失敗。production preview 的 `/about` 回應 200，Hero 與精選圖片資產回應 200。
- 本機環境沒有可用的無頭瀏覽器，因此尚未對 production Vue 實作重新產出 320／390／768／1024／1440px 截圖，也未完成鍵盤、200% 縮放、地圖阻擋及真機觸控人工驗收；這些項目留在下一階段 `verify-ui-behavior`。


#### 待修正項目
- [] about-label 改成 14px
- [] .about-carousel__figure 移除背景色
- [] 輪播要可以拖動、自動播放 2000ms、播放動畫時間1500ms
- [] about-contact__list dt，字級、line-height 對齊 about-contact__list dd