---
name: develop-feature
description: 協調 Flowing Clarity Web 功能從規格、設計、假資料實作、UI 驗證、Sanity 串接到發布驗收。適用於完整流程或從既有階段接續；不取代各階段 Skill。
---

# Develop Feature

依功能規格協調六個階段，只載入目前需要的 Skill，不複製其操作細節。

## 判斷起點

閱讀 `AGENTS.md`、`web/AGENTS.md`，找出目標功能規格及相關程式。規格狀態是導覽線索，實際產出與驗證結果才是門檻；若兩者不一致，從最早缺少證據的階段接續並指出差異。

| 完成狀態 | 下一個 Skill |
| --- | --- |
| 無規格或 `draft` 尚不完整 | `define-feature-spec` |
| `draft` 且規格足以設計 | `shape-ui-direction` |
| `design-approved` | `build-ui-prototype` |
| `frontend-ready` | `verify-ui-behavior` |
| `ui-verified` | `integrate-sanity-content` |
| `cms-integrated` | `validate-content-flow` |
| `verified` | 停止並回報已完成 |

## 協調規則

1. 從 `web/.agents/skills/<skill-name>/SKILL.md` 讀取並執行下一階段；不要一次載入六份 Skill。
2. 階段完成後重讀功能規格，確認該 Skill 的產出、驗證與狀態門檻都成立，再進入下一階段。
3. 沒有待選設計、缺少必要內容或外部變更授權時，自動繼續後續階段；不要在例行交接點要求確認。
4. 設計方向需要使用者選擇時停在 `shape-ui-direction`。部署 schema、修改遠端 dataset 或發布測試內容前，只有尚未獲得該具體授權時才詢問。
5. 任一檢查失敗時保留目前狀態，修正本次工作造成的問題並重跑相關檢查；無法在範圍內解決時，回報缺少的門檻與可執行的下一步。
6. 尊重使用者指定的終點；若只要求完成某一階段，到達該門檻即停止。

## 每次交接

簡短列出功能、開始狀態、本次完成階段、實際驗證、目前狀態及下一階段。不要把未執行的人工或遠端驗收寫成已完成。
