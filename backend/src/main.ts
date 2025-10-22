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
import { validateEnvironment } from './config/env.config';

dotenvConfig();

console.log(typeof process.env.TOKEN_EXPIRES);

// Validate environment variables
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
  process.exit(1);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Configuración CORS para Railway
  app.enableCors({
    origin: [
      'https://www.bd-metrics.com',
      'https://bd-metrics.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Accept', 
      'Authorization', 
      'X-Requested-With',
      'Origin'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
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
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on port ${port}`);
}
bootstrap();
