import { MailerModule } from './mailer/mailer.module';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { FieldModule } from './field/field.module';

@Module({
  imports: [MailerModule, UserModule, AuthModule, FieldModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
