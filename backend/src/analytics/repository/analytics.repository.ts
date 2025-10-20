import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getBasicStats() {
    // Usar una consulta SQL optimizada para obtener múltiples conteos
    const result = await this.prisma.$queryRaw<Array<{
      total_users: bigint;
      verified_users: bigint;
      active_users: bigint;
      total_fields: bigint;
      total_pens: bigint;
      total_measurements: bigint;
      total_reports: bigint;
      total_subjects: bigint;
      total_productivity: bigint;
    }>>`
      SELECT 
        (SELECT COUNT(*) FROM "User") as total_users,
        (SELECT COUNT(*) FROM "User" WHERE is_verified = true) as verified_users,
        (SELECT COUNT(DISTINCT "userId") FROM "Field") as active_users,
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
      activeUsers: Number(stats.active_users),
      totalFields: Number(stats.total_fields),
      totalPens: Number(stats.total_pens),
      totalMeasurements: Number(stats.total_measurements),
      totalReports: Number(stats.total_reports),
      totalSubjects: Number(stats.total_subjects),
      totalProductivity: Number(stats.total_productivity)
    };
  }

  async getMonthlyGrowth() {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Usar una consulta SQL optimizada para obtener múltiples conteos del último mes
    const result = await this.prisma.$queryRaw<Array<{
      new_users_month: bigint;
      new_fields_month: bigint;
      new_measurements_month: bigint;
      new_reports_month: bigint;
    }>>`
      SELECT 
        (SELECT COUNT(*) FROM "User" WHERE created_at >= ${lastMonth}) as new_users_month,
        (SELECT COUNT(*) FROM "Field" WHERE created_at >= ${lastMonth}) as new_fields_month,
        (SELECT COUNT(*) FROM "Measurement" WHERE created_at >= ${lastMonth}) as new_measurements_month,
        (SELECT COUNT(*) FROM "Report" WHERE created_at >= ${lastMonth}) as new_reports_month
    `;

    const growth = result[0];
    return {
      newUsersMonth: Number(growth.new_users_month),
      newFieldsMonth: Number(growth.new_fields_month),
      newMeasurementsMonth: Number(growth.new_measurements_month),
      newReportsMonth: Number(growth.new_reports_month)
    };
  }

  async getTopActiveUsers(limit = 5) {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        _count: {
          select: {
            fields: true
          }
        }
      },
      where: {
        fields: {
          some: {}
        }
      },
      orderBy: {
        fields: {
          _count: 'desc'
        }
      },
      take: limit
    });
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
      where: {
        location: {
          not: null
        }
      },
      _count: {
        location: true
      },
      orderBy: {
        _count: {
          location: 'desc'
        }
      },
      take: limit
    });
  }

  async getFieldsWithCoordinates() {
    return await this.prisma.field.count({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      }
    });
  }

  async getProductivityMetrics() {
    const result = await this.prisma.productivity.aggregate({
      where: {
        total_cows: { not: null }
      },
      _count: {
        total_cows: true
      },
      _avg: {
        total_cows: true,
        milking_cows: true,
        average_production: true,
        somatic_cells: true
      }
    });

    return {
      totalRecords: result._count.total_cows,
      avgTotalCows: result._avg.total_cows,
      avgMilkingCows: result._avg.milking_cows,
      avgProduction: result._avg.average_production,
      avgSomaticCells: result._avg.somatic_cells
    };
  }

  async getUserGrowthOverTime(months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as new_users
      FROM "User"
      WHERE created_at >= ${startDate}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;
  }

  async getMeasurementActivityOverTime(months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as measurement_count
      FROM "Measurement"
      WHERE created_at >= ${startDate}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;
  }

  async getMonthlyData(months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Obtener datos mensuales en una sola consulta
    const result = await this.prisma.$queryRaw<Array<{
      month: Date;
      measurements_count: bigint;
      reports_count: bigint;
      users_count: bigint;
    }>>`
      WITH monthly_data AS (
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          'measurement' as type,
          COUNT(*) as count
        FROM "Measurement"
        WHERE created_at >= ${startDate}
        GROUP BY DATE_TRUNC('month', created_at)
        
        UNION ALL
        
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          'report' as type,
          COUNT(*) as count
        FROM "Report"
        WHERE created_at >= ${startDate}
        GROUP BY DATE_TRUNC('month', created_at)
        
        UNION ALL
        
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          'user' as type,
          COUNT(*) as count
        FROM "User"
        WHERE created_at >= ${startDate}
        GROUP BY DATE_TRUNC('month', created_at)
      )
      SELECT 
        month,
        SUM(CASE WHEN type = 'measurement' THEN count ELSE 0 END) as measurements_count,
        SUM(CASE WHEN type = 'report' THEN count ELSE 0 END) as reports_count,
        SUM(CASE WHEN type = 'user' THEN count ELSE 0 END) as users_count
      FROM monthly_data
      GROUP BY month
      ORDER BY month
    `;

    return result.map(row => ({
      month: row.month,
      measurementsCount: Number(row.measurements_count),
      reportsCount: Number(row.reports_count),
      usersCount: Number(row.users_count)
    }));
  }

  async getUserStats() {
    // Obtener estadísticas por usuario
    const result = await this.prisma.$queryRaw<Array<{
      user_id: string;
      username: string;
      email: string;
      fields_count: bigint;
      pens_count: bigint;
      reports_count: bigint;
      measurements_count: bigint;
    }>>`
      SELECT 
        u.id as user_id,
        u.username,
        u.email,
        COALESCE(f.fields_count, 0) as fields_count,
        COALESCE(p.pens_count, 0) as pens_count,
        COALESCE(r.reports_count, 0) as reports_count,
        COALESCE(m.measurements_count, 0) as measurements_count
      FROM "User" u
      LEFT JOIN (
        SELECT "userId", COUNT(*) as fields_count
        FROM "Field"
        GROUP BY "userId"
      ) f ON u.id = f."userId"
      LEFT JOIN (
        SELECT f2."userId", COUNT(p2.id) as pens_count
        FROM "Field" f2
        LEFT JOIN "Pen" p2 ON f2.id = p2."fieldId"
        GROUP BY f2."userId"
      ) p ON u.id = p."userId"
      LEFT JOIN (
        SELECT f3."userId", COUNT(r2.id) as reports_count
        FROM "Field" f3
        LEFT JOIN "Report" r2 ON f3.id = r2.field_id
        GROUP BY f3."userId"
      ) r ON u.id = r."userId"
      LEFT JOIN (
        SELECT f4."userId", COUNT(m2.id) as measurements_count
        FROM "Field" f4
        LEFT JOIN "Report" r3 ON f4.id = r3.field_id
        LEFT JOIN "Measurement" m2 ON r3.id = m2.report_id
        GROUP BY f4."userId"
      ) m ON u.id = m."userId"
      ORDER BY fields_count DESC, measurements_count DESC
    `;

    return result.map(row => ({
      userId: row.user_id,
      username: row.username,
      email: row.email,
      fieldsCount: Number(row.fields_count),
      pensCount: Number(row.pens_count),
      reportsCount: Number(row.reports_count),
      measurementsCount: Number(row.measurements_count)
    }));
  }

  async getUsageEvaluation() {
    // Hacer las consultas de forma secuencial para evitar problemas de conexión
    const basicStats = await this.getBasicStats();
    const monthlyGrowth = await this.getMonthlyGrowth();

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

    return {
      adoptionRate,
      avgFieldsPerUser,
      avgPensPerField,
      avgMeasurementsPerReport,
      usageLevel,
      hasGrowth,
      hasRegularActivity
    };
  }

  async getLastActivity() {
    // Obtener la última actividad de diferentes entidades
    const result = await this.prisma.$queryRaw<Array<{
      activity_type: string;
      activity_date: Date;
      user_email: string;
    }>>`
      WITH latest_activities AS (
        SELECT 
          'Medición' as activity_type,
          m.created_at as activity_date,
          u.email as user_email
        FROM "Measurement" m
        JOIN "Report" r ON m.report_id = r.id
        JOIN "Field" f ON r.field_id = f.id
        JOIN "User" u ON f."userId" = u.id
        ORDER BY m.created_at DESC
        LIMIT 1
        
        UNION ALL
        
        SELECT 
          'Reporte' as activity_type,
          r.created_at as activity_date,
          u.email as user_email
        FROM "Report" r
        JOIN "Field" f ON r.field_id = f.id
        JOIN "User" u ON f."userId" = u.id
        ORDER BY r.created_at DESC
        LIMIT 1
        
        UNION ALL
        
        SELECT 
          'Campo' as activity_type,
          f.created_at as activity_date,
          u.email as user_email
        FROM "Field" f
        JOIN "User" u ON f."userId" = u.id
        ORDER BY f.created_at DESC
        LIMIT 1
        
        UNION ALL
        
        SELECT 
          'Usuario registrado' as activity_type,
          u.created_at as activity_date,
          u.email as user_email
        FROM "User" u
        ORDER BY u.created_at DESC
        LIMIT 1
      )
      SELECT *
      FROM latest_activities
      ORDER BY activity_date DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    const lastActivity = result[0];
    const now = new Date();
    const activityDate = new Date(lastActivity.activity_date);
    const diffMs = now.getTime() - activityDate.getTime();
    
    // Calcular diferencias
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Determinar el formato más apropiado
    let timeAgo = '';
    if (diffSeconds < 60) {
      timeAgo = `${diffSeconds} segundo${diffSeconds !== 1 ? 's' : ''}`;
    } else if (diffMinutes < 60) {
      timeAgo = `${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else {
      timeAgo = `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    }

    return {
      activityType: lastActivity.activity_type,
      activityDate: lastActivity.activity_date,
      userEmail: lastActivity.user_email,
      timeAgo,
      diffSeconds,
      diffMinutes,
      diffHours,
      diffDays
    };
  }
}
