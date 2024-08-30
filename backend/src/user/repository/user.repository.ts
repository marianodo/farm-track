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
