import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Calendar, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';

interface FastingStats {
  totalDays: number;
  completedDays: number;
  remainingDays: number;
  nextFastingDate: string | null;
}

export default function FastingQadaWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<FastingStats>({
    totalDays: 0,
    completedDays: 0,
    remainingDays: 0,
    nextFastingDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Get user profile for manual adjustment
      const { data: profile } = await supabase
        .from('profiles')
        .select('fasting_manual_adjustment')
        .eq('id', user.id)
        .single();

      const manualAdjustment = profile?.fasting_manual_adjustment || 0;

      // Get all fasting entries
      const { data: entries } = await supabase
        .from('fasting_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      const completedCount = entries?.filter(e => e.is_completed).length || 0;
      const totalCount = (entries?.length || 0) + manualAdjustment;
      const remaining = totalCount - completedCount;

      // Find next upcoming fasting date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcomingEntry = entries?.find(e => {
        const entryDate = new Date(e.date);
        entryDate.setHours(0, 0, 0, 0);
        return !e.is_completed && entryDate >= today;
      });

      setStats({
        totalDays: totalCount,
        completedDays: completedCount,
        remainingDays: remaining,
        nextFastingDate: upcomingEntry?.date || null,
      });
    } catch (error) {
      console.error('Error loading fasting stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Moon className="h-5 w-5 text-period" />
            {t('fastingQada.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{t('loading')}</div>
        </CardContent>
      </Card>
    );
  }

  if (stats.totalDays === 0) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Moon className="h-5 w-5 text-period" />
            {t('fastingQada.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-3">
            {t('fastingQada.noEntries')}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/fasting-qada')}
            className="w-full"
          >
            <Moon className="h-4 w-4 mr-2" />
            {t('fastingQada.startTracking')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Moon className="h-5 w-5 text-period" />
          {t('fastingQada.title')}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/fasting-qada')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Progress Summary */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-period/5 border border-period/20">
            <div>
              <p className="text-xs text-muted-foreground">{t('fastingQada.completed')}</p>
              <p className="text-2xl font-bold text-period">
                {stats.completedDays} / {stats.totalDays}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('fastingQada.remaining')}</p>
              <div className="w-16 h-16 rounded-full bg-period/10 flex items-center justify-center">
                <span className="text-xl font-bold text-period">{stats.remainingDays}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
              <span>{t('fastingQada.progress')}</span>
              <span>{Math.round((stats.completedDays / stats.totalDays) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-period transition-all duration-500"
                style={{ width: `${(stats.completedDays / stats.totalDays) * 100}%` }}
              />
            </div>
          </div>

          {/* Next Fasting Date */}
          {stats.nextFastingDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('fastingQada.nextDate')}:</span>
              <span className="font-medium text-foreground">
                {new Date(stats.nextFastingDate).toLocaleDateString('ar-EG', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
