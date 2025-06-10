import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { config as dotenvConfig } from 'dotenv';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { UserResourceGuard } from './auth/guard/user-resource.guard';
import { RolesGuard } from './auth/guard/roles.guard';
import { OwnedResourceGuard } from './auth/guard/owned-resource.guard';
import { PrismaService } from './prisma/prisma.service';
dotenvConfig();

console.log(typeof process.env.TOKEN_EXPIRES);
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Permite cualquier origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    allowedHeaders: 'Content-Type, Accept, Authorization', // Encabezados permitidos
  });
  app.use(morgan('dev'));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalGuards(
    new JwtAuthGuard(new Reflector()),
    new UserResourceGuard(new Reflector()),
    new OwnedResourceGuard(new Reflector(), app.get(PrismaService)),
    new RolesGuard(new Reflector()),
  );
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(4000);
}
bootstrap();
