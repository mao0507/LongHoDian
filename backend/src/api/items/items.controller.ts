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

@Controller('api/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  // 公開端點：匿名用戶透過訂單 Token 取得品項
  @Get('public/order/:token')
  @Public()
  findByOrderToken(@Param('token') token: string) {
    return this.itemsService.findByOrderToken(token)
  }

  // 以下為需要認證的端點（召集人專用）
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  create(@Body(ZodValidationPipe(CreateItemSchema)) createItemDto: CreateItemDto, @Request() req) {
    return this.itemsService.create(createItemDto, req.user.id)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  findAll(@Query('storeId') storeId: string | undefined, @Request() req) {
    const storeIdNumber = storeId ? parseInt(storeId, 10) : undefined
    return this.itemsService.findAll(req.user.id, storeIdNumber)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.itemsService.findOne(id, req.user.id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
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
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.itemsService.remove(id, req.user.id)
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  toggleActive(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.itemsService.toggleActive(id, req.user.id)
  }

  @Get('import/template')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
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
