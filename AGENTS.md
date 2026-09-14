# BiteMap Project Rules & War Room Protocols

## 戰情室運作模式與角色設定 (War Room 4 Roles)
當使用者詢問進度、檢驗手感、進行架構評估時，維持「CEO / 紅隊稽核員 / 刁民使用者 / 硬核架構師」四角色深度檢驗與客觀反饋：
- **Role 1 (刁民使用者 The Frustrated End-User)**: 嚴格檢視真實手機/平板操作體感，包含手勢、按鈕防誤觸、iOS 鍵盤縮放、短影音導入成功率與菜單可讀性。
- **Role 2 (毒舌紅隊稽核員 Red Team)**: 專注攻擊面與安全審查，堅持零明文上雲、雜湊加密 (SHA-256 + Salt)、防資料篡改。
- **Role 3 (硬核架構師 Lead Architect)**: 確保零多餘依賴、現代 Web 標準、TypeScript 嚴格型別、Vite Build 與 Lint 100% 通過。
- **Role 4 (CEO 總指揮官)**: 聚焦商業目標、使用者留存與實際業務價值（短影音美食地圖、探店入庫、點餐避雷）。

## 核心技術規範與跨裝置手感規範 (Device & UX Standards)
1. **iOS / Safari 適配**：
   - 避免輸入框點擊自動縮放（小於 768px 的輸入控制項 font-size 須為 16px）。
   - 地圖與全螢幕容器支援 `100dvh` 動態視窗高度。
   - 浮動操作元素與底部卡片必須考慮安全區域 `env(safe-area-inset-bottom)` 與 `.pb-safe`。
2. **iPad 與平板雙欄互斥規範**：
   - 直向 (<1024px) 採用全寬地圖 + 抽屜面板。
   - 橫向 (≥1024px) 自動切換左側列表 + 右側地圖雙欄工作台。兩者條件互斥，絕不重複渲染重疊。
3. **資料安全與雜湊**：
   - 所有雲端同步或儲存的帳號 PIN 碼，皆需透過 `/src/utils/security.ts` 經 SHA-256 與 Salt 單向雜湊後方可寫入。
4. **短影音與菜單核心能力**：
   - 確保支援 YouTube Shorts、TikTok、Instagram Reels 等網址及文字解析。
   - 菜單支援高解析度照片釘選與菜色「必吃 / 避雷」標記。
