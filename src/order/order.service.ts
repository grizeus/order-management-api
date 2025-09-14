import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../db/entities/orders.entity';
import { User } from '../db/entities/users.entity';
import { Product } from '../db/entities/products.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const { userId, productId, quantity } = createOrderDto;

    if (quantity <= 0) {
      this.logger.error(`Invalid quantity: ${quantity}`);
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        this.logger.error(`User ${userId} not found`);
        throw new NotFoundException('User not found');
      }

      const product = await queryRunner.manager.findOne(Product, {
        where: { id: productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product) {
        this.logger.error(`Product ${productId} not found`);
        throw new NotFoundException('Product not found');
      }

      if (product.stock === 0) {
        this.logger.error(`Product ${productId} is out of stock`);
        throw new ForbiddenException('Product is out of stock');
      }

      if (product.stock < quantity) {
        this.logger.error(`Insufficient stock for product ${productId}`);
        throw new BadRequestException('Insufficient stock');
      }

      const totalPrice = product.price * quantity;
      const totalPriceInCents = Math.round(totalPrice * 100);
      const balanceInCents = Math.round(user.balance * 100);

      if (balanceInCents < totalPriceInCents) {
        this.logger.error(`Insufficient balance for user ${userId}`);
        throw new ForbiddenException('Insufficient balance');
      }

      user.balance = Number(
        ((balanceInCents - totalPriceInCents) / 100).toFixed(2),
      );
      await queryRunner.manager.save(user);

      product.stock -= quantity;
      await queryRunner.manager.save(product);

      const order = this.orderRepository.create({
        user,
        product,
        quantity,
        totalPrice,
      });

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to create order: ${error.message}`,
        error.stack,
      );

      if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
        throw new HttpException(
          'Too many requests, please try again later',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    // 404 - Not Found
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.logger.error(`User ${userId} not found`);
      throw new NotFoundException('User not found');
    }

    // 200 - OK (implicit)
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });
  }
}
