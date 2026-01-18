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
import { Store } from './store.entity'
import { CustomizationOption } from './customization-option.entity'

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

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'text', nullable: true })
  imageUrl: string

  @Column({ type: 'int', default: 0 })
  sortOrder: number

  @Column({ default: false })
  isRecommended: boolean

  @Column({ default: true })
  isActive: boolean

  @Column()
  storeId: number

  @ManyToOne(() => Store, (store) => store.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: Store

  @OneToMany(() => CustomizationOption, (option) => option.item)
  customizationOptions: CustomizationOption[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
