import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface I18nContextType {
  locale: 'ar' | 'en';
  setLocale: (locale: 'ar' | 'en') => void;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextType>({
  locale: 'ar',
  setLocale: () => {},
  dir: 'rtl',
});

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const [locale, setLocaleState] = useState<'ar' | 'en'>('ar');
  const [dir, setDir] = useState<'rtl' | 'ltr'>('rtl');

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as 'ar' | 'en' | null;
    if (savedLocale) {
      setLocale(savedLocale);
    } else {
      // Initialize dir on mount
      const initialDir = locale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.dir = initialDir;
      document.documentElement.lang = locale;
    }
  }, []);

  const setLocale = (newLocale: 'ar' | 'en') => {
    setLocaleState(newLocale);
    i18n.changeLanguage(newLocale);
    const newDir = newLocale === 'ar' ? 'rtl' : 'ltr';
    setDir(newDir);
    document.documentElement.dir = newDir;
    document.documentElement.lang = newLocale;
    localStorage.setItem('locale', newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, dir }}>
      {children}
    </I18nContext.Provider>
  );
};