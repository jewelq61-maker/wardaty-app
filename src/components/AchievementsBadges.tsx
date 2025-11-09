import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, Zap, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  icon: any;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  goal?: number;
}

export default function AchievementsBadges() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch user stats
      const [cycles, cycleDays, moodDays, beautyActions] = await Promise.all([
        supabase.from('cycles').select('id').eq('user_id', user.id),
        supabase.from('cycle_days').select('id').eq('user_id', user.id),
        supabase.from('cycle_days').select('id').eq('user_id', user.id).not('mood', 'is', null),
        supabase.from('beauty_actions').select('id').eq('user_id', user.id),
      ]);

      const cycleCount = cycles.data?.length || 0;
      const dayCount = cycleDays.data?.length || 0;
      const moodCount = moodDays.data?.length || 0;
      const beautyCount = beautyActions.data?.length || 0;

      // Define achievements
      const allAchievements: Achievement[] = [
        {
          id: 'first-cycle',
          icon: Star,
          title: t('achievements.firstCycle'),
          description: t('achievements.firstCycleDesc'),
          unlocked: cycleCount >= 1,
          progress: cycleCount,
          goal: 1,
        },
        {
          id: 'week-tracker',
          icon: Target,
          title: t('achievements.weekTracker'),
          description: t('achievements.weekTrackerDesc'),
          unlocked: dayCount >= 7,
          progress: Math.min(dayCount, 7),
          goal: 7,
        },
        {
          id: 'mood-master',
          icon: Zap,
          title: t('achievements.moodMaster'),
          description: t('achievements.moodMasterDesc'),
          unlocked: moodCount >= 30,
          progress: Math.min(moodCount, 30),
          goal: 30,
        },
        {
          id: 'beauty-guru',
          icon: Award,
          title: t('achievements.beautyGuru'),
          description: t('achievements.beautyGuruDesc'),
          unlocked: beautyCount >= 10,
          progress: Math.min(beautyCount, 10),
          goal: 10,
        },
        {
          id: 'consistency-queen',
          icon: Trophy,
          title: t('achievements.consistencyQueen'),
          description: t('achievements.consistencyQueenDesc'),
          unlocked: cycleCount >= 3,
          progress: Math.min(cycleCount, 3),
          goal: 3,
        },
      ];

      setAchievements(allAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (loading) return null;

  return (
    <Card className="glass shadow-elegant animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            {t('home.achievements')}
          </span>
          <Badge variant="secondary">
            {unlockedCount} / {achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={cn(
                  'relative p-4 rounded-2xl border-2 transition-all',
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-warning/10 to-success/10 border-warning scale-105'
                    : 'bg-muted/50 border-border grayscale opacity-60'
                )}
              >
                <Icon className={cn(
                  'w-8 h-8 mx-auto mb-2',
                  achievement.unlocked ? 'text-warning' : 'text-muted-foreground'
                )} />
                <p className={cn(
                  'text-xs text-center font-medium',
                  achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {achievement.title}
                </p>
                {!achievement.unlocked && achievement.progress !== undefined && (
                  <div className="mt-2">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-warning transition-all"
                        style={{ width: `${(achievement.progress / (achievement.goal || 1)) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      {achievement.progress} / {achievement.goal}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
