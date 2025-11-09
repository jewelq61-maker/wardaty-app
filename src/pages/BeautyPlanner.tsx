import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { format, differenceInDays, startOfDay } from 'date-fns';
import { CalendarIcon, Plus, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';

interface CycleDay {
  date: string;
  flow?: string;
}

interface BeautyAction {
  id: string;
  title: string;
  notes?: string;
  phase: string;
  scheduled_at?: string;
  created_at: string;
}

type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

const beautyRecommendations: Record<CyclePhase, { title: string; items: string[] }> = {
  menstrual: {
    title: 'Menstrual Phase',
    items: ['Gentle facial', 'Hair oiling', 'Hydrating masks', 'Light massage']
  },
  follicular: {
    title: 'Follicular Phase',
    items: ['Waxing', 'Threading', 'Exfoliation', 'Face masks', 'Hair treatments']
  },
  ovulation: {
    title: 'Ovulation Phase',
    items: ['Laser hair removal', 'Deep facial', 'Chemical peels', 'Salon treatments']
  },
  luteal: {
    title: 'Luteal Phase',
    items: ['Moisturizing treatments', 'Hair masks', 'Gentle skincare', 'Aromatherapy']
  }
};

export default function BeautyPlanner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentPhase, setCurrentPhase] = useState<CyclePhase>('follicular');
  const [beautyActions, setBeautyActions] = useState<BeautyAction[]>([]);
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [newAction, setNewAction] = useState({ title: '', notes: '', scheduled_at: undefined as Date | undefined });

  useEffect(() => {
    if (user) {
      fetchCyclePhase();
      fetchBeautyActions();
    }
  }, [user]);

  const fetchCyclePhase = async () => {
    if (!user) return;

    const { data: cycleDays, error } = await supabase
      .from('cycle_days')
      .select('date, flow')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(35);

    if (error) {
      console.error('Error fetching cycle data:', error);
      return;
    }

    if (cycleDays && cycleDays.length > 0) {
      const phase = calculateCurrentPhase(cycleDays);
      setCurrentPhase(phase);
    }
  };

  const calculateCurrentPhase = (cycleDays: CycleDay[]): CyclePhase => {
    const today = startOfDay(new Date());
    
    // Find the most recent period start
    const lastPeriodDay = cycleDays.find(day => day.flow && day.flow !== 'none');
    if (!lastPeriodDay) return 'follicular';

    const lastPeriodDate = startOfDay(new Date(lastPeriodDay.date));
    const daysSinceLastPeriod = differenceInDays(today, lastPeriodDate);

    // Typical 28-day cycle phases:
    // Days 1-5: Menstrual
    // Days 6-13: Follicular
    // Days 14-16: Ovulation
    // Days 17-28: Luteal

    if (daysSinceLastPeriod >= 0 && daysSinceLastPeriod <= 5) return 'menstrual';
    if (daysSinceLastPeriod > 5 && daysSinceLastPeriod <= 13) return 'follicular';
    if (daysSinceLastPeriod > 13 && daysSinceLastPeriod <= 16) return 'ovulation';
    return 'luteal';
  };

  const fetchBeautyActions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('beauty_actions')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching beauty actions:', error);
      return;
    }

    setBeautyActions(data || []);
  };

  const handleAddAction = async () => {
    if (!user || !newAction.title.trim()) {
      toast({
        title: t('error'),
        description: t('beauty.fillTitle'),
        variant: 'destructive'
      });
      return;
    }

    const { error } = await supabase
      .from('beauty_actions')
      .insert({
        user_id: user.id,
        title: newAction.title,
        notes: newAction.notes || null,
        phase: currentPhase,
        scheduled_at: newAction.scheduled_at?.toISOString() || null
      });

    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: t('success'),
      description: t('beauty.actionAdded')
    });

    setNewAction({ title: '', notes: '', scheduled_at: undefined });
    setIsAddingAction(false);
    fetchBeautyActions();
  };

  const handleDeleteAction = async (id: string) => {
    const { error } = await supabase
      .from('beauty_actions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: t('success'),
      description: t('beauty.actionDeleted')
    });

    fetchBeautyActions();
  };

  const getPhaseColor = (phase: CyclePhase) => {
    const colors = {
      menstrual: 'from-red-500/20 to-pink-500/20 border-red-500/30',
      follicular: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      ovulation: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
      luteal: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
    };
    return colors[phase];
  };

  const recommendations = beautyRecommendations[currentPhase];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-single-primary to-married-primary p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8" />
          <h1 className="text-3xl font-bold">{t('beauty.title')}</h1>
        </div>
        <p className="text-white/90">{t('beauty.subtitle')}</p>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Current Phase Card */}
        <Card className={cn('border-2 bg-gradient-to-br', getPhaseColor(currentPhase))}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {t(`beauty.phase.${currentPhase}`)}
            </CardTitle>
            <CardDescription>{t('beauty.currentPhase')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">{t('beauty.recommended')}:</p>
              <ul className="grid grid-cols-2 gap-2">
                {recommendations.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t(`beauty.treatment.${item.toLowerCase().replace(/\s+/g, '_')}`)}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Add Action Button */}
        <Sheet open={isAddingAction} onOpenChange={setIsAddingAction}>
          <SheetTrigger asChild>
            <Button className="w-full" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              {t('beauty.addAction')}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh]">
            <SheetHeader>
              <SheetTitle>{t('beauty.scheduleAction')}</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('beauty.actionTitle')}</label>
                <Input
                  value={newAction.title}
                  onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                  placeholder={t('beauty.actionTitlePlaceholder')}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('beauty.notes')}</label>
                <Textarea
                  value={newAction.notes}
                  onChange={(e) => setNewAction({ ...newAction, notes: e.target.value })}
                  placeholder={t('beauty.notesPlaceholder')}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('beauty.scheduleDate')}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newAction.scheduled_at ? format(newAction.scheduled_at, 'PPP') : t('beauty.pickDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newAction.scheduled_at}
                      onSelect={(date) => setNewAction({ ...newAction, scheduled_at: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleAddAction} className="w-full" size="lg">
                {t('beauty.save')}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Scheduled Actions */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">{t('beauty.scheduledActions')}</h2>
          {beautyActions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {t('beauty.noActions')}
              </CardContent>
            </Card>
          ) : (
            beautyActions.map((action) => (
              <Card key={action.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{action.title}</h3>
                      {action.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{action.notes}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="capitalize">{t(`beauty.phase.${action.phase}`)}</span>
                        {action.scheduled_at && (
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {format(new Date(action.scheduled_at), 'PP')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAction(action.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
