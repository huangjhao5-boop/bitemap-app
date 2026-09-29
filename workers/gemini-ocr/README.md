# Gemini 截圖辨識後端

這個 Worker 先呼叫 Gemini 3.1 Flash-Lite；結果缺少店名/地點、信心低或標記需複核時，才呼叫 Gemini 3.8 Flash。若兩者結果不同，回傳複核提醒。Gemini 金鑰只設定在 Cloudflare Worker，不放進前端或 Git。

## 需要設定的值

1. 在 Google AI Studio 建立 Gemini API key。
2. 在 Firebase Console 的 Authentication 啟用匿名登入（APP 目前會建立匿名登入）。
3. 在這個資料夾安裝 Wrangler 並登入 Cloudflare；首次可用 `npx wrangler deploy` 部署。
4. 以 Wrangler secret 設定：
   - `GEMINI_API_KEY`：Google AI Studio 的 API key。
   - `FIREBASE_API_KEY`：Firebase 網頁應用程式設定中的 Web API key（這是前端識別值，不是 Gemini 金鑰）。
5. 部署完成後，複製 Worker 的 `workers.dev` 網址，在 GitHub repository 的 Settings → Secrets and variables → Actions → Variables 新增：
   - 名稱：`GEMINI_OCR_API_URL`
   - 值：`https://<你的-worker>.workers.dev`
6. 重新執行 GitHub Pages 的 Deploy workflow。若沒有設定網址，APP 會繼續只用原有本機 OCR。

Wrangler 操作範例（在本資料夾執行）：

```sh
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put FIREBASE_API_KEY
npx wrangler deploy
```

Worker 只接受 GitHub Pages 網站來源及有效 Firebase 登入 token，圖片縮至長邊 1800px 後傳送。請在 AI Studio 查看此專案目前可用的模型額度；實際額度依 Google 專案帳戶而異。
