import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Meh, Frown, Coffee, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const moods = [
  { id: 'happy', icon: Smile, emoji: '😊', color: 'text-success', bg: 'bg-success/10 hover:bg-success/20' },
  { id: 'neutral', icon: Meh, emoji: '😐', color: 'text-muted-foreground', bg: 'bg-muted hover:bg-muted/80' },
  { id: 'low', icon: Frown, emoji: '😔', color: 'text-secondary', bg: 'bg-secondary/10 hover:bg-secondary/20' },
  { id: 'tired', icon: Coffee, emoji: '😴', color: 'text-primary', bg: 'bg-primary/10 hover:bg-primary/20' },
  { id: 'anxious', icon: Heart, emoji: '😰', color: 'text-destructive', bg: 'bg-destructive/10 hover:bg-destructive/20' },
];

export default function MoodTrackerWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) {
      loadTodayMood();
    }
  }, [user]);

  const loadTodayMood = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('cycle_days')
      .select('mood')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (data?.mood) {
      setSelectedMood(data.mood);
    }
  };

  const handleMoodSelect = async (moodId: string) => {
    if (!user || loading) return;

    setLoading(true);
    try {
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
          .update({ mood: moodId })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('cycle_days')
          .insert({
            user_id: user.id,
            date: today,
            mood: moodId,
          });

        if (error) throw error;
      }

      setSelectedMood(moodId);
      toast({
        title: t('home.moodLogged'),
        description: t('home.moodLoggedDesc'),
      });
    } catch (error) {
      console.error('Error logging mood:', error);
      toast({
        title: t('error'),
        description: t('home.moodError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass shadow-elegant animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">{t('home.howAreYouFeeling')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          {moods.map((mood) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === mood.id;
            
            return (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                disabled={loading}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all flex-1',
                  mood.bg,
                  isSelected && 'ring-2 ring-primary scale-105',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className="text-3xl">{mood.emoji}</span>
                <span className={cn('text-xs font-medium', mood.color)}>
                  {t(mood.id)}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
