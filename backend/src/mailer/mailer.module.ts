import { Email } from './providers/email/email';
import { MailerController } from './controller/mailer.controller';
import { MailerService } from './service/mailer.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [MailerController],
  providers: [MailerService, Email],
  exports: [MailerService],
})
export class MailerModule {}
