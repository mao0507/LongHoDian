import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user.entity'

@Entity('web_push_subscriptions')
export class WebPushSubscription {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ type: 'text' })
  endpoint: string

  @Column({ type: 'varchar', length: 255 })
  p256dh: string // Public key for encryption

  @Column({ type: 'varchar', length: 255 })
  auth: string // Auth secret

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string // 瀏覽器資訊，方便管理多裝置

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
