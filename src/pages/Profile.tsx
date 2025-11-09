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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24">
      {/* Header with Avatar */}
      <div className="bg-gradient-to-br from-single-primary to-married-primary p-8 text-white animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t('profile')}</h1>
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Bell className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 border-4 border-white/20">
            <AvatarFallback className="bg-white/10 text-white text-2xl">
              {profile.name?.[0]?.toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder={t('profilePage.enterName')}
                />
                <Button size="icon" variant="ghost" onClick={handleSaveName}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">
                  {profile.name || user?.email?.split('@')[0] || t('user')}
                </h2>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setIsEditingName(true)}
                  className="hover:bg-white/10"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            <p className="text-white/80 text-sm">{user?.email}</p>
            <Badge className="mt-2 bg-white/10 text-white border-white/20">
              {t(`personas.${profile.persona}`)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Statistics */}
        <Card className="glass shadow-elegant animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t('profilePage.statistics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="text-3xl font-bold text-primary">{stats.totalCycles}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('statsPage.totalCycles')}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5">
                <div className="text-3xl font-bold text-secondary">{stats.trackedDays}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('statsPage.trackedDays')}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5">
                <div className="text-3xl font-bold text-success">{stats.moodsLogged}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('profilePage.moodsLogged')}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-fasting/10 to-fasting/5">
                <div className="text-3xl font-bold text-fasting">{stats.beautyActions}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('profilePage.beautyScheduled')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="glass shadow-elegant animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t('profilePage.preferences')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Persona */}
            <div className="space-y-2">
              <Label>{t('onboarding.choosePersona')}</Label>
              <Select
                value={profile.persona}
                onValueChange={(value) => updateProfile('persona', value)}
                disabled={loading}
              >
                <SelectTrigger>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <Label>{t('onboarding.chooseLanguage')}</Label>
              </div>
              <Select
                value={profile.locale}
                onValueChange={(value) => updateProfile('locale', value)}
                disabled={loading}
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

            <Separator />

            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
                <Label>{t('profilePage.darkMode')}</Label>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => updateProfile('theme', checked ? 'dark' : 'light')}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="glass shadow-elegant animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t('profilePage.dataPrivacy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExportData}
            >
              <Download className="w-4 h-4 mr-2" />
              {t('profilePage.exportData')}
              <ChevronRight className={`w-4 h-4 ${dir === 'rtl' ? 'mr-auto rotate-180' : 'ml-auto'}`} />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('profilePage.deleteAccount')}
                  <ChevronRight className={`w-4 h-4 ${dir === 'rtl' ? 'mr-auto rotate-180' : 'ml-auto'}`} />
                </Button>
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
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="glass shadow-elegant animate-fade-in">
          <CardContent className="pt-6">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
