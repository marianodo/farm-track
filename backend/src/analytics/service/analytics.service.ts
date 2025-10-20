import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../repository/analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async getBasicStats() {
    return await this.analyticsRepository.getBasicStats();
  }

  async getMonthlyGrowth() {
    return await this.analyticsRepository.getMonthlyGrowth();
  }

  async getActivityAnalysis() {
    // Hacer las consultas de forma secuencial
    const topUsers = await this.analyticsRepository.getTopActiveUsers();
    const dailyActivity = await this.analyticsRepository.getDailyActivity();

    return {
      topUsers,
      dailyActivity
    };
  }

  async getGeographicDistribution() {
    // Hacer las consultas de forma secuencial
    const locations = await this.analyticsRepository.getGeographicDistribution();
    const fieldsWithCoords = await this.analyticsRepository.getFieldsWithCoordinates();

    return {
      locations,
      fieldsWithCoords
    };
  }

  async getProductivityMetrics() {
    return await this.analyticsRepository.getProductivityMetrics();
  }

  async getUsageSummary() {
    // Hacer las consultas de forma secuencial
    const basicStats = await this.analyticsRepository.getBasicStats();
    const monthlyGrowth = await this.analyticsRepository.getMonthlyGrowth();
    const usageEvaluation = await this.analyticsRepository.getUsageEvaluation();

    return {
      basicStats,
      monthlyGrowth,
      usageEvaluation
    };
  }

  async getGrowthTrends() {
    // Hacer las consultas de forma secuencial
    const userGrowth = await this.analyticsRepository.getUserGrowthOverTime();
    const measurementActivity = await this.analyticsRepository.getMeasurementActivityOverTime();

    return {
      userGrowth,
      measurementActivity
    };
  }

  async getMonthlyData() {
    return await this.analyticsRepository.getMonthlyData();
  }

  async getUserStats() {
    return await this.analyticsRepository.getUserStats();
  }

  async getLastActivity() {
    return await this.analyticsRepository.getLastActivity();
  }

  async getAllAnalytics() {
    // Hacer las consultas de forma secuencial para evitar problemas de conexión
    // Solo obtener los datos esenciales para el dashboard
    const basicStats = await this.getBasicStats();
    const monthlyGrowth = await this.getMonthlyGrowth();
    const usageSummary = await this.getUsageSummary();

    return {
      basicStats,
      monthlyGrowth,
      usageEvaluation: usageSummary.usageEvaluation,
      generatedAt: new Date().toISOString()
    };
  }
}
