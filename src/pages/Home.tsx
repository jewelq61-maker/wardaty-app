import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Sparkles, Moon, Bell, TrendingUp, RefreshCw, BookOpen, ChevronRight, Shield } from 'lucide-react';
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
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadCycleData();
      checkNotifications();
      loadFeaturedArticles();
    }
  }, [user, locale]);

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
      className="min-h-screen pb-32 bg-background overflow-y-auto"
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
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
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
        {/* Phase Status Card */}
        {!loading && (
          <div className="glass rounded-3xl p-6 shadow-lg bg-gradient-to-br from-primary/10 via-secondary/5 to-background animate-fade-in border border-primary/20 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg border border-primary/20">
                  {getPhaseEmoji(currentPhase)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{t('currentPhase')}</p>
                  <p className="text-xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t(currentPhase)}</p>
                </div>
              </div>
              {daysToNextPeriod !== null && (
                <div className="text-right bg-background/50 backdrop-blur-sm rounded-2xl p-3 border border-border/50 shadow-sm">
                  <p className="text-3xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">{daysToNextPeriod}</p>
                  <p className="text-xs text-muted-foreground font-medium">{t('daysToNextPeriod')}</p>
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            {daysToNextPeriod !== null && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                  <span>{t('menstrual')}</span>
                  <span>{t('ovulation')}</span>
                </div>
                <div className="h-3 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm border border-border/50">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-secondary to-primary transition-all duration-1000 rounded-full shadow-lg relative"
                    style={{ width: `${Math.max(0, Math.min(100, ((28 - daysToNextPeriod) / 28) * 100))}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Daily Affirmation */}
        {!loading && <DailyAffirmation phase={currentPhase} />}

        {/* Quick Actions Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground">{t('quickActions')}</h3>
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/calendar')}
              className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-fertile/10 to-fertile/5 hover:from-fertile/15 hover:to-fertile/10 transition-all duration-300 border-2 border-fertile/30 hover:border-fertile/50 hover:shadow-xl hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-fertile/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CalendarDays className="w-8 h-8 text-fertile mb-3 relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-transform" />
              <p className="text-sm font-semibold text-foreground relative z-10">{t('logToday')}</p>
            </button>
            
            <button
              onClick={() => navigate('/beauty')}
              className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-ovulation/10 to-ovulation/5 hover:from-ovulation/15 hover:to-ovulation/10 transition-all duration-300 border-2 border-ovulation/30 hover:border-ovulation/50 hover:shadow-xl hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-ovulation/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Sparkles className="w-8 h-8 text-ovulation mb-3 relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
              <p className="text-sm font-semibold text-foreground relative z-10">{t('beautyPlanner')}</p>
            </button>
            
            <button
              onClick={() => navigate('/fasting-qada')}
              className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-period/10 to-period/5 hover:from-period/15 hover:to-period/10 transition-all duration-300 border-2 border-period/30 hover:border-period/50 hover:shadow-xl hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-period/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Moon className="w-8 h-8 text-period mb-3 relative z-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform" />
              <p className="text-sm font-semibold text-foreground relative z-10">{t('fastingQada.title')}</p>
            </button>

            <button
              onClick={() => navigate('/stats')}
              className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-info/10 to-info/5 hover:from-info/15 hover:to-info/10 transition-all duration-300 border-2 border-info/30 hover:border-info/50 hover:shadow-xl hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-info/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <TrendingUp className="w-8 h-8 text-info mb-3 relative z-10 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold text-foreground relative z-10">{t('stats')}</p>
            </button>

            <button
              onClick={() => navigate('/articles')}
              className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-fasting/10 to-fasting/5 hover:from-fasting/15 hover:to-fasting/10 transition-all duration-300 border-2 border-fasting/30 hover:border-fasting/50 hover:shadow-xl hover:scale-[1.02] active:scale-95 col-span-2"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-fasting/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <BookOpen className="w-8 h-8 text-fasting mb-3 relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
              <p className="text-sm font-semibold text-foreground relative z-10">{t('articles')}</p>
            </button>
          </div>
        </div>

        {/* Today's Tracking */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground">{t('todayTracking')}</h3>
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          </div>
          <div className="space-y-3">
            <MoodTrackerWidget />
            <SymptomTrackerWidget />
            <WaterTrackerWidget />
          </div>
        </div>

        {/* Insights & Achievements */}
        <div className="space-y-3">
          {!loading && <DailyInsightsCard phase={currentPhase} />}
          <AchievementsBadges />
        </div>

        {/* Overview Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground">{t('overview')}</h3>
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          </div>
          <div className="space-y-3">
            <StatsPreviewWidget />
            <CyclePredictionsWidget />
            <UpcomingBeautyWidget />
          </div>
        </div>

        {/* Featured Articles Section */}
        {featuredArticles.length > 0 && (
          <div className="pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                {t('articles')}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/articles')}
                className="text-primary hover:text-primary/80 h-8"
              >
                {t('home.viewAll')}
                <ChevronRight className="w-4 h-4 mr-1" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {featuredArticles.map((article) => (
                <Card
                  key={article.id}
                  onClick={() => navigate('/articles')}
                  className="glass hover:shadow-lg transition-all cursor-pointer border-border/50 rounded-2xl overflow-hidden group bg-gradient-to-br from-background to-muted/20"
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
                    <CardTitle className="text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
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
