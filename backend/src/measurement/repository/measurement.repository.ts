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

  async getMeasurementStatsByField(
    fieldId: string,
    options?: {
      totalMeasurement?: boolean;
      byObject?: boolean;
      byPen?: boolean;
      byVariable?: boolean;
      byVariableByPen?: boolean;
      byReport?: boolean;
    },
  ) {
    try {
      // Primera Query (measurement_by_object, measurement_by_pen, etc.)
      const rawStats = await this.db.$queryRaw<
        Array<{
          total_measurement: bigint;
          type_of_object_name: string;
          measurement_count_object: bigint;
          pen_name: string;
          measurement_count_pen: bigint;
          variable_name: string;
          measurement_count_variable: bigint;
          report_id: string;
          report_name: string | null;
          report_created_at: Date | null;
        }>
      >(Prisma.sql`
    SELECT
        (SELECT COUNT(*) 
         FROM "Measurement" m2
         JOIN "PenVariableTypeOfObject" pvto2 ON m2.pen_variable_type_of_object_id = pvto2.id
         JOIN "Pen" p2 ON pvto2."penId" = p2.id
         JOIN "Field" f2 ON p2."fieldId" = f2.id
         WHERE f2.id = ${fieldId}) AS total_measurement,

        t.name AS type_of_object_name,
        COUNT(m.id) FILTER (WHERE t.id IS NOT NULL) AS measurement_count_object,

        p.name AS pen_name,
        COUNT(m.id) FILTER (WHERE p.id IS NOT NULL) AS measurement_count_pen,

        v.name AS variable_name,
        COUNT(m.id) FILTER (WHERE v.id IS NOT NULL) AS measurement_count_variable,

        r.id AS report_id,
        r.name AS report_name,
        r.created_at AS report_created_at
    FROM "Measurement" m
    LEFT JOIN "PenVariableTypeOfObject" pvto ON m.pen_variable_type_of_object_id = pvto.id
    LEFT JOIN "Pen" p ON pvto."penId" = p.id
    LEFT JOIN "TypeOfObject" t ON pvto."typeOfObjectId" = t.id
    LEFT JOIN "Variable" v ON pvto."variableId" = v.id
    LEFT JOIN "Field" f ON p."fieldId" = f.id
    LEFT JOIN "Report" r ON m.report_id = r.id
    WHERE f.id = ${fieldId}
    GROUP BY t.name, p.name, v.name, r.id, r.name, r.created_at;
    `);

      // Segunda Query (measurement_by_report con COUNT(DISTINCT m.subject_id))
      const measurementByReportStats = await this.db.$queryRaw<
        Array<{
          type_of_object_name: string;
          measurement_count_report: bigint;
          pen_name: string;
          report_id: string;
          report_name: string | null;
          report_created_at: Date | null;
        }>
      >(Prisma.sql`
    SELECT
        t.name AS type_of_object_name,
        COUNT(DISTINCT m.subject_id) FILTER (WHERE r.id IS NOT NULL) AS measurement_count_report,
        p.name AS pen_name,
        r.id AS report_id,
        r.name AS report_name,
        r.created_at AS report_created_at
    FROM "Measurement" m
    LEFT JOIN "PenVariableTypeOfObject" pvto ON m.pen_variable_type_of_object_id = pvto.id
    LEFT JOIN "Pen" p ON pvto."penId" = p.id
    LEFT JOIN "TypeOfObject" t ON pvto."typeOfObjectId" = t.id
    LEFT JOIN "Field" f ON p."fieldId" = f.id
    LEFT JOIN "Report" r ON m.report_id = r.id
    WHERE f.id = ${fieldId}
    GROUP BY t.name, p.name, r.id, r.name, r.created_at;
    `);

      const response: any = {
        total_measurement: 0,
        measurement_by_object: {},
        measurement_by_pen: {},
        measurement_by_variable: {},
        measurement_by_variable_by_pen: {},
        measurement_by_report: {},
      };

      // Verificar las opciones y agregar los valores correspondientes
      const includeAll = !options || Object.keys(options).length === 0;

      if (includeAll || options?.totalMeasurement) {
        response.total_measurement = Number(
          rawStats[0]?.total_measurement || 0,
        );
      }

      // measurement_by_object
      if (includeAll || options?.byObject) {
        rawStats.forEach((row) => {
          if (row.type_of_object_name) {
            response.measurement_by_object[row.type_of_object_name] =
              (response.measurement_by_object[row.type_of_object_name] || 0) +
              Number(row.measurement_count_object);
          }
        });
      }

      // measurement_by_pen
      if (includeAll || options?.byPen) {
        rawStats.forEach((row) => {
          if (row.pen_name) {
            response.measurement_by_pen[row.pen_name] =
              (response.measurement_by_pen[row.pen_name] || 0) +
              Number(row.measurement_count_pen);
          }
        });
      }

      // measurement_by_variable
      if (includeAll || options?.byVariable) {
        rawStats.forEach((row) => {
          if (row.variable_name) {
            response.measurement_by_variable[row.variable_name] =
              (response.measurement_by_variable[row.variable_name] || 0) +
              Number(row.measurement_count_variable);
          }
        });
      }

      // measurement_by_variable_by_pen
      if (includeAll || options?.byVariableByPen) {
        rawStats.forEach((row) => {
          if (row.pen_name && row.variable_name) {
            if (!response.measurement_by_variable_by_pen[row.pen_name]) {
              response.measurement_by_variable_by_pen[row.pen_name] = {};
            }
            response.measurement_by_variable_by_pen[row.pen_name][
              row.variable_name
            ] =
              (response.measurement_by_variable_by_pen[row.pen_name][
                row.variable_name
              ] || 0) + Number(row.measurement_count_variable);
          }
        });
      }

      // measurement_by_report
      if (includeAll || options?.byReport) {
        measurementByReportStats.forEach((row) => {
          const reportKey =
            row.report_name ||
            `Report ${row.report_id} - ${new Date(
              row.report_created_at,
            ).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}`;
          if (!response.measurement_by_report[reportKey]) {
            response.measurement_by_report[reportKey] = {};
          }
          if (!response.measurement_by_report[reportKey][row.pen_name]) {
            response.measurement_by_report[reportKey][row.pen_name] = {};
          }
          response.measurement_by_report[reportKey][row.pen_name][
            row.type_of_object_name
          ] =
            (response.measurement_by_report[reportKey][row.pen_name][
              row.type_of_object_name
            ] || 0) + Number(row.measurement_count_report);
        });
      }

      return response;
    } catch (error) {
      console.error('Error fetching measurement stats:', error);
      throw new InternalServerErrorException(
        'Error retrieving measurement stats',
      );
    }
  }

  async getMeasurementStatsByUser(
    userId: string,
    options?: {
      totalMeasurement?: boolean;
      byObject?: boolean;
      byPen?: boolean;
      byVariable?: boolean;
      byVariableByPen?: boolean;
      byReport?: boolean;
    },
  ) {
    try {
      const rawStats = await this.db.$queryRaw<
        Array<{
          total_measurement: bigint;
          type_of_object_name: string;
          measurement_count_object: bigint;
          pen_name: string;
          measurement_count_pen: bigint;
          variable_name: string;
          measurement_count_variable: bigint;
          report_name: string;
          measurement_count_report: bigint;
        }>
      >(Prisma.sql`
    SELECT
        (SELECT COUNT(*) 
           FROM "Measurement" m2
           JOIN "PenVariableTypeOfObject" pvto2 ON m2.pen_variable_type_of_object_id = pvto2.id
           JOIN "Pen" p2 ON pvto2."penId" = p2.id
           JOIN "Field" f2 ON p2."fieldId" = f2.id
           WHERE f2."userId" = ${userId}) AS total_measurement,
      t.name AS type_of_object_name,
      COUNT(m.id) FILTER (WHERE t.id IS NOT NULL) AS measurement_count_object,
      p.name AS pen_name,
      COUNT(m.id) FILTER (WHERE p.id IS NOT NULL) AS measurement_count_pen,
      v.name AS variable_name,
      COUNT(m.id) FILTER (WHERE v.id IS NOT NULL) AS measurement_count_variable,
      r.name AS report_name,
      COUNT(m.id) FILTER (WHERE r.id IS NOT NULL) AS measurement_count_report
    FROM "Measurement" m
    LEFT JOIN "PenVariableTypeOfObject" pvto ON m.pen_variable_type_of_object_id = pvto.id
    LEFT JOIN "Pen" p ON pvto."penId" = p.id
    LEFT JOIN "TypeOfObject" t ON pvto."typeOfObjectId" = t.id
    LEFT JOIN "Variable" v ON pvto."variableId" = v.id
    LEFT JOIN "Field" f ON p."fieldId" = f.id
    LEFT JOIN "Report" r ON m.report_id = r.id
    WHERE f."userId" = ${userId}
    GROUP BY t.name, p.name, v.name, r.name
  `);

      // Preparamos la respuesta
      const response: any = {};

      // Convertimos BigInt a Number antes de procesar la respuesta
      const includeAll = !options || Object.keys(options).length === 0;

      if (includeAll || options?.totalMeasurement) {
        response.total_measurement = Number(
          rawStats[0]?.total_measurement || 0,
        );
      }

      if (includeAll || options?.byObject) {
        response.measurement_by_object = {};
      }

      if (includeAll || options?.byPen) {
        response.measurement_by_pen = {};
      }

      if (includeAll || options?.byVariable) {
        response.measurement_by_variable = {};
      }

      if (includeAll || options?.byVariableByPen) {
        response.measurement_by_variable_by_pen = {};
      }

      if (includeAll || options?.byReport) {
        response.measurement_by_report = {};
      }

      rawStats.forEach((row) => {
        if ((includeAll || options?.byObject) && row.type_of_object_name) {
          response.measurement_by_object[row.type_of_object_name] =
            (response.measurement_by_object[row.type_of_object_name] || 0) +
            Number(row.measurement_count_object);
        }

        if ((includeAll || options?.byPen) && row.pen_name) {
          response.measurement_by_pen[row.pen_name] =
            (response.measurement_by_pen[row.pen_name] || 0) +
            Number(row.measurement_count_pen);
        }

        if ((includeAll || options?.byVariable) && row.variable_name) {
          response.measurement_by_variable[row.variable_name] =
            (response.measurement_by_variable[row.variable_name] || 0) +
            Number(row.measurement_count_variable);
        }

        if (
          (includeAll || options?.byVariableByPen) &&
          row.pen_name &&
          row.variable_name
        ) {
          if (!response.measurement_by_variable_by_pen[row.pen_name]) {
            response.measurement_by_variable_by_pen[row.pen_name] = {};
          }
          response.measurement_by_variable_by_pen[row.pen_name][
            row.variable_name
          ] =
            (response.measurement_by_variable_by_pen[row.pen_name][
              row.variable_name
            ] || 0) + Number(row.measurement_count_variable);
        }

        if (
          (includeAll || options?.byReport) &&
          row.report_name &&
          row.pen_name &&
          row.type_of_object_name
        ) {
          if (!response.measurement_by_report[row.report_name]) {
            response.measurement_by_report[row.report_name] = {};
          }
          if (!response.measurement_by_report[row.report_name][row.pen_name]) {
            response.measurement_by_report[row.report_name][row.pen_name] = {};
          }
          response.measurement_by_report[row.report_name][row.pen_name][
            row.type_of_object_name
          ] =
            (response.measurement_by_report[row.report_name][row.pen_name][
              row.type_of_object_name
            ] || 0) + Number(row.measurement_count_report);
        }
      });

      return response;
    } catch (error) {
      console.error('Error fetching measurement stats:', error);
      throw new InternalServerErrorException(
        'Error retrieving measurement stats',
      );
    }
  }

  async getMeasurementStats(options?: {
    totalMeasurement?: boolean;
    byObject?: boolean;
    byPen?: boolean;
    byVariable?: boolean;
    byVariableByPen?: boolean;
    byReport?: boolean;
  }) {
    try {
      const rawStats = await this.db.$queryRaw<
        Array<{
          total_measurement: bigint;
          type_of_object_name: string;
          measurement_count_object: bigint;
          pen_name: string;
          measurement_count_pen: bigint;
          variable_name: string;
          measurement_count_variable: bigint;
          report_name: string;
          measurement_count_report: bigint;
        }>
      >(Prisma.sql`
  SELECT 
  (SELECT COUNT(*) FROM "Measurement") AS total_measurement,
  t.name AS type_of_object_name,
  COUNT(*) FILTER (WHERE t.id IS NOT NULL) AS measurement_count_object,
  p.name AS pen_name,
  COUNT(*) FILTER (WHERE p.id IS NOT NULL) AS measurement_count_pen,
  v.name AS variable_name,
  COUNT(*) FILTER (WHERE v.id IS NOT NULL) AS measurement_count_variable,
  r.name AS report_name,
  COUNT(*) FILTER (WHERE r.id IS NOT NULL) AS measurement_count_report
FROM "Measurement" m
LEFT JOIN "PenVariableTypeOfObject" pvto ON m.pen_variable_type_of_object_id = pvto.id
LEFT JOIN "TypeOfObject" t ON pvto."typeOfObjectId" = t.id
LEFT JOIN "Pen" p ON pvto."penId" = p.id
LEFT JOIN "Variable" v ON pvto."variableId" = v.id
LEFT JOIN "Report" r ON m.report_id = r.id
GROUP BY t.name, p.name, v.name, r.name;
`);

      // Preparamos la respuesta
      const response: any = {};

      // Convertimos BigInt a Number antes de procesar la respuesta
      const includeAll = !options || Object.keys(options).length === 0;

      // Si totalMeasurement es verdadero o no se especifican opciones, calculamos el total
      if (includeAll || options?.totalMeasurement) {
        response.total_measurement = Number(
          rawStats[0]?.total_measurement || 0,
        );
      }

      // Inicializamos las propiedades para los otros cálculos
      if (includeAll || options?.byObject) {
        response.measurement_by_object = {};
      }

      if (includeAll || options?.byPen) {
        response.measurement_by_pen = {};
      }

      if (includeAll || options?.byVariable) {
        response.measurement_by_variable = {};
      }

      if (includeAll || options?.byVariableByPen) {
        response.measurement_by_variable_by_pen = {};
      }

      if (includeAll || options?.byReport) {
        response.measurement_by_report = {};
      }

      // Procesamos las estadísticas crudas
      rawStats.forEach((row) => {
        // Sumamos las mediciones por objeto
        if ((includeAll || options?.byObject) && row.type_of_object_name) {
          response.measurement_by_object[row.type_of_object_name] =
            (response.measurement_by_object[row.type_of_object_name] || 0) +
            Number(row.measurement_count_object);
        }

        // Sumamos las mediciones por pen
        if ((includeAll || options?.byPen) && row.pen_name) {
          response.measurement_by_pen[row.pen_name] =
            (response.measurement_by_pen[row.pen_name] || 0) +
            Number(row.measurement_count_pen);
        }

        // Sumamos las mediciones por variable
        if ((includeAll || options?.byVariable) && row.variable_name) {
          response.measurement_by_variable[row.variable_name] =
            (response.measurement_by_variable[row.variable_name] || 0) +
            Number(row.measurement_count_variable);
        }

        // Sumamos las mediciones por variable y por pen
        if (
          (includeAll || options?.byVariableByPen) &&
          row.pen_name &&
          row.variable_name
        ) {
          if (!response.measurement_by_variable_by_pen[row.pen_name]) {
            response.measurement_by_variable_by_pen[row.pen_name] = {};
          }
          response.measurement_by_variable_by_pen[row.pen_name][
            row.variable_name
          ] =
            (response.measurement_by_variable_by_pen[row.pen_name][
              row.variable_name
            ] || 0) + Number(row.measurement_count_variable);
        }

        if (
          (includeAll || options?.byReport) &&
          row.report_name &&
          row.pen_name &&
          row.type_of_object_name
        ) {
          if (!response.measurement_by_report[row.report_name]) {
            response.measurement_by_report[row.report_name] = {};
          }
          if (!response.measurement_by_report[row.report_name][row.pen_name]) {
            response.measurement_by_report[row.report_name][row.pen_name] = {};
          }
          response.measurement_by_report[row.report_name][row.pen_name][
            row.type_of_object_name
          ] =
            (response.measurement_by_report[row.report_name][row.pen_name][
              row.type_of_object_name
            ] || 0) + Number(row.measurement_count_report);
        }
      });

      return response;
    } catch (error) {
      console.error('Error fetching measurement stats:', error);
      throw new InternalServerErrorException(
        'Error retrieving measurement stats',
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
