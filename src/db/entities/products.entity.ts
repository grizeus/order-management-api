import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export declare class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column('integer')
  stock: number;
}
