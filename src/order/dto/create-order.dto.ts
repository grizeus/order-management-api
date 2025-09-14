import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'db67139a-72fd-43df-a28c-f0bb9eaa9e99' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'b024a7bd-31f3-4d7a-a4f0-36a098e67f62' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  quantity: number;
}
