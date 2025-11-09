import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, ChevronRight } from 'lucide-react';
import { format, isFuture, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

interface BeautyAction {
  id: string;
  title: string;
  scheduled_at: string;
  phase: string;
}

export default function UpcomingBeautyWidget() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [actions, setActions] = useState<BeautyAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUpcomingActions = async () => {
      const { data, error } = await supabase
        .from('beauty_actions')
        .select('id, title, scheduled_at, phase')
        .eq('user_id', user.id)
        .not('scheduled_at', 'is', null)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(3);

      if (!error && data) {
        setActions(data);
      }
      setLoading(false);
    };

    fetchUpcomingActions();

    const channel = supabase
      .channel('beauty_actions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beauty_actions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUpcomingActions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <Card className="glass shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('beauty.upcomingTreatments')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{t('loading')}</div>
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <Card className="glass shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('beauty.upcomingTreatments')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-3">
            {t('beauty.noUpcoming')}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/beauty')}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {t('beauty.scheduleAction')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {t('beauty.upcomingTreatments')}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/beauty')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
            onClick={() => navigate('/beauty')}
          >
            <div className="flex-1">
              <div className="font-medium">{action.title}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {format(parseISO(action.scheduled_at), 'PPP', {
                  locale: i18n.language === 'ar' ? ar : undefined,
                })}
              </div>
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              {t(`beauty.phase.${action.phase}`)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
