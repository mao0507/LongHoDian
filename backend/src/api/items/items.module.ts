import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ItemsService } from './items.service'
import { ItemsController } from './items.controller'
import { Item } from '../entities/item.entity'
import { Store } from '../entities/store.entity'
import { CustomizationOption } from '../entities/customization-option.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Item, Store, CustomizationOption])],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
