
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="pt-28 flex justify-center items-center pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-white to-green-50">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
          <div className="flex flex-col space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-800">
              {t('hero.title')} <span className="text-green-600">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-xl text-gray-600 md:max-w-md">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white cursor-pointer">
                {t('hero.downloadApp')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer">
                {t('hero.scheduleDemo')}
              </Button>
            </div>
          </div>
          <div className="relative md:pl-6 animate-fade-in">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 transform md:rotate-1">
              <img
                src="https://images.unsplash.com/photo-1485833077593-4278bba3f11f?auto=format&fit=crop&w=800&q=80"
                alt="Farm animal monitoring"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute right-0 bottom-0 -z-10 w-64 h-64 rounded-full bg-farm-green/10 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;