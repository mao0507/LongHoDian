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
import { StoresService } from './stores.service'
import { CreateStoreSchema, CreateStoreDto, UpdateStoreSchema, UpdateStoreDto } from '../dto/store.dto'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { UserRole } from '../entities/user.entity'

@Controller('api/stores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ORGANIZER)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  create(@Body(ZodValidationPipe(CreateStoreSchema)) createStoreDto: CreateStoreDto, @Request() req) {
    return this.storesService.create(createStoreDto, req.user)
  }

  @Get()
  findAll(@Request() req) {
    return this.storesService.findAll(req.user.id)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.storesService.findOne(id, req.user.id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ZodValidationPipe(UpdateStoreSchema)) updateStoreDto: UpdateStoreDto,
    @Request() req,
  ) {
    return this.storesService.update(id, updateStoreDto, req.user.id)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.storesService.remove(id, req.user.id)
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.storesService.toggleActive(id, req.user.id)
  }
}
