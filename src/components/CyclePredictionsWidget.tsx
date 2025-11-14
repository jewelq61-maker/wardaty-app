import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Droplet, Heart } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CyclePredictions {
  nextPeriodDate: Date;
  daysUntilPeriod: number;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  ovulationDate: Date;
  isInFertileWindow: boolean;
}

export default function CyclePredictionsWidget() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<CyclePredictions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const calculatePredictions = async () => {
      // Fetch the most recent cycle
      const { data: lastCycle } = await supabase
        .from('cycles')
        .select('start_date, length')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lastCycle) {
        setLoading(false);
        return;
      }

      const lastPeriodStart = new Date(lastCycle.start_date);
      const cycleLength = lastCycle.length || 28; // Default to 28 days
      
      // Calculate next period date
      const nextPeriodDate = addDays(lastPeriodStart, cycleLength);
      const daysUntilPeriod = differenceInDays(nextPeriodDate, new Date());
      
      // Calculate ovulation (typically 14 days before next period)
      const ovulationDate = addDays(nextPeriodDate, -14);
      
      // Fertile window is typically 5 days before ovulation + ovulation day
      const fertileWindowStart = addDays(ovulationDate, -5);
      const fertileWindowEnd = ovulationDate;
      
      // Check if today is in fertile window
      const today = new Date();
      const isInFertileWindow = today >= fertileWindowStart && today <= fertileWindowEnd;

      setPredictions({
        nextPeriodDate,
        daysUntilPeriod,
        fertileWindowStart,
        fertileWindowEnd,
        ovulationDate,
        isInFertileWindow,
      });
      
      setLoading(false);
    };

    calculatePredictions();

    // Subscribe to cycle changes
    const channel = supabase
      .channel('cycles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cycles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          calculatePredictions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            {t('cycle.predictions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{t('loading')}</div>
        </CardContent>
      </Card>
    );
  }

  if (!predictions) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            {t('cycle.predictions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {t('cycle.noCycleData')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const locale = i18n.language === 'ar' ? ar : undefined;

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          {t('cycle.predictions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Next Period */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-period/5 border border-period/20">
          <div className="p-2 rounded-full bg-period/10">
            <Droplet className="h-4 w-4 text-period" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-period">
              {t('cycle.nextPeriod')}
            </div>
            <div className="text-base font-semibold mt-1">
              {format(predictions.nextPeriodDate, 'PPP', { locale })}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {predictions.daysUntilPeriod > 0 
                ? t('cycle.inDays', { days: predictions.daysUntilPeriod })
                : t('cycle.today')}
            </div>
          </div>
        </div>

        {/* Fertile Window */}
        <div className={`flex items-start gap-3 p-3 rounded-lg border ${
          predictions.isInFertileWindow ? 'bg-fertile/10 border-fertile' : 'bg-fertile/5 border-fertile/20'
        }`}>
          <div className="p-2 rounded-full bg-fertile/10">
            <Heart className="h-4 w-4 text-fertile" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-fertile flex items-center gap-2">
              {t('cycle.fertileWindow')}
              {predictions.isInFertileWindow && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-fertile text-white">
                  {t('cycle.now')}
                </span>
              )}
            </div>
            <div className="text-sm font-semibold mt-1">
              {format(predictions.fertileWindowStart, 'MMM d', { locale })} - {format(predictions.fertileWindowEnd, 'MMM d', { locale })}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('cycle.ovulationDate')}: {format(predictions.ovulationDate, 'PPP', { locale })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
