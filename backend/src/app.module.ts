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

@Module({
  imports: [
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
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
