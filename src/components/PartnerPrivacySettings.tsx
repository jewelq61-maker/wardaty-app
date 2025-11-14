import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, Baby, Calendar, Heart, Smile } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PrivacySettings {
  show_period_days: boolean;
  show_fertility_window: boolean;
  show_general_mood: boolean;
  show_pregnancy: boolean;
  show_nothing: boolean;
}

export default function PartnerPrivacySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>({
    show_period_days: true,
    show_fertility_window: true,
    show_general_mood: false,
    show_pregnancy: true,
    show_nothing: false,
  });
  const [shareLinkId, setShareLinkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasPartner, setHasPartner] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      // Check if user has an active share link
      const { data: shareLink } = await supabase
        .from('share_links')
        .select('id, privacy_settings')
        .eq('owner_id', user.id)
        .eq('type', 'profile')
        .eq('status', 'active')
        .maybeSingle();

      if (shareLink) {
        setShareLinkId(shareLink.id);
        setHasPartner(true);
        if (shareLink.privacy_settings) {
          setSettings(shareLink.privacy_settings as unknown as PrivacySettings);
        }
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const updateSetting = async (key: keyof PrivacySettings, value: boolean) => {
    if (!shareLinkId) return;

    setLoading(true);
    try {
      const newSettings = { ...settings, [key]: value };
      
      // If show_nothing is enabled, disable all other settings
      if (key === 'show_nothing' && value) {
        newSettings.show_period_days = false;
        newSettings.show_fertility_window = false;
        newSettings.show_general_mood = false;
        newSettings.show_pregnancy = false;
      }
      
      // If any other setting is enabled, disable show_nothing
      if (key !== 'show_nothing' && value) {
        newSettings.show_nothing = false;
      }

      const { error } = await supabase
        .from('share_links')
        .update({ privacy_settings: newSettings })
        .eq('id', shareLinkId);

      if (error) throw error;

      setSettings(newSettings);
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث إعدادات الخصوصية بنجاح',
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الإعدادات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!hasPartner) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Shield className="w-5 h-5" />
            <p>لا يوجد شريك متصل حالياً</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          إعدادات خصوصية الشريك
        </CardTitle>
        <CardDescription>
          تحكمي في المعلومات التي يمكن لشريكك رؤيتها
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Eye className="w-4 h-4" />
          <AlertDescription>
            شريكك لن يرى أبداً: الأعراض التفصيلية، الآلام، الأدوية، الوزن، أو أي ملاحظات خاصة
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Show Nothing */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
            <div className="flex items-start gap-3 flex-1">
              <EyeOff className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <Label htmlFor="show_nothing" className="text-base font-medium cursor-pointer">
                  إخفاء جميع المعلومات
                </Label>
                <p className="text-sm text-muted-foreground">
                  لن يرى شريكك أي معلومات
                </p>
              </div>
            </div>
            <Switch
              id="show_nothing"
              checked={settings.show_nothing}
              onCheckedChange={(checked) => updateSetting('show_nothing', checked)}
              disabled={loading}
            />
          </div>

          <div className="h-px bg-border" />

          {/* Period Days */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <Label htmlFor="show_period_days" className="text-base font-medium cursor-pointer">
                  إظهار أيام الدورة
                </Label>
                <p className="text-sm text-muted-foreground">
                  موعد الدورة القادم وطول الدورة فقط
                </p>
              </div>
            </div>
            <Switch
              id="show_period_days"
              checked={settings.show_period_days}
              onCheckedChange={(checked) => updateSetting('show_period_days', checked)}
              disabled={loading || settings.show_nothing}
            />
          </div>

          {/* Fertility Window */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <Heart className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <div>
                <Label htmlFor="show_fertility" className="text-base font-medium cursor-pointer">
                  إظهار نافذة الخصوبة
                </Label>
                <p className="text-sm text-muted-foreground">
                  معلومات عامة عن أيام الخصوبة (تقريبية)
                </p>
              </div>
            </div>
            <Switch
              id="show_fertility"
              checked={settings.show_fertility_window}
              onCheckedChange={(checked) => updateSetting('show_fertility_window', checked)}
              disabled={loading || settings.show_nothing}
            />
          </div>

          {/* General Mood */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <Smile className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <Label htmlFor="show_mood" className="text-base font-medium cursor-pointer">
                  إظهار المزاج العام
                </Label>
                <p className="text-sm text-muted-foreground">
                  نصائح عامة فقط (مثل: احتياج للراحة)
                </p>
              </div>
            </div>
            <Switch
              id="show_mood"
              checked={settings.show_general_mood}
              onCheckedChange={(checked) => updateSetting('show_general_mood', checked)}
              disabled={loading || settings.show_nothing}
            />
          </div>

          {/* Pregnancy */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <Baby className="w-5 h-5 text-info shrink-0 mt-0.5" />
              <div>
                <Label htmlFor="show_pregnancy" className="text-base font-medium cursor-pointer">
                  إظهار الحمل
                </Label>
                <p className="text-sm text-muted-foreground">
                  أسبوع الحمل وموعد الولادة فقط
                </p>
              </div>
            </div>
            <Switch
              id="show_pregnancy"
              checked={settings.show_pregnancy}
              onCheckedChange={(checked) => updateSetting('show_pregnancy', checked)}
              disabled={loading || settings.show_nothing}
            />
          </div>
        </div>

        <Alert className="bg-muted/30">
          <Shield className="w-4 h-4" />
          <AlertDescription className="text-xs">
            💡 نصيحة: يمكنك تغيير هذه الإعدادات في أي وقت. شريكك لن يتم إشعاره بالتغييرات.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}