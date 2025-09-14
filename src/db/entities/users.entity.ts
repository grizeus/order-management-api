import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Order } from './index';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({example: '123e4567-e89b-12d3-a456-426614174000'})
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({example: 'John Doe'})
  @Column()
  name: string;

  @ApiProperty({example: 'john.doe@example.com'})
  @Column({ unique: true })
  email: string;

  @ApiProperty({example: '100.00'})
  @Column({ default: 100, type: 'decimal', precision: 10, scale: 2 })
  balance: number;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
