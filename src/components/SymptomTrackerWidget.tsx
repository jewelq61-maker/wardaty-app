import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const symptoms = [
  { id: 'cramps', emoji: '🤕', color: 'text-destructive', bg: 'bg-destructive/10 hover:bg-destructive/20' },
  { id: 'headache', emoji: '🤯', color: 'text-primary', bg: 'bg-primary/10 hover:bg-primary/20' },
  { id: 'bloating', emoji: '💨', color: 'text-secondary', bg: 'bg-secondary/10 hover:bg-secondary/20' },
  { id: 'fatigue', emoji: '😫', color: 'text-muted-foreground', bg: 'bg-muted hover:bg-muted/80' },
  { id: 'tenderness', emoji: '💔', color: 'text-period', bg: 'bg-period/10 hover:bg-period/20' },
];

export default function SymptomTrackerWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) {
      loadTodaySymptoms();
    }
  }, [user]);

  const loadTodaySymptoms = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('cycle_days')
      .select('symptoms')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (data?.symptoms) {
      setSelectedSymptoms(data.symptoms);
    }
  };

  const handleSymptomToggle = async (symptomId: string) => {
    if (!user || loading) return;

    setLoading(true);
    try {
      // Toggle symptom in local state
      const newSymptoms = selectedSymptoms.includes(symptomId)
        ? selectedSymptoms.filter(s => s !== symptomId)
        : [...selectedSymptoms, symptomId];

      // Check if entry exists for today
      const { data: existing } = await supabase
        .from('cycle_days')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        // Update existing entry
        const { error } = await supabase
          .from('cycle_days')
          .update({ symptoms: newSymptoms })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('cycle_days')
          .insert({
            user_id: user.id,
            date: today,
            symptoms: newSymptoms,
          });

        if (error) throw error;
      }

      setSelectedSymptoms(newSymptoms);
      toast({
        title: t('home.symptomsUpdated'),
        description: t('home.symptomsUpdatedDesc'),
      });
    } catch (error) {
      console.error('Error logging symptoms:', error);
      toast({
        title: t('error'),
        description: t('home.symptomError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass shadow-elegant animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5" />
          {t('home.trackSymptoms')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          {symptoms.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom.id);
            
            return (
              <button
                key={symptom.id}
                onClick={() => handleSymptomToggle(symptom.id)}
                disabled={loading}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all flex-1',
                  symptom.bg,
                  isSelected && 'ring-2 ring-primary scale-105',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className="text-3xl">{symptom.emoji}</span>
                <span className={cn('text-xs font-medium', symptom.color)}>
                  {t(symptom.id)}
                </span>
              </button>
            );
          })}
        </div>
        
        {selectedSymptoms.length > 0 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {t('home.symptomsSelected', { count: selectedSymptoms.length })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
