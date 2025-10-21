"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, MapPin, Layers, BarChart3, FileText, Activity, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface BasicStats {
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
  totalFields: number;
  totalPens: number;
  totalMeasurements: number;
  totalReports: number;
  totalSubjects: number;
  totalProductivity: number;
}

interface MonthlyGrowth {
  newUsersMonth: number;
  newFieldsMonth: number;
  newMeasurementsMonth: number;
  newReportsMonth: number;
}

interface UsageEvaluation {
  adoptionRate: number;
  avgFieldsPerUser: number;
  avgPensPerField: number;
  avgMeasurementsPerReport: number;
  usageLevel: 'low' | 'medium' | 'high';
  hasGrowth: boolean;
  hasRegularActivity: boolean;
}

interface MonthlyData {
  month: string;
  measurementsCount: number;
  reportsCount: number;
  usersCount: number;
}

interface UserStats {
  userId: string;
  username: string;
  email: string;
  fieldsCount: number;
  pensCount: number;
  reportsCount: number;
  measurementsCount: number;
}

interface LastActivity {
  activityType: string;
  activityDate: string;
  userEmail: string;
  timeAgo: string;
  diffSeconds: number;
  diffMinutes: number;
  diffHours: number;
  diffDays: number;
}

interface AnalyticsData {
  basicStats: BasicStats;
  monthlyGrowth: MonthlyGrowth;
  usageEvaluation: UsageEvaluation;
  generatedAt: string;
}

