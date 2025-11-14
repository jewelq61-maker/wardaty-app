import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Calendar, CreditCard, AlertCircle, CheckCircle2, ArrowRight, X, Check } from 'lucide-react';
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

interface SubscriptionData {
  is_premium: boolean;
  subscription_start?: string;
  subscription_end?: string;
  subscription_plan?: 'monthly' | 'yearly';
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

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    if (data) {
      setSubscription({
        is_premium: data.is_premium,
        // For demo purposes, set mock dates
        subscription_start: data.is_premium ? new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        subscription_end: data.is_premium ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        subscription_plan: 'monthly',
      });
    }
    setLoading(false);
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: false })
      .eq('id', user.id);

    if (error) {
      toast({
        title: t('subscription.error'),
        description: t('subscription.cancelError'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('subscription.cancelled'),
        description: t('subscription.cancelSuccess'),
      });
      loadSubscription();
    }
  };

  const handleRenewSubscription = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', user.id);

    if (error) {
      toast({
        title: t('subscription.error'),
        description: t('subscription.renewError'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('subscription.renewed'),
        description: t('subscription.renewSuccess'),
      });
      loadSubscription();
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

          {subscription.is_premium && (
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
                      {t('subscription.cancelWarningDesc')}
                    </p>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" size="lg">
                      <X className="h-5 w-5 mr-2" />
                      {t('subscription.cancelButton')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('subscription.confirmCancel')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('subscription.confirmCancelDesc')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t('subscription.confirmCancelButton')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                  onClick={handleRenewSubscription}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0" 
                  size="lg"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  {t('subscription.upgradeButton')}
                </Button>
              </>
            )}
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
