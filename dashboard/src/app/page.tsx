"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BarChart, Check, Leaf, PieChart, Tractor, TrendingUp, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart as RechartBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, Cell } from 'recharts';
import Contact from "@/components/sections/Contact";
import CallToAction from "@/components/sections/CallToAction";

// Datos de ejemplo para los gráficos
const saludAnimalData = [
  { name: 'Ene', sinMonitoreo: 3.2, conMonitoreo: 4.1 },
  { name: 'Feb', sinMonitoreo: 3.0, conMonitoreo: 4.3 },
  { name: 'Mar', sinMonitoreo: 3.1, conMonitoreo: 4.5 },
  { name: 'Abr', sinMonitoreo: 2.9, conMonitoreo: 4.4 },
  { name: 'May', sinMonitoreo: 3.3, conMonitoreo: 4.6 },
  { name: 'Jun', sinMonitoreo: 3.2, conMonitoreo: 4.7 },
];

// Datos para el gráfico de distribución de Fecal Score
const fecalScoreDistribucion = [
  { valor: 1, cantidad: 0 },
  { valor: 2, cantidad: 2 },
  { valor: 3, cantidad: 13 },
  { valor: 4, cantidad: 2 },
  { valor: 5, cantidad: 0 },
];

// Datos para el gráfico de evolución temporal de Fecal Score
const fecalScoreEvolucion = [
  { fecha: '21/3/2025', valor: 2.2 },
  { fecha: '24/4/2025', valor: 2.4 },
  { fecha: '30/5/2025', valor: 3.0 },
];

// Datos para el gráfico de tendencia por corral
const tendenciaCorralData = [
  { 
    fecha: '2025-03-21', 
    corral1: 2.8, 
    corral2: 2.5, 
    corral3: 2.6, 
    corral4: 2.6, 
    corral5: 3.0, 
    corral6: 2.6, 
    corral7: 2.7, 
    corral8: 2.6, 
    corralTanque: 2.4
  },
  { 
    fecha: '2025-04-24', 
    corral1: 2.5, 
    corral2: 2.2, 
    corral3: 2.7, 
    corral4: 3.0, 
    corral5: 2.6, 
    corral6: 2.5, 
    corral7: 2.8, 
    corral8: 3.0, 
    corralTanque: 2.2
  },
  { 
    fecha: '2025-05-30', 
    corral1: 2.2, 
    corral2: 2.8, 
    corral3: 2.9, 
    corral4: 2.8, 
    corral5: 2.8, 
    corral6: 3.3, 
    corral7: 3.0, 
    corral8: 2.9, 
    corralTanque: 2.9
  },
];

const variablesVeterinariasData = [
  { name: 'Sem 1', bodyCondition: 3.2, fecalScore: 3.5, phUrine: 6.8 },
  { name: 'Sem 2', bodyCondition: 3.4, fecalScore: 3.7, phUrine: 7.0 },
  { name: 'Sem 3', bodyCondition: 3.6, fecalScore: 3.8, phUrine: 7.1 },
  { name: 'Sem 4', bodyCondition: 3.8, fecalScore: 3.9, phUrine: 7.2 },
  { name: 'Sem 5', bodyCondition: 4.0, fecalScore: 4.1, phUrine: 7.2 },
  { name: 'Sem 6', bodyCondition: 4.2, fecalScore: 4.2, phUrine: 7.3 },
];

