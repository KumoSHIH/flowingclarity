# 學員心得分享共用元件規格

**狀態：** frontend-prototype；桌機與手機版型已確認並建立 Vue 共用元件，尚未建立 schema、GROQ、API 或課程詳情整合。

## 使用範圍與前台契約

`sharedTestimonialBlock` 可加入活動詳情與課程詳情的可排序內容陣列，並可在同一頁自由新增多次。每個區塊固定顯示「學員心得分享」，公開內容只包含心得文字與分享者名稱；不顯示照片、評分、身分、課程名稱或成效標籤。區塊依頁面編排順序出現，無有效心得時整段省略，不留下空標題。

桌機三款決策稿位於 `docs/design/student-testimonial-concepts.html`：A「連續長卷」依序呈現所有心得；B「雙欄書頁」以兩欄閱讀；C「姓名索引」由姓名切換單則內容。三款使用相同 DOM 資料契約；桌機最終選用內嵌式單欄連續閱讀。

因心得可能是長文，最終方向採 A 的單欄連續閱讀，但作為既有內容頁中的內嵌區塊，而非獨立頁面構圖。活動詳情 B「固定邊欄」的接續情境稿位於 `docs/design/student-testimonial-in-context.html`：左側活動資訊維持不變，心得接在右側介紹、帶領者與流程之後；不截字、不收合、不輪播。使用者已於 2026-10-13 確認桌機結構，並要求移除前台說明文字、縮小所有內容區大標；390px／320px 手機版型亦已完成確認與實機驗證。

## Sanity 後台設計

建議只建立一份共用 object schema，讓 `courseDetailContent.body` 與未來 `eventDetail.body` 引用，避免兩套欄位與驗證逐漸分歧。不建立獨立 testimonial document：心得通常只屬於特定課程或活動，嵌入區塊能讓編輯者直接拖曳排序，也避免跨頁引用被修改後同步改寫既有頁面。

| 路徑 | 型態 | 編輯與驗證規則 |
|---|---|---|
| `sharedTestimonialBlock.items` | array | 必填 1–12 筆；可新增、刪除與拖曳排序 |
| `items[].text` | text | 必填 20–500 字；保留人工換行；前後空白需正規化 |
| `items[].sharerName` | string | 必填 2–40 字；使用已同意公開的顯示名稱，可填「匿名學員」 |
| `items[].consentConfirmed` | boolean | 後台必填且必須為 `true` 才可發布；前台與 API 不輸出 |

同一區塊不得出現正規化後完全相同的 `text + sharerName`。Studio preview 顯示第一則姓名、文字摘要與總筆數；新增項目預設 `consentConfirmed: false`，避免尚未確認內容被誤發布。不增加 layout 欄位：版型是全站元件決策，不應由每位編輯者任意混搭。

## 查詢、型別與安全

Sanity／伺服器內部查詢項目可含 `_key`、`text`、`sharerName` 與 `consentConfirmed`，供排序、驗證與穩定渲染使用；這不是公開契約。GROQ 必須把 `consentConfirmed` 送入伺服器 parser，parser 拒絕空字串、超長內容、`consentConfirmed !== true` 或重複項目，確認後再移除 `_key` 與 `consentConfirmed`。公開 API 的 `items[]` 必須恰好只有 `{ text, sharerName }`，不得輸出其他欄位。前端使用 `section`、區塊 `h2`、`blockquote` 與 `cite`，單欄排列不加入額外切換操作。

心得可能涉及個人經驗，內容不得補寫療效、資格、疾病或可識別個資。正式上線前需驗證草稿隔離、發布／取消發布、匿名讀取、兩種詳情頁混排、長短文字、1／12 筆、重複拒絕、缺同意拒絕及內容清除。現階段已完成規格、桌機確認稿、390px／320px 手機首版與 `SharedTestimonials.vue` 前端原型；以上遠端流程不得記為已驗證。

## 下一階段

活動詳情前端原型已完成實機畫面與行為驗證；下一步新增共用 Studio schema、GROQ 投影、parser 與兩頁內容編排器選項。共享前端型別與 Vue 元件原型已建立；課程詳情已是 production schema，任何新增都必須另跑既有課程文件相容性驗證。

## 驗證紀錄

2026-10-13 已以 Chrome 檢查三案的 1280×900 與 1440×1000 桌機畫面，六組均無水平溢位、自託管字體載入，且可見操作項目最小高度為 54px。C 案的方向鍵切換已確認選取、焦點與面板同步；三張完整頁截圖與數值位於 `docs/design/review/student-testimonial-concepts-desktop/`。Impeccable detector 執行一次並修正過小輔助文字與資訊列內距。

同日新增活動詳情 B 的內容接續示意。使用者確認後，心得正文改為與課程介紹相同的 16px／2.1 行距，並完成 390px／320px 手機首版。1440px、390px 與 320px 均無水平溢位、兩則長文與名稱完整、心得區無圖片；證據位於 `docs/design/review/student-testimonial-in-context-desktop/`。其後已建立相同契約的 Vue 原型；本紀錄不代表 schema、API 或 production 內容流已完成。

同日完成 Vue 原型驗證：1440×1000、390×844 與 320×720 三組瀏覽器量測均顯示 2 則心得、2 個 `cite`、0 張圖片與零水平溢位；心得正文和課程介紹同為 16px，桌機標題 38px、手機 32px。元件測試另覆蓋長文完整呈現、無輪播／切換控制與空陣列省略。證據位於 `.impeccable/review/event-detail-frontend-prototype/`；課程詳情與 production 內容流仍未接入。
