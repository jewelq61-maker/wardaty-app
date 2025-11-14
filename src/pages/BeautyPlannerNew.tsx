import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Bell, Crown, Calendar as CalendarIcon, 
  Sparkles, TrendingUp, Lock, AlertCircle
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, parseISO, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import PremiumPaywall from '@/components/PremiumPaywall';
import {
  calculateBeautyRecommendation,
  getCategoryIcon,
  getCategoryName,
  type BeautyCategory,
  type CyclePhase
} from '@/utils/beautyCalculations';

interface BeautyAction {
  id: string;
  title: string;
  beauty_category: BeautyCategory;
  action_type: 'system' | 'custom';
  scheduled_at?: string;
  score?: number;
  reason?: string;
  warnings?: string[];
  notes?: string;
  phase: CyclePhase;
  goal?: string;
}

const beautyCategories: BeautyCategory[] = [
  'haircut',
  'waxing',
  'laser',
  'facial',
  'microneedling',
  'botox',
  'moroccan-bath',
  'scrub',
  'hair-mask',
  'hair-oiling',
  'massage',
  'hijama'
];

const haircutGoals = [
  { value: 'faster-growth', label: 'نمو أسرع' },
  { value: 'thicker', label: 'شعر أكثف' },
  { value: 'reduce-volume', label: 'تقليل الكثافة' },
  { value: 'maintain', label: 'الحفاظ على الشكل' }
];

