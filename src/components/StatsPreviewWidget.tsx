import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function StatsPreviewWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    avgCycleLength: 0,
    avgPeriodDuration: 0,
    totalCycles: 0,
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    const { data: cycles } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    if (cycles && cycles.length > 0) {
      const avgLength = cycles.reduce((sum, c) => sum + (c.length || 0), 0) / cycles.length;
      const avgDuration = cycles.reduce((sum, c) => sum + (c.duration || 0), 0) / cycles.length;

      setStats({
        avgCycleLength: Math.round(avgLength),
        avgPeriodDuration: Math.round(avgDuration),
        totalCycles: cycles.length,
      });
    }
  };

  if (stats.totalCycles === 0) return null;

  return (
    <Card className="glass shadow-elegant animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          {t('home.quickStats')}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/stats')}
          className="text-xs"
        >
          {t('home.viewAll')}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="text-2xl font-bold text-primary">
              {stats.avgCycleLength}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('statsPage.avgCycleLength')}
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5">
            <div className="text-2xl font-bold text-secondary">
              {stats.avgPeriodDuration}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('statsPage.avgPeriodDuration')}
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-success/10 to-success/5">
            <div className="text-2xl font-bold text-success">
              {stats.totalCycles}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('statsPage.totalCycles')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
