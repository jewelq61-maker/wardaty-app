import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { format, differenceInDays, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PostpartumCalculatorProps {
  onCalculate: (birthDate: Date) => void;
  initialDate?: Date | null;
}

export default function PostpartumCalculator({ onCalculate, initialDate }: PostpartumCalculatorProps) {
  const { t, i18n } = useTranslation();
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : undefined
  );

  const calculatePostpartumDays = () => {
    if (!birthDate) return null;
    
    const today = new Date();
    const daysPassed = differenceInDays(today, birthDate);
    const maxDays = 40; // Standard postpartum period
    const remainingDays = Math.max(0, maxDays - daysPassed);
    const progress = Math.min(100, (daysPassed / maxDays) * 100);
    const endDate = addDays(birthDate, maxDays);

    return {
      daysPassed,
      remainingDays,
      progress,
      endDate,
      isComplete: daysPassed >= maxDays,
    };
  };

  const stats = calculatePostpartumDays();

  const handleSave = () => {
    if (birthDate) {
      onCalculate(birthDate);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Droplets className="w-5 h-5" />
          {t('postpartum.calculator')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t('postpartum.birthDate')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-right font-normal',
                  !birthDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {birthDate ? (
                  format(birthDate, 'PPP', { locale: i18n.language === 'ar' ? ar : undefined })
                ) : (
                  <span>{t('postpartum.selectDate')}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={birthDate}
                onSelect={setBirthDate}
                locale={i18n.language === 'ar' ? ar : undefined}
                initialFocus
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {stats && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t('postpartum.daysPassed')}
              </span>
              <span className="text-2xl font-bold text-primary">
                {stats.daysPassed} {t('common.days')}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('postpartum.progress')}</span>
                <span>{Math.round(stats.progress)}%</span>
              </div>
              <Progress value={stats.progress} className="h-2" />
            </div>

            {!stats.isComplete ? (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t('postpartum.remainingDays')}
                </span>
                <span className="text-lg font-semibold">
                  {stats.remainingDays} {t('common.days')}
                </span>
              </div>
            ) : (
              <div className="text-center p-2 bg-green-500/10 text-green-700 dark:text-green-400 rounded">
                {t('postpartum.completed')}
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{t('postpartum.endDate')}</span>
              <span className="font-medium">
                {format(stats.endDate, 'PPP', { locale: i18n.language === 'ar' ? ar : undefined })}
              </span>
            </div>
          </div>
        )}

        <Button onClick={handleSave} className="w-full" disabled={!birthDate}>
          {t('common.save')}
        </Button>
      </CardContent>
    </Card>
  );
}
