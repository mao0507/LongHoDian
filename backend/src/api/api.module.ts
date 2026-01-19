import { Module } from '@nestjs/common'
import { ApiController } from './api.controller'
import { AuthModule } from './auth/auth.module'
import { StoresModule } from './stores/stores.module'
import { ItemsModule } from './items/items.module'
import { OrdersModule } from './orders/orders.module'

@Module({
  imports: [AuthModule, StoresModule, ItemsModule, OrdersModule],
  controllers: [ApiController],
  providers: [],
})
export class ApiModule {}
