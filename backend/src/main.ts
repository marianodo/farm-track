import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { config as dotenvConfig } from 'dotenv';
import * as morgan from 'morgan';
dotenvConfig();

console.log(typeof process.env.TOKEN_EXPIRES);
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(morgan('dev'));
  app.useGlobalFilters(new HttpExceptionFilter());
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
