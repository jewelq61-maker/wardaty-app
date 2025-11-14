import { differenceInDays } from 'date-fns';

export type MoonPhase = 'new' | 'first-quarter' | 'full' | 'last-quarter';
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
export type BeautyCategory = 
  | 'haircut'
  | 'waxing'
  | 'laser'
  | 'facial'
  | 'microneedling'
  | 'botox'
  | 'moroccan-bath'
  | 'scrub'
  | 'hair-mask'
  | 'hair-oiling'
  | 'massage'
  | 'hijama';

export interface BeautyGoal {
  type: 'faster-growth' | 'thicker' | 'reduce-volume' | 'maintain';
}

export interface BeautyRecommendation {
  id: string;
  action_type: 'system';
  title: string;
  beauty_category: BeautyCategory;
  scheduled_at: string;
  score: number;
  reason: string;
  warnings?: string[];
  phase: CyclePhase;
  goal?: string;
}

// حساب مرحلة القمر
export function getMoonPhase(date: Date): MoonPhase {
  const knownNewMoon = new Date('2000-01-06'); // تاريخ معروف لقمر جديد
  const daysSinceKnown = differenceInDays(date, knownNewMoon);
  const synodicMonth = 29.53058867; // دورة القمر بالأيام
  const phase = ((daysSinceKnown % synodicMonth) / synodicMonth) * 100;
  
  if (phase < 6.25 || phase > 93.75) return 'new';
  if (phase >= 6.25 && phase < 31.25) return 'first-quarter';
  if (phase >= 31.25 && phase < 56.25) return 'full';
  return 'last-quarter';
}

// حساب اليوم الهجري (تقريبي)
export function getHijriDay(date: Date): number {
  const knownHijriDay1 = new Date('2024-01-12'); // 1 محرم 1445
  const daysSince = differenceInDays(date, knownHijriDay1);
  const lunarMonth = 29.53;
  return Math.round((daysSince % lunarMonth) + 1);
}

// التحقق من أيام الحجامة المستحبة
export function isGoodHijamaDay(date: Date): boolean {
  const hijriDay = getHijriDay(date);
  return [17, 19, 21].includes(hijriDay);
}

// حساب درجة الدورة الشهرية
function getCyclePhaseScore(category: BeautyCategory, phase: CyclePhase): number {
  const scores: Record<BeautyCategory, Record<CyclePhase, number>> = {
    'haircut': {
      'menstrual': 20,
      'follicular': 90,
      'ovulation': 95,
      'luteal': 50
    },
    'waxing': {
      'menstrual': 10,
      'follicular': 95,
      'ovulation': 100,
      'luteal': 60
    },
    'laser': {
      'menstrual': 5,
      'follicular': 95,
      'ovulation': 100,
      'luteal': 70
    },
    'facial': {
      'menstrual': 30,
      'follicular': 85,
      'ovulation': 100,
      'luteal': 40
    },
    'microneedling': {
      'menstrual': 0,
      'follicular': 95,
      'ovulation': 100,
      'luteal': 50
    },
    'botox': {
      'menstrual': 40,
      'follicular': 90,
      'ovulation': 100,
      'luteal': 70
    },
    'moroccan-bath': {
      'menstrual': 20,
      'follicular': 90,
      'ovulation': 95,
      'luteal': 60
    },
    'scrub': {
      'menstrual': 30,
      'follicular': 95,
      'ovulation': 100,
      'luteal': 70
    },
    'hair-mask': {
      'menstrual': 60,
      'follicular': 85,
      'ovulation': 90,
      'luteal': 95
    },
    'hair-oiling': {
      'menstrual': 70,
      'follicular': 85,
      'ovulation': 90,
      'luteal': 95
    },
    'massage': {
      'menstrual': 50,
      'follicular': 80,
      'ovulation': 85,
      'luteal': 90
    },
    'hijama': {
      'menstrual': 0,
      'follicular': 80,
      'ovulation': 0,
      'luteal': 90
    }
  };
  
  return scores[category]?.[phase] || 50;
}

// حساب درجة مرحلة القمر
function getMoonPhaseScore(category: BeautyCategory, moonPhase: MoonPhase): number {
  const scores: Record<BeautyCategory, Record<MoonPhase, number>> = {
    'haircut': {
      'new': 50,
      'first-quarter': 90,
      'full': 100,
      'last-quarter': 30
    },
    'waxing': {
      'new': 40,
      'first-quarter': 80,
      'full': 90,
      'last-quarter': 100
    },
    'laser': {
      'new': 40,
      'first-quarter': 80,
      'full': 90,
      'last-quarter': 100
    },
    'facial': {
      'new': 100,
      'first-quarter': 80,
      'full': 60,
      'last-quarter': 40
    },
    'microneedling': {
      'new': 100,
      'first-quarter': 70,
      'full': 50,
      'last-quarter': 30
    },
    'botox': {
      'new': 90,
      'first-quarter': 80,
      'full': 70,
      'last-quarter': 50
    },
    'moroccan-bath': {
      'new': 80,
      'first-quarter': 90,
      'full': 100,
      'last-quarter': 70
    },
    'scrub': {
      'new': 100,
      'first-quarter': 90,
      'full': 70,
      'last-quarter': 50
    },
    'hair-mask': {
      'new': 70,
      'first-quarter': 80,
      'full': 90,
      'last-quarter': 60
    },
    'hair-oiling': {
      'new': 70,
      'first-quarter': 85,
      'full': 95,
      'last-quarter': 60
    },
    'massage': {
      'new': 80,
      'first-quarter': 85,
      'full': 90,
      'last-quarter': 75
    },
    'hijama': {
      'new': 60,
      'first-quarter': 80,
      'full': 90,
      'last-quarter': 70
    }
  };
  
  return scores[category]?.[moonPhase] || 50;
}

