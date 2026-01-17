import { Module } from '@nestjs/common'
import { ApiController } from './api.controller'
import { AuthModule } from './auth/auth.module'
import { StoresModule } from './stores/stores.module'
import { ItemsModule } from './items/items.module'

@Module({
  imports: [AuthModule, StoresModule, ItemsModule],
  controllers: [ApiController],
  providers: [],
})
export class ApiModule {}
