import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { Order, OrderStatus } from '../entities/order.entity'
import { OrderItem } from '../entities/order-item.entity'
import { Store } from '../entities/store.entity'
import { Item } from '../entities/item.entity'
import { NotificationsSchedulerService } from '../notifications/notifications-scheduler.service'

describe('OrdersService', () => {
  let service: OrdersService
  let orderRepository: any
  let orderItemRepository: any
  let storeRepository: any
  let itemRepository: any

  const mockStore: Partial<Store> = {
    id: 1,
    name: '測試店家',
    isActive: true,
    organizerId: 1,
  }

  const mockItem: Partial<Item> = {
    id: 1,
    name: '測試品項',
    price: 100,
    isActive: true,
    storeId: 1,
  }

  const mockOrder: Partial<Order> = {
    id: 1,
    name: '測試訂單',
    deadline: new Date('2026-12-31T23:59:59Z'),
    shareToken: 'test-token-123',
    status: OrderStatus.OPEN,
    storeId: 1,
    organizerId: 1,
    store: mockStore as Store,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockOrderItem: Partial<OrderItem> = {
    id: 1,
    participantName: '測試者',
    quantity: 2,
    subtotal: 200,
    orderId: 1,
    itemId: 1,
  }

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockOrderItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  }

  const mockStoreRepository = {
    findOne: jest.fn(),
  }

  const mockItemRepository = {
    findOne: jest.fn(),
  }

  const mockNotificationsSchedulerService = {
    sendOrderStartedNotification: jest.fn(),
    sendOrderSummaryNotification: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: getRepositoryToken(Store),
          useValue: mockStoreRepository,
        },
        {
          provide: getRepositoryToken(Item),
          useValue: mockItemRepository,
        },
        {
          provide: NotificationsSchedulerService,
          useValue: mockNotificationsSchedulerService,
        },
      ],
    }).compile()

    service = module.get<OrdersService>(OrdersService)
    orderRepository = module.get(getRepositoryToken(Order))
    orderItemRepository = module.get(getRepositoryToken(OrderItem))
    storeRepository = module.get(getRepositoryToken(Store))
    itemRepository = module.get(getRepositoryToken(Item))

    jest.clearAllMocks()
  })

  describe('create', () => {
    const createOrderDto = {
      name: '午餐訂單',
      deadline: new Date('2026-12-31T12:00:00Z'),
      storeId: 1,
    }

    it('應該成功建立訂單', async () => {
      mockStoreRepository.findOne.mockResolvedValue(mockStore)
      mockOrderRepository.create.mockReturnValue(mockOrder)
      mockOrderRepository.save.mockResolvedValue(mockOrder)

      const result = await service.create(createOrderDto, 1)

      expect(result.name).toBe(mockOrder.name)
      expect(mockOrderRepository.create).toHaveBeenCalled()
      expect(mockOrderRepository.save).toHaveBeenCalled()
    })

    it('店家不存在時應該拋出 NotFoundException', async () => {
      mockStoreRepository.findOne.mockResolvedValue(null)

      await expect(service.create(createOrderDto, 1)).rejects.toThrow(NotFoundException)
    })

    it('截止時間在過去應該拋出 BadRequestException', async () => {
      mockStoreRepository.findOne.mockResolvedValue(mockStore)

      const pastDeadline = {
        ...createOrderDto,
        deadline: new Date('2020-01-01T00:00:00Z'),
      }

      await expect(service.create(pastDeadline, 1)).rejects.toThrow(BadRequestException)
    })

    it('應該產生唯一的 shareToken', async () => {
      mockStoreRepository.findOne.mockResolvedValue(mockStore)
      mockOrderRepository.create.mockImplementation((data) => ({
        ...mockOrder,
        ...data,
      }))
      mockOrderRepository.save.mockImplementation((order) => Promise.resolve(order))

      await service.create(createOrderDto, 1)

      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          shareToken: expect.any(String),
        })
      )
    })
  })

  describe('findAll', () => {
    it('應該返回該召集人的所有訂單', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder])

      const result = await service.findAll(1)

      expect(result).toHaveLength(1)
      expect(mockOrderRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizerId: 1 },
        })
      )
    })
  })

  describe('findOne', () => {
    it('應該返回訂單詳情', async () => {
      mockOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        items: [mockOrderItem],
      })

      const result = await service.findOne(1, 1)

      expect(result.id).toBe(1)
    })

    it('訂單不存在時應該拋出 NotFoundException', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('findByToken', () => {
    it('應該透過 token 找到訂單', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder)

      const result = await service.findByToken('test-token-123')

      expect(result.shareToken).toBe('test-token-123')
    })

    it('token 無效時應該拋出 NotFoundException', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null)

      await expect(service.findByToken('invalid-token')).rejects.toThrow(NotFoundException)
    })
  })

  describe('submitOrder', () => {
    const submitOrderDto = {
      participantName: '小明',
      items: [{ itemId: 1, quantity: 2 }],
    }

    it('應該成功提交點餐', async () => {
      mockOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.OPEN,
        deadline: new Date('2026-12-31T23:59:59Z'),
      })
      mockItemRepository.findOne.mockResolvedValue(mockItem)
      mockOrderItemRepository.create.mockReturnValue(mockOrderItem)
      mockOrderItemRepository.save.mockResolvedValue([mockOrderItem])
      mockOrderItemRepository.delete.mockResolvedValue({ affected: 0 })

      await expect(service.submitOrder('test-token-123', submitOrderDto)).resolves.not.toThrow()
      expect(mockOrderItemRepository.save).toHaveBeenCalled()
    })

    it('訂單已關閉時應該拋出 BadRequestException', async () => {
      mockOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CLOSED,
      })

      await expect(service.submitOrder('test-token-123', submitOrderDto)).rejects.toThrow(BadRequestException)
    })

    it('訂單已過截止時間應該拋出 BadRequestException', async () => {
      mockOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.OPEN,
        deadline: new Date('2020-01-01T00:00:00Z'),
      })

      await expect(service.submitOrder('test-token-123', submitOrderDto)).rejects.toThrow(BadRequestException)
    })

    it('品項不存在時應該拋出 NotFoundException', async () => {
      mockOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.OPEN,
        deadline: new Date('2026-12-31T23:59:59Z'),
      })
      mockItemRepository.findOne.mockResolvedValue(null)
      mockOrderItemRepository.delete.mockResolvedValue({ affected: 0 })

      await expect(service.submitOrder('test-token-123', submitOrderDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('應該成功更新訂單名稱', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder })
      mockOrderRepository.save.mockImplementation((order) => Promise.resolve(order))

      const result = await service.update(1, { name: '更新後的訂單' }, 1)

      expect(result.name).toBe('更新後的訂單')
    })

    it('更新截止時間為過去應該拋出 BadRequestException', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder })

      await expect(
        service.update(1, { deadline: new Date('2020-01-01T00:00:00Z') }, 1)
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('remove', () => {
    it('應該成功刪除訂單', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder)
      mockOrderRepository.remove.mockResolvedValue(mockOrder)

      await service.remove(1, 1)

      expect(mockOrderRepository.remove).toHaveBeenCalled()
    })
  })

  describe('regenerateToken', () => {
    it('應該成功重新產生 token', async () => {
      const originalToken = mockOrder.shareToken
      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder })
      mockOrderRepository.save.mockImplementation((order) => Promise.resolve(order))

      const result = await service.regenerateToken(1, 1)

      expect(result.shareToken).not.toBe(originalToken)
    })
  })

  describe('cancelOrder', () => {
    it('應該成功取消點餐', async () => {
      mockOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.OPEN,
        deadline: new Date('2026-12-31T23:59:59Z'),
      })
      mockOrderItemRepository.delete.mockResolvedValue({ affected: 1 })

      await expect(service.cancelOrder('test-token-123', '小明')).resolves.not.toThrow()
      expect(mockOrderItemRepository.delete).toHaveBeenCalled()
    })

    it('訂單已關閉時應該拋出 BadRequestException', async () => {
      mockOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CLOSED,
      })

      await expect(service.cancelOrder('test-token-123', '小明')).rejects.toThrow(BadRequestException)
    })
  })
})
