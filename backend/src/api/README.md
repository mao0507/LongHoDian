# API 模組說明

## 目錄結構

```
api/
├── dto/              # 資料傳輸物件（使用 Zod Schema）
├── pipes/            # 自訂管道（Zod 驗證管道）
├── api.controller.ts # API 控制器
└── api.module.ts     # API 模組
```

## 規則遵循

### 1. API 路由必須放在 `api/` 資料夾內
所有業務相關的 API 端點都應該在 `api/` 資料夾內定義。

### 2. 資料驗證使用 Zod
所有資料驗證都應該使用 Zod 套件，而不是 class-validator。

#### 使用範例：

```typescript
// 1. 定義 Zod Schema (在 dto/ 資料夾)
import { z } from 'zod'

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export type CreateUserDto = z.infer<typeof CreateUserSchema>

// 2. 在 Controller 中使用
import { Controller, Post, Body } from '@nestjs/common'
import { CreateUserSchema, CreateUserDto } from './dto/create-user.dto'
import { ZodValidationPipe } from './pipes/zod-validation.pipe'

@Controller('api/users')
export class UsersController {
  @Post()
  createUser(@Body(ZodValidationPipe(CreateUserSchema)) dto: CreateUserDto) {
    // dto 已經通過 Zod 驗證
    return { message: 'User created', data: dto }
  }
}
```

## 健康檢查端點

健康檢查端點已移至 `/api/health`，符合 API 路由規則。
