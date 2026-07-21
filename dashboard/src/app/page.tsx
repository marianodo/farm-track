"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, BarChart3, Bell, Check, ClipboardList,
  LayoutGrid, LineChart as LineChartIcon, MapPin, Sliders,
} from 'lucide-react';
import {
  Bar, BarChart as RechartBarChart, CartesianGrid, Cell, Legend, Line,
  LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/contexts/LanguageContext';
import Contact from '@/components/sections/Contact';
import CallToAction from '@/components/sections/CallToAction';

/* ── Datos de muestra (los mismos que ya se mostraban) ── */

const fecalScoreDistribucion = [
  { valor: 1, cantidad: 0 },
  { valor: 2, cantidad: 2 },
  { valor: 3, cantidad: 13 },
  { valor: 4, cantidad: 2 },
  { valor: 5, cantidad: 0 },
];

const fecalScoreEvolucion = [
  { fecha: '21/3/2025', valor: 2.2 },
  { fecha: '24/4/2025', valor: 2.4 },
  { fecha: '30/5/2025', valor: 3.0 },
];

const correctosPorReporte = [
  { reporte: '22/4 (1)', porcentaje: 80 },
  { reporte: '22/4 (2)', porcentaje: 77 },
  { reporte: '29/4 (1)', porcentaje: 80 },
  { reporte: '29/4 (2)', porcentaje: 86 },
  { reporte: '29/4 (3)', porcentaje: 79 },
];

const tendenciaCorralData = [
  { fecha: '21/3', corral1: 2.8, corral2: 2.5, corral3: 2.6, corral4: 2.6, corralTanque: 2.4 },
  { fecha: '24/4', corral1: 2.5, corral2: 2.2, corral3: 2.7, corral4: 3.0, corralTanque: 2.2 },
  { fecha: '30/5', corral1: 2.2, corral2: 2.8, corral3: 2.9, corral4: 2.8, corralTanque: 2.9 },
];

/* Serie de corrales: verdes de la paleta + heno como acento. */
const CORRAL_SERIES = [
  { key: 'corral1', label: 'Corral 1', color: '#486732' },
  { key: 'corral2', label: 'Corral 2', color: '#7fa25e' },
  { key: 'corral3', label: 'Corral 3', color: '#2b4220' },
  { key: 'corral4', label: 'Corral 4', color: '#a8c288' },
  { key: 'corralTanque', label: 'Tanque', color: '#c99a3b' },
];

/* Ficha del hero: la banda verde es el rango óptimo. */
const FICHA_ROWS = [
  { name: 'Condición corporal', value: '3.2', unit: '/ 5', pos: 62, ok: [45, 75] as const },
  { name: 'Score fecal', value: '2.6', unit: '/ 5', pos: 40, ok: [45, 75] as const },
  { name: 'Locomoción', value: '1.4', unit: '/ 5', pos: 22, ok: [10, 45] as const },
  { name: 'Llenado ruminal', value: '3.8', unit: '/ 5', pos: 70, ok: [50, 85] as const },
];

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid var(--mk-line)',
  background: '#fff',
  fontSize: 13,
  boxShadow: '0 8px 24px -12px rgba(31,47,22,.3)',
} as const;

const AXIS = { fontSize: 12, fill: 'var(--mk-ink-3)' } as const;

