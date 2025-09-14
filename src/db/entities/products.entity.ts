import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from './index';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Product {
  @ApiProperty({example: '123e4567-e89b-12d3-a456-426614174000'})
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({example: 'AAPL'})
  @Column()
  name: string;

  @ApiProperty({example: '100.00'})
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({example: 10})
  @Column('integer')
  stock: number;

  @OneToMany(() => Order, (order) => order.product)
  orders: Order[];
}
