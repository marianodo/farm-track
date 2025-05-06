
import React from 'react';
import FeatureCard from '../ui/FeatureCard';
import { Droplet, Thermometer, Gauge, ChartPie } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t('features.title')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('features.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <FeatureCard
            icon={<Droplet className="h-6 w-6" />}
            title={t('features.urineTracking.title')}
            description={t('features.urineTracking.description')}
          />
          <FeatureCard
            icon={<ChartPie className="h-6 w-6" />}
            title={t('features.fecalScoring.title')}
            description={t('features.fecalScoring.description')}
          />
          <FeatureCard
            icon={<Thermometer className="h-6 w-6" />}
            title={t('features.temperatureMonitoring.title')}
            description={t('features.temperatureMonitoring.description')}
          />
          <FeatureCard
            icon={<Gauge className="h-6 w-6" />}
            title={t('features.bodyCondition.title')}
            description={t('features.bodyCondition.description')}
          />
        </div>

        <div className="mt-16 md:mt-24 relative">
          <div className="rounded-xl overflow-hidden shadow-xl border border-gray-200">
            <div className="bg-gray-50 p-2">
              <div className="flex space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                <div className="h-3 w-3 rounded-full bg-green-400"></div>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
              alt="Farm Health Dashboard"
              className="w-full h-auto"
            />
          </div>
          <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 rounded-full bg-farm-blue/10 blur-3xl"></div>
        </div>
      </div>
    </section>
  );
};

export default Features;