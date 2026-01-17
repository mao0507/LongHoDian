import { NestFactory, Reflector } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { JwtAuthGuard } from './api/auth/jwt-auth.guard'

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

  // 設定全域 JWT Guard（可透過 @Public() 裝飾器跳過）
  app.useGlobalGuards(new JwtAuthGuard(reflector))

  // CORS 設定
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`應用程式運行在 http://localhost:${port}`)
}
bootstrap()
