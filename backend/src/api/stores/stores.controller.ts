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
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'
import { StoresService } from './stores.service'
import { CreateStoreSchema, CreateStoreDto, UpdateStoreSchema, UpdateStoreDto } from '../dto/store.dto'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { UserRole } from '../entities/user.entity'

@ApiTags('Stores')
@ApiBearerAuth('JWT-auth')
@Controller('api/stores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ORGANIZER)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @ApiOperation({ summary: '新增店家', description: '建立新的店家資料（僅召集人可用）' })
  @ApiBody({
    description: '店家資訊',
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100, example: '美味便當' },
        contact: { type: 'string', example: '02-1234-5678', nullable: true },
        notes: { type: 'string', example: '週一公休', nullable: true },
        imageUrl: { type: 'string', format: 'uri', example: 'https://example.com/store.jpg', nullable: true },
        categoryTags: { type: 'array', items: { type: 'string' }, example: ['便當', '中式'], nullable: true },
        sortOrder: { type: 'number', default: 0, example: 1 },
        isActive: { type: 'boolean', default: true, example: true },
      },
    },
  })
  @ApiResponse({ status: 201, description: '店家建立成功' })
  @ApiResponse({ status: 400, description: '請求參數錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足（需要召集人角色）' })
  create(@Body(ZodValidationPipe(CreateStoreSchema)) createStoreDto: CreateStoreDto, @Request() req) {
    return this.storesService.create(createStoreDto, req.user)
  }

  @Get()
  @ApiOperation({ summary: '取得店家列表', description: '取得當前用戶建立的所有店家' })
  @ApiResponse({
    status: 200,
    description: '成功取得店家列表',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          contact: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
          imageUrl: { type: 'string', nullable: true },
          categoryTags: { type: 'array', items: { type: 'string' } },
          sortOrder: { type: 'number' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  findAll(@Request() req) {
    return this.storesService.findAll(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: '取得單一店家', description: '根據 ID 取得店家詳細資料' })
  @ApiParam({ name: 'id', type: 'number', description: '店家 ID' })
  @ApiResponse({ status: 200, description: '成功取得店家資料' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '店家不存在' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.storesService.findOne(id, req.user.id)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新店家', description: '更新店家資料（部分更新）' })
  @ApiParam({ name: 'id', type: 'number', description: '店家 ID' })
  @ApiBody({
    description: '要更新的店家資訊（所有欄位皆為可選）',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        contact: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
        imageUrl: { type: 'string', format: 'uri', nullable: true },
        categoryTags: { type: 'array', items: { type: 'string' }, nullable: true },
        sortOrder: { type: 'number' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '店家更新成功' })
  @ApiResponse({ status: 400, description: '請求參數錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '店家不存在' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ZodValidationPipe(UpdateStoreSchema)) updateStoreDto: UpdateStoreDto,
    @Request() req,
  ) {
    return this.storesService.update(id, updateStoreDto, req.user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '刪除店家', description: '刪除店家及其所有品項' })
  @ApiParam({ name: 'id', type: 'number', description: '店家 ID' })
  @ApiResponse({ status: 200, description: '店家刪除成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '店家不存在' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.storesService.remove(id, req.user.id)
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: '切換店家狀態', description: '切換店家的啟用/停用狀態' })
  @ApiParam({ name: 'id', type: 'number', description: '店家 ID' })
  @ApiResponse({
    status: 200,
    description: '狀態切換成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        isActive: { type: 'boolean', description: '新的啟用狀態' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '權限不足' })
  @ApiResponse({ status: 404, description: '店家不存在' })
  toggleActive(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.storesService.toggleActive(id, req.user.id)
  }
}
