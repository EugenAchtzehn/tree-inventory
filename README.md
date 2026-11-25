# 森野盤點

Vue 3 + TypeScript + Vite 的戶外樹木資源盤點 PWA。使用 MapLibre 顯示國土測繪中心 PHOTO2／EMAP 與 OpenStreetMap，並結合瀏覽器定位與裝置朝向。

## 本機啟動

```bash
npm install
npm run dev
```

Windows + nvm4w 若 PowerShell 擋下 `npm.ps1`，請改用：

```powershell
& "C:\nvm4w\nodejs\npm.cmd" install
& "C:\nvm4w\nodejs\npm.cmd" run dev
```

Demo 登入資料位於 `.env`。所有 `VITE_*` 值都會送到瀏覽器，禁止放置正式密碼、JWT 簽章密鑰或其他秘密。

## 驗證

```bash
npm run type-check
npm run build
```

定位與裝置方向在正式環境需要 HTTPS。第一版 PWA 只快取應用程式殼，不承諾離線底圖或離線送出。
