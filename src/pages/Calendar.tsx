import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import BottomNav from '@/components/BottomNav';
import DayLogSheet from '@/components/DayLogSheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CycleDay {
  date: string;
  flow?: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood?: string;
  notes?: string;
}

export default function Calendar() {
  const { t } = useTranslation();
  const { locale, dir } = useI18n();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [cycleDays, setCycleDays] = useState<CycleDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const dateLocale = locale === 'ar' ? ar : enUS;
  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const ForwardIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  useEffect(() => {
    fetchCycleDays();
  }, [currentMonth]);

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

  const getDayStatus = (date: Date) => {
    const cycleDay = cycleDays.find((cd) => isSameDay(new Date(cd.date), date));
    if (cycleDay?.flow) return 'period';
    
    // TODO: Calculate fertile and ovulation days based on cycle data
    return null;
  };

  const getDayDot = (status: string | null) => {
    if (status === 'period') return 'bg-period';
    if (status === 'fertile') return 'bg-fertile';
    if (status === 'ovulation') return 'bg-ovulation';
    return '';
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg z-10 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-to-br from-single-primary to-married-primary text-white">
              {user?.email?.[0].toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <button className="p-2 hover:bg-muted rounded-full transition-colors relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-period rounded-full"></span>
          </button>
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
              const status = getDayStatus(day);
              const dotColor = getDayDot(status);

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-xl
                    transition-all hover:scale-105 relative
                    ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40'}
                    ${isToday ? 'ring-2 ring-primary font-bold' : ''}
                    ${status === 'period' ? 'bg-period/10' : ''}
                    ${status === 'fertile' ? 'bg-fertile/10' : ''}
                    ${status === 'ovulation' ? 'bg-ovulation/10' : ''}
                  `}
                  disabled={!isCurrentMonth}
                >
                  <span className="text-sm">{format(day, 'd')}</span>
                  {dotColor && (
                    <div className={`w-1 h-1 rounded-full ${dotColor} mt-1`}></div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-period"></div>
            <span className="text-muted-foreground">{t('menstrual')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-fertile"></div>
            <span className="text-muted-foreground">{t('fertile', { defaultValue: 'Fertile' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-ovulation"></div>
            <span className="text-muted-foreground">{t('ovulation')}</span>
          </div>
        </div>
      </div>

      {/* Day Log Bottom Sheet */}
      {selectedDate && (
        <DayLogSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          date={selectedDate}
          onSave={fetchCycleDays}
        />
      )}

      <BottomNav />
    </div>
  );
}
