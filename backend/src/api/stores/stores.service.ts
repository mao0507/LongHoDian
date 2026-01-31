import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Store } from '../entities/store.entity'
import { User } from '../entities/user.entity'
import { CreateStoreDto, UpdateStoreDto } from '../dto/store.dto'

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  /**
   * 建立店家（僅召集人可操作）
   */
  async create(createStoreDto: CreateStoreDto, organizer: User): Promise<Store> {
    const storeData = {
      ...createStoreDto,
      organizerId: organizer.id,
      categoryTags: createStoreDto.categoryTags ? JSON.stringify(createStoreDto.categoryTags) : null,
      imageUrl: createStoreDto.imageUrl || null,
    }
    const store = this.storeRepository.create(storeData)

    const saved = await this.storeRepository.save(store)
    // 解析 categoryTags 以便返回
    if (saved.categoryTags) {
      saved.categoryTags = JSON.parse(saved.categoryTags) as any
    }
    return saved
  }

  /**
   * 取得所有店家（僅召集人可查看自己的店家）
   */
  async findAll(organizerId: number): Promise<Store[]> {
    const stores = await this.storeRepository.find({
      where: { organizerId },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    })
    // 解析 categoryTags
    return stores.map((store) => {
      if (store.categoryTags && typeof store.categoryTags === 'string') {
        try {
          store.categoryTags = JSON.parse(store.categoryTags) as any
        } catch {
          store.categoryTags = [] as any
        }
      }
      return store
    })
  }

  /**
   * 取得單一店家
   */
  async findOne(id: number, organizerId: number): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id, organizerId },
    })

    if (!store) {
      throw new NotFoundException('店家不存在')
    }

    // 解析 categoryTags
    if (store.categoryTags && typeof store.categoryTags === 'string') {
      try {
        store.categoryTags = JSON.parse(store.categoryTags) as any
      } catch {
        store.categoryTags = [] as any
      }
    }

    return store
  }

  /**
   * 更新店家
   */
  async update(id: number, updateStoreDto: UpdateStoreDto, organizerId: number): Promise<Store> {
    const store = await this.findOne(id, organizerId)

    // 處理 categoryTags 序列化
    if (updateStoreDto.categoryTags !== undefined) {
      store.categoryTags = updateStoreDto.categoryTags ? JSON.stringify(updateStoreDto.categoryTags) : null
    }
    // 處理 imageUrl
    if (updateStoreDto.imageUrl !== undefined) {
      store.imageUrl = updateStoreDto.imageUrl || null
    }
    // 處理其他欄位
    if (updateStoreDto.name !== undefined) {
      store.name = updateStoreDto.name
    }
    if (updateStoreDto.contact !== undefined) {
      store.contact = updateStoreDto.contact || null
    }
    if (updateStoreDto.notes !== undefined) {
      store.notes = updateStoreDto.notes || null
    }
    if (updateStoreDto.sortOrder !== undefined) {
      store.sortOrder = updateStoreDto.sortOrder
    }
    if (updateStoreDto.isActive !== undefined) {
      store.isActive = updateStoreDto.isActive
    }

    const saved = await this.storeRepository.save(store)
    // 解析 categoryTags 以便返回
    if (saved.categoryTags && typeof saved.categoryTags === 'string') {
      try {
        saved.categoryTags = JSON.parse(saved.categoryTags) as any
      } catch {
        saved.categoryTags = [] as any
      }
    }
    return saved
  }

  /**
   * 刪除店家
   */
  async remove(id: number, organizerId: number): Promise<void> {
    const store = await this.findOne(id, organizerId)
    await this.storeRepository.remove(store)
  }

  /**
   * 切換店家啟用狀態
   */
  async toggleActive(id: number, organizerId: number): Promise<Store> {
    const store = await this.findOne(id, organizerId)
    store.isActive = !store.isActive
    return this.storeRepository.save(store)
  }
}
