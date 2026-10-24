# 文章分享內頁規格

**狀態：** cms-integrated

**路由：** `/articles/[slug]`  
**頁面模式：** Read；閱讀單篇文章並繼續探索編輯者挑選的相關文章  
**設計依據：** [`PRODUCT.md`](../../PRODUCT.md)、[`DESIGN.md`](../../DESIGN.md)、[`articles.md`](articles.md)，以及既有內容詳情頁的共用閱讀字級與互動規則

## 目標與受眾

主要受眾是從文章總覽、搜尋結果或分享連結進入的訪客。頁面需先讓訪客確認文章主題與所在層級，再以舒適、連續的閱讀節奏理解完整內容；文章可能從頭到尾只有小標與段落，也可由編輯者加入左圖右文、右圖左文及單張大圖，不需要前端改碼。

成功標準是訪客能從麵包屑返回文章總覽、完整閱讀不同長度與圖文組合的正文，並在文末瀏覽後台人工挑選的相關文章。詳情頁的標題、分類、標籤、摘要與日期必須和 `/articles` 共用同一篇 `article` 文件，不能維護兩份內容。

## 範圍與非目標

第一版包含共用 Header／Footer、麵包屑、文章標題與摘要資料、選填代表圖、可排序的正文區塊、手動選擇的相關文章 swiper，以及 loading、error、not found、缺少選填內容與長內容狀態。正文支援富文字段落、左右圖文及滿寬大圖；所有公開內容來自 Sanity published perspective。

第一版不包含作者頁、閱讀時間、目錄、留言、收藏、按讚、社群分享統計、自動推薦演算法、依標籤自動補推薦、文章內課程導購、會員權限、付費牆或站內預覽流程。正文不接受任意 HTML、嵌入 script、iframe 或未列入契約的第三方內容；影片、圖庫及可下載附件若日後需要，另立需求。

## 已確認事實、工作假設與示範內容

- 已確認：公開路由為 `/articles/[slug]`，頁面上方需有麵包屑，正文可分段使用左圖右文、右圖左文及單張大圖，頁面最下方可顯示由後台自選的相關文章 swiper。
- 已確認：文章總覽已定義每篇文章只有一個既有 `courseCategory`、1–8 個 `articleTag`，並共用標題、slug、摘要、發布時間與選填代表圖。
- 已確認：舊站現有文章包含「代表圖後只由粗體小標與連續長段落構成、正文不插圖」的形式；純文字長文是正式支援情境，不視為缺圖或降級狀態。
- 已確認：首區採第三輪 A 的暖砂資訊牌，後台可選兩種 banner 樣式。`overlay` 讓右側區域使用橫式代表圖滿版置中裁切、疊半透明黑色遮罩並在原位置呈現標題與摘要；`split` 保留中央標題摘要與最右側圖片窗，橫式代表圖在圖片窗內置中裁切。
- 已確認：正文採第三輪 B 的圖片破邊與穩定文字軸線，但不顯示區塊分隔線；有圖文章仍需支援左右圖文與單張大圖。
- 已確認：延伸閱讀使用無獨立底色的圖片型 swiper；每筆顯示圖片、主要分類、標題、最多兩行摘要及閱讀按鈕，不顯示發布日期。
- 已確認：Sanity 是正式內容來源；既有 `article` 文件已在本機 schema 擴充正文、相關文章與 SEO 欄位，詳情頁改由 published-only slug API 讀取，不再以 fixture 作為主要資料。遠端 schema 與 production 內容流程尚未驗證。
- 工作假設：正文由可排序的語意區塊組成；左右位置只是圖文區塊的呈現設定，不建立 `leftImage`、`rightText` 等重複內容欄位。
- 工作假設：相關文章完全依編輯者選取順序顯示，不依分類、標籤或日期自動補足；未選擇或沒有仍可公開的項目時，整個區塊省略。
- 工作假設：相關文章不自動循環、不自動播放；按上一筆／下一筆移動，抵達集合頭尾時停用對應控制。
- 示範內容：設計與測試可使用明確標示的 fixture 驗證版型，不得將示範標題、日期、圖片、分類、標籤或正文視為核准的正式內容。

## 資訊架構與顯示規則

