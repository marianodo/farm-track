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

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
      });
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
      const token = await this.jwtService.signAsync(payload, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
      });
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
      });

      const data = {
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

      return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 30px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            max-width: 400px;
          }
          .success-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background-color: #487632;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 20px;
          }
          .check-mark {
            color: white;
            font-size: 40px;
            font-weight: bold;
          }
          h1 {
            color: #333;
            margin-bottom: 15px;
          }
          p {
            color: #666;
            margin-bottom: 20px;
          }
          .button {
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-circle">
            <span class="check-mark">✓</span>
          </div>
          <h1>Email Verified!</h1>
          <p>Your account has been successfully verified. You can now use all the features of our application.</p>
        </div>
      </body>
      </html>
      `;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Error</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 30px;
              background-color: white;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .error-circle {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background-color: #f44336;
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 0 auto 20px;
            }
            .error-mark {
              color: white;
              font-size: 40px;
              font-weight: bold;
            }
            h1 {
              color: #333;
              margin-bottom: 15px;
            }
            p {
              color: #666;
              margin-bottom: 20px;
            }
            .button {
              padding: 10px 20px;
              background-color: #f44336;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-circle">
              <span class="error-mark">✕</span>
            </div>
            <h1>Verification Error</h1>
            <p>The verification token is invalid or has expired.</p>
          </div>
        </body>
        </html>
        `;
      }
      return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 30px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            max-width: 400px;
          }
          .error-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background-color: #f44336;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 20px;
          }
          .error-mark {
            color: white;
            font-size: 40px;
            font-weight: bold;
          }
          h1 {
            color: #333;
            margin-bottom: 15px;
          }
          p {
            color: #666;
            margin-bottom: 20px;
          }
          .button {
            padding: 10px 20px;
            background-color: #f44336;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-circle">
            <span class="error-mark">✕</span>
          </div>
          <h1>Verification Error</h1>
          <p>An error occurred during verification. Please try again later.</p>
        </div>
      </body>
      </html>
      `;
    }
  }
}
