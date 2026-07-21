import React from 'react';
import { Download, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FcAndroidOs } from "react-icons/fc";
import { FaAppStore } from "react-icons/fa6";


const CallToAction = () => {
  const { t } = useTranslation();

  return (
    <section className="mk-sec mk-sec-alt">
      <div className="mk-wrap text-center">
        <h2 className="mk-h2 mx-auto max-w-2xl">
          {t('callToAction.title')}
        </h2>
        <p className="mk-lede mx-auto mt-4 mb-8" style={{ textAlign: 'center' }}>
          {t('callToAction.description')}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
          <button type="button" className="mk-btn mk-btn-primary">
            <Download className="h-4 w-4" />
            {t('callToAction.downloadApp')}
          </button>
          <a href="#features" className="mk-btn mk-btn-ghost">
            {t('callToAction.learnMore')}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div
          className="mt-12 inline-flex items-center rounded-xl px-5 py-3"
          style={{ background: 'var(--mk-paper)', border: '1px solid var(--mk-line)' }}
        >
          <span className="mr-3 text-sm font-semibold" style={{ color: 'var(--mk-ink-2)' }}>
            {t('callToAction.availableOn')}
          </span>
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