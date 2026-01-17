import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Store } from './store.entity'

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 100 })
  name: string

  @Column('decimal', { precision: 10, scale: 2 })
  price: number

  @Column({ length: 50, nullable: true })
  category: string

  @Column({ type: 'text', nullable: true })
  notes: string

  @Column({ default: true })
  isActive: boolean

  @Column()
  storeId: number

  @ManyToOne(() => Store, (store) => store.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: Store

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
