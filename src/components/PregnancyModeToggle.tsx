import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Baby, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PregnancyModeToggleProps {
  isPregnant: boolean;
  pregnancyLMP: string | null;
  pregnancyEDD: string | null;
  calculationMethod: 'lmp' | 'edd' | null;
  onUpdate: () => void;
}

export default function PregnancyModeToggle({
  isPregnant,
  pregnancyLMP,
  pregnancyEDD,
  calculationMethod,
  onUpdate,
}: PregnancyModeToggleProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showSetup, setShowSetup] = useState(false);
  const [method, setMethod] = useState<'lmp' | 'edd'>('lmp');
  const [lmpDate, setLmpDate] = useState<Date | undefined>(
    pregnancyLMP ? new Date(pregnancyLMP) : undefined
  );
  const [eddDate, setEddDate] = useState<Date | undefined>(
    pregnancyEDD ? new Date(pregnancyEDD) : undefined
  );

  const handleTogglePregnancy = async (checked: boolean) => {
    if (!user) return;

    if (checked) {
      setShowSetup(true);
    } else {
      // Disable pregnancy mode
      const { error } = await supabase
        .from('profiles')
        .update({
          is_pregnant: false,
          pregnancy_lmp: null,
          pregnancy_edd: null,
          pregnancy_calculation_method: null,
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: t('common.error'),
          description: t('pregnancy.errorDisabling'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('common.success'),
          description: t('pregnancy.disabledSuccess'),
        });
        onUpdate();
      }
    }
  };

  const calculateEDD = (lmp: Date): Date => {
    // Naegele's rule: LMP + 280 days
    return addDays(lmp, 280);
  };

  const calculateLMP = (edd: Date): Date => {
    // Reverse calculation: EDD - 280 days
    return addDays(edd, -280);
  };

  const handleSavePregnancy = async () => {
    if (!user) return;

    let finalLMP: Date;
    let finalEDD: Date;

    if (method === 'lmp') {
      if (!lmpDate) {
        toast({
          title: t('common.error'),
          description: t('pregnancy.selectLMP'),
          variant: 'destructive',
        });
        return;
      }
      finalLMP = lmpDate;
      finalEDD = calculateEDD(lmpDate);
    } else {
      if (!eddDate) {
        toast({
          title: t('common.error'),
          description: t('pregnancy.selectEDD'),
          variant: 'destructive',
        });
        return;
      }
      finalEDD = eddDate;
      finalLMP = calculateLMP(eddDate);
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        is_pregnant: true,
        pregnancy_lmp: format(finalLMP, 'yyyy-MM-dd'),
        pregnancy_edd: format(finalEDD, 'yyyy-MM-dd'),
        pregnancy_calculation_method: method,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: t('common.error'),
        description: t('pregnancy.errorEnabling'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('common.success'),
        description: t('pregnancy.enabledSuccess'),
      });
      setShowSetup(false);
      onUpdate();
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Baby className="h-5 w-5 text-primary" />
          {t('pregnancy.pregnancyMode')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="pregnancy-mode" className="text-sm font-medium">
            {t('pregnancy.currentlyPregnant')}
          </Label>
          <Switch
            id="pregnancy-mode"
            checked={isPregnant}
            onCheckedChange={handleTogglePregnancy}
          />
        </div>

        {isPregnant && pregnancyEDD && (
          <div className="space-y-3">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">{t('pregnancy.dueDate')}</p>
              <p className="text-lg font-bold text-primary">
                {format(new Date(pregnancyEDD), 'PPP', { locale: ar })}
              </p>
            </div>

            <Button
              onClick={() => navigate('/pregnancy-calendar')}
              className="w-full"
              variant="outline"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {t('pregnancy.viewCalendar')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {showSetup && (
          <div className="space-y-4 p-4 border rounded-lg">
            <RadioGroup value={method} onValueChange={(v) => setMethod(v as 'lmp' | 'edd')}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="lmp" id="lmp" />
                <Label htmlFor="lmp">{t('pregnancy.lmpMethod')}</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="edd" id="edd" />
                <Label htmlFor="edd">{t('pregnancy.eddMethod')}</Label>
              </div>
            </RadioGroup>

            {method === 'lmp' && (
              <div className="space-y-2">
                <Label>{t('pregnancy.selectLMP')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !lmpDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {lmpDate ? format(lmpDate, 'PPP', { locale: ar }) : t('pregnancy.pickDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={lmpDate}
                      onSelect={setLmpDate}
                      initialFocus
                      className={cn('p-3 pointer-events-auto')}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {method === 'edd' && (
              <div className="space-y-2">
                <Label>{t('pregnancy.selectEDD')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !eddDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {eddDate ? format(eddDate, 'PPP', { locale: ar }) : t('pregnancy.pickDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={eddDate}
                      onSelect={setEddDate}
                      initialFocus
                      className={cn('p-3 pointer-events-auto')}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSavePregnancy} className="flex-1">
                {t('common.save')}
              </Button>
              <Button variant="outline" onClick={() => setShowSetup(false)} className="flex-1">
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
