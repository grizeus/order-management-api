import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  clerkUserId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}
