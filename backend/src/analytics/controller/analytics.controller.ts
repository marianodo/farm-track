import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnalyticsService } from '../service/analytics.service';
import { Roles } from '../../auth/decorator/roles.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getOverview() {
    try {
      // Solo obtener los datos esenciales para evitar problemas de conexión
      const [basicStats, monthlyGrowth] = await Promise.all([
        this.analyticsService.getBasicStats(),
        this.analyticsService.getMonthlyGrowth()
      ]);

      // Calcular métricas de evaluación de uso
      const adoptionRate = basicStats.totalUsers > 0 
        ? (basicStats.activeUsers / basicStats.totalUsers) * 100 
        : 0;

      const avgFieldsPerUser = basicStats.activeUsers > 0 
        ? basicStats.totalFields / basicStats.activeUsers 
        : 0;

      const avgPensPerField = basicStats.totalFields > 0 
        ? basicStats.totalPens / basicStats.totalFields 
        : 0;

      const avgMeasurementsPerReport = basicStats.totalReports > 0 
        ? basicStats.totalMeasurements / basicStats.totalReports 
        : 0;

      // Evaluación de uso
      let usageLevel = 'low';
      if (basicStats.activeUsers >= 5) {
        usageLevel = 'high';
      } else if (basicStats.activeUsers >= 2) {
        usageLevel = 'medium';
      }

      const hasGrowth = monthlyGrowth.newUsersMonth > 0;
      const hasRegularActivity = monthlyGrowth.newMeasurementsMonth > 10;

      const usageEvaluation = {
        adoptionRate,
        avgFieldsPerUser,
        avgPensPerField,
        avgMeasurementsPerReport,
        usageLevel,
        hasGrowth,
        hasRegularActivity
      };

      return {
        basicStats,
        monthlyGrowth,
        usageEvaluation,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('basic-stats')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getBasicStats() {
    try {
      return await this.analyticsService.getBasicStats();
    } catch (error) {
      throw error;
    }
  }

  @Get('monthly-growth')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getMonthlyGrowth() {
    try {
      return await this.analyticsService.getMonthlyGrowth();
    } catch (error) {
      throw error;
    }
  }

  @Get('activity')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getActivityAnalysis() {
    try {
      return await this.analyticsService.getActivityAnalysis();
    } catch (error) {
      throw error;
    }
  }

  @Get('geographic')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getGeographicDistribution() {
    try {
      return await this.analyticsService.getGeographicDistribution();
    } catch (error) {
      throw error;
    }
  }

  @Get('productivity')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getProductivityMetrics() {
    try {
      return await this.analyticsService.getProductivityMetrics();
    } catch (error) {
      throw error;
    }
  }

  @Get('usage-summary')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getUsageSummary() {
    try {
      return await this.analyticsService.getUsageSummary();
    } catch (error) {
      throw error;
    }
  }

  @Get('growth-trends')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getGrowthTrends() {
    try {
      return await this.analyticsService.getGrowthTrends();
    } catch (error) {
      throw error;
    }
  }

  @Get('monthly-data')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getMonthlyData() {
    try {
      return await this.analyticsService.getMonthlyData();
    } catch (error) {
      throw error;
    }
  }

  @Get('user-stats')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getUserStats() {
    try {
      return await this.analyticsService.getUserStats();
    } catch (error) {
      throw error;
    }
  }
}
