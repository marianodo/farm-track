import { MeasurementRepository } from '../repository/measurement.repository';
import { CreateMeasurementDto } from '../dto/create-measurement.dto';
import { UpdateMeasurementDto } from '../dto/update-measurement.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MeasurementService {
  constructor(private readonly measurementRepository: MeasurementRepository) {}

  async create(createMeasurementDto: CreateMeasurementDto) {
    try {
      return await this.measurementRepository.create(createMeasurementDto);
    } catch (error) {
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

  async update(id: number, updateMeasurementDto: UpdateMeasurementDto) {
    try {
      return await this.measurementRepository.update(id, updateMeasurementDto);
    } catch (error) {
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
