import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../db/entities';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async syncUser(createUserDto: CreateUserDto): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { clerkUserId: createUserDto.clerkUserId },
    });

    if (user) {
      user = await this.userRepository.save({
        ...user,
        ...createUserDto,
      });
    } else {
      user = this.userRepository.create(createUserDto);
      user = await this.userRepository.save(user);
    }

    return user;
  }

  async findByClerkId(clerkUserId: string): Promise<User> {
    return this.userRepository.findOne({
      where: { clerkUserId },
    });
  }
}
