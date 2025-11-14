import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, Calendar as CalendarIcon, Activity, Heart, 
  Sparkles, Droplets, Moon, CheckCircle2, BarChart3 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNav from '@/components/BottomNav';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface StatsData {
  cycles: {
    total: number;
    avgLength: number;
    avgDuration: number;
    historyData: Array<{ month: string; length: number; duration: number }>;
  };
  mood: {
    totalLogs: number;
    distribution: Array<{ name: string; value: number }>;
    trendData: Array<{ date: string; mood: number }>;
  };
  symptoms: {
    total: number;
    topSymptoms: Array<{ name: string; count: number }>;
  };
  beauty: {
    totalActions: number;
    completed: number;
    upcoming: number;
    categoryDistribution: Array<{ category: string; count: number }>;
  };
  fasting: {
    totalDays: number;
    completed: number;
    remaining: number;
  };
}

const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  period: 'hsl(var(--period))',
  ovulation: 'hsl(var(--ovulation))',
  fertile: 'hsl(var(--fertile))',
  muted: 'hsl(var(--muted))',
};

export default function Stats() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    cycles: { total: 0, avgLength: 0, avgDuration: 0, historyData: [] },
    mood: { totalLogs: 0, distribution: [], trendData: [] },
    symptoms: { total: 0, topSymptoms: [] },
    beauty: { totalActions: 0, completed: 0, upcoming: 0, categoryDistribution: [] },
    fasting: { totalDays: 0, completed: 0, remaining: 0 },
  });

  useEffect(() => {
    if (user) {
      fetchAllStats();
    }
  }, [user]);

  const fetchAllStats = async () => {
    if (!user) return;

    try {
      const [
        cyclesRes,
        cycleDaysRes,
        beautyActionsRes,
        fastingRes,
      ] = await Promise.all([
        supabase.from('cycles').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
        supabase.from('cycle_days').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(90),
        supabase.from('beauty_actions').select('*').eq('user_id', user.id),
        supabase.from('fasting_entries').select('*').eq('user_id', user.id),
      ]);

      // Process cycles data
      const cycles = cyclesRes.data || [];
      const avgLength = cycles.length > 0 
        ? Math.round(cycles.reduce((sum, c) => sum + (c.length || 0), 0) / cycles.length) 
        : 0;
      const avgDuration = cycles.length > 0 
        ? Math.round(cycles.reduce((sum, c) => sum + (c.duration || 0), 0) / cycles.length) 
        : 0;
      const historyData = cycles.slice(0, 6).reverse().map(c => ({
        month: format(new Date(c.start_date), 'MMM'),
        length: c.length || 0,
        duration: c.duration || 0,
      }));

      // Process mood data
      const cycleDays = cycleDaysRes.data || [];
      const moodCounts: Record<string, number> = {};
      const moodValues: Record<string, number> = {
        happy: 5, energetic: 5, calm: 4, neutral: 3, tired: 2, sad: 2, anxious: 2, angry: 1
      };

      cycleDays.forEach(day => {
        if (day.mood) {
          moodCounts[day.mood] = (moodCounts[day.mood] || 0) + 1;
        }
      });

      const moodDistribution = Object.entries(moodCounts)
        .map(([name, value]) => ({ name: t(name), value }))
        .sort((a, b) => b.value - a.value);

      const trendData = cycleDays.slice(0, 30).reverse().map(day => ({
        date: format(new Date(day.date), 'MM/dd'),
        mood: day.mood ? (moodValues[day.mood] || 3) : 3,
      }));

      // Process symptoms data
      const symptomCounts: Record<string, number> = {};
      cycleDays.forEach(day => {
        day.symptoms?.forEach(symptom => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
      });

      const topSymptoms = Object.entries(symptomCounts)
        .map(([name, count]) => ({ name: t(name), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process beauty actions data
      const beautyActions = beautyActionsRes.data || [];
      const completed = beautyActions.filter(a => a.completed).length;
      const upcoming = beautyActions.filter(a => !a.completed && a.scheduled_at && new Date(a.scheduled_at) > new Date()).length;
      
      const categoryCounts: Record<string, number> = {};
      beautyActions.forEach(action => {
        if (action.beauty_category) {
          categoryCounts[action.beauty_category] = (categoryCounts[action.beauty_category] || 0) + 1;
        }
      });

      const categoryDistribution = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category: t(`beautyPlanner.categories.${category}`), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process fasting data
      const fastingEntries = fastingRes.data || [];
      const fastingCompleted = fastingEntries.filter(e => e.is_completed).length;
      const fastingRemaining = fastingEntries.length - fastingCompleted;

      setStats({
        cycles: {
          total: cycles.length,
          avgLength,
          avgDuration,
          historyData,
        },
        mood: {
          totalLogs: cycleDays.filter(d => d.mood).length,
          distribution: moodDistribution,
          trendData,
        },
        symptoms: {
          total: Object.values(symptomCounts).reduce((sum, count) => sum + count, 0),
          topSymptoms,
        },
        beauty: {
          totalActions: beautyActions.length,
          completed,
          upcoming,
          categoryDistribution,
        },
        fasting: {
          totalDays: fastingEntries.length,
          completed: fastingCompleted,
          remaining: fastingRemaining,
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-10 px-6 py-4">
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <BarChart3 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">{t('stats')}</h1>
            <p className="text-sm text-muted-foreground">{t('statsPage.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">{t('statsPage.totalCycles')}</p>
              </div>
              <p className="text-2xl font-bold">{stats.cycles.total}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-destructive" />
                <p className="text-xs text-muted-foreground">{t('statsPage.moodsLogged')}</p>
              </div>
              <p className="text-2xl font-bold">{stats.mood.totalLogs}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">{t('statsPage.beautyActions')}</p>
              </div>
              <p className="text-2xl font-bold">{stats.beauty.totalActions}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">{t('fastingQada.title')}</p>
              </div>
              <p className="text-2xl font-bold">{stats.fasting.completed}/{stats.fasting.totalDays}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Different Categories */}
        <Tabs defaultValue="cycle" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cycle">{t('calendar')}</TabsTrigger>
            <TabsTrigger value="mood">{t('home.mood')}</TabsTrigger>
            <TabsTrigger value="beauty">{t('beautyPlanner.title')}</TabsTrigger>
            <TabsTrigger value="health">{t('statsPage.health')}</TabsTrigger>
          </TabsList>

          {/* Cycle Tab */}
          <TabsContent value="cycle" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">{t('statsPage.avgCycleLength')}</p>
                  </div>
                  <p className="text-3xl font-bold">{stats.cycles.avgLength} <span className="text-lg text-muted-foreground">{t('statsPage.days')}</span></p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-period" />
                    <p className="text-sm text-muted-foreground">{t('statsPage.avgPeriodDuration')}</p>
                  </div>
                  <p className="text-3xl font-bold">{stats.cycles.avgDuration} <span className="text-lg text-muted-foreground">{t('statsPage.days')}</span></p>
                </CardContent>
              </Card>
            </div>

            {/* Cycle History Chart */}
            {stats.cycles.historyData.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">{t('statsPage.cycleHistory')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.cycles.historyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar 
                        dataKey="length" 
                        fill={COLORS.primary} 
                        radius={[8, 8, 0, 0]}
                        name={t('statsPage.cycleLength')}
                      />
                      <Bar 
                        dataKey="duration" 
                        fill={COLORS.period} 
                        radius={[8, 8, 0, 0]}
                        name={t('statsPage.periodDuration')}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Top Symptoms */}
            {stats.symptoms.topSymptoms.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">{t('statsPage.symptomFrequency')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.symptoms.topSymptoms.map((symptom, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{symptom.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ 
                                width: `${(symptom.count / Math.max(...stats.symptoms.topSymptoms.map(s => s.count))) * 100}%` 
                              }}
                            />
                          </div>
                          <Badge variant="secondary">{symptom.count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Mood Tab */}
          <TabsContent value="mood" className="space-y-4">
            {/* Mood Trend */}
            {stats.mood.trendData.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">{t('statsPage.moodTrend')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={stats.mood.trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
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
                          borderRadius: '8px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke={COLORS.primary} 
                        strokeWidth={2}
                        name={t('home.mood')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Mood Distribution */}
            {stats.mood.distribution.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">{t('statsPage.moodDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.mood.distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill={COLORS.primary}
                        dataKey="value"
                      >
                        {stats.mood.distribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Beauty Tab */}
          <TabsContent value="beauty" className="space-y-4">
            {/* Beauty Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{stats.beauty.totalActions}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('statsPage.total')}</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-success">{stats.beauty.completed}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('statsPage.completed')}</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stats.beauty.upcoming}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('statsPage.upcoming')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution */}
            {stats.beauty.categoryDistribution.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">{t('statsPage.beautyByCategory')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.beauty.categoryDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="category" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={11}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill={COLORS.primary} 
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-4">
            {/* Fasting Qada */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Moon className="h-5 w-5 text-primary" />
                  {t('fastingQada.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-success">{stats.fasting.completed}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t('statsPage.completed')}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-warning">{stats.fasting.remaining}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t('statsPage.remaining')}</p>
                    </div>
                  </div>
                  
                  {stats.fasting.totalDays > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t('statsPage.progress')}</span>
                        <span className="font-semibold">
                          {Math.round((stats.fasting.completed / stats.fasting.totalDays) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all"
                          style={{ width: `${(stats.fasting.completed / stats.fasting.totalDays) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Health Stats */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">{t('statsPage.healthSummary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <span className="text-sm">{t('statsPage.symptomsTracked')}</span>
                    </div>
                    <Badge variant="secondary">{stats.symptoms.total}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span className="text-sm">{t('statsPage.trackedDays')}</span>
                    </div>
                    <Badge variant="secondary">{stats.cycles.total * stats.cycles.avgLength}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
