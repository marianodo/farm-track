import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DatabaseRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async dropTables(tables: string[]): Promise<void> {
    if (!tables || tables.length === 0) {
      throw new Error('No tables provided to truncate.');
    }

    // Validar nombres de tablas
    const sanitizedTables = tables.map((table) => {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      return table;
    });

    try {
      // Ejecutar truncado en una transacción
      await this.prisma.$transaction(
        sanitizedTables.map((table) =>
          this.prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`,
          ),
        ),
      );
      console.log(
        `Successfully truncated tables: ${sanitizedTables.join(', ')}`,
      );
    } catch (error) {
      console.error('Error truncating tables:', error.message);
      throw error;
    }
  }

  async deleteUserData(userId: string): Promise<void> {
    try {
      // Verificar si el usuario existe
      const user = await this.txHost.tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('The user does not exist.');
      }

      // Eliminar Measurements (datos más dependientes)
      await this.txHost.tx.measurement.deleteMany({
        where: {
          subject: { field: { userId } },
        },
      });

      // Eliminar Subjects
      await this.txHost.tx.subject.deleteMany({
        where: {
          field: { userId },
        },
      });

      // Eliminar Reports
      await this.txHost.tx.report.deleteMany({
        where: {
          field: { userId },
        },
      });

      // Eliminar Pens
      await this.txHost.tx.pen.deleteMany({
        where: {
          field: { userId },
        },
      });

      // Eliminar Fields
      await this.txHost.tx.field.deleteMany({
        where: {
          userId,
        },
      });

      // Eliminar TypeOfObjects y sus asociaciones
      await this.txHost.tx.typeOfObject_Variable.deleteMany({
        where: {
          type_of_object: { userId },
        },
      });

      await this.txHost.tx.typeOfObject.deleteMany({
        where: {
          userId,
        },
      });

      // Eliminar Variables
      await this.txHost.tx.variable.deleteMany({
        where: {
          userId,
        },
      });

      console.log(
        `All the data of the user with ID ${userId} has been deleted.`,
      );
    } catch (error) {
      console.error(
        `Error deleting the related data of the user: ${userId}`,
        error,
      );
      throw error;
    }
  }
}
