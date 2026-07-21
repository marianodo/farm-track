import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from '../service/analytics.service';
import { Roles } from '../../auth/decorator/roles.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Everything the analytics dashboard needs, in one round trip.
   * The usage verdict is computed in the repository — not duplicated here.
   */
  @Get('overview')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getOverview() {
    return await this.analyticsService.getOverview();
  }

  @Get('basic-stats')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getBasicStats() {
    return await this.analyticsService.getBasicStats();
  }

  @Get('monthly-growth')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getMonthlyGrowth() {
    return await this.analyticsService.getMonthlyGrowth();
  }

  @Get('activity-windows')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getWindowedActivity() {
    return await this.analyticsService.getWindowedActivity();
  }

  @Get('engagement')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getEngagement() {
    return await this.analyticsService.getEngagementBreakdown();
  }

  @Get('concentration')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getConcentration() {
    return await this.analyticsService.getConcentration();
  }

  @Get('activity')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getActivityAnalysis() {
    return await this.analyticsService.getActivityAnalysis();
  }

  @Get('geographic')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getGeographicDistribution() {
    return await this.analyticsService.getGeographicDistribution();
  }

  @Get('productivity')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getProductivityMetrics() {
    return await this.analyticsService.getProductivityMetrics();
  }

  @Get('usage-summary')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getUsageSummary() {
    return await this.analyticsService.getUsageSummary();
  }

  @Get('monthly-data')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getMonthlyData() {
    return await this.analyticsService.getMonthlyData();
  }

  @Get('user-stats')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getUserStats() {
    return await this.analyticsService.getUserStats();
  }

  @Get('last-activity')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  async getLastActivity() {
    return await this.analyticsService.getLastActivity();
  }
}
