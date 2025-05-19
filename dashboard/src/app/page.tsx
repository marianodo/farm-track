"use client";

import { useTranslation } from "react-i18next";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Benefits from "@/components/sections/Benefits";
import CallToAction from "@/components/sections/CallToAction";
import { Droplet, Gauge, Thermometer, ChartBar } from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import Link from "next/link";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      <div id="metrics" className="container mx-auto px-4 md:px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <MetricCard
            icon={<Gauge className="h-5 w-5" />}
            title={t('metrics.bodyCondition.title')}
            value={t('metrics.bodyCondition.value')}
            description={t('metrics.bodyCondition.description')}
          />
          <MetricCard
            icon={<Droplet className="h-5 w-5" />}
            title={t('metrics.urinePh.title')}
            value={t('metrics.urinePh.value')}
            description={t('metrics.urinePh.description')}
          />
          <MetricCard
            icon={<ChartBar className="h-5 w-5" />}
            title={t('metrics.fecalScore.title')}
            value={t('metrics.fecalScore.value')}
            description={t('metrics.fecalScore.description')}
          />
          <MetricCard
            icon={<Thermometer className="h-5 w-5" />}
            title={t('metrics.temperature.title')}
            value={t('metrics.temperature.value')}
            description={t('metrics.temperature.description')}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Features />
        <Benefits />
      </div>

      <CallToAction />

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">{t('footer.product')}</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.features')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.pricing')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.caseStudies')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.reviews')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">{t('footer.resources')}</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.blog')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.documentation')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.helpCenter')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.webinars')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">{t('footer.company')}</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.aboutUs')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.careers')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.contact')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.partners')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">{t('footer.legal')}</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition">{t('footer.privacyPolicy')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.termsOfService')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.cookiePolicy')}</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">{t('footer.gdpr')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <Gauge className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold">MeasureMe</span>
            </div>
            <p className="text-gray-400 mt-4 md:mt-0">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;