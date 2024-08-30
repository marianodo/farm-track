import {
  Controller,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT) // Establece el código de estado HTTP 204 (No Content) si la solicitud es exitosa
  async deleteUser(@Param('id') id: string) {
    try {
      await this.userService.deleteUserById(id);
    } catch (error) {
      throw error;
    }
  }
}
