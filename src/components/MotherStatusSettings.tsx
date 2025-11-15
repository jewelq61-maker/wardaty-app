import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, Droplets, Milk, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import PregnancyCalculator from './PregnancyCalculator';
import PostpartumCalculator from './PostpartumCalculator';

type MotherStatus = 'none' | 'pregnant' | 'postpartum' | 'breastfeeding';

interface MotherStatusData {
  status: MotherStatus;
  pregnancy_lmp?: Date | null;
  pregnancy_edd?: Date | null;
  pregnancy_weeks?: number | null;
  postpartum_start_date?: Date | null;
  breastfeeding_start_date?: Date | null;
}

interface MotherStatusSettingsProps {
  initialStatus?: MotherStatus;
  initialData?: MotherStatusData;
  onSave: (data: MotherStatusData) => Promise<void>;
}

export default function MotherStatusSettings({
  initialStatus = 'none',
  initialData,
  onSave,
}: MotherStatusSettingsProps) {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState<MotherStatus>(initialStatus);
  const [pregnancyData, setPregnancyData] = useState<{
    lmp: Date | null;
    edd: Date | null;
    weeks: number | null;
  }>({
    lmp: initialData?.pregnancy_lmp || null,
    edd: initialData?.pregnancy_edd || null,
    weeks: initialData?.pregnancy_weeks || null,
  });
  const [postpartumDate, setPostpartumDate] = useState<Date | null>(
    initialData?.postpartum_start_date || null
  );
  const [breastfeedingDate, setBreastfeedingDate] = useState<Date | undefined>(
    initialData?.breastfeeding_start_date ? new Date(initialData.breastfeeding_start_date) : undefined
  );

  const handleSave = async () => {
    const data: MotherStatusData = {
      status,
      pregnancy_lmp: status === 'pregnant' ? pregnancyData.lmp : null,
      pregnancy_edd: status === 'pregnant' ? pregnancyData.edd : null,
      pregnancy_weeks: status === 'pregnant' ? pregnancyData.weeks : null,
      postpartum_start_date: status === 'postpartum' ? postpartumDate : null,
      breastfeeding_start_date: status === 'breastfeeding' ? breastfeedingDate || null : null,
    };

    await onSave(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Baby className="w-5 h-5" />
          {t('mother.statusSettings')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>{t('mother.selectStatus')}</Label>
          <RadioGroup value={status} onValueChange={(value: MotherStatus) => setStatus(value)}>
            <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {t('mother.statusNone')}
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="pregnant" id="pregnant" />
              <Label htmlFor="pregnant" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4" />
                  {t('mother.statusPregnant')}
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="postpartum" id="postpartum" />
              <Label htmlFor="postpartum" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  {t('mother.statusPostpartum')}
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="breastfeeding" id="breastfeeding" />
              <Label htmlFor="breastfeeding" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Milk className="w-4 h-4" />
                  {t('mother.statusBreastfeeding')}
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {status === 'pregnant' && (
          <PregnancyCalculator
            onCalculate={(data) => setPregnancyData(data)}
            initialLmp={pregnancyData.lmp}
          />
        )}

        {status === 'postpartum' && (
          <PostpartumCalculator
            onCalculate={(date) => setPostpartumDate(date)}
            initialDate={postpartumDate}
          />
        )}

        {status === 'breastfeeding' && (
          <div className="space-y-2">
            <Label>{t('mother.breastfeedingStartDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-right font-normal',
                    !breastfeedingDate && 'text-muted-foreground'
                  )}
                >
                  <Baby className="ml-2 h-4 w-4" />
                  {breastfeedingDate ? (
                    format(breastfeedingDate, 'PPP', {
                      locale: i18n.language === 'ar' ? ar : undefined,
                    })
                  ) : (
                    <span>{t('mother.selectDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={breastfeedingDate}
                  onSelect={setBreastfeedingDate}
                  locale={i18n.language === 'ar' ? ar : undefined}
                  initialFocus
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <Button onClick={handleSave} className="w-full">
          {t('common.save')}
        </Button>
      </CardContent>
    </Card>
  );
}
