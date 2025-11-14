import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Download, FileText, Calendar as CalendarIcon, Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import PremiumPaywall from '@/components/PremiumPaywall';
import { format } from 'date-fns';

export default function DataExport() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { dir } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedData, setSelectedData] = useState({
    cycles: true,
    symptoms: true,
    moods: true,
    beautyActions: true,
    fastingQada: true,
  });
  
  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();
    
    const premium = data?.is_premium || false;
    setIsPremium(premium);
    if (!premium) {
      setShowPaywall(true);
    }
  };

  const handleExport = async () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    try {
      const exportData: any = {
        exportDate: new Date().toISOString(),
        user: user?.email,
      };

      if (selectedData.cycles) {
        const { data: cycles } = await supabase
          .from('cycles')
          .select('*')
          .eq('user_id', user?.id)
          .order('start_date', { ascending: false });
        exportData.cycles = cycles;

        const { data: cycleDays } = await supabase
          .from('cycle_days')
          .select('*')
          .eq('user_id', user?.id)
          .order('date', { ascending: false });
        exportData.cycleDays = cycleDays;
      }

      if (selectedData.beautyActions) {
        const { data: beautyActions } = await supabase
          .from('beauty_actions')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
        exportData.beautyActions = beautyActions;
      }

      if (selectedData.fastingQada) {
        const { data: fastingEntries } = await supabase
          .from('fasting_entries')
          .select('*')
          .eq('user_id', user?.id)
          .order('date', { ascending: false });
        exportData.fastingEntries = fastingEntries;
      }

      // Create JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wardiya-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'تم التصدير بنجاح',
        description: 'تم تحميل بياناتك بنجاح',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تصدير البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium && showPaywall) {
    return <PremiumPaywall open={showPaywall} onClose={() => navigate(-1)} feature="data-export" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <BackIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">تصدير البيانات</h1>
              <p className="text-sm text-muted-foreground">احفظي نسخة من بياناتك</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <Card className="glass shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              ما هو التصدير؟
            </CardTitle>
            <CardDescription>
              يمكنك تحميل نسخة من جميع بياناتك في ملف JSON. هذا الملف يحتوي على سجل دوراتك، أعراضك، مخطط الجمال، وسجل القضاء.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Select Data */}
        <Card className="glass shadow-elegant">
          <CardHeader>
            <CardTitle>اختاري البيانات المراد تصديرها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="cycles"
                checked={selectedData.cycles}
                onCheckedChange={(checked) =>
                  setSelectedData({ ...selectedData, cycles: checked as boolean })
                }
              />
              <Label htmlFor="cycles" className="flex items-center gap-2 cursor-pointer">
                <CalendarIcon className="h-4 w-4 text-primary" />
                الدورة الشهرية والأعراض
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="beauty"
                checked={selectedData.beautyActions}
                onCheckedChange={(checked) =>
                  setSelectedData({ ...selectedData, beautyActions: checked as boolean })
                }
              />
              <Label htmlFor="beauty" className="flex items-center gap-2 cursor-pointer">
                <Sparkles className="h-4 w-4 text-primary" />
                مخطط الجمال
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="fasting"
                checked={selectedData.fastingQada}
                onCheckedChange={(checked) =>
                  setSelectedData({ ...selectedData, fastingQada: checked as boolean })
                }
              />
              <Label htmlFor="fasting" className="flex items-center gap-2 cursor-pointer">
                <Heart className="h-4 w-4 text-primary" />
                سجل قضاء الصيام
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Export Button */}
        <Button
          className="w-full h-14 text-lg shadow-elegant"
          size="lg"
          onClick={handleExport}
          disabled={loading}
        >
          <Download className="mr-2 h-5 w-5" />
          {loading ? 'جاري التصدير...' : 'تصدير البيانات'}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
