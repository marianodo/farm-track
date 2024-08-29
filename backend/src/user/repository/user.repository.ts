import * as bcrypt from 'bcrypt';

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { CreateUserDto } from './../dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository {
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  constructor(private readonly db: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await this.hashPassword(createUserDto.password);
      return await this.db.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
    } catch (error) {
      // Lanza el error al servicio para que lo maneje
      if (error.code === 'P2002') {
        // Código de error para violación de unicidad en Prisma
        throw new ConflictException('User already exists.');
      } else if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An error occurred while creating the user.',
        );
      }
    }
  }

  async deleteUserById(id: string): Promise<User> {
    try {
      return await this.db.user.delete({
        where: { id },
      });
    } catch (error) {
      console.log('Repository error:', error);
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
