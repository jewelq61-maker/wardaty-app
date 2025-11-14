import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { X } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import BeautyDaySection from '@/components/BeautyDaySection';
import PremiumPaywall from '@/components/PremiumPaywall';
import { type CyclePhase } from '@/utils/beautyCalculations';

interface DayLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onSave: () => void;
  cyclePhase?: CyclePhase;
}

const flowLevels = ['light', 'medium', 'heavy'] as const;
const moods = ['low', 'tired', 'neutral', 'happy', 'anxious'] as const;
const moodEmojis = { low: '😔', tired: '😴', neutral: '😐', happy: '😊', anxious: '😰' };
const symptoms = ['cramps', 'bloating', 'headache', 'fatigue', 'tenderness'] as const;

export default function DayLogSheet({ isOpen, onClose, date, onSave, cyclePhase = 'follicular' }: DayLogSheetProps) {
  const { t } = useTranslation();
  const { locale } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const [flow, setFlow] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const dateLocale = locale === 'ar' ? ar : enUS;

  useEffect(() => {
    if (isOpen && user) {
      fetchDayData();
      checkPremium();
    }
  }, [isOpen, date, user]);

  const checkPremium = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();
    setIsPremium(data?.is_premium || false);
  };

  const fetchDayData = async () => {
    if (!user) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const { data } = await supabase
      .from('cycle_days')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .maybeSingle();

    if (data) {
      setFlow(data.flow);
      setMood(data.mood);
      setSelectedSymptoms(data.symptoms || []);
      setNotes(data.notes || '');
    } else {
      // Reset form
      setFlow(null);
      setMood(null);
      setSelectedSymptoms([]);
      setNotes('');
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('cycle_days')
        .upsert({
          user_id: user.id,
          date: dateStr,
          flow,
          mood,
          symptoms: selectedSymptoms,
          notes,
        });

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('save'),
      });

      onSave();
      onClose();
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">
              {format(date, 'EEEE، d MMMM', { locale: dateLocale })}
            </SheetTitle>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(85vh-120px)] pb-4">
          {/* Flow Level */}
          <div className="space-y-3">
            <Label className="text-base font-bold">{t('flow', { defaultValue: 'Flow' })}</Label>
            <div className="grid grid-cols-3 gap-3">
              {flowLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setFlow(level)}
                  className={`
                    p-4 rounded-2xl border-2 transition-all
                    ${flow === level
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="text-sm font-medium">{t(level)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="space-y-3">
            <Label className="text-base font-bold">{t('mood', { defaultValue: 'Mood' })}</Label>
            <div className="flex justify-around">
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`
                    w-14 h-14 rounded-2xl transition-all
                    ${mood === m
                      ? 'bg-primary/20 scale-110 ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                    }
                  `}
                >
                  <span className="text-2xl">{moodEmojis[m]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-3">
            <Label className="text-base font-bold">{t('symptoms', { defaultValue: 'Symptoms' })}</Label>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`
                    px-4 py-2 rounded-full border-2 transition-all
                    ${selectedSymptoms.includes(symptom)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  {t(symptom)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-bold">
              {t('notes', { defaultValue: 'Notes' })}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notes', { defaultValue: 'Add notes...' })}
              className="min-h-24 resize-none"
            />
          </div>

          {/* Beauty Section */}
          <BeautyDaySection 
            date={date}
            cyclePhase={cyclePhase}
            isPremium={isPremium}
            onUpgrade={() => setShowPaywall(true)}
          />
        </div>

        {/* Save Button */}
        <div className="absolute bottom-6 left-4 right-4">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full h-12 rounded-full shadow-elegant"
          >
            {loading ? t('loading') : t('save')}
          </Button>
        </div>
      </SheetContent>
      
      <PremiumPaywall 
        open={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />
    </Sheet>
  );
}
