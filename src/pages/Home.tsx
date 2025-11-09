import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Sparkles, Moon, Bell, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import UpcomingBeautyWidget from '@/components/UpcomingBeautyWidget';
import CyclePredictionsWidget from '@/components/CyclePredictionsWidget';
import DailyInsightsCard from '@/components/DailyInsightsCard';
import StatsPreviewWidget from '@/components/StatsPreviewWidget';
import MoodTrackerWidget from '@/components/MoodTrackerWidget';
import SymptomTrackerWidget from '@/components/SymptomTrackerWidget';
import WaterTrackerWidget from '@/components/WaterTrackerWidget';
import AchievementsBadges from '@/components/AchievementsBadges';
import DailyAffirmation from '@/components/DailyAffirmation';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentPhase, setCurrentPhase] = useState('follicular');
  const [daysToNextPeriod, setDaysToNextPeriod] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadCycleData();
      checkNotifications();
    }
  }, [user]);

  const loadCycleData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: latestCycle } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestCycle) {
        const cycleLength = latestCycle.length || 28;
        const periodDuration = latestCycle.duration || 5;
        const startDate = parseISO(latestCycle.start_date);
        const today = new Date();
        const dayInCycle = differenceInDays(today, startDate) % cycleLength;

        let phase = 'follicular';
        if (dayInCycle < periodDuration) {
          phase = 'menstrual';
        } else if (dayInCycle >= periodDuration && dayInCycle < 14) {
          phase = 'follicular';
        } else if (dayInCycle >= 14 && dayInCycle < 16) {
          phase = 'ovulation';
        } else {
          phase = 'luteal';
        }

        setCurrentPhase(phase);

        const nextPeriodDate = new Date(startDate);
        nextPeriodDate.setDate(startDate.getDate() + cycleLength);
        const daysRemaining = differenceInDays(nextPeriodDate, today);
        setDaysToNextPeriod(daysRemaining > 0 ? daysRemaining : 0);
      }
    } catch (error) {
      console.error('Error loading cycle data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkNotifications = async () => {
    if (!user) return;

    const { data: beautyActions } = await supabase
      .from('beauty_actions')
      .select('*')
      .eq('user_id', user.id)
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', new Date().toISOString());

    const { data: fastingEntries } = await supabase
      .from('fasting_entries')
      .select('*')
      .eq('user_id', user.id);

    const count = (beautyActions?.length || 0) + (fastingEntries && fastingEntries.length > 0 ? 1 : 0);
    setNotificationCount(count);
  };

  const handleNotificationClick = () => {
    toast({
      title: t('home.notifications'),
      description: notificationCount > 0 
        ? t('home.notificationDesc', { count: notificationCount })
        : t('home.noNotifications'),
    });
  };

  const getPhaseGradient = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return 'from-period/20 via-destructive/10 to-background';
      case 'follicular':
        return 'from-success/20 via-primary/10 to-background';
      case 'ovulation':
        return 'from-ovulation/20 via-fertile/10 to-background';
      case 'luteal':
        return 'from-fasting/20 via-secondary/10 to-background';
      default:
        return 'from-primary/20 via-secondary/10 to-background';
    }
  };

  const getPhaseEmoji = (phase: string) => {
    switch (phase) {
      case 'menstrual': return '🌙';
      case 'follicular': return '🌱';
      case 'ovulation': return '🌸';
      case 'luteal': return '🍂';
      default: return '✨';
    }
  };

  return (
    <div className={`min-h-screen pb-24 bg-gradient-to-b ${getPhaseGradient(currentPhase)} transition-all duration-1000`}>
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-single-primary via-married-primary to-primary p-6 pb-12 animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <Avatar className="w-16 h-16 hover-scale cursor-pointer border-4 border-white/20 shadow-elegant" onClick={() => navigate('/profile')}>
              <AvatarFallback className="bg-white/10 backdrop-blur-sm text-white text-xl">
                {user?.email?.[0].toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <button 
              onClick={handleNotificationClick}
              className="p-3 hover:bg-white/10 rounded-full transition-all relative backdrop-blur-sm"
            >
              <Bell className="w-6 h-6 text-white" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs bg-period animate-pulse">
                  {notificationCount}
                </Badge>
              )}
            </button>
          </div>
          
          {/* Greeting */}
          <div className="space-y-2 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-2 animate-fade-in">
              {t('greeting', { name: user?.email?.split('@')[0] || t('user') })}
            </h1>
            <p className="text-white/80 text-lg animate-fade-in">
              {t('welcomeMessage')}
            </p>
          </div>

          {/* Phase Badge */}
          {!loading && (
            <div className="mt-6 flex items-center gap-3 animate-fade-in">
              <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-elegant">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getPhaseEmoji(currentPhase)}</span>
                  <div>
                    <p className="text-xs text-white/70">{t('currentPhase')}</p>
                    <p className="text-xl font-bold text-white">{t(currentPhase)}</p>
                  </div>
                </div>
              </div>
              {daysToNextPeriod !== null && (
                <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-elegant">
                  <p className="text-xs text-white/70">{t('daysToNextPeriod')}</p>
                  <p className="text-2xl font-bold text-white">{daysToNextPeriod}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-6 relative z-20">
        {/* Daily Affirmation */}
        {!loading && <DailyAffirmation phase={currentPhase} />}

        {/* Quick Actions - Improved Design */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          <Button 
            variant="outline" 
            className="h-32 flex flex-col gap-3 glass shadow-elegant hover-scale hover:shadow-lg transition-all group border-primary/20"
            onClick={() => navigate('/calendar')}
          >
            <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:scale-110 transition-transform">
              <CalendarDays className="h-7 w-7 text-primary" />
            </div>
            <span className="text-sm font-medium">{t('logToday')}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-32 flex flex-col gap-3 glass shadow-elegant hover-scale hover:shadow-lg transition-all group border-secondary/20"
            onClick={() => navigate('/beauty')}
          >
            <div className="p-3 rounded-full bg-gradient-to-br from-secondary/20 to-success/20 group-hover:scale-110 transition-transform">
              <Sparkles className="h-7 w-7 text-secondary" />
            </div>
            <span className="text-sm font-medium">{t('beautyPlanner')}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-32 flex flex-col gap-3 glass shadow-elegant hover-scale hover:shadow-lg transition-all group border-fasting/20"
            onClick={() => navigate('/fasting-qada')}
          >
            <div className="p-3 rounded-full bg-gradient-to-br from-fasting/20 to-primary/20 group-hover:scale-110 transition-transform">
              <Moon className="h-7 w-7 text-fasting" />
            </div>
            <span className="text-sm font-medium">{t('fastingQada.title')}</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-32 flex flex-col gap-3 glass shadow-elegant hover-scale hover:shadow-lg transition-all group border-info/20"
            onClick={() => navigate('/stats')}
          >
            <div className="p-3 rounded-full bg-gradient-to-br from-info/20 to-success/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-7 w-7 text-info" />
            </div>
            <span className="text-sm font-medium">{t('stats')}</span>
          </Button>
        </div>

        {/* Trackers Section */}
        <div className="space-y-4">
          <MoodTrackerWidget />
          <SymptomTrackerWidget />
          <WaterTrackerWidget />
        </div>

        {/* Daily Insights - AI Powered */}
        {!loading && <DailyInsightsCard phase={currentPhase} />}

        {/* Achievements */}
        <AchievementsBadges />

        {/* Stats Preview */}
        <StatsPreviewWidget />

        {/* Cycle Predictions Widget */}
        <CyclePredictionsWidget />

        {/* Upcoming Beauty Actions Widget */}
        <UpcomingBeautyWidget />
      </div>

      <BottomNav />
    </div>
  );
}
