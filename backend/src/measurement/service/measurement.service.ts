import { MeasurementRepository } from '../repository/measurement.repository';
// import { CreateMeasurementDto } from '../dto/create-measurement.dto';
import { UpdateMeasurementDto } from '../dto/update-measurement.dto';
import { Injectable } from '@nestjs/common';
import { CreateBulkMeasurementDto } from '../dto/createBulkBody.dto';
import { SubjectService } from 'src/subject/service/subject.service';
import { UpdateBulkMeasurementDto } from '../dto/updateBulkBody.dto';

@Injectable()
export class MeasurementService {
  constructor(
    private readonly measurementRepository: MeasurementRepository,
    private readonly subjectService: SubjectService,
  ) {}

  // async create(createMeasurementDto: CreateMeasurementDto) {
  //   try {
  //     return await this.measurementRepository.create(createMeasurementDto);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async bulkCreate(createBullkMeasurementDto: CreateBulkMeasurementDto) {
    try {
      const subject = await this.subjectService.create(
        {
          name: createBullkMeasurementDto.name,
          type_of_object_id: createBullkMeasurementDto.type_of_object_id,
        },
        createBullkMeasurementDto.field_id,
      );
      return await this.measurementRepository.bulkCreate({
        subject_id: subject.id,
        type_of_object_id: subject.type_of_object_id,
        measurements: createBullkMeasurementDto.measurements,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.measurementRepository.findAll();
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      return await this.measurementRepository.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async findByReportAndSubjectId(report_id: number, subject_id: number) {
    try {
      return await this.measurementRepository.findByReportAndSubjectId(
        report_id,
        subject_id,
      );
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateMeasurementDto: UpdateMeasurementDto) {
    try {
      return await this.measurementRepository.update(id, updateMeasurementDto);
    } catch (error) {
      throw error;
    }
  }

  async bulkUpdate(updateBulkMeasurementDto: UpdateBulkMeasurementDto) {
    try {
      return await this.measurementRepository.bulkUpdate(
        updateBulkMeasurementDto,
      );
    } catch (error) {
      console.log('ERROR:', error);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.measurementRepository.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
