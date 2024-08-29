import {
  Controller,
  // Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
// import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED) // Establece el código de estado HTTP 201 (Created) si la solicitud es exitosa
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      // Llama al servicio para crear el usuario
      const user = await this.userService.createUser(createUserDto);
      return user;
    } catch (error) {
      throw error;
    }
    // Devuelve el usuario creado con el código de estado 201
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT) // Establece el código de estado HTTP 204 (No Content) si la solicitud es exitosa
  async deleteUser(@Param('id') id: string) {
    try {
      await this.userService.deleteUserById(id);
    } catch (error) {
      // Puedes personalizar la respuesta aquí si necesitas
      throw error;
    }
  }

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
