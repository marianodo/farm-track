import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../repository/analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  /**
   * Single source of truth for the analytics dashboard.
   *
   * The usage verdict used to be computed twice — once here and once inline in
   * the controller — which meant the two could drift. It now lives only in the
   * repository, where it is derived from time-windowed activity.
   */
  async getOverview() {
    const [
      basicStats,
      monthlyGrowth,
      activity,
      engagement,
      usageEvaluation,
      lastActivity,
      concentration,
    ] = await Promise.all([
      this.analyticsRepository.getBasicStats(),
      this.analyticsRepository.getMonthlyGrowth(),
      this.analyticsRepository.getWindowedActivity(),
      this.analyticsRepository.getEngagementBreakdown(),
      this.analyticsRepository.getUsageEvaluation(),
      this.analyticsRepository.getLastActivity(),
      this.analyticsRepository.getConcentration(),
    ]);

    return {
      basicStats,
      monthlyGrowth,
      activity,
      engagement,
      usageEvaluation,
      lastActivity,
      concentration,
      generatedAt: new Date().toISOString(),
    };
  }

  async getBasicStats() {
    return await this.analyticsRepository.getBasicStats();
  }

  async getMonthlyGrowth() {
    return await this.analyticsRepository.getMonthlyGrowth();
  }

  async getWindowedActivity() {
    return await this.analyticsRepository.getWindowedActivity();
  }

  async getEngagementBreakdown() {
    return await this.analyticsRepository.getEngagementBreakdown();
  }

  async getConcentration() {
    return await this.analyticsRepository.getConcentration();
  }

  async getActivityAnalysis() {
    const [topUsers, dailyActivity] = await Promise.all([
      this.analyticsRepository.getTopActiveUsers(),
      this.analyticsRepository.getDailyActivity(),
    ]);

    return { topUsers, dailyActivity };
  }

  async getGeographicDistribution() {
    const [locations, fieldsWithCoords] = await Promise.all([
      this.analyticsRepository.getGeographicDistribution(),
      this.analyticsRepository.getFieldsWithCoordinates(),
    ]);

    return { locations, fieldsWithCoords };
  }

  async getProductivityMetrics() {
    return await this.analyticsRepository.getProductivityMetrics();
  }

  async getUsageSummary() {
    const [basicStats, monthlyGrowth, usageEvaluation] = await Promise.all([
      this.analyticsRepository.getBasicStats(),
      this.analyticsRepository.getMonthlyGrowth(),
      this.analyticsRepository.getUsageEvaluation(),
    ]);

    return { basicStats, monthlyGrowth, usageEvaluation };
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

  /** Kept for backwards compatibility with existing callers. */
  async getAllAnalytics() {
    return await this.getOverview();
  }
}
