import { Email } from 'src/mailer/providers/email/email';
import { MailerService } from 'src/mailer/service/mailer.service';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserController } from './controller/user.controller';
import { UserRepository } from './repository/user.repository';
import { UserService } from './service/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaService, MailerService, Email],
})
export class UserModule {}
