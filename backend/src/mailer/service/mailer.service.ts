import { Email } from 'src/mailer/providers/email/email';
import { Injectable, Inject, Scope } from '@nestjs/common';
import { SendEmailDto } from '../dto/send-email.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class MailerService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private emailProvider: Email,
  ) {}
  async sendEmail(body: SendEmailDto) {
    try {
      const { from, subjectEmail, sendTo } = body;
      const html = this.getTemplate(body);
      await this.emailProvider.sendEmail(from, subjectEmail, sendTo, html);
      return 'Email enviado con exito!';
    } catch (error) {
      throw error;
    }
  }

  getTemplate(body) {
    const baseUrl = `${this.request.protocol}://${this.request.get('host')}`;
    const template = this.getTemplateFile(body.template);
    const html = template.fillTemplate(body, baseUrl);
    return html;
  }

  getTemplateFile(templateName) {
    const path = '../templates';
    const templateFile = require!(`${path}/${templateName}`);
    return templateFile;
  }
}
