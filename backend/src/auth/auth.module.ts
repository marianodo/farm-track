import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRepository } from './repository/auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RefreshJwtStrategy } from './strategy/refreshToken.strategy';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRES },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    AuthRepository,
    JwtStrategy,
    RefreshJwtStrategy,
  ],
})
export class AuthModule {}
