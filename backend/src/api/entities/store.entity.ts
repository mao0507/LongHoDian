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
import { Item } from './item.entity'

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 100 })
  name: string

  @Column({ length: 200, nullable: true })
  contact: string

  @Column({ type: 'text', nullable: true })
  notes: string

  @Column({ type: 'text', nullable: true })
  imageUrl: string

  @Column({ type: 'text', nullable: true })
  categoryTags: string // JSON string array: ["中式", "快餐"]

  @Column({ type: 'int', default: 0 })
  sortOrder: number

  @Column({ default: true })
  isActive: boolean

  @Column()
  organizerId: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'organizerId' })
  organizer: User

  @OneToMany(() => Item, (item) => item.store)
  items: Item[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
