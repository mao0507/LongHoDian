import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { User } from './user.entity'
import { Store } from './store.entity'
import { OrderItem } from './order-item.entity'

export enum OrderStatus {
  OPEN = 'open', // 開放點餐
  CLOSED = 'closed', // 已截止
  COMPLETED = 'completed', // 已完成
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 100 })
  name: string // 訂單名稱

  @Column({ type: 'datetime' })
  deadline: Date // 截止時間

  @Column()
  storeId: number // 指定店家

  @Column({ unique: true, length: 64 })
  shareToken: string // 分享 Token（唯一識別碼）

  @Column({ type: 'varchar', length: 20, default: OrderStatus.OPEN })
  status: OrderStatus // 訂單狀態

  @Column()
  organizerId: number // 建立者（召集人）

  @ManyToOne(() => User)
  @JoinColumn({ name: 'organizerId' })
  organizer: User

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
