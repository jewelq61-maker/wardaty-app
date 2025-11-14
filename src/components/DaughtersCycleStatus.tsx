import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Baby, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInDays, format, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Daughter {
  id: string;
  name: string;
  is_pregnant: boolean;
  pregnancy_lmp: string | null;
  pregnancy_edd: string | null;
}

interface DaughterCycleInfo extends Daughter {
  cycleStatus: 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';
  currentDay: number | null;
  daysToNext: number | null;
  gestationalWeeks?: number;
  gestationalDays?: number;
}

export default function DaughtersCycleStatus() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [daughters, setDaughters] = useState<DaughterCycleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDaughters();
    }
  }, [user]);

  const calculateGestationalAge = (lmp: string): { weeks: number; days: number } => {
    const lmpDate = new Date(lmp);
    const today = new Date();
    const totalDays = differenceInDays(today, lmpDate);
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;
    return { weeks, days };
  };

  const getCyclePhase = (dayInCycle: number, periodDuration: number = 5): string => {
    if (dayInCycle < periodDuration) return 'menstrual';
    if (dayInCycle >= periodDuration && dayInCycle < 14) return 'follicular';
    if (dayInCycle >= 14 && dayInCycle < 16) return 'ovulation';
    return 'luteal';
  };

  const loadDaughters = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: daughtersData } = await supabase
        .from('daughters')
        .select('id, name, is_pregnant, pregnancy_lmp, pregnancy_edd')
        .eq('mother_id', user.id)
        .order('name');

      if (daughtersData) {
        const daughtersWithCycleInfo = await Promise.all(
          daughtersData.map(async (daughter) => {
            if (daughter.is_pregnant && daughter.pregnancy_lmp) {
              const gestationalAge = calculateGestationalAge(daughter.pregnancy_lmp);
              return {
                ...daughter,
                cycleStatus: 'unknown' as const,
                currentDay: null,
                daysToNext: null,
                gestationalWeeks: gestationalAge.weeks,
                gestationalDays: gestationalAge.days,
              };
            }

            const { data: latestCycle } = await supabase
              .from('daughter_cycles')
              .select('start_date, length, duration')
              .eq('daughter_id', daughter.id)
              .order('start_date', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (latestCycle) {
              const cycleLength = latestCycle.length || 28;
              const periodDuration = latestCycle.duration || 5;
              const startDate = new Date(latestCycle.start_date);
              const today = new Date();
              const dayInCycle = differenceInDays(today, startDate) % cycleLength;
              const phase = getCyclePhase(dayInCycle, periodDuration);

              const nextPeriodDate = addDays(startDate, cycleLength);
              const daysRemaining = differenceInDays(nextPeriodDate, today);

              return {
                ...daughter,
                cycleStatus: phase as any,
                currentDay: dayInCycle + 1,
                daysToNext: daysRemaining > 0 ? daysRemaining : 0,
              };
            }

            return {
              ...daughter,
              cycleStatus: 'unknown' as const,
              currentDay: null,
              daysToNext: null,
            };
          })
        );

        setDaughters(daughtersWithCycleInfo);
      }
    } catch (error) {
      console.error('Error loading daughters cycle status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'follicular':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'ovulation':
        return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      case 'luteal':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return <Droplets className="h-4 w-4" />;
      case 'follicular':
      case 'ovulation':
      case 'luteal':
        return <CalendarIcon className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            {t('common.loading')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (daughters.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">{t('pregnancy.daughtersCycleStatus')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {daughters.map((daughter) => (
          <div
            key={daughter.id}
            className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{daughter.name}</h4>
              {daughter.is_pregnant ? (
                <Badge className="bg-gradient-to-r from-pink-400 to-purple-500 text-white border-0">
                  <Baby className="h-3 w-3 mr-1" />
                  {t('pregnancy.pregnant')}
                </Badge>
              ) : (
                <Badge className={getPhaseColor(daughter.cycleStatus)}>
                  {getPhaseIcon(daughter.cycleStatus)}
                  <span className="mr-1">
                    {t(`cyclePhases.${daughter.cycleStatus}`)}
                  </span>
                </Badge>
              )}
            </div>

            {daughter.is_pregnant && daughter.gestationalWeeks !== undefined ? (
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  {t('pregnancy.week')}: {daughter.gestationalWeeks}+{daughter.gestationalDays}
                </p>
                {daughter.pregnancy_edd && (
                  <p className="text-muted-foreground">
                    {t('pregnancy.dueDate')}:{' '}
                    {format(new Date(daughter.pregnancy_edd), 'PPP', { locale: ar })}
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {daughter.currentDay !== null && (
                  <div>
                    <p className="text-muted-foreground text-xs">{t('pregnancy.cycleDay')}</p>
                    <p className="font-semibold">{daughter.currentDay}</p>
                  </div>
                )}
                {daughter.daysToNext !== null && (
                  <div>
                    <p className="text-muted-foreground text-xs">{t('pregnancy.daysToNext')}</p>
                    <p className="font-semibold">{daughter.daysToNext}</p>
                  </div>
                )}
                {daughter.currentDay === null && daughter.daysToNext === null && (
                  <p className="text-muted-foreground text-xs col-span-2">
                    {t('pregnancy.noCycleData')}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
