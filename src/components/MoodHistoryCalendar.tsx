import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { DayContentProps } from 'react-day-picker';

interface MoodData {
  [date: string]: string;
}

const moodColors: { [key: string]: { bg: string; text: string; label: string; labelAr: string } } = {
  happy: { bg: 'bg-success', text: 'text-success', label: 'Happy', labelAr: 'سعيد' },
  neutral: { bg: 'bg-muted-foreground', text: 'text-muted-foreground', label: 'Neutral', labelAr: 'محايد' },
  low: { bg: 'bg-secondary', text: 'text-secondary', label: 'Low', labelAr: 'منخفض' },
  tired: { bg: 'bg-primary', text: 'text-primary', label: 'Tired', labelAr: 'متعب' },
  anxious: { bg: 'bg-destructive', text: 'text-destructive', label: 'Anxious', labelAr: 'قلق' },
};

export default function MoodHistoryCalendar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { locale } = useI18n();
  const [moodData, setMoodData] = useState<MoodData>({});
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const dateLocale = locale === 'ar' ? ar : enUS;

  useEffect(() => {
    if (user && open) {
      loadMoodData();
    }
  }, [user, selectedMonth, open]);

  const loadMoodData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const monthStart = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

      const { data } = await supabase
        .from('cycle_days')
        .select('date, mood')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .not('mood', 'is', null);

      if (data) {
        const moodMap: MoodData = {};
        data.forEach((entry) => {
          moodMap[entry.date] = entry.mood;
        });
        setMoodData(moodMap);
      }
    } catch (error) {
      console.error('Error loading mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const customDayContent = (props: DayContentProps) => {
    const dateStr = format(props.date, 'yyyy-MM-dd');
    const mood = moodData[dateStr];
    const moodColor = mood ? moodColors[mood] : null;

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span className={moodColor ? moodColor.text : ''}>{props.date.getDate()}</span>
        {moodColor && (
          <div className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${moodColor.bg}`} />
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <CalendarDays className="w-4 h-4 mr-2" />
          {t('home.viewMoodHistory')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('home.moodHistory')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMonthChange('prev')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="text-lg font-medium">
              {format(selectedMonth, 'MMMM yyyy', { locale: dateLocale })}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMonthChange('next')}
              disabled={selectedMonth >= new Date()}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              locale={dateLocale}
              disabled={(date) => date > new Date()}
              components={{
                DayContent: customDayContent,
              }}
              className="rounded-md border pointer-events-auto"
            />
          </div>

          {/* Legend */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('home.moodLegend')}</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(moodColors).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${value.bg}`} />
                  <span className="text-sm">{locale === 'ar' ? value.labelAr : value.label}</span>
                </div>
              ))}
            </div>
          </div>

          {loading && (
            <div className="text-center text-sm text-muted-foreground">
              {t('loading')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
