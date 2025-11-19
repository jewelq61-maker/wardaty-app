import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Sparkles, Moon, Bell, TrendingUp, RefreshCw, BookOpen, ChevronRight, Shield, Heart } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/contexts/I18nContext';
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
import FastingQadaWidget from '@/components/FastingQadaWidget';
import DaughtersCycleStatus from '@/components/DaughtersCycleStatus';
import HealthOverview from '@/components/HealthOverview';
import PregnancyStatusWidget from '@/components/PregnancyStatusWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Article {
  id: string;
  title: string;
  body: string;
  category: string;
  source?: string;
}

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentPhase, setCurrentPhase] = useState('follicular');
  const [daysToNextPeriod, setDaysToNextPeriod] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [persona, setPersona] = useState<string>('single');
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadUserPersona();
      loadCycleData();
      checkNotifications();
      loadFeaturedArticles();
    }
  }, [user, locale]);

  const loadUserPersona = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('persona')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setPersona(data.persona || 'single');
    }
  };

  const loadCycleData = async () => {
    if (!user) return;
    
    // Partners don't have their own cycle - they view partner's cycle
    if (persona === 'partner') {
      setLoading(false);
      return;
    }
    
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

  const loadFeaturedArticles = async () => {
    try {
      const { data } = await supabase
        .from('articles')
        .select('id, title, body, category, source')
        .eq('lang', locale)
        .order('created_at', { ascending: false })
        .limit(3);

      if (data) {
        setFeaturedArticles(data);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadCycleData(), checkNotifications()]);
    setIsRefreshing(false);
    setPullDistance(0);
    toast({
      title: t('success'),
      description: t('home.dataRefreshed'),
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current || containerRef.current.scrollTop > 0 || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    if (distance > 0) {
      setPullDistance(Math.min(distance, 120));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 80 && !isRefreshing) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basics':
        return 'bg-info/10 text-info border-info/20';
      case 'wellness':
        return 'bg-fertile/10 text-fertile border-fertile/20';
      case 'beauty':
        return 'bg-ovulation/10 text-ovulation border-ovulation/20';
      case 'fertility':
        return 'bg-period/10 text-period border-period/20';
      case 'rulings':
        return 'bg-fasting/10 text-fasting border-fasting/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen pb-24 gradient-bg overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-300"
        style={{ 
          height: pullDistance,
          opacity: pullDistance / 80,
        }}
      >
        <div className="flex items-center gap-2 text-primary">
          <RefreshCw 
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          />
          <span className="text-sm font-medium">
            {pullDistance > 80 ? t('home.releaseToRefresh') : t('home.pullToRefresh')}
          </span>
        </div>
      </div>

      {/* Compact Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 hover-scale cursor-pointer ring-2 ring-primary/20" onClick={() => navigate('/profile')}>
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-semibold">
                {user?.email?.[0].toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {t('greeting', { name: user?.email?.split('@')[0] || t('user') })}
              </h2>
              <p className="text-xs text-muted-foreground">{t('welcomeMessage')}</p>
            </div>
          </div>
          
          <button 
            onClick={handleNotificationClick}
            className="relative p-2 hover:bg-muted rounded-full transition-colors"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-period animate-pulse border-2 border-background">
                {notificationCount}
              </Badge>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        {/* Partner View - Show partner's info card */}
        {persona === 'partner' && (
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-partner/10 flex items-center justify-center text-2xl">
                💙
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('personas.partner')}</p>
                <p className="text-lg font-bold text-foreground">{t('home.partnerMode')}</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {t('home.partnerModeDesc')}
            </p>

            <button
              onClick={() => navigate('/partner-view')}
              className="w-full bg-partner text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-partner/90 transition-colors flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              {t('home.viewPartnerCycle')}
            </button>
          </div>
        )}

        {/* Phase Status Card - Not for partners */}
        {!loading && persona !== 'partner' && (
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                  {getPhaseEmoji(currentPhase)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('currentPhase')}</p>
                  <p className="text-lg font-bold text-foreground">{t(currentPhase)}</p>
                </div>
              </div>
              {daysToNextPeriod !== null && (
                <div className="text-center bg-primary/5 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-primary">{daysToNextPeriod}</p>
                  <p className="text-xs text-muted-foreground">{t('daysToNextPeriod')}</p>
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            {daysToNextPeriod !== null && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                  <span>{t('menstrual')}</span>
                  <span>{t('ovulation')}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, ((28 - daysToNextPeriod) / 28) * 100))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Log Today Button */}
            <button
              onClick={() => navigate('/calendar')}
              className="mt-4 w-full bg-primary text-primary-foreground rounded-xl py-3 px-4 font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              {t('logToday')}
            </button>
          </div>
        )}

        {/* Daily Affirmation - Not for partners */}
        {!loading && persona !== 'partner' && <DailyAffirmation phase={currentPhase} />}

        {/* Pregnancy/Postpartum/Breastfeeding Status - Not for partners */}
        {!loading && persona !== 'partner' && <PregnancyStatusWidget />}

        {/* Health Overview */}
        {!loading && <HealthOverview />}

        {/* Quick Actions Grid */}
        <div>
          <h3 className="text-base font-bold text-foreground mb-4">{t('quickActions')}</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/beauty')}
              className="bg-card rounded-2xl p-5 border border-border hover:bg-accent transition-colors text-start"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{t('beautyPlanner')}</p>
            </button>
            
            <button
              onClick={() => navigate('/calendar')}
              className="bg-card rounded-2xl p-5 border border-border hover:bg-accent transition-colors text-start"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{t('calendar')}</p>
            </button>
            
            <button
              onClick={() => navigate('/fasting-qada')}
              className="bg-card rounded-2xl p-5 border border-border hover:bg-accent transition-colors text-start"
            >
              <div className="w-10 h-10 rounded-xl bg-period/10 flex items-center justify-center mb-3">
                <Moon className="w-5 h-5 text-period" />
              </div>
              <p className="text-sm font-semibold text-foreground">{t('fastingQada.title')}</p>
            </button>

            <button
              onClick={() => navigate('/articles')}
              className="bg-card rounded-2xl p-5 border border-border hover:bg-accent transition-colors text-start"
            >
              <div className="w-10 h-10 rounded-xl bg-fasting/10 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-fasting" />
              </div>
              <p className="text-sm font-semibold text-foreground">{t('articles')}</p>
            </button>
          </div>
        </div>

        {/* Today's Tracking */}
        <div>
          <h3 className="text-base font-bold text-foreground mb-4">{t('todayTracking')}</h3>
          <div className="space-y-3">
            <MoodTrackerWidget />
            <SymptomTrackerWidget />
            <WaterTrackerWidget />
          </div>
        </div>

        {/* Insights & Achievements */}
        <div className="space-y-3">
          {!loading && persona !== 'partner' && <DailyInsightsCard phase={currentPhase} />}
          <AchievementsBadges />
        </div>

        {/* Overview Section */}
        <div>
          <h3 className="text-base font-bold text-foreground mb-4">{t('overview')}</h3>
          <div className="space-y-3">
            {persona === 'mother' && <DaughtersCycleStatus />}
            <FastingQadaWidget />
            {persona !== 'partner' && <StatsPreviewWidget />}
            {persona !== 'partner' && <CyclePredictionsWidget />}
            {persona !== 'partner' && <UpcomingBeautyWidget />}
          </div>
        </div>

        {/* Featured Articles Section */}
        {featuredArticles.length > 0 && (
          <div className="pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                {t('articles')}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/articles')}
                className="text-xs"
              >
                {t('home.viewAll')}
              </Button>
            </div>
            
            <div className="space-y-3">
              {featuredArticles.map((article) => (
                <Card
                  key={article.id}
                  onClick={() => navigate('/articles')}
                  className="bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={`${getCategoryColor(article.category)} text-xs`}
                      >
                        {t(`categories.${article.category}`)}
                      </Badge>
                      {article.source && article.category === 'rulings' && (
                        <Badge variant="outline" className="text-xs gap-1 bg-success/10 text-success border-success/30">
                          <Shield className="w-2.5 h-2.5" />
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base leading-snug line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {article.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
