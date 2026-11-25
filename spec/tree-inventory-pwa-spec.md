# 戶外樹木資源盤點 PWA 規格

## 1. 文件目的

本文件彙整原始需求及需求釐清過程中的決策，作為「戶外樹木資源盤點 PWA」第一版的產品、設計、開發及驗收基準。

本文件描述預期行為，不以目前 mock 實作細節取代未來正式後端契約。若後續需求與本文件衝突，應先更新本文件再調整程式。

## 2. 產品目標

提供適合手機戶外操作的樹木盤點網頁，讓已登入的使用者能：

1. 在地圖上看見自己的位置與面向方向。
2. 快速建立一棵位於使用者前方的待盤點樹木。
3. 拖曳修正樹木位置並填寫核心盤點資料。
4. 保存及查閱已完成的盤點紀錄。
5. 將 PWA 安裝至裝置主畫面使用。

## 3. 技術基準

- 前端框架：Vue 3、TypeScript、Vite。
- 狀態與路由：Pinia、Vue Router。
- UI：PrimeVue 最新穩定版、Tailwind CSS。
- 地圖引擎：MapLibre GL JS。
- 表單及資料驗證：TypeScript 型別搭配 runtime schema validation。
- PWA：使用 Vite PWA／Workbox 產生 manifest 與 service worker。
- 正式部署必須使用 HTTPS，以支援定位、裝置方向及 service worker。
- 裝置定位與方向的跨瀏覽器策略以 [Ubilabs geolocation-deviceorientation-demo](https://github.com/ubilabs/geolocation-deviceorientation-demo) 為參考，但不引入其 Google Maps 相依性。

## 4. 已確認的產品決策

| 項目 | 第一版決策 |
| --- | --- |
| 離線能力 | 僅提供 PWA 安裝與應用程式殼快取，不承諾離線底圖、離線新增或背景同步。 |
| 選單第二項 | 「已盤點樹木」。 |
| 朝向呈現 | 地圖保持北向，只旋轉使用者位置箭頭／方向錐。 |
| Mock 登入 | 只允許 `.env` 內定義的 demo 帳號登入。 |
| Mock 註冊 | 表單送出後模擬成功並回登入頁；不建立可登入的新帳號。 |
| 帳戶管理 | 顯示 Email、姓名；Email 唯讀，姓名可修改。密碼功能不在第一版提供。 |
| 樹木欄位 | 樹種、胸圍（cm）、樹高（m）、備註；座標與盤點時間自動帶入。 |
| 樹木列表 | 可檢視摘要與詳細資料，並回到地圖定位；不提供修改或刪除。 |
| 新樹初始位置 | 從使用者座標沿裝置朝向向前投影 3 公尺。 |
| 位置微調 | 初始小樹可拖曳；使用者點擊小樹後才確認位置並進入資料編輯。 |

## 5. 使用者角色與前提

第一版只有單一一般盤點人員角色，不處理管理員、審核者或多租戶權限。

使用者主要以手機瀏覽器或已安裝的 PWA 進行操作。桌面瀏覽器、無方向感測器的裝置或拒絕定位權限的情況仍應保留手動放置樹木的能力。

## 6. 導覽與路由

### 6.1 公開頁面

- `/login`：登入。
- `/register`：註冊資料填寫與 mock 成功流程。

### 6.2 需登入頁面

- `/map`：主要盤點地圖，登入後的預設首頁。
- `/account`：帳戶管理。
- `/trees`：已盤點樹木列表。
- `/trees/:id`：單筆盤點詳細資料。

未登入或 mock JWT 已過期時，需登入頁面應導向 `/login`，並保留原目的路由供登入後返回。

### 6.3 地圖側邊選單

使用者點擊地圖左上角漢堡圖示後開啟選單，順序固定為：

1. 帳戶管理。
2. 已盤點樹木。
3. 登出。

登出必須清除 session/token 並回到登入頁。

## 7. 身分驗證與帳戶

### 7.1 Mock JWT

- `.env` 定義 demo Email、密碼、姓名與開發用 access token。
- 登入成功後保存 token；受保護路由需檢查 token 是否存在及 `exp` 是否仍有效。
- JWT 在前端只做 mock session 與到期流程，不在瀏覽器驗證簽章。
- 所有 `VITE_*` 變數都會進入前端 bundle，禁止放入正式密碼、簽章密鑰或其他秘密。
- 未來接入後端時，畫面及 store 不應直接修改，只替換 auth adapter。

### 7.2 登入

- 欄位：Email、密碼。
- 驗證失敗顯示明確錯誤，不應洩漏帳號是否存在。
- 成功後進入原目的頁；沒有目的頁時進入 `/map`。

### 7.3 註冊

- 欄位：姓名、Email、密碼、確認密碼。
- 檢查 Email 格式、密碼最小長度及兩次密碼一致。
- Mock 送出成功後提示「目前請使用 demo 帳號登入」，返回 `/login`。
- 輸入的新帳號不保存，也不能用來登入。

### 7.4 帳戶管理

- 顯示目前帳戶 Email 與姓名。
- Email 唯讀。
- 姓名可修改，mock 階段保存於 localStorage。
- 頁面需說明變更密碼將於正式後端上線後提供。

## 8. 地圖與底圖

### 8.1 初始行為

- 登入後首先顯示全螢幕地圖。
- 尚未取得定位時，初始視角顯示臺灣全島。
- 第一次取得有效定位後，自動移動到使用者位置並使用適合現地盤點的縮放層級。
- 後續定位更新只更新位置標記，不持續強制移動使用者視角。

### 8.2 底圖來源

預設使用國土測繪中心 PHOTO2，並提供以下切換：

| 名稱 | 來源 |
| --- | --- |
| 航照 | `https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/GoogleMapsCompatible/{z}/{y}/{x}` |
| 電子地圖 | `https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}` |
| OSM | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` |

- Raster tile size 為 256。
- PHOTO2 與 EMAP 最大層級為 19。
- 切換底圖不得移除使用者位置、草稿樹木或已盤點樹木圖層。
- 畫面必須顯示各資料來源要求的 attribution。

## 9. 定位與裝置方向

### 9.1 權限流程

- 進入地圖後顯示「啟用定位與朝向」引導。
- 權限要求必須由明確的使用者點擊觸發，以符合 iOS 等瀏覽器限制。
- 分別處理定位與裝置方向的 `granted`、`denied`、`prompt` 及不支援狀態。
- 拒絕權限後仍可操作地圖及手動新增樹木。

### 9.2 定位資料

有效位置至少包含：

- latitude。
- longitude。
- accuracy（公尺）。
- timestamp。
- heading；無法取得時為 `null`。

定位使用 high accuracy watch；離開地圖頁或停止功能時必須解除 watch 與事件監聽。

### 9.3 朝向正規化

依可用性採用以下順序：

1. `deviceorientationabsolute`。
2. Safari/iOS 的 `webkitCompassHeading`。
3. 有 absolute 資訊的 Euler angles 轉 compass heading。

方向更新應節流，避免每一個 sensor event 都觸發完整 Vue render。

地圖本身保持北向，使用者位置箭頭依 heading 旋轉。方向不可用時顯示一般位置點及狀態提示。

## 10. 新增樹木盤點流程

### 10.1 啟動

- 地圖左上角在漢堡按鈕下方顯示獨立的樹木 SVG 按鈕。
- 點擊後進入單一草稿樹木放置流程；同一時間只能存在一棵草稿樹。

### 10.2 初始位置規則

1. 同時有位置與 heading：從目前位置沿 heading 投影 3 公尺。
2. 有位置但無 heading：放在目前位置並提示使用者拖曳修正。
3. 無定位：放在目前地圖中心並提示使用者手動放置。

所有資料座標使用 WGS84 經緯度；3 公尺投影需使用地理座標計算，不能直接對經緯度加固定常數。

### 10.3 放置及確認

- 草稿小樹必須可拖曳。
- 拖曳完成不會自動開啟表單。
- 使用者點擊小樹後顯示 infobox，包含位置確認說明、「開始編輯」與「取消」。
- 取消時移除草稿 marker。
- 「開始編輯」保留已確認座標並開啟樹木資料表單。

### 10.4 編輯表單

手機版使用底部 Drawer／sheet，欄位為：

- 樹種：必填，選項由 `listSpecies` mock 資料來源取得。
- 胸圍：必填，單位 cm，必須大於 0。
- 樹高：必填，單位 m，必須大於 0。
- 備註：選填，最多 500 字。
- 座標：唯讀顯示，自動帶入。
- 盤點時間：送出時自動產生 ISO 8601 時間。

### 10.5 儲存結果

- 送出時呼叫 typed `createTree` interface。
- 成功：關閉 Drawer、移除草稿 marker、將正式樹木加入地圖與列表並顯示成功提示。
- 失敗：保留表單內容、座標與草稿 marker，顯示錯誤並允許重試。
- Mock 階段將盤點資料保存於 localStorage，讓重新整理後仍可檢視；此行為不代表已提供正式離線同步。

## 11. 已盤點樹木

### 11.1 列表

每筆摘要至少顯示：

- 樹種名稱。
- 盤點時間。
- 胸圍。
- 樹高。

頁面需處理 loading、空白、錯誤及正常資料狀態。

### 11.2 詳細資料

詳細頁顯示：

- 樹種。
- 胸圍。
- 樹高。
- 備註。
- 經緯度。
- 盤點時間。

「在地圖定位」會返回 `/map`，將地圖移動並放大至該樹位置。

第一版不提供修改與刪除既有盤點。

## 12. 資料契約

### 12.1 主要資料型別

```ts
interface TreeSpecies {
  id: string
  name: string
}

interface CreateTreeInput {
  speciesId: string
  circumferenceCm: number
  heightM: number
  notes: string
  latitude: number
  longitude: number
  observedAt: string
}

interface TreeRecord extends CreateTreeInput {
  id: string
  species: TreeSpecies
  createdBy: string
  createdAt: string
}
```

### 12.2 Gateway interfaces

畫面與 store 只能透過下列 interfaces 存取外部資料或瀏覽器能力：

```ts
interface AuthGateway {
  login(input: LoginInput): Promise<AuthSession>
  register(input: RegisterInput): Promise<void>
  getCurrentUser(): Promise<UserProfile | null>
  updateProfile(name: string): Promise<UserProfile>
  logout(): Promise<void>
}

interface TreeInventoryGateway {
  listSpecies(): Promise<TreeSpecies[]>
  createTree(input: CreateTreeInput): Promise<TreeRecord>
  listTrees(): Promise<TreeRecord[]>
  getTree(id: string): Promise<TreeRecord | null>
}

interface DeviceLocation {
  queryPermissions(): Promise<PermissionSnapshot>
  requestPermissions(): Promise<PermissionSnapshot>
  start(onUpdate, onError): void
  stop(): void
}
```

錯誤統一轉為 `AppError`，至少可表達：未授權、驗證失敗、權限拒絕、不支援、找不到資料、儲存失敗與未知錯誤。

## 13. 架構原則

功能依責任分為：

- `auth`：登入、註冊、JWT session、帳戶狀態。
- `account`：帳戶管理頁面。
- `map`：MapLibre 初始化、底圖、marker 與地圖互動。
- `location`：定位、方向權限、事件正規化與地理計算。
- `inventory`：樹種、草稿建立、盤點資料、列表及詳細資料。
- `shared`：錯誤、storage、共用導覽與 PWA 更新提示。

架構需符合以下原則：

- UI 不直接讀取 `.env`、localStorage 或呼叫 fetch。
- Pinia store 不建立自己的 adapters，依賴由 composition root 注入。
- Domain types 與未來後端 DTO 分離，adapter 負責轉換與 runtime validation。
- Mock adapter 與未來 HTTP adapter 必須滿足相同 interface。
- 定位、方向、底圖及樹木資料的複雜行為集中在深模組內，不散落於 Vue 頁面。

## 14. PWA 與離線範圍

- 提供可安裝 manifest、名稱、主題色、啟動畫面圖示及 standalone display。
- Precache 應用程式殼及必要靜態資源。
- 不主動預下載 PHOTO2、EMAP 或 OSM 圖磚。
- 不宣稱離線時可新增、送出或同步盤點資料。
- service worker 更新採提示模式，避免使用者填表時被自動重載而遺失內容。

## 15. UI 與可用性

- Mobile-first，地圖頁使用完整可視高度並支援 safe-area inset。
- 一般文字至少 16px；任務關鍵標籤至少 14px。
- 主要觸控目標至少 44 × 44 px。
- 互動控制需有可存取名稱、鍵盤焦點與合理色彩對比。
- 全站介面語言為繁體中文。
- 使用 PrimeVue styled mode 與一致的綠色自然系視覺；Tailwind 負責版面及局部 utilities。
- 權限拒絕、無感測器、定位逾時、資料為空或 mock 儲存失敗時，都需提供可理解且可繼續操作的提示。

## 16. 驗收標準

### 16.1 身分流程

- Demo 帳號可登入並進入地圖。
- 錯誤帳密無法登入。
- Mock 註冊成功後返回登入，且新帳號不能登入。
- 未登入及過期 token 無法進入保護頁面。
- 登出後 token 被清除。

### 16.2 地圖與裝置能力

- PHOTO2、EMAP、OSM 可切換，來源標示正確。
- 首次有效定位會置中使用者位置。
- heading 改變時只旋轉位置箭頭，地圖保持北向。
- 拒絕定位或無方向感測器時仍可建立並拖曳小樹。

### 16.3 樹木盤點

- 有位置與 heading 時，小樹初始位置為面向前方約 3 公尺。
- 草稿可拖曳、取消及確認。
- 表單驗證必填與數值範圍。
- 儲存成功後地圖、列表及詳細頁資料一致。
- 儲存失敗不會遺失草稿和已輸入內容。
- 列表可回地圖定位指定樹木。

### 16.4 工程品質

- TypeScript strict type-check 通過。
- ESLint 通過。
- E2E 覆蓋登入、權限、建立樹木、列表、地圖定位與登出主流程。
- Production build 可產生 manifest 與 service worker。

## 17. 第一版不包含

- 正式後端、資料庫、真正 JWT 簽發或 refresh token。
- 完整離線盤點、背景同步、衝突解決或離線圖磚區域下載。
- 照片上傳。
- 胸徑、樹冠幅、健康狀態等擴充欄位。
- 修改或刪除已完成的盤點。
- 管理員、審核、團隊、角色或組織權限。
- 批次匯入／匯出、報表或分析儀表板。

## 18. 未來後端接入原則

後端完成後，應新增 HTTP adapters 並由 composition root 依環境切換，不改寫頁面流程。接入前需再確認：

- REST endpoint、method 與 DTO wire shape。
- access token／refresh token 策略。
- 樹種搜尋、分頁及版本管理。
- 樹木列表分頁與使用者資料隔離。
- 建立盤點的 idempotency、重試與錯誤格式。
- 帳戶註冊、Email 驗證、密碼政策與變更密碼流程。
- 是否擴充照片、健康狀態、審核及正式離線同步。
