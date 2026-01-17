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
    const store = this.storeRepository.create({
      ...createStoreDto,
      organizerId: organizer.id,
    })

    return this.storeRepository.save(store)
  }

  /**
   * 取得所有店家（僅召集人可查看自己的店家）
   */
  async findAll(organizerId: number): Promise<Store[]> {
    return this.storeRepository.find({
      where: { organizerId },
      order: { createdAt: 'DESC' },
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

    return store
  }

  /**
   * 更新店家
   */
  async update(id: number, updateStoreDto: UpdateStoreDto, organizerId: number): Promise<Store> {
    const store = await this.findOne(id, organizerId)

    Object.assign(store, updateStoreDto)

    return this.storeRepository.save(store)
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
