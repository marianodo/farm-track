import { Email } from 'src/mailer/providers/email/email';
import { Injectable } from '@nestjs/common';
import { SendEmailDto } from '../dto/send-email.dto';

@Injectable()
export class MailerService {

  constructor(
    private emailProvider: Email
  ) { }
  async sendEmail(body: SendEmailDto) {
    try {
      const { from, subjectEmail, sendTo } = body
      const html = this.getTemplate(body)
      await this.emailProvider.sendEmail(from, subjectEmail, sendTo, html)
      return "Email enviado con exito!"
    } catch (error) {
      throw error
    }
  }

  getTemplate(body) {
    const template = this.getTemplateFile(body.template)
    const html = template.fillTemplate(body)
    return html
  }

  getTemplateFile(templateName) {
    const path = "../templates"
    const templateFile = require(`${path}/${templateName}`)
    return templateFile
  }
}
