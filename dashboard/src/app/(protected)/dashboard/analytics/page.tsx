"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshCw, Users, MapPin, Layers, BarChart3, FileText, Activity,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Minus, UserX,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Line, ComposedChart,
} from 'recharts';

type UsageLevel = 'dormant' | 'declining' | 'low' | 'medium' | 'high';
type UserStatus = 'active' | 'idle' | 'churned' | 'never_activated';

interface BasicStats {
  totalUsers: number; verifiedUsers: number; totalFields: number; totalPens: number;
  totalMeasurements: number; totalReports: number; totalSubjects: number; totalProductivity: number;
}
interface WindowedActivity {
  activeUsers30d: number; activeUsers90d: number; measurements30d: number;
  measurements90d: number; reports30d: number; reports90d: number;
}
interface Engagement {
  totalUsers: number; everMeasured: number; neverMeasured: number; activatedRate: number;
}
interface MonthlyGrowth {
  newUsersMonth: number; newFieldsMonth: number; newMeasurementsMonth: number;
  newReportsMonth: number; prevMeasurements: number; prevUsers: number;
  measurementTrendPct: number | null;
}
interface UsageEvaluation {
  usageLevel: UsageLevel; usageReason: string; daysSinceLastActivity: number | null;
  activationRate: number; retention30d: number; avgFieldsPerActivatedUser: number;
  avgPensPerField: number; avgMeasurementsPerReport: number;
  hasGrowth: boolean; hasRegularActivity: boolean; window: number;
}
interface LastActivity {
  activityType: string; activityDate: string; userEmail: string;
  timeAgo: string; diffDays: number;
}
interface Concentration {
  topUserEmail: string; topUserMeasurements: number;
  totalMeasurements: number; sharePct: number;
}
interface MonthlyData {
  month: string; measurementsCount: number; reportsCount: number;
  usersCount: number; activeUsers: number;
}
interface UserStats {
  userId: string; username: string; email: string; registeredAt: string;
  fieldsCount: number; pensCount: number; reportsCount: number; measurementsCount: number;
  lastMeasurement: string | null; daysSinceLastMeasurement: number | null; status: UserStatus;
}
interface Overview {
  basicStats: BasicStats; monthlyGrowth: MonthlyGrowth; activity: WindowedActivity;
  engagement: Engagement; usageEvaluation: UsageEvaluation;
  lastActivity: LastActivity | null; concentration: Concentration | null;
  generatedAt: string;
}

const USAGE_META: Record<UsageLevel, { label: string; tone: 'crit' | 'warn' | 'ok'; icon: React.ReactNode }> = {
  dormant:   { label: 'Sin uso',        tone: 'crit', icon: <AlertTriangle size={20} /> },
  declining: { label: 'En caída',       tone: 'crit', icon: <TrendingDown size={20} /> },
  low:       { label: 'Uso bajo',       tone: 'warn', icon: <AlertTriangle size={20} /> },
  medium:    { label: 'Uso moderado',   tone: 'warn', icon: <Clock size={20} /> },
  high:      { label: 'Uso alto',       tone: 'ok',   icon: <CheckCircle size={20} /> },
};

const STATUS_META: Record<UserStatus, { label: string; color: string; bg: string }> = {
  active:          { label: 'Activo',          color: 'var(--st-ok-ink)',   bg: 'var(--st-ok-bg)' },
  idle:            { label: 'Inactivo',        color: 'var(--st-warn-ink)', bg: 'var(--st-warn-bg)' },
  churned:         { label: 'Abandonó',        color: 'var(--st-crit-ink)', bg: 'var(--st-crit-bg)' },
  never_activated: { label: 'Nunca usó',       color: 'var(--ink-3)',       bg: 'var(--surface-sunk)' },
};

const TONE_COLOR: Record<'crit' | 'warn' | 'ok', string> = {
  crit: 'var(--st-crit)', warn: 'var(--st-warn)', ok: 'var(--st-ok)',
};

function Kpi({ icon, label, value, unit, foot }: {
  icon: React.ReactNode; label: string; value: React.ReactNode;
  unit?: string; foot?: React.ReactNode;
}) {
  return (
    <div className="rd-kpi">
      <div className="k-top">
        <span className="k-ic">{icon}</span>
        <span className="k-label">{label}</span>
      </div>
      <div className="k-val">{value}{unit && <small>{unit}</small>}</div>
      {foot && <div className="k-foot">{foot}</div>}
    </div>
  );
}

