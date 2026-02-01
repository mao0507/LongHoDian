import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger'
import { Response } from 'express'
import { OrdersService } from './orders.service'
import { CreateOrderSchema, CreateOrderDto, SubmitOrderSchema, SubmitOrderDto, UpdateOrderSchema, UpdateOrderDto } from '../dto/order.dto'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { UserRole } from '../entities/user.entity'
import { Public } from '../auth/public.decorator'

@ApiTags('Orders')
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 召集人操作（需要認證）
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立訂單', description: '召集人建立新的點餐訂單' })
  @ApiBody({
    description: '訂單資訊',
    schema: {
      type: 'object',
      required: ['name', 'deadline', 'storeId'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100, example: '今日午餐' },
        deadline: { type: 'string', format: 'date-time', example: '2026-02-01T12:00:00Z' },
        storeId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '訂單建立成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        deadline: { type: 'string', format: 'date-time' },
        shareToken: { type: 'string', description: '分享連結的 Token' },
        status: { type: 'string', enum: ['open', 'closed', 'completed'] },
        store: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '請求參數錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '店家不存在' })
  create(@Body(ZodValidationPipe(CreateOrderSchema)) createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user.id)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得訂單列表', description: '取得當前用戶建立的所有進行中訂單' })
  @ApiResponse({
    status: 200,
    description: '成功取得訂單列表',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          deadline: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['open', 'closed', 'completed'] },
          shareToken: { type: 'string' },
          store: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.id)
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得歷史訂單', description: '取得已關閉或已完成的歷史訂單，支援篩選' })
  @ApiQuery({ name: 'startDate', type: 'string', required: false, description: '開始日期（ISO 格式）' })
  @ApiQuery({ name: 'endDate', type: 'string', required: false, description: '結束日期（ISO 格式）' })
  @ApiQuery({ name: 'storeName', type: 'string', required: false, description: '店家名稱（模糊搜尋）' })
  @ApiQuery({ name: 'orderName', type: 'string', required: false, description: '訂單名稱（模糊搜尋）' })
  @ApiResponse({ status: 200, description: '成功取得歷史訂單列表' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  findHistory(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('storeName') storeName?: string,
    @Query('orderName') orderName?: string,
  ) {
    return this.ordersService.findHistory(req.user.id, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      storeName,
      orderName,
    })
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得訂單詳情', description: '取得單一訂單的詳細資料，包含所有訂單項目和統計' })
  @ApiParam({ name: 'id', type: 'number', description: '訂單 ID' })
  @ApiResponse({
    status: 200,
    description: '成功取得訂單詳情',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        deadline: { type: 'string', format: 'date-time' },
        status: { type: 'string' },
        shareToken: { type: 'string' },
        store: { type: 'object' },
        orderItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              participantName: { type: 'string' },
              item: { type: 'object' },
              quantity: { type: 'number' },
              customizationOptions: { type: 'object' },
              notes: { type: 'string' },
              subtotal: { type: 'number' },
            },
          },
        },
        statistics: {
          type: 'object',
          properties: {
            totalItems: { type: 'number' },
            totalAmount: { type: 'number' },
            participantCount: { type: 'number' },
            averageAmount: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '訂單不存在' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ordersService.findOne(id, req.user.id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新訂單', description: '更新訂單資料（名稱、截止時間、狀態）' })
  @ApiParam({ name: 'id', type: 'number', description: '訂單 ID' })
  @ApiBody({
    description: '要更新的訂單資訊',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        deadline: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: ['open', 'closed', 'completed'] },
      },
    },
  })
  @ApiResponse({ status: 200, description: '訂單更新成功' })
  @ApiResponse({ status: 400, description: '請求參數錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '訂單不存在' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ZodValidationPipe(UpdateOrderSchema)) updateOrderDto: UpdateOrderDto,
    @Request() req,
  ) {
    return this.ordersService.update(id, updateOrderDto, req.user.id)
  }

  @Patch(':id/regenerate-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '重新產生分享 Token', description: '重新產生訂單的分享 Token，舊的 Token 將失效' })
  @ApiParam({ name: 'id', type: 'number', description: '訂單 ID' })
  @ApiResponse({
    status: 200,
    description: '新 Token 產生成功',
    schema: {
      type: 'object',
      properties: {
        shareToken: { type: 'string', description: '新的分享 Token' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '訂單不存在' })
  regenerateToken(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ordersService.regenerateToken(id, req.user.id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除訂單', description: '刪除訂單及其所有訂單項目' })
  @ApiParam({ name: 'id', type: 'number', description: '訂單 ID' })
  @ApiResponse({ status: 200, description: '訂單刪除成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '訂單不存在' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ordersService.remove(id, req.user.id)
  }

  // 匿名用戶操作（不需要認證）
  @Get('token/:token')
  @Public()
  @ApiOperation({ summary: '透過 Token 取得訂單', description: '匿名用戶透過分享連結的 Token 取得訂單資訊' })
  @ApiParam({ name: 'token', type: 'string', description: '訂單分享 Token' })
  @ApiResponse({
    status: 200,
    description: '成功取得訂單資訊',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        deadline: { type: 'string', format: 'date-time' },
        status: { type: 'string' },
        store: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
          },
        },
        orderItems: { type: 'array' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '訂單不存在或 Token 無效' })
  findByToken(@Param('token') token: string) {
    return this.ordersService.findByToken(token)
  }

  @Post('token/:token/submit')
  @Public()
  @ApiOperation({ summary: '提交點餐', description: '匿名用戶透過 Token 提交點餐內容' })
  @ApiParam({ name: 'token', type: 'string', description: '訂單分享 Token' })
  @ApiBody({
    description: '點餐內容',
    schema: {
      type: 'object',
      required: ['participantName', 'items'],
      properties: {
        participantName: { type: 'string', minLength: 1, maxLength: 50, example: '小明' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: ['itemId', 'quantity'],
            properties: {
              itemId: { type: 'number', example: 1 },
              quantity: { type: 'number', minimum: 1, example: 1 },
              customizationOptions: {
                type: 'object',
                example: { '辣度': '小辣', '加料': '加蛋' },
              },
              notes: { type: 'string', example: '不要香菜' },
            },
          },
        },
        notes: { type: 'string', example: '統一用環保袋裝', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 201, description: '點餐提交成功' })
  @ApiResponse({ status: 400, description: '請求參數錯誤或訂單已截止' })
  @ApiResponse({ status: 404, description: '訂單不存在或 Token 無效' })
  submitOrder(@Param('token') token: string, @Body(ZodValidationPipe(SubmitOrderSchema)) submitOrderDto: SubmitOrderDto) {
    return this.ordersService.submitOrder(token, submitOrderDto)
  }

  @Delete('token/:token/participant/:participantName')
  @Public()
  @ApiOperation({ summary: '取消點餐', description: '匿名用戶取消自己的點餐內容（需在截止時間前）' })
  @ApiParam({ name: 'token', type: 'string', description: '訂單分享 Token' })
  @ApiParam({ name: 'participantName', type: 'string', description: '參與者姓名' })
  @ApiResponse({ status: 200, description: '點餐取消成功' })
  @ApiResponse({ status: 400, description: '訂單已截止，無法取消' })
  @ApiResponse({ status: 404, description: '訂單或參與者不存在' })
  cancelOrder(@Param('token') token: string, @Param('participantName') participantName: string) {
    return this.ordersService.cancelOrder(token, participantName)
  }

  @Get(':id/export/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '匯出訂單為 CSV', description: '將訂單資料匯出為 CSV 格式' })
  @ApiParam({ name: 'id', type: 'number', description: '訂單 ID' })
  @ApiResponse({
    status: 200,
    description: '成功匯出 CSV 檔案',
    content: {
      'text/csv': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '訂單不存在' })
  async exportOrderCSV(@Param('id', ParseIntPipe) id: number, @Request() req, @Res() res: Response) {
    const csv = await this.ordersService.exportOrderToCSV(id, req.user.id)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="order_${id}.csv"`)
    res.send('\ufeff' + csv) // 添加 BOM 以支援 Excel 正確顯示中文
  }

  @Get(':id/export/pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '匯出訂單為 PDF', description: '將訂單資料匯出為 PDF 格式' })
  @ApiParam({ name: 'id', type: 'number', description: '訂單 ID' })
  @ApiResponse({
    status: 200,
    description: '成功匯出 PDF 檔案',
    content: {
      'application/pdf': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '訂單不存在' })
  async exportOrderPDF(@Param('id', ParseIntPipe) id: number, @Request() req, @Res() res: Response) {
    const pdfBuffer = await this.ordersService.exportOrderToPDF(id, req.user.id)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="order_${id}.pdf"`)
    res.send(pdfBuffer)
  }
}
