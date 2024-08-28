import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { CreateUserDto } from './../dto/create-user.dto';
import { MailerService } from './../../mailer/service/mailer.service';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
  ) { }

  async createUser(createUserDto: CreateUserDto) {
    try {
      // Crear el usuario utilizando el repositorio
      const user = await this.userRepository.createUser(createUserDto);

      // Enviar el correo electrónico utilizando el servicio de correo
      const sendEmailDto = {
        from: `Welcome Farm Track <${process.env.MAIL_USER}>`,
        subjectEmail: 'Envio de mail automatico!',
        sendTo: user.email,
        template: "welcome"
      };

      try {
        await this.mailerService.sendEmail(sendEmailDto);
      } catch (emailError) {
        // Si falla el envío del correo, loguea el error y lanza una excepción
        console.error('Failed to send email:', emailError.message);
        throw new InternalServerErrorException('User created, but failed to send the email.');
      }
      return user;
    } catch (error) {
      throw error
    }
  }

  async deleteUserById(id: string) {
    try {
      return await this.userRepository.deleteUserById(id);
    } catch (error) {
      throw error
    }
  }
}
