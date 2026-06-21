# SnatchOS 官網 — Three.js 七幕 3D 場景體驗

一條「情緒動線」：使用者捲動 = 沿著健身房的實體動線往前走。從店門外人臉入場，
一路走進場館、櫃檯、看後台、拉遠看全貌、定心丸、到出口。母題是**「該消失的都消失了」**
—— 閘門、櫃檯雜事、複雜報表、換系統的痛苦，一個接一個安靜地消失。

依 `snatchos-website-scenario-brief.md`（v1）打造，文案為最終版本，請勿增補。

## 技術

- **Three.js** — 程序化建出的場館 3D 空間（門、閘門、櫃檯、店員、器材、燈帶）。
- **GSAP**（已安裝，供日後微調用）
- **Lenis** — 平滑捲動。
- **Vite** — 開發與打包。

固定全螢幕 canvas 當作 3D 舞台，捲動驅動「鏡頭沿動線推進／左轉／拉遠」；
每一幕的文案與 UI（LINE 手機、AI 後台、四週時間軸）以 HTML 疊層淡入淡出。

## 七幕

| 幕 | 場景 | 動態（消失） |
|---|---|---|
| 0 | 進站 + 店門外 | 人臉掃描序幕 → 自動門滑開、閘門淡出消失 |
| 1 | LINE 一站式 | 手機圖文選單：約課／買堂數／請假／查堂數 |
| 2 | 櫃檯·人力被解放 | 店員「走向場上」（非刪除）、櫃檯雜物消失 |
| 3 | AI 對話式後台 | 打字 → 介面當場長出名單卡片、營收圖表 |
| 4 | 拉遠·全貌 | 空間打亮、霧變薄 —— 像旗艦店一樣開闊 |
| 5 | 定心丸·無痛遷移 | 四週時間軸推進到「正式上線」 |
| 6 | 出口 | 單一低門檻 CTA：預約 15 分鐘示範 |

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
