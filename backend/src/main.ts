import { NestFactory, Reflector } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { JwtAuthGuard } from './api/auth/jwt-auth.guard'
import { AllExceptionsFilter } from './common/filters'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const reflector = app.get(Reflector)

  // 啟用全域驗證管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  // 設定全域異常過濾器
  app.useGlobalFilters(new AllExceptionsFilter())

  // 設定全域 JWT Guard（可透過 @Public() 裝飾器跳過）
  app.useGlobalGuards(new JwtAuthGuard(reflector))

  // CORS 設定
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })

  // Swagger API 文件設定
  const config = new DocumentBuilder()
    .setTitle('午餐點餐平台 API')
    .setDescription(`
## 概述
公司內部午餐點餐協作平台 API 文件

## 認證方式
- 使用 JWT Bearer Token 認證
- 大部分端點需要認證，標記 @Public() 的端點除外
- 登入後取得 Token，在 Header 中加入 \`Authorization: Bearer <token>\`

## 角色權限
- **user**: 一般用戶
- **organizer**: 召集人（可管理店家、品項、訂單）

## 匿名訪問
- 透過分享連結的 Token 可匿名訪問訂單
- 路徑格式：\`/api/orders/token/:token\`
    `)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '輸入 JWT Token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('Auth', '認證相關 API')
    .addTag('Stores', '店家管理 API（召集人專用）')
    .addTag('Items', '品項管理 API（召集人專用）')
    .addTag('Orders', '訂單管理 API')
    .addTag('Notifications', '通知系統 API')
    .addTag('Health', '健康檢查')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: '午餐點餐平台 API 文件',
  })

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`應用程式運行在 http://localhost:${port}`)
  console.log(`API 文件位於 http://localhost:${port}/api/docs`)
}
bootstrap()
