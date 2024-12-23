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

  async create(
    createReportDto: CreateReportDto,
    field_id: string,
  ): Promise<Report> {
    try {
      return await this.db.$transaction(async (prisma) => {
        //consultar ultimo reporte por id de campo
        const lastReport = await prisma.report.findFirst({
          where: { field_id: field_id },
          orderBy: { correlative_id: 'desc' },
        });
        // Calcular el siguiente ID
        const nextId = lastReport ? lastReport.correlative_id + 1 : 1;
        const newReport = {
          ...createReportDto,
          correlative_id: nextId,
          field_id: field_id,
        };
        return await this.db.report.create({
          data: newReport,
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Código de error para violaciones de restricciones únicas
          throw new BadRequestException(
            'A report with this ID already exists for the field.',
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

  async findOne(id: number, onlyNameAndComment: boolean): Promise<unknown[]> {
    try {
      let report = null;
      if (onlyNameAndComment) {
        report = await this.db.report.findUnique({
          where: { id },
          select: {
            name: true,
            comment: true,
          },
        });
        if (!report) {
          throw new NotFoundException(`Report with ID ${id} not found`);
        }
        return report;
      } else {
        report = await this.db.report.findUnique({
          where: { id },
          include: {
            measurements: {
              select: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                    correlative_id: true,
                    type_of_object: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                    measurement: {
                      select: {
                        id: true,
                        value: true,
                        created_at: true,
                        updated_at: true,
                        pen_variable_type_of_object: {
                          include: {
                            variable: {
                              select: {
                                id: true,
                                name: true,
                                type: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                pen_variable_type_of_object: {
                  include: {
                    pen: true,
                    variable: true,
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
              report_id: report.id,
              fieldId: measurement.pen_variable_type_of_object.pen.fieldId,
              subjects: {},
            };
          }

          const subjectId = measurement.subject.id;
          if (!acc[penId].subjects[subjectId]) {
            acc[penId].subjects[subjectId] = {
              id: measurement.subject.id,
              name: measurement.subject.name,
              correlative_id: measurement.subject.correlative_id,
              type_of_object: {
                id: measurement.subject.type_of_object.id,
                name: measurement.subject.type_of_object.name,
              },
              measurement: measurement.subject.measurement,
            };
          }

          return acc;
        }, {});

        // Convertir el objeto en un array y los subjects en arrays
        const pensArray: any[] = Object.values(pens).map((pen: any) => ({
          ...pen,
          subjects: Object.values(pen.subjects),
        }));

        return pensArray;
      }
    } catch (error) {
      console.log('ERROR:', error);
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

  async removeAll(): Promise<void> {
    try {
      await this.db.report.deleteMany();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting all reports.',
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
