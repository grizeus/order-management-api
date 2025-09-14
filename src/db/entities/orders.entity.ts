import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User, Product } from './index';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Order {
  @ApiProperty({example: '123e4567-e89b-12d3-a456-426614174000'})
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToOne(() => Product, (product) => product.orders)
  product: Product; 

  @ApiProperty({example: 7})
  @Column('integer')
  quantity: number;

  @ApiProperty({example: '70.00'})
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalPrice() {
    if (this.product && this.quantity) {
      this.totalPrice = this.product.price * this.quantity;
    }
  }
}
