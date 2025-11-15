import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function CycleSetup() {
  const { t } = useTranslation();
  const { dir } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lastPeriodDate, setLastPeriodDate] = useState<Date>();
  const [cycleLength, setCycleLength] = useState('28');
  const [periodDuration, setPeriodDuration] = useState('5');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Remove persona theme for onboarding - use default theme
    const root = document.documentElement;
    root.removeAttribute('data-persona');
  }, []);

  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  const handleComplete = async () => {
    if (!lastPeriodDate) {
      toast({
        title: t('error'),
        description: t('onboarding.lastPeriodDate'),
        variant: 'destructive',
      });
      return;
    }

    // Validate cycle inputs
    const cycleLengthNum = parseInt(cycleLength);
    const periodDurationNum = parseInt(periodDuration);
    
    if (isNaN(cycleLengthNum) || cycleLengthNum < 21 || cycleLengthNum > 45) {
      toast({
        title: t('error'),
        description: 'Cycle length must be between 21 and 45 days',
        variant: 'destructive',
      });
      return;
    }
    
    if (isNaN(periodDurationNum) || periodDurationNum < 1 || periodDurationNum > 10) {
      toast({
        title: t('error'),
        description: 'Period duration must be between 1 and 10 days',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Create initial cycle record
        const { error } = await supabase.from('cycles').insert({
          user_id: user.id,
          start_date: format(lastPeriodDate, 'yyyy-MM-dd'),
          length: cycleLengthNum,
          duration: periodDurationNum,
        });

        if (error) throw error;

        // Update profile - get persona from database instead of localStorage
        const { data: profile } = await supabase
          .from('profiles')
          .select('persona')
          .eq('id', user.id)
          .single();
        
        // Only update if persona is not already set (for backward compatibility)
        if (!profile?.persona) {
          const persona = localStorage.getItem('selectedPersona') || 'single';
          await supabase.from('profiles').update({ persona }).eq('id', user.id);
        }
        
        // Clean up localStorage
        localStorage.removeItem('selectedPersona');

        toast({
          title: t('success'),
          description: t('onboarding.complete'),
        });

        navigate('/auth');
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/onboarding/language')}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <BackIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{t('onboarding.setupCycle')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('onboarding.setupSubtitle')}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Last Period Date */}
          <div className="space-y-2">
            <Label>{t('onboarding.lastPeriodDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal h-12',
                    !lastPeriodDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {lastPeriodDate ? (
                    format(lastPeriodDate, 'PPP')
                  ) : (
                    <span>{t('onboarding.lastPeriodDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={lastPeriodDate}
                  onSelect={setLastPeriodDate}
                  disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Cycle Length */}
          <div className="space-y-2">
            <Label htmlFor="cycleLength">{t('onboarding.averageCycleLength')}</Label>
            <Input
              id="cycleLength"
              type="number"
              min="21"
              max="45"
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">21-45 days</p>
          </div>

          {/* Period Duration */}
          <div className="space-y-2">
            <Label htmlFor="periodDuration">{t('onboarding.periodDuration')}</Label>
            <Input
              id="periodDuration"
              type="number"
              min="1"
              max="10"
              value={periodDuration}
              onChange={(e) => setPeriodDuration(e.target.value)}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">1-10 days</p>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <div className="w-2 h-2 rounded-full bg-primary"></div>
        </div>
      </div>

      {/* Complete Button */}
      <Button
        onClick={handleComplete}
        disabled={!lastPeriodDate || loading}
        className="w-full h-14 text-lg rounded-full shadow-elegant"
      >
        {loading ? t('loading') : t('onboarding.complete')}
      </Button>
    </div>
  );
}
