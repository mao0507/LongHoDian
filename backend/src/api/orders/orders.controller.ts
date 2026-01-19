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
import { Response } from 'express'
import { OrdersService } from './orders.service'
import { CreateOrderSchema, CreateOrderDto, SubmitOrderSchema, SubmitOrderDto, UpdateOrderSchema, UpdateOrderDto } from '../dto/order.dto'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { UserRole } from '../entities/user.entity'
import { Public } from '../auth/public.decorator'

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 召集人操作（需要認證）
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  create(@Body(ZodValidationPipe(CreateOrderSchema)) createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user.id)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.id)
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
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
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ordersService.findOne(id, req.user.id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
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
  regenerateToken(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ordersService.regenerateToken(id, req.user.id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ordersService.remove(id, req.user.id)
  }

  // 匿名用戶操作（不需要認證）
  @Get('token/:token')
  @Public()
  findByToken(@Param('token') token: string) {
    return this.ordersService.findByToken(token)
  }

  @Post('token/:token/submit')
  @Public()
  submitOrder(@Param('token') token: string, @Body(ZodValidationPipe(SubmitOrderSchema)) submitOrderDto: SubmitOrderDto) {
    return this.ordersService.submitOrder(token, submitOrderDto)
  }

  @Delete('token/:token/participant/:participantName')
  @Public()
  cancelOrder(@Param('token') token: string, @Param('participantName') participantName: string) {
    return this.ordersService.cancelOrder(token, participantName)
  }

  @Get(':id/export/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  async exportOrderCSV(@Param('id', ParseIntPipe) id: number, @Request() req, @Res() res: Response) {
    const csv = await this.ordersService.exportOrderToCSV(id, req.user.id)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="order_${id}.csv"`)
    res.send('\ufeff' + csv) // 添加 BOM 以支援 Excel 正確顯示中文
  }

  @Get(':id/export/pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  async exportOrderPDF(@Param('id', ParseIntPipe) id: number, @Request() req, @Res() res: Response) {
    const pdfBuffer = await this.ordersService.exportOrderToPDF(id, req.user.id)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="order_${id}.pdf"`)
    res.send(pdfBuffer)
  }
}
