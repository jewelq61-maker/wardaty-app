import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Sparkles, Moon, Bell, BookOpen, Heart } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import UpcomingBeautyWidget from '@/components/UpcomingBeautyWidget';
import CyclePredictionsWidget from '@/components/CyclePredictionsWidget';
import DailyInsightsCard from '@/components/DailyInsightsCard';
import StatsPreviewWidget from '@/components/StatsPreviewWidget';
import MoodTrackerWidget from '@/components/MoodTrackerWidget';

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
      // Get the most recent cycle
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

        // Calculate phase
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

        // Calculate days to next period
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

    // Check for upcoming beauty actions
    const { data: beautyActions } = await supabase
      .from('beauty_actions')
      .select('*')
      .eq('user_id', user.id)
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', new Date().toISOString());

    // Check fasting qada remaining
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

  return (
    <div className="min-h-screen p-4 space-y-6 pb-24 bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <Avatar className="w-12 h-12 hover-scale cursor-pointer" onClick={() => navigate('/profile')}>
          <AvatarFallback className="bg-gradient-to-br from-single-primary to-married-primary text-white">
            {user?.email?.[0].toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <button 
          onClick={handleNotificationClick}
          className="p-2 hover:bg-muted rounded-full transition-colors relative"
        >
          <Bell className="w-6 h-6" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {notificationCount}
            </Badge>
          )}
        </button>
      </div>

      {/* Greeting Card */}
      <Card className="glass shadow-elegant animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {t('greeting', { name: user?.email?.split('@')[0] || t('user') })}
            <Heart className="w-5 h-5 text-period animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            {t('welcomeMessage')}
          </div>
        </CardContent>
      </Card>

      {/* Phase Card - Dynamic */}
      <Card className="glass shadow-elegant bg-gradient-to-br from-single-primary/20 to-married-primary/20 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">{t('currentPhase')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">{t('loading')}</div>
          ) : (
            <>
              <div className="text-3xl font-bold text-primary">
                {t(currentPhase)}
              </div>
              {daysToNextPeriod !== null && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {t('daysToNextPeriod')}: <span className="font-bold text-lg text-primary">{daysToNextPeriod}</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Mood Tracker */}
      <MoodTrackerWidget />

      {/* Daily Insights - AI Powered */}
      {!loading && <DailyInsightsCard phase={currentPhase} />}

      {/* Stats Preview */}
      <StatsPreviewWidget />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in">
        <Button 
          variant="outline" 
          className="h-28 flex flex-col gap-2 glass shadow-elegant hover-scale"
          onClick={() => navigate('/calendar')}
        >
          <CalendarDays className="h-7 w-7 text-primary" />
          <span className="text-sm font-medium">{t('logToday')}</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-28 flex flex-col gap-2 glass shadow-elegant hover-scale"
          onClick={() => navigate('/beauty')}
        >
          <Sparkles className="h-7 w-7 text-secondary" />
          <span className="text-sm font-medium">{t('beautyPlanner')}</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-28 flex flex-col gap-2 glass shadow-elegant hover-scale"
          onClick={() => navigate('/fasting-qada')}
        >
          <Moon className="h-7 w-7 text-fasting" />
          <span className="text-sm font-medium">{t('fastingQada.title')}</span>
        </Button>

        <Button 
          variant="outline" 
          className="h-28 flex flex-col gap-2 glass shadow-elegant hover-scale"
          onClick={() => navigate('/articles')}
        >
          <BookOpen className="h-7 w-7 text-muted-foreground" />
          <span className="text-sm font-medium">{t('articles')}</span>
        </Button>
      </div>

      {/* Cycle Predictions Widget */}
      <CyclePredictionsWidget />

      {/* Upcoming Beauty Actions Widget */}
      <UpcomingBeautyWidget />

      <BottomNav />
    </div>
  );
}