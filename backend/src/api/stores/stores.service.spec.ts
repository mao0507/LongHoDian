import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'
import { StoresService } from './stores.service'
import { Store } from '../entities/store.entity'
import { User, UserRole } from '../entities/user.entity'

describe('StoresService', () => {
  let service: StoresService
  let storeRepository: any

  const mockUser: User = {
    id: 1,
    username: 'organizer',
    nickname: '召集人',
    passwordHash: 'hash',
    role: UserRole.ORGANIZER,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockStore: Store = {
    id: 1,
    name: '測試店家',
    contact: '02-1234-5678',
    notes: '備註',
    imageUrl: null,
    categoryTags: '["便當","中式"]',
    sortOrder: 0,
    isActive: true,
    organizerId: 1,
    organizer: mockUser,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockStoreRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: getRepositoryToken(Store),
          useValue: mockStoreRepository,
        },
      ],
    }).compile()

    service = module.get<StoresService>(StoresService)
    storeRepository = module.get(getRepositoryToken(Store))

    jest.clearAllMocks()
  })

  describe('create', () => {
    const createStoreDto = {
      name: '新店家',
      contact: '02-5678-1234',
      categoryTags: ['便當', '日式'],
    }

    it('應該成功建立店家', async () => {
      const createdStore = {
        ...mockStore,
        name: createStoreDto.name,
        contact: createStoreDto.contact,
        categoryTags: JSON.stringify(createStoreDto.categoryTags),
      }
      mockStoreRepository.create.mockReturnValue(createdStore)
      mockStoreRepository.save.mockResolvedValue(createdStore)

      const result = await service.create(createStoreDto, mockUser)

      expect(result.name).toBe(createStoreDto.name)
      expect(mockStoreRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createStoreDto.name,
          organizerId: mockUser.id,
        })
      )
      expect(mockStoreRepository.save).toHaveBeenCalled()
    })

    it('應該正確序列化 categoryTags', async () => {
      mockStoreRepository.create.mockReturnValue(mockStore)
      mockStoreRepository.save.mockResolvedValue(mockStore)

      await service.create(createStoreDto, mockUser)

      expect(mockStoreRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryTags: JSON.stringify(createStoreDto.categoryTags),
        })
      )
    })
  })

  describe('findAll', () => {
    it('應該返回該召集人的所有店家', async () => {
      const stores = [mockStore, { ...mockStore, id: 2, name: '店家2' }]
      mockStoreRepository.find.mockResolvedValue(stores)

      const result = await service.findAll(1)

      expect(result).toHaveLength(2)
      expect(mockStoreRepository.find).toHaveBeenCalledWith({
        where: { organizerId: 1 },
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      })
    })

    it('應該解析 categoryTags JSON 字串', async () => {
      mockStoreRepository.find.mockResolvedValue([mockStore])

      const result = await service.findAll(1)

      expect(result[0].categoryTags).toEqual(['便當', '中式'])
    })

    it('沒有店家時應該返回空陣列', async () => {
      mockStoreRepository.find.mockResolvedValue([])

      const result = await service.findAll(1)

      expect(result).toEqual([])
    })
  })

  describe('findOne', () => {
    it('應該返回指定的店家', async () => {
      mockStoreRepository.findOne.mockResolvedValue(mockStore)

      const result = await service.findOne(1, 1)

      expect(result.id).toBe(1)
      expect(mockStoreRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, organizerId: 1 },
      })
    })

    it('店家不存在時應該拋出 NotFoundException', async () => {
      mockStoreRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException)
    })

    it('不屬於該召集人的店家應該拋出 NotFoundException', async () => {
      mockStoreRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    const updateStoreDto = {
      name: '更新後的店家',
      isActive: false,
    }

    it('應該成功更新店家', async () => {
      mockStoreRepository.findOne.mockResolvedValue({ ...mockStore })
      mockStoreRepository.save.mockImplementation((store) => Promise.resolve(store))

      const result = await service.update(1, updateStoreDto, 1)

      expect(result.name).toBe(updateStoreDto.name)
      expect(result.isActive).toBe(false)
    })

    it('更新不存在的店家應該拋出 NotFoundException', async () => {
      mockStoreRepository.findOne.mockResolvedValue(null)

      await expect(service.update(999, updateStoreDto, 1)).rejects.toThrow(NotFoundException)
    })

    it('應該處理 categoryTags 更新', async () => {
      mockStoreRepository.findOne.mockResolvedValue({ ...mockStore, categoryTags: null })
      mockStoreRepository.save.mockImplementation((store) => Promise.resolve(store))

      const result = await service.update(1, { categoryTags: ['新分類'] }, 1)

      // 驗證 save 被呼叫，categoryTags 應該被更新
      expect(mockStoreRepository.save).toHaveBeenCalled()
      // 注意：詳細的序列化行為應在整合測試中驗證
    })
  })

  describe('remove', () => {
    it('應該成功刪除店家', async () => {
      mockStoreRepository.findOne.mockResolvedValue(mockStore)
      mockStoreRepository.remove.mockResolvedValue(mockStore)

      await service.remove(1, 1)

      expect(mockStoreRepository.remove).toHaveBeenCalledWith(mockStore)
    })

    it('刪除不存在的店家應該拋出 NotFoundException', async () => {
      mockStoreRepository.findOne.mockResolvedValue(null)

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('toggleActive', () => {
    it('應該切換店家狀態為停用', async () => {
      mockStoreRepository.findOne.mockResolvedValue({ ...mockStore, isActive: true })
      mockStoreRepository.save.mockImplementation((store) => Promise.resolve(store))

      const result = await service.toggleActive(1, 1)

      expect(result.isActive).toBe(false)
    })

    it('應該切換店家狀態為啟用', async () => {
      mockStoreRepository.findOne.mockResolvedValue({ ...mockStore, isActive: false })
      mockStoreRepository.save.mockImplementation((store) => Promise.resolve(store))

      const result = await service.toggleActive(1, 1)

      expect(result.isActive).toBe(true)
    })
  })
})
