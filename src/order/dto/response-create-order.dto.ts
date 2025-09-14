import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';
import { Product, User } from 'src/db/entities';

export class ResponseCreateOrderDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  user: User;

  @ApiProperty()
  product: Product;

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: '700.00' })
  totalPrice: number;

  @ApiProperty({ example: '2025-09-14T21:19:56.000Z' })
  createdAt: Date;
}
