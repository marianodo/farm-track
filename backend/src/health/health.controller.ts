import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    try {
      // Verificar conexión a la base de datos
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Obtener estado de conexiones
      const connectionStatus = await this.prisma.getConnectionStatus();
      
      return {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        connections: connectionStatus,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  @Get('connections')
  async getConnections() {
    try {
      const connectionStatus = await this.prisma.getConnectionStatus();
      return {
        status: 'success',
        data: connectionStatus,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
