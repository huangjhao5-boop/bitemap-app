# 🥢 BiteMap — 短影音美食地圖 & 吃貨朋友圈系統 (BiteMap App)

> 結合 **Google Maps 導航**、**網路各平台短影音（IG Reels / TikTok / YouTube Shorts / 小紅書）探店來源**、**誠實造訪履歷（必吃招牌 vs 特定雷菜）**、**吃貨朋友圈口味手冊**、**美食盲盒抽籤**、**聚餐分帳轉盤**、**IG 限動小卡下載** 與 **中日雙語（🇹🇼 / 🇯🇵）** 的全方位美食地圖系統！

---

## 🌟 核心特色功能

1. **🗺️ 雙欄美食地圖 & 側邊文字清單**
   - 左側直列過濾店家、即時距離標籤（例如 `📍 450m`）、評分定位徽章。
   - 點擊店家立即**平滑飛移（FlyTo）**至地圖位置並彈出詳細氣泡。
   - 一鍵開啟 Google Maps 官方 App / 網頁路線導航。
2. **📱 沉浸式短影音流（依 GPS 當前位置由近到遠排序）**
   - 依據目前真實 GPS 或所在城市（台北/東京/大阪等），自動使用 Haversine 演算法**由最近到最遠**排序所有短影音美食！
   - 直向全螢幕滑動探店、一鍵開啟影片播放。
3. **🪄 短影音 AI 智能一鍵解析自動填入**
   - 貼上 IG Reels / TikTok 網址或社群貼文文案，AI 自動抽取店名、分類、城市、地址、必吃菜色與短影音來源。
4. **💥 雙層次「不會再吃第二次」誠實履歷**
   - **店家層級**：🔥 超推必吃 / 🔄 常去愛店 / 📌 口袋名單 / 😐 普通 / ☠️ 整間店列入黑名單（永久封殺）。
   - **餐點層級**：🌟 此店必點招牌 vs ❌ 此店特定雷菜（千萬別點這道）。
5. **🎁 美食盲盒抽籤機（同行好友忌口守護盾）**
   - 勾選今天同行聚餐的朋友，系統自動整合全員忌口（不吃香菜、怕辣、生食NG、乳糖不耐），自動避雷並抽出命定美食！
6. **🎲 聚餐分帳與隨機買單轉盤**
   - 輸入總金額與服務費 %，自動計算每人均分金額。
   - 轉盤隨機抽出幸運朋友「全額請客」或「請喝飲料」！
7. **👤 豐富個人吃貨檔案**
   - 自訂美食代表 Emoji、吃辣耐受度（0辛到地獄辣）、預算等級、招牌飲品偏好與 IG 帳號。
8. **📸 IG 限動小卡高畫質 PNG 圖片下載**
   - 一鍵匯出 2x 視網膜畫質的 Instagram Story 分享小卡圖片。
9. **🌐 繁體中文 🇹🇼 / 日本語 🇯🇵 即時切換**
10. **🟢 即時雲端自動同步 & 好友安全脫敏分享**

---

## 🛠️ 技術架構 (Tech Stack)

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide React Icons + Canvas Confetti
- **Map Engine**: Leaflet + React-Leaflet + OpenStreetMap + Google Maps Integration
- **Image Generation**: html-to-image
- **Storage & Sync**: LocalStorage + JSON Export/Import + URL Safe Hash Sync

---

## 🚀 本地啟動指南 (Quick Start)

```bash
# 1. 安裝依賴
npm install

# 2. 啟動本地開發伺服器
npm run dev

# 3. 打包正式環境產物
npm run build
```

---

## 📦 上傳至 GitHub

本專案已配置好標準 `.gitignore`，上傳時會自動忽略龐大的 `node_modules/` 與 `dist/`，只上傳核心原始碼。
