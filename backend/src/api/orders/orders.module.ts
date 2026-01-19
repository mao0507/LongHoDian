import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { OrdersSchedulerService } from './orders-scheduler.service'
import { Order } from '../entities/order.entity'
import { OrderItem } from '../entities/order-item.entity'
import { Store } from '../entities/store.entity'
import { Item } from '../entities/item.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Store, Item])],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersSchedulerService],
  exports: [OrdersService],
})
export class OrdersModule {}
