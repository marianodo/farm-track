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
import { MeasurementService } from '../service/measurement.service';
// import { CreateMeasurementDto } from '../dto/create-measurement.dto';
import { UpdateMeasurementDto } from '../dto/update-measurement.dto';
import { CreateBulkMeasurementDto } from '../dto/createBulkBody.dto';
import { UpdateBulkMeasurementDto } from '../dto/updateBulkBody.dto';
import { SubjectService } from 'src/subject/service/subject.service';

@Controller('measurements')
export class MeasurementController {
  constructor(
    private readonly measurementService: MeasurementService,
    private readonly subjectService: SubjectService, // Inyecta el servicio de Subjects
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    try {
      return await this.measurementService.findAll();
    } catch (error) {
      throw error;
    }
  }

  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // async create(@Body() createMeasurementDto: CreateMeasurementDto) {
  //   try {
  //     return await this.measurementService.create(createMeasurementDto);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(
    @Body() createBullkMeasurementDto: CreateBulkMeasurementDto,
  ) {
    try {
      return await this.measurementService.bulkCreate(
        createBullkMeasurementDto,
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Patch('/bulkUpdate')
  @HttpCode(HttpStatus.OK)
  async bulkUpdate(@Body() updateBulkMeasurementDto: UpdateBulkMeasurementDto) {
    console.log('MOSTRAR DATA:', updateBulkMeasurementDto);
    try {
      const { name, subject_id } = updateBulkMeasurementDto;
      if (name) {
        await this.subjectService.update(subject_id, { name });
      }
      return await this.measurementService.bulkUpdate(updateBulkMeasurementDto);
    } catch (error) {
      console.log('ERROR:', error);
      throw error;
    }
  }

  @Get(':report_id/:subject_id')
  @HttpCode(HttpStatus.OK)
  async findByReportAndSubjectId(
    @Param('report_id') report_id: string,
    @Param('subject_id') subject_id: string,
  ) {
    try {
      return await this.measurementService.findByReportAndSubjectId(
        +report_id,
        +subject_id,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    try {
      return await this.measurementService.findOne(+id);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateMeasurementDto: UpdateMeasurementDto,
  ) {
    try {
      return await this.measurementService.update(+id, updateMeasurementDto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      return await this.measurementService.remove(+id);
    } catch (error) {
      throw error;
    }
  }
}
