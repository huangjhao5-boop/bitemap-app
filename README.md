# 🥢 BiteMap — 短影音美食地圖 & 吃貨朋友圈

> 把在社群上看到的、朋友推薦的、自己吃過的店，收進同一張地圖。  
> 支援好友之間分享口袋名單、必吃／避雷標記、聚餐工具，介面提供 🇹🇼 繁體中文 / 🇯🇵 日本語。

👉 **線上版：[https://huangjhao5-boop.github.io/bitemap-app/](https://huangjhao5-boop.github.io/bitemap-app/)**  
📂 **原始碼：[https://github.com/huangjhao5-boop/bitemap-app](https://github.com/huangjhao5-boop/bitemap-app)**

> ⚠️ 本專案是個人開發的純前端 PWA（部署於 GitHub Pages，沒有自建後端），資料庫使用 Firebase Firestore。請先閱讀下方〈已知限制〉與〈資料與隱私〉。

---

## ✨ 功能總覽

### 🗺️ 地圖與清單
- Leaflet + OpenStreetMap 地圖，標記自己與好友的店家；支援「全部 / 我的口袋 / 好友私藏」切換與依好友篩選。
- 依 GPS（或所選城市）計算距離，可依距離排序；地圖與清單可依分類、城市、評價標籤篩選。
- 一鍵開啟 Google Maps 查詢／導航連結（僅是開啟連結，未使用 Google Maps API）。

### ➕ 新增店家（本專案的核心流程）
新增店家提供四種輸入方式，全部使用**免費公開服務**，沒有 Google Places API：

| 輸入方式 | 實際做法 | 限制 |
|---|---|---|
| 搜尋店名 / 地址 | OpenStreetMap 的 Photon、Nominatim，並以目前位置為偏好；有 GPS 時另用 Overpass 搜尋附近店名；日本地址可用國土地理院（GSI）轉座標 | 資料庫沒收錄的小店會查不到 |
| 貼上 Google Maps 連結 | 從網址解析店名與座標；短網址透過公用 CORS proxy 嘗試展開 | proxy 不穩定，短網址可能失敗 |
| 貼上貼文文字 | 以規則（正規表達式）擷取店名、地址、必吃／避雷品項 | **不是 AI**，格式不明顯時會抓不準 |
| 上傳截圖 | 瀏覽器內建 Tesseract.js OCR（中／日／英），優先從截圖抽出地址並轉座標，再以店名於該地址附近找店 | 首次需下載語言包；模糊或極小字截圖辨識率有限 |

找不到店時，系統會明確提示，並保留「以地址定位」或手動補資料的路徑，不再自動填入假座標。

### 🎬 短影音來源
- 可為店家附上 Instagram / TikTok / YouTube / Facebook / 小紅書 等連結；YouTube 可內嵌播放。
- YouTube 與 TikTok 可透過 oEmbed 取得標題；**Facebook / Instagram 不開放讀取貼文內容，只貼連結無法取得店名**，請改貼文字或上傳截圖。
- 「短影音流」將所有已附影片的店家依距離由近到遠排列。

### 💥 必吃 / 避雷紀錄
- 店家層級：超推必吃、常去回訪、待吃口袋名單、普通、黑名單。
- 餐點層級：必點招牌與特定雷菜；可釘選菜單照片。

### 👥 好友與聚餐
- 以「吃貨 ID」發送與接受好友邀請。
- 好友公開檔案（暱稱、頭像、愛吃／忌口）與你對好友的私人備註分開保存；私人備註只存在本機。
- 聚餐工具：美食盲盒（整合同行者忌口後抽店）、聚餐分帳與隨機買單轉盤、聚餐邀約與想吃清單配對。

### 📸 其他
- 將店家匯出為 2x 解析度的 Instagram 限動小卡（PNG）。
- 資料可匯出 / 匯入 JSON 備份；登入 Google 後可備份到雲端。
- 可安裝為 PWA，並針對 iOS 安全區域與動態島做版面處理。

---

## 🔐 資料與隱私（請務必閱讀）

- 資料預設存在瀏覽器 LocalStorage；登入後會同步至 Firebase Firestore。
- 登入方式：Google 登入（雲端備份），以及「吃貨 ID + 4 碼 PIN」的輕量帳號。PIN 以 SHA-256 加固定 salt 雜湊後再儲存，**屬便利性機制，強度有限，請勿與其他服務共用密碼**。
- 「全公開」店家會寫入公開集合供社群瀏覽。
- **「好友限定」與「私密」目前是由前端過濾**：好友的清單以整份文件讀取後，在讀取端排除私密項目。因此實際能不能被他人讀到，取決於 Firestore Security Rules 的設定；**請不要把真正敏感的內容放進「私密」欄位**，直到規則與資料結構改為伺服器端強制隔離。
- 專案內含 Firebase Web 設定作為預設值（Web 金鑰本身可公開），請確認自己的 Firestore Security Rules 已妥善設定。

---

## 🛠️ 技術架構

| 領域 | 使用技術 |
|---|---|
| 前端 | React 19 + TypeScript + Vite |
| 樣式 | Tailwind CSS v4、Lucide React、canvas-confetti |
| 地圖 | Leaflet + React-Leaflet + OpenStreetMap 圖磚 |
| 店家搜尋 | Photon、Nominatim、Overpass（OSM）、國土地理院 GSI 地址搜尋 |
| 截圖辨識 | Tesseract.js（瀏覽器端、離線辨識，語言包首次載入需下載） |
| 雲端 | Firebase Auth + Firestore（`onSnapshot` 即時監聽；Firebase SDK 由 CDN 動態載入） |
| 圖片輸出 | html-to-image |
| 持久化 | LocalStorage + Firestore + JSON 匯出入 |
| 部署 | GitHub Actions → GitHub Pages |

---

## 💻 本地啟動

需求：Node.js 20+

```bash
git clone https://github.com/huangjhao5-boop/bitemap-app.git
cd bitemap-app
npm install --legacy-peer-deps
npm run dev        # http://localhost:3000
npm run build      # 型別檢查 + 打包
npm run lint       # oxlint
```

自有 Firebase 專案：複製 `.env.example` 為 `.env`，填入 `VITE_FIREBASE_*` 各欄位；未設定時會使用內建的預設值。

推送到 `main` 分支會由 `.github/workflows/deploy.yml` 自動部署到 GitHub Pages。

---

## 🚧 已知限制

- 沒有後端：無法讀取 Facebook / Instagram / TikTok 貼文內容，也沒有使用 Google Places，搜尋涵蓋度受限於 OpenStreetMap。
- 上述文字與截圖解析皆為規則式與 OCR，**結果需要人工確認**，請對照原貼文核對店名與地址。
- 評分欄位（Google 評分）為手動填寫，非自動抓取。
- 公用 CORS proxy 與免費 API 有速率限制，離峰以外時段可能不穩。
- 「好友限定 / 私密」隔離的限制見〈資料與隱私〉。

---

## 📄 授權

MIT License
