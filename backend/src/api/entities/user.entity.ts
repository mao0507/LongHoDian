import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export enum UserRole {
  USER = 'user', // 一般用戶
  ORGANIZER = 'organizer', // 召集人
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true, length: 50 })
  username: string

  @Column({ length: 100, nullable: true })
  nickname: string

  @Column({ default: UserRole.USER })
  role: UserRole

  @Column({ nullable: true })
  passwordHash: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
