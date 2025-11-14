import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Baby,
  Heart,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Edit2,
  Trash2,
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
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
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
  const [motherProfile, setMotherProfile] = useState<MotherProfile>({
    pregnancy_due_date: null,
    pregnancy_weeks: null,
    postpartum_start_date: null,
    breastfeeding: false,
    breastfeeding_start_date: null,
  });
  const [showAddDaughter, setShowAddDaughter] = useState(false);
  const [newDaughter, setNewDaughter] = useState({
    name: '',
    birth_date: undefined as Date | undefined,
    cycle_start_age: '',
    notes: '',
  });

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
  };

  const handleAddDaughter = async () => {
    if (!user || !newDaughter.name) return;

    const { error } = await supabase.from('daughters').insert({
      mother_id: user.id,
      name: newDaughter.name,
      birth_date: newDaughter.birth_date?.toISOString().split('T')[0],
      cycle_start_age: newDaughter.cycle_start_age ? parseInt(newDaughter.cycle_start_age) : null,
      notes: newDaughter.notes,
    });

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إضافة البنت',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'تم بنجاح',
      description: 'تمت إضافة البنت بنجاح',
    });

    setShowAddDaughter(false);
    setNewDaughter({ name: '', birth_date: undefined, cycle_start_age: '', notes: '' });
    loadDaughters();
  };

  const handleUpdateMotherProfile = async (updates: Partial<MotherProfile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء التحديث',
        variant: 'destructive',
      });
      return;
    }

    setMotherProfile({ ...motherProfile, ...updates });
    toast({
      title: 'تم التحديث',
      description: 'تم تحديث معلوماتك بنجاح',
    });
  };

  if (!isPremium && showPaywall) {
    return <PremiumPaywall open={showPaywall} onClose={() => navigate(-1)} feature="mother-features" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border/50">
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
        {/* Pregnancy & Postpartum */}
        <Card className="glass shadow-elegant">
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

        {/* Daughters */}
        <Card className="glass shadow-elegant">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                بناتي
              </CardTitle>
              <Button size="sm" onClick={() => setShowAddDaughter(true)}>
                <Plus className="h-4 w-4 mr-1" />
                إضافة
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {daughters.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                لم تضيفي أي بنت بعد
              </p>
            ) : (
              daughters.map((daughter) => (
                <div
                  key={daughter.id}
                  className="p-4 rounded-xl border border-border bg-card/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{daughter.name}</h4>
                      {daughter.birth_date && (
                        <p className="text-sm text-muted-foreground">
                          تاريخ الميلاد: {format(new Date(daughter.birth_date), 'PPP', { locale: ar })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Daughter Dialog */}
      <Dialog open={showAddDaughter} onOpenChange={setShowAddDaughter}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة بنت</DialogTitle>
            <DialogDescription>
              أضيفي معلومات البنت لمتابعة دورتها
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                value={newDaughter.name}
                onChange={(e) => setNewDaughter({ ...newDaughter, name: e.target.value })}
                placeholder="اسم البنت"
              />
            </div>

            <div>
              <Label>تاريخ الميلاد</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-right',
                      !newDaughter.birth_date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {newDaughter.birth_date
                      ? format(newDaughter.birth_date, 'PPP', { locale: ar })
                      : 'اختاري التاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={newDaughter.notes}
                onChange={(e) => setNewDaughter({ ...newDaughter, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية"
              />
            </div>

            <Button className="w-full" onClick={handleAddDaughter}>
              إضافة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
