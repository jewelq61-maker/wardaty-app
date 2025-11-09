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
      success: 'نجح',
      
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
      
      // Onboarding
      onboarding: {
        skip: 'تخطى',
        welcome: 'مرحباً بك في وردية',
        welcomeSubtitle: 'رفيقتك في رحلة الأنوثة والعافية\nنحن هنا لنهتم بك في كل مرحلة',
        startJourney: 'ابدأي رحلتك',
        choosePersona: 'اختاري شخصيتك',
        personaSubtitle: 'اختاري الشخصية التي تناسبك لتجربة مخصصة',
        chooseLanguage: 'اختاري اللغة',
        languageSubtitle: 'Choose your preferred language',
        setupCycle: 'إعداد الدورة الشهرية',
        setupSubtitle: 'ساعدينا لنتمكن من تقديم توقعات دقيقة',
        lastPeriodDate: 'تاريخ آخر دورة شهرية',
        averageCycleLength: 'متوسط طول الدورة (أيام)',
        periodDuration: 'مدة الدورة الشهرية (أيام)',
        complete: 'إكمال',
        next: 'التالي',
        back: 'رجوع',
      },
      
      // Personas
      personas: {
        single: 'العزباء',
        married: 'المتزوجة',
        mother: 'الأم',
        partner: 'الشريك',
        singleDesc: 'تتبع دورتك الشهرية والعناية بصحتك',
        marriedDesc: 'إدارة الخصوبة وتخطيط الأسرة',
        motherDesc: 'متابعة صحة ابنتك ودورتها',
        partnerDesc: 'دعم شريكة حياتك وفهم احتياجاتها',
      },
      
      // Navigation
      home: 'الرئيسية',
      calendar: 'التقويم',
      stats: 'الإحصائيات',
      articles: 'المقالات',
      profile: 'الملف الشخصي',
      
      // Home
      greeting: 'مرحباً، {{name}} 💕',
      welcomeMessage: 'نحن هنا لمساعدتك في كل خطوة',
      currentPhase: 'المرحلة الحالية',
      daysToNextPeriod: 'أيام حتى الدورة القادمة',
      logToday: 'تسجيل اليوم',
      beautyPlanner: 'مخطط الجمال',
      fastingQada: 'قضاء الصيام',
      
      // Cycle
      fertile: 'خصبة',
      mood: 'المزاج',
      symptoms: 'الأعراض',
      notes: 'ملاحظات',
      flow: 'التدفق',
      
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
      selectDate: 'اختر تاريخ الإكمال',
      completedDays: 'الأيام المكتملة',
      completedOn: 'مكتمل في',
      
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
      success: 'Success',
      
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
      
      // Onboarding
      onboarding: {
        skip: 'Skip',
        welcome: 'Welcome to Wardiya',
        welcomeSubtitle: 'Your companion in femininity and wellness\nWe are here to care for you at every stage',
        startJourney: 'Start Your Journey',
        choosePersona: 'Choose Your Persona',
        personaSubtitle: 'Select the persona that suits you for a personalized experience',
        chooseLanguage: 'Choose Language',
        languageSubtitle: 'اختاري اللغة المفضلة',
        setupCycle: 'Setup Your Cycle',
        setupSubtitle: 'Help us provide accurate predictions',
        lastPeriodDate: 'Last Period Date',
        averageCycleLength: 'Average Cycle Length (days)',
        periodDuration: 'Period Duration (days)',
        complete: 'Complete',
        next: 'Next',
        back: 'Back',
      },
      
      // Personas
      personas: {
        single: 'Single',
        married: 'Married',
        mother: 'Mother',
        partner: 'Partner',
        singleDesc: 'Track your cycle and care for your health',
        marriedDesc: 'Manage fertility and family planning',
        motherDesc: 'Monitor your daughter\'s health and cycle',
        partnerDesc: 'Support your partner and understand her needs',
      },
      
      // Navigation
      home: 'Home',
      calendar: 'Calendar',
      stats: 'Stats',
      articles: 'Articles',
      profile: 'Profile',
      
      // Home
      greeting: 'Hello, {{name}} 💕',
      welcomeMessage: 'We are here to help you every step of the way',
      currentPhase: 'Current Phase',
      daysToNextPeriod: 'Days to Next Period',
      logToday: 'Log Today',
      beautyPlanner: 'Beauty Planner',
      fastingQada: 'Fasting Qada',
      
      // Cycle
      fertile: 'Fertile',
      mood: 'Mood',
      symptoms: 'Symptoms',
      notes: 'Notes',
      flow: 'Flow',
      
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
      selectDate: 'Select completion date',
      completedDays: 'Completed Days',
      completedOn: 'Completed on',
      
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
