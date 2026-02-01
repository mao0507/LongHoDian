import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { ItemsService } from './items.service'
import { CreateItemSchema, CreateItemDto, UpdateItemSchema, UpdateItemDto } from '../dto/item.dto'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { Public } from '../auth/public.decorator'
import { UserRole } from '../entities/user.entity'

@ApiTags('Items')
@Controller('api/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  // 公開端點：匿名用戶透過訂單 Token 取得品項
  @Get('public/order/:token')
  @Public()
  @ApiOperation({ summary: '透過訂單 Token 取得品項', description: '匿名用戶可透過分享連結的 Token 取得該訂單店家的品項列表' })
  @ApiParam({ name: 'token', type: 'string', description: '訂單分享 Token' })
  @ApiResponse({
    status: 200,
    description: '成功取得品項列表',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          price: { type: 'number' },
          description: { type: 'string', nullable: true },
          category: { type: 'string', nullable: true },
          imageUrl: { type: 'string', nullable: true },
          isRecommended: { type: 'boolean' },
          customizationOptions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                optionName: { type: 'string' },
                optionValues: { type: 'array', items: { type: 'string' } },
                defaultValue: { type: 'string', nullable: true },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: '訂單不存在或 Token 無效' })
  findByOrderToken(@Param('token') token: string) {
    return this.itemsService.findByOrderToken(token)
  }

  // 以下為需要認證的端點（召集人專用）
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '新增品項', description: '建立新的品項（僅召集人可用）' })
  @ApiBody({
    description: '品項資訊',
    schema: {
      type: 'object',
      required: ['name', 'price', 'storeId'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100, example: '雞腿便當' },
        price: { type: 'number', minimum: 0, example: 85 },
        description: { type: 'string', example: '主菜為香酥雞腿', nullable: true },
        category: { type: 'string', example: '便當', nullable: true },
        notes: { type: 'string', example: '熱銷品項', nullable: true },
        imageUrl: { type: 'string', format: 'uri', nullable: true },
        sortOrder: { type: 'number', default: 0 },
        isRecommended: { type: 'boolean', default: false },
        storeId: { type: 'number', example: 1 },
        isActive: { type: 'boolean', default: true },
        customizationOptions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              optionName: { type: 'string', example: '辣度' },
              optionValues: { type: 'array', items: { type: 'string' }, example: ['不辣', '小辣', '中辣', '大辣'] },
              defaultValue: { type: 'string', example: '不辣', nullable: true },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '品項建立成功' })
  @ApiResponse({ status: 400, description: '請求參數錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '店家不存在' })
  create(@Body(ZodValidationPipe(CreateItemSchema)) createItemDto: CreateItemDto, @Request() req) {
    return this.itemsService.create(createItemDto, req.user.id)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得品項列表', description: '取得當前用戶店家的所有品項，可依店家篩選' })
  @ApiQuery({ name: 'storeId', type: 'number', required: false, description: '依店家 ID 篩選' })
  @ApiResponse({ status: 200, description: '成功取得品項列表' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  findAll(@Query('storeId') storeId: string | undefined, @Request() req) {
    const storeIdNumber = storeId ? parseInt(storeId, 10) : undefined
    return this.itemsService.findAll(req.user.id, storeIdNumber)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一品項', description: '根據 ID 取得品項詳細資料（含客製化選項）' })
  @ApiParam({ name: 'id', type: 'number', description: '品項 ID' })
  @ApiResponse({ status: 200, description: '成功取得品項資料' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '品項不存在' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.itemsService.findOne(id, req.user.id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新品項', description: '更新品項資料（部分更新）' })
  @ApiParam({ name: 'id', type: 'number', description: '品項 ID' })
  @ApiResponse({ status: 200, description: '品項更新成功' })
  @ApiResponse({ status: 400, description: '請求參數錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '品項不存在' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ZodValidationPipe(UpdateItemSchema)) updateItemDto: UpdateItemDto,
    @Request() req,
  ) {
    return this.itemsService.update(id, updateItemDto, req.user.id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除品項', description: '刪除指定的品項' })
  @ApiParam({ name: 'id', type: 'number', description: '品項 ID' })
  @ApiResponse({ status: 200, description: '品項刪除成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '品項不存在' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.itemsService.remove(id, req.user.id)
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '切換品項狀態', description: '切換品項的啟用/停用狀態' })
  @ApiParam({ name: 'id', type: 'number', description: '品項 ID' })
  @ApiResponse({
    status: 200,
    description: '狀態切換成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '品項不存在' })
  toggleActive(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.itemsService.toggleActive(id, req.user.id)
  }

  @Get('import/template')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '下載品項匯入範本', description: '下載 CSV 格式的品項匯入範本檔案' })
  @ApiResponse({
    status: 200,
    description: '成功下載 CSV 範本',
    content: {
      'text/csv': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  async downloadTemplate(@Res() res: Response) {
    const csv = this.itemsService.generateTemplateCSV()
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="items_template.csv"')
    res.send('\ufeff' + csv) // 添加 BOM 以支援 Excel 正確顯示中文
  }

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '批量匯入品項', description: '透過上傳 CSV 檔案批量匯入品項' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV 檔案',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV 檔案（需包含 storeId, name, price 欄位）',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '匯入成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        imported: { type: 'number', description: '成功匯入的品項數量' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              row: { type: 'number' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '檔案格式錯誤或內容無效' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  async importItems(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new BadRequestException('請上傳 CSV 檔案')
    }

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('檔案格式必須為 CSV')
    }

    return this.itemsService.importItemsFromCSV(file.buffer.toString('utf-8'), req.user.id)
  }
}
