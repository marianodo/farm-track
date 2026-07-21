"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight,
  AlertCircle, Loader2, Check,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/contexts/LanguageContext';

/** Rangos reales de la app: la banda verde es el óptimo. */
const ASIDE_ROWS = [
  { name: 'Condición corporal', value: '3.2', unit: '/ 5', pos: 62, ok: [45, 75] },
  { name: 'Score fecal', value: '2.9', unit: '/ 5', pos: 55, ok: [40, 70] },
  { name: 'Locomoción', value: '1.4', unit: '/ 5', pos: 22, ok: [10, 45] },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuthStore();
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(t('login.error'));
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/dashboard/general');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'No pudimos iniciar sesión. Intentá de nuevo.';
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="lg-shell">
      {/* Panel de contexto: qué es lo que se mide */}
      <aside className="lg-aside">
        <Link href="/" className="mk-logo" style={{ position: 'relative' }}>
          <span className="mk-logo-mark">M</span>
          <span className="mk-logo-name" style={{ color: '#f4f8ee' }}>BD Metrics</span>
        </Link>

        <div className="lg-aside-body">
          <div className="mk-eyebrow" style={{ color: 'var(--mk-hay)' }}>
            Bienestar animal
          </div>
          <h2 className="mk-h2">
            Cada corral, cada variable, contra su rango óptimo.
          </h2>
          <p>
            Registrá mediciones a campo y seguí la evolución de tus indicadores
            reporte a reporte.
          </p>

          <div
            className="mk-ficha"
            style={{ marginTop: 34, transform: 'none', maxWidth: 380 }}
          >
            <div className="mk-ficha-h">
              <span className="mk-ficha-t">Corral 4 · Vacas en ordeñe</span>
              <span className="mk-ficha-d mk-num">17 mediciones</span>
            </div>
            <div className="mk-ficha-b">
              {ASIDE_ROWS.map((r) => (
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
                      data-s={r.pos >= r.ok[0] && r.pos <= r.ok[1] ? 'ok' : 'warn'}
                      style={{ left: `${r.pos}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              className="mk-ficha-f"
              style={{
                background: 'var(--st-ok-bg)',
                color: 'var(--st-ok-ink)',
              }}
            >
              <Check size={15} />
              2 de 3 variables dentro del rango óptimo
            </div>
          </div>
        </div>
      </aside>

      {/* Formulario */}
      <main className="lg-main">
        <div className="lg-card">
          <Link href="/" className="lg-back">
            <ArrowLeft size={15} /> Volver al inicio
          </Link>

          <h1>{t('login.title')}</h1>
          <p className="sub">{t('login.subtitle')}</p>

          <form onSubmit={handleLogin} className="lg-form" noValidate>
            {error && (
              <div className="lg-error" role="alert">
                <AlertCircle size={16} style={{ flex: 'none', marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="lg-field">
              <label className="lg-label" htmlFor="email">
                {t('login.email')}
              </label>
              <div className="lg-inputwrap">
                <Mail size={16} />
                <input
                  id="email"
                  className="lg-input"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={email}
                  aria-invalid={!!error}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="lg-field">
              <label className="lg-label" htmlFor="password">
                {t('login.password')}
              </label>
              <div className="lg-inputwrap">
                <Lock size={16} />
                <input
                  id="password"
                  className="lg-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  aria-invalid={!!error}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="lg-peek"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="lg-submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="rd-spin" />
                  {t('login.loading')}
                </>
              ) : (
                <>
                  {t('login.button')}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="lg-foot">
            {t('login.noAccount')}{' '}
            <Link href="/register">{t('login.register')}</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
