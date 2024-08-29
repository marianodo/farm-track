import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
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

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  constructor(private readonly db: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const verificationToken = this.generateVerificationToken();
      const hashedPassword = await this.hashPassword(createUserDto.password);
      return await this.db.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
          verification_token: verificationToken,
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

  async verifyUser(token: string): Promise<string> {
    try {
      const user = await this.db.user.findFirst({
        where: { verification_token: token },
      });
      if (!user) {
        throw new NotFoundException('Invalid verification token');
      }

      await this.db.user.update({
        where: { id: user.id },
        data: {
          is_verified: true,
          verification_token: null,
        },
      });

      return 'User successfully verified';
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while verifying user.',
      );
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
