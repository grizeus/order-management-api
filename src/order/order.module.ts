import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, User, Product } from '../db/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Product])],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
