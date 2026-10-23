# 學員心得分享共用元件規格

**狀態：** 活動詳情已完成 production 驗收；課程詳情的共用 Vue 元件、schema、GROQ、parser 與 renderer 已於本機完成，更新後的 production 內容流仍待驗證。

## 使用範圍與前台契約

`sharedTestimonialBlock` 可加入活動詳情與課程詳情的可排序內容陣列。活動可依內容需要重複新增，課程每頁最多一個。每個區塊固定顯示「學員心得分享」，公開內容只包含心得文字與分享者名稱；不顯示照片、評分、身分、課程名稱或成效標籤。區塊依頁面編排順序出現，無有效心得時整段省略，不留下空標題。

桌機三款決策稿位於 `docs/design/student-testimonial-concepts.html`：A「連續長卷」依序呈現所有心得；B「雙欄書頁」以兩欄閱讀；C「姓名索引」由姓名切換單則內容。三款使用相同 DOM 資料契約；桌機最終選用內嵌式單欄連續閱讀。

因心得可能是長文，最終方向採 A 的單欄連續閱讀，但作為既有內容頁中的內嵌區塊，而非獨立頁面構圖。活動詳情 B「固定邊欄」的接續情境稿位於 `docs/design/student-testimonial-in-context.html`：左側活動資訊維持不變，心得接在右側介紹、帶領者與流程之後；不截字、不收合、不輪播。使用者已於 2026-10-13 確認桌機結構，並要求移除前台說明文字、縮小所有內容區大標；390px／320px 手機版型亦已完成確認與實機驗證。

## Sanity 後台設計

建議只建立一份共用 object schema，讓 `courseDetailContent.body` 與未來 `eventDetail.body` 引用，避免兩套欄位與驗證逐漸分歧。不建立獨立 testimonial document：心得通常只屬於特定課程或活動，嵌入區塊能讓編輯者直接拖曳排序，也避免跨頁引用被修改後同步改寫既有頁面。

| 路徑 | 型態 | 編輯與驗證規則 |
|---|---|---|
| `sharedTestimonialBlock.items` | array | 必填 1–12 筆；可新增、刪除與拖曳排序 |
| `items[].text` | text | 必填 20–500 字；保留人工換行；前後空白需正規化 |
| `items[].sharerName` | string | 必填 2–40 字；使用已核准的公開顯示名稱，可填「匿名學員」 |

同一區塊不得出現正規化後完全相同的 `text + sharerName`。Studio preview 顯示第一則姓名、文字摘要與總筆數。不增加公開同意或 layout 欄位：內容核准屬編輯流程，版型是全站元件決策，不應由每位編輯者任意混搭。

## 查詢、型別與安全

Sanity／伺服器內部查詢項目只需 `_key`、`text` 與 `sharerName`，供排序、驗證與穩定渲染使用；公開 API 的 `items[]` 必須恰好只有 `{ text, sharerName }`，不得輸出其他欄位。前端使用 `section`、區塊 `h2`、`blockquote` 與 `cite`，單欄排列不加入額外切換操作。

心得可能涉及個人經驗，內容不得補寫療效、資格、疾病或可識別個資；內容負責人須在輸入 CMS 前完成公開授權與文案核准。活動詳情已驗證草稿隔離、兩次發布、匿名讀取與內容清除；課程詳情已於本機驗證混排、單一區塊限制與解析，仍需在 production 驗證長短文字、1／12 筆、重複拒絕、既有文件相容性及完整還原。

## 下一階段

活動詳情已完成 Studio schema、GROQ 投影、parser、published-only API 與 production 內容流驗收；`sharedTestimonialBlock` 可在活動內頁編排中重複加入，前台只投影心得文字與分享者名稱。課程詳情已在本機接入同一 schema 與 renderer，並限制每頁最多一個；下一步是部署 schema 並以隔離內容驗證既有 production 課程文件相容性。

## 驗證紀錄

2026-10-13 已以 Chrome 檢查三案的 1280×900 與 1440×1000 桌機畫面，六組均無水平溢位、自託管字體載入，且可見操作項目最小高度為 54px。C 案的方向鍵切換已確認選取、焦點與面板同步；三張完整頁截圖與數值位於 `docs/design/review/student-testimonial-concepts-desktop/`。Impeccable detector 執行一次並修正過小輔助文字與資訊列內距。

同日新增活動詳情 B 的內容接續示意。使用者確認後，心得正文改為與課程介紹相同的 16px／2.1 行距，並完成 390px／320px 手機首版。1440px、390px 與 320px 均無水平溢位、兩則長文與名稱完整、心得區無圖片；證據位於 `docs/design/review/student-testimonial-in-context-desktop/`。其後已建立相同契約的 Vue 原型；本紀錄不代表 schema、API 或 production 內容流已完成。

同日完成 Vue 原型驗證：1440×1000、390×844 與 320×720 三組瀏覽器量測均顯示 2 則心得、2 個 `cite`、0 張圖片與零水平溢位；心得正文和課程介紹同為 16px。元件標題改為共用 `--detail-section-title-size`，桌機 38px、手機 26px；2026-10-16 另以 390px 活動 fixture 頁確認心得標題為 26px、寬 342px、右界 366px，既有 34px 下內距與底線完整且無水平溢位，最新證據位於 [`review/detail-heading-token-mobile/`](../design/review/detail-heading-token-mobile/README.md)。元件測試另覆蓋長文完整呈現、無輪播／切換控制與空陣列省略；課程詳情與 production 內容流仍未接入。

2026-10-22 依活動詳情修正清單移除共用元件標題下底線，並讓最後一筆 `blockquote` 不顯示下分隔線；此變更同步套用活動與課程詳情。回歸測試與 Web 全套 242 項測試、typecheck、production build 均通過；因 Computer Use 服務無法啟動，既有 2026-10-16 截圖不代表新版分隔線狀態，桌機／手機畫面仍待重驗。

同日完成活動詳情 production 內容流驗收：已確認更新草稿發布前不會取代公開版本，再次發布後輸出心得文字與分享者名稱。測試文件已完整清除，畫面與流程紀錄位於 `docs/design/review/events-detail-content-flow/`。此結果不代表課程詳情整合已完成。

同日依後台使用回饋移除「已確認公開同意」欄位及發布驗證；既有 production 文件中的舊欄位已清除。公開授權仍是內容核准責任，但不再於每則心得重複設定 CMS 開關。

2026-10-20 完成課程詳情本機整合：`courseDetailContent.body` 接受 `sharedTestimonialBlock`，自訂驗證阻擋第二個心得區塊；GROQ、共用型別、parser 與 `SharedTestimonials` renderer 均已接入。Web 與 Studio 回歸測試通過，Chrome 於 1440px／390px 確認版面無水平溢位；尚未部署更新後 schema 或執行 production 內容流。
