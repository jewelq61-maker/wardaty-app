import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, differenceInDays, addDays } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import DayLogSheet from '@/components/DayLogSheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  calculateBeautyRecommendation,
  type BeautyCategory,
  type CyclePhase as BeautyCyclePhase
} from '@/utils/beautyCalculations';

interface CycleDay {
  date: string;
  flow?: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood?: string;
  notes?: string;
}

interface Cycle {
  start_date: string;
  length: number;
  duration: number;
}

type PhaseType = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | null;

export default function Calendar() {
  const { t } = useTranslation();
  const { locale, dir } = useI18n();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [cycleDays, setCycleDays] = useState<CycleDay[]>([]);
  const [lastCycle, setLastCycle] = useState<Cycle | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [beautyRecommendations, setBeautyRecommendations] = useState<Map<string, number>>(new Map());

  const dateLocale = locale === 'ar' ? ar : enUS;
  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const ForwardIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  useEffect(() => {
    fetchCycleDays();
    fetchLastCycle();
    checkPremiumStatus();
  }, [currentMonth, user]);

  useEffect(() => {
    if (isPremium && lastCycle) {
      calculateBeautyScores();
    }
  }, [isPremium, lastCycle, currentMonth]);

  const checkPremiumStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();
    
    setIsPremium(data?.is_premium || false);
  };

  const calculateBeautyScores = async () => {
    if (!lastCycle) return;
    
    const scores = new Map<string, number>();
    const categories: BeautyCategory[] = ['haircut', 'waxing', 'facial', 'microneedling'];
    
    calendarDays.forEach(day => {
      if (!isSameMonth(day, currentMonth)) return;
      
      const phase = getPhaseForDate(day) as BeautyCyclePhase;
      if (!phase) return;
      
      let maxScore = 0;
      categories.forEach(category => {
        const recommendation = calculateBeautyRecommendation(
          category,
          phase,
          day
        );
        if (recommendation.score > maxScore) {
          maxScore = recommendation.score;
        }
      });
      
      if (maxScore >= 70) {
        scores.set(format(day, 'yyyy-MM-dd'), maxScore);
      }
    });
    
    setBeautyRecommendations(scores);
  };

  const fetchLastCycle = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('cycles')
      .select('start_date, length, duration')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setLastCycle(data);
    }
  };

  const fetchCycleDays = async () => {
    if (!user) return;

    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    const { data } = await supabase
      .from('cycle_days')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end);

    if (data) {
      setCycleDays(data as CycleDay[]);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: dateLocale });
  const calendarEnd = endOfWeek(monthEnd, { locale: dateLocale });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2024, 0, i + 1); // Start from Monday
    return format(date, 'EEEEEE', { locale: dateLocale });
  });

  const getPhaseForDate = (date: Date): PhaseType => {
    if (!lastCycle) return null;

    const lastPeriodStart = new Date(lastCycle.start_date);
    const cycleLength = lastCycle.length || 28;
    const periodDuration = lastCycle.duration || 5;
    
    // Check logged period days first
    const cycleDay = cycleDays.find((cd) => isSameDay(new Date(cd.date), date));
    if (cycleDay?.flow) return 'menstrual';

    // Calculate current cycle day
    const daysSinceLastPeriod = differenceInDays(date, lastPeriodStart);
    const currentCycleDay = ((daysSinceLastPeriod % cycleLength) + cycleLength) % cycleLength;

    // Determine phase
    if (currentCycleDay < periodDuration) {
      return 'menstrual';
    } else if (currentCycleDay < 14) {
      return 'follicular';
    } else if (currentCycleDay >= 14 && currentCycleDay <= 16) {
      return 'ovulation';
    } else if (currentCycleDay > 16) {
      return 'luteal';
    }

    return null;
  };

  const getPhaseColor = (phase: PhaseType) => {
    switch (phase) {
      case 'menstrual':
        return 'bg-period/20 border-period/30';
      case 'follicular':
        return 'bg-info/20 border-info/30';
      case 'ovulation':
        return 'bg-ovulation/20 border-ovulation/30';
      case 'luteal':
        return 'bg-warning/20 border-warning/30';
      default:
        return '';
    }
  };

  const getPhaseDot = (phase: PhaseType) => {
    switch (phase) {
      case 'menstrual':
        return 'bg-period';
      case 'follicular':
        return 'bg-info';
      case 'ovulation':
        return 'bg-ovulation';
      case 'luteal':
        return 'bg-warning';
      default:
        return '';
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsSheetOpen(true);
  };

  return (
    <div className="min-h-screen gradient-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-card/80 backdrop-blur-lg z-10 border-b border-border/50">
        <div className="p-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 shadow-elegant">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                {user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-bold text-foreground">{t('calendar.title')}</h1>
              <p className="text-sm text-muted-foreground">{format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Month Navigation */}
        <Card className="glass shadow-elegant p-4">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <BackIcon className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold">
              {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
            </h2>
            
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ForwardIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const phase = getPhaseForDate(day);
              const phaseColor = getPhaseColor(phase);
              const phaseDot = getPhaseDot(phase);
              const hasLog = cycleDays.some((cd) => isSameDay(new Date(cd.date), day));
              const dateKey = format(day, 'yyyy-MM-dd');
              const beautyScore = beautyRecommendations.get(dateKey);
              const hasHighBeautyScore = isPremium && beautyScore && beautyScore >= 70;

              return (
                <button
                  key={index}
                  onClick={() => isCurrentMonth && handleDayClick(day)}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-xl
                    transition-all hover:scale-105 relative border-2
                    ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40 opacity-50'}
                    ${isToday ? 'ring-2 ring-primary ring-offset-2 font-bold' : 'border-transparent'}
                    ${isCurrentMonth && phase ? phaseColor : ''}
                    ${hasLog ? 'font-semibold' : ''}
                  `}
                  disabled={!isCurrentMonth}
                >
                  <span className="text-sm">{format(day, 'd')}</span>
                  <div className="flex items-center gap-1 mt-1">
                    {isCurrentMonth && phaseDot && (
                      <div className={`w-1.5 h-1.5 rounded-full ${phaseDot}`}></div>
                    )}
                    {hasHighBeautyScore && (
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        beautyScore >= 90 ? 'bg-warning animate-pulse' : 
                        beautyScore >= 80 ? 'bg-primary' : 
                        'bg-info'
                      }`}></div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Phase Legend */}
        <Card className="glass shadow-elegant p-4">
          <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
            {t('cycle.phases')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-period"></div>
              <span className="text-sm">{t('menstrual')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-info"></div>
              <span className="text-sm">{t('follicular')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-ovulation"></div>
              <span className="text-sm">{t('ovulation')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span className="text-sm">{t('luteal')}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Day Log Bottom Sheet */}
      {selectedDate && (
        <DayLogSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          date={selectedDate}
          cyclePhase={getPhaseForDate(selectedDate) as any}
          onSave={fetchCycleDays}
        />
      )}

      <BottomNav />
    </div>
  );
}