export default function BeautyPlannerNew() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [systemRecommendations, setSystemRecommendations] = useState<BeautyAction[]>([]);
  const [customActions, setCustomActions] = useState<BeautyAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<CyclePhase>('follicular');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  
  const [newAction, setNewAction] = useState({
    title: '',
    beauty_category: 'haircut' as BeautyCategory,
    scheduled_at: undefined as Date | undefined,
    notes: ''
  });

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
      fetchCyclePhase();
    }
  }, [user]);

  useEffect(() => {
    if (isPremium && currentPhase) {
      generateRecommendations();
      fetchCustomActions();
    }
  }, [isPremium, currentPhase, selectedGoal]);

  const checkPremiumStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();
    
    const premium = data?.is_premium || false;
    setIsPremium(premium);
    
    if (!premium) {
      setShowPaywall(true);
    }
  };

  const fetchCyclePhase = async () => {
    if (!user) return;
    
    const { data: latestCycle } = await supabase
      .from('cycles')
      .select('start_date, length, duration')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (latestCycle) {
      const cycleLength = latestCycle.length || 28;
      const periodDuration = latestCycle.duration || 5;
      const startDate = parseISO(latestCycle.start_date);
      const today = new Date();
      const dayInCycle = differenceInDays(today, startDate) % cycleLength;
      
      let phase: CyclePhase = 'follicular';
      if (dayInCycle < periodDuration) {
        phase = 'menstrual';
      } else if (dayInCycle >= periodDuration && dayInCycle < 14) {
        phase = 'follicular';
      } else if (dayInCycle >= 14 && dayInCycle < 16) {
        phase = 'ovulation';
      } else {
        phase = 'luteal';
      }
      
      setCurrentPhase(phase);
    }
  };

  const generateRecommendations = () => {
    setLoading(true);
    const today = new Date();
    const recommendations: BeautyAction[] = [];
    
    // إنشاء توصيات للـ 14 يوم القادمة
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      
      beautyCategories.forEach(category => {
        const { score, reason, warnings } = calculateBeautyRecommendation(
          category,
          currentPhase,
          date,
          category === 'haircut' ? selectedGoal : undefined
        );
        
        // فقط التوصيات بدرجة 50% أو أكثر
        if (score >= 50) {
          recommendations.push({
            id: `${category}-${i}`,
            title: getCategoryName(category),
            beauty_category: category,
            action_type: 'system',
            scheduled_at: date.toISOString(),
            score,
            reason,
            warnings,
            phase: currentPhase,
            goal: category === 'haircut' ? selectedGoal : undefined
          });
        }
      });
    }
    
    // ترتيب حسب الدرجة
    recommendations.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    setSystemRecommendations(recommendations.slice(0, 20)); // أفضل 20 توصية
    setLoading(false);
  };

  const fetchCustomActions = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('beauty_actions')
      .select('*')
      .eq('user_id', user.id)
      .eq('action_type', 'custom')
      .order('scheduled_at', { ascending: true });
    
    if (data) {
      setCustomActions(data as BeautyAction[]);
    }
  };

  const handleAddCustomAction = async () => {
    if (!user || !newAction.scheduled_at) return;
    
    const { error } = await supabase
      .from('beauty_actions')
      .insert({
        user_id: user.id,
        title: newAction.title,
        beauty_category: newAction.beauty_category,
        action_type: 'custom',
        scheduled_at: newAction.scheduled_at.toISOString(),
        notes: newAction.notes,
        phase: currentPhase
      });
    
    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إضافة الموعد',
        variant: 'destructive'
      });
      return;
    }
    
    toast({
      title: 'تم بنجاح',
      description: 'تم إضافة موعد جديد'
    });
    
    setIsAddingAction(false);
    setNewAction({
      title: '',
      beauty_category: 'haircut',
      scheduled_at: undefined,
      notes: ''
    });
    fetchCustomActions();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-info';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success/10 border-success/20';
    if (score >= 60) return 'bg-info/10 border-info/20';
    if (score >= 40) return 'bg-warning/10 border-warning/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  if (!isPremium) {
    return (
      <>
        <div className="min-h-screen gradient-bg pb-24">
          {/* Header */}
          <div className="sticky top-0 bg-card/80 backdrop-blur-lg z-10 border-b border-border/50">
            <div className="p-4 flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20 shadow-elegant">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                    {user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    مخطط الجمال
                  </h1>
                  <p className="text-sm text-muted-foreground">ميزة حصرية لوردية بلس</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                <Crown className="h-4 w-4 mr-1" />
                بلس
              </Badge>
            </div>
          </div>

          {/* Locked Content */}
          <div className="p-6 max-w-3xl mx-auto">
            <Card className="glass border-primary/20 shadow-elegant overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
              <CardContent className="relative p-12 text-center space-y-6">
                <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Lock className="h-12 w-12 text-primary" />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold">اكتشفي مخطط الجمال الذكي</h2>
                  <p className="text-muted-foreground text-lg">
                    اعرفي أفضل الأيام لقص الشعر، الحجامة، والعناية بالبشرة<br />
                    حسب دورتك الشهرية ومراحل القمر
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6">
                  {['توصيات يومية ذكية', 'حسابات القمر والحجامة', 'أهداف شخصية', 'تكامل مع التقويم'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-primary" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  size="lg"
                  className="w-full max-w-md h-14 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  onClick={() => setShowPaywall(true)}
                >
                  <Crown className="mr-2 h-5 w-5" />
                  اشتركي في وردية بلس
                </Button>
              </CardContent>
            </Card>
          </div>

          <BottomNav />
        </div>

        <PremiumPaywall 
          open={showPaywall} 
          onClose={() => setShowPaywall(false)} 
        />
      </>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-card/80 backdrop-blur-lg z-10 border-b border-border/50">
        <div className="p-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 shadow-elegant">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                {user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                مخطط الجمال
              </h1>
              <p className="text-sm text-muted-foreground">{systemRecommendations.length} توصية ذكية</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
              <Crown className="h-4 w-4 mr-1" />
              بلس
            </Badge>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        {/* Haircut Goal Selector */}
        <Card className="glass shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              هدفك من قص الشعر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger>
                <SelectValue placeholder="اختاري هدفك" />
              </SelectTrigger>
              <SelectContent>
                {haircutGoals.map(goal => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* System Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              توصيات ذكية
            </h2>
            <Sheet open={isAddingAction} onOpenChange={setIsAddingAction}>
              <SheetTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة موعد
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh]">
                <SheetHeader>
                  <SheetTitle>إضافة موعد جمالي</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 py-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        اسم الإجراء
                      </label>
                      <Input
                        id="title"
                        placeholder="مثال: قص الشعر، تنظيف بشرة"
                        value={newAction.title}
                        onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        الفئة
                      </label>
                      <Select onValueChange={(value) => setNewAction({ ...newAction, beauty_category: value as BeautyCategory })}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختاري الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {beautyCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {getCategoryName(category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="date" className="text-sm font-medium">
                        التاريخ
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className="w-[300px] justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newAction.scheduled_at ? (
                              format(newAction.scheduled_at, 'd MMMM yyyy', { locale: ar })
                            ) : (
                              <span>اختاري التاريخ</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center" side="bottom">
                          <Calendar
                            mode="single"
                            selected={newAction.scheduled_at}
                            onSelect={(date) => setNewAction({ ...newAction, scheduled_at: date })}
                            disabled={(date) =>
                              date > addDays(new Date(), 30) || date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="notes" className="text-sm font-medium">
                        ملاحظات
                      </label>
                      <Textarea
                        id="notes"
                        placeholder="ملاحظات إضافية"
                        value={newAction.notes}
                        onChange={(e) => setNewAction({ ...newAction, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleAddCustomAction}>
                    إضافة
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 glass rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {systemRecommendations.map(rec => (
                <Card key={rec.id} className={`glass shadow-elegant border-2 ${getScoreBg(rec.score || 0)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{getCategoryIcon(rec.beauty_category)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{rec.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {rec.scheduled_at && format(parseISO(rec.scheduled_at), 'EEEE، d MMMM', { locale: ar })}
                            </p>
                          </div>
                          <Badge className={`${getScoreBg(rec.score || 0)} ${getScoreColor(rec.score || 0)}`}>
                            {rec.score}%
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                        
                        {rec.warnings && rec.warnings.length > 0 && (
                          <div className="flex items-start gap-2 mt-3 p-3 bg-warning/10 border border-warning/20 rounded-xl">
                            <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-warning space-y-1">
                              {rec.warnings.map((warning, i) => (
                                <p key={i}>{warning}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Custom Actions */}
        {customActions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              مواعيدك
            </h2>
            <div className="grid gap-4">
              {customActions.map(action => (
                <Card key={action.id} className="glass shadow-elegant">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{getCategoryIcon(action.beauty_category)}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {action.scheduled_at && format(parseISO(action.scheduled_at), 'EEEE، d MMMM', { locale: ar })}
                        </p>
                        {action.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{action.notes}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
