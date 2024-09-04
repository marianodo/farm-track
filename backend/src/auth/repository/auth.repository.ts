import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { User } from '@prisma/client';
import { compare } from 'bcrypt';

@Injectable()
export class AuthRepository {
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  constructor(
    private readonly db: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerUser(registerAuthDto: RegisterAuthDto): Promise<User> {
    try {
      const verificationToken = this.generateVerificationToken();
      const hashedPassword = await this.hashPassword(registerAuthDto.password);
      return await this.db.user.create({
        data: {
          email: registerAuthDto.email,
          username: registerAuthDto.username,
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

  async loginUser(loginAuthDto: LoginAuthDto) {
    try {
      const { email, password } = loginAuthDto;
      const findUser = await this.db.user.findFirst({
        where: { email },
      });
      if (!findUser) throw new NotFoundException('User not found');

      const checkPassword = await compare(password, findUser.password);

      if (!checkPassword) throw new ForbiddenException('Password incorrect');

      if (findUser.is_verified === false)
        throw new ForbiddenException(
          'Verify your email and activate your account',
        );

      const payload = {
        userId: findUser.id,
        username: findUser.username,
        email: findUser.email,
        isVerified: findUser.is_verified,
        role: findUser.role,
      };
      const token = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
      });

      const data = {
        userId: findUser.id,
        username: findUser.username,
        email: findUser.email,
        isVerified: findUser.is_verified,
        role: findUser.role,
        accessToken: token,
        refreshToken,
      };
      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while login user.',
      );
    }
  }

  async refreshToken(user) {
    try {
      const { email } = user;
      const findUser = await this.db.user.findFirst({
        where: { email },
      });
      if (!findUser) throw new NotFoundException('User not found');

      const payload = {
        userId: findUser.id,
        username: findUser.username,
        email: findUser.email,
        isVerified: findUser.is_verified,
        role: findUser.role,
      };
      const token = await this.jwtService.signAsync(payload);

      const data = {
        accessToken: token,
      };
      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while login user.',
      );
    }
  }

  async verifyEmail(token: string): Promise<string> {
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
}
