import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export default function Language() {
  const { t } = useTranslation();
  const { locale, setLocale, dir } = useI18n();
  const navigate = useNavigate();
  const [selectedLocale, setSelectedLocale] = useState<'ar' | 'en'>(locale);

  useEffect(() => {
    // Remove persona theme for onboarding - use default theme
    const root = document.documentElement;
    root.removeAttribute('data-persona');
  }, []);

  const handleNext = () => {
    setLocale(selectedLocale);
    navigate('/onboarding/cycle-setup');
  };

  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  return (
    <div className="min-h-screen flex flex-col bg-background p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/onboarding/persona')}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <BackIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => navigate('/auth')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('onboarding.skip')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{t('onboarding.chooseLanguage')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('onboarding.languageSubtitle')}
          </p>
        </div>

        {/* Language Cards */}
        <div className="space-y-4">
          <Card
            onClick={() => setSelectedLocale('ar')}
            className={`cursor-pointer transition-all hover:scale-[1.02] glass ${
              selectedLocale === 'ar' ? 'ring-2 ring-primary shadow-elegant' : ''
            }`}
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🇸🇦</div>
                <div>
                  <h3 className="font-bold text-lg">العربية</h3>
                  <p className="text-sm text-muted-foreground">Arabic</p>
                </div>
              </div>
              {selectedLocale === 'ar' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            onClick={() => setSelectedLocale('en')}
            className={`cursor-pointer transition-all hover:scale-[1.02] glass ${
              selectedLocale === 'en' ? 'ring-2 ring-primary shadow-elegant' : ''
            }`}
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🇬🇧</div>
                <div>
                  <h3 className="font-bold text-lg">English</h3>
                  <p className="text-sm text-muted-foreground">إنجليزي</p>
                </div>
              </div>
              {selectedLocale === 'en' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted"></div>
          <div className="w-2 h-2 rounded-full bg-muted"></div>
          <div className="w-6 h-2 rounded-full bg-primary"></div>
        </div>
      </div>

      {/* Next Button */}
      <Button
        onClick={handleNext}
        className="w-full h-14 text-lg rounded-full shadow-elegant"
      >
        {t('onboarding.next')}
      </Button>
    </div>
  );
}
