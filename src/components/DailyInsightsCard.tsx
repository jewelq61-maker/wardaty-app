import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/contexts/I18nContext';

interface DailyInsightsCardProps {
  phase: string;
}

export default function DailyInsightsCard({ phase }: DailyInsightsCardProps) {
  const { t } = useTranslation();
  const { locale } = useI18n();
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [phase, locale]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('daily-insights', {
        body: { phase, locale },
      });

      if (error) throw error;
      setInsights(data.insights || '');
    } catch (error) {
      console.error('Error loading insights:', error);
      setInsights('');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass shadow-elegant">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <Card className="glass shadow-elegant bg-gradient-to-br from-primary/5 to-secondary/5 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {t('home.dailyInsights')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed whitespace-pre-line">{insights}</p>
      </CardContent>
    </Card>
  );
}
