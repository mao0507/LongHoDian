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
} from '@nestjs/common'
import { ItemsService } from './items.service'
import { CreateItemSchema, CreateItemDto, UpdateItemSchema, UpdateItemDto } from '../dto/item.dto'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { UserRole } from '../entities/user.entity'

@Controller('api/items')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ORGANIZER)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  create(@Body(ZodValidationPipe(CreateItemSchema)) createItemDto: CreateItemDto, @Request() req) {
    return this.itemsService.create(createItemDto, req.user.id)
  }

  @Get()
  findAll(@Query('storeId') storeId: string | undefined, @Request() req) {
    const storeIdNumber = storeId ? parseInt(storeId, 10) : undefined
    return this.itemsService.findAll(req.user.id, storeIdNumber)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.itemsService.findOne(id, req.user.id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ZodValidationPipe(UpdateItemSchema)) updateItemDto: UpdateItemDto,
    @Request() req,
  ) {
    return this.itemsService.update(id, updateItemDto, req.user.id)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.itemsService.remove(id, req.user.id)
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.itemsService.toggleActive(id, req.user.id)
  }
}
