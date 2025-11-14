import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Crown, Sparkles, AlertCircle, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  calculateBeautyRecommendation,
  getCategoryIcon,
  getCategoryName,
  type BeautyCategory,
  type CyclePhase
} from '@/utils/beautyCalculations';

interface BeautyDaySectionProps {
  date: Date;
  cyclePhase: CyclePhase;
  isPremium: boolean;
  onUpgrade: () => void;
}

const categories: BeautyCategory[] = [
  'haircut',
  'waxing',
  'facial',
  'hijama',
  'moroccan-bath',
  'hair-mask'
];

export default function BeautyDaySection({ date, cyclePhase, isPremium, onUpgrade }: BeautyDaySectionProps) {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState<Array<{
    category: BeautyCategory;
    score: number;
    reason: string;
    warnings: string[];
  }>>([]);

  useEffect(() => {
    if (isPremium) {
      const recs = categories
        .map(category => {
          const { score, reason, warnings } = calculateBeautyRecommendation(
            category,
            cyclePhase,
            date
          );
          return { category, score, reason, warnings };
        })
        .filter(r => r.score >= 50)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      
      setRecommendations(recs);
    }
  }, [date, cyclePhase, isPremium]);

  if (!isPremium) {
    return (
      <div className="space-y-3">
        <Separator />
        
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
          <div className="absolute top-3 right-3">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-lg">مخطط الجمال</h3>
              <Badge className="bg-primary/10 text-primary">بلس</Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              اكتشفي أفضل الأيام للإجراءات التجميلية حسب دورتك ومراحل القمر
            </p>
            
            <Button 
              size="sm" 
              className="w-full bg-gradient-to-r from-primary to-secondary"
              onClick={onUpgrade}
            >
              <Lock className="mr-2 h-4 w-4" />
              اشتركي لرؤية التوصيات
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="space-y-3">
        <Separator />
        
        <div className="text-center py-6 text-sm text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
          لا توجد توصيات مناسبة لهذا اليوم
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Separator />
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-bold">توصيات الجمال ليوم {format(date, 'd MMMM', { locale: ar })}</h3>
        </div>
        
        {recommendations.map((rec, index) => (
          <Card key={index} className={`glass shadow-sm border-2 ${
            rec.score >= 80 ? 'border-success/20 bg-success/5' :
            rec.score >= 60 ? 'border-info/20 bg-info/5' :
            'border-warning/20 bg-warning/5'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{getCategoryIcon(rec.category)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{getCategoryName(rec.category)}</h4>
                    <Badge className={
                      rec.score >= 80 ? 'bg-success/10 text-success' :
                      rec.score >= 60 ? 'bg-info/10 text-info' :
                      'bg-warning/10 text-warning'
                    }>
                      {rec.score}%
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">{rec.reason}</p>
                  
                  {rec.warnings && rec.warnings.length > 0 && (
                    <div className="flex items-start gap-2 mt-2 p-2 bg-warning/10 border border-warning/20 rounded-lg">
                      <AlertCircle className="h-3 w-3 text-warning flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-warning">{rec.warnings[0]}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