1. `SiteHeader` 從載入起顯示並標示「文章分享」為目前區域；`main` 只有文章標題一個 `h1`。
2. 主內容依序為麵包屑、文章首區、正文與選填相關文章，最後接共用 Footer。麵包屑為「首頁／文章分享／目前文章」，首頁與文章分享可返回對應頁面，目前文章使用純文字並標示 `aria-current="page"`。
3. 首區顯示主要分類、相關標籤、`h1`、摘要、發布日期與選填代表圖。分類、標籤、標題、摘要、日期及代表圖與總覽共用欄位，不建立詳情專用副本；只新增詳情頁的 `heroStyle` 呈現選項。`overlay` 必須有代表圖，右側以 `cover` 滿版並預設置中裁切；`split` 的圖片窗同樣以 `cover` 置中裁切，已設定 Sanity hotspot 時優先使用該焦點。
4. 正文依後台順序完整呈現：富文字段落可包含選填章節標題；左右圖文區塊包含一張圖與一組富文字；滿寬大圖區塊包含一張圖與選填圖說。不得因同型區塊重複而自動合併或改序。
5. 左右圖文的 `mediaSide` 使用邏輯值 `start`／`end`：在目前由左至右的版面分別呈現左圖右文、右圖左文。窄版回到單欄，固定先顯示圖片再顯示該段文字，以保持各段完整且可預期。
6. 文末相關文章依後台 references 順序顯示，每筆沿用標題、slug、主要分類、摘要與代表圖；此區不查詢或顯示發布日期。缺少可用代表圖的項目視為此區無效，不得推薦自己、重複文章、草稿、已取消發布或必要資料無效的文章，也不得用其他文章自動補位。
7. 相關文章有效筆數為 1 時可顯示單張靜態入口但不顯示無作用控制；2 筆以上才啟用 swiper。控制一次前進一個項目，桌面可同時顯示多筆、窄版至少完整顯示一筆。摘要在卡片中最多顯示兩行，完整文章標題與可理解的按鈕名稱不得裁切。
8. canonical URL 為 `/articles/{slug}`，不以 query 儲存正文位置或 swiper 狀態。slug 變更後的重新導向不在第一版；已發布文章不應任意更改 slug。

## 內容契約

### 文章核心與首區

| 欄位 | 語意與型別 | 必填與合理範圍 | 編輯責任／預定來源 |
| --- | --- | --- | --- |
| `title` | 文章正式標題，純文字 | 必填，4–50 字 | 編輯者／既有 Sanity `article` |
| `slug` | 公開網址的穩定識別碼 | 必填且文章內唯一，1–80 個小寫英數與連字號 | 編輯者／既有 Sanity `article` |
| `category` | 文章主要分類 reference | 必填且僅 1 個；限既有四個 `courseCategory` | 編輯者／既有 Sanity `article` |
| `tags` | 文章相關標籤 references | 必填且不重複；最少 1、典型 1–3、最多 8 個 | 編輯者／既有 Sanity `articleTag` |
| `excerpt` | 首區摘要及總覽摘要，純文字 | 必填，30–140 字 | 編輯者／既有 Sanity `article` |
| `publishedAt` | 對外發布日期時間 | 必填，ISO datetime；前台由同一值格式化 | 編輯者／既有 Sanity `article` |
| `coverImage` | 首區與總覽共用的選填代表圖 | 選填；有內容意義時 `alt` 必填 2–120 字 | 編輯者／既有 Sanity image |
| `heroStyle` | 詳情首區的圖片與標題排列 | 必填 enum：`overlay` 或 `split`；預設 `split` | 編輯者／擴充 Sanity `article` |
| `body` | 可排序的正文區塊陣列 | 必填；最少 1、典型 4–10、最多 30 個有效區塊 | 編輯者／擴充 Sanity `article` |
| `relatedArticles` | 編輯者人工挑選的文章 references | 選填且不重複；0–8 筆，不可選自己；選取器可依標題、分類或 slug 搜尋，並排除目前與已選文章 | 編輯者／擴充 Sanity `article` |

文章依 Sanity draft／published 狀態決定公開性，不新增 `isPublished` 或詳情專用公開開關。`heroStyle: overlay` 時 `coverImage` 必填；`split` 可省略代表圖並讓文字區自然擴展。`body` 缺少或沒有有效區塊時不得發布；一篇文章可只包含一個以上的 `richTextSection`，不要求任何正文圖片。執行階段若讀到核心契約無效的已發布文件，顯示 error 而非以 fixture、摘要或其他文章補成正文。

### 正文區塊

