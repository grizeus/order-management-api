import {
  Body,
  Controller,
  Logger,
  Post,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from '../db/entities/orders.entity';
import { ResponseCreateOrderDto } from './dto/response-create-order.dto';
import { ResponseGetOrderDto } from './dto/response-get-order.dto';

@Controller('api/orders')
@ApiTags('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);
  constructor(private readonly orderService: OrderService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
    type: ResponseCreateOrderDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or insufficient balance/stock',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or product not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient balance/stock',
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests, please try again later',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    this.logger.log(`Creating order for user ${createOrderDto.userId}`);
    return this.orderService.createOrder(createOrderDto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get orders by user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orders retrieved successfully',
    type: [ResponseGetOrderDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async getOrdersByUser(@Param('userId') userId: string): Promise<Order[]> {
    this.logger.log(`Getting orders for user ${userId}`);
    return this.orderService.getOrdersByUser(userId);
  }
}
