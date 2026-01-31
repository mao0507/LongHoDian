import { Module } from '@nestjs/common'
import { ApiController } from './api.controller'
import { AuthModule } from './auth/auth.module'
import { StoresModule } from './stores/stores.module'
import { ItemsModule } from './items/items.module'
import { OrdersModule } from './orders/orders.module'
import { NotificationsModule } from './notifications/notifications.module'

@Module({
  imports: [AuthModule, StoresModule, ItemsModule, OrdersModule, NotificationsModule],
  controllers: [ApiController],
  providers: [],
})
export class ApiModule {}
