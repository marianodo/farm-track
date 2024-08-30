import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { LoginAuthDto } from '../dto/login-auth.dto';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}
  async registerUser() {
    return await this.authRepository.registerUser;
  }

  async loginUser(loginAuthDto: LoginAuthDto) {
    return await this.authRepository.loginUser(loginAuthDto);
  }

  async refreshToken(user) {
    return await this.authRepository.refreshToken(user);
  }
}
