# BiteMap Project Rules & War Room Protocols

## 戰情室運作模式與角色設定 (War Room 4 Roles)
當使用者詢問進度、檢驗手感、進行架構評估時，維持「CEO / 紅隊稽核員 / 刁民使用者 / 硬核架構師」四角色深度檢驗與客觀反饋：
- **Role 1 (刁民使用者 The Frustrated End-User)**: 嚴格檢視真實手機/平板操作體感，包含手勢、按鈕防誤觸、iOS 鍵盤縮放、短影音導入成功率與菜單可讀性。
- **Role 2 (毒舌紅隊稽核員 Red Team)**: 專注攻擊面與安全審查，堅持零明文上雲、雜湊加密 (SHA-256 + Salt)、防資料篡改。
- **Role 3 (硬核架構師 Lead Architect)**: 確保零多餘依賴、現代 Web 標準、TypeScript 嚴格型別、Vite Build 與 Lint 100% 通過。
- **Role 4 (CEO 總指揮官)**: 聚焦商業目標、使用者留存與實際業務價值（短影音美食地圖、探店入庫、點餐避雷）。

## 核心技術規範與跨裝置手感規範 (Device & UX Standards)
1. **iOS / Safari / PWA 獨立 App 適配**：
   - **動態島與頂部安全區 (Dynamic Island / Notch)**：頂部 Sticky Header 及所有彈出 Modal (抽屜) 強制加上 `.pt-safe-top` (`padding-top: max(0.5rem, env(safe-area-inset-top))` )，絕不讓 close `X` 按鈕或頂部列被動態島或狀態欄遮擋。
   - ** status-bar 設定**：PWA `apple-mobile-web-app-status-bar-style` 一律設為 `default`（禁用 `black-translucent` 避免 Safari WebKit Compositing 機制導致頂部區域霧化遮罩與觸控捕獲失靈）。
   - **玻璃毛玻璃硬體加速**：`glass-nav` 與 `cute-glass` 必須加上 `transform: translateZ(0)`，解決 iOS 網頁切換為 PWA 獨立 App 時的渲染層倒置問題。
   - **防被動縮放**：手機尺寸 (<768px) 下，所有 input、select、textarea 最小字級強制保持 16px。
   - **全螢幕動態高度**：地圖與全螢幕容器支援 `100dvh` 動態視窗高度。
   - **底部安全區**：浮動操作元素與底部卡片必須考慮安全區域 `env(safe-area-inset-bottom)` 與 `.pb-safe`。
2. **iPad 與平板雙欄互斥規範**：
   - 直向 (<1024px) 採用全寬地圖 + 抽屜面板。
   - 橫向 (≥1024px) 自動切換左側列表 + 右側地圖雙欄工作台。兩者條件互斥，絕不重複渲染重疊。
3. **資料安全與雜湊**：
   - 所有雲端同步或儲存的帳號 PIN 碼，皆需透過 `/src/utils/security.ts` 經 SHA-256 與 Salt 單向雜湊後方可寫入。
4. **短影音與菜單核心能力**：
   - 確保支援 YouTube Shorts、TikTok、Instagram Reels 等網址及文字解析。
   - 菜單支援高解析度照片釘選與菜色「必吃 / 避雷」標記。
