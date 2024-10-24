import { PrismaService } from 'src/prisma/prisma.service';
import { Report, Prisma } from '@prisma/client';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ReportRepository {
  constructor(private readonly db: PrismaService) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    try {
      const newReport = await this.db.report.create({
        data: createReportDto,
      });
      return newReport;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A report with this ID already exists.',
          );
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the report.',
      );
    }
  }

  async findAll(field_id: string): Promise<Report[]> {
    try {
      const reports = await this.db.report.findMany({
        where: { field_id: field_id },
      });
      if (reports.length === 0)
        throw new NotFoundException('Reports not found');
      return reports;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving reports.',
      );
    }
  }

  async findOne(id: number): Promise<unknown[]> {
    try {
      const report = await this.db.report.findUnique({
        where: { id },
        include: {
          measurements: {
            select: {
              id: true,
              value: true,
              report_id: true,
              created_at: true,
              updated_at: true,
              subject: {
                select: {
                  id: true,
                  name: true,
                  type_of_object: true,
                },
              },
              pen_variable_type_of_object: {
                include: {
                  pen: true,
                },
              },
            },
          },
        },
      });

      if (!report) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }

      const pens = report.measurements.reduce((acc, measurement) => {
        const penId = measurement.pen_variable_type_of_object.pen.id;
        if (!acc[penId]) {
          acc[penId] = {
            id: measurement.pen_variable_type_of_object.pen.id,
            name: measurement.pen_variable_type_of_object.pen.name,
            fieldId: measurement.pen_variable_type_of_object.pen.fieldId,
            measurements: [],
          };
        }
        acc[penId].measurements.push({
          ...measurement,
          pen_variable_type_of_object: {
            id: measurement.pen_variable_type_of_object.id,
            penId: measurement.pen_variable_type_of_object.penId,
            variableId: measurement.pen_variable_type_of_object.variableId,
            typeOfObjectId:
              measurement.pen_variable_type_of_object.typeOfObjectId,
            custom_parameters:
              measurement.pen_variable_type_of_object.custom_parameters,
          },
        });
        return acc;
      }, {});

      // Convertir el objeto en un array
      const pensArray = Object.values(pens);

      return pensArray;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving the report.',
      );
    }
  }

  async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
    try {
      const updatedReport = await this.db.report.update({
        where: { id },
        data: updateReportDto,
      });
      return updatedReport;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Report with ID ${id} not found.`);
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the report.',
      );
    }
  }

  async remove(id: number): Promise<Report> {
    try {
      return await this.db.report.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Report with ID ${id} not found`);
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the report.',
      );
    }
  }
}