const deteccionTempranaData = [
  { name: 'Sin BD Metrics', value: 43 },
  { name: 'Con BD Metrics', value: 87 },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    // Si el usuario está autenticado, redirigir al dashboard
    if (isAuthenticated) {
      router.replace('/dashboard/general');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Navigation */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 text-white rounded-md p-2 flex items-center justify-center">
              <span className="font-bold text-xl">M</span>
            </div>
            <h1 className="text-gray-800 font-bold text-2xl">BD Metrics</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-emerald-600 font-medium">{t('nav.features')}</a>
            <a href="#analytics" className="text-gray-600 hover:text-emerald-600 font-medium">{t('nav.analytics')}</a>
            <a href="#pricing" className="text-gray-600 hover:text-emerald-600 font-medium">{t('nav.pricing')}</a>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button 
                onClick={() => setLanguage('es')} 
                className={`px-2 py-1 text-xs font-medium ${language === 'es' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-gray-500'}`}
              >
                ES
              </button>
              <button 
                onClick={() => setLanguage('en')} 
                className={`px-2 py-1 text-xs font-medium ${language === 'en' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-gray-500'}`}
              >
                EN
              </button>
            </div>
            <Link href="/login" className="text-emerald-600 hover:text-emerald-800 font-semibold">{t('nav.login')}</Link>
            <Link 
              href="/register" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm"
            >
              {t('nav.register')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/register" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-center font-semibold px-6 py-3 rounded-md shadow-md"
              >
                {t('hero.cta.start')}
              </Link>
              <a 
                href="#features" 
                className="bg-white hover:bg-gray-50 text-emerald-600 text-center font-semibold px-6 py-3 rounded-md border border-emerald-500 shadow-sm"
              >
                {t('hero.cta.learn')}
              </a>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="w-full h-64 md:h-96 bg-white rounded-lg overflow-hidden relative shadow-md border border-gray-100">
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-xl text-gray-900">Fecal score</h3>
                    <div className="flex items-center">
                      <Check size={20} className="text-emerald-500 mr-1" />
                      <span className="text-sm font-medium">88% correcto (15/17)</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Animal</p>
                  <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartBarChart 
                        data={fecalScoreDistribucion}
                        margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="valor" 
                          label={{ value: 'Valor de la medición', position: 'bottom', offset: 0 }}
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                        />
                        <YAxis 
                          label={{ 
                            value: 'Cantidad de mediciones', 
                            angle: -90, 
                            position: 'left',
                            offset: 5
                          }}
                          domain={[0, 15]} 
                          ticks={[0, 3, 6, 9, 12, 15]} 
                        />
                        <Tooltip formatter={(value) => [`${value} mediciones`, 'Cantidad']} />
                        <Bar dataKey="cantidad" fill="#82ca9d" name="Cantidad de mediciones">
                          {fecalScoreDistribucion.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.valor === 3 ? '#82ca9d' : '#ff8a8a'} />
                          ))}
                        </Bar>
                      </RechartBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between mt-4 text-sm text-gray-600">
                    <div>Rango óptimo: 3</div>
                    <div>Promedio: 2.59</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('features.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="bg-emerald-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.fields.title')}</h3>
              <p className="text-gray-600">
                {t('features.fields.desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="bg-emerald-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.variables.title')}</h3>
              <p className="text-gray-600">
                {t('features.variables.desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="bg-emerald-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <PieChart className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.reports.title')}</h3>
              <p className="text-gray-600">
                {t('features.reports.desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="bg-emerald-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.trends.title')}</h3>
              <p className="text-gray-600">
                {t('features.trends.desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="bg-emerald-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.pens.title')}</h3>
              <p className="text-gray-600">
                {t('features.pens.desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="bg-emerald-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.alerts.title')}</h3>
              <p className="text-gray-600">
                {t('features.alerts.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Health Status Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('health.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('health.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Campo */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-gray-700 text-center mb-6">{t('health.field.title')}</h3>
              <div className="flex justify-center">
                <div className="w-48 h-48 relative">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#e6e6e6"
                      strokeWidth="12"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#65D364"
                      strokeWidth="12"
                      strokeDasharray="339.3"
                      strokeDashoffset="50.9"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold">%85</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <div className="text-2xl font-semibold">132/155</div>
                <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
                  <span>{t('health.field.metrics')}</span>
                  <span className="ml-2 text-green-500 font-medium">(↑ +52%)</span>
                </div>
              </div>
            </div>
            
            {/* Animales */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-gray-700 text-center mb-6">{t('health.animals.title')}</h3>
              <div className="flex justify-center">
                <div className="w-48 h-48 relative">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#e6e6e6"
                      strokeWidth="12"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#65D364"
                      strokeWidth="12"
                      strokeDasharray="339.3"
                      strokeDashoffset="13.6"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold">%96</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <div className="text-2xl font-semibold">109/113</div>
                <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
                  <span>{t('health.animals.metrics')}</span>
                  <span className="ml-2 text-green-500 font-medium">(↑ +63%)</span>
                </div>
              </div>
            </div>
            
            {/* Instalaciones */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-gray-700 text-center mb-6">{t('health.facilities.title')}</h3>
              <div className="flex justify-center">
                <div className="w-48 h-48 relative">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#e6e6e6"
                      strokeWidth="12"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#F0D74D"
                      strokeWidth="12"
                      strokeDasharray="339.3"
                      strokeDashoffset="152.7"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold">%55</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <div className="text-2xl font-semibold">23/42</div>
                <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
                  <span>{t('health.facilities.metrics')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('analytics.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('analytics.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* % Correctos por Reporte Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('analytics.correctPercent.title')}</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBarChart 
                    data={[
                      { reporte: '22/4/2025 (1)', porcentaje: 80, description: '% Salud General' },
                      { reporte: '22/4/2025 (2)', porcentaje: 77, description: '% Salud General' },
                      { reporte: '29/4/2025 (1)', porcentaje: 80, description: '% Salud General' },
                      { reporte: '29/4/2025 (2)', porcentaje: 86, description: '% Salud General' },
                      { reporte: '29/4/2025 (3)', porcentaje: 79, description: '% Salud General' },
                    ]}
                    margin={{ top: 10, right: 30, left: 30, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="reporte" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      label={{ value: 'Reporte', position: 'insideBottom', offset: -40 }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      ticks={[0, 20, 40, 60, 80, 100]}
                      label={{ value: t('analytics.correctPercent.yaxis'), angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip formatter={(value) => [`${value}%`, t('analytics.correctPercent.tooltip')]} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="porcentaje" name={t('analytics.correctPercent.legend')} fill="#64B5F6" />
                  </RechartBarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Fecal Score Analysis Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-800">{t('analytics.fecalScore.title')}</h3>
                <div className="flex items-center">
                  <div className="h-5 w-5 text-green-500 mr-2">
                    <Check size={20} />
                  </div>
                  <span className="text-sm font-medium">88% {t('analytics.fecalScore.correctPercent')} (15/17)</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">{t('analytics.fecalScore.subtitle')}</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribución de Variables */}
                <div>
                  <h4 className="text-base text-gray-600 mb-4">{t('analytics.fecalScore.distribution.title')}</h4>
                  <div className="text-center mb-2">
                    <span className="text-sm font-medium">{t('analytics.fecalScore.title')}</span>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartBarChart 
                        data={fecalScoreDistribucion}
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="valor" 
                          label={{ value: t('analytics.fecalScore.distribution.xaxis'), position: 'bottom', offset: -5 }}
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                        />
                        <YAxis 
                          label={{ 
                            value: t('analytics.fecalScore.distribution.yaxis'), 
                            angle: -90, 
                            position: 'left',
                            offset: 15
                          }}
                          domain={[0, 15]} 
                          ticks={[0, 2, 4, 6, 8, 10, 12, 14]} 
                        />
                        <Tooltip formatter={(value) => [`${value} mediciones`, 'Cantidad']} />
                        <Bar dataKey="cantidad" fill="#82ca9d" name="Cantidad de mediciones">
                          {/* Añadir colores específicos para ciertos valores */}
                          {fecalScoreDistribucion.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.valor === 3 ? '#82ca9d' : '#ff8a8a'} />
                          ))}
                        </Bar>
                      </RechartBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Tendencia de Variables */}
                <div>
                  <h4 className="text-base text-gray-600 mb-4">Tendencia de Variables</h4>
                  <div className="text-center mb-2">
                    <span className="text-sm font-medium">Evolución en el tiempo</span>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={fecalScoreEvolucion}
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="fecha" 
                          label={{ value: 'Fecha del reporte', position: 'bottom', offset: -5 }}
                        />
                        <YAxis 
                          label={{ 
                            value: 'Valor promedio', 
                            angle: -90, 
                            position: 'left',
                            offset: 15
                          }}
                          domain={[0.9, 5.5]} 
                          ticks={[0.9, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5]} 
                        />
                        <Tooltip formatter={(value) => [`${value}`, 'Valor promedio']} />
                        <Line 
                          type="monotone" 
                          dataKey="valor" 
                          stroke="#16a34a" 
                          strokeWidth={2} 
                          dot={{ stroke: '#16a34a', strokeWidth: 2, r: 4 }} 
                          activeDot={{ stroke: '#16a34a', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-4 text-sm">
                <div>Rango óptimo: 3</div>
                <div>Promedio: 2.59</div>
              </div>
            </div>
          </div>
          
          {/* Tendencia Histórica por Corral Chart */}
          <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('trend.title')}</h3>
            <p className="text-sm text-gray-600 mb-6">{t('trend.subtitle')}</p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-center text-base font-medium text-gray-700 mb-3">{t('trend.chart.title')}</h4>
              
              <div className="grid grid-cols-3 lg:grid-cols-9 gap-2 mb-4">
                <div className="flex items-center">
                  <span className="inline-block w-4 h-3 bg-red-500 mr-2"></span>
                  <span className="text-xs">{t('trend.corral.prefix')} Corral 7</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-3 bg-green-500 mr-2"></span>
                  <span className="text-xs">{t('trend.corral.prefix')} Corral 8</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-3 bg-purple-500 mr-2"></span>
                  <span className="text-xs">{t('trend.corral.prefix')} Tanque</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-3 bg-yellow-500 mr-2"></span>
                  <span className="text-xs">{t('trend.corral.prefix')} Corral 6</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-3 bg-cyan-500 mr-2"></span>
                  <span className="text-xs">{t('trend.corral.prefix')} Corral 5</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-3 bg-pink-500 mr-2"></span>
                  <span className="text-xs">{t('trend.corral.prefix')} Corral 4</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-3 bg-lime-500 mr-2"></span>
                  <span className="text-xs">{t('trend.corral.prefix')} Corral 3</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-3 bg-blue-500 mr-2"></span>
                  <span className="text-xs">{t('trend.corral.prefix')} Corral 2</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-3 bg-orange-500 mr-2"></span>
                  <span className="text-xs">{t('trend.corral.prefix')} Corral 1</span>
                </div>
              </div>
              
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={tendenciaCorralData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="fecha" 
                      label={{ value: t('trend.chart.xaxis'), position: 'bottom', offset: 0 }}
                    />
                    <YAxis 
                      label={{ value: t('trend.chart.yaxis'), angle: -90, position: 'insideLeft' }}
                      domain={[2.0, 3.4]}
                      ticks={[2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.2, 3.4]}
                    />
                    <Tooltip />
                    <Line type="monotone" dataKey="corral1" stroke="#f97316" dot={{ fill: '#f97316' }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="corral2" stroke="#3b82f6" dot={{ fill: '#3b82f6' }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="corral3" stroke="#84cc16" dot={{ fill: '#84cc16' }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="corral4" stroke="#ec4899" dot={{ fill: '#ec4899' }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="corral5" stroke="#06b6d4" dot={{ fill: '#06b6d4' }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="corral6" stroke="#eab308" dot={{ fill: '#eab308' }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="corral7" stroke="#ef4444" dot={{ fill: '#ef4444' }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="corral8" stroke="#22c55e" dot={{ fill: '#22c55e' }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="corralTanque" stroke="#a855f7" dot={{ fill: '#a855f7' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          

        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('cta.title')}</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <Link 
            href="/register" 
            className="bg-white hover:bg-gray-100 text-emerald-700 font-semibold px-8 py-3 rounded-md text-lg shadow-md inline-block"
          >
            {t('nav.register')}
          </Link>
        </div>
      </section>

      <CallToAction />
      
      <Contact />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-500 text-white rounded-md p-2 flex items-center justify-center">
                  <span className="font-bold text-xl">M</span>
                </div>
                <h1 className="text-white font-bold text-xl">BD Metrics</h1>
              </div>
              <p className="text-gray-400 max-w-xs">
                Herramienta de gestión agrícola para optimizar la producción y el seguimiento de métricas clave.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('footer.product')}</h3>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-gray-400 hover:text-white">{t('footer.features')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">{t('footer.pricing')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Soporte</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('footer.company')}</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">{t('footer.about')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">{t('footer.contact')}</a></li>
                  <li><a href="/privacy-policy" className="text-gray-400 hover:text-white">Privacidad</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Términos</a></li>
                  <li><a href="/privacy-policy" className="text-gray-400 hover:text-white">Privacidad</a></li>
                  <li><a href="/delete-account" className="text-gray-400 hover:text-white">{t('footer.deleteAccount')}</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center md:text-left">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} BD Metrics. {t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
