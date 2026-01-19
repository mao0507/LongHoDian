import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { OrdersService } from './orders.service'

@Injectable()
export class OrdersSchedulerService {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * 每分鐘檢查一次過期訂單並自動關閉
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredOrders() {
    await this.ordersService.autoCloseExpiredOrders()
  }
}
