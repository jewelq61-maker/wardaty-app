import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  Database, 
  Trash2, 
  Clock, 
  TrendingDown, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  BarChart3,
  HardDrive,
  Zap
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface CleanupLog {
  id: string;
  executed_at: string;
  status: string;
  stats: any; // Using any for JSONB from Supabase
  total_deleted: number;
  error_message?: string;
  execution_time_ms?: number;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [logs, setLogs] = useState<CleanupLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({
    totalDeleted: 0,
    avgExecutionTime: 0,
    lastRun: null as string | null,
    successRate: 0,
  });

  useEffect(() => {
    if (user) {
      loadCleanupLogs();
    }
  }, [user]);

  const loadCleanupLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cleanup_logs')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        setLogs(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error loading cleanup logs:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load cleanup logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logsData: CleanupLog[]) => {
    const totalDeleted = logsData.reduce((sum, log) => sum + log.total_deleted, 0);
    const successLogs = logsData.filter(log => log.status === 'success');
    const avgTime = successLogs.length > 0
      ? successLogs.reduce((sum, log) => sum + (log.execution_time_ms || 0), 0) / successLogs.length
      : 0;
    
    setStats({
      totalDeleted,
      avgExecutionTime: Math.round(avgTime),
      lastRun: logsData[0]?.executed_at || null,
      successRate: logsData.length > 0 ? (successLogs.length / logsData.length) * 100 : 0,
    });
  };

  const runCleanupNow = async () => {
    try {
      setIsRunning(true);
      toast({
        title: 'تشغيل التنظيف',
        description: 'جاري تشغيل عملية التنظيف...',
      });

      const { error } = await supabase.functions.invoke('cleanup-old-data');

      if (error) throw error;

      toast({
        title: 'اكتمل التنظيف',
        description: 'تم تشغيل عملية التنظيف بنجاح',
      });

      // Reload logs after a short delay
      setTimeout(() => {
        loadCleanupLogs();
      }, 2000);
    } catch (error) {
      console.error('Error running cleanup:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تشغيل عملية التنظيف',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const formatBytes = (bytes: number) => {
    // Rough estimate: 1KB per record
    const kb = bytes;
    if (kb < 1024) return `${kb} KB`;
    const mb = (kb / 1024).toFixed(2);
    return `${mb} MB`;
  };

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="w-8 h-8 text-primary" />
              لوحة تحكم الصيانة
            </h1>
            <p className="text-muted-foreground mt-1">
              إحصائيات ومعلومات عمليات التنظيف التلقائية
            </p>
          </div>
          <Button onClick={runCleanupNow} disabled={isRunning}>
            <RefreshCw className={`w-4 h-4 ml-2 ${isRunning ? 'animate-spin' : ''}`} />
            تشغيل التنظيف الآن
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                إجمالي السجلات المحذوفة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDeleted.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                مساحة موفرة: ~{formatBytes(stats.totalDeleted)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                متوسط وقت التنفيذ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgExecutionTime}ms</div>
              <p className="text-xs text-muted-foreground mt-1">
                لكل عملية تنظيف
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                آخر تشغيل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {stats.lastRun 
                  ? format(new Date(stats.lastRun), 'PPp', { locale: ar })
                  : 'لم يتم التشغيل بعد'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                التشغيل القادم: الأحد 2:00 ص
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-success" />
                معدل النجاح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                من إجمالي {logs.length} عملية
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cleanup Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              سجل عمليات التنظيف
            </CardTitle>
            <CardDescription>
              آخر 20 عملية تنظيف مع التفاصيل الكاملة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                جاري التحميل...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد عمليات تنظيف بعد
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {log.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                        <div>
                          <div className="font-medium">
                            {format(new Date(log.executed_at), 'PPp', { locale: ar })}
                          </div>
                          {log.execution_time_ms && (
                            <div className="text-xs text-muted-foreground">
                              وقت التنفيذ: {log.execution_time_ms}ms
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status === 'success' ? 'نجح' : 'فشل'}
                      </Badge>
                    </div>

                    {log.status === 'success' && log.stats && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 pt-3 border-t border-border">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">إجراءات التجميل</div>
                          <div className="font-bold text-sm">{log.stats.beautyActions || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">سجل الإجراءات</div>
                          <div className="font-bold text-sm">{log.stats.actionHistory || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">الصيام</div>
                          <div className="font-bold text-sm">{log.stats.fastingEntries || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">سجلات الروتين</div>
                          <div className="font-bold text-sm">{log.stats.routineLogs || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">الأحداث المشتركة</div>
                          <div className="font-bold text-sm">{log.stats.sharedEvents || 0}</div>
                        </div>
                      </div>
                    )}

                    {log.status === 'error' && log.error_message && (
                      <div className="mt-3 pt-3 border-t border-destructive/20 text-sm text-destructive">
                        خطأ: {log.error_message}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Trash2 className="w-4 h-4" />
                        إجمالي السجلات المحذوفة: {log.total_deleted.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ~{formatBytes(log.total_deleted)} موفرة
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>معلومات عن التنظيف التلقائي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <strong>الجدول الزمني:</strong> يتم تشغيل عملية التنظيف تلقائياً كل يوم أحد الساعة 2:00 صباحاً
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Trash2 className="w-4 h-4 mt-0.5 text-destructive" />
              <div>
                <strong>ما يتم حذفه:</strong>
                <ul className="list-disc list-inside mt-1 mr-4 space-y-1 text-muted-foreground">
                  <li>إجراءات التجميل المكتملة (أقدم من 90 يوم)</li>
                  <li>سجل الإجراءات (أقدم من 6 أشهر)</li>
                  <li>إدخالات الصيام المكتملة (أقدم من سنة)</li>
                  <li>سجلات الروتين (أقدم من 6 أشهر)</li>
                  <li>الأحداث المشتركة (أقدم من سنة)</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <HardDrive className="w-4 h-4 mt-0.5 text-success" />
              <div>
                <strong>الفائدة:</strong> يساعد التنظيف التلقائي في تحسين أداء التطبيق وتقليل حجم قاعدة البيانات
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
