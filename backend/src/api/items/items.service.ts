import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Item } from '../entities/item.entity'
import { Store } from '../entities/store.entity'
import { User } from '../entities/user.entity'
import { CreateItemDto, UpdateItemDto } from '../dto/item.dto'

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  /**
   * 建立品項（僅召集人可操作，且只能在自己的店家中新增）
   */
  async create(createItemDto: CreateItemDto, organizerId: number): Promise<Item> {
    // 驗證店家是否屬於當前召集人
    const store = await this.storeRepository.findOne({
      where: { id: createItemDto.storeId, organizerId },
    })

    if (!store) {
      throw new NotFoundException('店家不存在或您沒有權限')
    }

    const item = this.itemRepository.create({
      ...createItemDto,
      storeId: store.id,
    })

    return this.itemRepository.save(item)
  }

  /**
   * 取得所有品項（僅召集人可查看自己店家的品項）
   */
  async findAll(organizerId: number, storeId?: number): Promise<Item[]> {
    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .innerJoin('item.store', 'store')
      .where('store.organizerId = :organizerId', { organizerId })

    if (storeId) {
      queryBuilder.andWhere('item.storeId = :storeId', { storeId })
    }

    return queryBuilder.orderBy('item.createdAt', 'DESC').getMany()
  }

  /**
   * 取得單一品項
   */
  async findOne(id: number, organizerId: number): Promise<Item> {
    const item = await this.itemRepository
      .createQueryBuilder('item')
      .innerJoin('item.store', 'store')
      .where('item.id = :id', { id })
      .andWhere('store.organizerId = :organizerId', { organizerId })
      .getOne()

    if (!item) {
      throw new NotFoundException('品項不存在或您沒有權限')
    }

    return item
  }

  /**
   * 更新品項
   */
  async update(id: number, updateItemDto: UpdateItemDto, organizerId: number): Promise<Item> {
    const item = await this.findOne(id, organizerId)

    // 如果更新 storeId，需要驗證新的店家是否屬於當前召集人
    if (updateItemDto.storeId && updateItemDto.storeId !== item.storeId) {
      const store = await this.storeRepository.findOne({
        where: { id: updateItemDto.storeId, organizerId },
      })

      if (!store) {
        throw new NotFoundException('店家不存在或您沒有權限')
      }
    }

    Object.assign(item, updateItemDto)

    return this.itemRepository.save(item)
  }

  /**
   * 刪除品項
   */
  async remove(id: number, organizerId: number): Promise<void> {
    const item = await this.findOne(id, organizerId)
    await this.itemRepository.remove(item)
  }

  /**
   * 切換品項啟用狀態
   */
  async toggleActive(id: number, organizerId: number): Promise<Item> {
    const item = await this.findOne(id, organizerId)
    item.isActive = !item.isActive
    return this.itemRepository.save(item)
  }
}
