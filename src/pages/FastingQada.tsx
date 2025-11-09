import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import ProgressRing from '@/components/ProgressRing';
import { getRamadanPeriod } from '@/utils/hijri';
import { cn } from '@/lib/utils';

interface FastingEntry {
  id: string;
  date: string;
  is_completed: boolean;
  completed_at: string | null;
}

export default function FastingQada() {
  const { t } = useTranslation();
  const { locale, dir } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [missedDays, setMissedDays] = useState(0);
  const [completedEntries, setCompletedEntries] = useState<FastingEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  
  const dateLocale = locale === 'ar' ? ar : enUS;
  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  
  const completed = completedEntries.length;
  const remaining = Math.max(0, missedDays - completed);
  const progress = missedDays > 0 ? (completed / missedDays) * 100 : 0;

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setInitialLoading(true);
    await Promise.all([calculateMissedDays(), fetchCompletedEntries()]);
    setInitialLoading(false);
  };

  const calculateMissedDays = async () => {
    if (!user) return;

    // Get Ramadan period for current and previous years
    const currentYear = new Date().getFullYear();
    const ramadanPeriods = [
      getRamadanPeriod(currentYear),
      getRamadanPeriod(currentYear - 1),
    ];

    let totalMissed = 0;

    for (const period of ramadanPeriods) {
      const { data: cycleDays } = await supabase
        .from('cycle_days')
        .select('date, flow')
        .eq('user_id', user.id)
        .gte('date', format(period.start, 'yyyy-MM-dd'))
        .lte('date', format(period.end, 'yyyy-MM-dd'))
        .not('flow', 'is', null);

      if (cycleDays) {
        totalMissed += cycleDays.length;
      }
    }

    setMissedDays(totalMissed);
  };

  const fetchCompletedEntries = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('fasting_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false });

    if (data) {
      setCompletedEntries(data);
    }
  };

  const handleMarkCompleted = async () => {
    if (!user || !selectedDate) return;

    // Check for duplicate date
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const isDuplicate = completedEntries.some(entry => entry.date === dateStr);
    
    if (isDuplicate) {
      toast({
        title: t('fastingQada.error'),
        description: t('fastingQada.duplicateDate'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('fasting_entries')
        .insert({
          user_id: user.id,
          date: dateStr,
          is_completed: true,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: t('fastingQada.success'),
        description: t('fastingQada.dayMarked'),
      });

      setSelectedDate(undefined);
      fetchCompletedEntries();
    } catch (error: any) {
      toast({
        title: t('fastingQada.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteEntry = async () => {
    if (!user || !entryToDelete) return;

    try {
      const { error } = await supabase
        .from('fasting_entries')
        .delete()
        .eq('id', entryToDelete);

      if (error) throw error;

      toast({
        title: t('fastingQada.success'),
        description: t('fastingQada.dayRemoved'),
      });

      fetchCompletedEntries();
    } catch (error: any) {
      toast({
        title: t('fastingQada.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    }
  };

  const handleClearAll = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('fasting_entries')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: t('fastingQada.success'),
        description: t('fastingQada.allCleared'),
      });

      fetchCompletedEntries();
    } catch (error: any) {
      toast({
        title: t('fastingQada.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setClearAllDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg z-10 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <BackIcon className="w-6 h-6" />
          </button>
          
          <h1 className="text-xl font-bold">{t('fastingQada.title')}</h1>
          
          <div className="w-10"></div>
        </div>
      </div>

      {initialLoading ? (
        <div className="p-4">
          <Card className="glass shadow-elegant">
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">{t('fastingQada.calculating')}</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Progress Ring Card */}
          <Card className="glass shadow-elegant bg-gradient-to-br from-fasting/10 to-fasting/5">
            <CardContent className="pt-8 pb-6">
              <div className="flex flex-col items-center space-y-6">
                <ProgressRing progress={progress} size={220} strokeWidth={20}>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-fasting">
                      {remaining}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t('fastingQada.remaining')}
                    </div>
                  </div>
                </ProgressRing>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 w-full max-w-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {missedDays}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('fastingQada.missedDays')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      {completed}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('fastingQada.completed')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-fasting">
                      {remaining}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('fastingQada.remaining')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mark Completion */}
          <Card className="glass shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t('fastingQada.markCompleted')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-12',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, 'PPP', { locale: dateLocale })
                    ) : (
                      <span>{t('fastingQada.selectDate')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      // Disable future dates
                      if (date > new Date()) return true;
                      // Disable already completed dates
                      const dateStr = format(date, 'yyyy-MM-dd');
                      return completedEntries.some(entry => entry.date === dateStr);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Button
                onClick={handleMarkCompleted}
                disabled={!selectedDate || loading}
                className="w-full h-12 rounded-full"
              >
                <Check className="w-5 h-5 mr-2" />
                {loading ? t('loading') : t('fastingQada.markAsCompleted')}
              </Button>
            </CardContent>
          </Card>

          {/* Completed List */}
          {completedEntries.length > 0 ? (
            <Card className="glass shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {t('fastingQada.completedDays')}
                </CardTitle>
                {completedEntries.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setClearAllDialogOpen(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t('fastingQada.clearAll')}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {completedEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {format(parseISO(entry.date), 'PPP', { locale: dateLocale })}
                          </div>
                          {entry.completed_at && (
                            <div className="text-xs text-muted-foreground">
                              {t('fastingQada.completedOn')}: {format(parseISO(entry.completed_at), 'PP', { locale: dateLocale })}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => confirmDelete(entry.id)}
                        className="p-2 hover:bg-destructive/10 rounded-full transition-colors text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            missedDays > 0 && (
              <Card className="glass shadow-elegant">
                <CardContent className="p-8 text-center">
                  <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {t('fastingQada.noCompletedDays')}
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('fastingQada.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('fastingQada.confirmDeleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('fastingQada.confirmClearAll')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('fastingQada.confirmClearAllDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('fastingQada.clearAll')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