function StatusPill({ status }: { status: UserStatus }) {
  const meta = STATUS_META[status];
  return (
    <span style={{
      fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
      color: meta.color, background: meta.bg, whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  );
}

export default function AnalyticsPage() {
  const { token } = useAuthStore();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const base = process.env.NEXT_PUBLIC_API_URL;

    try {
      const [ovRes, monthRes, usersRes] = await Promise.all([
        fetch(`${base}/analytics/overview`, { headers }),
        fetch(`${base}/analytics/monthly-data`, { headers }),
        fetch(`${base}/analytics/user-stats`, { headers }),
      ]);

      if (!ovRes.ok) throw new Error('No se pudieron cargar las métricas');
      setOverview(await ovRes.json());

      if (monthRes.ok) {
        const raw = await monthRes.json();
        setMonthlyData(
          (raw as MonthlyData[]).map((m) => ({
            ...m,
            month: new Date(m.month).toLocaleDateString('es-AR', {
              month: 'short', year: '2-digit',
            }),
          })),
        );
      }
      if (usersRes.ok) setUserStats(await usersRes.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div className="rd-page">
        <div className="rd-kpis">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rd-skel" style={{ height: 108 }} />
          ))}
        </div>
        <div className="rd-skel" style={{ height: 320, marginTop: 22 }} />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="rd-page">
        <div className="rd-card rd-empty">
          <AlertTriangle />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            {error ?? 'Sin datos'}
          </div>
          <button className="rd-btn" onClick={fetchAll} style={{ marginTop: 12 }}>
            <RefreshCw size={15} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { basicStats, activity, engagement, usageEvaluation, lastActivity,
          concentration, monthlyGrowth } = overview;
  const usage = USAGE_META[usageEvaluation.usageLevel];
  const tone = TONE_COLOR[usage.tone];

  const trend = monthlyGrowth.measurementTrendPct;

  return (
    <div className="rd-page">
      <div className="rd-greet">
        <div>
          <h1>Uso de la aplicación</h1>
          <div className="sub">
            Actividad real medida en ventanas de tiempo. Una cuenta cuenta como
            activa solo si registró mediciones.
          </div>
        </div>
        <button className="rd-btn rd-btn-outline" onClick={fetchAll} style={{ marginLeft: 'auto' }}>
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {/* Veredicto */}
      <div className="rd-card" style={{ borderLeft: `4px solid ${tone}`, marginBottom: 22 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '18px 20px' }}>
          <span style={{ color: tone, flex: 'none', marginTop: 2 }}>{usage.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
              Estado: {usage.label}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 4 }}>
              {usageEvaluation.usageReason}
            </div>
            {lastActivity && (
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 8 }}>
                Última actividad: <strong>{lastActivity.activityType}</strong> hace{' '}
                <strong>{lastActivity.timeAgo}</strong> — {lastActivity.userEmail}{' '}
                ({new Date(lastActivity.activityDate).toLocaleDateString('es-AR')})
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPIs de actividad real */}
      <div className="rd-kpis">
        <Kpi
          icon={<Activity size={16} />}
          label="Usuarios activos (30d)"
          value={activity.activeUsers30d}
          unit={`/ ${engagement.everMeasured}`}
          foot={
            <span style={{ color: activity.activeUsers30d === 0 ? 'var(--st-crit-ink)' : 'var(--ink-2)' }}>
              {activity.activeUsers90d} en los últimos 90 días
            </span>
          }
        />
        <Kpi
          icon={<BarChart3 size={16} />}
          label="Mediciones (30d)"
          value={activity.measurements30d.toLocaleString('es-AR')}
          foot={
            trend === null ? (
              <span style={{ color: 'var(--ink-3)' }}>
                <Minus size={13} style={{ verticalAlign: -2 }} /> sin base de comparación
              </span>
            ) : (
              <span style={{ color: trend >= 0 ? 'var(--st-ok-ink)' : 'var(--st-crit-ink)' }}>
                {trend >= 0 ? <TrendingUp size={13} style={{ verticalAlign: -2 }} />
                            : <TrendingDown size={13} style={{ verticalAlign: -2 }} />}{' '}
                {trend >= 0 ? '+' : ''}{trend.toFixed(0)}% vs. 30d previos
              </span>
            )
          }
        />
        <Kpi
          icon={<Users size={16} />}
          label="Activación"
          value={engagement.activatedRate.toFixed(0)}
          unit="%"
          foot={
            <span style={{ color: 'var(--ink-2)' }}>
              {engagement.everMeasured} de {engagement.totalUsers} midieron alguna vez
            </span>
          }
        />
        <Kpi
          icon={<UserX size={16} />}
          label="Nunca activados"
          value={engagement.neverMeasured}
          foot={
            <span style={{ color: 'var(--ink-2)' }}>
              se registraron y no midieron nunca
            </span>
          }
        />
      </div>

      {/* Concentración */}
      {concentration && concentration.sharePct > 40 && (
        <div className="rd-card" style={{ marginTop: 22, borderLeft: '4px solid var(--st-warn)' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 20px' }}>
            <AlertTriangle size={19} style={{ color: 'var(--st-warn)', flex: 'none', marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' }}>
                Uso concentrado en un solo usuario
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
                <strong>{concentration.topUserEmail}</strong> generó{' '}
                {concentration.topUserMeasurements.toLocaleString('es-AR')} de{' '}
                {concentration.totalMeasurements.toLocaleString('es-AR')} mediciones
                (<strong>{concentration.sharePct.toFixed(0)}%</strong>). Los totales
                acumulados reflejan sobre todo a esta cuenta, no al conjunto.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evolución mensual */}
      <div className="rd-card" style={{ marginTop: 22 }}>
        <div className="rd-cardh">
          <div>
            <div className="eyebrow">Últimos 12 meses</div>
            <h3>Evolución de la actividad</h3>
          </div>
        </div>
        <div style={{ padding: '16px 12px 20px' }}>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--pasture-line)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--ink-3)' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: 'var(--ink-3)' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" allowDecimals={false}
                     tick={{ fontSize: 12, fill: 'var(--ink-3)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12, border: '1px solid var(--pasture-line)',
                  background: 'var(--surface-card)', fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12.5 }} />
              <Bar yAxisId="left" dataKey="measurementsCount" name="Mediciones"
                   fill="var(--pasture-500)" radius={[5, 5, 0, 0]} />
              <Bar yAxisId="left" dataKey="reportsCount" name="Reportes"
                   fill="var(--pasture-300)" radius={[5, 5, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="activeUsers" name="Usuarios activos"
                    stroke="var(--st-warn)" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', padding: '4px 8px 0' }}>
            Los meses sin actividad se muestran en cero — no se omiten.
          </div>
        </div>
      </div>

      {/* Inventario acumulado */}
      <div className="rd-card" style={{ marginTop: 22 }}>
        <div className="rd-cardh">
          <div>
            <div className="eyebrow">Histórico — no indica uso actual</div>
            <h3>Datos acumulados</h3>
          </div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 2, padding: '14px 20px 20px',
        }}>
          {[
            { icon: <Users size={15} />, label: 'Usuarios', value: basicStats.totalUsers, sub: `${basicStats.verifiedUsers} verificados` },
            { icon: <MapPin size={15} />, label: 'Campos', value: basicStats.totalFields, sub: `${usageEvaluation.avgPensPerField.toFixed(1)} corrales c/u` },
            { icon: <Layers size={15} />, label: 'Corrales', value: basicStats.totalPens },
            { icon: <FileText size={15} />, label: 'Reportes', value: basicStats.totalReports, sub: `${usageEvaluation.avgMeasurementsPerReport.toFixed(0)} mediciones c/u` },
            { icon: <BarChart3 size={15} />, label: 'Mediciones', value: basicStats.totalMeasurements.toLocaleString('es-AR') },
            { icon: <Users size={15} />, label: 'Animales', value: basicStats.totalSubjects },
          ].map((s) => (
            <div key={s.label} style={{ padding: '10px 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--ink-2)', fontSize: 12.5, fontWeight: 600 }}>
                <span style={{ color: 'var(--pasture-600)' }}>{s.icon}</span>{s.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginTop: 5 }}>{s.value}</div>
              {s.sub && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{s.sub}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Usuarios */}
      <div className="rd-card" style={{ marginTop: 22 }}>
        <div className="rd-cardh">
          <div>
            <div className="eyebrow">{userStats.length} cuentas</div>
            <h3>Detalle por usuario</h3>
          </div>
        </div>
        <div style={{ padding: '10px 20px 20px', overflowX: 'auto' }}>
          {userStats.length === 0 ? (
            <div className="rd-empty" style={{ padding: '36px 16px' }}>Sin usuarios.</div>
          ) : (
            <div style={{ minWidth: 720 }}>
              <div className="rd-genrow rd-genhead" style={{ gridTemplateColumns: '2fr 1fr 70px 70px 90px 110px' }}>
                <span>Usuario</span><span>Estado</span><span>Campos</span>
                <span>Reportes</span><span>Mediciones</span><span>Última medición</span>
              </div>
              {userStats.map((u) => (
                <div key={u.userId} className="rd-genrow" style={{ gridTemplateColumns: '2fr 1fr 70px 70px 90px 110px' }}>
                  <span className="rd-genrow-main" style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.username || u.email}
                    </span>
                    <span style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                    </span>
                  </span>
                  <span><StatusPill status={u.status} /></span>
                  <span>{u.fieldsCount}</span>
                  <span>{u.reportsCount}</span>
                  <span style={{ fontWeight: u.measurementsCount > 0 ? 600 : 400 }}>
                    {u.measurementsCount.toLocaleString('es-AR')}
                  </span>
                  <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
                    {u.lastMeasurement
                      ? `${new Date(u.lastMeasurement).toLocaleDateString('es-AR')}`
                      : '—'}
                    {u.daysSinceLastMeasurement !== null && (
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)' }}>
                        hace {u.daysSinceLastMeasurement}d
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rd-foot" style={{ marginTop: 18 }}>
        Actualizado: {new Date(overview.generatedAt).toLocaleString('es-AR')}
      </div>
    </div>
  );
}
