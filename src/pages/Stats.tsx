import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, TrendingUp, Calendar as CalendarIcon, Activity, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BottomNav from '@/components/BottomNav';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, differenceInDays } from 'date-fns';

interface Cycle {
  start_date: string;
  end_date: string | null;
  length: number;
  duration: number;
}

interface CycleDay {
  date: string;
  symptoms: string[];
  mood: string | null;
  flow: string | null;
}

interface CycleHistoryData {
  month: string;
  length: number;
  duration: number;
}

interface SymptomData {
  name: string;
  count: number;
}

const COLORS = ['hsl(var(--period))', 'hsl(var(--ovulation))', 'hsl(var(--fertile))', 'hsl(var(--warning))', 'hsl(var(--info))'];

export default function Stats() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [cycleDays, setCycleDays] = useState<CycleDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [cyclesResponse, cycleDaysResponse] = await Promise.all([
      supabase
        .from('cycles')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })
        .limit(12),
      supabase
        .from('cycle_days')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(180)
    ]);

    if (cyclesResponse.data) setCycles(cyclesResponse.data);
    if (cycleDaysResponse.data) setCycleDays(cycleDaysResponse.data);
    setLoading(false);
  };

  // Calculate cycle history data
  const cycleHistoryData: CycleHistoryData[] = cycles
    .slice(0, 6)
    .reverse()
    .map((cycle) => ({
      month: format(new Date(cycle.start_date), 'MMM'),
      length: cycle.length || 0,
      duration: cycle.duration || 0,
    }));

  // Calculate average cycle length
  const avgCycleLength = cycles.length > 0
    ? Math.round(cycles.reduce((sum, c) => sum + (c.length || 0), 0) / cycles.length)
    : 0;

  // Calculate average period duration
  const avgPeriodDuration = cycles.length > 0
    ? Math.round(cycles.reduce((sum, c) => sum + (c.duration || 0), 0) / cycles.length)
    : 0;

  // Calculate symptom frequency
  const symptomCounts: Record<string, number> = {};
  cycleDays.forEach((day) => {
    day.symptoms?.forEach((symptom) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  const symptomData: SymptomData[] = Object.entries(symptomCounts)
    .map(([name, count]) => ({ name: t(name), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate mood distribution
  const moodCounts: Record<string, number> = {};
  cycleDays.forEach((day) => {
    if (day.mood) {
      moodCounts[day.mood] = (moodCounts[day.mood] || 0) + 1;
    }
  });

  const moodData = Object.entries(moodCounts)
    .map(([name, value]) => ({ name: t(name), value }))
    .sort((a, b) => b.value - a.value);

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
              <h1 className="text-lg font-bold text-foreground">{t('stats.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('stats.subtitle')}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
      </div>

      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">{t('stats')}</h1>

        {loading ? (
          <Card className="glass shadow-elegant">
            <CardContent className="p-6">
              <p className="text-muted-foreground">{t('loading')}</p>
            </CardContent>
          </Card>
        ) : cycles.length === 0 ? (
          <Card className="glass shadow-elegant">
            <CardContent className="p-6">
              <p className="text-muted-foreground">{t('statsPage.noData')}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass shadow-elegant">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">{t('statsPage.avgCycleLength')}</p>
                  </div>
                  <p className="text-2xl font-bold">{avgCycleLength} {t('statsPage.days')}</p>
                </CardContent>
              </Card>

              <Card className="glass shadow-elegant">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-period" />
                    <p className="text-sm text-muted-foreground">{t('statsPage.avgPeriodDuration')}</p>
                  </div>
                  <p className="text-2xl font-bold">{avgPeriodDuration} {t('statsPage.days')}</p>
                </CardContent>
              </Card>

              <Card className="glass shadow-elegant">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-info" />
                    <p className="text-sm text-muted-foreground">{t('statsPage.totalCycles')}</p>
                  </div>
                  <p className="text-2xl font-bold">{cycles.length}</p>
                </CardContent>
              </Card>

              <Card className="glass shadow-elegant">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-ovulation" />
                    <p className="text-sm text-muted-foreground">{t('statsPage.trackedDays')}</p>
                  </div>
                  <p className="text-2xl font-bold">{cycleDays.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Cycle Length History */}
            {cycleHistoryData.length > 0 && (
              <Card className="glass shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {t('statsPage.cycleHistory')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={cycleHistoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="length" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name={t('statsPage.cycleLength')}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="duration" 
                        stroke="hsl(var(--period))" 
                        strokeWidth={2}
                        name={t('statsPage.periodDuration')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Symptom Frequency */}
            {symptomData.length > 0 && (
              <Card className="glass shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-warning" />
                    {t('statsPage.symptomFrequency')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={symptomData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="count" fill="hsl(var(--warning))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Mood Distribution */}
            {moodData.length > 0 && (
              <Card className="glass shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-info" />
                    {t('statsPage.moodDistribution')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={moodData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {moodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
