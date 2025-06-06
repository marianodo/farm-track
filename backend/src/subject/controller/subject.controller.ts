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
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { SubjectService } from '../service/subject.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { OwnedResource } from 'src/auth/decorator/owned-resource.decorator';

@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post('/byField/:field_id')
  @HttpCode(HttpStatus.CREATED)
  @OwnedResource('subject', 'field_id', 'field', true)
  async create(
    @Param('field_id') field_id: string,
    @Body() createSubjectDto: CreateSubjectDto,
  ) {
    try {
      return await this.subjectService.create(createSubjectDto, field_id);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async findAll() {
    try {
      return await this.subjectService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @OwnedResource('subject', 'id', null, true)
  async findOne(@Param('id') id: string) {
    try {
      return await this.subjectService.findOne(+id);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @OwnedResource('subject', 'id', null, true)
  async update(
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    try {
      return await this.subjectService.update(+id, updateSubjectDto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @OwnedResource('subject', 'id', null, true)
  async remove(@Param('id') id: string) {
    try {
      return await this.subjectService.remove(+id);
    } catch (error) {
      throw error;
    }
  }
}
