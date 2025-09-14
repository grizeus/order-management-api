import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export declare class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 100, type: 'decimal', precision: 10, scale: 2 })
  balance: number;
}
