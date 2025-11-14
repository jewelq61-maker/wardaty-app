import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Heart, Calendar as CalendarIcon, Activity, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, differenceInDays, subDays } from 'date-fns';

interface CycleDay {
  date: string;
  mood: string | null;
  flow: string | null;
  symptoms: string[];
}

interface SharedEvent {
  event_date: string;
  event_type: string;
  title: string;
}

interface MoodTrendData {
  date: string;
  mood: number;
  phase: string;
}

interface EnergyData {
  phase: string;
  avgMood: number;
  count: number;
}

export default function SharedStats() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string>('');
  const [cycleDays, setCycleDays] = useState<CycleDay[]>([]);
  const [sharedEvents, setSharedEvents] = useState<SharedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Get partner info from share_links
      const { data: shareData } = await supabase
        .from('share_links')
        .select('connected_user_id, owner_id')
        .or(`owner_id.eq.${user.id},connected_user_id.eq.${user.id}`)
        .eq('status', 'active')
        .eq('type', 'partner')
        .single();

      if (!shareData) {
        setLoading(false);
        return;
      }

      const partnerUserId = shareData.owner_id === user.id 
        ? shareData.connected_user_id 
        : shareData.owner_id;

      setPartnerId(partnerUserId);

      // Get partner profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', partnerUserId)
        .single();

      if (profileData) {
        setPartnerName(profileData.name || t('sharedStats.partner'));
      }

      // Get female partner's cycle days (last 90 days)
      const { data: cycleDaysData } = await supabase
        .from('cycle_days')
        .select('date, mood, flow, symptoms')
        .eq('user_id', partnerUserId)
        .gte('date', format(subDays(new Date(), 90), 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (cycleDaysData) {
        setCycleDays(cycleDaysData);
      }

      // Get shared events (last 90 days)
      const { data: eventsData } = await supabase
        .from('shared_events')
        .select('event_date, event_type, title')
        .gte('event_date', format(subDays(new Date(), 90), 'yyyy-MM-dd'))
        .order('event_date', { ascending: true });

      if (eventsData) {
        setSharedEvents(eventsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate phase for each day
  const getPhaseForDay = (date: string, cycleDays: CycleDay[]): string => {
    const dayData = cycleDays.find(d => d.date === date);
    if (!dayData) return 'unknown';

    // Find last period day before this date
    const lastPeriodDay = cycleDays
      .filter(d => d.date <= date && d.flow && d.flow !== 'none')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!lastPeriodDay) return 'follicular';

    const daysSinceLastPeriod = differenceInDays(new Date(date), new Date(lastPeriodDay.date));

    if (daysSinceLastPeriod >= 0 && daysSinceLastPeriod <= 5) return 'menstrual';
    if (daysSinceLastPeriod > 5 && daysSinceLastPeriod <= 13) return 'follicular';
    if (daysSinceLastPeriod > 13 && daysSinceLastPeriod <= 16) return 'ovulation';
    return 'luteal';
  };

  // Map mood to numeric value
  const moodToValue = (mood: string | null): number => {
    const moodMap: Record<string, number> = {
      'happy': 5,
      'calm': 4,
      'neutral': 3,
      'sad': 2,
      'angry': 1,
      'anxious': 2,
      'energetic': 5,
      'tired': 2
    };
    return mood ? (moodMap[mood] || 3) : 3;
  };

  // Calculate mood trend data
  const moodTrendData: MoodTrendData[] = cycleDays
    .slice(-30)
    .map(day => ({
      date: format(new Date(day.date), 'MMM dd'),
      mood: moodToValue(day.mood),
      phase: getPhaseForDay(day.date, cycleDays)
    }));

  // Calculate energy/mood by phase
  const energyByPhase: Record<string, { sum: number; count: number }> = {
    menstrual: { sum: 0, count: 0 },
    follicular: { sum: 0, count: 0 },
    ovulation: { sum: 0, count: 0 },
    luteal: { sum: 0, count: 0 }
  };

  cycleDays.forEach(day => {
    const phase = getPhaseForDay(day.date, cycleDays);
    if (phase !== 'unknown' && day.mood) {
      energyByPhase[phase].sum += moodToValue(day.mood);
      energyByPhase[phase].count += 1;
    }
  });

  const energyData: EnergyData[] = Object.entries(energyByPhase)
    .filter(([_, data]) => data.count > 0)
    .map(([phase, data]) => ({
      phase: t(`phases.${phase}`),
      avgMood: Math.round((data.sum / data.count) * 10) / 10,
      count: data.count
    }));

  // Calculate shared events by type
  const eventsByType: Record<string, number> = {};
  sharedEvents.forEach(event => {
    eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;
  });

  const eventsData = Object.entries(eventsByType).map(([type, count]) => ({
    type: t(`sharedCalendar.eventTypes.${type}`),
    count
  }));

  // Calculate most common symptoms
  const symptomCounts: Record<string, number> = {};
  cycleDays.forEach(day => {
    day.symptoms?.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symptom, count]) => ({
      symptom: t(symptom),
      count
    }));

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!partnerId) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('common.back')}
        </Button>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">{t('sharedStats.noPartner')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-10 px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">{t('sharedStats.title')}</h1>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Partner Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {t('sharedStats.partnerInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('sharedStats.analyzingDataFor')} <span className="font-semibold text-foreground">{partnerName}</span>
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {cycleDays.length} {t('sharedStats.daysTracked')}
                </Badge>
                <Badge variant="outline">
                  {sharedEvents.length} {t('sharedStats.sharedEvents')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mood Trend Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t('sharedStats.moodTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={moodTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[1, 5]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name={t('sharedStats.moodScore')}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              {t('sharedStats.moodTrendDesc')}
            </p>
          </CardContent>
        </Card>

        {/* Energy by Phase */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t('sharedStats.energyByPhase')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="phase" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 5]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="avgMood" 
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                  name={t('sharedStats.avgEnergy')}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-4">
              {t('sharedStats.energyByPhaseDesc')}
            </p>
          </CardContent>
        </Card>

        {/* Shared Events Distribution */}
        {eventsData.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {t('sharedStats.eventsDistribution')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventsData.map((event, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{event.type}</span>
                    <Badge variant="secondary">{event.count}</Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {t('sharedStats.eventsDistributionDesc')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Top Symptoms */}
        {topSymptoms.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t('sharedStats.commonSymptoms')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topSymptoms.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{item.symptom}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(item.count / cycleDays.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {t('sharedStats.commonSymptomsDesc')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recommendations for Partner */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {t('sharedStats.recommendations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {energyData.length > 0 && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">{t('sharedStats.bestTimes')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {energyData.sort((a, b) => b.avgMood - a.avgMood)[0]?.phase} - {t('sharedStats.bestTimesDesc')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">{t('sharedStats.supportNeeded')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {energyData.sort((a, b) => a.avgMood - b.avgMood)[0]?.phase} - {t('sharedStats.supportNeededDesc')}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
