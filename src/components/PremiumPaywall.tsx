import { useTranslation } from 'react-i18next';
import { Crown, Sparkles, Calendar, Moon, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface PremiumPaywallProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
  persona?: 'single' | 'married' | 'mother';
}

export default function PremiumPaywall({ open, onClose, feature = 'beauty-planner', persona = 'single' }: PremiumPaywallProps) {
  const { t } = useTranslation();

  const baseFeatures = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'مخطط الجمال الذكي',
      description: 'توصيات يومية محسوبة حسب دورتك ومراحل القمر'
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: 'تكامل مع التقويم',
      description: 'شاهدي أفضل الأيام للإجراءات التجميلية مباشرة'
    },
    {
      icon: <Moon className="h-5 w-5" />,
      title: 'حسابات الحجامة',
      description: 'معرفة الأيام الهجرية المستحبة للحجامة'
    },
    {
      icon: <Crown className="h-5 w-5" />,
      title: 'أهداف شخصية',
      description: 'توصيات مخصصة حسب أهدافك (نمو أسرع، شعر كثيف...)'
    }
  ];

  const marriedFeatures = [
    {
      icon: <Crown className="h-5 w-5" />,
      title: 'مشاركة الشريك',
      description: 'شاركي الدورة والمود مع شريكك عبر كود خاص'
    }
  ];

  const motherFeatures = [
    {
      icon: <Crown className="h-5 w-5" />,
      title: 'متابعة البنات',
      description: 'إضافة بناتك ومتابعة دوراتهن'
    },
    {
      icon: <Crown className="h-5 w-5" />,
      title: 'تتبع الحمل والنفاس',
      description: 'متابعة الحمل والنفاس والرضاعة'
    }
  ];

  const allFeatures = [
    ...baseFeatures,
    ...(persona === 'married' ? marriedFeatures : []),
    ...(persona === 'mother' ? motherFeatures : [])
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 shadow-elegant">
        <DialogHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-elegant">
            <Crown className="h-10 w-10 text-primary-foreground" />
          </div>
          
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            وردية بلس ✨
          </DialogTitle>
          
          <DialogDescription className="text-lg text-muted-foreground">
            اكتشفي الأيام المناسبة لقص الشعر والحجامة والإجراءات التجميلية حسب دورتك ومراحل القمر
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allFeatures.map((feature, index) => (
              <Card key={index} className="glass border-primary/10 hover:border-primary/30 transition-all">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pricing Comparison */}
          <Card className="glass border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-center text-xl">خطط الاشتراك</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Free Plan */}
                <div className="text-center p-4 rounded-2xl border-2 border-border">
                  <h4 className="font-bold text-lg mb-2">المجاني</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-success" />
                      <span>تتبع الدورة</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-success" />
                      <span>المفكرة اليومية</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground line-through">
                      <X className="h-4 w-4 text-destructive" />
                      <span>مخطط الجمال</span>
                    </div>
                  </div>
                </div>

                {/* Premium Plan */}
                <div className="text-center p-4 rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                  <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">الأفضل</Badge>
                  <h4 className="font-bold text-lg mb-2 text-primary">بلس</h4>
                  <div className="text-3xl font-bold mb-1">٤٩ ر.س</div>
                  <div className="text-sm text-muted-foreground mb-3">شهرياً</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>كل المميزات المجانية</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>مخطط الجمال الذكي</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>حسابات القمر والحجامة</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>توصيات شخصية</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-elegant"
            >
              <Crown className="mr-2 h-5 w-5" />
              اشتركي الآن - ٤٩ ر.س شهرياً
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full h-12"
              onClick={onClose}
            >
              ربما لاحقاً
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            💝 جربي لمدة 7 أيام مجاناً • ألغي متى شئت
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
