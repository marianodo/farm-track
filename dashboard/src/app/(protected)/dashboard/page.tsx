"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  ChevronDown, Leaf, TrendingUp, FileText, AlertTriangle,
  Activity, Warehouse, RefreshCw, ArrowUpRight, Boxes,
} from "lucide-react";
import useFieldStore from "@/store/fieldStore";
import { useAuthStore } from "@/store/authStore";
import { useChatbotStore } from "@/store/chatbotStore";
import { Chatbot } from "@/components/Chatbot/Chatbot";

/* ─────────────────────────── helpers ─────────────────────────── */

type Measurement = {
  variable: string;
  value: string | number;
  measureDate: string;
  pen: string;
  correct: number | string;
  type_of_object: string;
  report_id: string | number;
  optimal_values?: string[];
  optimo_min?: number;
  optimo_max?: number;
  min?: number;
  max?: number;
};

const isCorrect = (m: Measurement) =>
  String(m.correct) === "1" || String(m.correct) === "true";

type Status = "ok" | "warn" | "crit";
const statusOf = (pct: number): Status => (pct >= 80 ? "ok" : pct >= 60 ? "warn" : "crit");
const statusLabel: Record<Status, string> = { ok: "óptimo", warn: "atención", crit: "crítico" };

const PROD_LABEL: Record<string, string> = {
  bovine_of_milk: "Leche",
  bovine_of_meat: "Carne",
  swine: "Porcino",
  posture_poultry: "Aves postura",
  broil_poultry: "Aves engorde",
};

const normalizeData = (data: any[]): Measurement[] =>
  (data || []).map((m) => ({
    variable: m.variable,
    value: m.measured_value,
    measureDate: m.measure_date,
    pen: m.pen_name,
    correct: m.correct,
    type_of_object: m.type_of_object,
    report_id: m.report_id,
    optimal_values: Array.isArray(m.optimal_values)
      ? m.optimal_values
      : typeof m.optimal_values === "string"
        ? m.optimal_values.split(",").map((s: string) => s.trim()).filter(Boolean)
        : undefined,
    optimo_min: m.optimo_min !== undefined ? Number(m.optimo_min) : undefined,
    optimo_max: m.optimo_max !== undefined ? Number(m.optimo_max) : undefined,
    min: m.min !== undefined && m.min !== null ? Number(m.min) : undefined,
    max: m.max !== undefined && m.max !== null ? Number(m.max) : undefined,
  }));

const greetingByHour = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
};

const fmt = (n: number) => n.toLocaleString("es-AR");

/* ─────────────────────────── page ─────────────────────────── */

