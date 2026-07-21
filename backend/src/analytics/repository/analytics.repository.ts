import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Analytics over *real* product usage.
 *
 * The previous version of this file called a user "active" if they had ever
 * created a Field — with no date filter at all. That made every user active
 * forever, so `usageLevel` reported "high" while the last measurement in the
 * database was nine months old. Every metric here is now anchored to a time
 * window and to measurements (the action that means someone actually used the
 * app), not to rows that merely exist.
 */

const ACTIVE_WINDOW_DAYS = 30;

export interface WindowedActivity {
  activeUsers30d: number;
  activeUsers90d: number;
  measurements30d: number;
  measurements90d: number;
  reports30d: number;
  reports90d: number;
}

export interface EngagementBreakdown {
  totalUsers: number;
  everMeasured: number;
  neverMeasured: number;
  activatedRate: number;
}

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Inventory counts. These are legitimately cumulative — they are stock, not usage. */
  async getBasicStats() {
    const result = await this.prisma.$queryRaw<
      Array<{
        total_users: bigint;
        verified_users: bigint;
        total_fields: bigint;
        total_pens: bigint;
        total_measurements: bigint;
        total_reports: bigint;
        total_subjects: bigint;
        total_productivity: bigint;
      }>
    >`
      SELECT
        (SELECT COUNT(*) FROM "User") as total_users,
        (SELECT COUNT(*) FROM "User" WHERE is_verified = true) as verified_users,
        (SELECT COUNT(*) FROM "Field") as total_fields,
        (SELECT COUNT(*) FROM "Pen") as total_pens,
        (SELECT COUNT(*) FROM "Measurement") as total_measurements,
        (SELECT COUNT(*) FROM "Report") as total_reports,
        (SELECT COUNT(*) FROM "Subject") as total_subjects,
        (SELECT COUNT(*) FROM "Productivity") as total_productivity
    `;

    const stats = result[0];
    return {
      totalUsers: Number(stats.total_users),
      verifiedUsers: Number(stats.verified_users),
      totalFields: Number(stats.total_fields),
      totalPens: Number(stats.total_pens),
      totalMeasurements: Number(stats.total_measurements),
      totalReports: Number(stats.total_reports),
      totalSubjects: Number(stats.total_subjects),
      totalProductivity: Number(stats.total_productivity),
    };
  }

  /**
   * Activity inside real time windows. A user is active only if they recorded a
   * measurement in the window — creating an account or a field long ago does not
   * keep counting.
   */
  async getWindowedActivity(): Promise<WindowedActivity> {
    const result = await this.prisma.$queryRaw<
      Array<{
        active_users_30d: bigint;
        active_users_90d: bigint;
        measurements_30d: bigint;
        measurements_90d: bigint;
        reports_30d: bigint;
        reports_90d: bigint;
      }>
    >`
      WITH measurement_owners AS (
        SELECT m.created_at, f."userId"
        FROM "Measurement" m
        JOIN "Report" r ON m.report_id = r.id
        JOIN "Field" f ON r.field_id = f.id
      )
      SELECT
        (SELECT COUNT(DISTINCT "userId") FROM measurement_owners
          WHERE created_at >= NOW() - INTERVAL '30 days') as active_users_30d,
        (SELECT COUNT(DISTINCT "userId") FROM measurement_owners
          WHERE created_at >= NOW() - INTERVAL '90 days') as active_users_90d,
        (SELECT COUNT(*) FROM "Measurement"
          WHERE created_at >= NOW() - INTERVAL '30 days') as measurements_30d,
        (SELECT COUNT(*) FROM "Measurement"
          WHERE created_at >= NOW() - INTERVAL '90 days') as measurements_90d,
        (SELECT COUNT(*) FROM "Report"
          WHERE created_at >= NOW() - INTERVAL '30 days') as reports_30d,
        (SELECT COUNT(*) FROM "Report"
          WHERE created_at >= NOW() - INTERVAL '90 days') as reports_90d
    `;

    const r = result[0];
    return {
      activeUsers30d: Number(r.active_users_30d),
      activeUsers90d: Number(r.active_users_90d),
      measurements30d: Number(r.measurements_30d),
      measurements90d: Number(r.measurements_90d),
      reports30d: Number(r.reports_30d),
      reports90d: Number(r.reports_90d),
    };
  }

  /**
   * Activation funnel: how many registered users ever produced a measurement.
   * This is the honest denominator for "adoption" — signing up is not adoption.
   */
  async getEngagementBreakdown(): Promise<EngagementBreakdown> {
    const result = await this.prisma.$queryRaw<
      Array<{ total_users: bigint; ever_measured: bigint }>
    >`
      SELECT
        (SELECT COUNT(*) FROM "User") as total_users,
        (SELECT COUNT(DISTINCT f."userId")
           FROM "Measurement" m
           JOIN "Report" r ON m.report_id = r.id
           JOIN "Field" f ON r.field_id = f.id) as ever_measured
    `;

    const totalUsers = Number(result[0].total_users);
    const everMeasured = Number(result[0].ever_measured);

    return {
      totalUsers,
      everMeasured,
      neverMeasured: totalUsers - everMeasured,
      activatedRate: totalUsers > 0 ? (everMeasured / totalUsers) * 100 : 0,
    };
  }

  /** Trailing 30 days, compared against the 30 days before that. */
  async getMonthlyGrowth() {
    const result = await this.prisma.$queryRaw<
      Array<{
        new_users_month: bigint;
        new_fields_month: bigint;
        new_measurements_month: bigint;
        new_reports_month: bigint;
        prev_measurements: bigint;
        prev_users: bigint;
      }>
    >`
      SELECT
        (SELECT COUNT(*) FROM "User"
          WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_month,
        (SELECT COUNT(*) FROM "Field"
          WHERE created_at >= NOW() - INTERVAL '30 days') as new_fields_month,
        (SELECT COUNT(*) FROM "Measurement"
          WHERE created_at >= NOW() - INTERVAL '30 days') as new_measurements_month,
        (SELECT COUNT(*) FROM "Report"
          WHERE created_at >= NOW() - INTERVAL '30 days') as new_reports_month,
        (SELECT COUNT(*) FROM "Measurement"
          WHERE created_at >= NOW() - INTERVAL '60 days'
            AND created_at <  NOW() - INTERVAL '30 days') as prev_measurements,
        (SELECT COUNT(*) FROM "User"
          WHERE created_at >= NOW() - INTERVAL '60 days'
            AND created_at <  NOW() - INTERVAL '30 days') as prev_users
    `;

    const g = result[0];
    const newMeasurementsMonth = Number(g.new_measurements_month);
    const prevMeasurements = Number(g.prev_measurements);

    return {
      newUsersMonth: Number(g.new_users_month),
      newFieldsMonth: Number(g.new_fields_month),
      newMeasurementsMonth,
      newReportsMonth: Number(g.new_reports_month),
      prevMeasurements,
      prevUsers: Number(g.prev_users),
      // null when there is no prior baseline to compare against.
      measurementTrendPct:
        prevMeasurements > 0
          ? ((newMeasurementsMonth - prevMeasurements) / prevMeasurements) * 100
          : null,
    };
  }

  /**
   * Health verdict driven by *recent* activity and how long the app has been
   * silent — not by how many rows exist.
   */
  async getUsageEvaluation() {
    const [basicStats, activity, engagement, growth, lastActivity] =
      await Promise.all([
        this.getBasicStats(),
        this.getWindowedActivity(),
        this.getEngagementBreakdown(),
        this.getMonthlyGrowth(),
        this.getLastActivity(),
      ]);

    const daysSinceLastActivity = lastActivity?.diffDays ?? null;

    // Ordered most-severe first; the first match wins.
    let usageLevel: 'dormant' | 'declining' | 'low' | 'medium' | 'high';
    let usageReason: string;

    if (daysSinceLastActivity === null) {
      usageLevel = 'dormant';
      usageReason = 'No hay ninguna actividad registrada en la base de datos.';
    } else if (daysSinceLastActivity > 90) {
      usageLevel = 'dormant';
      usageReason = `Sin actividad hace ${daysSinceLastActivity} días. La aplicación está prácticamente sin uso.`;
    } else if (activity.activeUsers30d === 0) {
      usageLevel = 'declining';
      usageReason = `Ningún usuario registró mediciones en los últimos 30 días (última actividad hace ${daysSinceLastActivity} días).`;
    } else if (activity.activeUsers30d >= 5 && activity.measurements30d >= 200) {
      usageLevel = 'high';
      usageReason = `${activity.activeUsers30d} usuarios activos y ${activity.measurements30d} mediciones en los últimos 30 días.`;
    } else if (activity.activeUsers30d >= 2 && activity.measurements30d >= 50) {
      usageLevel = 'medium';
      usageReason = `${activity.activeUsers30d} usuarios activos y ${activity.measurements30d} mediciones en los últimos 30 días.`;
    } else {
      usageLevel = 'low';
      usageReason = `Solo ${activity.activeUsers30d} usuario(s) activo(s) y ${activity.measurements30d} mediciones en los últimos 30 días.`;
    }

    const avgMeasurementsPerReport =
      basicStats.totalReports > 0
        ? basicStats.totalMeasurements / basicStats.totalReports
        : 0;

    const avgFieldsPerActivatedUser =
      engagement.everMeasured > 0
        ? basicStats.totalFields / engagement.everMeasured
        : 0;

    const avgPensPerField =
      basicStats.totalFields > 0
        ? basicStats.totalPens / basicStats.totalFields
        : 0;

    return {
      usageLevel,
      usageReason,
      daysSinceLastActivity,
      activationRate: engagement.activatedRate,
      retention30d:
        engagement.everMeasured > 0
          ? (activity.activeUsers30d / engagement.everMeasured) * 100
          : 0,
      avgFieldsPerActivatedUser,
      avgPensPerField,
      avgMeasurementsPerReport,
      hasGrowth: growth.newUsersMonth > 0,
      hasRegularActivity: activity.measurements30d > 10,
      window: ACTIVE_WINDOW_DAYS,
    };
  }

  /**
   * Per-user activity, including how long each user has been inactive and
   * whether they ever activated at all.
   */
  async getUserStats() {
    const result = await this.prisma.$queryRaw<
      Array<{
        user_id: string;
        username: string;
        email: string;
        created_at: Date;
        fields_count: bigint;
        pens_count: bigint;
        reports_count: bigint;
        measurements_count: bigint;
        last_measurement: Date | null;
      }>
    >`
      SELECT
        u.id           as user_id,
        u.username,
        u.email,
        u.created_at,
        COALESCE(agg.fields_count, 0)       as fields_count,
        COALESCE(agg.pens_count, 0)         as pens_count,
        COALESCE(agg.reports_count, 0)      as reports_count,
        COALESCE(agg.measurements_count, 0) as measurements_count,
        agg.last_measurement
      FROM "User" u
      LEFT JOIN (
        SELECT
          f."userId",
          COUNT(DISTINCT f.id) as fields_count,
          COUNT(DISTINCT p.id) as pens_count,
          COUNT(DISTINCT r.id) as reports_count,
          COUNT(DISTINCT m.id) as measurements_count,
          MAX(m.created_at)    as last_measurement
        FROM "Field" f
        LEFT JOIN "Pen" p         ON p."fieldId"  = f.id
        LEFT JOIN "Report" r      ON r.field_id   = f.id
        LEFT JOIN "Measurement" m ON m.report_id  = r.id
        GROUP BY f."userId"
      ) agg ON agg."userId" = u.id
      ORDER BY agg.last_measurement DESC NULLS LAST, measurements_count DESC
    `;

    const now = Date.now();
    const DAY_MS = 1000 * 60 * 60 * 24;

    return result.map((row) => {
      const lastMeasurement = row.last_measurement;
      const daysSinceLastMeasurement = lastMeasurement
        ? Math.floor((now - new Date(lastMeasurement).getTime()) / DAY_MS)
        : null;
      const measurementsCount = Number(row.measurements_count);

      let status: 'active' | 'idle' | 'churned' | 'never_activated';
      if (measurementsCount === 0 || daysSinceLastMeasurement === null) {
        status = 'never_activated';
      } else if (daysSinceLastMeasurement <= 30) {
        status = 'active';
      } else if (daysSinceLastMeasurement <= 90) {
        status = 'idle';
      } else {
        status = 'churned';
      }

      return {
        userId: row.user_id,
        username: row.username,
        email: row.email,
        registeredAt: row.created_at,
        fieldsCount: Number(row.fields_count),
        pensCount: Number(row.pens_count),
        reportsCount: Number(row.reports_count),
        measurementsCount,
        lastMeasurement,
        daysSinceLastMeasurement,
        status,
      };
    });
  }

  /**
   * Monthly series. Months with no activity are emitted as zeros so a flat or
   * dying trend is visible instead of being silently skipped.
   */
  async getMonthlyData(months = 12) {
    const result = await this.prisma.$queryRaw<
      Array<{
        month: Date;
        measurements_count: bigint;
        reports_count: bigint;
        users_count: bigint;
        active_users: bigint;
      }>
    >`
      WITH series AS (
        SELECT generate_series(
          date_trunc('month', NOW()) - (INTERVAL '1 month' * ${months - 1}::int),
          date_trunc('month', NOW()),
          INTERVAL '1 month'
        ) AS month
      ),
      measurement_owners AS (
        SELECT m.created_at, f."userId"
        FROM "Measurement" m
        JOIN "Report" r ON m.report_id = r.id
        JOIN "Field" f  ON r.field_id  = f.id
      )
      SELECT
        s.month,
        (SELECT COUNT(*) FROM "Measurement" m
          WHERE date_trunc('month', m.created_at) = s.month) as measurements_count,
        (SELECT COUNT(*) FROM "Report" r
          WHERE date_trunc('month', r.created_at) = s.month) as reports_count,
        (SELECT COUNT(*) FROM "User" u
          WHERE date_trunc('month', u.created_at) = s.month) as users_count,
        (SELECT COUNT(DISTINCT mo."userId") FROM measurement_owners mo
          WHERE date_trunc('month', mo.created_at) = s.month) as active_users
      FROM series s
      ORDER BY s.month
    `;

    return result.map((row) => ({
      month: row.month,
      measurementsCount: Number(row.measurements_count),
      reportsCount: Number(row.reports_count),
      usersCount: Number(row.users_count),
      activeUsers: Number(row.active_users),
    }));
  }

  /** Most recent real action across the product, with how long ago it happened. */
  async getLastActivity() {
    const result = await this.prisma.$queryRaw<
      Array<{
        activity_type: string;
        activity_date: Date;
        user_email: string;
      }>
    >`
      WITH latest_activities AS (
        (SELECT 'Medición' as activity_type, m.created_at as activity_date, u.email as user_email
         FROM "Measurement" m
         JOIN "Report" r ON m.report_id = r.id
         JOIN "Field" f  ON r.field_id  = f.id
         JOIN "User" u   ON f."userId"  = u.id
         ORDER BY m.created_at DESC LIMIT 1)
        UNION ALL
        (SELECT 'Reporte', r.created_at, u.email
         FROM "Report" r
         JOIN "Field" f ON r.field_id = f.id
         JOIN "User" u  ON f."userId" = u.id
         ORDER BY r.created_at DESC LIMIT 1)
        UNION ALL
        (SELECT 'Campo', f.created_at, u.email
         FROM "Field" f
         JOIN "User" u ON f."userId" = u.id
         ORDER BY f.created_at DESC LIMIT 1)
        UNION ALL
        (SELECT 'Usuario registrado', u.created_at, u.email
         FROM "User" u
         ORDER BY u.created_at DESC LIMIT 1)
      )
      SELECT * FROM latest_activities
      ORDER BY activity_date DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    const lastActivity = result[0];
    const diffMs = Date.now() - new Date(lastActivity.activity_date).getTime();

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let timeAgo: string;
    if (diffSeconds < 60) {
      timeAgo = `${diffSeconds} segundo${diffSeconds !== 1 ? 's' : ''}`;
    } else if (diffMinutes < 60) {
      timeAgo = `${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 60) {
      timeAgo = `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      timeAgo = `${diffMonths} mes${diffMonths !== 1 ? 'es' : ''}`;
    }

    return {
      activityType: lastActivity.activity_type,
      activityDate: lastActivity.activity_date,
      userEmail: lastActivity.user_email,
      timeAgo,
      diffSeconds,
      diffMinutes,
      diffHours,
      diffDays,
    };
  }

  /** Share of total measurements held by the single most prolific user. */
  async getConcentration() {
    const result = await this.prisma.$queryRaw<
      Array<{ email: string; measurements: bigint; total: bigint }>
    >`
      WITH per_user AS (
        SELECT u.email, COUNT(m.id) as measurements
        FROM "User" u
        JOIN "Field" f       ON f."userId"  = u.id
        JOIN "Report" r      ON r.field_id  = f.id
        JOIN "Measurement" m ON m.report_id = r.id
        GROUP BY u.email
      )
      SELECT email, measurements, (SELECT SUM(measurements) FROM per_user) as total
      FROM per_user
      ORDER BY measurements DESC
      LIMIT 1
    `;

    if (result.length === 0) return null;

    const top = result[0];
    const total = Number(top.total);
    const measurements = Number(top.measurements);

    return {
      topUserEmail: top.email,
      topUserMeasurements: measurements,
      totalMeasurements: total,
      sharePct: total > 0 ? (measurements / total) * 100 : 0,
    };
  }

  async getTopActiveUsers(limit = 5) {
    const stats = await this.getUserStats();
    return stats
      .filter((u) => u.measurementsCount > 0)
      .sort((a, b) => b.measurementsCount - a.measurementsCount)
      .slice(0, limit);
  }

  async getDailyActivity() {
    return await this.prisma.$queryRaw`
      SELECT
        EXTRACT(DOW FROM created_at) as day_of_week,
        COUNT(*) as measurement_count
      FROM "Measurement"
      GROUP BY EXTRACT(DOW FROM created_at)
      ORDER BY day_of_week
    `;
  }

  async getGeographicDistribution(limit = 10) {
    return await this.prisma.field.groupBy({
      by: ['location'],
      where: { location: { not: null } },
      _count: { location: true },
      orderBy: { _count: { location: 'desc' } },
      take: limit,
    });
  }

  async getFieldsWithCoordinates() {
    return await this.prisma.field.count({
      where: {
        AND: [{ latitude: { not: null } }, { longitude: { not: null } }],
      },
    });
  }

  async getProductivityMetrics() {
    const result = await this.prisma.productivity.aggregate({
      where: { total_cows: { not: null } },
      _count: { total_cows: true },
      _avg: {
        total_cows: true,
        milking_cows: true,
        average_production: true,
        somatic_cells: true,
      },
    });

    return {
      totalRecords: result._count.total_cows,
      avgTotalCows: result._avg.total_cows,
      avgMilkingCows: result._avg.milking_cows,
      avgProduction: result._avg.average_production,
      avgSomaticCells: result._avg.somatic_cells,
    };
  }
}
