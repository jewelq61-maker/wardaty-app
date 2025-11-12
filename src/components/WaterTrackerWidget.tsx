import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplet, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const DAILY_GOAL = 8; // 8 glasses of water

export default function WaterTrackerWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [glassesCount, setGlassesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) {
      loadTodayWater();
    }
  }, [user]);

  const loadTodayWater = async () => {
    if (!user) return;

    // Check if we have water tracking in cycle_days notes
    const { data } = await supabase
      .from('cycle_days')
      .select('notes')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (data?.notes) {
      // Parse water count from notes (format: "water:X")
      const match = data.notes.match(/water:(\d+)/);
      if (match) {
        setGlassesCount(parseInt(match[1]));
      }
    }
  };

  const updateWaterCount = async (newCount: number) => {
    if (!user || loading || newCount < 0) return;

    setLoading(true);
    try {
      const waterNote = `water:${newCount}`;
      
      // Check if entry exists for today
      const { data: existing } = await supabase
        .from('cycle_days')
        .select('id, notes')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        // Update existing entry
        let updatedNotes = existing.notes || '';
        if (updatedNotes.includes('water:')) {
          updatedNotes = updatedNotes.replace(/water:\d+/, waterNote);
        } else {
          updatedNotes = updatedNotes ? `${updatedNotes}\n${waterNote}` : waterNote;
        }

        const { error } = await supabase
          .from('cycle_days')
          .update({ notes: updatedNotes })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('cycle_days')
          .insert({
            user_id: user.id,
            date: today,
            notes: waterNote,
          });

        if (error) throw error;
      }

      setGlassesCount(newCount);

      // Show celebration when goal reached
      if (newCount === DAILY_GOAL && glassesCount < DAILY_GOAL) {
        toast({
          title: '🎉 ' + t('home.waterGoalReached'),
          description: t('home.waterGoalDesc'),
        });
      }
    } catch (error) {
      console.error('Error updating water count:', error);
      toast({
        title: t('error'),
        description: t('home.waterError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = (glassesCount / DAILY_GOAL) * 100;

  return (
    <Card className="bg-card border border-border animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Droplet className="w-4 h-4 text-info" />
          {t('home.waterIntake')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress Text */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">{t('home.todayProgress')}</p>
          <p className="text-2xl font-bold text-foreground">
            {glassesCount} / {DAILY_GOAL}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-info transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Glass Icons */}
        <div className="flex justify-center gap-1.5 flex-wrap">
          {Array.from({ length: DAILY_GOAL }).map((_, i) => (
            <Droplet
              key={i}
              className={cn(
                'w-5 h-5 transition-all',
                i < glassesCount 
                  ? 'fill-info text-info' 
                  : 'text-muted-foreground/30'
              )}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => updateWaterCount(glassesCount - 1)}
            disabled={loading || glassesCount === 0}
            className="h-9 w-9 rounded-full"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => updateWaterCount(glassesCount + 1)}
            disabled={loading || glassesCount >= DAILY_GOAL}
            className="rounded-full px-6 h-9"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('home.addGlass')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