| 區塊／欄位 | 語意與型別 | 必填與合理範圍 | 編輯責任／預定來源 |
| --- | --- | --- | --- |
| `richTextSection` | 一段純文字為主的內容 | 區塊選填 `heading` 4–60 字；`content` 必填 1–40 個 Portable Text blocks | 編輯者／Sanity object |
| `splitMediaSection` | 一張圖片搭配一段文字 | `image`、`content`、`mediaSide` 必填；`heading` 選填 4–60 字 | 編輯者／Sanity object |
| `splitMediaSection.mediaSide` | 圖片相對文字的呈現方向 | enum：`start` 或 `end` | 編輯者／Sanity string |
| `wideImageSection` | 獨立的大幅圖片段落 | `image` 必填；`caption` 選填 2–160 字 | 編輯者／Sanity object |
| `content` | 正文富文字 | 支援一般段落、`h2`、`h3`、有序／無序清單、粗體、斜體及連結；一般段落可留白，空白標題與清單項目無效 | 編輯者／Portable Text |
| `image` | 內容圖片與裁切焦點 | 圖片資產及 `alt` 必填；`alt` 2–160 字，純裝飾圖可明確設空字串 | 編輯者／Sanity image |
| `caption` | 圖片來源、情境或補充說明 | 選填，2–160 字；不重複 alt 或正文 | 編輯者／Sanity string |

正文連結支援站內相對路徑及有效的 `https:` 網址；不接受 `javascript:`、`data:` 或其他未核准協定。外部連結需在點擊前可辨認目的，若以新分頁開啟則加入安全屬性。Portable Text 不儲存字級、顏色、左右 margin 或原始 HTML；視覺樣式由前端統一控制。

### SEO 與系統資料

| 欄位 | 語意與型別 | 必填與合理範圍 | 編輯責任／預定來源 |
| --- | --- | --- | --- |
| `seoTitle` | 瀏覽器與搜尋結果標題 | 選填，10–60 字；缺少時使用 `title` 與站名安全組合 | 編輯者／Sanity `article` |
| `seoDescription` | 搜尋與分享摘要 | 選填，50–160 字；缺少時使用 `excerpt` | 編輯者／Sanity `article` |
| `shareImage` | 選填社群分享圖 | 選填；缺少時使用 `coverImage`，兩者皆無時使用全站預設 | 編輯者／Sanity image／全站設定 |
| `canonicalUrl` | 此文章的正式公開網址 | 系統由公開站址與 slug 產生，不存入 CMS | 系統／前端 |

SEO 不得加入頁面未呈現或未核准的療效、資格與事實。not found 與 error 狀態不可輸出可索引的文章 metadata，並應使用 `noindex`。

## 狀態與行為

- **Ready：** 顯示完整首區與至少一個有效正文區塊；相關文章只有在至少一筆有效 reference 時出現。
- **Loading：** 保留 Header、麵包屑與閱讀版面輪廓，主內容設 `aria-busy="true"`；骨架不包含虛構文字、圖片或推薦。
- **Error：** 讀取失敗或已發布文件核心契約無效時，顯示暫時無法載入及重新載入操作，並保留返回文章總覽的入口；不得回退至 fixture。
- **Not found：** slug 不存在、格式無效或文章未發布時回應 HTTP 404，顯示一致訊息、返回文章總覽及共用 Footer。
- **缺少選填內容：** `split` 無代表圖時省略圖片窗並讓標題摘要自然擴展；`overlay` 無代表圖屬核心契約無效。無圖說、SEO override、分享圖或相關文章時直接省略相應容器，正文與頁面結尾仍成立。
- **部分相關文章失效：** 只移除失效項目並保留其餘編輯順序；全部失效時省略相關文章區，不自動尋找替代項目。
- **長內容：** 50 字標題、140 字摘要、8 個標籤、30 個正文區塊、長清單與 8 筆相關文章需自然換行，不造成水平捲動。只有延伸閱讀摘要依已確認版型最多顯示兩行；正文與標題不可裁切。
- **Swiper 回饋：** 上一筆／下一筆按鈕有可辨識名稱、可見 disabled 狀態及 `focus-visible`；切換後以簡短 live region 說明目前位置，不重讀整組文章。若 JavaScript 失效，所有相關文章仍可依 DOM 順序閱讀及開啟。

## 響應式、語意與無障礙

