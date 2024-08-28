import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenvConfig({ path: envFile });

console.log(`Loaded environment from ${envFile}`);
console.log(`Loaded environment from ${process.env.MAIL_USER}`);
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      },
    }),
  )
  await app.listen(4000);
}
bootstrap();
