import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Measurement, Prisma } from '@prisma/client';
import { UpdateMeasurementDto } from '../dto/update-measurement.dto';
// import { CreateMeasurementDto } from '../dto/create-measurement.dto';
import { CreateBulkMeasurementDto } from '../dto/createBulkBody.dto';
import { UpdateBulkMeasurementDto } from '../dto/updateBulkBody.dto';

@Injectable()
export class MeasurementRepository {
  constructor(private readonly db: PrismaService) {}

  // async create(
  //   createMeasurementDto: CreateMeasurementDto,
  // ): Promise<Measurement> {
  //   try {
  //     const newMeasurement = await this.db.measurement.create({
  //       data: createMeasurementDto,
  //     });
  //     return newMeasurement;
  //   } catch (error) {
  //     if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //       if (error.code === 'P2002') {
  //         throw new BadRequestException(
  //           'A measurement with this ID already exists.',
  //         );
  //       }
  //     }
  //     throw new InternalServerErrorException(
  //       'An unexpected error occurred while creating the measurement.',
  //     );
  //   }
  // }

  async bulkCreate(data: CreateBulkMeasurementDto): Promise<Measurement[]> {
    try {
      const measurementsWithSubjectId = data.measurements.map(
        (measurement) => ({
          ...measurement,
          subject_id: data.subject_id,
        }),
      );

      const newMeasurement = await this.db.measurement.createManyAndReturn({
        data: measurementsWithSubjectId,
      });
      return newMeasurement;
    } catch (error) {
      console.log(error);
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

  async findByReportAndSubjectId(report_id: number, subject_id: number) {
    try {
      const where: Prisma.MeasurementWhereInput = {};
      if (report_id) {
        where.report_id = report_id;
      }
      if (subject_id) {
        where.subject_id = subject_id;
      }

      const measurements = await this.db.measurement.findMany({
        where: {
          report_id: report_id,
          subject_id: subject_id,
        },
        select: {
          id: true,
          value: true,
          subject_id: true,
          pen_variable_type_of_object: {
            select: {
              custom_parameters: true,
              variable: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
          }, // Incluir la relación con pen_variable_type_of_object
        },
      });
      if (measurements.length === 0)
        throw new NotFoundException(
          'Measurements by report and subject not found',
        );
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

  async bulkUpdate(
    updateBulkMeasurementDto: UpdateBulkMeasurementDto,
  ): Promise<Measurement[]> {
    const { measurements } = updateBulkMeasurementDto;
    try {
      // Iniciar una transacción para actualizar múltiples mediciones ya que si una falla, ninguna se va a actualizar.
      // UpdateMany no permite actualizar datos dinamicos en varios registros, solo si el dato es el mismo para todos los registros.
      const updatedMeasurements = await this.db.$transaction(
        measurements.map((measurement) =>
          this.db.measurement.update({
            where: { id: measurement.id },
            data: { value: measurement.value },
          }),
        ),
      );

      return updatedMeasurements;
    } catch (error) {
      console.log('ERROR:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`One or more measurements not found.`);
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the measurements.',
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
