import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  // Patch,
  // Param,
  // Delete,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { RefreshJwtAuthGuard } from '../guard/refresh-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  registerUser() {
    return this.authService.registerUser();
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

  @Get(':id')
  verifyEmail(verification_token: string) {
    return verification_token;
    // return this.authService.findOne(+id);
  }
}
