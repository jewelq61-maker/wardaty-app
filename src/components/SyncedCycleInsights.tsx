import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';

type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

interface SyncedCycleInsightsProps {
  partnerId: string;
}

export default function SyncedCycleInsights({ partnerId }: SyncedCycleInsightsProps) {
  const { t } = useTranslation();
  const [userPhase, setUserPhase] = useState<CyclePhase | null>(null);
  const [partnerPhase, setPartnerPhase] = useState<CyclePhase | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'close' | 'different'>('different');
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadCycleData();
  }, [partnerId]);

  const loadCycleData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get both users' recent cycle days
      const [userDays, partnerDays] = await Promise.all([
        supabase
          .from('cycle_days')
          .select('date, flow')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30),
        supabase
          .from('cycle_days')
          .select('date, flow')
          .eq('user_id', partnerId)
          .order('date', { ascending: false })
          .limit(30),
      ]);

      if (userDays.data && partnerDays.data) {
        const userCurrentPhase = calculatePhase(userDays.data);
        const partnerCurrentPhase = calculatePhase(partnerDays.data);
        
        setUserPhase(userCurrentPhase);
        setPartnerPhase(partnerCurrentPhase);
        
        // Determine sync status
        const status = determineSyncStatus(userCurrentPhase, partnerCurrentPhase);
        setSyncStatus(status);
        
        // Generate insights
        const generatedInsights = generateInsights(userCurrentPhase, partnerCurrentPhase, status);
        setInsights(generatedInsights);
      }
    } catch (error) {
      console.error('Error loading cycle data:', error);
    }
  };

  const calculatePhase = (cycleDays: any[]): CyclePhase => {
    const lastPeriodDay = cycleDays.find(day => day.flow && day.flow !== 'none');
    if (!lastPeriodDay) return 'follicular';

    const daysSinceLastPeriod = differenceInDays(new Date(), new Date(lastPeriodDay.date));
    
    if (daysSinceLastPeriod >= 0 && daysSinceLastPeriod <= 5) return 'menstrual';
    if (daysSinceLastPeriod > 5 && daysSinceLastPeriod <= 13) return 'follicular';
    if (daysSinceLastPeriod > 13 && daysSinceLastPeriod <= 16) return 'ovulation';
    return 'luteal';
  };

  const determineSyncStatus = (phase1: CyclePhase, phase2: CyclePhase): 'synced' | 'close' | 'different' => {
    if (phase1 === phase2) return 'synced';
    
    const phases: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];
    const index1 = phases.indexOf(phase1);
    const index2 = phases.indexOf(phase2);
    const diff = Math.abs(index1 - index2);
    
    return diff === 1 ? 'close' : 'different';
  };

  const generateInsights = (userPhase: CyclePhase, partnerPhase: CyclePhase, status: string): string[] => {
    const insights: string[] = [];

    if (status === 'synced') {
      insights.push(t('profilePage.insights.perfectSync'));
      
      if (userPhase === 'menstrual') {
        insights.push(t('profilePage.insights.menstrualTogether'));
      } else if (userPhase === 'ovulation') {
        insights.push(t('profilePage.insights.ovulationTogether'));
      } else if (userPhase === 'follicular') {
        insights.push(t('profilePage.insights.follicularTogether'));
      } else {
        insights.push(t('profilePage.insights.lutealTogether'));
      }
    } else if (status === 'close') {
      insights.push(t('profilePage.insights.closeSync'));
      insights.push(t('profilePage.insights.considerTiming'));
    } else {
      insights.push(t('profilePage.insights.differentPhases'));
      
      if ((userPhase === 'menstrual' && partnerPhase === 'ovulation') || 
          (userPhase === 'ovulation' && partnerPhase === 'menstrual')) {
        insights.push(t('profilePage.insights.oppositePhases'));
      }
    }

    return insights;
  };

  const getPhaseColor = (phase: CyclePhase) => {
    const colors = {
      menstrual: 'bg-period/10 text-period border-period/30',
      follicular: 'bg-success/10 text-success border-success/30',
      ovulation: 'bg-fertile/10 text-fertile border-fertile/30',
      luteal: 'bg-fasting/10 text-fasting border-fasting/30'
    };
    return colors[phase];
  };

  const getSyncBadgeVariant = (status: string) => {
    if (status === 'synced') return 'default';
    if (status === 'close') return 'secondary';
    return 'outline';
  };

  if (!userPhase || !partnerPhase) {
    return null;
  }

  return (
    <Card className="glass shadow-elegant animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          {t('profilePage.cycleSync.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t('profilePage.cycleSync.status')}</span>
          </div>
          <Badge variant={getSyncBadgeVariant(syncStatus)} className="gap-1">
            {syncStatus === 'synced' && '🎯'}
            {syncStatus === 'close' && '📍'}
            {syncStatus === 'different' && '🔄'}
            {t(`profilePage.cycleSync.${syncStatus}`)}
          </Badge>
        </div>

        {/* Phase Comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg border ${getPhaseColor(userPhase)}`}>
            <p className="text-xs font-medium mb-1">{t('profilePage.cycleSync.you')}</p>
            <p className="text-sm font-semibold">{t(`phases.${userPhase}`)}</p>
          </div>
          <div className={`p-3 rounded-lg border ${getPhaseColor(partnerPhase)}`}>
            <p className="text-xs font-medium mb-1">{t('profilePage.cycleSync.partner')}</p>
            <p className="text-sm font-semibold">{t(`phases.${partnerPhase}`)}</p>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t('profilePage.cycleSync.insights')}</span>
          </div>
          {insights.map((insight, index) => (
            <div 
              key={index}
              className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg"
            >
              {insight}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
