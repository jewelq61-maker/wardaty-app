import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Flower2 } from 'lucide-react';

export default function Welcome() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Remove persona theme for onboarding - use default theme
    const root = document.documentElement;
    root.removeAttribute('data-persona');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background p-6 animate-fade-in">
      {/* Skip Button */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/onboarding/cycle-setup')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('onboarding.skip')}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center">
        {/* Logo */}
        <div className="relative">
          <div className="w-40 h-40 rounded-full bg-primary flex items-center justify-center shadow-elegant animate-fade-in">
            <Flower2 className="w-20 h-20 text-primary-foreground" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl font-bold">
            {t('onboarding.welcome')} 🌸
          </h1>
          <p className="text-muted-foreground whitespace-pre-line max-w-md leading-relaxed">
            {t('onboarding.welcomeSubtitle')}
          </p>
        </div>

        {/* Pagination Dots */}
        <div className="flex gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="w-2 h-2 rounded-full bg-muted"></div>
          <div className="w-2 h-2 rounded-full bg-muted"></div>
          <div className="w-6 h-2 rounded-full bg-primary"></div>
        </div>
      </div>

      {/* Start Button */}
      <Button
        onClick={() => navigate('/onboarding/persona')}
        className="w-full h-14 text-lg rounded-full shadow-elegant animate-fade-in"
        style={{ animationDelay: '0.3s' }}
      >
        {t('onboarding.startJourney')}
      </Button>
    </div>
  );
}
