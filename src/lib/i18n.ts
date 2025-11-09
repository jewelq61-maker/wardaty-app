import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      // Common
      welcome: 'مرحباً',
      loading: 'جاري التحميل...',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      user: 'المستخدم',
      error: 'خطأ',
      
      // Auth
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      needAccount: 'ليس لديك حساب؟ سجل الآن',
      haveAccount: 'لديك حساب؟ سجل دخولك',
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      accountCreated: 'تم إنشاء الحساب',
      checkEmail: 'تحقق من بريدك الإلكتروني',
      welcomeMessage: 'مرحباً بك في تطبيق وردية لصحة المرأة',
      
      // Personas
      single: 'العزباء',
      married: 'المتزوجة',
      mother: 'الأم',
      partner: 'الشريك',
      
      // Navigation
      home: 'الرئيسية',
      calendar: 'التقويم',
      stats: 'الإحصائيات',
      articles: 'المقالات',
      profile: 'الملف الشخصي',
      
      // Home
      greeting: 'مرحباً، {{name}} 💕',
      currentPhase: 'المرحلة الحالية',
      daysToNextPeriod: 'أيام حتى الدورة القادمة',
      logToday: 'تسجيل اليوم',
      beautyPlanner: 'مخطط الجمال',
      fastingQada: 'قضاء الصيام',
      
      // Cycle Phases
      menstrual: 'الحيض',
      follicular: 'الجريبية',
      ovulation: 'الإباضة',
      luteal: 'الصفراء',
      
      // Symptoms
      cramps: 'تقلصات',
      bloating: 'انتفاخ',
      headache: 'صداع',
      fatigue: 'إرهاق',
      tenderness: 'حساسية الثدي',
      
      // Moods
      low: 'منخفض',
      neutral: 'محايد',
      happy: 'سعيد',
      tired: 'متعب',
      anxious: 'قلق',
      
      // Flow
      light: 'خفيف',
      medium: 'متوسط',
      heavy: 'ثقيل',
      
      // Fasting
      totalMissed: 'المجموع الفائت',
      completed: 'مكتمل',
      remaining: 'المتبقي',
      markCompleted: 'وضع علامة مكتمل',
      
      // Beauty
      waxing: 'إزالة الشعر',
      facial: 'تنظيف البشرة',
      peel: 'تقشير',
      laser: 'ليزر',
      hairOiling: 'حمام زيت',
      hydrating: 'ترطيب',
      calming: 'تهدئة',
      
      // Articles
      categories: {
        basics: 'الأساسيات',
        fertility: 'الخصوبة',
        wellness: 'الصحة',
        beauty: 'الجمال',
        rulings: 'الأحكام الشرعية'
      }
    }
  },
  en: {
    translation: {
      // Common
      welcome: 'Welcome',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      user: 'User',
      error: 'Error',
      
      // Auth
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      needAccount: 'Need an account? Sign up',
      haveAccount: 'Have an account? Log in',
      loginSuccess: 'Logged in successfully',
      accountCreated: 'Account created',
      checkEmail: 'Check your email',
      welcomeMessage: 'Welcome to Wardiya women\'s wellness app',
      
      // Personas
      single: 'Single',
      married: 'Married',
      mother: 'Mother',
      partner: 'Partner',
      
      // Navigation
      home: 'Home',
      calendar: 'Calendar',
      stats: 'Stats',
      articles: 'Articles',
      profile: 'Profile',
      
      // Home
      greeting: 'Hello, {{name}} 💕',
      currentPhase: 'Current Phase',
      daysToNextPeriod: 'Days to Next Period',
      logToday: 'Log Today',
      beautyPlanner: 'Beauty Planner',
      fastingQada: 'Fasting Qada',
      
      // Cycle Phases
      menstrual: 'Menstrual',
      follicular: 'Follicular',
      ovulation: 'Ovulation',
      luteal: 'Luteal',
      
      // Symptoms
      cramps: 'Cramps',
      bloating: 'Bloating',
      headache: 'Headache',
      fatigue: 'Fatigue',
      tenderness: 'Breast Tenderness',
      
      // Moods
      low: 'Low',
      neutral: 'Neutral',
      happy: 'Happy',
      tired: 'Tired',
      anxious: 'Anxious',
      
      // Flow
      light: 'Light',
      medium: 'Medium',
      heavy: 'Heavy',
      
      // Fasting
      totalMissed: 'Total Missed',
      completed: 'Completed',
      remaining: 'Remaining',
      markCompleted: 'Mark Completed',
      
      // Beauty
      waxing: 'Waxing',
      facial: 'Facial',
      peel: 'Peel',
      laser: 'Laser',
      hairOiling: 'Hair Oiling',
      hydrating: 'Hydrating',
      calming: 'Calming',
      
      // Articles
      categories: {
        basics: 'Basics',
        fertility: 'Fertility',
        wellness: 'Wellness',
        beauty: 'Beauty',
        rulings: 'Islamic Rulings'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;