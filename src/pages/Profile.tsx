import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, LogOut, User, Settings, BarChart3, Moon, Sun, 
  Globe, Download, Trash2, ChevronRight, Edit2, Check, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  name: string;
  persona: string;
  locale: string;
  theme: string;
}

interface Statistics {
  totalCycles: number;
  trackedDays: number;
  moodsLogged: number;
  beautyActions: number;
}

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { locale, setLocale, dir } = useI18n();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    persona: 'single',
    locale: 'ar',
    theme: 'light',
  });
  const [stats, setStats] = useState<Statistics>({
    totalCycles: 0,
    trackedDays: 0,
    moodsLogged: 0,
    beautyActions: 0,
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStatistics();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile({
        name: data.name || '',
        persona: data.persona || 'single',
        locale: data.locale || 'ar',
        theme: data.theme || 'light',
      });
      setTempName(data.name || '');
      // No need to set theme here as ThemeContext handles it
    }
  };

  const loadStatistics = async () => {
    if (!user) return;

    // Get total cycles
    const { data: cycles } = await supabase
      .from('cycles')
      .select('id')
      .eq('user_id', user.id);

    // Get tracked days
    const { data: cycleDays } = await supabase
      .from('cycle_days')
      .select('id')
      .eq('user_id', user.id);

    // Get moods logged
    const { data: moodDays } = await supabase
      .from('cycle_days')
      .select('id')
      .eq('user_id', user.id)
      .not('mood', 'is', null);

    // Get beauty actions
    const { data: beautyActions } = await supabase
      .from('beauty_actions')
      .select('id')
      .eq('user_id', user.id);

    setStats({
      totalCycles: cycles?.length || 0,
      trackedDays: cycleDays?.length || 0,
      moodsLogged: moodDays?.length || 0,
      beautyActions: beautyActions?.length || 0,
    });
  };

  const updateProfile = async (field: keyof ProfileData, value: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, [field]: value }));
      
      if (field === 'locale' && (value === 'ar' || value === 'en')) {
        setLocale(value);
      }
      
      if (field === 'theme' && (value === 'light' || value === 'dark')) {
        setTheme(value);
      }

      toast({
        title: t('success'),
        description: t('profilePage.updated'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('profilePage.updateError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    await updateProfile('name', tempName);
    setIsEditingName(false);
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      // Fetch all user data
      const [cycles, cycleDays, beautyActions, fastingEntries] = await Promise.all([
        supabase.from('cycles').select('*').eq('user_id', user.id),
        supabase.from('cycle_days').select('*').eq('user_id', user.id),
        supabase.from('beauty_actions').select('*').eq('user_id', user.id),
        supabase.from('fasting_entries').select('*').eq('user_id', user.id),
      ]);

      const exportData = {
        profile,
        cycles: cycles.data,
        cycleDays: cycleDays.data,
        beautyActions: beautyActions.data,
        fastingEntries: fastingEntries.data,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wardiya-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: t('success'),
        description: t('profilePage.dataExported'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('profilePage.exportError'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // Delete all user data
      await Promise.all([
        supabase.from('cycles').delete().eq('user_id', user.id),
        supabase.from('cycle_days').delete().eq('user_id', user.id),
        supabase.from('beauty_actions').delete().eq('user_id', user.id),
        supabase.from('fasting_entries').delete().eq('user_id', user.id),
        supabase.from('profiles').delete().eq('id', user.id),
      ]);

      await supabase.auth.signOut();
      
      toast({
        title: t('success'),
        description: t('profilePage.accountDeleted'),
      });
      
      navigate('/auth');
    } catch (error) {
      toast({
        title: t('error'),
        description: t('profilePage.deleteError'),
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: t('success'),
      description: t('logout'),
    });
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Compact Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border/50">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-primary/20 ring-2 ring-primary/10">
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                {profile.name?.[0]?.toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-bold text-foreground">{t('profile')}</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Profile Card */}
        <div className="rounded-3xl bg-gradient-to-br from-card to-muted/20 p-6 border border-border/50 shadow-lg animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="h-10"
                    placeholder={t('profilePage.enterName')}
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveName} className="shrink-0">
                    <Check className="w-4 h-4 text-success" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)} className="shrink-0">
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-foreground">
                      {profile.name || user?.email?.split('@')[0] || t('user')}
                    </h2>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setIsEditingName(true)}
                      className="w-8 h-8"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {t(`personas.${profile.persona}`)}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="rounded-2xl bg-background/50 backdrop-blur-sm p-4 border border-border/50">
              <div className="text-2xl font-bold text-primary">{stats.totalCycles}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('statsPage.totalCycles')}</div>
            </div>
            <div className="rounded-2xl bg-background/50 backdrop-blur-sm p-4 border border-border/50">
              <div className="text-2xl font-bold text-secondary">{stats.trackedDays}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('statsPage.trackedDays')}</div>
            </div>
            <div className="rounded-2xl bg-background/50 backdrop-blur-sm p-4 border border-border/50">
              <div className="text-2xl font-bold text-success">{stats.moodsLogged}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('profilePage.moodsLogged')}</div>
            </div>
            <div className="rounded-2xl bg-background/50 backdrop-blur-sm p-4 border border-border/50">
              <div className="text-2xl font-bold text-fasting">{stats.beautyActions}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('profilePage.beautyScheduled')}</div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-3xl bg-card p-6 border border-border/50 shadow-md animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t('profilePage.preferences')}
          </h3>
          
          <div className="space-y-4">
            {/* Persona */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('onboarding.choosePersona')}</Label>
              <Select
                value={profile.persona}
                onValueChange={(value) => updateProfile('persona', value)}
                disabled={loading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">{t('personas.single')}</SelectItem>
                  <SelectItem value="married">{t('personas.married')}</SelectItem>
                  <SelectItem value="mother">{t('personas.mother')}</SelectItem>
                  <SelectItem value="partner">{t('personas.partner')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Language */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <Label className="text-sm font-medium">{t('onboarding.chooseLanguage')}</Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateProfile('locale', locale === 'ar' ? 'en' : 'ar')}
                disabled={loading}
                className="h-9 px-4 min-w-24"
              >
                {locale === 'ar' ? 'العربية' : 'English'}
              </Button>
            </div>

            <Separator />

            {/* Theme */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-secondary" />
                  ) : (
                    <Sun className="w-4 h-4 text-secondary" />
                  )}
                </div>
                <Label className="text-sm font-medium">{t('profilePage.darkMode')}</Label>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => updateProfile('theme', checked ? 'dark' : 'light')}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="rounded-3xl bg-card p-6 border border-border/50 shadow-md animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('profilePage.dataPrivacy')}
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={handleExportData}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-background hover:bg-muted/50 border border-border/50 transition-all duration-200 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Download className="w-4 h-4 text-success" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-foreground">
                {t('profilePage.exportData')}
              </span>
              <ChevronRight className={`w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-background hover:bg-destructive/5 border border-border/50 hover:border-destructive/30 transition-all duration-200 active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-destructive">
                    {t('profilePage.deleteAccount')}
                  </span>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('profilePage.confirmDelete')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('profilePage.confirmDeleteDesc')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
