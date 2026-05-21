# Codex 使用情境圖鑑 · Codex Use Cases

> OpenAI Codex 全部 **52 個官方使用情境**的中英對照互動圖鑑。
> An interactive, searchable, **bilingual (中 / EN)** gallery of every official OpenAI Codex use case.

純靜態網頁 — HTML + CSS + 一支 JS，無 build step、無相依套件。採 **Material Design 3** 視覺語言（Google 風格），支援亮 / 暗色、語言切換、分類篩選、全文搜尋、詳情彈窗與可分享的深連結。

A pure static site — HTML + CSS + one JS file, no build step, no dependencies. Styled with **Material Design 3**, with light/dark themes, a language toggle, category filters, full-text search, a detail dialog, and shareable deep links.

---

## ✨ 功能 · Features

- **中英對照** — 右上角一鍵切換中文 / English，記憶你的偏好（localStorage）。
- **52 個使用情境** — 每個都含：概述、適用時機、運作步驟、可照抄的範例 prompt（附一鍵複製）。
- **8 大分類篩選** — 生產力與自動化、工程開發、前端與設計、行動與原生 App、資料與分析、知識工作、品質與測試、財務。
- **即時搜尋** — 跨中英標題、摘要、標籤同時比對。
- **詳情彈窗** — 支援鍵盤 ←/→ 切換、Esc 關閉、焦點管理。
- **可分享深連結** — 開啟任一情境後網址會帶上 `#slug`，貼給別人就能直接打開那一張卡片。
- **亮 / 暗主題** — 預設跟隨系統，可手動切換。

---

## 🚀 在本機看 · Run locally

因為資料是用 `<script>` 載入（`window.USE_CASES`），直接打開檔案也能跑：

```bash
# 方式一：直接開檔
open index.html

# 方式二：起一個本機伺服器（某些瀏覽器對 file:// 較嚴格時建議）
python3 -m http.server 4173
# 然後開 http://localhost:4173/
```

---

## 🌐 放上 GitHub Pages · Deploy to GitHub Pages

這是純靜態站，最適合 GitHub Pages。步驟：

1. **建立 repo 並推上去**（在本資料夾內）：
   ```bash
   git add -A
   git commit -m "feat: bilingual Codex use-cases gallery"
   git branch -M main
   git remote add origin https://github.com/<你的帳號>/<repo 名>.git
   git push -u origin main
   ```

2. **開啟 Pages**：到 GitHub repo → **Settings** → **Pages** →
   **Source** 選 `Deploy from a branch` → **Branch** 選 `main` / `/ (root)` → **Save**。

3. 等一兩分鐘，網址會是：
   ```
   https://<你的帳號>.github.io/<repo 名>/
   ```

> 倉庫已內含空的 `.nojekyll` 檔，確保 GitHub Pages 不會用 Jekyll 處理、`assets/` 與 `data/` 都能正常載入。

也可一鍵丟到 **Vercel / Netlify / Cloudflare Pages** — 不需任何 build 設定，根目錄就是輸出。

---

## 🗂 專案結構 · Project layout

```
.
├── index.html            # 網頁外殼（內容由 JS 動態渲染）
├── assets/
│   ├── styles.css        # Material Design 3 樣式（亮/暗色 token、卡片、chips、dialog）
│   └── app.js            # i18n、搜尋、篩選、詳情彈窗、ripple、主題、深連結
├── data/
│   ├── use-cases.js      # ⭐ 正式資料：window.USE_CASES（52 筆，中英雙語）
│   ├── merge.js          # 把 chunks 合併成 use-cases.js 的腳本
│   └── chunks/           # 原始爬取/翻譯的分批 JSON（建置素材）
├── .nojekyll             # 讓 GitHub Pages 原樣提供靜態檔
└── README.md
```

### 重新產生資料 · Regenerate the data

`data/use-cases.js` 是由 `data/chunks/*.json` 經 `data/merge.js` 產生的。改完 chunks 後：

```bash
node data/merge.js
```

腳本會驗證 52 筆齊全、套用分類對照、清除難度/時間雜訊標籤，再輸出 `window.CODEX_CATEGORIES` 與 `window.USE_CASES`。

---

## 📝 內容來源與授權 · Source & license

- 內容整理 / 翻譯自 OpenAI 官方文件：<https://developers.openai.com/codex/use-cases>
- 本專案為**非官方**的中英對照學習用整理。Codex、ChatGPT、OpenAI 等名稱及其內容權利屬 OpenAI 所有。
- 本倉庫的呈現方式（版面、程式碼、翻譯）以 MIT License 釋出。
