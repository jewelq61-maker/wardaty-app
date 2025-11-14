import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Baby,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Edit2,
  Trash2,
  Moon,
  Droplets,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import PremiumPaywall from '@/components/PremiumPaywall';

interface Daughter {
  id: string;
  name: string;
  birth_date: string | null;
  cycle_start_age: number | null;
  notes: string | null;
}

interface DaughterStats {
  totalFasting: number;
  completed: number;
  lastCycleDate: string | null;
  nextCycleDate: string | null;
  currentDay: number | null;
}

interface MotherProfile {
  pregnancy_due_date: string | null;
  pregnancy_weeks: number | null;
  postpartum_start_date: string | null;
  breastfeeding: boolean;
  breastfeeding_start_date: string | null;
}

export default function MotherFeatures() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { dir } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [daughters, setDaughters] = useState<Daughter[]>([]);
  const [daughterStats, setDaughterStats] = useState<Record<string, DaughterStats>>({});
  const [motherProfile, setMotherProfile] = useState<MotherProfile>({
    pregnancy_due_date: null,
    pregnancy_weeks: null,
    postpartum_start_date: null,
    breastfeeding: false,
    breastfeeding_start_date: null,
  });
  const [showAddDaughter, setShowAddDaughter] = useState(false);
  const [showDaughterDetails, setShowDaughterDetails] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [newDaughter, setNewDaughter] = useState({
    name: '',
    birth_date: undefined as Date | undefined,
    cycle_start_age: '',
    notes: '',
  });
  const [cycleDate, setCycleDate] = useState<Date | undefined>(undefined);
  const [fastingDays, setFastingDays] = useState('');

  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('is_premium, persona, pregnancy_due_date, pregnancy_weeks, postpartum_start_date, breastfeeding, breastfeeding_start_date')
      .eq('id', user.id)
      .single();

    const premium = data?.is_premium || false;
    setIsPremium(premium);

    if (data?.persona !== 'mother') {
      navigate('/profile');
      return;
    }

    if (!premium) {
      setShowPaywall(true);
      return;
    }

    setMotherProfile({
      pregnancy_due_date: data?.pregnancy_due_date,
      pregnancy_weeks: data?.pregnancy_weeks,
      postpartum_start_date: data?.postpartum_start_date,
      breastfeeding: data?.breastfeeding || false,
      breastfeeding_start_date: data?.breastfeeding_start_date,
    });

    loadDaughters();
  };

  const loadDaughters = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('daughters')
      .select('*')
      .eq('mother_id', user.id)
      .order('birth_date', { ascending: false });

    setDaughters(data || []);

    if (data) {
      for (const daughter of data) {
        await loadDaughterStats(daughter.id);
      }
    }
  };

  const loadDaughterStats = async (daughterId: string) => {
    const { data: lastCycle } = await supabase
      .from('daughter_cycles')
      .select('*')
      .eq('daughter_id', daughterId)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: fastingEntries } = await supabase
      .from('daughter_fasting_entries')
      .select('*')
      .eq('daughter_id', daughterId);

    const totalFasting = fastingEntries?.length || 0;
    const completed = fastingEntries?.filter(e => e.is_completed).length || 0;
    
    let currentDay = null;
    let nextCycleDate = null;

    if (lastCycle) {
      const today = new Date();
      const startDate = new Date(lastCycle.start_date);
      const daysSinceStart = differenceInDays(today, startDate);
      currentDay = daysSinceStart + 1;

      if (lastCycle.length) {
        const nextDate = new Date(startDate);
        nextDate.setDate(nextDate.getDate() + lastCycle.length);
        nextCycleDate = nextDate.toISOString();
      }
    }

    setDaughterStats(prev => ({
      ...prev,
      [daughterId]: {
        totalFasting,
        completed,
        lastCycleDate: lastCycle?.start_date || null,
        nextCycleDate,
        currentDay,
      }
    }));
  };

  const handleAddDaughter = async () => {
    if (!user || !newDaughter.name) {
      toast({
        title: t('error'),
        description: 'الرجاء إدخال اسم البنت',
        variant: 'destructive',
      });
      return;
    }

    if (daughters.length >= 3) {
      toast({
        title: t('error'),
        description: 'لا يمكن إضافة أكثر من 3 بنات',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('daughters').insert({
      mother_id: user.id,
      name: newDaughter.name,
      birth_date: newDaughter.birth_date?.toISOString().split('T')[0],
      cycle_start_age: newDaughter.cycle_start_age ? parseInt(newDaughter.cycle_start_age) : null,
      notes: newDaughter.notes,
    });

    if (error) {
      toast({
        title: t('error'),
        description: 'حدث خطأ أثناء إضافة البنت',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('success'),
      description: 'تمت إضافة البنت بنجاح',
    });

    setShowAddDaughter(false);
    setNewDaughter({ name: '', birth_date: undefined, cycle_start_age: '', notes: '' });
    loadDaughters();
  };

  const handleDeleteDaughter = async (daughterId: string) => {
    const { error } = await supabase
      .from('daughters')
      .delete()
      .eq('id', daughterId);

    if (error) {
      toast({
        title: t('error'),
        description: 'حدث خطأ أثناء الحذف',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('success'),
      description: 'تم حذف البنت بنجاح',
    });

    setShowDeleteDialog(null);
    loadDaughters();
  };

  const handleAddCycle = async (daughterId: string) => {
    if (!cycleDate) return;

    const { error } = await supabase.from('daughter_cycles').insert({
      daughter_id: daughterId,
      start_date: cycleDate.toISOString().split('T')[0],
      length: 28,
    });

    if (error) {
      toast({
        title: t('error'),
        description: 'حدث خطأ أثناء إضافة الدورة',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('success'),
      description: 'تمت إضافة الدورة بنجاح',
    });

    setCycleDate(undefined);
    loadDaughterStats(daughterId);
  };

  const handleAddFastingDays = async (daughterId: string) => {
    if (!fastingDays || parseInt(fastingDays) <= 0) return;

    const days = parseInt(fastingDays);
    const entries = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      entries.push({
        daughter_id: daughterId,
        date: date.toISOString().split('T')[0],
        is_completed: false,
      });
    }

    const { error } = await supabase
      .from('daughter_fasting_entries')
      .insert(entries);

    if (error) {
      toast({
        title: t('error'),
        description: 'حدث خطأ أثناء إضافة أيام القضاء',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('success'),
      description: `تمت إضافة ${days} يوم قضاء بنجاح`,
    });

    setFastingDays('');
    loadDaughterStats(daughterId);
  };

  const handleUpdateMotherProfile = async (updates: Partial<MotherProfile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      toast({
        title: t('error'),
        description: 'حدث خطأ أثناء التحديث',
        variant: 'destructive',
      });
      return;
    }

    setMotherProfile({ ...motherProfile, ...updates });
    toast({
      title: t('success'),
      description: 'تم تحديث معلوماتك بنجاح',
    });
  };

  if (!isPremium && showPaywall) {
    return <PremiumPaywall open={showPaywall} onClose={() => navigate(-1)} feature="mother-features" />;
  }

  const selectedDaughter = daughters.find(d => d.id === showDaughterDetails);

  return (
    <div className="min-h-screen gradient-bg pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <BackIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">ميزات الأم</h1>
              <p className="text-sm text-muted-foreground">متابعة الحمل والنفاس والبنات</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5 text-primary" />
              الحمل والنفاس والرضاعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>الرضاعة الطبيعية</Label>
              <Switch
                checked={motherProfile.breastfeeding}
                onCheckedChange={(checked) =>
                  handleUpdateMotherProfile({ breastfeeding: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                بناتي ({daughters.length}/3)
              </CardTitle>
              {daughters.length < 3 && (
                <Button size="sm" onClick={() => setShowAddDaughter(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  إضافة
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {daughters.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لم تضيفي أي بنت بعد</p>
            ) : (
              <div className="space-y-4">
                {daughters.map((daughter) => {
                  const stats = daughterStats[daughter.id];
                  return (
                    <Card key={daughter.id} className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{daughter.name}</h3>
                            {daughter.birth_date && (
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(daughter.birth_date), 'dd/MM/yyyy')}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowDaughterDetails(daughter.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setShowDeleteDialog(daughter.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {stats && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-background/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Droplets className="h-4 w-4 text-period" />
                                <span className="text-xs font-medium">الدورة</span>
                              </div>
                              {stats.lastCycleDate ? (
                                <>
                                  <p className="text-sm">
                                    اليوم: <span className="font-bold">{stats.currentDay}</span>
                                  </p>
                                  {stats.nextCycleDate && (
                                    <p className="text-xs text-muted-foreground">
                                      القادمة: {format(new Date(stats.nextCycleDate), 'dd/MM')}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="text-xs text-muted-foreground">لم تسجل بعد</p>
                              )}
                            </div>

                            <div className="bg-background/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Moon className="h-4 w-4 text-primary" />
                                <span className="text-xs font-medium">القضاء</span>
                              </div>
                              <p className="text-sm">
                                <span className="font-bold text-success">{stats.completed}</span> / {stats.totalFasting}
                              </p>
                              {stats.totalFasting > 0 && (
                                <Progress
                                  value={(stats.completed / stats.totalFasting) * 100}
                                  className="h-1 mt-2"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddDaughter} onOpenChange={setShowAddDaughter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة بنت جديدة</DialogTitle>
            <DialogDescription>
              أضيفي معلومات بنتك لمتابعة دورتها والقضاء
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الاسم *</Label>
              <Input
                value={newDaughter.name}
                onChange={(e) => setNewDaughter({ ...newDaughter, name: e.target.value })}
                placeholder="أدخلي اسم البنت"
              />
            </div>

            <div>
              <Label>تاريخ الميلاد</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !newDaughter.birth_date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDaughter.birth_date
                      ? format(newDaughter.birth_date, 'PPP', { locale: ar })
                      : 'اختاري التاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newDaughter.birth_date}
                    onSelect={(date) => setNewDaughter({ ...newDaughter, birth_date: date })}
                    locale={ar}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>عمر بداية الدورة</Label>
              <Input
                type="number"
                value={newDaughter.cycle_start_age}
                onChange={(e) =>
                  setNewDaughter({ ...newDaughter, cycle_start_age: e.target.value })
                }
                placeholder="مثال: 12"
              />
            </div>

            <div>
              <Label>ملاحظات</Label>
              <Textarea
                value={newDaughter.notes}
                onChange={(e) => setNewDaughter({ ...newDaughter, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddDaughter} className="flex-1">
                إضافة
              </Button>
              <Button variant="outline" onClick={() => setShowAddDaughter(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedDaughter && (
        <Dialog open={!!showDaughterDetails} onOpenChange={(open) => !open && setShowDaughterDetails(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedDaughter.name}</DialogTitle>
              <DialogDescription>إدارة الدورة والقضاء</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">تسجيل دورة جديدة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {cycleDate ? format(cycleDate, 'PPP', { locale: ar }) : 'اختاري تاريخ بداية الدورة'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={cycleDate}
                        onSelect={setCycleDate}
                        locale={ar}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    onClick={() => handleAddCycle(selectedDaughter.id)}
                    disabled={!cycleDate}
                    className="w-full"
                    size="sm"
                  >
                    تسجيل الدورة
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">إضافة أيام قضاء</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    type="number"
                    value={fastingDays}
                    onChange={(e) => setFastingDays(e.target.value)}
                    placeholder="عدد الأيام"
                    min="1"
                  />
                  <Button
                    onClick={() => handleAddFastingDays(selectedDaughter.id)}
                    disabled={!fastingDays || parseInt(fastingDays) <= 0}
                    className="w-full"
                    size="sm"
                  >
                    إضافة أيام القضاء
                  </Button>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنتِ متأكدة من حذف هذه البنت؟ سيتم حذف جميع بياناتها بما في ذلك الدورات والقضاء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteDialog && handleDeleteDaughter(showDeleteDialog)}
              className="bg-destructive text-destructive-foreground"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