// حساب درجة الهدف
function getGoalScore(category: BeautyCategory, goal?: string): number {
  if (category !== 'haircut' || !goal) return 0;
  
  const goalScores: Record<string, number> = {
    'faster-growth': 15,
    'thicker': 10,
    'reduce-volume': 8,
    'maintain': 5
  };
  
  return goalScores[goal] || 0;
}

// التحقق من الموانع
function getContraindications(
  category: BeautyCategory,
  phase: CyclePhase,
  date: Date
): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  let penalty = 0;
  
  // الحجامة
  if (category === 'hijama') {
    if (phase === 'menstrual') {
      warnings.push('تجنب الحجامة أثناء الدورة الشهرية');
      penalty += 100;
    }
    if (phase === 'ovulation') {
      warnings.push('تجنب الحجامة أثناء التبويض');
      penalty += 100;
    }
    if (!isGoodHijamaDay(date)) {
      warnings.push('الأيام المستحبة للحجامة هي 17 و 19 و 21 من الشهر الهجري');
      penalty += 30;
    }
  }
  
  // الإجراءات الغازية أثناء الدورة
  if (['microneedling', 'laser', 'waxing'].includes(category) && phase === 'menstrual') {
    warnings.push('تجنب هذا الإجراء أثناء الدورة الشهرية');
    penalty += 50;
  }
  
  // التقشير العميق
  if (category === 'facial' && phase === 'luteal') {
    warnings.push('قد تكون البشرة أكثر حساسية في هذه المرحلة');
    penalty += 20;
  }
  
  return { score: penalty, warnings };
}

// حساب التوصية النهائية
export function calculateBeautyRecommendation(
  category: BeautyCategory,
  cyclePhase: CyclePhase,
  date: Date,
  goal?: string
): { score: number; reason: string; warnings: string[] } {
  const moonPhase = getMoonPhase(date);
  
  const cycleScore = getCyclePhaseScore(category, cyclePhase);
  const moonScore = getMoonPhaseScore(category, moonPhase);
  const goalBonus = getGoalScore(category, goal);
  const { score: contraScore, warnings } = getContraindications(category, cyclePhase, date);
  
  // الدرجة النهائية = (درجة الدورة + درجة القمر) / 2 + مكافأة الهدف - الموانع
  let finalScore = Math.round((cycleScore + moonScore) / 2 + goalBonus - contraScore);
  finalScore = Math.max(0, Math.min(100, finalScore));
  
  // صياغة السبب
  const reasons: string[] = [];
  const phaseNames: Record<CyclePhase, string> = {
    'menstrual': 'مرحلة الحيض',
    'follicular': 'المرحلة الجريبية',
    'ovulation': 'مرحلة التبويض',
    'luteal': 'المرحلة الأصفرية'
  };
  
  const moonNames: Record<MoonPhase, string> = {
    'new': 'القمر الجديد',
    'first-quarter': 'الربع الأول',
    'full': 'البدر',
    'last-quarter': 'الربع الأخير'
  };
  
  reasons.push(`${phaseNames[cyclePhase]} (${cycleScore}%)`);
  reasons.push(`${moonNames[moonPhase]} (${moonScore}%)`);
  
  if (goalBonus > 0) {
    reasons.push(`هدفك: ${goal}`);
  }
  
  if (category === 'hijama' && isGoodHijamaDay(date)) {
    reasons.push(`يوم هجري مستحب (${getHijriDay(date)})`);
  }
  
  return {
    score: finalScore,
    reason: reasons.join(' • '),
    warnings
  };
}

// الحصول على الأيقونة حسب الفئة
export function getCategoryIcon(category: BeautyCategory): string {
  const icons: Record<BeautyCategory, string> = {
    'haircut': '✂️',
    'waxing': '💆‍♀️',
    'laser': '✨',
    'facial': '🧖‍♀️',
    'microneedling': '💉',
    'botox': '💅',
    'moroccan-bath': '🛁',
    'scrub': '🧴',
    'hair-mask': '💇‍♀️',
    'hair-oiling': '🌿',
    'massage': '💆',
    'hijama': '🩺'
  };
  return icons[category] || '✨';
}

// الحصول على اسم الفئة بالعربية
export function getCategoryName(category: BeautyCategory): string {
  const names: Record<BeautyCategory, string> = {
    'haircut': 'قص الشعر',
    'waxing': 'إزالة الشعر بالشمع',
    'laser': 'الليزر',
    'facial': 'العناية بالوجه',
    'microneedling': 'الإبر الدقيقة',
    'botox': 'البوتوكس والفيلر',
    'moroccan-bath': 'الحمام المغربي',
    'scrub': 'التقشير',
    'hair-mask': 'ماسك الشعر',
    'hair-oiling': 'حمام زيت',
    'massage': 'المساج',
    'hijama': 'الحجامة'
  };
  return names[category] || category;
}
