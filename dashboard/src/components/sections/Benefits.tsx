import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

const Benefits = () => {
  const { t } = useTranslation();

  const benefitsList = [
    {
      key: 'earlyDetection',
      title: t('benefits.earlyDetection.title'),
      description: t('benefits.earlyDetection.description')
    },
    {
      key: 'increaseProductivity',
      title: t('benefits.increaseProductivity.title'),
      description: t('benefits.increaseProductivity.description')
    },
    {
      key: 'reduceCosts',
      title: t('benefits.reduceCosts.title'),
      description: t('benefits.reduceCosts.description')
    },
    {
      key: 'dataDecisions',
      title: t('benefits.dataDecisions.title'),
      description: t('benefits.dataDecisions.description')
    },
    {
      key: 'timeEfficiency',
      title: t('benefits.timeEfficiency.title'),
      description: t('benefits.timeEfficiency.description')
    },
    {
      key: 'trendAnalysis',
      title: t('benefits.trendAnalysis.title'),
      description: t('benefits.trendAnalysis.description')
    }
  ];

  return (
    <section id="benefits" className="py-16 md:py-24 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t('benefits.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('benefits.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefitsList.map((benefit) => (
            <Card key={benefit.key} className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-xl mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;