function Dial({ pct, label, ratio }: { pct: number; label: string; ratio: string }) {
  const r = 62;
  const circ = 2 * Math.PI * r;
  const tone =
    pct >= 80 ? 'var(--st-ok)' : pct >= 60 ? 'var(--st-warn)' : 'var(--st-crit)';

  return (
    <div className="mk-score">
      <div className="mk-score-t">{label}</div>
      <div className="mk-dial">
        <svg viewBox="0 0 150 150" width="150" height="150">
          <circle
            cx="75" cy="75" r={r} fill="none"
            stroke="var(--surface-sunk)" strokeWidth="13"
          />
          <circle
            cx="75" cy="75" r={r} fill="none"
            stroke={tone} strokeWidth="13" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * circ} ${circ}`}
            transform="rotate(-90 75 75)"
          />
        </svg>
        <div className="mk-dial-c">
          <div>
            <div className="mk-dial-pct mk-num">{pct}%</div>
            <div className="mk-dial-sub mk-num">{ratio}</div>
          </div>
        </div>
      </div>
      <div className="mk-score-f">
        <strong className="mk-num">{ratio}</strong> dentro del rango óptimo
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard/general');
    }
  }, [isAuthenticated, router]);

  // El header es transparente sobre el hero y sólido una vez que se scrollea.
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    { icon: <MapPin size={19} />, title: t('features.fields.title'), desc: t('features.fields.desc') },
    { icon: <LayoutGrid size={19} />, title: t('features.pens.title'), desc: t('features.pens.desc') },
    { icon: <Sliders size={19} />, title: t('features.variables.title'), desc: t('features.variables.desc') },
    { icon: <ClipboardList size={19} />, title: t('features.reports.title'), desc: t('features.reports.desc') },
    { icon: <LineChartIcon size={19} />, title: t('features.trends.title'), desc: t('features.trends.desc') },
    { icon: <Bell size={19} />, title: t('features.alerts.title'), desc: t('features.alerts.desc') },
  ];

  return (
    <div className="mk">
      {/* ── Header ── */}
      <header className="mk-header" data-stuck={stuck}>
        <div className="mk-headin">
          <Link href="/" className="mk-logo">
            <span className="mk-logo-mark">M</span>
            <span className="mk-logo-name">BD Metrics</span>
          </Link>

          <nav className="mk-nav">
            <a href="#features">{t('nav.features')}</a>
            <a href="#analytics">{t('nav.analytics')}</a>
            <a href="#contact">{t('footer.contact')}</a>
          </nav>

          <div className="mk-headright">
            <div className="mk-lang">
              <button onClick={() => setLanguage('es')} data-on={language === 'es'}>ES</button>
              <button onClick={() => setLanguage('en')} data-on={language === 'en'}>EN</button>
            </div>
            <Link href="/login" className="mk-login">
              {t('nav.login')}
            </Link>
            <Link href="/register" className="mk-btn mk-btn-primary" style={{ padding: '9px 18px' }}>
              {t('nav.register')}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mk-hero">
        <div className="mk-heroin">
          <div>
            <div className="mk-eyebrow">Bienestar animal · Ganadería</div>
            <h1 className="mk-h1">{t('hero.title')}</h1>
            <p className="mk-lede">{t('hero.subtitle')}</p>

            <div className="mk-hero-actions">
              <Link href="/register" className="mk-btn mk-btn-hay">
                {t('hero.cta.start')} <ArrowRight size={16} />
              </Link>
              <a href="#features" className="mk-btn mk-btn-onnight">
                {t('hero.cta.learn')}
              </a>
            </div>

            <div className="mk-hero-trust">
              <div>
                <div className="mk-trust-n mk-num">6.285</div>
                <div className="mk-trust-l">Mediciones</div>
              </div>
              <div>
                <div className="mk-trust-n mk-num">148</div>
                <div className="mk-trust-l">Corrales</div>
              </div>
              <div>
                <div className="mk-trust-n mk-num">76</div>
                <div className="mk-trust-l">Reportes</div>
              </div>
            </div>
          </div>

          {/* La ficha de medición: el objeto real del producto */}
          <div className="mk-ficha">
            <div className="mk-ficha-h">
              <span className="mk-ficha-t">Corral 4 · Vacas en ordeñe</span>
              <span className="mk-ficha-d mk-num">30/5/2025</span>
            </div>
            <div className="mk-ficha-b">
              {FICHA_ROWS.map((r) => {
                const inRange = r.pos >= r.ok[0] && r.pos <= r.ok[1];
                return (
                  <div className="mk-mrow" key={r.name}>
                    <div className="mk-mrow-top">
                      <span className="mk-mrow-name">{r.name}</span>
                      <span className="mk-mrow-val mk-num">
                        {r.value} <small>{r.unit}</small>
                      </span>
                    </div>
                    <div className="mk-scale">
                      <span
                        className="mk-scale-ok"
                        style={{ left: `${r.ok[0]}%`, right: `${100 - r.ok[1]}%` }}
                      />
                      <span
                        className="mk-scale-dot"
                        data-s={inRange ? 'ok' : 'warn'}
                        style={{ left: `${r.pos}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mk-ficha-f">
              <Bell size={15} />
              Score fecal por debajo del óptimo en 2 corrales
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mk-sec" id="features">
        <div className="mk-wrap">
          <div className="mk-sech">
            <div className="mk-eyebrow">{t('nav.features')}</div>
            <h2 className="mk-h2">{t('features.title')}</h2>
            <p className="mk-lede">{t('features.subtitle')}</p>
          </div>

          <div className="mk-feats">
            {features.map((f) => (
              <article className="mk-feat" key={f.title}>
                <div className="mk-feat-ic">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scorecards ── */}
      <section className="mk-sec mk-sec-alt">
        <div className="mk-wrap">
          <div className="mk-sech">
            <div className="mk-eyebrow">Índice de bienestar</div>
            <h2 className="mk-h2">{t('health.title')}</h2>
            <p className="mk-lede">{t('health.subtitle')}</p>
          </div>

          <div className="mk-scores">
            <Dial pct={85} label={t('health.field.title')} ratio="132/155" />
            <Dial pct={96} label={t('health.animals.title')} ratio="109/113" />
            <Dial pct={55} label={t('health.facilities.title')} ratio="23/42" />
          </div>
        </div>
      </section>

      {/* ── Analytics ── */}
      <section className="mk-sec" id="analytics">
        <div className="mk-wrap">
          <div className="mk-sech">
            <div className="mk-eyebrow">{t('nav.analytics')}</div>
            <h2 className="mk-h2">{t('analytics.title')}</h2>
            <p className="mk-lede">{t('analytics.subtitle')}</p>
          </div>

          <div className="mk-chartgrid">
            <div className="mk-chart">
              <h3>{t('analytics.correctPercent.title')}</h3>
              <p className="cap">
                Porcentaje de mediciones dentro del rango óptimo, por reporte.
              </p>
              <div style={{ height: 268 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBarChart data={correctosPorReporte} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mk-line)" vertical={false} />
                    <XAxis dataKey="reporte" tick={AXIS} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={AXIS} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(v) => [`${v}%`, t('analytics.correctPercent.tooltip')]}
                      cursor={{ fill: 'var(--surface-sunk)' }}
                    />
                    <Bar dataKey="porcentaje" fill="var(--pasture-600)" radius={[6, 6, 0, 0]} maxBarSize={46} />
                  </RechartBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mk-chart">
              <h3>{t('analytics.fecalScore.title')}</h3>
              <p className="cap">{t('analytics.fecalScore.subtitle')}</p>
              <div style={{ height: 268 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBarChart data={fecalScoreDistribucion} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mk-line)" vertical={false} />
                    <XAxis dataKey="valor" tick={AXIS} tickLine={false} axisLine={false} />
                    <YAxis tick={AXIS} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(v) => [`${v} mediciones`, 'Cantidad']}
                      cursor={{ fill: 'var(--surface-sunk)' }}
                    />
                    <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} maxBarSize={54}>
                      {fecalScoreDistribucion.map((e) => (
                        <Cell
                          key={e.valor}
                          fill={e.valor === 3 ? 'var(--st-ok)' : 'var(--pasture-300)'}
                        />
                      ))}
                    </Bar>
                  </RechartBarChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  display: 'flex', gap: 18, marginTop: 12, paddingTop: 12,
                  borderTop: '1px solid var(--mk-line)', fontSize: 13,
                  color: 'var(--mk-ink-2)',
                }}
              >
                <span>Óptimo: <strong className="mk-num">3</strong></span>
                <span>Promedio: <strong className="mk-num">2,59</strong></span>
                <span style={{ marginLeft: 'auto', color: 'var(--st-ok-ink)', fontWeight: 600 }}>
                  <Check size={14} style={{ verticalAlign: -2 }} /> 88% correctas (15/17)
                </span>
              </div>
            </div>
          </div>

          {/* Tendencia por corral */}
          <div className="mk-chart" style={{ marginTop: 20 }}>
            <h3>{t('trend.title')}</h3>
            <p className="cap">{t('trend.subtitle')}</p>
            <div style={{ height: 330 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tendenciaCorralData} margin={{ top: 6, right: 12, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--mk-line)" vertical={false} />
                  <XAxis dataKey="fecha" tick={AXIS} tickLine={false} axisLine={false} />
                  <YAxis domain={[2.0, 3.4]} tick={AXIS} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12.5, paddingTop: 8 }} />
                  {CORRAL_SERIES.map((s) => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2.2}
                      dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                      activeDot={{ r: 5.5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mk-sec" style={{ paddingTop: 0 }}>
        <div className="mk-wrap">
          <div className="mk-cta">
            <h2 className="mk-h2">{t('cta.title')}</h2>
            <p>{t('cta.subtitle')}</p>
            <Link href="/register" className="mk-btn mk-btn-hay">
              {t('nav.register')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <CallToAction />
      <Contact />

      {/* ── Footer ── */}
      <footer className="mk-foot">
        <div className="mk-wrap">
          <div className="mk-footgrid">
            <div>
              <div className="mk-logo" style={{ marginBottom: 14 }}>
                <span className="mk-logo-mark">M</span>
                <span className="mk-logo-name" style={{ color: '#f4f8ee' }}>BD Metrics</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: '30ch' }}>
                Medición de bienestar animal a campo: corrales, variables y rangos
                óptimos en un solo lugar.
              </p>
            </div>

            <div>
              <h4>{t('footer.product')}</h4>
              <ul>
                <li><a href="#features">{t('footer.features')}</a></li>
                <li><a href="#analytics">{t('nav.analytics')}</a></li>
                <li><Link href="/login">{t('nav.login')}</Link></li>
              </ul>
            </div>

            <div>
              <h4>{t('footer.company')}</h4>
              <ul>
                <li><a href="#contact">{t('footer.contact')}</a></li>
                <li><Link href="/privacy-policy">Privacidad</Link></li>
              </ul>
            </div>

            <div>
              <h4>Legal</h4>
              <ul>
                <li><Link href="/privacy-policy">Privacidad</Link></li>
                <li><Link href="/delete-account">{t('footer.deleteAccount')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="mk-footbar">
            © {new Date().getFullYear()} BD Metrics. {t('footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  );
}
