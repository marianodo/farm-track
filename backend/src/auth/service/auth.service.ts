import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { MailerService } from 'src/mailer/service/mailer.service';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly mailerService: MailerService,
  ) {}
  async registerUser(registerAuthDto: RegisterAuthDto) {
    try {
      // Crear el usuario utilizando el repositorio
      const user = await this.authRepository.registerUser(registerAuthDto);

      // Enviar el correo electrónico utilizando el servicio de correo
      const sendEmailDto = {
        from: `Welcome Farm Track <${process.env.MAIL_USER}>`,
        subjectEmail: 'Envio de mail automatico!',
        sendTo: user.email,
        template: 'welcome',
        verification_token: user.verification_token,
      };

      try {
        await this.mailerService.sendEmail(sendEmailDto);
      } catch (emailError) {
        // Si falla el envío del correo, loguea el error y lanza una excepción
        console.error('Failed to send email:', emailError.message);
        throw new InternalServerErrorException(
          'User created, but failed to send the email.',
        );
      }
      return 'User created successfully';
    } catch (error) {
      throw error;
    }
  }

  async loginUser(loginAuthDto: LoginAuthDto) {
    return await this.authRepository.loginUser(loginAuthDto);
  }

  async refreshToken(user) {
    return await this.authRepository.refreshToken(user);
  }

  async verifyEmail(token: string) {
    try {
      return await this.authRepository.verifyEmail(token);
    } catch (error) {
      throw error;
    }
  }
}
