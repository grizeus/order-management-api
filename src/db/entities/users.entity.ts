import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Order } from './index';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 100, type: 'decimal', precision: 10, scale: 2 })
  balance: number;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
