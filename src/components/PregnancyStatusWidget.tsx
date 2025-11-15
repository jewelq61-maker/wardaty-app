import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { differenceInDays, differenceInWeeks, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Baby, Heart, Milk, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PregnancyData {
  is_pregnant: boolean;
  pregnancy_lmp: string | null;
  pregnancy_edd: string | null;
  pregnancy_weeks: number | null;
  breastfeeding: boolean;
  breastfeeding_start_date: string | null;
  postpartum_start_date: string | null;
}

export default function PregnancyStatusWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pregnancyData, setPregnancyData] = useState<PregnancyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPregnancyData();
  }, [user]);

  const loadPregnancyData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_pregnant, pregnancy_lmp, pregnancy_edd, pregnancy_weeks, breastfeeding, breastfeeding_start_date, postpartum_start_date')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setPregnancyData(data);
    } catch (error) {
      console.error('Error loading pregnancy data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !pregnancyData) return null;

  // Check if user is in any of these states
  const isPregnant = pregnancyData.is_pregnant;
  const isBreastfeeding = pregnancyData.breastfeeding;
  const isPostpartum = pregnancyData.postpartum_start_date && 
    differenceInDays(new Date(), new Date(pregnancyData.postpartum_start_date)) <= 40;

  // Don't show widget if none of the states are active
  if (!isPregnant && !isBreastfeeding && !isPostpartum) return null;

  // Calculate pregnancy details
  let weeksPregnant = 0;
  let daysUntilDueDate = 0;
  if (isPregnant && pregnancyData.pregnancy_lmp) {
    const lmpDate = new Date(pregnancyData.pregnancy_lmp);
    weeksPregnant = differenceInWeeks(new Date(), lmpDate);
    
    if (pregnancyData.pregnancy_edd) {
      daysUntilDueDate = differenceInDays(new Date(pregnancyData.pregnancy_edd), new Date());
    }
  }

  // Calculate postpartum days
  let postpartumDays = 0;
  if (isPostpartum && pregnancyData.postpartum_start_date) {
    postpartumDays = differenceInDays(new Date(), new Date(pregnancyData.postpartum_start_date));
  }

  // Calculate breastfeeding duration
  let breastfeedingMonths = 0;
  if (isBreastfeeding && pregnancyData.breastfeeding_start_date) {
    const months = differenceInDays(new Date(), new Date(pregnancyData.breastfeeding_start_date)) / 30;
    breastfeedingMonths = Math.floor(months);
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-blue-50/50 dark:from-pink-950/20 dark:via-purple-950/10 dark:to-blue-950/20"
      onClick={() => navigate('/pregnancy-calendar')}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {isPregnant && (
              <>
                <Baby className="h-5 w-5 text-pink-500" />
                <span>{t('pregnancy.tracking')}</span>
              </>
            )}
            {isPostpartum && !isPregnant && (
              <>
                <Heart className="h-5 w-5 text-purple-500" />
                <span>{t('postpartum.tracking')}</span>
              </>
            )}
            {isBreastfeeding && !isPregnant && !isPostpartum && (
              <>
                <Milk className="h-5 w-5 text-blue-500" />
                <span>{t('breastfeeding.tracking')}</span>
              </>
            )}
          </CardTitle>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pregnancy Info */}
        {isPregnant && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-pink-500" />
                <span className="text-sm text-muted-foreground">
                  {t('pregnancy.weeks')}
                </span>
              </div>
              <Badge variant="secondary" className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
                {weeksPregnant} {t('pregnancy.week')}
              </Badge>
            </div>

            {daysUntilDueDate > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('pregnancy.daysUntilDue')}
                </span>
                <span className="font-semibold text-pink-600 dark:text-pink-400">
                  {daysUntilDueDate} {t('common.days')}
                </span>
              </div>
            )}

            <div className="mt-3 p-3 bg-pink-50 dark:bg-pink-950/30 rounded-lg">
              <p className="text-xs text-muted-foreground">
                {t('pregnancy.tip')}
              </p>
            </div>
          </div>
        )}

        {/* Postpartum Info */}
        {isPostpartum && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('postpartum.daysPostpartum')}
              </span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                {postpartumDays} / 40 {t('common.days')}
              </Badge>
            </div>

            <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(postpartumDays / 40) * 100}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              {t('postpartum.tip')}
            </p>
          </div>
        )}

        {/* Breastfeeding Info */}
        {isBreastfeeding && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('breastfeeding.duration')}
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {breastfeedingMonths} {t('breastfeeding.months')}
              </Badge>
            </div>

            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-xs text-muted-foreground">
                {t('breastfeeding.tip')}
              </p>
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/pregnancy-calendar');
          }}
        >
          {t('pregnancy.viewDetails')}
          <ChevronRight className="h-4 w-4 mr-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