- 沿用 `DESIGN.md` 的 paper、sand、ink、clay、saffron、persimmon、night、字體、直角容器及平面表面規則，不使用圓角卡片牆、陰影或柔焦療癒圖像。
- 沿用固定詳情閱讀字級：桌機 `h1` 為 `72px`、摘要 `17px / 2`、章節 `h2` 為 `38px / 1.4`、正文 `16px / 2.1`；圖文段落文字欄最寬約 `68ch`，純文字章節外層最寬 `900px` 並水平置中。`<= 1023px` 分別為 `42px`、`16px`、`26px`、`16px`。
- 麵包屑各層級以相同的 flex 交叉軸與最小高度置中，連結與目前頁文字基線一致；正文容器 `.edge-body` 的 `padding-top` 固定為 `0`，首段位置只由父層內容節奏控制。
- 桌機首區左側固定使用暖砂資訊牌。`overlay` 的右側圖片鋪滿可用區並加足以維持文字對比的半透明黑色遮罩；`split` 保留最右側圖片窗。兩者均不拉伸圖片，橫式圖片預設置中裁切，hotspot 可覆寫焦點。
- 桌機圖文正文使用圖片破出左右頁邊、文字維持內側軸線的節奏，不以水平分隔線切開段落。延伸閱讀沿用頁面暖紙底，不增加深色或卡片底板。
- 純文字 `richTextSection` 使用最寬 `900px` 的置中閱讀區，不再沿用圖文段落的偏移內軸；所有正文統一使用 `16px / 2.1`（computed `33.6px`）及 `0.025em` 字距，相鄰非空段落的額外間距固定為 `0px`（原型 token `--paragraph-gap: 0px`）。編輯者建立的一個空白一般段落保留為一行 `33.6px` 的閱讀留白；連續空白段落逐行保留，且不向輔助科技輸出無意義內容。
- 桌面左右圖文可使用雙欄；`<= 1023px` 全部正文區塊回到單欄並先圖後文。手機資訊牌改為分類在左、標籤與日期在右；`overlay` 維持遮罩圖上文字，`split` 依序顯示文字與滿寬圖片窗。圖片仍向單側頁邊破出，正文區塊間距縮為 `64px`，swiper 一次顯示一篇。320–390px 的圖片、麵包屑、長網址、標籤及 swiper 不得造成水平捲動。
- `main` 只有一個 `h1`；正文編輯器只能從 `h2` 開始，並維持 `h2`／`h3` 不跳級。文章使用 `<article>`，正文段落使用 `section` 或具對應語意的內容容器，日期使用 `<time datetime>`，標籤集合與相關文章使用語意清單。
- 麵包屑使用具名稱的 `<nav>` 與有序清單，目前頁不可成為空連結。相關文章區具有可見 `h2`；每張文章入口不可巢狀多個互相競爭的連結。
- 有意義圖片使用描述內容的 alt，不重複文章標題或圖說；明確純裝飾圖片使用空 alt。圖說以 `<figcaption>` 關聯圖片，不把重要文字烘焙進圖片。
- 所有操作目標至少 44 × 44px，鍵盤焦點清楚可見。200% 文字放大後不遮擋內容；swiper 不可鎖住 Tab 焦點或攔截垂直捲動。
- Swiper 手動切換位移時間為 `1500ms`；`prefers-reduced-motion: reduce` 時移除動畫，但保留目前位置與控制狀態。
- 延伸閱讀卡片以整張連結承接 hover／focus：圖片只在既有裁切窗內微幅放大，標題、閱讀連結及箭頭引用全站 `--interactive-title-hover`（目前為陶土色）回應；控制按鈕具 hover、focus、active 與 disabled 狀態。多篇內容顯示目前範圍及細線進度，手機支援具方向門檻的水平滑動，不攔截一般垂直閱讀。
- 尊重 `prefers-reduced-motion`；移除卡片、箭頭、按鈕、進度與 swiper 的空間位移後，仍保留色彩與焦點回饋，正文、控制、目前位置與所有文章入口完整可用。swiper 不自動播放，因此不需要暫停控制。

## 驗收條件

