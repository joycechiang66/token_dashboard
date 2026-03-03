# Token Dashboard (AI Token 使用監控面板)

這是一個專為企業或團隊設計的 **AI Token 使用量監控與成本分析儀表板**。透過直觀的數據視覺化，協助管理者追蹤各部門、專案及員工的 Token 消耗、成本效益與使用趨勢，進而優化 AI 資源的分配與預算管理。

## 🚀 專案特點

*   **全方位數據監控**：即時查看總 Token 使用量、成本預估及模型分佈。
*   **智慧預算警示系統**：
    *   **全域監控**：自動偵測公司整體與各部門的預算使用率。
    *   **即時提醒**：當預算使用超過 80% (警告) 或 100% (超支) 時，於首頁與成本分析頁面顯示醒目提示。
*   **多維度分析**：
    *   **部門視角**：比較各部門 (如雲端服務部、系統業務部、專案部等) 的消耗與效率。
    *   **員工視角**：深入了解每位成員的使用習慣與效率排名。
    *   **時間視角**：支援自訂日期範圍篩選 (最近 7/14/30 天)。
*   **互動式圖表**：整合 Chart.js 提供清晰的趨勢圖與分佈圖。
*   **詳細報表匯出**：支援將數據匯出為 CSV 格式，方便報表製作。
*   **響應式設計 (RWD)**：完美支援 Desktop、Tablet 與 Mobile 裝置瀏覽。
*   **現代化 UI/UX**：包含深色模式 (Dark Mode) 切換與流暢的動畫效果。
*   **角色權限管理 (RBAC)**：
    *   **管理員 (Admin)**：擁有完整權限，包含預算設定與數據分析。
    *   **一般用戶 (User)**：僅供查看統計數據，無法修改設定。

## 🔐 測試帳號

為方便測試功能，系統預設提供兩組帳號：

| 角色 | 帳號 | 密碼 | 權限說明 |
| :--- | :--- | :--- | :--- |
| **管理員** | `admin` | `admin123` | 可查看所有數據，**可設定預算**。 |
| **一般用戶** | `user` | `user123` | 僅可查看數據，**無法設定預算**。 |

## � Token 計費標準

本專案使用以下費率計算成本（單位：每 Token 美金價格）：

| 模型 (Model) | Input 費率 | Output 費率 |
| :--- | :--- | :--- |
| **GPT-4** | 0.00003 | 0.00006 |
| **GPT-3.5** | 0.0000005 | 0.0000015 |
| **Claude** | 0.000008 | 0.000024 |
| **Gemini** | 0.00001 | 0.00002 |
| **Llama-2** | 0.0000005 | 0.0000015 |
| **Mistral** | 0.00001 | 0.00003 |
| **Qwen** | 0.000005 | 0.000015 |
| **Yi** | 0.000003 | 0.000009 |

> 註：未列出之模型將採用預設費率 (Input: 0.00001 / Output: 0.00003)。

## �🛠️ 技術棧

本專案採用現代化的前端技術構建：

*   **核心框架**: [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`)
*   **語言**: [TypeScript](https://www.typescriptlang.org/)
*   **建置工具**: [Vite](https://vitejs.dev/)
*   **樣式與 UI**: [Tailwind CSS 4](https://tailwindcss.com/)
*   **狀態管理**: [Pinia](https://pinia.vuejs.org/) (Auth, Budget Store)
*   **路由**: [Vue Router 4](https://router.vuejs.org/) (含路由守衛)
*   **圖表**: [Chart.js](https://www.chartjs.org/) + [vue-chartjs](https://vue-chartjs.org/)
*   **工具庫**: 
    *   `date-fns` (日期處理)

## 📂 專案結構

```
token_dashboard/
├── src/
│   ├── components/      # 共用元件 (TopBudgetAlert, ThemeToggle, MultiSelectDropdown)
│   ├── composables/     # 組合式函數 (useBudgetAlerts, useChartTheme)
│   ├── pages/           # 頁面組件 (Home, DepartmentDetail, CostAnalysis, Login)
│   ├── router/          # 路由配置 (含權限驗證)
│   ├── stores/          # Pinia 狀態管理 (auth, budgetStore)
│   ├── types/           # TypeScript 型別定義
│   ├── utils/           # 工具函數 (Mock數據, 計算邏輯, 匯出功能)
│   ├── App.vue          # 根組件
│   └── main.ts          # 入口文件
├── server/              # 後端 API (Express, Optional)
└── index.html
```

## 📦 安裝與執行

確保您的環境已安裝 [Node.js](https://nodejs.org/) (建議 v18+) 與 [pnpm](https://pnpm.io/)。

1.  **複製專案**
    ```bash
    git clone https://github.com/joycechiang66/token_dashboard.git
    cd token_dashboard
    ```

2.  **安裝依賴**
    ```bash
    pnpm install
    ```

3.  **啟動開發伺服器**
    ```bash
    npm run dev
    ```
    啟動後，瀏覽器打開 `http://localhost:3000` 即可查看。

4.  **建置生產版本**
    ```bash
    npm run build
    ```
    建置後的檔案將位於 `dist/` 目錄。

## 🧪 程式碼檢查

本專案配置了 TypeScript 類型檢查：

```bash
npm run check
```

## 📝 License

MIT License
