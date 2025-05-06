import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FcAndroidOs } from "react-icons/fc";
import { FaAppStore } from "react-icons/fa6";


const CallToAction = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-green-600 to-blue-500">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 max-w-2xl mx-auto text-gray-100">
          {t('callToAction.title')}
        </h2>
        <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
          {t('callToAction.description')}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <Button
            size="lg"
            variant="default"
            className="bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer"
          >
            <Download className="mr-2 h-5 w-5" />
            {t('callToAction.downloadApp')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-600 cursor-pointer"
          >
            {t('callToAction.learnMore')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="mt-12 bg-gray-50 py-4 px-6 rounded-lg inline-flex items-center">
          <span className="font-medium mr-3 text-gray-700">{t('callToAction.availableOn')}</span>
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-amber-50 rounded-full">
              <FcAndroidOs className="w-8 h-8" />
            </div>
            <div className="bg-amber-50 rounded-full">
              <FaAppStore className="w-8 h-8" color='#007AFF' />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;