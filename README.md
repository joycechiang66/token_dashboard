# Token Dashboard

這是一個專為企業內部 AI 使用管理設計的 **Token 使用監控面板**。目前產品主軸聚焦在首頁總覽與部門明細，協助管理者追蹤各部門與員工的 Token 使用量、部門分布與預算使用風險。

## 專案現況

- 首頁提供公司整體 Token 使用概況、部門 Token 排名、部門卡片總覽、Token 使用率視覺條與預算警示。
- 部門頁提供部門層級統計、模型 Token 分佈、員工 Token 排名與員工明細匯出。
- 系統已移除獨立的「費用分析」頁面與「預算設定」介面。
- 舊路由 `/cost-analysis` 與 `/fee-analysis` 會自動導回首頁。

## 主要功能

- **Token 使用總覽**：查看總 Token、輸入 Token、輸出 Token、部門數量與員工總數。
- **Token 用量提醒**：當公司或部門用量對應的使用率超過 80% 時，首頁顯示 Token 用量提醒；超過 100% 時顯示高用量警示。
- **部門 Token 排名**：依總 Token 使用量檢視各部門的活躍度排序。
- **部門卡片視覺條**：首頁各部門卡片以視覺條呈現 Token 使用率，並顯示已使用 Token 與可用 Token。
- **部門明細檢視**：可深入查看單一部門的 Token 使用、模型 Token 分佈、員工 Token 排名與使用紀錄。
- **條件篩選**：支援最近 7 / 14 / 30 天與模型條件篩選。
- **CSV 匯出**：支援公司摘要、部門摘要與員工詳細紀錄匯出。
- **響應式介面**：支援桌機、平板與手機使用。
- **深色模式**：提供淺色 / 深色主題切換。

## 測試帳號

系統預設提供以下帳號：

| 角色 | 帳號 | 密碼 | 權限說明 |
| :--- | :--- | :--- | :--- |
| 管理員 | `admin` | `admin123` | 可查看所有儀表板與部門明細。 |
| 一般用戶 | `user` | `user123` | 可查看統計資料。 |

## 企業費用模型

本專案目前採用 **企業內部台幣費率模型**，依各模型的每 1000 Token 內部費率計算預估費用。

| 模型 | 輸入費率（每 1000 Token / NT$） | 輸出費率（每 1000 Token / NT$） |
| :--- | :--- | :--- |
| GPT-4 | 28 | 56 |
| GPT-3.5 | 4 | 8 |
| Claude | 18 | 36 |
| Gemini | 14 | 28 |
| Llama-2 | 3 | 6 |
| Mistral | 10 | 20 |
| Qwen | 8 | 16 |
| Yi | 6 | 12 |

> 註：未列出的模型會使用預設費率，輸入 `NT$12 / 1000 Token`、輸出 `NT$24 / 1000 Token`。

## 預算與警示

- 系統內建公司與部門月預算資料，供首頁 Token 用量提醒與使用率判斷使用。
- 預算資料儲存在瀏覽器 `localStorage`，key 為 `token-dashboard-fee-budget-v2`。
- 目前沒有前台預算編輯介面，如需調整可修改 `src/stores/budgetStore.ts` 內的預設值，或清除瀏覽器本地儲存後重新載入。

## Token 配額雛型資料

- 首頁部門卡片的 Token 使用率視覺條，現階段使用 `Home.vue` 內的假資料 `departmentTokenQuotaMap` 做雛型展示。
- 每個部門都會顯示 `已用 Token / 可用 Token`，並依使用率套用綠色、黃色、紅色視覺狀態。
- 後續若串接後台，可直接將這組假資料替換為 API 或設定資料來源。

## 技術棧

- **核心框架**：[Vue 3](https://vuejs.org/)（Composition API + `<script setup>`）
- **語言**：[TypeScript](https://www.typescriptlang.org/)
- **建置工具**：[Vite](https://vitejs.dev/)
- **樣式系統**：[Tailwind CSS 4](https://tailwindcss.com/)
- **狀態管理**：[Pinia](https://pinia.vuejs.org/)
- **路由**：[Vue Router 4](https://router.vuejs.org/)
- **後端服務**：[Express](https://expressjs.com/)

## 專案結構

```text
token_dashboard/
├── src/
│   ├── components/      # 共用元件（警示、日期、下拉選單、分頁、主題切換）
│   ├── composables/     # 組合式函數（預算警示等）
│   ├── pages/           # 頁面組件（Home、DepartmentDetail、Login、NotFound）
│   ├── router/          # 路由配置與權限驗證
│   ├── stores/          # Pinia 狀態（auth、budgetStore）
│   ├── types/           # TypeScript 型別
│   ├── utils/           # 計算、模擬資料、CSV 匯出等工具
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── server/
└── index.html
```

## 安裝與執行

請先安裝 [Node.js](https://nodejs.org/)（建議 v18 以上）與 [pnpm](https://pnpm.io/)。

1. 複製專案

```bash
git clone https://github.com/joycechiang66/token_dashboard.git
cd token_dashboard
```

2. 安裝依賴

```bash
pnpm install
```

3. 啟動開發環境

```bash
pnpm dev
```

4. 建置正式版本

```bash
pnpm run build
```

## 程式碼檢查

```bash
pnpm run check
```

## License

MIT
