import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly db: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerUser() {}

  async loginUser(loginAuthDto: LoginAuthDto) {
    try {
      const { email, password } = loginAuthDto;
      const findUser = await this.db.user.findFirst({
        where: { email },
      });
      if (!findUser) throw new NotFoundException('User not found');

      const checkPassword = await compare(password, findUser.password);

      if (!checkPassword) throw new ForbiddenException('Password incorrect');

      const payload = {
        userId: findUser.id,
        username: findUser.username,
        email: findUser.email,
        isVerified: findUser.is_verified,
        role: findUser.role,
      };
      const token = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '20d',
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
      console.log('reposityory', user);
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
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while login user.',
      );
    }
  }
}
