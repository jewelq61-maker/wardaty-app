import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Activity, Clock, ChevronLeft, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppleHealth } from '@/hooks/use-apple-health';
import { useI18n } from '@/contexts/I18nContext';

interface HealthSettings {
  sync_steps: boolean;
  sync_sleep: boolean;
  sync_heart_rate: boolean;
  sync_weight: boolean;
  auto_sync_enabled: boolean;
  auto_sync_time: string;
  last_sync_at?: string;
}

export default function AppleHealthSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { dir } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAvailable, isConnected, connectToHealth, syncHealthData } = useAppleHealth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<HealthSettings>({
    sync_steps: true,
    sync_sleep: true,
    sync_heart_rate: true,
    sync_weight: false,
    auto_sync_enabled: false,
    auto_sync_time: '08:00',
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('apple_health_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          sync_steps: data.sync_steps,
          sync_sleep: data.sync_sleep,
          sync_heart_rate: data.sync_heart_rate,
          sync_weight: data.sync_weight,
          auto_sync_enabled: data.auto_sync_enabled,
          auto_sync_time: data.auto_sync_time?.substring(0, 5) || '08:00',
          last_sync_at: data.last_sync_at,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('apple_health_settings')
        .upsert({
          user_id: user.id,
          sync_steps: settings.sync_steps,
          sync_sleep: settings.sync_sleep,
          sync_heart_rate: settings.sync_heart_rate,
          sync_weight: settings.sync_weight,
          auto_sync_enabled: settings.auto_sync_enabled,
          auto_sync_time: settings.auto_sync_time + ':00',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات المزامنة بنجاح',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ الإعدادات',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    if (!isConnected) {
      await connectToHealth();
      return;
    }

    await syncHealthData();
    
    // Update last sync time
    if (user) {
      await supabase
        .from('apple_health_settings')
        .upsert({
          user_id: user.id,
          last_sync_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
      
      loadSettings();
    }
  };

  if (!isAvailable) {
    return (
      <div className="min-h-screen bg-background pb-24 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button
              onClick={() => navigate('/profile')}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <ChevronLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              رجوع
            </Button>
          </div>

          <Card className="text-center p-8">
            <CardContent className="space-y-4">
              <Activity className="w-16 h-16 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-bold">غير متوفر</h2>
              <p className="text-muted-foreground">
                Apple Health متوفر فقط على أجهزة iOS
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/profile')}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <ChevronLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              رجوع
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6" />
                إعدادات Apple Health
              </h1>
              <p className="text-sm text-muted-foreground">إدارة مزامنة البيانات الصحية</p>
            </div>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? '✓ متصل' : 'غير متصل'}
          </Badge>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-warning mb-1">الربط مطلوب</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    يجب ربط التطبيق مع Apple Health لتفعيل المزامنة
                  </p>
                  <Button onClick={connectToHealth} size="sm" variant="default">
                    ربط الآن
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">نوع البيانات المراد مزامنتها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  👣
                </div>
                <div>
                  <Label className="text-base font-medium">الخطوات</Label>
                  <p className="text-xs text-muted-foreground">عدد الخطوات اليومية</p>
                </div>
              </div>
              <Switch
                checked={settings.sync_steps}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, sync_steps: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                  😴
                </div>
                <div>
                  <Label className="text-base font-medium">النوم</Label>
                  <p className="text-xs text-muted-foreground">مدة النوم بالدقائق</p>
                </div>
              </div>
              <Switch
                checked={settings.sync_sleep}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, sync_sleep: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-period/10 flex items-center justify-center">
                  💓
                </div>
                <div>
                  <Label className="text-base font-medium">معدل النبض</Label>
                  <p className="text-xs text-muted-foreground">نبضة في الدقيقة</p>
                </div>
              </div>
              <Switch
                checked={settings.sync_heart_rate}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, sync_heart_rate: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                  ⚖️
                </div>
                <div>
                  <Label className="text-base font-medium">الوزن</Label>
                  <p className="text-xs text-muted-foreground">الوزن بالكيلوغرام</p>
                </div>
              </div>
              <Switch
                checked={settings.sync_weight}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, sync_weight: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Auto Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">المزامنة التلقائية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-base font-medium">تفعيل المزامنة التلقائية</Label>
                  <p className="text-xs text-muted-foreground">
                    مزامنة البيانات يومياً في الوقت المحدد
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.auto_sync_enabled}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, auto_sync_enabled: checked })
                }
              />
            </div>

            {settings.auto_sync_enabled && (
              <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                <Label className="text-sm font-medium">وقت المزامنة اليومية</Label>
                <Input
                  type="time"
                  value={settings.auto_sync_time}
                  onChange={(e) => 
                    setSettings({ ...settings, auto_sync_time: e.target.value })
                  }
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  سيتم مزامنة البيانات تلقائياً كل يوم في الوقت المحدد
                </p>
              </div>
            )}

            {settings.last_sync_at && (
              <div className="text-xs text-muted-foreground text-center">
                آخر مزامنة: {new Date(settings.last_sync_at).toLocaleString('ar-SA')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="flex-1 h-12"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
          
          {isConnected && (
            <Button
              onClick={handleSync}
              variant="outline"
              className="flex-1 h-12"
            >
              <Activity className="w-4 h-4 mr-2" />
              مزامنة الآن
            </Button>
          )}
        </div>

        {/* Info */}
        <Card className="bg-info/5 border-info/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div className="text-sm space-y-2">
                <p className="font-medium">ملاحظات هامة:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>هذه الميزة تعمل فقط على أجهزة iOS بعد تثبيت التطبيق</li>
                  <li>يجب منح التطبيق صلاحيات الوصول لـ Apple Health</li>
                  <li>البيانات المزامنة تُحفظ في قاعدة البيانات لتتبع التقدم</li>
                  <li>المزامنة التلقائية تتطلب فتح التطبيق مرة واحدة يومياً</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
