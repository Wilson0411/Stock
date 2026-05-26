# Vercel 部署

## 適用情境

- 提供朋友直接用網址開啟，不需要安裝任何工程環境。
- 支援桌機與手機瀏覽器。

## 部署前提

- 專案已推到 GitHub。
- 以 `client/` 作為 Vercel 的 Root Directory。

## Vercel 設定

1. 在 Vercel 新增專案並連接 GitHub repository。
2. Root Directory 選 `client`。
3. Framework Preset 選 Next.js。
4. 安裝、建置、啟動命令如下：

```text
Install Command: bun install
Build Command: bun run build
Output Directory: .next
```

## 已整理好的專案設定

- `client/package.json` 已標註 Bun package manager。
- `client/vercel.json` 已指定 Vercel 使用 Bun 指令。
- 首頁、個股頁、API route 已標註動態渲染與偏好區域，較適合亞洲使用者。
- 已加入 web manifest 與行動裝置 icon，方便手機加入主畫面。

## 建議的 Vercel 專案設定

- Region：優先選亞洲節點。
- 如果後續綁定正式網址，可再加入自訂網域。

## 本機驗證

在 `client/` 目錄執行：

```text
bun install
bun run build
bun run start
```

## 注意事項

- 目前資料來自公開市場端點，首次冷啟仍受上游資料源速度影響。
- server 端已有短 TTL 記憶體快取，連續瀏覽會比首次載入快。