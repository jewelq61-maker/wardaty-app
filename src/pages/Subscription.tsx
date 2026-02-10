import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Calendar, CreditCard, AlertCircle, CheckCircle2, ArrowRight, X, Check, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import { StoreKitService, PRODUCT_IDS } from '@/services/storekit-service';
import type { SubscriptionStatus } from '@/services/storekit-service';

interface SubscriptionData {
  is_premium: boolean;
  subscription_start?: string;
  subscription_end?: string;
  subscription_plan?: 'monthly' | 'yearly';
  productId?: string;
}

export default function Subscription() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [subscription, setSubscription] = useState<SubscriptionData>({
    is_premium: false,
  });
  const [loading, setLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  // Listen for subscription status changes from native layer
  useEffect(() => {
    StoreKitService.onSubscriptionStatusChanged(() => {
      loadSubscription();
    });
  }, []);

  const loadSubscription = async () => {
    if (!user) return;

    setLoading(true);

    // Load from database
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    // Also check StoreKit for real subscription status
    let storeKitStatus: SubscriptionStatus = { isActive: false };
    if (StoreKitService.isAvailable()) {
      storeKitStatus = await StoreKitService.getSubscriptionStatus();

      // Sync StoreKit status with database
      if (storeKitStatus.isActive && profileData && !profileData.is_premium) {
        await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', user.id);
      } else if (!storeKitStatus.isActive && profileData?.is_premium) {
        await supabase
          .from('profiles')
          .update({ is_premium: false })
          .eq('id', user.id);
      }
    }

    const isPremium = storeKitStatus.isActive || (profileData?.is_premium ?? false);

    setSubscription({
      is_premium: isPremium,
      subscription_start: storeKitStatus.subscription
        ? new Date(storeKitStatus.subscription.expirationDate * 1000 - 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      subscription_end: storeKitStatus.subscription
        ? new Date(storeKitStatus.subscription.expirationDate * 1000).toISOString()
        : undefined,
      subscription_plan: 'monthly',
      productId: storeKitStatus.subscription?.productId,
    });

    setLoading(false);
  };

  const handleCancelSubscription = () => {
    toast({
      title: 'إلغاء الاشتراك',
      description: 'لإلغاء الاشتراك، انتقلي إلى الإعدادات > Apple ID > الاشتراكات',
    });
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      const result = await StoreKitService.restorePurchases();

      if (result.hasActiveSubscription) {
        if (user) {
          await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);
        }
        toast({
          title: 'تم الاستعادة',
          description: 'تم استعادة اشتراكك بنجاح',
        });
        loadSubscription();
      } else {
        toast({
          title: 'لا توجد اشتراكات',
          description: 'لم يتم العثور على اشتراكات سابقة',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء استعادة المشتريات',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleSubscribe = async () => {
    if (!StoreKitService.isAvailable()) {
      toast({
        title: 'غير متوفر',
        description: 'الاشتراك متوفر فقط على أجهزة iOS',
        variant: 'destructive',
      });
      return;
    }

    setIsPurchasing(true);
    try {
      const result = await StoreKitService.purchase(PRODUCT_IDS.MONTHLY);

      if (result.success) {
        if (user) {
          await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);
        }
        toast({
          title: 'تم الاشتراك بنجاح!',
          description: 'مرحباً بكِ في وردية بلس',
        });
        loadSubscription();
      } else if (result.cancelled) {
        // User cancelled, do nothing
      } else if (result.pending) {
        toast({
          title: 'في انتظار الموافقة',
          description: 'سيتم تفعيل الاشتراك بعد الموافقة',
        });
      }
    } catch (error: any) {
      toast({
        title: 'فشل الاشتراك',
        description: error.message || 'حدث خطأ أثناء الاشتراك',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const premiumFeatures = [
    { key: 'beautyPlanner', icon: '💅' },
    { key: 'fastingQada', icon: '🌙' },
    { key: 'partnerSharing', icon: '💑' },
    { key: 'motherFeatures', icon: '👩‍👧' },
    { key: 'dataExport', icon: '📊' },
    { key: 'advancedStats', icon: '📈' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <ArrowRight className="h-5 w-5 rotate-180" />
          </Button>
          <h1 className="text-xl font-bold">{t('subscription.title')}</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Current Status Card */}
        <Card className="glass-card border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${subscription.is_premium ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-muted'}`}>
                  <Crown className={`h-6 w-6 ${subscription.is_premium ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {subscription.is_premium ? t('subscription.premiumActive') : t('subscription.freePlan')}
                  </CardTitle>
                  <CardDescription>
                    {subscription.is_premium ? t('subscription.premiumDesc') : t('subscription.freeDesc')}
                  </CardDescription>
                </div>
              </div>
              {subscription.is_premium && (
                <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                  {t('subscription.premium')}
                </Badge>
              )}
            </div>
          </CardHeader>

          {subscription.is_premium && subscription.subscription_end && (
            <>
              <Separator />
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('subscription.startDate')}</p>
                      <p className="font-semibold">
                        {subscription.subscription_start
                          ? new Date(subscription.subscription_start).toLocaleDateString('ar-SA')
                          : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('subscription.endDate')}</p>
                      <p className="font-semibold">
                        {subscription.subscription_end
                          ? new Date(subscription.subscription_end).toLocaleDateString('ar-SA')
                          : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('subscription.plan')}</p>
                      <p className="font-semibold">
                        {subscription.subscription_plan === 'monthly'
                          ? t('subscription.monthly')
                          : t('subscription.yearly')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Premium Features */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              {subscription.is_premium ? t('subscription.yourFeatures') : t('subscription.availableFeatures')}
            </CardTitle>
            <CardDescription>
              {subscription.is_premium
                ? t('subscription.enjoyFeatures')
                : t('subscription.upgradeToAccess')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {premiumFeatures.map((feature) => (
                <div
                  key={feature.key}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{t(`subscription.features.${feature.key}`)}</p>
                    <p className="text-sm text-muted-foreground">
                      {t(`subscription.features.${feature.key}Desc`)}
                    </p>
                  </div>
                  {subscription.is_premium && (
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card className="glass-card">
          <CardContent className="pt-6 space-y-4">
            {subscription.is_premium ? (
              <>
                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-600 dark:text-yellow-500">
                      {t('subscription.cancelWarning')}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      لإلغاء الاشتراك، انتقلي إلى الإعدادات > Apple ID > الاشتراكات
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleCancelSubscription}
                >
                  <AlertCircle className="h-5 w-5 mr-2" />
                  كيفية إلغاء الاشتراك
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-primary">
                      {t('subscription.upgradeNow')}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('subscription.upgradeNowDesc')}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleSubscribe}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0"
                  size="lg"
                  disabled={isPurchasing}
                >
                  {isPurchasing ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Crown className="h-5 w-5 mr-2" />
                  )}
                  {isPurchasing ? 'جاري المعالجة...' : t('subscription.upgradeButton')}
                </Button>
              </>
            )}

            {/* Restore Purchases - Always visible */}
            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground"
              onClick={handleRestorePurchases}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isRestoring ? 'جاري الاستعادة...' : 'استعادة المشتريات السابقة'}
            </Button>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="glass-card bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{t('subscription.needHelp')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('subscription.needHelpDesc')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
