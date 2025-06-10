import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TypeOfObjectsService } from '../service/type_of_objects.service';
import { CreateTypeOfObjectDto } from '../dto/create-type_of_object.dto';
import { UpdateTypeOfObjectDto } from '../dto/update-type_of_object.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { OwnedResource } from 'src/auth/decorator/owned-resource.decorator';
import { UserResource } from 'src/auth/decorator/user-resource.decorator';

@Controller('type-of-objects')
export class TypeOfObjectsController {
  constructor(private readonly typeOfObjectsService: TypeOfObjectsService) {}

  @HttpCode(HttpStatus.CREATED)
  @UserResource('userId')
  @Post(':userId')
  async create(
    @Param('userId') userId: string,
    @Body() createTypeOfObjectDto: CreateTypeOfObjectDto,
  ) {
    try {
      return await this.typeOfObjectsService.create(
        userId,
        createTypeOfObjectDto,
      );
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  // @Roles('ADMIN')
  @Get()
  async findAll() {
    try {
      return await this.typeOfObjectsService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @UserResource('byUserId')
  @Get('byUser/:byUserId')
  async findAllByUserId(@Param('byUserId') byUserId: string) {
    try {
      return await this.typeOfObjectsService.findAllByUserId(byUserId);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @OwnedResource('type_of_object', 'id')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.typeOfObjectsService.findOne(+id);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @OwnedResource('type_of_object', 'id')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTypeOfObjectDto: UpdateTypeOfObjectDto,
  ) {
    try {
      return await this.typeOfObjectsService.update(+id, updateTypeOfObjectDto);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @OwnedResource('type_of_object', 'id')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.typeOfObjectsService.remove(+id);
    } catch (error) {
      throw error;
    }
  }
}
