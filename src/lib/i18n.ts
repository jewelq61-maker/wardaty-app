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
      
      // Stats
      statsPage: {
        noData: 'لا توجد بيانات كافية لعرض الإحصائيات',
        avgCycleLength: 'متوسط طول الدورة',
        avgPeriodDuration: 'متوسط مدة الدورة',
        totalCycles: 'إجمالي الدورات',
        trackedDays: 'الأيام المسجلة',
        days: 'يوم',
        cycleHistory: 'تاريخ الدورة الشهرية',
        cycleLength: 'طول الدورة',
        periodDuration: 'مدة الدورة',
        symptomFrequency: 'تكرار الأعراض',
        moodDistribution: 'توزيع المزاج',
      },
      
      // Home
      greeting: 'مرحباً، {{name}} 💕',
      welcomeMessage: 'نحن هنا لمساعدتك في كل خطوة',
      currentPhase: 'المرحلة الحالية',
      daysToNextPeriod: 'أيام حتى الدورة القادمة',
      logToday: 'تسجيل اليوم',
      beautyPlanner: 'مخطط الجمال',
      
      // Cycle
      cycle: {
        predictions: 'توقعات الدورة',
        nextPeriod: 'الدورة القادمة',
        fertileWindow: 'نافذة الخصوبة',
        ovulationDate: 'موعد التبويض',
        inDays: 'بعد {{days}} يوم',
        now: 'الآن',
        today: 'اليوم',
        noCycleData: 'لا توجد بيانات للدورة الشهرية بعد',
        phases: 'مراحل الدورة',
      },
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
      
      // Fasting Qada
      fastingQada: {
        title: 'صيام القضاء',
        subtitle: 'تتبعي أيام القضاء من رمضان',
        missedDays: 'أيام الإفطار في رمضان',
        completed: 'تم قضاؤها',
        remaining: 'متبقية',
        markCompleted: 'تحديد يوم القضاء',
        selectDate: 'اختاري تاريخ يوم القضاء',
        markAsCompleted: 'تأكيد القضاء',
        completedDays: 'الأيام المقضية',
        calculating: 'جاري الحساب...',
        ramadanDays: 'أيام رمضان',
        periodDays: 'أيام الدورة',
        error: 'خطأ',
        success: 'تم بنجاح',
        dayMarked: 'تم تسجيل يوم القضاء',
        dayRemoved: 'تم حذف يوم القضاء',
        noCompletedDays: 'لم تقومي بقضاء أي أيام بعد'
      },
      
      // Beauty Planner
      beauty: {
        nav: 'الجمال',
        title: 'مخطط الجمال',
        subtitle: 'العناية بجمالك حسب مراحل الدورة',
        upcomingTreatments: 'العناية القادمة',
        noUpcoming: 'لا توجد عناية مجدولة',
        currentPhase: 'المرحلة الحالية من دورتك',
        recommended: 'العناية الموصى بها',
        addAction: 'إضافة عناية جديدة',
        scheduleAction: 'جدولة عناية جمالية',
        actionTitle: 'نوع العناية',
        actionTitlePlaceholder: 'مثل: إزالة الشعر بالشمع',
        notes: 'ملاحظات',
        notesPlaceholder: 'أي تفاصيل إضافية...',
        scheduleDate: 'تحديد الموعد',
        pickDate: 'اختر التاريخ',
        save: 'حفظ',
        scheduledActions: 'العناية المجدولة',
        noActions: 'لم تقومي بجدولة أي عناية بعد',
        fillTitle: 'يرجى إدخال نوع العناية',
        actionAdded: 'تم إضافة العناية بنجاح',
        actionDeleted: 'تم حذف العناية',
        phase: {
          menstrual: 'مرحلة الحيض',
          follicular: 'المرحلة الجريبية',
          ovulation: 'مرحلة التبويض',
          luteal: 'المرحلة الصفراء'
        },
        treatment: {
          gentle_facial: 'عناية لطيفة بالبشرة',
          hair_oiling: 'حمام زيت للشعر',
          hydrating_masks: 'ماسكات مرطبة',
          light_massage: 'تدليك خفيف',
          waxing: 'إزالة الشعر بالشمع',
          threading: 'نتف الحواجب',
          exfoliation: 'تقشير البشرة',
          face_masks: 'ماسكات الوجه',
          hair_treatments: 'علاجات الشعر',
          laser_hair_removal: 'إزالة الشعر بالليزر',
          deep_facial: 'عناية عميقة بالبشرة',
          chemical_peels: 'التقشير الكيميائي',
          salon_treatments: 'علاجات الصالون',
          moisturizing_treatments: 'علاجات الترطيب',
          hair_masks: 'ماسكات الشعر',
          gentle_skincare: 'عناية لطيفة بالبشرة',
          aromatherapy: 'العلاج بالروائح'
        }
      },
      
      // Articles
      categories: {
        all: 'الكل',
        basics: 'الأساسيات',
        fertility: 'الخصوبة',
        wellness: 'الصحة',
        beauty: 'الجمال',
        rulings: 'الأحكام الشرعية'
      },
      articlesPage: {
        search: 'ابحث في المقالات...',
        noResults: 'لم يتم العثور على مقالات',
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
      
      // Stats
      statsPage: {
        noData: 'Not enough data to display statistics',
        avgCycleLength: 'Avg Cycle Length',
        avgPeriodDuration: 'Avg Period Duration',
        totalCycles: 'Total Cycles',
        trackedDays: 'Tracked Days',
        days: 'days',
        cycleHistory: 'Cycle History',
        cycleLength: 'Cycle Length',
        periodDuration: 'Period Duration',
        symptomFrequency: 'Symptom Frequency',
        moodDistribution: 'Mood Distribution',
      },
      
      // Home
      greeting: 'Hello, {{name}} 💕',
      welcomeMessage: 'We are here to help you every step of the way',
      currentPhase: 'Current Phase',
      daysToNextPeriod: 'Days to Next Period',
      logToday: 'Log Today',
      beautyPlanner: 'Beauty Planner',
      
      // Cycle
      cycle: {
        predictions: 'Cycle Predictions',
        nextPeriod: 'Next Period',
        fertileWindow: 'Fertile Window',
        ovulationDate: 'Ovulation Date',
        inDays: 'in {{days}} days',
        now: 'Now',
        today: 'Today',
        noCycleData: 'No cycle data available yet',
        phases: 'Cycle Phases',
      },
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
      
      // Fasting Qada
      fastingQada: {
        title: 'Fasting Qada',
        subtitle: 'Track your Ramadan make-up days',
        missedDays: 'Missed Ramadan Days',
        completed: 'Completed',
        remaining: 'Remaining',
        markCompleted: 'Mark Day Completed',
        selectDate: 'Select the date you completed this fast',
        markAsCompleted: 'Mark as Completed',
        completedDays: 'Completed Days',
        calculating: 'Calculating...',
        ramadanDays: 'Ramadan Days',
        periodDays: 'Period Days',
        error: 'Error',
        success: 'Success',
        dayMarked: 'Fasting day marked as completed',
        dayRemoved: 'Completed day removed',
        noCompletedDays: 'No completed days yet'
      },
      
      // Beauty Planner
      beauty: {
        nav: 'Beauty',
        title: 'Beauty Planner',
        subtitle: 'Personalized care based on your cycle',
        upcomingTreatments: 'Upcoming Treatments',
        noUpcoming: 'No scheduled treatments',
        currentPhase: 'Your current cycle phase',
        recommended: 'Recommended treatments',
        addAction: 'Add Beauty Action',
        scheduleAction: 'Schedule Beauty Action',
        actionTitle: 'Treatment Type',
        actionTitlePlaceholder: 'e.g., Waxing',
        notes: 'Notes',
        notesPlaceholder: 'Any additional details...',
        scheduleDate: 'Schedule Date',
        pickDate: 'Pick a date',
        save: 'Save',
        scheduledActions: 'Scheduled Actions',
        noActions: 'No scheduled beauty actions yet',
        fillTitle: 'Please enter a treatment type',
        actionAdded: 'Beauty action added successfully',
        actionDeleted: 'Beauty action deleted',
        phase: {
          menstrual: 'Menstrual Phase',
          follicular: 'Follicular Phase',
          ovulation: 'Ovulation Phase',
          luteal: 'Luteal Phase'
        },
        treatment: {
          gentle_facial: 'Gentle facial',
          hair_oiling: 'Hair oiling',
          hydrating_masks: 'Hydrating masks',
          light_massage: 'Light massage',
          waxing: 'Waxing',
          threading: 'Threading',
          exfoliation: 'Exfoliation',
          face_masks: 'Face masks',
          hair_treatments: 'Hair treatments',
          laser_hair_removal: 'Laser hair removal',
          deep_facial: 'Deep facial',
          chemical_peels: 'Chemical peels',
          salon_treatments: 'Salon treatments',
          moisturizing_treatments: 'Moisturizing treatments',
          hair_masks: 'Hair masks',
          gentle_skincare: 'Gentle skincare',
          aromatherapy: 'Aromatherapy'
        }
      },
      
      // Articles
      categories: {
        all: 'All',
        basics: 'Basics',
        fertility: 'Fertility',
        wellness: 'Wellness',
        beauty: 'Beauty',
        rulings: 'Islamic Rulings'
      },
      articlesPage: {
        search: 'Search articles...',
        noResults: 'No articles found',
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
