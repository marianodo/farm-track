import { MailerModule } from './mailer/mailer.module';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { FieldModule } from './field/field.module';
import { VariableModule } from './variable/variable.module';
import { TypeOfObjectsModule } from './type_of_objects/type_of_objects.module';

@Module({
  imports: [MailerModule, UserModule, AuthModule, FieldModule, VariableModule, TypeOfObjectsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
