import {
  Controller,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Query,
  Body,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UserResource } from 'src/auth/decorator/user-resource.decorator';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles('ADMIN')
  @UserResource('userId')
  async getUsers(@Query('includeFields') includeFields: string) {
    const include = includeFields === 'true'; // 'true' o 'false' de los query params
    return this.userService.getUsersWithFields(include);
  }

  @Put('change-password')
  @UserResource('userId')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(changePasswordDto);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT) // Establece el código de estado HTTP 204 (No Content) si la solicitud es exitosa
  @UserResource('id')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.userService.deleteUserById(id);
    } catch (error) {
      throw error;
    }
  }
}
