import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  findOne(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }
  create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
