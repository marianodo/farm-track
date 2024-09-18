import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUsersWithFields(includeFields: boolean): Promise<User[]> {
    try {
      return this.userRepository.findAllUsers(includeFields);
    } catch (error) {
      throw error;
    }
  }

  async deleteUserById(id: string) {
    try {
      return await this.userRepository.deleteUserById(id);
    } catch (error) {
      throw error;
    }
  }
}
