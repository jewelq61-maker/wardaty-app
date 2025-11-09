import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

const affirmations = {
  ar: {
    menstrual: [
      'جسمك قوي وحكيم. امنحيه الراحة التي يستحقها اليوم.',
      'الاستراحة جزء من القوة. أنت تستحقين العناية اللطيفة.',
      'كل دورة هي دليل على قوتك الداخلية وتجددك.',
    ],
    follicular: [
      'الطاقة تتدفق فيك. احتضني هذه القوة الجديدة.',
      'هذا وقتك للنمو والازدهار. أنت جاهزة لكل شيء جديد.',
      'مثل الطبيعة، أنت تتجددين. احتفي بهذه البداية الجديدة.',
    ],
    ovulation: [
      'أنت في قمة قوتك. دعي نورك يشع.',
      'ثقي بحكمة جسمك وحدسك القوي اليوم.',
      'أنت مشعة وقوية ومذهلة. احتفي بنفسك.',
    ],
    luteal: [
      'استمعي لاحتياجاتك. الهدوء والرعاية الذاتية قوة.',
      'أنت متوازنة ورائعة تماماً كما أنت.',
      'كل مرحلة لها جمالها. احتضني هذا الوقت بلطف.',
    ],
  },
  en: {
    menstrual: [
      'Your body is strong and wise. Give it the rest it deserves today.',
      'Rest is part of strength. You deserve gentle care.',
      'Every cycle is proof of your inner strength and renewal.',
    ],
    follicular: [
      'Energy flows through you. Embrace this new strength.',
      'This is your time to grow and flourish. You\'re ready for everything new.',
      'Like nature, you are renewing. Celebrate this new beginning.',
    ],
    ovulation: [
      'You are at your peak. Let your light shine.',
      'Trust your body\'s wisdom and strong intuition today.',
      'You are radiant, strong, and amazing. Celebrate yourself.',
    ],
    luteal: [
      'Listen to your needs. Calm and self-care are strength.',
      'You are balanced and wonderful exactly as you are.',
      'Every phase has its beauty. Embrace this time gently.',
    ],
  },
};

interface DailyAffirmationProps {
  phase: string;
}

export default function DailyAffirmation({ phase }: DailyAffirmationProps) {
  const { t } = useTranslation();
  const { locale } = useI18n();
  const [affirmation, setAffirmation] = useState('');

  useEffect(() => {
    // Get affirmation for current phase
    const phaseKey = phase as keyof typeof affirmations.ar;
    const localeKey = locale as keyof typeof affirmations;
    const phaseAffirmations = affirmations[localeKey]?.[phaseKey] || affirmations.ar[phaseKey];
    
    // Select random affirmation for the day (consistent for same day)
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % phaseAffirmations.length;
    
    setAffirmation(phaseAffirmations[index]);
  }, [phase, locale]);

  return (
    <Card className="glass shadow-elegant animate-fade-in bg-gradient-to-br from-primary/5 via-secondary/5 to-success/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{t('home.dailyAffirmation')}</h3>
            <p className="text-muted-foreground leading-relaxed italic">
              "{affirmation}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
