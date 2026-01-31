import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { NotificationsSchedulerService } from './notifications-scheduler.service'
import { Notification } from '../entities/notification.entity'
import { NotificationPreference } from '../entities/notification-preference.entity'
import { WebPushSubscription } from '../entities/web-push-subscription.entity'
import { Order } from '../entities/order.entity'
import { LineNotifyService } from './channels/line-notify.service'
import { WebPushService } from './channels/web-push.service'
import { TelegramService } from './channels/telegram.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationPreference, WebPushSubscription, Order]),
    ConfigModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsSchedulerService,
    LineNotifyService,
    WebPushService,
    TelegramService,
  ],
  exports: [NotificationsService, NotificationsSchedulerService],
})
export class NotificationsModule {}
