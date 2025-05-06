import React from 'react';
import { Button } from '@/components/ui/button';
import { Sprout } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/ui/LanguageSelector';
import Link from 'next/link';

const Navbar = () => {
  const { t } = useTranslation();

  return (
    <nav className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm py-4 border-b border-gray-100 dark:border-gray-800 fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto flex justify-between items-center px-4 md:px-6">
        <div className="flex items-center space-x-2">
          <Sprout className="h-8 w-8 text-green-600" />
          <Link href="/">
            <span className="text-xl font-bold text-black dark:text-white">FarmHealth</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 transition-colors">{t('navbar.features')}</a>
          <a href="#benefits" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 transition-colors">{t('navbar.benefits')}</a>
          <a href="#metrics" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 transition-colors">{t('navbar.metrics')}</a>
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSelector />

          <Link href="/login">
            <Button
              variant="outline"
              className="hidden md:inline-flex border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 cursor-pointer"
            >
              {t('navbar.login')}
            </Button>
          </Link>

          <Link href="/register">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            >
              {t('navbar.getStarted')}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;