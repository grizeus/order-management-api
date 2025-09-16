import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto';
import { Order, User, Product } from '../db/entities';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;

  const mockUser: Partial<User> = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    balance: 1000,
  };

  const mockProduct: Partial<Product> = {
    id: 'product-1',
    name: 'Test Product',
    price: 100,
    stock: 10,
  };

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
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            createOrder: jest.fn(),
            getOrdersByUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
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

    it('should create an order successfully', async () => {
      jest
        .spyOn(orderService, 'createOrder')
        .mockResolvedValue(mockOrder as Order);

      const result = await controller.createOrder(createOrderDto);

      expect(orderService.createOrder).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual(mockOrder);
    });

    it('should throw BadRequestException when service throws BadRequestException', async () => {
      jest
        .spyOn(orderService, 'createOrder')
        .mockRejectedValue(new BadRequestException('Invalid input'));

      await expect(controller.createOrder(createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException when service throws ForbiddenException', async () => {
      jest
        .spyOn(orderService, 'createOrder')
        .mockRejectedValue(new ForbiddenException('Insufficient balance'));

      await expect(controller.createOrder(createOrderDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when service throws NotFoundException', async () => {
      jest
        .spyOn(orderService, 'createOrder')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.createOrder(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getOrdersByUser', () => {
    it('should return orders for a user', async () => {
      const mockOrders = [mockOrder];
      jest
        .spyOn(orderService, 'getOrdersByUser')
        .mockResolvedValue(mockOrders as Order[]);

      const result = await controller.getOrdersByUser('user-1');

      expect(orderService.getOrdersByUser).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockOrders);
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest
        .spyOn(orderService, 'getOrdersByUser')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(
        controller.getOrdersByUser('non-existent-user'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
