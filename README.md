# SnatchOS 官網 — Three.js 3D 場景過境體驗

使用者捲動 = 沿著健身房的實體動線往前走：門禁人臉掃描進站 → 大廳 → 走向櫃檯 →
AI 後台 → 場上全景 → 出口。每捲一段就過境到下一個 section，全程在同一個 3D 空間裡移動。

**內容對齊現行站台**（trainer-test-sntach.vercel.app）的實際文案與區塊，
以 10 個「站」承載：Hero、三件事、痛點、系統全覽、LINE 一站式、AI 後台、零成本合規、
三個改變、常見問題、預約諮詢。

## 技術

- **Three.js** — 程序化建出的場館 3D 空間（門、閘門、櫃檯、店員、啞鈴架、地墊、鏡牆、燈帶）。
  - **HDRI 環境光（IBL）**：CC0 HDRI 提供 PBR 反射與基底光，地板呈真實鏡面反射。
  - **即時陰影**（PCFSoft）、**鏡牆平面反射**（Reflector）。
- **GSAP**（已安裝，供日後微調用）
- **Lenis** — 平滑捲動。
- **Vite** — 開發與打包。

配色對齊現行站台：暖橘 accent `#FF6B1A`（soft `#FF8A47` / deep `#E85D0A`）+ 近黑底 `#0a0a0d` + 白字。

固定全螢幕 canvas 當作 3D 舞台，捲動驅動鏡頭沿動線推進／左轉／拉遠；
每一站的文案與 UI（會員 LINE、AI 後台 console）以 HTML 疊層淡入淡出。

## 10 站動線

| 站 | 內容 | 場景 / 動態 |
|---|---|---|
| 01 | Hero：健身房的每一步，都自動跑起來 | 門禁掃描序幕 → 閘門淡出、自動門滑開 |
| 02 | 三件只有 Snatch 做到的事 | 進入大廳 |
| 03 | 痛點：每天都在漏掉什麼 | 深入、偏暗 |
| 04 | 系統全覽：串起四個接觸點 | 中軸節點圖 |
| 05 | LINE 一站式（會員端） | 會員 LINE 手機 UI |
| 06 | AI 對話式後台（櫃檯／老闆） | 走向櫃檯、螢幕點亮、AI console |
| 07 | 零成本合規 NT$0 | 轉向場上 |
| 08 | 導入後三個改變 + 媒體 | 拉遠、空間打亮的全景 |
| 09 | 常見問題 | 沉穩寬景 · FAQ 手風琴 |
| 10 | 預約免費諮詢 | 出口 CTA + 品牌簽名 |

## 開發

需要 Node.js（本機透過 Homebrew 安裝：`brew install node`）。

```bash
npm install        # 首次安裝（含 esbuild 需 npm approve-scripts）
npm run dev        # http://localhost:5173
npm run build      # 產生 dist/
npm run preview    # 預覽打包結果
```

## 部署

純靜態，產物在 `dist/`。可直接接 Vercel（與現行站台同平台）：
framework = Vite，build command = `npm run build`，output = `dist`。

## 素材授權

- `public/hdri/venue_1k.hdr` — Poly Haven「Empty Warehouse 01」（作者 Sergej Majboroda），**CC0 公眾領域**，可商用、免標註。
