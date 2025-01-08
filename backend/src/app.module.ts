import { MailerModule } from './mailer/mailer.module';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { FieldModule } from './field/field.module';
import { VariableModule } from './variable/variable.module';
import { TypeOfObjectsModule } from './type_of_objects/type_of_objects.module';
import { PenModule } from './pen/pen.module';
import { PenVariableTypeOfObjectModule } from './pen_variable_type-of-object/pen_variable_type-of-object.module';
import { MeasurementModule } from './measurement/measurement.module';
import { SubjectModule } from './subject/subject.module';
import { ReportModule } from './report/report.module';
// import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [
            // module in which the PrismaClient is provided
            PrismaModule,
          ],
          adapter: new TransactionalAdapterPrisma({
            // the injection token of the PrismaClient
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
      global: true,
      middleware: { mount: true },
    }),
    MailerModule,
    UserModule,
    AuthModule,
    FieldModule,
    VariableModule,
    TypeOfObjectsModule,
    PenModule,
    PenVariableTypeOfObjectModule,
    ReportModule,
    MeasurementModule,
    SubjectModule,
    // DatabaseModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