1. `/articles/[slug]` 只顯示 slug 相符且已發布、核心契約有效的文章；不存在、未發布或格式無效的 slug 回應 404，讀取失敗或已發布內容無效進入 error，兩者皆不使用 fixture。
2. 詳情頁使用共用 Header／Footer，Header 標示「文章分享」，頁首提供「首頁／文章分享／目前文章」麵包屑，且 `main` 只有文章標題一個 `h1`。
3. 標題、slug、主要分類、標籤、摘要、發布日期與代表圖和 `/articles` 共用同一份 `article` 資料；總覽與詳情不會因重複欄位而顯示不一致內容。
4. 編輯者可在 `overlay` 與 `split` 間選擇 banner；前者在右側滿版橫圖上使用半透明黑色遮罩承載標題摘要，後者保留中央文字與最右側圖片窗。兩者的橫式圖片皆以 `cover` 置中裁切，且不拉伸；`overlay` 缺圖不得發布。
5. 編輯者可新增、刪除及排序富文字、左右圖文與滿寬大圖區塊；相同類型可重複，前台嚴格依後台順序呈現。
6. `mediaSide: start` 在桌面呈現左圖右文，`end` 呈現右圖左文；桌機區塊不顯示水平分隔線。`<= 1023px` 兩者均轉成先圖後文的單欄，閱讀與鍵盤順序一致。純文字與圖文正文皆為 `16px / 2.1`，相鄰段落額外 margin 為 `0px`；正文區塊 row gap 在桌機為 `96px`、手機為 `64px`。
7. Portable Text 只輸出核准的標題、段落、清單、強調及安全連結；一般空白段落呈現一行正文高度並設為 `aria-hidden`，空白標題與空白清單項目使核心內容驗證失敗；任意 HTML 與不安全 URL 不會被執行或輸出。
8. 正文圖片具有符合內容的 alt；選填圖說與圖片正確關聯。代表圖或其他選填欄位缺少時，不出現破圖、空標題或多餘留白容器。
9. 後台可選 0–8 篇不重複且非自己的相關文章；候選項支援依標題、分類或 slug 搜尋，以分類、日期與公開路徑協助辨識，並排除目前文章及已選項目。前台保持選取順序，只顯示仍公開且具有圖片、分類、標題、摘要及 slug 的項目，不自動補推薦。
10. 延伸閱讀沿用頁面底色且不顯示日期；每筆顯示圖片、分類、完整標題、最多兩行摘要及閱讀按鈕。0 筆時整區省略、1 筆時沒有無作用控制、2–8 筆時顯示範圍與進度，可用滑鼠、水平觸控滑動及鍵盤操作；卡片 hover／focus 與控制狀態提供一致回饋，且不自動播放或無限循環。一般切換速度為 `1500ms`，reduced motion 下取消空間位移。
11. Loading、Error、Not found、無代表圖、無相關文章、部分相關文章失效及最長內容都有清楚呈現；Error 可重試，Not found 可返回 `/articles`。
12. 320、390、768、1023、1024 與 1440px，以及 200% 文字放大時，標題、正文、圖片、麵包屑與相關文章無水平溢位、遮擋或必要內容裁切。
13. heading、article、nav、list、link、button、time、figure 與 figcaption 語意正確；所有操作可由鍵盤完成、焦點可見、目標至少 44 × 44px，reduced-motion 不影響功能。
14. 每篇 ready 頁輸出 title、description、canonical 與社群分享 metadata；選填 SEO 欄位缺少時依契約 fallback，404／error 使用 `noindex` 且不暴露未發布內容。

## 依賴、待決事項與下一階段

- 正式文章正文、圖片、替代文字與使用權仍需內容負責人提供並核准；現有總覽文章與 fixture 不自動視為可發布的詳情內容。
- `article` schema、published-only 詳情 query、嚴格 parser 與前端 API 串接已在本機完成；無資料回應 404，已發布核心內容無效或讀取失敗顯示 error，不回退至 fixture。schema 尚未部署至遠端 dataset。
- 相關文章區標題先由介面提供固定文案「延伸閱讀」；若內容團隊需要逐篇自訂標題，應在 CMS 串接前改為明確欄位，不由設計階段自行新增。
- 分享圖的全站預設來源依賴 site settings；若目前沒有可用欄位，第一版可只使用 `shareImage` → `coverImage`，但不得以未核准素材補位。
- slug 修改後的 301 重新導向、文章內影片／圖庫／附件、作者模型與自動推薦皆為後續範圍。
- 桌機與手機方向皆已確認，Nuxt 介面也已完成 UI 行為驗收：A 暖砂資訊牌、`overlay`／`split` 兩種 Hero、B 破邊正文（無分隔線）、純文字 `richTextSection`，以及無底色、無日期的圖片型延伸閱讀。現已接上本機 Sanity schema 與正式 API 契約；下一階段為 `validate-content-flow`。遠端 schema 部署、草稿隔離、匿名發布讀取、真實圖片與正式內容仍未執行。

## 階段紀錄

