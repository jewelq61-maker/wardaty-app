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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { format, differenceInDays, startOfDay, isWithinInterval } from 'date-fns';
import { CalendarIcon, Plus, Sparkles, Trash2, Filter } from 'lucide-react';
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
  const [filterPhase, setFilterPhase] = useState<CyclePhase | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });

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

  const filteredActions = beautyActions.filter(action => {
    // Phase filter
    if (filterPhase !== 'all' && action.phase !== filterPhase) {
      return false;
    }
    
    // Date range filter
    if (dateRange.from && dateRange.to && action.scheduled_at) {
      const actionDate = new Date(action.scheduled_at);
      return isWithinInterval(actionDate, { start: dateRange.from, end: dateRange.to });
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Compact Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{t('beauty.title')}</h1>
              <p className="text-xs text-muted-foreground">{t('beauty.subtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        {/* Current Phase Card */}
        <div className={cn(
          'relative overflow-hidden rounded-3xl p-6 border-2 animate-fade-in',
          currentPhase === 'menstrual' && 'bg-period/10 border-period/30',
          currentPhase === 'follicular' && 'bg-success/10 border-success/30',
          currentPhase === 'ovulation' && 'bg-fertile/10 border-fertile/30',
          currentPhase === 'luteal' && 'bg-fasting/10 border-fasting/30'
        )}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className={cn(
                'w-6 h-6',
                currentPhase === 'menstrual' && 'text-period',
                currentPhase === 'follicular' && 'text-success',
                currentPhase === 'ovulation' && 'text-fertile',
                currentPhase === 'luteal' && 'text-fasting'
              )} />
              <h2 className="text-xl font-bold text-foreground">
                {t(`beauty.phase.${currentPhase}`)}
              </h2>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">{t('beauty.recommended')}:</p>
            
            <div className="grid grid-cols-2 gap-2">
              {recommendations.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/50 backdrop-blur-sm"
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    currentPhase === 'menstrual' && 'bg-period',
                    currentPhase === 'follicular' && 'bg-success',
                    currentPhase === 'ovulation' && 'bg-fertile',
                    currentPhase === 'luteal' && 'bg-fasting'
                  )} />
                  <span className="text-xs font-medium text-foreground">
                    {t(`beauty.treatment.${item.toLowerCase().replace(/\s+/g, '_')}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Action Button */}
        <Sheet open={isAddingAction} onOpenChange={setIsAddingAction}>
          <SheetTrigger asChild>
            <button className="w-full group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-secondary/20 to-secondary/10 border-2 border-secondary/30 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg active:scale-95">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-center justify-center gap-2">
                <Plus className="w-5 h-5 text-secondary" />
                <span className="font-semibold text-foreground">{t('beauty.addAction')}</span>
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader className="pb-6">
              <SheetTitle className="text-xl">{t('beauty.scheduleAction')}</SheetTitle>
            </SheetHeader>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">
                  {t('beauty.actionTitle')}
                </label>
                <Input
                  value={newAction.title}
                  onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                  placeholder={t('beauty.actionTitlePlaceholder')}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">
                  {t('beauty.notes')}
                </label>
                <Textarea
                  value={newAction.notes}
                  onChange={(e) => setNewAction({ ...newAction, notes: e.target.value })}
                  placeholder={t('beauty.notesPlaceholder')}
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">
                  {t('beauty.scheduleDate')}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 justify-start text-left border-2"
                    >
                      <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span className={newAction.scheduled_at ? 'text-foreground' : 'text-muted-foreground'}>
                        {newAction.scheduled_at ? format(newAction.scheduled_at, 'PPP') : t('beauty.pickDate')}
                      </span>
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
              <Button onClick={handleAddAction} className="w-full h-12" size="lg">
                {t('beauty.save')}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Filters */}
        <div className="space-y-4 rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">{t('beauty.filters')}</h3>
          </div>
          
          {/* Phase Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              {t('beauty.filterByPhase')}
            </label>
            <Tabs value={filterPhase} onValueChange={(value) => setFilterPhase(value as CyclePhase | 'all')}>
              <TabsList className="grid w-full grid-cols-5 h-auto">
                <TabsTrigger value="all" className="text-xs px-2 py-2">{t('beauty.all')}</TabsTrigger>
                <TabsTrigger value="menstrual" className="text-xs px-2 py-2">{t('beauty.phase.menstrual')}</TabsTrigger>
                <TabsTrigger value="follicular" className="text-xs px-2 py-2">{t('beauty.phase.follicular')}</TabsTrigger>
                <TabsTrigger value="ovulation" className="text-xs px-2 py-2">{t('beauty.phase.ovulation')}</TabsTrigger>
                <TabsTrigger value="luteal" className="text-xs px-2 py-2">{t('beauty.phase.luteal')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              {t('beauty.filterByDate')}
            </label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-xs h-9">
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {dateRange.from ? format(dateRange.from, 'PP') : t('beauty.startDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-xs h-9">
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {dateRange.to ? format(dateRange.to, 'PP') : t('beauty.endDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            {(dateRange.from || dateRange.to) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateRange({ from: undefined, to: undefined })}
                className="w-full mt-2 h-8 text-xs"
              >
                {t('beauty.clearDateFilter')}
              </Button>
            )}
          </div>
        </div>

        {/* Scheduled Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{t('beauty.scheduledActions')}</h2>
            <span className="text-xs text-muted-foreground">
              {filteredActions.length} {t('beauty.actions')}
            </span>
          </div>
          {filteredActions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {beautyActions.length === 0 ? t('beauty.noActions') : t('beauty.noMatchingActions')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActions.map((action) => (
                <div
                  key={action.id}
                  className="group relative overflow-hidden rounded-2xl p-4 bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 truncate">{action.title}</h3>
                      {action.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {action.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs">
                        <span className={cn(
                          'px-2 py-1 rounded-lg font-medium',
                          action.phase === 'menstrual' && 'bg-period/10 text-period',
                          action.phase === 'follicular' && 'bg-success/10 text-success',
                          action.phase === 'ovulation' && 'bg-fertile/10 text-fertile',
                          action.phase === 'luteal' && 'bg-fasting/10 text-fasting'
                        )}>
                          {t(`beauty.phase.${action.phase}`)}
                        </span>
                        {action.scheduled_at && (
                          <span className="flex items-center gap-1 text-muted-foreground">
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
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