export default function AnalyticsPage() {
  const { token } = useAuthStore();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [lastActivity, setLastActivity] = useState<LastActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data sequentially to avoid database connection issues
      const overviewResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!overviewResponse.ok) {
        throw new Error('Error al cargar los datos de analytics');
      }

      const overviewData = await overviewResponse.json();
      setAnalyticsData(overviewData);

      // Fetch last activity
      const lastActivityResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/last-activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (lastActivityResponse.ok) {
        const lastActivityResult = await lastActivityResponse.json();
        setLastActivity(lastActivityResult);
      }

      // Fetch monthly data
      const monthlyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/monthly-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (monthlyResponse.ok) {
        const monthlyDataResult = await monthlyResponse.json();
        const formattedMonthlyData = monthlyDataResult.map((item: any) => ({
          month: new Date(item.month).toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'short' 
          }),
          measurementsCount: item.measurementsCount,
          reportsCount: item.reportsCount,
          usersCount: item.usersCount
        }));
        setMonthlyData(formattedMonthlyData);
      }

      // Fetch user stats
      const userStatsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/user-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (userStatsResponse.ok) {
        const userStatsResult = await userStatsResponse.json();
        setUserStats(userStatsResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getUsageLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageLevelText = (level: string) => {
    switch (level) {
      case 'high': return 'Alto Uso';
      case 'medium': return 'Uso Moderado';
      case 'low': return 'Bajo Uso';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
          <span className="text-lg">Cargando análisis de la aplicación...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Sin datos</h2>
          <p className="text-gray-500">No se encontraron datos de analytics</p>
        </div>
      </div>
    );
  }

  const { basicStats, monthlyGrowth, usageEvaluation } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis de la Aplicación</h1>
          <p className="text-gray-600 mt-1">
            Estadísticas y métricas de uso de Farm Track
          </p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Usage Level Alert */}
      <Card className={`border-l-4 ${
        usageEvaluation.usageLevel === 'high' ? 'border-green-500 bg-green-50' :
        usageEvaluation.usageLevel === 'medium' ? 'border-yellow-500 bg-yellow-50' :
        'border-red-500 bg-red-50'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            {usageEvaluation.usageLevel === 'high' ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : usageEvaluation.usageLevel === 'medium' ? (
              <Clock className="h-6 w-6 text-yellow-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600" />
            )}
            <div>
              <h3 className="font-semibold">
                Estado de la Aplicación: {getUsageLevelText(usageEvaluation.usageLevel)}
              </h3>
              <p className="text-sm text-gray-600">
                {usageEvaluation.usageLevel === 'high' && '✅ La aplicación está siendo utilizada activamente'}
                {usageEvaluation.usageLevel === 'medium' && '⚠️ La aplicación tiene uso moderado'}
                {usageEvaluation.usageLevel === 'low' && '❌ La aplicación tiene muy poco uso'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basicStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {basicStats.verifiedUsers} verificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basicStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {usageEvaluation.adoptionRate.toFixed(1)}% tasa de adopción
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campos</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basicStats.totalFields}</div>
            <p className="text-xs text-muted-foreground">
              {usageEvaluation.avgFieldsPerUser.toFixed(1)} por usuario activo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corrales</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basicStats.totalPens}</div>
            <p className="text-xs text-muted-foreground">
              {usageEvaluation.avgPensPerField.toFixed(1)} por campo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mediciones</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basicStats.totalMeasurements.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {usageEvaluation.avgMeasurementsPerReport.toFixed(1)} por reporte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reportes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basicStats.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              Reportes generados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Animales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basicStats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Animales registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productividad</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basicStats.totalProductivity}</div>
            <p className="text-xs text-muted-foreground">
              Registros de productividad
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Last Activity */}
      {lastActivity && (
        <Card className="border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Última Actividad Registrada
            </CardTitle>
            <CardDescription>
              Actividad más reciente en la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{lastActivity.activityType}</p>
                    <p className="text-sm text-gray-600">
                      Por: {lastActivity.userEmail}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Hace {lastActivity.timeAgo}
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  Fecha: {new Date(lastActivity.activityDate).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Crecimiento del Último Mes</CardTitle>
          <CardDescription>
            Nuevos registros agregados en los últimos 30 días
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold">{monthlyGrowth.newUsersMonth}</p>
                <p className="text-sm text-gray-600">Nuevos usuarios</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold">{monthlyGrowth.newFieldsMonth}</p>
                <p className="text-sm text-gray-600">Nuevos campos</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-semibold">{monthlyGrowth.newMeasurementsMonth}</p>
                <p className="text-sm text-gray-600">Nuevas mediciones</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-semibold">{monthlyGrowth.newReportsMonth}</p>
                <p className="text-sm text-gray-600">Nuevos reportes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores de Crecimiento</CardTitle>
          <CardDescription>
            Tendencias y patrones de uso de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Crecimiento de usuarios</span>
              <Badge variant={usageEvaluation.hasGrowth ? "default" : "secondary"}>
                {usageEvaluation.hasGrowth ? (
                  <>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Positivo
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Estable
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Actividad regular</span>
              <Badge variant={usageEvaluation.hasRegularActivity ? "default" : "secondary"}>
                {usageEvaluation.hasRegularActivity ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Activa
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Baja
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tasa de adopción</span>
              <Badge variant={usageEvaluation.adoptionRate > 50 ? "default" : usageEvaluation.adoptionRate > 25 ? "secondary" : "destructive"}>
                {usageEvaluation.adoptionRate.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Measurements Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Mediciones por Mes</CardTitle>
            <CardDescription>
              Cantidad de mediciones registradas mensualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="measurementsCount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reports Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Reportes por Mes</CardTitle>
            <CardDescription>
              Cantidad de reportes generados mensualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reportsCount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Users Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios por Mes</CardTitle>
            <CardDescription>
              Nuevos usuarios registrados mensualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usersCount" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Combined Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Mensual Comparada</CardTitle>
          <CardDescription>
            Comparación de mediciones, reportes y usuarios por mes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="measurementsCount" fill="#8884d8" name="Mediciones" />
              <Bar dataKey="reportsCount" fill="#82ca9d" name="Reportes" />
              <Bar dataKey="usersCount" fill="#ffc658" name="Usuarios" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas por Usuario</CardTitle>
          <CardDescription>
            Detalle de actividad por usuario registrado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Campos</TableHead>
                  <TableHead>Corrales</TableHead>
                  <TableHead>Reportes</TableHead>
                  <TableHead>Mediciones</TableHead>
                  <TableHead>Actividad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userStats.map((user) => {
                  const totalActivity = user.fieldsCount + user.pensCount + user.reportsCount + user.measurementsCount;
                  const activityLevel = totalActivity > 50 ? 'high' : totalActivity > 10 ? 'medium' : 'low';
                  
                  return (
                    <TableRow key={user.userId}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.fieldsCount}</TableCell>
                      <TableCell>{user.pensCount}</TableCell>
                      <TableCell>{user.reportsCount}</TableCell>
                      <TableCell>{user.measurementsCount}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={activityLevel === 'high' ? 'default' : activityLevel === 'medium' ? 'secondary' : 'outline'}
                          className={
                            activityLevel === 'high' ? 'bg-green-100 text-green-800' :
                            activityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {activityLevel === 'high' ? 'Alta' : activityLevel === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {userStats.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay datos de usuarios disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        Última actualización: {new Date(analyticsData.generatedAt).toLocaleString('es-ES')}
      </div>
    </div>
  );
}
