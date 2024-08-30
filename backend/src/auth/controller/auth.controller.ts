import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  BadRequestException,
  // Patch,
  // Param,
  // Delete,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { RefreshJwtAuthGuard } from '../guard/refresh-jwt-auth.guard';
import { RegisterAuthDto } from '../dto/register-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED) // Establece el código de estado HTTP 201 (Created) si la solicitud es exitosa
  async egisterUser(@Body() registerAuthDto: RegisterAuthDto) {
    try {
      // Llama al servicio para crear el usuario
      const user = await this.authService.registerUser(registerAuthDto);
      return user;
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  loginUser(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.loginUser(loginAuthDto);
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refreshToken')
  refreshToken(@Request() req: any) {
    return this.authService.refreshToken(req.user);
  }

  @Get('verify')
  //De momento es un get, pero habria que cambiarlo en el futuro por un patch.
  @HttpCode(HttpStatus.OK) // Establece el codigo de estado HTTP 200 (Ok) si la solicitud es exitosa
  async verifyEmail(@Query('token') token: string) {
    try {
      if (!token) {
        throw new BadRequestException('Token is required');
      }

      return await this.authService.verifyEmail(token);
    } catch (error) {
      throw error;
    }
  }
}
