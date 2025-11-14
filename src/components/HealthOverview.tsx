import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Droplet, Moon, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface HealthStats {
  cycleDay: number;
  phase: string;
  waterIntake: number;
  mood: string | null;
  symptoms: string[];
  beautyActionsCount: number;
}

export default function HealthOverview() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHealthStats();
    }
  }, [user]);

  const loadHealthStats = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get cycle data
      const { data: lastCycle } = await supabase
        .from('cycles')
        .select('start_date, length, duration')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get today's cycle day data
      const { data: todayData } = await supabase
        .from('cycle_days')
        .select('mood, symptoms, notes')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Get beauty actions count
      const { data: beautyActions } = await supabase
        .from('beauty_actions' as any)
        .select('id')
        .eq('user_id', user.id);

      // Calculate cycle day and phase
      let cycleDay = 1;
      let phase = 'follicular';
      
      if (lastCycle) {
        const startDate = new Date(lastCycle.start_date);
        const diffDays = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        cycleDay = (diffDays % (lastCycle.length || 28)) + 1;

        if (cycleDay <= (lastCycle.duration || 5)) {
          phase = 'menstrual';
        } else if (cycleDay >= 14 && cycleDay <= 16) {
          phase = 'ovulation';
        } else if (cycleDay > 16) {
          phase = 'luteal';
        }
      }

      // Extract water intake from notes
      let waterIntake = 0;
      if (todayData?.notes) {
        const waterMatch = todayData.notes.match(/water:(\d+)/);
        if (waterMatch) {
          waterIntake = parseInt(waterMatch[1]);
        }
      }

      setStats({
        cycleDay,
        phase,
        waterIntake,
        mood: todayData?.mood || null,
        symptoms: todayData?.symptoms || [],
        beautyActionsCount: beautyActions?.length || 0,
      });
    } catch (error) {
      console.error('Error loading health stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return null;

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return 'bg-period/10 text-period border-period/20';
      case 'follicular':
        return 'bg-info/10 text-info border-info/20';
      case 'ovulation':
        return 'bg-ovulation/10 text-ovulation border-ovulation/20';
      case 'luteal':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getPhaseText = (phase: string) => {
    const phases: Record<string, string> = {
      menstrual: 'فترة الحيض',
      follicular: 'المرحلة الجريبية',
      ovulation: 'فترة الإباضة',
      luteal: 'المرحلة الأصفرية',
    };
    return phases[phase] || phase;
  };

  const getMoodEmoji = (mood: string | null) => {
    const moods: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      energetic: '⚡',
      calm: '😌',
      neutral: '😐',
    };
    return mood ? moods[mood] || '😐' : '😐';
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span>نظرة عامة على الصحة</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Cycle Phase */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Moon className="h-4 w-4" />
              <span className="text-sm">المرحلة</span>
            </div>
            <Badge className={cn('w-full justify-center py-2', getPhaseColor(stats.phase))}>
              {getPhaseText(stats.phase)}
            </Badge>
            <p className="text-center text-sm text-muted-foreground">اليوم {stats.cycleDay}</p>
          </div>

          {/* Mood */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span className="text-sm">المزاج</span>
            </div>
            <div className="flex items-center justify-center h-12 bg-muted/50 rounded-lg">
              <span className="text-3xl">{getMoodEmoji(stats.mood)}</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {stats.mood ? t(`moods.${stats.mood}`) : 'لم يُسجل بعد'}
            </p>
          </div>

          {/* Water Intake */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Droplet className="h-4 w-4" />
              <span className="text-sm">الماء</span>
            </div>
            <div className="flex items-center justify-center h-12 bg-muted/50 rounded-lg">
              <span className="text-2xl font-bold text-primary">{stats.waterIntake}</span>
              <span className="text-sm text-muted-foreground mr-1">/ 8</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">كوب اليوم</p>
          </div>

          {/* Beauty Actions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">الجمال</span>
            </div>
            <div className="flex items-center justify-center h-12 bg-muted/50 rounded-lg">
              <span className="text-2xl font-bold text-primary">{stats.beautyActionsCount}</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">إجراء مجدول</p>
          </div>
        </div>

        {/* Symptoms Alert */}
        {stats.symptoms.length > 0 && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-warning">أعراض مسجلة اليوم</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.symptoms.map(s => t(`symptoms.${s}`)).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
