"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Map, Layers, BarChart3, FileText, ArrowUpRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import useFieldStore from '@/store/fieldStore';
import penStore from '@/store/penStore';
import variableStore from '@/store/variableStore';
import useReportStore from '@/store/reportStore';

const PROD_LABEL: Record<string, string> = {
  bovine_of_milk: 'Leche',
  bovine_of_meat: 'Carne',
  swine: 'Porcino',
  posture_poultry: 'Aves postura',
  broil_poultry: 'Aves engorde',
};

type SectionKey = 'campos' | 'corrales' | 'variables' | 'reportes';

interface SectionConfig {
  key: SectionKey;
  title: string;
  path: string;
  icon: React.ReactNode;
  items: any[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  columns: string[];
  /** Renders one row's cells, aligned with `columns`. */
  renderRow: (item: any) => React.ReactNode[];
}

function SectionCard({ section }: { section: SectionConfig }) {
  const { title, path, icon, items, loading, onRefresh, columns, renderRow } = section;
  const gridStyle = { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` };

  return (
    <section className="rd-card">
      <div className="rd-cardh">
        <span className="r-ic" style={{
          width: 34, height: 34, borderRadius: 10, background: 'var(--pasture-50)',
          color: 'var(--pasture-600)', display: 'grid', placeItems: 'center', flex: 'none',
        }}>
          {icon}
        </span>
        <div>
          <div className="eyebrow">{items.length} en total</div>
          <h3>{title}</h3>
        </div>
        <div className="h-right">
          <button
            onClick={onRefresh}
            className="rd-iconbtn"
            disabled={loading}
            aria-label={`Actualizar ${title.toLowerCase()}`}
          >
            <RefreshCw size={16} className={loading ? 'rd-spin' : ''} />
          </button>
          <Link href={path} className="rd-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Ver todo <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      <div style={{ padding: '10px 20px 18px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rd-skel" style={{ height: 34 }} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div>
            <div
              className="rd-genrow rd-genhead"
              style={gridStyle}
            >
              {columns.map((c) => <span key={c}>{c}</span>)}
            </div>
            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              {items.slice(0, 50).map((item, idx) => (
                <div key={item.id ?? idx} className="rd-genrow" style={gridStyle}>
                  {renderRow(item).map((cell, i) => (
                    <span key={i} className={i === 0 ? 'rd-genrow-main' : undefined}>{cell}</span>
                  ))}
                </div>
              ))}
            </div>
            {items.length > 50 && (
              <div style={{ paddingTop: 10, fontSize: 12, color: 'var(--ink-3)' }}>
                Mostrando 50 de {items.length}. <Link href={path} className="rd-link">Ver todo</Link>
              </div>
            )}
          </div>
        ) : (
          <div className="rd-empty" style={{ padding: '36px 16px' }}>
            No hay {title.toLowerCase()} todavía.{' '}
            <Link href={path} className="rd-link">Ir a {title}</Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default function GeneralPage() {
  const { user } = useAuthStore();
  const { getFieldsByUser, fieldsByUserId } = useFieldStore();
  const { getPensByUser, pensByUser } = penStore();
  const { getVariablesByUser, variablesByUser } = variableStore();
  const { getReportsByUser, reportsByUser } = useReportStore();

  const [loading, setLoading] = useState({
    fields: true, pens: true, variables: true, reports: true,
  });

  const setSectionLoading = (key: keyof typeof loading, value: boolean) =>
    setLoading((prev) => ({ ...prev, [key]: value }));

  const refreshFields = useCallback(async () => {
    setSectionLoading('fields', true);
    await getFieldsByUser();
    setSectionLoading('fields', false);
  }, [getFieldsByUser]);

  const refreshPens = useCallback(async () => {
    setSectionLoading('pens', true);
    await getPensByUser();
    setSectionLoading('pens', false);
  }, [getPensByUser]);

  const refreshVariables = useCallback(async () => {
    setSectionLoading('variables', true);
    await getVariablesByUser();
    setSectionLoading('variables', false);
  }, [getVariablesByUser]);

  const refreshReports = useCallback(async () => {
    setSectionLoading('reports', true);
    await getReportsByUser();
    setSectionLoading('reports', false);
  }, [getReportsByUser]);

  useEffect(() => {
    // Load every section in parallel — they don't depend on each other.
    void Promise.all([refreshFields(), refreshPens(), refreshVariables(), refreshReports()]);
  }, [refreshFields, refreshPens, refreshVariables, refreshReports]);

  const displayName = user?.username || user?.name || user?.email?.split('@')[0] || 'Usuario';

  const sections: SectionConfig[] = [
    {
      key: 'campos',
      title: 'Campos',
      path: '/dashboard/fields',
      icon: <Map size={17} />,
      items: fieldsByUserId || [],
      loading: loading.fields,
      onRefresh: refreshFields,
      columns: ['Nombre', 'Producción', 'Animales'],
      renderRow: (f) => [
        f.name,
        f.production_type ? (PROD_LABEL[f.production_type] ?? f.production_type) : '—',
        f.number_of_animals ? Number(f.number_of_animals).toLocaleString('es-AR') : '—',
      ],
    },
    {
      key: 'corrales',
      title: 'Corrales',
      path: '/dashboard/pens',
      icon: <Layers size={17} />,
      items: pensByUser || [],
      loading: loading.pens,
      onRefresh: refreshPens,
      columns: ['Nombre', 'Campo'],
      renderRow: (p) => [p.name, p.fieldName || '—'],
    },
    {
      key: 'variables',
      title: 'Variables',
      path: '/dashboard/variables',
      icon: <BarChart3 size={17} />,
      items: variablesByUser || [],
      loading: loading.variables,
      onRefresh: refreshVariables,
      columns: ['Nombre', 'Tipo', 'Rango óptimo'],
      renderRow: (v) => {
        const inner = v.defaultValue?.value ?? {};
        const optimal = Array.isArray(inner.optimal_values) && inner.optimal_values.length
          ? inner.optimal_values.join(', ')
          : inner.optimal_min != null || inner.optimal_max != null
            ? `${inner.optimal_min ?? '—'}–${inner.optimal_max ?? '—'}`
            : '—';
        return [
          v.name,
          v.type === 'NUMBER' ? 'Numérica' : 'Categórica',
          optimal,
        ];
      },
    },
    {
      key: 'reportes',
      title: 'Reportes',
      path: '/dashboard/reports',
      icon: <FileText size={17} />,
      items: reportsByUser || [],
      loading: loading.reports,
      onRefresh: refreshReports,
      columns: ['Reporte', 'Campo', 'Fecha'],
      renderRow: (r) => [
        r.name || `#${r.id}`,
        r.fieldName || '—',
        r.created_at ? new Date(r.created_at).toLocaleDateString('es-AR') : '—',
      ],
    },
  ];

  return (
    <div className="rd-page">
      <div className="rd-greet">
        <div>
          <h1>Bienvenido, {displayName} 🌿</h1>
          <div className="sub">
            Todo lo que tenés cargado, de un vistazo. Para el análisis de bienestar, andá a{' '}
            <Link href="/dashboard" className="rd-link">Resumen</Link>.
          </div>
        </div>
      </div>

      <div className="rd-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        {sections.map((section) => (
          <SectionCard key={section.key} section={section} />
        ))}
      </div>
    </div>
  );
}
