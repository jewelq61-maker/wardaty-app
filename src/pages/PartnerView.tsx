import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Calendar as CalendarIcon, Droplets, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import BottomNav from '@/components/BottomNav';
import SharedCalendar from '@/components/SharedCalendar';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface PartnerData {
  name: string;
  email: string;
  cyclePhase?: string;
  currentDay?: number;
  totalCycleLength?: number;
  nextPeriodDate?: string;
  lastPeriodDate?: string;
  recentMood?: string;
  recentSymptoms?: string[];
  shareLinkId?: string;
}

export default function PartnerView() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPartnerData();
    }
  }, [user]);

  const loadPartnerData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Find active share link where current user is connected
      const { data: shareLink, error: linkError } = await supabase
        .from('share_links')
        .select('id, owner_id, profiles!share_links_owner_id_fkey(name, email)')
        .eq('connected_user_id', user.id)
        .eq('type', 'profile')
        .eq('status', 'active')
        .maybeSingle();

      if (linkError || !shareLink) {
        toast({
          title: t('error'),
          description: t('profilePage.noPartnerConnected'),
          variant: 'destructive',
        });
        navigate('/profile');
        return;
      }

      const ownerId = shareLink.owner_id;
      setPartnerId(ownerId);

      // Get partner's latest cycle
      const { data: latestCycle } = await supabase
        .from('cycles')
        .select('start_date, length, duration')
        .eq('user_id', ownerId)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get partner's recent cycle day data
      const { data: recentDay } = await supabase
        .from('cycle_days')
        .select('date, mood, symptoms')
        .eq('user_id', ownerId)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      let cyclePhase = '';
      let currentDay = 0;
      let totalCycleLength = 28;
      let nextPeriodDate = '';

      if (latestCycle && latestCycle.start_date) {
        const startDate = parseISO(latestCycle.start_date);
        const today = new Date();
        currentDay = differenceInDays(today, startDate) + 1;
        totalCycleLength = latestCycle.length || 28;
        
        // Calculate cycle phase
        const duration = latestCycle.duration || 5;
        if (currentDay <= duration) {
          cyclePhase = 'menstrual';
        } else if (currentDay <= 13) {
          cyclePhase = 'follicular';
        } else if (currentDay <= 17) {
          cyclePhase = 'ovulation';
        } else {
          cyclePhase = 'luteal';
        }

        // Calculate next period date
        const daysUntilNext = totalCycleLength - currentDay;
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntilNext);
        nextPeriodDate = format(nextDate, 'yyyy-MM-dd');
      }

      setPartnerData({
        name: (shareLink.profiles as any)?.name || 'Partner',
        email: (shareLink.profiles as any)?.email || '',
        cyclePhase,
        currentDay,
        totalCycleLength,
        nextPeriodDate,
        lastPeriodDate: latestCycle?.start_date,
        recentMood: recentDay?.mood,
        recentSymptoms: recentDay?.symptoms || [],
        shareLinkId: shareLink.id,
      });

    } catch (error) {
      console.error('Error loading partner data:', error);
      toast({
        title: t('error'),
        description: t('profilePage.loadPartnerError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCyclePhaseInfo = (phase?: string) => {
    if (!phase) return { label: t('home.unknown'), color: 'bg-muted', icon: '❓' };
    
    switch (phase) {
      case 'menstrual':
        return { label: t('home.menstrual'), color: 'bg-destructive/20 text-destructive', icon: '🌙' };
      case 'follicular':
        return { label: t('home.follicular'), color: 'bg-info/20 text-info', icon: '🌱' };
      case 'ovulation':
        return { label: t('home.ovulation'), color: 'bg-warning/20 text-warning', icon: '🌟' };
      case 'luteal':
        return { label: t('home.luteal'), color: 'bg-primary/20 text-primary', icon: '🌸' };
      default:
        return { label: t('home.unknown'), color: 'bg-muted', icon: '❓' };
    }
  };

  const getMoodEmoji = (mood?: string) => {
    if (!mood) return '😐';
    
    switch (mood) {
      case 'high': return '😊';
      case 'neutral': return '😐';
      case 'low': return '😔';
      default: return '😐';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!partnerData) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">{t('profilePage.noPartnerConnected')}</p>
            <Button onClick={() => navigate('/profile')}>
              {t('profilePage.backToProfile')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const phaseInfo = getCyclePhaseInfo(partnerData.cyclePhase);

  return (
    <div className="min-h-screen gradient-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-card/80 backdrop-blur-lg z-10 border-b border-border/50">
        <div className="p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/profile')}
              variant="ghost"
              size="icon"
              className="h-10 w-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 shadow-elegant">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                  {partnerData.name[0]?.toUpperCase() || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Heart className="w-5 h-5 text-destructive fill-destructive" />
                  {partnerData.name}
                </h1>
                <p className="text-sm text-muted-foreground">{partnerData.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Cycle Phase Card */}
        <Card className="glass shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {t('home.cyclePhase')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={`${phaseInfo.color} text-base px-4 py-2`}>
                <span className="mr-2">{phaseInfo.icon}</span>
                {phaseInfo.label}
              </Badge>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {partnerData.currentDay}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('home.dayOfCycle', { total: partnerData.totalCycleLength })}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">{t('home.lastPeriod')}</p>
                <p className="font-medium">
                  {partnerData.lastPeriodDate
                    ? format(parseISO(partnerData.lastPeriodDate), 'PPP', { 
                        locale: i18n.language === 'ar' ? ar : undefined 
                      })
                    : t('home.unknown')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">{t('home.nextPeriod')}</p>
                <p className="font-medium">
                  {partnerData.nextPeriodDate
                    ? format(parseISO(partnerData.nextPeriodDate), 'PPP', { 
                        locale: i18n.language === 'ar' ? ar : undefined 
                      })
                    : t('home.unknown')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Mood Card */}
        {partnerData.recentMood && (
          <Card className="glass shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                {t('home.recentMood')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-5xl">{getMoodEmoji(partnerData.recentMood)}</div>
                <div>
                  <p className="text-lg font-medium capitalize">
                    {t(`home.${partnerData.recentMood}`)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('home.lastTrackedMood')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Symptoms Card */}
        {partnerData.recentSymptoms && partnerData.recentSymptoms.length > 0 && (
          <Card className="glass shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                {t('home.recentSymptoms')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {partnerData.recentSymptoms.map((symptom, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {t(`home.${symptom}`)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Support Tips Card */}
        <Card className="glass shadow-elegant border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Heart className="w-5 h-5" />
              {t('profilePage.partnerSupport')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• {t('profilePage.supportTip1')}</p>
            <p>• {t('profilePage.supportTip2')}</p>
            <p>• {t('profilePage.supportTip3')}</p>
            <p>• {t('profilePage.supportTip4')}</p>
          </CardContent>
        </Card>

        {/* Shared Calendar */}
        {partnerData.shareLinkId && partnerId && (
          <SharedCalendar
            shareLinkId={partnerData.shareLinkId}
            partnerId={partnerId}
            partnerName={partnerData.name}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
