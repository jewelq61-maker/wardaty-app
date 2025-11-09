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
    <Card className="glass shadow-elegant animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Droplet className="w-5 h-5 text-info" />
          {t('home.waterIntake')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="relative">
          <div className="h-16 bg-muted rounded-2xl overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-info/60 to-info transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">
              {glassesCount} / {DAILY_GOAL}
            </span>
          </div>
        </div>

        {/* Glass Icons */}
        <div className="flex justify-center gap-2 flex-wrap">
          {Array.from({ length: DAILY_GOAL }).map((_, i) => (
            <Droplet
              key={i}
              className={cn(
                'w-6 h-6 transition-all',
                i < glassesCount 
                  ? 'fill-info text-info scale-110' 
                  : 'text-muted-foreground'
              )}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => updateWaterCount(glassesCount - 1)}
            disabled={loading || glassesCount === 0}
            className="rounded-full"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <Button
            size="lg"
            onClick={() => updateWaterCount(glassesCount + 1)}
            disabled={loading || glassesCount >= DAILY_GOAL}
            className="rounded-full px-8"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('home.addGlass')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
