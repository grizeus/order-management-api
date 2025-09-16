import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderService } from './order.service';
import { Order, User, Product } from '../db/entities';
import { CreateOrderDto } from './dto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: Repository<Order>;
  let userRepository: Repository<User>;
  let productRepository: Repository<Product>;
  let dataSource: DataSource;

  const mockDataSource = () => ({
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
      },
    } as any),
  });

  const mockUser: Partial<User> = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    balance: 1000, // This is the default balance
  };

  const mockProduct: Partial<Product> = {
    id: 'product-1',
    name: 'Test Product',
    price: 100,
    stock: 10,
  };

  const getFreshMockUser = () => ({
    ...mockUser,
    balance: 1000,
  });

  const mockOrder: Partial<Order> = {
    id: 'order-1',
    user: mockUser as User,
    product: mockProduct as Product,
    quantity: 2,
    totalPrice: 200,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useFactory: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    dataSource = module.get<DataSource>(DataSource);

    jest.clearAllMocks();

    const queryRunnerMock = dataSource.createQueryRunner();
    (queryRunnerMock.manager.findOne as jest.Mock).mockImplementation(
      (_, options) => {
        if (options?.where?.id === 'user-1') {
          return Promise.resolve(getFreshMockUser());
        }
        return Promise.resolve(mockProduct);
      },
    );

    (queryRunnerMock.manager.save as jest.Mock).mockImplementation((entity) => {
      if ('balance' in entity) {
        return Promise.resolve(entity);
      }
      if ('stock' in entity) {
        return Promise.resolve(entity);
      }
      return Promise.resolve(mockOrder);
    });

    jest.spyOn(orderRepository, 'create').mockReturnValue(mockOrder as Order);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const createOrderDto: CreateOrderDto = {
      userId: 'user-1',
      productId: 'product-1',
      quantity: 2,
    };

    let queryRunnerMock: any;

    beforeEach(() => {
      queryRunnerMock = dataSource.createQueryRunner();
      (queryRunnerMock.manager.findOne as jest.Mock).mockImplementation(
        (_, options) => {
          if (options?.where?.id === 'user-1') {
            return Promise.resolve(getFreshMockUser());
          }
          return Promise.resolve(mockProduct);
        },
      );

      (queryRunnerMock.manager.save as jest.Mock).mockImplementation(
        (entity) => {
          if ('balance' in entity) {
            return Promise.resolve(entity);
          }
          if ('stock' in entity) {
            return Promise.resolve(entity);
          }
          return Promise.resolve(mockOrder);
        },
      );

      jest.spyOn(orderRepository, 'create').mockReturnValue(mockOrder as Order);
    });

    it('should create an order successfully', async () => {
      const result = await service.createOrder(createOrderDto);

      expect(queryRunnerMock.connect).toHaveBeenCalled();
      expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.manager.findOne).toHaveBeenCalledWith(User, {
        where: { id: createOrderDto.userId },
        lock: { mode: 'pessimistic_write' },
      });
      expect(queryRunnerMock.manager.save).toHaveBeenCalledTimes(3);
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should throw BadRequestException for invalid quantity', async () => {
      await expect(
        service.createOrder({ ...createOrderDto, quantity: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      (queryRunnerMock.manager.findOne as jest.Mock).mockReset();
      (queryRunnerMock.manager.findOne as jest.Mock).mockResolvedValueOnce(
        null,
      );

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for non-existent product', async () => {
      (queryRunnerMock.manager.findOne as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce(getFreshMockUser())
        .mockResolvedValueOnce(null);

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for out of stock product', async () => {
      (queryRunnerMock.manager.findOne as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce(getFreshMockUser())
        .mockResolvedValueOnce({ ...mockProduct, stock: 0 });

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException for insufficient stock', async () => {
      (queryRunnerMock.manager.findOne as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce(getFreshMockUser())
        .mockResolvedValueOnce({ ...mockProduct, stock: 1 });

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException for insufficient balance', async () => {
      (queryRunnerMock.manager.findOne as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce({ ...getFreshMockUser(), balance: 100 })
        .mockResolvedValueOnce(mockProduct);

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should handle transaction rollback on error', async () => {
      (queryRunnerMock.manager.findOne as jest.Mock)
        .mockResolvedValueOnce(getFreshMockUser())
        .mockResolvedValueOnce(mockProduct);

      const saveSpy = jest
        .fn()
        .mockImplementationOnce(() => {
          // First save - user
          return Promise.resolve({
            ...getFreshMockUser(),
            balance: getFreshMockUser().balance - 200,
          });
        })
        .mockImplementationOnce(() => {
          return Promise.resolve({
            ...mockProduct,
            stock: mockProduct.stock - 2,
          });
        })
        .mockImplementationOnce(() => {
          return Promise.reject(new Error('Internal server error'));
        });

      (queryRunnerMock.manager.save as jest.Mock) = saveSpy;

      const mockCreatedOrder = {
        ...mockOrder,
        user: getFreshMockUser(),
        product: mockProduct,
      };

      jest
        .spyOn(orderRepository, 'create')
        .mockReturnValue(mockCreatedOrder as Order);
      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        'Internal server error',
      );

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();

      expect(saveSpy).toHaveBeenCalledTimes(3);

      expect(saveSpy.mock.calls[0][0]).toMatchObject({
        balance: expect.any(Number),
      });
      expect(saveSpy.mock.calls[1][0]).toMatchObject({
        stock: expect.any(Number),
      });
      expect(saveSpy.mock.calls[2][0]).toMatchObject({
        id: 'order-1',
        quantity: 2,
        totalPrice: 200,
      });
    });

    it('should handle concurrent purchases of the last item in stock', async () => {
      const lowStockProduct = { ...mockProduct, stock: 1 };

      const createMockQueryRunner = () => ({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        isReleased: false,
        isTransactionActive: false,
        manager: {
          findOne: jest.fn(),
          save: jest.fn(),
          connection: { driver: {} },
        },
        query: jest.fn(),
      });

      const successQueryRunner = {
        ...createMockQueryRunner(),
        manager: {
          ...createMockQueryRunner().manager,
          findOne: jest.fn().mockImplementation((_, options) => {
            if (options?.where?.id === 'user-1') {
              return Promise.resolve({ ...getFreshMockUser(), id: 'user-1' });
            }
            return Promise.resolve(lowStockProduct);
          }),
          save: jest
            .fn()
            .mockImplementationOnce(() =>
              Promise.resolve({
                ...getFreshMockUser(),
                balance: getFreshMockUser().balance - 100,
              }),
            )
            .mockImplementationOnce(() =>
              Promise.resolve({ ...lowStockProduct, stock: 0 }),
            )
            .mockImplementation(() => Promise.resolve(mockOrder)),
        },
      };

      const failQueryRunner = {
        ...createMockQueryRunner(),
        manager: {
          ...createMockQueryRunner().manager,
          findOne: jest.fn().mockImplementation((_, options) => {
            if (options?.where?.id === 'user-2') {
              return Promise.resolve({ ...getFreshMockUser(), id: 'user-2' });
            }
            return Promise.resolve({ ...lowStockProduct, stock: 0 });
          }),
          save: jest.fn(),
        },
      };

      jest
        .spyOn(dataSource, 'createQueryRunner')
        .mockReturnValueOnce(successQueryRunner as any)
        .mockReturnValueOnce(failQueryRunner as any);

      jest.spyOn(orderRepository, 'create').mockReturnValue(mockOrder as Order);

      const createConcurrentOrderDto: CreateOrderDto = {
        ...createOrderDto,
        quantity: 1,
      };
      const firstUserDto = { ...createConcurrentOrderDto, userId: 'user-1' };
      const secondUserDto = { ...createConcurrentOrderDto, userId: 'user-2' };

      const [firstResult, secondResult] = (await Promise.allSettled([
        service.createOrder(firstUserDto),
        service.createOrder(secondUserDto),
      ])) as [PromiseFulfilledResult<Order>, PromiseRejectedResult];
      expect(firstResult.status).toBe('fulfilled');
      if (firstResult.status === 'fulfilled') {
        expect(firstResult.value).toEqual(mockOrder);
      }

      expect(secondResult.status).toBe('rejected');
      if (secondResult.status === 'rejected') {
        expect(secondResult.reason).toBeInstanceOf(ForbiddenException);
        expect(secondResult.reason.message).toBe('Product is out of stock');
      }

      expect(successQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(failQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should allow order when user balance exactly matches order total', async () => {
      const exactBalanceUser = { ...getFreshMockUser(), balance: 200 }; // 2 items * 100 each
      (queryRunnerMock.manager.findOne as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce(exactBalanceUser)
        .mockResolvedValueOnce(mockProduct);

      (queryRunnerMock.manager.save as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce({ ...exactBalanceUser, balance: 0 })
        .mockResolvedValueOnce({ ...mockProduct, stock: 8 })
        .mockResolvedValueOnce(mockOrder);

      await service.createOrder(createOrderDto);

      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.manager.save as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({ balance: 0 }),
      );
    });

    it('should allow order when product stock exactly matches order quantity', async () => {
      const exactStockProduct = { ...mockProduct, stock: 2 };
      (queryRunnerMock.manager.findOne as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce(getFreshMockUser())
        .mockResolvedValueOnce(exactStockProduct);

      (queryRunnerMock.manager.save as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce({ ...getFreshMockUser(), balance: 800 })
        .mockResolvedValueOnce({ ...exactStockProduct, stock: 0 })
        .mockResolvedValueOnce(mockOrder);

      await service.createOrder(createOrderDto);

      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.manager.save as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({ stock: 0 }),
      );
    });

    it('should use the product price at the time of order creation', async () => {
      const priceChangeProduct = { ...mockProduct, price: 150 };
      (queryRunnerMock.manager.findOne as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce(getFreshMockUser())
        .mockResolvedValueOnce(priceChangeProduct);

      const expectedTotal = priceChangeProduct.price * createOrderDto.quantity;
      const expectedOrder = {
        ...mockOrder,
        totalPrice: expectedTotal,
        product: { ...priceChangeProduct, price: 150 },
      };

      (queryRunnerMock.manager.save as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce({
          ...getFreshMockUser(),
          balance: getFreshMockUser().balance - expectedTotal,
        })
        .mockResolvedValueOnce({ ...priceChangeProduct, stock: 8 })
        .mockResolvedValueOnce(expectedOrder);

      const result = await service.createOrder(createOrderDto);

      expect(result.totalPrice).toBe(expectedTotal);
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    });

    it('should handle product going out of stock between checking and purchasing', async () => {
      (queryRunnerMock.manager.findOne as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce(getFreshMockUser())
        .mockResolvedValueOnce({ ...mockProduct, stock: 1 });

      (queryRunnerMock.manager.save as jest.Mock)
        .mockReset()
        .mockImplementationOnce(() => {
          (queryRunnerMock.manager.findOne as jest.Mock)
            .mockReset()
            .mockResolvedValueOnce(getFreshMockUser())
            .mockResolvedValueOnce({ ...mockProduct, stock: 0 });
          return Promise.resolve({ ...getFreshMockUser(), balance: 800 });
        })
        .mockRejectedValueOnce(new Error('Insufficient stock'));

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        'Insufficient stock',
      );

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });

    it('should rollback all changes if any part of the transaction fails', async () => {
      (queryRunnerMock.manager.findOne as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce(getFreshMockUser())
        .mockResolvedValueOnce(mockProduct);

      (queryRunnerMock.manager.save as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce({ ...getFreshMockUser(), balance: 800 })
        .mockRejectedValueOnce(new Error('Database error during stock update'));

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        'Internal server error',
      );

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();

      expect(queryRunnerMock.manager.save as jest.Mock).toHaveBeenCalledTimes(
        2,
      );
    });
  });

  describe('getOrdersByUser', () => {
    it('should return orders for a user', async () => {
      const mockOrders = [mockOrder];
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(getFreshMockUser() as User);
      jest
        .spyOn(orderRepository, 'find')
        .mockResolvedValue(mockOrders as Order[]);

      const result = await service.getOrdersByUser('user-1');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-1' } },
        relations: ['product'],
      });
      expect(result).toEqual(mockOrders);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.getOrdersByUser('non-existent-user'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
