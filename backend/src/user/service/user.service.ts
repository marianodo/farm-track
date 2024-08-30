import { Injectable } from '@nestjs/common';

import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async deleteUserById(id: string) {
    try {
      return await this.userRepository.deleteUserById(id);
    } catch (error) {
      throw error;
    }
  }
}
