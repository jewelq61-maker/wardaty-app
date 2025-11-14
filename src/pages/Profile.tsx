import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, LogOut, User, Settings, BarChart3, Moon, Sun, 
  Globe, Download, Trash2, ChevronRight, Edit2, Check, X, Share2, Link2, UserPlus, Copy, Heart, Crown, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import SyncedCycleInsights from '@/components/SyncedCycleInsights';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/hooks/use-toast';
import PregnancyModeToggle from '@/components/PregnancyModeToggle';
import { useAppleHealth } from '@/hooks/use-apple-health';

interface ProfileData {
  name: string;
  persona: string;
  locale: string;
  theme: string;
  is_pregnant?: boolean;
  pregnancy_lmp?: string | null;
  pregnancy_edd?: string | null;
  pregnancy_calculation_method?: string | null;
}

interface Statistics {
  totalCycles: number;
  trackedDays: number;
  moodsLogged: number;
  beautyActions: number;
}

interface ShareLink {
  id: string;
  code: string;
  status: 'pending' | 'active';
  connected_user_id?: string;
  created_at: string;
}

interface PartnerProfile {
  name: string;
  email: string;
  stats: Statistics;
}

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { locale, setLocale, dir } = useI18n();
  const { theme, setTheme, setPersona } = useTheme();
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
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null);
  const [connectCode, setConnectCode] = useState('');
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showPersonaPreview, setShowPersonaPreview] = useState(false);
  const [previewPersona, setPreviewPersona] = useState<string>('');
  const { isAvailable: isHealthAvailable, isConnected: isHealthConnected, connectToHealth, syncHealthData } = useAppleHealth();

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStatistics();
      if (profile.persona === 'married') {
        loadShareLink();
        loadPartnerProfile();
      }
    }
  }, [user, profile.persona]);

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
        is_pregnant: data.is_pregnant || false,
        pregnancy_lmp: data.pregnancy_lmp || null,
        pregnancy_edd: data.pregnancy_edd || null,
        pregnancy_calculation_method: data.pregnancy_calculation_method || null,
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

  const loadShareLink = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('share_links')
      .select('*')
      .eq('owner_id', user.id)
      .eq('type', 'profile')
      .maybeSingle();

    if (data) {
      setShareLink(data as ShareLink);
    }
  };

  const loadPartnerProfile = async () => {
    if (!user) return;

    // Check if user is connected to someone else's profile
    const { data: connectedLink } = await supabase
      .from('share_links')
      .select('*, profiles!share_links_owner_id_fkey(name, email)')
      .eq('connected_user_id', user.id)
      .eq('type', 'profile')
      .eq('status', 'active')
      .maybeSingle();

    if (connectedLink) {
      // Load partner's statistics
      const partnerId = connectedLink.owner_id;
      
      const [cycles, cycleDays, moodDays, beautyActions] = await Promise.all([
        supabase.from('cycles').select('id').eq('user_id', partnerId),
        supabase.from('cycle_days').select('id').eq('user_id', partnerId),
        supabase.from('cycle_days').select('id').eq('user_id', partnerId).not('mood', 'is', null),
        supabase.from('beauty_actions').select('id').eq('user_id', partnerId),
      ]);

      setPartnerProfile({
        name: (connectedLink.profiles as any)?.name || 'Partner',
        email: (connectedLink.profiles as any)?.email || '',
        stats: {
          totalCycles: cycles.data?.length || 0,
          trackedDays: cycleDays.data?.length || 0,
          moodsLogged: moodDays.data?.length || 0,
          beautyActions: beautyActions.data?.length || 0,
        }
      });
    }
  };

  const generateShareLink = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let code = '';
      let attempts = 0;
      const maxAttempts = 10;
      
      // Try to generate a unique code with retry logic
      while (attempts < maxAttempts) {
        // Use crypto.randomUUID() for secure random code generation
        code = crypto.randomUUID().substring(0, 8).toUpperCase().replace(/-/g, '');
        
        // Check if code already exists
        const { data: existing } = await supabase
          .from('share_links')
          .select('id')
          .eq('code', code)
          .maybeSingle();
        
        if (!existing) break;
        attempts++;
      }
      
      if (attempts === maxAttempts) {
        throw new Error('Failed to generate unique code. Please try again.');
      }

      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('share_links')
        .insert({
          owner_id: user.id,
          type: 'profile',
          code,
          status: 'pending',
          scope: { stats: true },
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setShareLink(data as ShareLink);
      toast({
        title: t('success'),
        description: t('profilePage.shareLinkCreated'),
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('profilePage.shareLinkError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const connectWithCode = async () => {
    if (!user || !connectCode.trim()) return;

    setLoading(true);
    try {
      // Find the share link by code
      const { data: link, error: findError } = await supabase
        .from('share_links')
        .select('*')
        .eq('code', connectCode.toUpperCase())
        .eq('type', 'profile')
        .eq('status', 'pending')
        .maybeSingle();

      if (findError || !link) {
        throw new Error(t('profilePage.invalidCode'));
      }
      
      // Check if link has expired
      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        throw new Error('This share code has expired.');
      }

      // Update the share link with connected user
      const { error: updateError } = await supabase
        .from('share_links')
        .update({
          connected_user_id: user.id,
          status: 'active'
        })
        .eq('id', link.id);

      if (updateError) throw updateError;

      toast({
        title: t('success'),
        description: t('profilePage.connectedSuccess'),
      });

      setShowConnectDialog(false);
      setConnectCode('');
      loadPartnerProfile();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('profilePage.connectError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyShareCode = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink.code);
      toast({
        title: t('success'),
        description: t('profilePage.codeCopied'),
      });
    }
  };

  const revokeShareLink = async () => {
    if (!shareLink) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('share_links')
        .delete()
        .eq('id', shareLink.id);

      if (error) throw error;

      setShareLink(null);
      toast({
        title: t('success'),
        description: t('profilePage.shareLinkRevoked'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('profilePage.revokeError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
      
      if (field === 'persona' && typeof value === 'string') {
        setPersona(value as 'single' | 'married' | 'mother' | 'partner');
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
    <div className="min-h-screen gradient-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-card/80 backdrop-blur-lg z-10 border-b border-border/50">
        <div className="p-4 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 shadow-elegant">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                {profile.name?.[0]?.toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-bold text-foreground">{t('profile')}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-6 pb-6 space-y-6">
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

        {/* Partner Sharing - Premium Feature for Married */}
        {profile.persona === 'married' && (
          <div className="rounded-3xl bg-gradient-to-br from-married-primary/10 to-married-primary/5 p-6 border-2 border-married-primary/20 shadow-lg animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-married-primary/10 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-married-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{t('profilePage.partnerSharing')}</h3>
                <Badge className="mt-1 bg-married-primary/10 text-married-primary border-married-primary/20 text-xs">
                  {t('profilePage.premiumFeature')}
                </Badge>
              </div>
            </div>

            {/* Partner's Stats */}
            {partnerProfile && (
              <div className="mb-4 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{partnerProfile.name}</p>
                    <p className="text-xs text-muted-foreground">{t('profilePage.partnerStats')}</p>
                  </div>
                  <UserPlus className="w-5 h-5 text-married-primary" />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg bg-background/50">
                    <div className="text-lg font-bold text-married-primary">{partnerProfile.stats.totalCycles}</div>
                    <div className="text-xs text-muted-foreground">{t('statsPage.totalCycles')}</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-background/50">
                    <div className="text-lg font-bold text-married-primary">{partnerProfile.stats.trackedDays}</div>
                    <div className="text-xs text-muted-foreground">{t('statsPage.trackedDays')}</div>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/partner-view')}
                  variant="outline"
                  className="w-full h-10 border-2 border-married-primary/30 hover:bg-married-primary/10"
                >
                  <Heart className="w-4 h-4 mr-2 text-married-primary" />
                  {t('profilePage.viewPartnerProfile')}
                </Button>
              </div>
            )}

            {/* Share Link Management */}
            <div className="space-y-3">
              {shareLink ? (
                <div className="p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{t('profilePage.shareCode')}</span>
                    <Badge className="bg-success/10 text-success border-success/20">
                      {shareLink.status === 'active' ? t('profilePage.connected') : t('profilePage.pending')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 font-mono text-2xl font-bold tracking-wider text-foreground">
                      {shareLink.code}
                    </div>
                    <Button size="icon" variant="outline" onClick={copyShareCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={revokeShareLink}
                    className="w-full mt-3 text-destructive hover:text-destructive"
                    disabled={loading}
                  >
                    {t('profilePage.revokeLink')}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={generateShareLink}
                  disabled={loading}
                  className="w-full h-12 bg-married-primary hover:bg-married-primary/90"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  {t('profilePage.generateShareLink')}
                </Button>
              )}

              {!partnerProfile && (
                <Button
                  variant="outline"
                  onClick={() => setShowConnectDialog(true)}
                  className="w-full h-12 border-2"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('profilePage.connectWithPartner')}
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              {t('profilePage.sharingDescription')}
            </p>

            {/* Synchronized Cycle Insights */}
            {shareLink?.status === 'active' && shareLink.connected_user_id && (
              <div className="mt-4">
                <SyncedCycleInsights partnerId={shareLink.connected_user_id} />
              </div>
            )}
          </div>
        )}

        {/* Apple Health Integration */}
        {isHealthAvailable && (
          <div className="rounded-3xl bg-gradient-to-br from-success/10 to-info/10 p-6 border border-border/50 shadow-md animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              ربط Apple Health
            </h3>
            
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                اربط Apple Health لمزامنة بيانات الصحة من ساعة Apple Watch (الخطوات، النوم، معدل النبض)
              </p>

              <div className="flex items-center gap-3">
                <Badge 
                  variant={isHealthConnected ? "default" : "secondary"}
                  className="text-xs"
                >
                  {isHealthConnected ? '✓ متصل' : 'غير متصل'}
                </Badge>
              </div>

              <div className="flex gap-2">
                {!isHealthConnected ? (
                  <Button
                    onClick={connectToHealth}
                    variant="default"
                    className="flex-1 h-10"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    ربط Apple Health
                  </Button>
                ) : (
                  <Button
                    onClick={syncHealthData}
                    variant="outline"
                    className="flex-1 h-10"
                  >
                    مزامنة البيانات
                  </Button>
                )}
                
                <Button
                  onClick={() => navigate('/apple-health-settings')}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded-lg">
                💡 <strong>ملاحظة:</strong> هذه الميزة تعمل فقط على أجهزة iOS بعد تثبيت التطبيق.
                <button 
                  onClick={() => navigate('/apple-health-settings')}
                  className="text-primary underline block mt-1"
                >
                  إعدادات متقدمة للمزامنة ←
                </button>
              </div>
            </div>
          </div>
        )}

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
              <Button
                variant="outline"
                onClick={() => {
                  setPreviewPersona(profile.persona);
                  setShowPersonaPreview(true);
                }}
                className="w-full h-11 justify-between"
              >
                <span>
                  {profile.persona === 'single' && t('personas.single')}
                  {profile.persona === 'married' && t('personas.married')}
                  {profile.persona === 'mother' && t('personas.mother')}
                  {profile.persona === 'partner' && t('personas.partner')}
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
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
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all duration-200 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Settings className="w-4 h-4 text-primary" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-foreground">
                الإعدادات المتقدمة
              </span>
              <ChevronRight className={`w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => navigate('/subscription')}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-yellow-400/10 to-orange-500/10 hover:from-yellow-400/20 hover:to-orange-500/20 border border-yellow-500/20 transition-all duration-200 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-foreground">
                {t('profilePage.manageSubscription')}
              </span>
              <ChevronRight className={`w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => navigate('/data-export')}
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

            {profile.persona === 'mother' && (
              <button
                onClick={() => navigate('/mother-features')}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-background hover:bg-muted/50 border border-border/50 transition-all duration-200 active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-mother-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-mother-primary" />
                </div>
                <span className="flex-1 text-left text-sm font-medium text-foreground">
                  ميزات الأم
                </span>
                <ChevronRight className={`w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </button>
            )}

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

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('profilePage.connectWithPartner')}</DialogTitle>
            <DialogDescription>
              {t('profilePage.enterPartnerCode')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              value={connectCode}
              onChange={(e) => setConnectCode(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              className="text-center text-2xl font-mono font-bold tracking-wider h-14"
              maxLength={6}
            />
            <Button
              onClick={connectWithCode}
              disabled={loading || !connectCode.trim()}
              className="w-full h-12"
            >
              {t('profilePage.connect')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Persona Preview Dialog */}
      <Dialog open={showPersonaPreview} onOpenChange={setShowPersonaPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('onboarding.choosePersona')}</DialogTitle>
            <DialogDescription>
              اختاري الشخصية المناسبة لكِ وشاهدي كيف سيظهر الثيم
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {/* Single Persona */}
            <div
              onClick={() => setPreviewPersona('single')}
              className={`cursor-pointer rounded-xl border-2 transition-all hover:scale-105 ${
                previewPersona === 'single' ? 'border-[hsl(0,100%,91%)] shadow-lg' : 'border-border'
              }`}
            >
              <div className="p-4 bg-gradient-to-br from-[hsl(0,100%,98%)] to-[hsl(0,100%,95%)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[hsl(0,0%,18%)]">{t('personas.single')}</h3>
                  {previewPersona === 'single' && (
                    <Check className="w-5 h-5 text-[hsl(0,100%,91%)]" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="h-8 rounded-lg bg-[hsl(0,100%,91%)]" />
                  <div className="h-6 rounded-lg bg-[hsl(0,100%,87%)]" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-lg bg-[hsl(0,100%,96%)]" />
                    <div className="h-6 w-16 rounded-lg bg-[hsl(0,73%,53%)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Married Persona */}
            <div
              onClick={() => setPreviewPersona('married')}
              className={`cursor-pointer rounded-xl border-2 transition-all hover:scale-105 ${
                previewPersona === 'married' ? 'border-[hsl(351,100%,86%)] shadow-lg' : 'border-border'
              }`}
            >
              <div className="p-4 bg-gradient-to-br from-[hsl(350,100%,98%)] to-[hsl(0,100%,95%)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[hsl(0,0%,18%)]">{t('personas.married')}</h3>
                  {previewPersona === 'married' && (
                    <Check className="w-5 h-5 text-[hsl(351,100%,86%)]" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="h-8 rounded-lg bg-[hsl(351,100%,86%)]" />
                  <div className="h-6 rounded-lg bg-[hsl(330,100%,71%)]" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-lg bg-[hsl(350,100%,96%)]" />
                    <div className="h-6 w-16 rounded-lg bg-[hsl(0,73%,53%)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mother Persona */}
            <div
              onClick={() => setPreviewPersona('mother')}
              className={`cursor-pointer rounded-xl border-2 transition-all hover:scale-105 ${
                previewPersona === 'mother' ? 'border-[hsl(274,65%,74%)] shadow-lg' : 'border-border'
              }`}
            >
              <div className="p-4 bg-gradient-to-br from-[hsl(270,100%,98%)] to-[hsl(270,100%,95%)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[hsl(0,0%,18%)]">{t('personas.mother')}</h3>
                  {previewPersona === 'mother' && (
                    <Check className="w-5 h-5 text-[hsl(274,65%,74%)]" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="h-8 rounded-lg bg-[hsl(274,65%,74%)]" />
                  <div className="h-6 rounded-lg bg-[hsl(223,100%,88%)]" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-lg bg-[hsl(270,100%,96%)]" />
                    <div className="h-6 w-16 rounded-lg bg-[hsl(0,73%,53%)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Partner Persona */}
            <div
              onClick={() => setPreviewPersona('partner')}
              className={`cursor-pointer rounded-xl border-2 transition-all hover:scale-105 ${
                previewPersona === 'partner' ? 'border-[hsl(340,89%,82%)] shadow-lg' : 'border-border'
              }`}
            >
              <div className="p-4 bg-gradient-to-br from-[hsl(340,100%,98%)] to-[hsl(340,100%,95%)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[hsl(0,0%,18%)]">{t('personas.partner')}</h3>
                  {previewPersona === 'partner' && (
                    <Check className="w-5 h-5 text-[hsl(340,89%,82%)]" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="h-8 rounded-lg bg-[hsl(340,89%,82%)]" />
                  <div className="h-6 rounded-lg bg-[hsl(0,84%,60%)]" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-lg bg-[hsl(340,100%,96%)]" />
                    <div className="h-6 w-16 rounded-lg bg-[hsl(0,73%,53%)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPersonaPreview(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={async () => {
                await updateProfile('persona', previewPersona);
                setShowPersonaPreview(false);
              }}
              disabled={loading || !previewPersona}
              className="flex-1"
            >
              تطبيق
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
