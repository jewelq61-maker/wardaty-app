import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Calendar as CalendarIcon, Baby, Clock, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface PartnerData {
  name: string;
  email: string;
  cycleLength: number;
  periodDuration: number;
  currentDay: number;
  daysUntilPeriod: number;
  nextPeriodDate: string;
  lastPeriodDate: string;
  isPregnant: boolean;
  pregnancyWeeks?: number;
  pregnancyDueDate?: string;
}

interface PrivacySettings {
  show_period_days: boolean;
  show_fertility_window: boolean;
  show_general_mood: boolean;
  show_pregnancy: boolean;
  show_nothing: boolean;
}

export default function PartnerView() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    show_period_days: true,
    show_fertility_window: true,
    show_general_mood: false,
    show_pregnancy: true,
    show_nothing: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPartnerData();
    }
  }, [user]);

  const loadPartnerData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: shareLink, error: linkError } = await supabase
        .from('share_links')
        .select(`
          id, 
          owner_id, 
          privacy_settings,
          profiles!share_links_owner_id_fkey(
            name, 
            email, 
            is_pregnant, 
            pregnancy_weeks, 
            pregnancy_edd
          )
        `)
        .eq('connected_user_id', user.id)
        .eq('type', 'profile')
        .eq('status', 'active')
        .maybeSingle();

      if (linkError || !shareLink) {
        toast({
          title: 'خطأ',
          description: 'لم يتم العثور على اتصال نشط',
          variant: 'destructive',
        });
        navigate('/profile');
        return;
      }

      const ownerId = shareLink.owner_id;
      
      if (shareLink.privacy_settings) {
        setPrivacySettings(shareLink.privacy_settings as unknown as PrivacySettings);
      }

      const profile = (shareLink as any).profiles;

      const { data: latestCycle } = await supabase
        .from('cycles')
        .select('start_date, length, duration')
        .eq('user_id', ownerId)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestCycle && latestCycle.start_date) {
        const startDate = parseISO(latestCycle.start_date);
        const today = new Date();
        const currentDay = differenceInDays(today, startDate) + 1;
        const cycleLength = latestCycle.length || 28;
        const daysUntilPeriod = cycleLength - currentDay;
        const nextPeriodDate = addDays(startDate, cycleLength);

        setPartnerData({
          name: profile.name || 'شريكتك',
          email: profile.email || '',
          cycleLength,
          periodDuration: latestCycle.duration || 5,
          currentDay,
          daysUntilPeriod: daysUntilPeriod > 0 ? daysUntilPeriod : 0,
          nextPeriodDate: format(nextPeriodDate, 'yyyy-MM-dd'),
          lastPeriodDate: latestCycle.start_date,
          isPregnant: profile.is_pregnant || false,
          pregnancyWeeks: profile.pregnancy_weeks,
          pregnancyDueDate: profile.pregnancy_edd,
        });
      } else {
        setPartnerData({
          name: profile.name || 'شريكتك',
          email: profile.email || '',
          cycleLength: 28,
          periodDuration: 5,
          currentDay: 0,
          daysUntilPeriod: 0,
          nextPeriodDate: '',
          lastPeriodDate: '',
          isPregnant: profile.is_pregnant || false,
          pregnancyWeeks: profile.pregnancy_weeks,
          pregnancyDueDate: profile.pregnancy_edd,
        });
      }
    } catch (error) {
      console.error('Error loading partner data:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCyclePhaseText = () => {
    if (!partnerData) return '';
    
    const { currentDay, periodDuration, daysUntilPeriod } = partnerData;
    
    if (currentDay <= periodDuration) {
      return 'أيام الدورة';
    } else if (daysUntilPeriod <= 7) {
      return `قبل الدورة بـ ${daysUntilPeriod} ${daysUntilPeriod === 1 ? 'يوم' : 'أيام'}`;
    } else if (currentDay >= 11 && currentDay <= 17) {
      return 'فترة الخصوبة (تقريبية)';
    } else {
      return `اليوم ${currentDay} من الدورة`;
    }
  };

  const getMoodSuggestion = () => {
    if (!partnerData) return '';
    
    const { currentDay, periodDuration, daysUntilPeriod } = partnerData;
    
    if (currentDay <= periodDuration) {
      return '💙 احتياج للراحة والدعم';
    } else if (daysUntilPeriod <= 5) {
      return '💛 قد تكون الطاقة منخفضة';
    } else if (currentDay >= 11 && currentDay <= 17) {
      return '💚 طاقة عالية وحيوية';
    } else {
      return '💙 حالة طبيعية';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!partnerData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
            <Button onClick={() => navigate('/profile')} className="mt-4">
              العودة للملف الشخصي
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (privacySettings.show_nothing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">الخصوصية محمية</h2>
            <p className="text-muted-foreground">
              {partnerData.name} اختارت عدم مشاركة أي معلومات في الوقت الحالي
            </p>
            <Button onClick={() => navigate('/profile')} variant="outline">
              العودة للملف الشخصي
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary fill-primary" />
                {partnerData.name}
              </h1>
              <p className="text-sm text-muted-foreground">معلومات عامة فقط</p>
            </div>
          </div>

          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {partnerData.isPregnant && privacySettings.show_pregnancy ? (
                  <>
                    <Badge className="text-lg px-4 py-2" variant="secondary">
                      <Baby className="w-5 h-5 ml-2" />
                      حامل - الأسبوع {partnerData.pregnancyWeeks || 0}
                    </Badge>
                    {partnerData.pregnancyDueDate && (
                      <p className="text-sm text-muted-foreground">
                        موعد الولادة المتوقع: {format(parseISO(partnerData.pregnancyDueDate), 'PP', { locale: ar })}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-primary">
                      {privacySettings.show_period_days ? getCyclePhaseText() : 'معلومات محدودة'}
                    </div>
                    {privacySettings.show_period_days && partnerData.daysUntilPeriod > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>متبقي {partnerData.daysUntilPeriod} {partnerData.daysUntilPeriod === 1 ? 'يوم' : 'أيام'}</span>
                        </div>
                        <Progress 
                          value={(partnerData.currentDay / partnerData.cycleLength) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {privacySettings.show_general_mood && !partnerData.isPregnant && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5" />
                نصيحة عامة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{getMoodSuggestion()}</p>
            </CardContent>
          </Card>
        )}

        {privacySettings.show_period_days && !partnerData.isPregnant && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                معلومات الدورة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">طول الدورة</p>
                  <p className="text-2xl font-bold">{partnerData.cycleLength} يوم</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">مدة الدورة</p>
                  <p className="text-2xl font-bold">{partnerData.periodDuration} أيام</p>
                </div>
              </div>
              
              {partnerData.nextPeriodDate && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">الدورة القادمة المتوقعة</p>
                  <p className="text-lg font-semibold">
                    {format(parseISO(partnerData.nextPeriodDate), 'PPP', { locale: ar })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {privacySettings.show_fertility_window && !partnerData.isPregnant && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5" />
                نافذة الخصوبة (تقريبية)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                <p className="text-muted-foreground">
                  الأيام من {Math.floor(partnerData.cycleLength / 2) - 3} إلى {Math.floor(partnerData.cycleLength / 2) + 3} من الدورة قد تكون أيام خصوبة عالية
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  * هذه معلومات تقريبية فقط ولا تعتبر وسيلة موثوقة لمنع الحمل
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/30 border-dashed animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">معلومات محمية بالخصوصية</p>
                <p className="text-xs text-muted-foreground">
                  لا يمكنك رؤية الأعراض، المزاج التفصيلي، الأدوية، أو أي معلومات شخصية أخرى. 
                  هذه البيانات معروضة بموافقة {partnerData.name} فقط.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}