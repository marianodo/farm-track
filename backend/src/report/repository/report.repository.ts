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
import { CreateProductivityDto } from 'src/productivity/dto/productivity-create-dto';

@Injectable()
export class ReportRepository {
  constructor(private readonly db: PrismaService) {}

  async create(
    report: CreateReportDto,
    field_id: string,
    productivity: Omit<CreateProductivityDto, 'reportId'>,
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
        const newReportInfo = {
          ...report,
          correlative_id: nextId,
          field_id: field_id,
        };

        const newReport = await this.db.report.create({
          data: newReportInfo,
        });

        if (productivity) {
          if (productivity.userId) {
            const hasValidProductivityData =
              productivity.total_cows ||
              productivity.milking_cows ||
              productivity.average_production ||
              productivity.somatic_cells ||
              productivity.percentage_of_fat ||
              productivity.percentage_of_protein;

            if (hasValidProductivityData) {
              await prisma.productivity.create({
                data: {
                  ...productivity,
                  reportId: newReport.id, // Relacionar la productividad con el reporte creado
                },
              });
            }
          }
        }

        return newReport;
      });
    } catch (error) {
      console.log(error);
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
            productivity: {
              select: {
                total_cows: true,
                milking_cows: true,
                average_production: true,
                somatic_cells: true,
                percentage_of_fat: true,
                percentage_of_protein: true,
                userId: true,
              },
            },
          },
        });
        console.log('REPORTEE', report);
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
            productivity: {
              select: {
                total_cows: true,
                milking_cows: true,
                average_production: true,
                somatic_cells: true,
                percentage_of_fat: true,
                percentage_of_protein: true,
                userId: true,
              },
            },
          },
        });
        console.log('report:', report);
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
              productivity: report.productivity,
              subjects: {},
            };
          }

          // console.log(pens);

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

        return pensArray.length ? pensArray : report;
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

  // async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
  //   try {
  //     const updatedReport = await this.db.report.update({
  //       where: { id },
  //       data: updateReportDto,
  //     });
  //     return updatedReport;
  //   } catch (error) {
  //     if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //       if (error.code === 'P2025') {
  //         throw new NotFoundException(`Report with ID ${id} not found.`);
  //       }
  //     }
  //     throw new InternalServerErrorException(
  //       'An unexpected error occurred while updating the report.',
  //     );
  //   }
  // }

  async update(
    id: number,
    report: UpdateReportDto,
    productivity?: Omit<CreateProductivityDto, 'reportId'>,
  ): Promise<Report> {
    try {
      return await this.db.$transaction(async (prisma) => {
        // Verificar si el reporte existe
        const existingReport = await prisma.report.findUnique({
          where: { id },
        });

        if (!existingReport) {
          throw new NotFoundException(`Report with ID ${id} not found.`);
        }

        // Actualizar el reporte
        const updatedReport = await prisma.report.update({
          where: { id },
          data: report,
        });

        if (productivity) {
          // Verificar si ya existe una productividad asociada
          const existingProductivity = await prisma.productivity.findUnique({
            where: { reportId: id },
          });

          const hasValidProductivityData =
            productivity.total_cows ||
            productivity.milking_cows ||
            productivity.average_production ||
            productivity.somatic_cells ||
            productivity.percentage_of_fat ||
            productivity.percentage_of_protein;

          if (hasValidProductivityData) {
            if (existingProductivity) {
              // Actualizar la productividad existente
              await prisma.productivity.update({
                where: { reportId: id },
                data: productivity,
              });
            } else {
              // Crear una nueva productividad si no existe
              await prisma.productivity.create({
                data: {
                  ...productivity,
                  reportId: id,
                },
              });
            }
          } else if (existingProductivity) {
            // Si no hay datos válidos y existe una productividad, eliminarla
            await prisma.productivity.delete({
              where: { reportId: id },
            });
          }
        }

        return updatedReport;
      });
    } catch (error) {
      console.log('ERROR:', error);
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
