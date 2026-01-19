import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Order } from './order.entity'
import { Item } from './item.entity'

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  orderId: number

  @Column({ length: 100 })
  participantName: string // 參與者姓名

  @Column()
  itemId: number // 品項 ID

  @Column({ type: 'int', default: 1 })
  quantity: number // 數量

  @Column({ type: 'text', nullable: true })
  customizationOptions: string // JSON string: { "大小": "中", "辣度": "小辣" }

  @Column({ type: 'text', nullable: true })
  notes: string // 備註

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number // 小計（品項價格 * 數量）

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'itemId' })
  item: Item

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
