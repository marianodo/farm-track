import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Configuramos las opciones de transacción dentro del constructor de PrismaClient
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL, // Usualmente lo configuras desde el entorno
        },
      },
      errorFormat: 'pretty', // Para mejorar la visibilidad de errores en desarrollo
      log: ['query', 'info', 'warn', 'error'], // Para loguear las consultas de Prisma (opcional)
      transactionOptions: {
        isolationLevel: 'Serializable', // Establecer el nivel de aislamiento para las transacciones
        maxWait: 10000, // Establecer el tiempo máximo de espera antes de que una transacción falle (en milisegundos)
        timeout: 10000, // Timeout para la transacción (en milisegundos)
      },
    });
  }

  async onModuleInit() {
    await this.$connect(); // Conexión inicial con la base de datos
  }
}
