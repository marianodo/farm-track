import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { MailerService } from '../service/mailer.service';
import { SendEmailDto } from '../dto/send-email.dto';
import { Response } from 'express';

@Controller('email')
export class MailerController {
  constructor(private readonly mailerService: MailerService) { }

  @Post('send-email')
  async sendEmail(@Body() sendEmailDto: SendEmailDto, @Res() res: Response) {
    try {
      const response = await this.mailerService.sendEmail(sendEmailDto)
      res.status(HttpStatus.OK).send(response)
    } catch (error) {
      throw error
    }
  }
}
