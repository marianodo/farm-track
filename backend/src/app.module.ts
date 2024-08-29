import { MailerModule } from './mailer/mailer.module';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [MailerModule, UserModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule { }
