import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format, addDays, addWeeks, differenceInWeeks } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PregnancyCalculatorProps {
  onCalculate: (data: { lmp: Date; edd: Date; weeks: number }) => void;
  initialLmp?: Date | null;
}

export default function PregnancyCalculator({ onCalculate, initialLmp }: PregnancyCalculatorProps) {
  const { t, i18n } = useTranslation();
  const [calculationMethod, setCalculationMethod] = useState<'lmp' | 'weeks' | 'months'>('lmp');
  const [lmpDate, setLmpDate] = useState<Date | undefined>(
    initialLmp ? new Date(initialLmp) : undefined
  );
  const [weeksInput, setWeeksInput] = useState('');
  const [monthsInput, setMonthsInput] = useState('');

  const calculateFromLMP = (lmp: Date) => {
    const edd = addDays(lmp, 280); // 40 weeks = 280 days
    const weeks = differenceInWeeks(new Date(), lmp);
    return { lmp, edd, weeks };
  };

  const calculateFromWeeks = (weeks: number) => {
    const lmp = addWeeks(new Date(), -weeks);
    const edd = addDays(lmp, 280);
    return { lmp, edd, weeks };
  };

  const calculateFromMonths = (months: number) => {
    const weeks = Math.floor(months * 4.33); // Average weeks per month
    return calculateFromWeeks(weeks);
  };

  const handleCalculate = () => {
    let result;

    if (calculationMethod === 'lmp' && lmpDate) {
      result = calculateFromLMP(lmpDate);
    } else if (calculationMethod === 'weeks' && weeksInput) {
      const weeks = parseInt(weeksInput);
      if (weeks >= 1 && weeks <= 42) {
        result = calculateFromWeeks(weeks);
      }
    } else if (calculationMethod === 'months' && monthsInput) {
      const months = parseFloat(monthsInput);
      if (months >= 0 && months <= 9) {
        result = calculateFromMonths(months);
      }
    }

    if (result) {
      onCalculate(result);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          {t('pregnancy.calculator')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={calculationMethod} onValueChange={(value: any) => setCalculationMethod(value)}>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="lmp" id="lmp" />
            <Label htmlFor="lmp">{t('pregnancy.lastMenstrualPeriod')}</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="weeks" id="weeks" />
            <Label htmlFor="weeks">{t('pregnancy.currentWeek')}</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="months" id="months" />
            <Label htmlFor="months">{t('pregnancy.currentMonth')}</Label>
          </div>
        </RadioGroup>

        {calculationMethod === 'lmp' && (
          <div className="space-y-2">
            <Label>{t('pregnancy.selectLMP')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-right font-normal',
                    !lmpDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {lmpDate ? (
                    format(lmpDate, 'PPP', { locale: i18n.language === 'ar' ? ar : undefined })
                  ) : (
                    <span>{t('pregnancy.selectDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={lmpDate}
                  onSelect={setLmpDate}
                  locale={i18n.language === 'ar' ? ar : undefined}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {calculationMethod === 'weeks' && (
          <div className="space-y-2">
            <Label htmlFor="weeks-input">{t('pregnancy.enterWeeks')}</Label>
            <Input
              id="weeks-input"
              type="number"
              min="1"
              max="42"
              value={weeksInput}
              onChange={(e) => setWeeksInput(e.target.value)}
              placeholder={t('pregnancy.weeksPlaceholder')}
            />
          </div>
        )}

        {calculationMethod === 'months' && (
          <div className="space-y-2">
            <Label htmlFor="months-input">{t('pregnancy.enterMonths')}</Label>
            <Input
              id="months-input"
              type="number"
              min="0"
              max="9"
              step="0.5"
              value={monthsInput}
              onChange={(e) => setMonthsInput(e.target.value)}
              placeholder={t('pregnancy.monthsPlaceholder')}
            />
          </div>
        )}

        <Button onClick={handleCalculate} className="w-full">
          {t('pregnancy.calculate')}
        </Button>
      </CardContent>
    </Card>
  );
}
