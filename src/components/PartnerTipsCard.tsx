import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Lightbulb, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PartnerTipsCardProps {
  phase: string;
}

export default function PartnerTipsCard({ phase }: PartnerTipsCardProps) {
  const { t } = useTranslation();

  const getTipsForPhase = (phase: string) => {
    switch (phase) {
      case 'menstruation':
        return {
          emoji: '🌙',
          color: 'text-menstruation',
          bgColor: 'bg-menstruation/10',
          support: [
            'كن صبوراً ومتفهماً - قد تشعر بالتعب والإرهاق',
            'قدم لها المساعدة في الأعمال المنزلية',
            'احضر لها المشروبات الدافئة والوسادة الحرارية',
            'كن متواجداً واستمع لها دون أحكام'
          ],
          avoid: [
            'تجنب انتقادها أو جدالها حول مشاعرها',
            'لا تقلل من شأن ألمها أو تعبها',
            'تجنب التخطيط لأنشطة مرهقة',
            'لا تتوقع نفس مستوى الطاقة المعتاد'
          ],
          gifts: ['شوكولاتة داكنة', 'باقة ورد', 'مساج لطيف', 'وجبتها المفضلة']
        };
      
      case 'follicular':
        return {
          emoji: '🌸',
          color: 'text-follicular',
          bgColor: 'bg-follicular/10',
          support: [
            'استغل طاقتها العالية وخططوا لأنشطة ممتعة',
            'شجعها على تجربة أشياء جديدة',
            'عبر عن تقديرك لجمالها وثقتها',
            'كن داعماً لمشاريعها وأفكارها الجديدة'
          ],
          avoid: [
            'لا تحد من حماسها أو طاقتها',
            'تجنب الروتين الممل',
            'لا تكن سلبياً أو متشائماً',
            'تجنب إلغاء الخطط المهمة'
          ],
          gifts: ['تذاكر لمكان جديد', 'هدية مفاجئة', 'موعد رومانسي', 'كتاب أو دورة تحبها']
        };
      
      case 'ovulation':
        return {
          emoji: '💫',
          color: 'text-ovulation',
          bgColor: 'bg-ovulation/10',
          support: [
            'هذا وقت رائع للتواصل العميق معها',
            'استمع لها بانتباه - ستكون واضحة في التعبير',
            'خصص وقتاً جيداً معاً',
            'اهتم بمظهرك وكن رومانسياً'
          ],
          avoid: [
            'لا تتجاهلها أو تنشغل عنها كثيراً',
            'تجنب الجدالات غير الضرورية',
            'لا تكن غير مبالٍ بمشاعرها',
            'تجنب إهمال العاطفة والرومانسية'
          ],
          gifts: ['عشاء رومانسي', 'عطر جديد', 'مجوهرات', 'رسالة حب']
        };
      
      case 'luteal':
        return {
          emoji: '🍂',
          color: 'text-luteal',
          bgColor: 'bg-luteal/10',
          support: [
            'كن هادئاً وصبوراً - قد تكون حساسة',
            'قدم لها الدعم العاطفي والطمأنينة',
            'ساعدها في تخفيف التوتر',
            'احترم حاجتها للمساحة الشخصية'
          ],
          avoid: [
            'تجنب الانتقاد أو الملاحظات السلبية',
            'لا تستفزها أو تثير المشاكل',
            'تجنب الضغط عليها لأنشطة اجتماعية',
            'لا تأخذ تقلباتها المزاجية بشكل شخصي'
          ],
          gifts: ['وجبة صحية', 'وقت هادئ معاً', 'فيلم منزلي', 'شاي عشبي']
        };
      
      default:
        return null;
    }
  };

  const tips = getTipsForPhase(phase);
  
  if (!tips) return null;

  return (
    <Card className="bg-card border border-border animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl ${tips.bgColor} flex items-center justify-center text-2xl`}>
            {tips.emoji}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t(`phases.${phase}`)}</p>
            <p className={tips.color}>نصائح للدعم والمساندة</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* How to Support */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">كيف تدعمها؟</h3>
          </div>
          <ul className="space-y-2">
            {tips.support.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What to Avoid */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <h3 className="font-semibold text-foreground">ماذا تتجنب؟</h3>
          </div>
          <ul className="space-y-2">
            {tips.avoid.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-destructive mt-0.5 flex-shrink-0">✗</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Gift Ideas */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">أفكار هدايا</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tips.gifts.map((gift, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-muted text-muted-foreground text-xs rounded-lg"
              >
                {gift}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
