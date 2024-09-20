import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly db: PrismaService) {}

  async findAllUsers(includeFields: boolean = false): Promise<User[]> {
    try {
      const allUsers = await this.db.user.findMany({
        include: includeFields ? { fields: true } : undefined,
      });
      if (allUsers.length === 0) throw new NotFoundException('Users not found');
      return allUsers;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while retrieving users.',
      );
    }
  }

  async deleteUserById(id: string): Promise<User> {
    try {
      return await this.db.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        // Código de error para registro no encontrado en Prisma
        throw new NotFoundException('User not found.');
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the user.',
      );
    }
  }
}
