import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import BeautyRecommendations from './BeautyRecommendations';

interface Routine {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time_of_day: 'morning' | 'evening' | 'both' | null;
  category_id: string;
}

interface RoutineLog {
  id: string;
  routine_id: string;
  completed: boolean;
  completed_at: string | null;
}

interface BeautyRoutineTrackerProps {
  date: Date;
}

export default function BeautyRoutineTracker({ date }: BeautyRoutineTrackerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs, setLogs] = useState<Record<string, RoutineLog>>({});
  const [categories, setCategories] = useState<Record<string, any>>({});

  useEffect(() => {
    if (user) {
      loadRoutines();
      loadCategories();
    }
  }, [user, date]);

  const loadCategories = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('beauty_categories' as any)
      .select('*')
      .eq('user_id', user.id);

    if (data) {
      const categoriesMap: Record<string, any> = {};
      data.forEach((cat: any) => {
        categoriesMap[cat.id] = cat;
      });
      setCategories(categoriesMap);
    }
  };

  const loadRoutines = async () => {
    if (!user) return;

    // Get routines based on date
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();

    const { data: routinesData } = await supabase
      .from('beauty_routines' as any)
      .select('*')
      .eq('user_id', user.id);

    if (routinesData) {
      // Filter routines based on frequency
      const filteredRoutines = (routinesData as unknown as Routine[]).filter((routine) => {
        if (routine.frequency === 'daily') return true;
        if (routine.frequency === 'weekly' && dayOfWeek === 1) return true; // Monday
        if (routine.frequency === 'monthly' && dayOfMonth === 1) return true; // First of month
        return false;
      });

      setRoutines(filteredRoutines);

      // Load logs for these routines
      const dateStr = date.toISOString().split('T')[0];
      const { data: logsData } = await supabase
        .from('routine_logs' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', dateStr);

      if (logsData) {
        const logsMap: Record<string, RoutineLog> = {};
        logsData.forEach((log: any) => {
          logsMap[log.routine_id] = log;
        });
        setLogs(logsMap);
      }
    }
  };

  const toggleRoutine = async (routineId: string) => {
    if (!user) return;

    const dateStr = date.toISOString().split('T')[0];
    const currentLog = logs[routineId];

    try {
      if (currentLog) {
        // Update existing log
        const newCompleted = !currentLog.completed;
        const { error } = await supabase
          .from('routine_logs' as any)
          .update({
            completed: newCompleted,
            completed_at: newCompleted ? new Date().toISOString() : null,
          })
          .eq('id', currentLog.id);

        if (error) throw error;

        setLogs({
          ...logs,
          [routineId]: {
            ...currentLog,
            completed: newCompleted,
            completed_at: newCompleted ? new Date().toISOString() : null,
          },
        });
      } else {
        // Create new log
        const { data, error } = await supabase
          .from('routine_logs' as any)
          .insert({
            user_id: user.id,
            routine_id: routineId,
            log_date: dateStr,
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        setLogs({
          ...logs,
          [routineId]: data as any,
        });
      }

      toast({
        title: t('common.success'),
        description: t('beautyRoutines.logUpdated'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (routines.length === 0) {
    return (
      <div className="space-y-4">
        <BeautyRecommendations />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BeautyRecommendations />
      
      <Card className="glass-card">
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-4">{t('beautyRoutines.todayRoutines')}</h3>
        <div className="space-y-2">
          {routines.map((routine) => {
            const isCompleted = logs[routine.id]?.completed || false;
            const category = categories[routine.category_id];

            return (
              <div
                key={routine.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border transition-all',
                  isCompleted ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-border'
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  {category && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {category.name[0]}
                    </div>
                  )}
                  <div>
                    <p className={cn('font-medium', isCompleted && 'line-through text-muted-foreground')}>
                      {routine.title}
                    </p>
                    {routine.time_of_day && routine.time_of_day !== 'both' && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {t(`beautyRoutines.time.${routine.time_of_day}`)}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isCompleted ? 'default' : 'outline'}
                  onClick={() => toggleRoutine(routine.id)}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
