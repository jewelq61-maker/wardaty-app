import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Scissors, Droplet, Heart, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Recommendation {
  recommended: boolean;
  score: number;
  reason: string;
  benefits?: string[];
  treatments?: string[];
  avoid?: string[];
  hijriDay?: number;
  considerations?: string[];
}

interface Recommendations {
  haircut: Recommendation;
  hijama: Recommendation;
  skincare: Recommendation;
  waxing: Recommendation;
  generalAdvice: string;
}

interface CycleInfo {
  phase: string;
  cycleDay: number;
  totalDays: number;
  hijriDay: number;
  isGoodHijamaDay: boolean;
}

export default function BeautyRecommendations() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('beauty-recommendations', {
        body: { userId: user.id, currentDate: new Date().toISOString() },
      });

      if (error) {
        if (error.message.includes('429')) {
          toast({
            title: t('common.error'),
            description: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.',
            variant: 'destructive',
          });
        } else if (error.message.includes('402')) {
          toast({
            title: t('common.error'),
            description: 'يرجى إضافة رصيد إلى حساب Lovable AI.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      if (data) {
        setRecommendations(data.recommendations);
        setCycleInfo(data.cycleInfo);
      }
    } catch (error: any) {
      console.error('Error loading recommendations:', error);
      toast({
        title: t('common.error'),
        description: error.message || 'حدث خطأ في تحميل التوصيات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-950';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-950';
    return 'bg-red-100 dark:bg-red-950';
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || !cycleInfo) return null;

  const getPhaseText = (phase: string) => {
    const phases: Record<string, string> = {
      menstrual: 'فترة الحيض',
      follicular: 'المرحلة الجريبية',
      ovulation: 'فترة الإباضة',
      luteal: 'المرحلة الأصفرية',
    };
    return phases[phase] || phase;
  };

  return (
    <div className="space-y-4">
      {/* Cycle Info Card */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>التوصيات الذكية للجمال</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">المرحلة الحالية</p>
              <p className="font-semibold">{getPhaseText(cycleInfo.phase)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">اليوم</p>
              <p className="font-semibold">{cycleInfo.cycleDay} / {cycleInfo.totalDays}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">اليوم الهجري</p>
              <p className="font-semibold">{cycleInfo.hijriDay}</p>
            </div>
          </div>

          {cycleInfo.isGoodHijamaDay && (
            <Badge variant="default" className="w-full justify-center py-2">
              <CheckCircle2 className="h-4 w-4 ml-2" />
              اليوم مناسب للحجامة
            </Badge>
          )}

          <p className="text-sm text-muted-foreground italic">{recommendations.generalAdvice}</p>
        </CardContent>
      </Card>

      {/* Haircut Recommendation */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-full', getScoreBg(recommendations.haircut.score))}>
              <Scissors className={cn('h-6 w-6', getScoreColor(recommendations.haircut.score))} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">قص الشعر</h3>
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-bold', getScoreColor(recommendations.haircut.score))}>
                    {recommendations.haircut.score}%
                  </span>
                  {recommendations.haircut.recommended ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{recommendations.haircut.reason}</p>
              {recommendations.haircut.benefits && recommendations.haircut.benefits.length > 0 && (
                <ul className="text-sm space-y-1">
                  {recommendations.haircut.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hijama Recommendation */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-full', getScoreBg(recommendations.hijama.score))}>
              <Droplet className={cn('h-6 w-6', getScoreColor(recommendations.hijama.score))} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">الحجامة</h3>
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-bold', getScoreColor(recommendations.hijama.score))}>
                    {recommendations.hijama.score}%
                  </span>
                  {recommendations.hijama.recommended ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{recommendations.hijama.reason}</p>
              {recommendations.hijama.considerations && recommendations.hijama.considerations.length > 0 && (
                <ul className="text-sm space-y-1">
                  {recommendations.hijama.considerations.map((consideration, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{consideration}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skincare Recommendation */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-full', getScoreBg(recommendations.skincare.score))}>
              <Heart className={cn('h-6 w-6', getScoreColor(recommendations.skincare.score))} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">العناية بالبشرة</h3>
                <span className={cn('text-sm font-bold', getScoreColor(recommendations.skincare.score))}>
                  {recommendations.skincare.score}%
                </span>
              </div>
              {recommendations.skincare.treatments && recommendations.skincare.treatments.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">يُنصح بـ:</p>
                  <ul className="text-sm space-y-1">
                    {recommendations.skincare.treatments.map((treatment, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{treatment}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recommendations.skincare.avoid && recommendations.skincare.avoid.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">تجنبي:</p>
                  <ul className="text-sm space-y-1">
                    {recommendations.skincare.avoid.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waxing Recommendation */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-full', getScoreBg(recommendations.waxing.score))}>
              <Sparkles className={cn('h-6 w-6', getScoreColor(recommendations.waxing.score))} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">إزالة الشعر</h3>
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-bold', getScoreColor(recommendations.waxing.score))}>
                    {recommendations.waxing.score}%
                  </span>
                  {recommendations.waxing.recommended ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{recommendations.waxing.reason}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={loadRecommendations} variant="outline" className="w-full" disabled={loading}>
        <Sparkles className="h-4 w-4 ml-2" />
        تحديث التوصيات
      </Button>
    </div>
  );
}
