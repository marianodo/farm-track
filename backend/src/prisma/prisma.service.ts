import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getDatabaseConfig } from '../config/database.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static instance: PrismaService;
  private isConnected = false;

  constructor() {
    const dbConfig = getDatabaseConfig();
    
    super({
      datasources: {
        db: {
          url: dbConfig.url,
        },
      },
      log: ['error', 'warn'],
      errorFormat: 'pretty',
    });

    // Singleton pattern para evitar múltiples instancias
    if (PrismaService.instance) {
      return PrismaService.instance;
    }
    PrismaService.instance = this;
  }

  async onModuleInit() {
    if (this.isConnected) {
      console.log('Prisma ya está conectado, omitiendo conexión');
      return;
    }

    try {
      console.log('Conectando a la base de datos...');
      await this.$connect();
      this.isConnected = true;
      console.log('Conexión a la base de datos establecida exitosamente');
    } catch (error) {
      console.error('Error conectando a la base de datos:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  async onModuleDestroy() {
    if (!this.isConnected) {
      console.log('Prisma ya está desconectado');
      return;
    }

    try {
      console.log('Desconectando de la base de datos...');
      await this.$disconnect();
      this.isConnected = false;
      console.log('Desconectado de la base de datos exitosamente');
    } catch (error) {
      console.error('Error desconectando de la base de datos:', error.message);
    }
  }

  // Método para verificar el estado de las conexiones
  async getConnectionStatus() {
    try {
      const result = await this.$queryRaw`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `;
      return result;
    } catch (error) {
      console.error('Error obteniendo estado de conexiones:', error);
      return null;
    }
  }
}
