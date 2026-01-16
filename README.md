# LongHoDian - 午餐點餐平台

公司內部午餐點餐協作平台，支援手機優先的響應式設計。

## 專案結構

```
LongHoDian/
├── frontend/          # Vue 3 + TypeScript 前端專案
├── backend/           # NestJS 後端專案
├── TASKS.md          # 任務清單
└── README.md         # 專案說明
```

## 技術棧

### 前端
- Vue 3 + TypeScript
- Tailwind CSS（響應式設計）
- Pinia（狀態管理）
- Vue Router（路由）
- Axios（HTTP 客戶端）
- Vite（建置工具）

### 後端
- NestJS + TypeScript
- TypeORM（ORM）
- SQLite（開發環境資料庫）
- Zod（資料驗證）
- class-validator（資料驗證）

## 快速開始

### 前置需求
- Node.js 18+ 
- npm 或 yarn

### 安裝依賴

#### 方式一：一次性安裝所有依賴（推薦）
```bash
npm run install:all
```

#### 方式二：分別安裝
```bash
# 前端
cd frontend
npm install

# 後端
cd backend
npm install
```

### 環境設定

#### 後端環境變數
複製 `backend/env.example` 為 `backend/.env`：
```bash
cd backend
cp env.example .env
```

預設設定：
- `PORT=3001` - 後端服務端口
- `DATABASE_PATH=./database.sqlite` - 資料庫路徑
- `FRONTEND_URL=http://localhost:3000` - 前端 URL（CORS 設定）

#### 前端環境變數
複製 `frontend/.env.example` 為 `frontend/.env.local`（如果需要自訂 API URL）

### 執行專案

#### 開發模式

**方式一：同時啟動前後端（推薦）**
```bash
npm run dev
```
這會同時啟動：
- 後端服務：http://localhost:3001
- 前端應用：http://localhost:3000

**方式二：分別啟動**
```bash
# 終端 1 - 後端
cd backend
npm run dev

# 終端 2 - 前端
cd frontend
npm run dev
```

### 建置專案

#### 前端
```bash
cd frontend
npm run build
```

#### 後端
```bash
cd backend
npm run build
npm run start:prod
```

## API 路由結構

所有 API 路由應放在 `backend/src/api/` 資料夾內。

預設 API 端點：
- `GET /` - API 歡迎訊息
- `GET /health` - 健康檢查
- `GET /api` - API 資訊

## 開發規範

### 前端規範
- 一律使用 Composition API
- 使用 `<script setup lang="ts">`
- Props / Emits 必須明確定義型別
- 小型元件優先，避免單一元件過大
- UI 與商業邏輯分離（必要時抽 composables）

### 後端規範
- 一律使用 TypeScript + NestJS
- API 路由需放在 `api/` 資料夾內
- 資料驗證需使用 Zod 套件

## 專案狀態

目前已完成：
- ✅ 專案架構與環境設定
- ⏳ 用戶認證與授權系統（進行中）

詳細任務清單請參考 [TASKS.md](./TASKS.md)

## 授權

MIT
