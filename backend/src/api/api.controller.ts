import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Public } from './auth/public.decorator'

@ApiTags('Health')
@Controller('api')
export class ApiController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'API 資訊', description: '取得 API 基本資訊和版本' })
  @ApiResponse({
    status: 200,
    description: '成功取得 API 資訊',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'API 路由結構已設定' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  getApiInfo() {
    return {
      message: 'API 路由結構已設定',
      version: '1.0.0',
    }
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: '健康檢查', description: '檢查 API 服務是否正常運行' })
  @ApiResponse({
    status: 200,
    description: 'API 服務正常',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  }
}
