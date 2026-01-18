import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Item } from './item.entity'

@Entity('customization_options')
export class CustomizationOption {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  itemId: number

  @Column({ length: 100 })
  optionName: string // 選項名稱，例如："大小"、"辣度"

  @Column({ type: 'text' })
  optionValues: string // JSON string array: ["小", "中", "大"]

  @Column({ length: 50, nullable: true })
  defaultValue: string // 預設值，例如："中"

  @Column({ type: 'text', nullable: true })
  template: string // 範本名稱（可選），例如："飲料大小"

  @ManyToOne(() => Item, (item) => item.customizationOptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: Item

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
