# 專案設定指南

## 第一次設定步驟

### 1. 安裝依賴

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

### 2. 設定環境變數

#### 後端
複製環境變數範例檔案：
```bash
cd backend
# Windows (PowerShell)
Copy-Item env.example .env

# Linux/Mac
cp env.example .env
```

編輯 `.env` 檔案（如需要）：
```env
NODE_ENV=development
PORT=3001
DATABASE_PATH=./database.sqlite
FRONTEND_URL=http://localhost:3000
```

#### 前端
前端預設會連接到 `http://localhost:3001/api`，如需修改，可建立 `.env.local`：
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### 3. 啟動開發伺服器

#### 方式一：同時啟動前後端（推薦）
```bash
npm run dev
```

這會同時啟動：
- 後端服務：http://localhost:3001
- 前端應用：http://localhost:3000

#### 方式二：分別啟動
```bash
# 終端 1 - 後端
cd backend
npm run dev

# 終端 2 - 前端
cd frontend
npm run dev
```

### 4. 驗證設定

1. 開啟瀏覽器訪問 http://localhost:3000
2. 應該看到「午餐點餐平台」首頁
3. 檢查後端 API：訪問 http://localhost:3001/health
4. 應該看到 `{"status":"ok","timestamp":"..."}`

## 常見問題

### 端口已被占用
如果 3000 或 3001 端口已被占用，可以：
- 修改 `frontend/vite.config.ts` 中的 `server.port`
- 修改 `backend/.env` 中的 `PORT`

### 資料庫錯誤
確保 `backend` 資料夾有寫入權限，SQLite 資料庫檔案會自動建立。

### CORS 錯誤
確保 `backend/.env` 中的 `FRONTEND_URL` 與前端實際運行地址一致。

## 下一步

完成設定後，請參考 [TASKS.md](./TASKS.md) 繼續開發其他功能模組。