- 2026-10-24：完成 Typography 第一階段。文章 hero、摘要、資訊牌、正文 h2／h3、Portable Text 段落與清單、圖說、狀態文字及延伸閱讀改用全站 `.type-*` 語意角色；空白段落高度改由 `--type-body-size × --type-body-leading` 計算。相關元件與樣式回歸測試已通過；完整 typecheck、build、detector 與瀏覽器驗收結果記錄於全站設計系統階段紀錄。首頁、總覽頁與課程詳情仍待後續遷移。
- 2026-10-23：同步人工版面調整。正式 Vue 的純文字 `richTextSection` 改為 `max-width: 900px; margin: 0 auto`，取代早期設計稿的偏移 `68ch` 閱讀軸；圖文段落的文字欄仍維持既有 `68ch` 限制。既有 2026-10-16 原型與截圖保留為歷史證據，不回溯改寫。
- 2026-10-20：將延伸閱讀的響應式欄數、切換、觸控方向門檻、Tab 範圍、進度、live region、hover／focus 與 reduced-motion 行為抽成 `SharedRelatedArticles`，供課程詳情固定頁尾的延伸閱讀共用；Article 的內容契約與視覺維持不變，完整 Web 回歸測試通過。
- 2026-10-20：延伸閱讀標題與 CTA 的 hover／`focus-visible` 顏色改為引用全站 `--interactive-title-hover`，與活動列表的可點擊內容標題共用同一語意 token；既有圖片縮放、箭頭位移、焦點框與 reduced-motion 行為不變。Web 39 個測試檔、226 項測試、typecheck、production build 與 `git diff --check` 通過；正式內容的瀏覽器互動仍待部署後驗收。
- 2026-10-15：完成 `define-feature-spec` 初稿。依文章總覽共用資料契約與使用者確認的圖文段落、麵包屑及後台自選相關文章需求，補齊範圍、正文模型、狀態、響應式、無障礙、SEO 與可測試驗收條件。狀態為 `draft`；尚未進行視覺設計、前端、Sanity schema、正式內容或內容流程驗收。
- 2026-10-15：依 `shape-ui-direction` 完成三款 1440px 桌機候選：A「潮汐章頁」、B「頁邊星圖」、C「雙頁書冊」。三案均涵蓋麵包屑、文章首區、純文字、左右圖文、滿寬大圖與文末延伸閱讀，完整比較稿與截圖證據位於 [`articles-detail-concepts.html`](../design/articles-detail-concepts.html)及 [`review/articles-detail-concepts-desktop/`](../design/review/articles-detail-concepts-desktop/README.md)。經 detector 與完整畫面審查修正內容契約、文字對比及控制圖示後，最終 disposition 為 `ship`。目前等待選定方向，狀態維持 `draft`；尚未製作手機稿、Vue、Sanity schema 或正式內容。
- 2026-10-16：使用者指定保留第一輪 B 的大標題＋右側直幅圖首區，其餘重新設計，並以舊站〈來自尼騰 Neeten 的分享（一）〉驗證「小標＋連續段落、正文無圖片」情境。完成第二輪 A「靜水長讀」、B「頁邊節奏」、C「章節帶譜」三款 1440px 桌機稿；三案使用完全相同的首區，正文分別採連續長欄、左右對讀及全幅章節帶，且已縮短首區、正文與延伸閱讀的垂直間距。比較稿與截圖位於 [`articles-detail-text-concepts.html`](../design/articles-detail-text-concepts.html)及 [`review/articles-detail-text-concepts-desktop/`](../design/review/articles-detail-text-concepts-desktop/README.md)，detector 與完整畫面 finish review 的最終 disposition 為 `ship`。目前仍等待選案，狀態維持 `draft`；手機、Vue、Sanity schema 與正式內容皆未開始。
- 2026-10-16：依最新回饋完成第三輪 A「紙頁展卷」、B「日期軸線」、C「深色座標」三款 1440px 桌機稿。中央大標題、摘要與右側直幅代表圖保持一致；左側分別以暖砂資訊牌、日期主導軸及深赭座標面板呈現。正文三案均涵蓋 `mediaSide: start`、`mediaSide: end` 與 `wideImageSection`，分別採交替跨頁、圖片破邊與大片章幅。比較稿與六張截圖位於 [`articles-detail-media-concepts.html`](../design/articles-detail-media-concepts.html)及 [`review/articles-detail-media-concepts-desktop/`](../design/review/articles-detail-media-concepts-desktop/README.md)，首屏為 1440 × 1100、完整長頁為 1440 × 4300；finish review 最終 disposition 為 `ship`。三案仍未選定，狀態維持 `draft`；手機、Vue、Sanity schema 與正式內容皆未開始。
- 2026-10-16：使用者完成桌機組合選擇。新增 [`articles-detail-selected-desktop.html`](../design/articles-detail-selected-desktop.html)，可用頁首切換 `overlay` 橫圖滿版遮罩與 `split` 右側圖片窗；兩者共用 A 暖砂資訊牌。正文固定採 B 的破邊圖片軸線並移除分隔線；延伸閱讀移除深色底與日期，改為圖片、分類、標題、兩行摘要與閱讀按鈕。同步新增 `heroStyle` 契約與相關文章圖片有效性規則。四張 1440px 截圖與 swiper 互動量測位於 [`review/articles-detail-selected-desktop/`](../design/review/articles-detail-selected-desktop/README.md)，兩種完整長頁無水平溢位；最終 finish review disposition 為 `ship`，6 項發現均已解決，無部分解決或未解決項目。桌機方向已完成文件化，狀態仍為 `draft`；下一階段為 390px 手機、純文字最大長度壓力測試、`split` 無代表圖與無相關文章狀態，Vue 與 Sanity 尚未開始。
- 2026-10-16：依回饋補上桌機純文字 `richTextSection` 示意，使用章節標題與三個連續段落驗證無圖片文章。再次校正後將 `--paragraph-gap` 設為 `0px`，使所有正文維持 `16px / 2.1`、computed `33.6px` 的統一基線；純文字與圖文區塊共用桌機 `96px` 節奏。此修改只補足既有內容契約，不新增 CMS 欄位。
- 2026-10-16：在使用者授權後完成 390px 手機初稿。兩種 Hero、純文字、左右圖文、滿寬圖與單張 swiper 均回到自然文件流；手機區塊間距為 `64px`。另完成 `split` 無代表圖＋無相關文章組合狀態。首屏、完整長頁與狀態截圖位於 [`review/articles-detail-selected-desktop/`](../design/review/articles-detail-selected-desktop/README.md)；等待使用者確認後再更新為 `design-approved`。
- 2026-10-16：依手機稿檢視修正麵包屑交叉軸對齊、將 `.edge-body` 上內距歸零、把內容章節與延伸閱讀標題統一為 `26px`，並將 swiper 手動切換速度延長為 `1500ms`。同時更新全站詳情標題 token、課程／活動／執行師／心得規格及課程元件引用；Hero 展示標題與引言式 blockquote 不受此章節規則影響。Chromium 於 390px／1440px 量測確認三個麵包屑項目中心一致、無水平溢位、`padding-top: 0px`、標題 26px／38px、transition 1.5s 且 reduced motion 為 0s；Web 34 檔／190 項測試、typecheck 與 production build 通過。
- 2026-10-16：使用者確認可接續流程後完成 `build-ui-prototype`，狀態更新為 `frontend-ready`。新增共用型別、overlay／split／純文字／長內容 fixtures、`ArticleDetail` 與 `/articles/[slug]`；支援三種正文區塊、loading／error／not found、缺圖、無推薦、最長 30 區塊，以及 1／2／3 欄相關文章 swiper。Chromium 於 320、390、768、1023、1024、1440px 確認無水平溢位、單一 `h1`、圖片 alt 完整、控制至少 44px、正文 `16px / 33.6px`、手機標題 26px、swiper 1500ms／reduced motion 0s；最長 fixture 含 8 標籤、30 區塊、8 推薦，最小 fixture 無代表圖、只有純文字且不顯示推薦。已確認已知 slug 回應 200、未知 slug 回應 404；Web 35 檔／198 項測試、typecheck 與 production build 通過。證據位於 [`review/articles-detail-frontend-prototype/`](../design/review/articles-detail-frontend-prototype/README.md)；下一階段為 `verify-ui-behavior`，Sanity 與正式內容尚未開始。
- 2026-10-16：完成 `verify-ui-behavior`，狀態更新為 `ui-verified`。修正 swiper 的鍵盤 Tab 範圍、文章切換後索引重設、無 JavaScript 完整網格降級、reduced-motion specificity、狀態播報、SVG 控制圖示及非首屏圖片 lazy loading；新增可重複執行的 Chromium 驗證腳本。320、390、768、1023、1024、1440px 與 720px（1440px／200% 等效）均無水平溢位，單一 `h1`、正文 `33.6px`、手機 h2 26px、桌機 h2 38px、最小控制 44px、圖片 alt 完整，主要文字對比為 5.31–6.44:1。Enter 可切換 swiper、live region 與 disabled／Tab 狀態同步，reduced motion 為 0s；SSR 無 JavaScript 時 5 篇推薦皆可閱讀開啟。已知／未知 slug 分別為 200／404。Impeccable detector 為 0 個反模式，20 個 advisory 為核准的頁面角色字級與既有 Header 色階。Web 35 檔／199 項測試、typecheck、production build 與 `git diff --check` 通過；證據位於 [`review/articles-detail-ui-verified/`](../design/review/articles-detail-ui-verified/README.md)。下一階段為 `integrate-sanity-content`，尚未建立詳情 schema、API 或正式內容。
- 2026-10-18：完成 `integrate-sanity-content`，狀態更新為 `cms-integrated`。擴充同一份 `article` schema，加入 `heroStyle`、三種可排序正文區塊、受限 Portable Text、安全連結、0–8 篇人工排序延伸閱讀及 SEO／分享圖；新增 published perspective 的 slug GROQ、伺服器 API 與嚴格轉換層。前端不再以 fixture 作為主要資料，能區分 404、已發布核心資料無效與讀取失敗；失效、重複或自我引用的延伸閱讀只會被移除，不自動補位。Studio 26 項測試、Web 37 檔／207 項測試、兩端 typecheck、兩端 production build 與 `git diff --check` 通過；本機測試資料已覆蓋正常、空資料、無效資料、讀取失敗、安全 rich text、`split` 無圖及部分推薦失效。尚未部署 schema、修改遠端 dataset 或建立測試內容；下一階段為 `validate-content-flow`，需取得遠端操作授權後驗證草稿隔離、發布、匿名讀取、前台呈現與清理。
- 2026-10-18：production 唯讀診斷確認新文章「心與中線」已發布且 references 可匿名讀取；當時正文的 3 個空白 Portable Text blocks 會被嚴格 parser 視為核心契約無效，因此 SSR 正確顯示通用 error state 並輸出 `noindex`。後續依內容需求調整為正式支援一般空白段落，不再以 Studio validation 禁止此編輯方式。
- 2026-10-18：重新發布後空白 blocks 已移除，但 production projection 對一般段落未設定的 `listItem`／`level` 回傳 `null`；parser 原先只把 `undefined` 視為未設定，導致普通段落被誤判為無效清單。修正 parser 同時接受 `null` 與 `undefined`，並以 production 相同資料形狀加入回歸測試。此修正只影響前端資料轉換，不需要修改遠端文章內容或 schema。
- 2026-10-18：依編輯需求正式支援正文空白段落。Sanity 欄位說明標示每個空白一般段落呈現一行正文高度；parser 保留空白一般段落、仍拒絕空白標題與清單項目；前端以 `aria-hidden` 的空白 `<p>` 呈現 `33.6px` 留白。正文段落與清單項目明確套用 `16px`、`line-height: 2.1`、`letter-spacing: 0.025em`，避免跨元件 scoped styles 遺漏。Studio 27 項測試、Web 37 檔／210 項測試、兩端 typecheck 與 production build 均通過；Impeccable 為 0 個反模式，15 個 advisory 均來自既有且已核准的詳情頁角色字級。狀態維持 `cms-integrated`；正式站仍待部署 Web，Studio 欄位說明則待 schema 部署。
- 2026-10-18：優化 Studio「延伸閱讀」大量文章選取流程。Reference 項目改名為「推薦文章」，欄位說明標示搜尋、上限、排序與前台略過規則；候選清單支援搜尋標題、分類與 slug，自動排除目前文章及所有已選文章的 draft／published 文件組。預覽副標題補充分類、發布日期與 `/articles/{slug}`，方便辨識相似標題。新增 filter 與 schema 回歸測試；Studio 28 項測試、typecheck、production build 與 `git diff --check` 均通過，Impeccable 未回報反模式。狀態維持 `cms-integrated`；尚未部署 schema，部署後仍需以大量正式文章完成 Studio 實機驗收。
- 2026-10-18：加強前台延伸閱讀互動。卡片新增圖片裁切內縮放、標題／CTA 陶土色、箭頭位移及明確 focus ring；切換控制補齊 hover／active 回饋，多篇內容顯示可動態同步的範圍與細線進度，手機加入 48px 且需以水平位移為主的 swipe 判定，避免攔截垂直捲動。reduced motion 取消所有新增空間位移但保留色彩與焦點。Web 37 檔／211 項測試、typecheck、production build 與 `git diff --check` 通過，Impeccable 為 0 個反模式；本機 production 的 `/articles/heart` 回應 200，但目前正式資料沒有可呈現的延伸閱讀，因此真實內容的瀏覽器互動仍待部署後驗收。


#### 筆記，不需要執行，可忽略
- 使用 `$develop-feature` 從 web/docs/specs/articles-detail.md 接續下一個流程
