import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Baby, HeartHandshake, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';

type Persona = 'single' | 'married' | 'mother' | 'partner';

const personaIcons = {
  single: Heart,
  married: Users,
  mother: Baby,
  partner: HeartHandshake,
};

const personaColors: Record<Persona, string> = {
  single: 'bg-primary',
  married: 'bg-primary',
  mother: 'bg-primary',
  partner: 'bg-primary',
};

export default function Persona() {
  const { t } = useTranslation();
  const { dir } = useI18n();
  const { setPersona } = useTheme();
  const navigate = useNavigate();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  useEffect(() => {
    // Start with default theme, then apply persona theme on selection
    const root = document.documentElement;
    root.removeAttribute('data-persona');
  }, []);

  const personas: Persona[] = ['single', 'married', 'mother', 'partner'];

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    // Apply persona theme immediately when selected
    setPersona(persona);
  };

  const handleNext = () => {
    if (selectedPersona) {
      navigate('/onboarding/language');
    }
  };

  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  return (
    <div className="min-h-screen flex flex-col bg-background p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/onboarding/welcome')}
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
          <h1 className="text-2xl font-bold">{t('onboarding.choosePersona')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('onboarding.personaSubtitle')}
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid grid-cols-2 gap-4">
          {personas.map((persona) => {
            const Icon = personaIcons[persona];
            const isSelected = selectedPersona === persona;
            
            return (
              <Card
                key={persona}
                onClick={() => handlePersonaSelect(persona)}
                className={`cursor-pointer transition-all hover:scale-105 glass ${
                  isSelected ? 'ring-2 ring-primary shadow-elegant' : ''
                }`}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div
                    className={`w-16 h-16 rounded-full ${personaColors[persona]} flex items-center justify-center`}
                  >
                    <Icon className="w-8 h-8 text-primary-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold">{t(`personas.${persona}`)}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(`personas.${persona}Desc`)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted"></div>
          <div className="w-6 h-2 rounded-full bg-primary"></div>
          <div className="w-2 h-2 rounded-full bg-muted"></div>
        </div>
      </div>

      {/* Next Button */}
      <Button
        onClick={handleNext}
        disabled={!selectedPersona}
        className="w-full h-14 text-lg rounded-full shadow-elegant"
      >
        {t('onboarding.next')}
      </Button>
    </div>
  );
}
