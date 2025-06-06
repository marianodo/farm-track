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
  UseGuards,
  Req,
} from '@nestjs/common';
import { FieldService } from '../service/field.service';
// import { CreateFieldDto } from '../dto/create-field.dto';
import { UpdateFieldDto } from '../dto/update-field.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserResource } from 'src/auth/decorator/user-resource.decorator';
import { OwnedResource } from 'src/auth/decorator/owned-resource.decorator';

@Controller('fields')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @HttpCode(HttpStatus.CREATED)
  @UserResource('userId')
  @Post()
  async create(@Body() body: any) {
    const { ...createFieldDto } = body;
    try {
      return await this.fieldService.create(createFieldDto);
    } catch (error) {
      console.log('ERROR CONTROLLER: ' + error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  @Get()
  async findAll() {
    try {
      return await this.fieldService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @UserResource('id')
  @Get('byUserId/:id')
  async findFieldByUserId(@Param('id') userId: string) {
    try {
      return await this.fieldService.findFieldByUserId(userId);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('dataset/:id')
  async getFieldDataset(@Param('id') id: string) {
    try {
      return await this.fieldService.getFieldDataset(id);
    } catch (error) {
      throw error;
    }
  }
  @HttpCode(HttpStatus.OK)
  @Get('dataset/categorical/:id')
  async getCategoricalMeasurementsByFieldId(@Param('id') id: string) {
    try {
      console.log(id)
      return await this.fieldService.getCategoricalMeasurementsByFieldId(id);
    } catch (error) {
      throw error;
    }
  }
  @HttpCode(HttpStatus.OK)
  @Get('dataset/numerical/:id')
  async getNumericalMeasurementsByFieldId(@Param('id') id: string) {
    try {
      console.log(id)
      return await this.fieldService.getNumericalMeasurementsByFieldId(id);
    } catch (error) {
      throw error;
    }
  }
  @HttpCode(HttpStatus.OK)
  @OwnedResource('field', 'id')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.fieldService.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @OwnedResource('field', 'id')
  async update(
    @Param('id') id: string,
    @Body() updateFieldDto: UpdateFieldDto,
  ) {
    try {
      return await this.fieldService.update(id, updateFieldDto);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @OwnedResource('field', 'id')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.fieldService.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