export default function DashboardResumen() {
  const {
    getFieldsByUser, fieldsByUserId,
    getCategoricalMeasurementsByFieldId, getNumericalMeasurementsByFieldId,
  } = useFieldStore();
  const { user } = useAuthStore();

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const fields = useMemo(() => fieldsByUserId ?? [], [fieldsByUserId]);
  const selectedField = useMemo(
    () => fields.find((f) => f.id === selectedFieldId) ?? null,
    [fields, selectedFieldId]
  );

  // Load fields on mount
  useEffect(() => { getFieldsByUser(); }, [getFieldsByUser]);

  // Auto-select first field once loaded
  useEffect(() => {
    if (!selectedFieldId && fields.length > 0) setSelectedFieldId(fields[0].id);
  }, [fields, selectedFieldId]);

  const loadMeasurements = useCallback(async (fieldId: string) => {
    setLoading(true);
    useChatbotStore.getState().setSelectedFieldId(fieldId);
    try {
      const [cat, num] = await Promise.all([
        getCategoricalMeasurementsByFieldId(fieldId),
        getNumericalMeasurementsByFieldId(fieldId),
      ]);
      const combined = [...normalizeData(cat), ...normalizeData(num)];
      combined.sort((a, b) => new Date(b.measureDate).getTime() - new Date(a.measureDate).getTime());
      setMeasurements(combined);
    } catch (e) {
      console.error("Error fetching measurements:", e);
      setMeasurements([]);
    } finally {
      setLoading(false);
    }
  }, [getCategoricalMeasurementsByFieldId, getNumericalMeasurementsByFieldId]);

  useEffect(() => {
    if (selectedFieldId) loadMeasurements(selectedFieldId);
  }, [selectedFieldId, loadMeasurements]);

  /* ── derived data ── */

  // reports chronological (by report_id asc), with dates
  const reports = useMemo(() => {
    const map = new Map<string, { id: string; date: string; count: number; pens: Set<string> }>();
    for (const m of measurements) {
      const id = String(m.report_id);
      if (!map.has(id)) map.set(id, { id, date: m.measureDate, count: 0, pens: new Set() });
      const r = map.get(id)!;
      r.count++;
      if (m.pen) r.pens.add(m.pen);
    }
    return Array.from(map.values()).sort((a, b) => Number(a.id) - Number(b.id));
  }, [measurements]);

  const latestReportId = reports.length ? reports[reports.length - 1].id : null;
  const latest = useMemo(
    () => measurements.filter((m) => String(m.report_id) === String(latestReportId)),
    [measurements, latestReportId]
  );

  const pct = (arr: Measurement[]) =>
    arr.length ? Math.round((arr.filter(isCorrect).length / arr.length) * 100) : 0;

  const welfare = pct(latest);
  const welfareStatus = statusOf(welfare);

  // per-variable score (latest report), worst first
  const variableScores = useMemo(() => {
    const map = new Map<string, Measurement[]>();
    for (const m of latest) {
      if (!m.variable) continue;
      if (!map.has(m.variable)) map.set(m.variable, []);
      map.get(m.variable)!.push(m);
    }
    return Array.from(map.entries())
      .map(([variable, arr]) => {
        const p = pct(arr);
        return { variable, p, status: statusOf(p), n: arr.length, pens: new Set(arr.map((x) => x.pen)).size };
      })
      .sort((a, b) => a.p - b.p);
  }, [latest]);

  // alerts: incorrect measurements in latest report, grouped by variable+pen
  const alerts = useMemo(() => {
    const bad = latest.filter((m) => !isCorrect(m));
    const map = new Map<string, { variable: string; pen: string; sample: Measurement; n: number }>();
    for (const m of bad) {
      const key = `${m.variable}__${m.pen}`;
      if (!map.has(key)) map.set(key, { variable: m.variable, pen: m.pen, sample: m, n: 0 });
      map.get(key)!.n++;
    }
    const varStatus = new Map(variableScores.map((v) => [v.variable, v.status]));
    return Array.from(map.values())
      .map((a) => ({ ...a, sev: (varStatus.get(a.variable) === "crit" ? "crit" : "warn") as "crit" | "warn" }))
      .sort((a, b) => (a.sev === b.sev ? b.n - a.n : a.sev === "crit" ? -1 : 1));
  }, [latest, variableScores]);

  // trend: % correct per report over time (last 9)
  const trend = useMemo(
    () =>
      reports.slice(-9).map((r) => ({
        label: new Date(r.date).toLocaleDateString("es-AR", { month: "short" }),
        pct: pct(measurements.filter((m) => String(m.report_id) === r.id)),
      })),
    [reports, measurements]
  );

  // production breakdown from all fields
  const production = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of fields) {
      const key = f.production_type || "otro";
      map.set(key, (map.get(key) || 0) + 1);
    }
    const total = fields.length || 1;
    return Array.from(map.entries())
      .map(([type, count]) => ({ label: PROD_LABEL[type] || "Otros", count, share: count / total }))
      .sort((a, b) => b.count - a.count);
  }, [fields]);

  const animals = latest.filter((m) => m.type_of_object === "Animal").length;
  const installations = latest.filter((m) => m.type_of_object === "Installation").length;

  const lastEval = reports.length
    ? new Date(reports[reports.length - 1].date).toLocaleDateString("es-AR", { day: "numeric", month: "long" })
    : "—";

  /* ── trend chart geometry ── */
  const trendSvg = useMemo(() => {
    const W = 520, H = 150, PAD = 10, LO = 40, HI = 100;
    if (trend.length < 2) return null;
    const x = (i: number) => PAD + (i * (W - 2 * PAD)) / (trend.length - 1);
    const y = (v: number) => H - ((Math.min(HI, Math.max(LO, v)) - LO) / (HI - LO)) * (H - 8);
    let line = "";
    const dots = trend.map((t, i) => {
      line += (i ? "L" : "M") + x(i).toFixed(1) + " " + y(t.pct).toFixed(1) + " ";
      return { cx: x(i).toFixed(1), cy: y(t.pct).toFixed(1), last: i === trend.length - 1, ...t };
    });
    const area = `${line}L${x(trend.length - 1).toFixed(1)} ${H} L${x(0).toFixed(1)} ${H} Z`;
    const bandY = y(80);
    return { line: line.trim(), area, dots, bandY, W, H };
  }, [trend]);

  const displayName = user?.username || user?.name || "";
  const gaugeColor = `var(--st-${welfareStatus})`;
  const C = 490; // 2πr, r=78

  /* ─────────────────────────── render ─────────────────────────── */

  return (
    <div className="rd-page">
      {/* topbar */}
      <div className="rd-topbar">
        <div className="rd-fieldpick">
          <button className="rd-fieldpick-btn" onClick={() => setMenuOpen((o) => !o)}>
            <span className="dot" />
            {selectedField?.name || (fields.length ? "Elegí un campo" : "Sin campos")}
            <ChevronDown className="chev" size={15} />
          </button>
          {menuOpen && (
            <div className="rd-menu" onMouseLeave={() => setMenuOpen(false)}>
              {fields.map((f) => (
                <button
                  key={f.id}
                  className={f.id === selectedFieldId ? "sel" : ""}
                  onClick={() => { setSelectedFieldId(f.id); setMenuOpen(false); }}
                >
                  <Leaf size={14} />
                  {f.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="rd-top-right">
          <button
            className="rd-iconbtn"
            aria-label="Actualizar"
            onClick={() => selectedFieldId && loadMeasurements(selectedFieldId)}
          >
            <RefreshCw size={17} className={loading ? "rd-spin" : ""} />
          </button>
        </div>
      </div>

      {/* greeting */}
      <div className="rd-greet">
        <div>
          <h1>{greetingByHour()}{displayName ? `, ${displayName}` : ""} 🌿</h1>
          <div className="sub">
            {selectedField ? (
              <>
                <b>{selectedField.name}</b>
                {selectedField.production_type ? ` · ${PROD_LABEL[selectedField.production_type] || selectedField.production_type}` : ""}
                {selectedField.breed ? ` · ${selectedField.breed}` : ""}
                {" · última evaluación "}<b>{lastEval}</b>
              </>
            ) : "Elegí un campo para ver su bienestar"}
          </div>
        </div>
        <Link href="/dashboard/analisis" className="rd-chip ok" style={{ padding: "9px 14px", fontSize: 13 }}>
          Análisis detallado <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* KPIs */}
      <div className="rd-kpis">
        <KpiCard icon={<TrendingUp size={16} />} label="Mediciones" value={fmt(measurements.length)}
          foot={<span>{reports.length} reporte{reports.length === 1 ? "" : "s"} en total</span>} loading={loading} />
        <KpiCard icon={<FileText size={16} />} label="Reportes" value={fmt(reports.length)}
          foot={<span>{selectedField?.number_of_animals ? `${fmt(selectedField.number_of_animals)} animales` : " "}</span>} loading={loading} />
        <KpiCard icon={<Leaf size={16} />} label="Bienestar (último reporte)" value={<>{welfare}<small>/100</small></>}
          foot={<span className={`rd-chip ${welfareStatus}`}>{welfareStatus === "ok" ? <Leaf size={13} /> : <AlertTriangle size={13} />}{statusLabel[welfareStatus]}</span>} loading={loading} />
        <KpiCard icon={<AlertTriangle size={16} />} label="Alertas activas" value={fmt(alerts.length)}
          foot={<>
            <span className="rd-chip crit dot">{alerts.filter((a) => a.sev === "crit").length} críticas</span>
            <span className="rd-chip warn dot">{alerts.filter((a) => a.sev === "warn").length} atención</span>
          </>} loading={loading} />
      </div>

      {/* main grid */}
      <div className="rd-grid">
        <div className="rd-col">
          {/* welfare */}
          <section className="rd-card">
            <div className="rd-cardh">
              <div><div className="eyebrow">Índice de bienestar</div><h3>Bienestar del campo</h3></div>
              <div className="h-right rd-num" style={{ color: "var(--ink-2)", fontSize: 13, fontWeight: 600 }}>
                <Activity size={14} style={{ verticalAlign: "-2px" }} /> {animals} · <Warehouse size={14} style={{ verticalAlign: "-2px" }} /> {installations}
              </div>
            </div>
            <div className="rd-welfare">
              <div className="rd-gauge">
                <svg width="190" height="190" viewBox="0 0 190 190">
                  <circle cx="95" cy="95" r="78" fill="none" stroke="var(--surface-sunk)" strokeWidth="15" />
                  <circle cx="95" cy="95" r="78" fill="none" stroke={gaugeColor} strokeWidth="15" strokeLinecap="round"
                    strokeDasharray={C} strokeDashoffset={C * (1 - welfare / 100)} transform="rotate(-90 95 95)" />
                </svg>
                <div className="center">
                  <div className="g-num rd-num">{welfare}<small>/100</small></div>
                  <span className={`rd-chip ${welfareStatus}`}>
                    {welfareStatus === "ok" ? <Leaf size={13} /> : <AlertTriangle size={13} />}{statusLabel[welfareStatus]}
                  </span>
                  <div className="g-cap">Rango óptimo ≥ 80</div>
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="rd-legend">
                  <span className="lg"><span className="swatch" />Índice por reporte</span>
                  <span className="lg"><span className="band" />Zona óptima</span>
                </div>
                {trendSvg ? (
                  <svg width="100%" height="150" viewBox={`0 0 ${trendSvg.W} ${trendSvg.H}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
                    <rect x="0" y="0" width={trendSvg.W} height={trendSvg.bandY} fill="var(--st-ok-bg)" />
                    <line x1="0" y1={trendSvg.bandY} x2={trendSvg.W} y2={trendSvg.bandY} stroke="color-mix(in srgb, var(--st-ok) 40%, transparent)" strokeWidth="1" strokeDasharray="4 4" />
                    <defs>
                      <linearGradient id="rdArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--pasture-500)" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="var(--pasture-500)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={trendSvg.area} fill="url(#rdArea)" />
                    <path d={trendSvg.line} fill="none" stroke="var(--pasture-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {trendSvg.dots.map((d, i) => (
                      <circle key={i} cx={d.cx} cy={d.cy} r={d.last ? 5 : 3.5} fill="var(--surface-card)" stroke="var(--pasture-600)" strokeWidth="2.5">
                        <title>{d.pct}/100 · {d.label}</title>
                      </circle>
                    ))}
                  </svg>
                ) : (
                  <div className="rd-empty" style={{ padding: "30px 10px" }}>Se necesita más de un reporte para ver la tendencia.</div>
                )}
                <div className="rd-legend" style={{ justifyContent: "space-between", marginTop: 8, color: "var(--ink-3)", fontSize: 11.5 }}>
                  {trend.map((t, i) => <span key={i}>{t.label}</span>)}
                </div>
              </div>
            </div>
          </section>

          {/* variable scores */}
          <section className="rd-card">
            <div className="rd-cardh">
              <div><div className="eyebrow">Ordenado por lo que necesita atención</div><h3>Score por variable</h3></div>
              <Link href="/dashboard/variables" className="rd-link">Ver todas ({variableScores.length})</Link>
            </div>
            <div className="rd-vbars">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <div key={i} className="rd-skel" style={{ height: 32, margin: "8px 0" }} />)
              ) : variableScores.length ? (
                variableScores.slice(0, 8).map((v) => (
                  <div className="rd-vbar" key={v.variable}>
                    <div className="vname">{v.variable}<small>{v.pens} corral{v.pens === 1 ? "" : "es"} · {v.n} med.</small></div>
                    <div className="rd-track"><div className={`rd-fill ${v.status}`} style={{ width: `${v.p}%` }} /></div>
                    <div className="vval"><span className="rd-num">{v.p}%</span><small style={{ color: `var(--st-${v.status}-ink)` }}>{statusLabel[v.status]}</small></div>
                  </div>
                ))
              ) : (
                <div className="rd-empty">Sin mediciones para este campo todavía.</div>
              )}
            </div>
          </section>
        </div>

        <div className="rd-col">
          {/* alerts */}
          <section className="rd-card">
            <div className="rd-cardh"><h3>Alertas activas</h3><div className="h-right"><span className="rd-chip crit dot">{alerts.length}</span></div></div>
            <div className="rd-alerts">
              {alerts.length ? alerts.slice(0, 6).map((a, i) => (
                <div className="rd-alert" key={i}>
                  <div className={`sev ${a.sev}`} />
                  <div className="a-body">
                    <div className="a-top">
                      <span className="a-name">{a.variable}</span>
                      <span className="a-val"><span className={a.sev === "crit" ? "bad" : ""}>{String(a.sample.value)}</span></span>
                    </div>
                    <div className="a-meta">
                      {a.pen ? `${a.pen} · ` : ""}
                      {a.sample.optimal_values?.length
                        ? `óptimo: ${a.sample.optimal_values.join(", ")}`
                        : a.sample.optimo_min !== undefined
                          ? `óptimo ${a.sample.optimo_min}–${a.sample.optimo_max}`
                          : "fuera de rango"}
                      {a.n > 1 ? ` · ${a.n} casos` : ""}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="rd-empty" style={{ padding: "34px 16px" }}>
                  <Leaf /><div>Sin alertas. Todo dentro de rango 🌿</div>
                </div>
              )}
            </div>
          </section>

          {/* recent reports */}
          <section className="rd-card">
            <div className="rd-cardh"><h3>Reportes recientes</h3><Link href="/dashboard/reports" className="rd-link">Todos</Link></div>
            <div className="rd-rows">
              {reports.length ? [...reports].reverse().slice(0, 4).map((r) => (
                <div className="rd-row" key={r.id}>
                  <span className="r-ic"><FileText size={17} /></span>
                  <div>
                    <div className="r-name">Reporte #{r.id}</div>
                    <div className="r-meta">{new Date(r.date).toLocaleDateString("es-AR")} · {r.pens.size} corral{r.pens.size === 1 ? "" : "es"}</div>
                  </div>
                  <div className="r-right"><div className="r-count rd-num">{fmt(r.count)} <small>med.</small></div></div>
                </div>
              )) : <div className="rd-empty" style={{ padding: "24px 16px" }}>Sin reportes.</div>}
            </div>
          </section>

          {/* production breakdown */}
          <section className="rd-card">
            <div className="rd-cardh"><div><h3>Tus campos por producción</h3></div><div className="h-right rd-num" style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 600 }}>{fields.length} campos</div></div>
            <div className="rd-prod">
              {production.length ? production.map((p, i) => {
                const shades = ["var(--pasture-600)", "var(--pasture-500)", "var(--pasture-400)", "var(--pasture-300)", "var(--pasture-100)"];
                return (
                  <div className="rd-prodrow" key={p.label}>
                    <span className="p-name">{p.label}</span>
                    <div className="rd-ptrack"><div className="rd-pfill" style={{ width: `${Math.max(6, p.share * 100)}%`, background: shades[Math.min(i, shades.length - 1)] }} /></div>
                    <span className="p-val rd-num">{p.count}</span>
                  </div>
                );
              }) : <div className="rd-empty" style={{ padding: "20px 8px" }}><Boxes /><div>Sin campos.</div></div>}
            </div>
          </section>
        </div>
      </div>

      <div className="rd-foot">Bienestar calculado sobre el último reporte · mediciones dentro del rango óptimo definido por variable</div>

      <Chatbot />
    </div>
  );
}

/* ─────────────────────────── KPI card ─────────────────────────── */

function KpiCard({ icon, label, value, foot, loading }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; foot: React.ReactNode; loading?: boolean;
}) {
  return (
    <div className="rd-kpi">
      <div className="k-top"><span className="k-ic">{icon}</span><span className="k-label">{label}</span></div>
      {loading ? <div className="rd-skel" style={{ height: 30, width: "60%" }} /> : <div className="k-val rd-num">{value}</div>}
      <div className="k-foot">{foot}</div>
    </div>
  );
}
