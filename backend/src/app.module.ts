import { MailerModule } from './mailer/mailer.module';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [MailerModule, UserModule, AuthModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
