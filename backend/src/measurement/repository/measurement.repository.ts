import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Measurement, Prisma } from '@prisma/client';
import { UpdateMeasurementDto } from '../dto/update-measurement.dto';
import { CreateMeasurementDto } from '../dto/create-measurement.dto';

@Injectable()
export class MeasurementRepository {
  constructor(private readonly db: PrismaService) {}

  async create(
    createMeasurementDto: CreateMeasurementDto,
  ): Promise<Measurement> {
    try {
      const newMeasurement = await this.db.measurement.create({
        data: createMeasurementDto,
      });
      return newMeasurement;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A measurement with this ID already exists.',
          );
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the measurement.',
      );
    }
  }

  async findAll(): Promise<Measurement[]> {
    try {
      const measurements = await this.db.measurement.findMany();
      console.log(measurements);
      if (measurements.length === 0)
        throw new NotFoundException('Measurements not found');
      return measurements;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving measurements.',
      );
    }
  }

  async findOne(id: number): Promise<Measurement> {
    try {
      const measurement = await this.db.measurement.findUnique({
        where: { id },
      });
      if (!measurement) {
        throw new NotFoundException(`Measurement with ID ${id} not found`);
      }
      return measurement;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving the measurement.',
      );
    }
  }

  async update(
    id: number,
    updateMeasurementDto: UpdateMeasurementDto,
  ): Promise<Measurement> {
    try {
      const updatedMeasurement = await this.db.measurement.update({
        where: { id },
        data: updateMeasurementDto,
      });
      return updatedMeasurement;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Measurement with ID ${id} not found.`);
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the measurement.',
      );
    }
  }

  async remove(id: number): Promise<Measurement> {
    try {
      return await this.db.measurement.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Measurement with ID ${id} not found`);
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the measurement.',
      );
    }
  }
}
