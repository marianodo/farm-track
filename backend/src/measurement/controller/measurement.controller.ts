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
  Query,
} from '@nestjs/common';
import { MeasurementService } from '../service/measurement.service';
// import { CreateMeasurementDto } from '../dto/create-measurement.dto';
import { UpdateMeasurementDto } from '../dto/update-measurement.dto';
import { CreateBulkMeasurementDto } from '../dto/createBulkBody.dto';
import { UpdateBulkMeasurementDto } from '../dto/updateBulkBody.dto';
import { SubjectService } from 'src/subject/service/subject.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserResource } from 'src/auth/decorator/user-resource.decorator';
import { OwnedResource } from 'src/auth/decorator/owned-resource.decorator';

@Controller('measurements')
export class MeasurementController {
  constructor(
    private readonly measurementService: MeasurementService,
    private readonly subjectService: SubjectService, // Inyecta el servicio de Subjects
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async findAll() {
    try {
      return await this.measurementService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getMeasurementStats(
    @Query()
    options?: {
      totalMeasurement?: boolean;
      byObject?: boolean;
      byPen?: boolean;
      byVariable?: boolean;
      byVariableByPen?: boolean;
    },
  ) {
    try {
      return await this.measurementService.getMeasurementStats(options);
    } catch (error) {
      throw error;
    }
  }

  @Get('stats/ByUserId/:userId')
  @HttpCode(HttpStatus.OK)
  @UserResource('userId')
  async getMeasurementStatsByUser(
    @Param('userId') userId: string,
    @Query()
    options?: {
      totalMeasurement?: boolean;
      byObject?: boolean;
      byPen?: boolean;
      byVariable?: boolean;
      byVariableByPen?: boolean;
    },
  ) {
    try {
      return await this.measurementService.getMeasurementStatsByUser(
        userId,
        options,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('stats/byFieldId/:fieldId')
  @HttpCode(HttpStatus.OK)
  @OwnedResource('measurement', 'fieldId', 'field', true)
  async getMeasurementStatsByField(
    @Param('fieldId') fieldId: string,
    @Query()
    options?: {
      totalMeasurement?: boolean;
      byObject?: boolean;
      byPen?: boolean;
      byVariable?: boolean;
      byVariableByPen?: boolean;
    },
  ) {
    try {
      return await this.measurementService.getMeasurementStatsByField(
        fieldId,
        options,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('stats/byReportId/:reportId')
  @HttpCode(HttpStatus.OK)
  @OwnedResource('measurement', 'reportId', 'report', true)
  async getMeasurementStatsByReport(
    @Param('reportId') reportId: string,
    @Query()
    options?: {
      totalMeasurement?: boolean;
      byObject?: boolean;
      byPen?: boolean;
      byVariable?: boolean;
      byVariableByPen?: boolean;
    },
  ) {
    try {
      return await this.measurementService.getMeasurementStatsByReport(
        +reportId,
        options,
      );
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
  @OwnedResource('measurement', 'field_id', 'field', false)
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
  @OwnedResource('measurement', 'subject_id', 'subject', false)
  async bulkUpdate(@Body() updateBulkMeasurementDto: UpdateBulkMeasurementDto) {
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
  @OwnedResource('measurement', 'report_id', 'report', true)
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
  @OwnedResource('measurement', 'id', null, true)
  async findOne(@Param('id') id: string) {
    try {
      return await this.measurementService.findOne(+id);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @OwnedResource('measurement', 'id', null, true)
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
  @OwnedResource('measurement', 'id', null, true)
  async remove(@Param('id') id: string) {
    try {
      return await this.measurementService.remove(+id);
    } catch (error) {
      throw error;
    }
  }
}
