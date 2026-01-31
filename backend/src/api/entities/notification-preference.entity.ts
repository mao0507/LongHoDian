import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm'
import { User } from './user.entity'

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  userId: number

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  // Line Notify 設定
  @Column({ default: false })
  lineNotifyEnabled: boolean

  @Column({ type: 'varchar', length: 255, nullable: true })
  lineNotifyToken: string

  // Web Push 設定
  @Column({ default: false })
  webPushEnabled: boolean

  // Telegram 設定
  @Column({ default: false })
  telegramEnabled: boolean

  @Column({ type: 'varchar', length: 100, nullable: true })
  telegramChatId: string

  // 通知類型開關
  @Column({ default: true })
  orderDeadlineReminder: boolean // 訂單截止提醒

  @Column({ default: true })
  orderSummaryCompleted: boolean // 訂單統整完成通知

  @Column({ default: true })
  orderStarted: boolean // 點餐開始通知

  // 截止提醒時間設定（分鐘）
  @Column({ default: 30 })
  deadlineReminderMinutes: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
