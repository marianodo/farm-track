import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { ChangePasswordDto } from '../dto/change-password.dto';
import * as bcrypt from 'bcrypt';

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

  async changePassword(
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { userId, currentPassword, newPassword } = changePasswordDto;

    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      if (currentPassword === newPassword) {
        throw new BadRequestException(
          'New password must be different from the current password',
        );
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await this.db.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return { message: 'Password updated successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while changing the password.',
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
