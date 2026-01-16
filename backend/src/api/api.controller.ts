import { Controller, Get } from '@nestjs/common'

@Controller('api')
export class ApiController {
  @Get()
  getApiInfo() {
    return {
      message: 'API 路由結構已設定',
      version: '1.0.0',
    }
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  }
}
