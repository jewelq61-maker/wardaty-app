import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Settings as SettingsIcon, Bell, Shield, Eye, Database,
  Globe, Moon, Sun, Download, Trash2, Activity, Calendar, Sparkles, Save
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AppSettings {
  notifications_enabled: boolean;
  period_reminders: boolean;
  beauty_reminders: boolean;
  fasting_reminders: boolean;
  routine_reminders: boolean;
  data_sharing: boolean;
  analytics_enabled: boolean;
  compact_view: boolean;
  show_lunar_calendar: boolean;
  show_hijri_dates: boolean;
  auto_backup_enabled: boolean;
  backup_frequency: string;
}

export default function Settings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { locale, setLocale, dir } = useI18n();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    notifications_enabled: true,
    period_reminders: true,
    beauty_reminders: true,
    fasting_reminders: true,
    routine_reminders: true,
    data_sharing: false,
    analytics_enabled: true,
    compact_view: false,
    show_lunar_calendar: true,
    show_hijri_dates: true,
    auto_backup_enabled: false,
    backup_frequency: 'weekly',
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          notifications_enabled: data.notifications_enabled,
          period_reminders: data.period_reminders,
          beauty_reminders: data.beauty_reminders,
          fasting_reminders: data.fasting_reminders,
          routine_reminders: data.routine_reminders,
          data_sharing: data.data_sharing,
          analytics_enabled: data.analytics_enabled,
          compact_view: data.compact_view,
          show_lunar_calendar: data.show_lunar_calendar,
          show_hijri_dates: data.show_hijri_dates,
          auto_backup_enabled: data.auto_backup_enabled,
          backup_frequency: data.backup_frequency,
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
        .from('app_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ الإعدادات بنجاح',
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

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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
                <SettingsIcon className="w-6 h-6" />
                الإعدادات
              </h1>
              <p className="text-sm text-muted-foreground">تخصيص تجربة استخدامك</p>
            </div>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
            <TabsTrigger value="privacy">الخصوصية</TabsTrigger>
            <TabsTrigger value="display">العرض</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  اللغة والمظهر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <Label className="text-base font-medium">اللغة</Label>
                    <p className="text-xs text-muted-foreground">اختر لغة التطبيق</p>
                  </div>
                  <Select
                    value={locale}
                    onValueChange={(value) => setLocale(value as 'ar' | 'en')}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-primary" />
                    ) : (
                      <Sun className="w-5 h-5 text-primary" />
                    )}
                    <div>
                      <Label className="text-base font-medium">الوضع الداكن</Label>
                      <p className="text-xs text-muted-foreground">تفعيل المظهر الداكن</p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Integration Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  التكامل والمزامنة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => navigate('/apple-health-settings')}
                  className="w-full flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-success" />
                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                      <p className="text-sm font-medium">Apple Health</p>
                      <p className="text-xs text-muted-foreground">مزامنة بيانات الساعة</p>
                    </div>
                  </div>
                  <ChevronLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  إعدادات الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Master notifications toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <Label className="text-base font-medium">تفعيل الإشعارات</Label>
                      <p className="text-xs text-muted-foreground">تفعيل/إيقاف جميع الإشعارات</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications_enabled}
                    onCheckedChange={(checked) => updateSetting('notifications_enabled', checked)}
                  />
                </div>

                <Separator />

                {/* Individual notification toggles */}
                <div className="space-y-3 opacity-100" style={{ opacity: settings.notifications_enabled ? 1 : 0.5 }}>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <Label className="text-sm font-medium">تذكير الدورة</Label>
                      <p className="text-xs text-muted-foreground">إشعار قبل موعد الدورة</p>
                    </div>
                    <Switch
                      checked={settings.period_reminders}
                      onCheckedChange={(checked) => updateSetting('period_reminders', checked)}
                      disabled={!settings.notifications_enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <Label className="text-sm font-medium">تذكير الجمال</Label>
                      <p className="text-xs text-muted-foreground">إشعارات الأيام المثالية للعناية</p>
                    </div>
                    <Switch
                      checked={settings.beauty_reminders}
                      onCheckedChange={(checked) => updateSetting('beauty_reminders', checked)}
                      disabled={!settings.notifications_enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <Label className="text-sm font-medium">تذكير القضاء</Label>
                      <p className="text-xs text-muted-foreground">إشعارات أيام الصيام</p>
                    </div>
                    <Switch
                      checked={settings.fasting_reminders}
                      onCheckedChange={(checked) => updateSetting('fasting_reminders', checked)}
                      disabled={!settings.notifications_enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <Label className="text-sm font-medium">تذكير الروتينات</Label>
                      <p className="text-xs text-muted-foreground">إشعارات الروتينات اليومية</p>
                    </div>
                    <Switch
                      checked={settings.routine_reminders}
                      onCheckedChange={(checked) => updateSetting('routine_reminders', checked)}
                      disabled={!settings.notifications_enabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  الخصوصية والأمان
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <Label className="text-base font-medium">مشاركة البيانات</Label>
                    <p className="text-xs text-muted-foreground">مشاركة البيانات لتحسين التطبيق</p>
                  </div>
                  <Switch
                    checked={settings.data_sharing}
                    onCheckedChange={(checked) => updateSetting('data_sharing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <Label className="text-base font-medium">تحليلات الاستخدام</Label>
                    <p className="text-xs text-muted-foreground">جمع بيانات الاستخدام المجهولة</p>
                  </div>
                  <Switch
                    checked={settings.analytics_enabled}
                    onCheckedChange={(checked) => updateSetting('analytics_enabled', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">النسخ الاحتياطي التلقائي</Label>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <Label className="text-sm font-medium">تفعيل النسخ الاحتياطي</Label>
                      <p className="text-xs text-muted-foreground">نسخ احتياطي تلقائي للبيانات</p>
                    </div>
                    <Switch
                      checked={settings.auto_backup_enabled}
                      onCheckedChange={(checked) => updateSetting('auto_backup_enabled', checked)}
                    />
                  </div>

                  {settings.auto_backup_enabled && (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <Label className="text-sm font-medium">تكرار النسخ الاحتياطي</Label>
                      <Select
                        value={settings.backup_frequency}
                        onValueChange={(value) => updateSetting('backup_frequency', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">يومي</SelectItem>
                          <SelectItem value="weekly">أسبوعي</SelectItem>
                          <SelectItem value="monthly">شهري</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Separator />

                <button
                  onClick={() => navigate('/data-export')}
                  className="w-full flex items-center justify-between p-4 rounded-lg bg-info/10 border border-info/20 hover:bg-info/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-info" />
                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                      <p className="text-sm font-medium">تصدير البيانات</p>
                      <p className="text-xs text-muted-foreground">تنزيل نسخة من بياناتك</p>
                    </div>
                  </div>
                  <ChevronLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display */}
          <TabsContent value="display" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  إعدادات العرض
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <Label className="text-base font-medium">الوضع المضغوط</Label>
                    <p className="text-xs text-muted-foreground">عرض محتوى أكثر في الشاشة</p>
                  </div>
                  <Switch
                    checked={settings.compact_view}
                    onCheckedChange={(checked) => updateSetting('compact_view', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <Label className="text-base font-medium">التقويم القمري</Label>
                      <p className="text-xs text-muted-foreground">عرض التواريخ القمرية</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.show_lunar_calendar}
                    onCheckedChange={(checked) => updateSetting('show_lunar_calendar', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div>
                      <Label className="text-base font-medium">التاريخ الهجري</Label>
                      <p className="text-xs text-muted-foreground">عرض التواريخ الهجرية</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.show_hijri_dates}
                    onCheckedChange={(checked) => updateSetting('show_hijri_dates', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="bg-info/5 border-info/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div className="text-sm space-y-1">
                <p className="font-medium">نصيحة</p>
                <p className="text-muted-foreground">
                  جميع الإعدادات تُحفظ تلقائياً في السحابة ويمكن استرجاعها من أي جهاز
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
