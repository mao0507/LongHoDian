import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './user.entity'

export enum NotificationType {
  ORDER_DEADLINE_REMINDER = 'order_deadline_reminder', // 訂單截止提醒
  ORDER_SUMMARY_COMPLETED = 'order_summary_completed', // 訂單統整完成
  ORDER_STARTED = 'order_started', // 點餐開始
}

export enum NotificationChannel {
  WEB_PUSH = 'web_push',
  LINE_NOTIFY = 'line_notify',
  TELEGRAM = 'telegram',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ type: 'varchar', length: 50 })
  type: NotificationType

  @Column({ type: 'varchar', length: 50 })
  channel: NotificationChannel

  @Column({ type: 'varchar', length: 20, default: NotificationStatus.PENDING })
  status: NotificationStatus

  @Column({ length: 200 })
  title: string

  @Column({ type: 'text' })
  content: string

  @Column({ type: 'text', nullable: true })
  metadata: string // JSON string for additional data (e.g., orderId)

  @Column({ type: 'text', nullable: true })
  errorMessage: string // 發送失敗時的錯誤訊息

  @Column({ default: false })
  isRead: boolean

  @CreateDateColumn()
  createdAt: Date

  @Column({ type: 'datetime', nullable: true })
  sentAt: Date
}
