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
      close: 'إغلاق',
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
      homeNav: 'الرئيسية',
      calendar: 'التقويم',
      stats: 'التحليلات',
      articles: 'المقالات',
      profile: 'الملف الشخصي',
      
      profilePage: {
        statistics: 'الإحصائيات',
        preferences: 'التفضيلات',
        dataPrivacy: 'البيانات والخصوصية',
        moodsLogged: 'تسجيلات المزاج',
        beautyScheduled: 'مواعيد الجمال',
        darkMode: 'الوضع الليلي',
        manageSubscription: 'إدارة الاشتراك',
        exportData: 'تصدير البيانات',
        deleteAccount: 'حذف الحساب',
        confirmDelete: 'تأكيد حذف الحساب',
        confirmDeleteDesc: 'هل أنت متأكدة من حذف حسابك؟ سيتم حذف جميع بياناتك بشكل دائم ولا يمكن استرجاعها.',
        updated: 'تم تحديث الملف الشخصي',
        updateError: 'حدث خطأ في التحديث',
        dataExported: 'تم تصدير البيانات بنجاح',
        exportError: 'حدث خطأ في تصدير البيانات',
        accountDeleted: 'تم حذف الحساب بنجاح',
        deleteError: 'حدث خطأ في حذف الحساب',
        enterName: 'أدخل اسمك',
        partnerSharing: 'مشاركة مع الشريك',
        premiumFeature: 'ميزة مميزة',
        partnerStats: 'إحصائيات الشريك',
        shareCode: 'كود المشاركة',
        connected: 'متصل',
        pending: 'قيد الانتظار',
        generateShareLink: 'إنشاء رابط مشاركة',
        connectWithPartner: 'الاتصال بالشريك',
        revokeLink: 'إلغاء الرابط',
        sharingDescription: 'شاركي إحصائياتك مع شريكك لمتابعة أفضل',
        enterPartnerCode: 'أدخلي كود الشريك للاتصال',
        connect: 'اتصال',
        shareLinkCreated: 'تم إنشاء رابط المشاركة',
        shareLinkError: 'حدث خطأ في إنشاء الرابط',
        invalidCode: 'الكود غير صحيح',
        connectedSuccess: 'تم الاتصال بنجاح',
        connectError: 'حدث خطأ في الاتصال',
        cycleSync: {
          title: 'تزامن الدورة',
          status: 'حالة التزامن',
          synced: 'متزامنة تماماً',
          close: 'قريبة من التزامن',
          different: 'مراحل مختلفة',
          you: 'أنتِ',
          partner: 'شريكتك',
          insights: 'رؤى التزامن'
        },
        insights: {
          perfectSync: 'أنتما متزامنتان تماماً في نفس مرحلة الدورة! هذا شائع بين النساء اللواتي يقضين وقتاً طويلاً معاً.',
          closeSync: 'أنتما قريبتان من التزامن. قد تلاحظان تأثيرات مشابهة على المزاج والطاقة.',
          differentPhases: 'أنتما في مراحل مختلفة من الدورة. يمكن أن يكون هذا فرصة لدعم بعضكما البعض.',
          menstrualTogether: 'كلاكما في مرحلة الحيض. ركزا على الراحة والعناية الذاتية معاً.',
          ovulationTogether: 'كلاكما في مرحلة الإباضة. طاقتكما عالية - وقت رائع للأنشطة المشتركة!',
          follicularTogether: 'كلاكما في المرحلة الجريبية. استفيدا من هذه الطاقة الإيجابية في خطط جديدة.',
          lutealTogether: 'كلاكما في المرحلة الصفراء. خذا الأمور بهدوء وكونا صبورتين مع بعضكما.',
          considerTiming: 'قد ترغبان في التخطيط للأنشطة الاجتماعية عندما تكون طاقتكما متوافقة.',
          oppositePhases: 'أنتما في مراحل متعاكسة. واحدة منكما قد تشعر بطاقة عالية بينما الأخرى بحاجة للراحة.'
        },
        codeCopied: 'تم نسخ الكود',
        shareLinkRevoked: 'تم إلغاء رابط المشاركة',
        revokeError: 'حدث خطأ في الإلغاء',
        noPartnerConnected: 'لا يوجد شريك متصل',
        loadPartnerError: 'حدث خطأ في تحميل بيانات الشريك',
        backToProfile: 'العودة للملف الشخصي',
        viewPartnerProfile: 'عرض ملف الشريك',
        partnerSupport: 'نصائح لدعم شريكتك',
        supportTip1: 'كوني متفهمة لتقلبات المزاج حسب مرحلة الدورة',
        supportTip2: 'قدمي الدعم العاطفي والراحة خلال الأيام الصعبة',
        supportTip3: 'ساعديها في تذكر مواعيد الجمال والعناية',
        supportTip4: 'احترمي رغبتها في الراحة أو النشاط حسب مرحلة الدورة',
      },

      partnerView: {
        title: 'معلومات الشريكة',
        cyclePhase: 'مرحلة الدورة',
        currentDay: 'اليوم الحالي',
        cycleLength: 'طول الدورة',
        lastPeriod: 'آخر دورة',
        nextPeriod: 'الدورة القادمة',
        recentMood: 'المزاج الأخير',
        symptoms: 'الأعراض',
        noPartner: 'لم يتم الربط بشريكة بعد',
        noData: 'لا توجد بيانات متاحة',
        error: 'حدث خطأ أثناء تحميل البيانات',
        support: 'نصائح الدعم',
        supportTip: 'خلال هذه المرحلة، قد تحتاج شريكتك إلى مزيد من الدعم والراحة',
        viewStats: 'عرض الإحصائيات المشتركة'
      },

      sharedStats: {
        title: 'الإحصائيات المشتركة',
        partner: 'الشريك',
        noPartner: 'لم يتم الربط بشريك بعد',
        partnerInfo: 'معلومات الشريك',
        analyzingDataFor: 'تحليل البيانات لـ',
        daysTracked: 'يوم متتبع',
        sharedEvents: 'حدث مشترك',
        moodTrend: 'اتجاه المزاج',
        moodScore: 'مستوى المزاج',
        moodTrendDesc: 'تتبع تغييرات المزاج خلال الـ 30 يوم الماضية',
        energyByPhase: 'الطاقة حسب المرحلة',
        avgEnergy: 'متوسط الطاقة',
        energyByPhaseDesc: 'معدل الطاقة والمزاج في كل مرحلة من مراحل الدورة',
        eventsDistribution: 'توزيع الأحداث المشتركة',
        eventsDistributionDesc: 'أنواع الأحداث التي تم تسجيلها في التقويم المشترك',
        commonSymptoms: 'الأعراض الأكثر شيوعاً',
        commonSymptomsDesc: 'الأعراض التي تتكرر بشكل متكرر خلال الدورات',
        recommendations: 'توصيات للشريك',
        bestTimes: 'أفضل الأوقات',
        bestTimesDesc: 'هذه هي أفضل فترة للقيام بالأنشطة والمشاريع المشتركة',
        supportNeeded: 'احتياج الدعم',
        supportNeededDesc: 'خلال هذه الفترة، قد تحتاج شريكتك إلى مزيد من الدعم والتفهم'
      },

      sharedCalendar: {
        title: 'التقويم المشترك',
        description: 'تقويم مشترك مع {{name}} يعرض أيام الدورة والأحداث المهمة',
        addEvent: 'إضافة حدث',
        addNewEvent: 'إضافة حدث جديد',
        addEventDescription: 'أضف حدث أو تذكير مشترك للتقويم',
        eventTitle: 'عنوان الحدث',
        eventTitlePlaceholder: 'مثال: موعد طبيب',
        eventDescription: 'وصف الحدث',
        eventDescriptionPlaceholder: 'تفاصيل إضافية (اختياري)',
        eventDate: 'تاريخ الحدث',
        eventType: 'نوع الحدث',
        eventTypes: {
          reminder: 'تذكير',
          appointment: 'موعد',
          note: 'ملاحظة',
        },
        reminder: 'تذكير',
        appointment: 'موعد',
        note: 'ملاحظة',
        add: 'إضافة',
        events: 'أحداث',
        noEvents: 'لا توجد أحداث في هذا اليوم',
        sharedEvent: 'حدث مشترك',
        eventAdded: 'تمت إضافة الحدث بنجاح',
        addEventError: 'حدث خطأ في إضافة الحدث',
        eventDeleted: 'تم حذف الحدث',
        deleteEventError: 'حدث خطأ في حذف الحدث',
      },
      
      // Stats
      statsPage: {
        subtitle: 'نظرة شاملة على صحتك',
        noData: 'لا توجد بيانات كافية لعرض الإحصائيات',
        avgCycleLength: 'متوسط طول الدورة',
        avgPeriodDuration: 'متوسط مدة الدورة',
        totalCycles: 'إجمالي الدورات',
        trackedDays: 'الأيام المسجلة',
        moodsLogged: 'تسجيلات المزاج',
        beautyActions: 'إجراءات الجمال',
        days: 'يوم',
        cycleHistory: 'تاريخ الدورة',
        cycleLength: 'طول الدورة',
        periodDuration: 'مدة الدورة',
        symptomFrequency: 'الأعراض الأكثر شيوعاً',
        moodDistribution: 'توزيع المزاج',
        moodTrend: 'اتجاه المزاج',
        health: 'الصحة',
        total: 'الإجمالي',
        completed: 'مكتمل',
        upcoming: 'قادم',
        remaining: 'متبقي',
        beautyByCategory: 'إجراءات الجمال حسب الفئة',
        healthSummary: 'ملخص الصحة',
        symptomsTracked: 'الأعراض المسجلة',
        progress: 'التقدم',
      },
      
      // Home
      greeting: 'مرحباً، {{name}} 💕',
      welcomeMessage: 'نحن هنا لمساعدتك في كل خطوة',
      currentPhase: 'المرحلة الحالية',
      daysToNextPeriod: 'أيام حتى الدورة القادمة',
      logToday: 'تسجيل اليوم',
      beautyPlanner: 'مخطط الجمال',
      quickActions: 'إجراءات سريعة',
      todayTracking: 'تتبع اليوم',
      overview: 'نظرة عامة',
      
      home: {
        dailyInsights: 'رؤى يومية',
        quickStats: 'إحصائيات سريعة',
        viewAll: 'عرض الكل',
        notifications: 'الإشعارات',
        notificationDesc: 'لديك {{count}} إشعار',
        noNotifications: 'لا توجد إشعارات جديدة',
        howAreYouFeeling: 'كيف تشعرين اليوم؟',
        moodLogged: 'تم تسجيل المزاج',
        moodLoggedDesc: 'تم حفظ مزاجك لهذا اليوم',
        moodError: 'حدث خطأ في تسجيل المزاج',
        viewMoodHistory: 'عرض سجل المزاج',
        moodHistory: 'سجل المزاج',
        moodLegend: 'دليل الألوان',
        trackSymptoms: 'تتبع الأعراض',
        symptomsUpdated: 'تم تحديث الأعراض',
        symptomsUpdatedDesc: 'تم حفظ أعراضك لهذا اليوم',
        symptomError: 'حدث خطأ في تسجيل الأعراض',
        symptomsSelected: '{{count}} أعراض محددة',
        waterIntake: 'شرب الماء',
        waterGoalReached: 'أحسنتِ! وصلتِ للهدف',
        waterGoalDesc: 'أكملتِ هدفك اليومي من الماء',
        waterError: 'حدث خطأ في تسجيل الماء',
        addGlass: 'إضافة كوب',
        achievements: 'الإنجازات',
        dailyAffirmation: 'تأكيد اليوم',
        pullToRefresh: 'اسحبي للتحديث',
        releaseToRefresh: 'اتركي للتحديث',
        dataRefreshed: 'تم تحديث البيانات',
        partnerMode: 'وضع الشريك',
        partnerModeDesc: 'أنت في وضع الشريك. يمكنك متابعة دورة شريكتك ودعمها.',
        viewPartnerCycle: 'عرض دورة الشريكة',
      },
      
      achievements: {
        firstCycle: 'الدورة الأولى',
        firstCycleDesc: 'سجلتِ أول دورة شهرية',
        weekTracker: 'متتبعة أسبوع',
        weekTrackerDesc: 'سجلتِ 7 أيام متتالية',
        moodMaster: 'خبيرة المزاج',
        moodMasterDesc: 'سجلتِ 30 حالة مزاجية',
        beautyGuru: 'خبيرة الجمال',
        beautyGuruDesc: 'جدولتِ 10 مواعيد جمال',
        consistencyQueen: 'ملكة الاستمرارية',
        consistencyQueenDesc: 'تتبعتِ 3 دورات كاملة',
      },
      
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
      
      // Phase translations for components
      phases: {
        menstruation: 'مرحلة الحيض',
        follicular: 'المرحلة الجريبية',
        ovulation: 'مرحلة التبويض',
        luteal: 'المرحلة الصفراء'
      },
      
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
        missedDays: 'أيام الإفطار',
        completed: 'تم قضاؤها',
        remaining: 'متبقية',
        markCompleted: 'تحديد يوم القضاء',
        selectDate: 'اختاري تاريخ يوم القضاء',
        markAsCompleted: 'تأكيد القضاء',
        completedDays: 'الأيام المقضية',
        completedOn: 'تم القضاء في',
        calculating: 'جاري الحساب...',
        ramadanDays: 'أيام رمضان',
        periodDays: 'أيام الدورة',
        error: 'خطأ',
        success: 'تم بنجاح',
        dayMarked: 'تم تسجيل يوم القضاء',
        dayRemoved: 'تم حذف يوم القضاء',
        noCompletedDays: 'لم تقومي بقضاء أي أيام بعد',
        duplicateDate: 'هذا التاريخ مسجل مسبقاً',
        confirmDelete: 'تأكيد الحذف',
        confirmDeleteDesc: 'هل أنت متأكدة من حذف هذا اليوم؟',
        clearAll: 'حذف الكل',
        allCleared: 'تم حذف جميع الأيام',
        confirmClearAll: 'حذف جميع الأيام',
        confirmClearAllDesc: 'هل أنت متأكدة من حذف جميع أيام القضاء المسجلة؟ لا يمكن التراجع عن هذا الإجراء.',
        reminderTitle: 'تذكير بالصيام',
        reminderDesc: 'احصلي على تذكير يومي لإكمال أيام القضاء',
        reminderBody: 'لديك {{count}} يوم متبقي من صيام القضاء',
        enable: 'تفعيل',
        enabled: 'مفعّل',
        notificationsEnabled: 'تم تفعيل التذكيرات بنجاح',
        calculationError: 'حدث خطأ في حساب الأيام. حاولي مرة أخرى.',
        manualAdjustmentTitle: 'التعديل اليدوي',
        manualAdjustmentDesc: 'أضف أو اطرح أياماً للحالات الخاصة أو التصحيحات غير المسجلة في التطبيق.',
        autoCalculated: 'محسوب تلقائياً',
        manualAdjustment: 'يدوي',
        total: 'المجموع',
        totalMissed: 'المجموع الفائت',
        calculatedDays: 'محسوب',
        adjustCount: 'تعديل العدد',
        adjustCountTitle: 'تعديل عدد الأيام الفائتة',
        adjustCountDesc: 'استخدم هذا لإضافة أو طرح أيام لفترات غير مسجلة في التطبيق.',
        adjustment: 'التعديل',
        newTotal: 'المجموع الجديد',
        days: 'أيام',
        adjustmentSaved: 'تم حفظ التعديل بنجاح',
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
        noMatchingActions: 'لا توجد عناية مطابقة للفلاتر',
        fillTitle: 'يرجى إدخال نوع العناية',
        actionAdded: 'تم إضافة العناية بنجاح',
        actionDeleted: 'تم حذف العناية',
        filters: 'الفلاتر',
        filterByPhase: 'فلتر حسب المرحلة',
        filterByDate: 'فلتر حسب التاريخ',
        all: 'الكل',
        startDate: 'تاريخ البداية',
        endDate: 'تاريخ النهاية',
        clearDateFilter: 'مسح فلتر التاريخ',
        actions: 'عناية',
        quickSelect: 'اختيار سريع',
        phaseStats: 'إحصائيات المراحل',
        actionCompleted: 'تم تحديد العناية كمنجزة',
        actionUncompleted: 'تم إلغاء إنجاز العناية',
        add: 'إضافة',
        frequency: 'التكرار',
        timeOfDay: 'وقت اليوم',
        enableReminder: 'تفعيل التذكير',
        reminderHoursBefore: 'التذكير قبل بكم ساعة',
        freq: {
          once: 'مرة واحدة',
          daily: 'يومياً',
          weekly: 'أسبوعياً',
          monthly: 'شهرياً'
        },
        time: {
          morning: 'صباحاً',
          afternoon: 'ظهراً',
          evening: 'مساءً',
          night: 'ليلاً'
        },
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
        bookmarked: 'المحفوظة',
        basics: 'الأساسيات',
        wellness: 'الصحة',
        beauty: 'الجمال',
        fertility: 'الخصوبة',
        rulings: 'الأحكام الشرعية'
      },
      articlesPage: {
        search: 'ابحث في المقالات...',
        noResults: 'لم يتم العثور على مقالات',
        articlesFound: 'مقالة',
        featured: 'مميز',
        readMore: 'اقرأ المزيد',
        readTime: '٥ دقائق قراءة',
        verified: 'موثق',
        source: 'المصدر',
        viewOriginal: 'عرض المرجع الأصلي',
        loginToBookmark: 'يجب تسجيل الدخول لحفظ المقالات',
        bookmarkAdded: 'تم حفظ المقال',
        bookmarkRemoved: 'تم إزالة المقال من المحفوظات'
      },
      
      // Pregnancy Mode
      pregnancy: {
        pregnancyMode: 'وضع الحمل',
        currentlyPregnant: 'أنا حامل حالياً',
        dueDate: 'تاريخ الولادة المتوقع',
        lmpMethod: 'أول يوم من آخر دورة شهرية (LMP)',
        eddMethod: 'تاريخ الولادة المتوقع (EDD)',
        selectLMP: 'اختاري تاريخ آخر دورة',
        selectEDD: 'اختاري تاريخ الولادة المتوقع',
        pickDate: 'اختاري التاريخ',
        enabledSuccess: 'تم تفعيل وضع الحمل بنجاح',
        disabledSuccess: 'تم إيقاف وضع الحمل',
        errorEnabling: 'حدث خطأ في تفعيل وضع الحمل',
        errorDisabling: 'حدث خطأ في إيقاف وضع الحمل',
        week: 'الأسبوع',
        weeks: 'أسابيع',
        calculator: 'حاسبة الحمل',
        lastMenstrualPeriod: 'تاريخ آخر دورة شهرية',
        currentWeek: 'الأسبوع الحالي من الحمل',
        currentMonth: 'الشهر الحالي من الحمل',
        selectDate: 'اختر التاريخ',
        enterWeeks: 'أدخل عدد الأسابيع',
        weeksPlaceholder: 'مثال: 12',
        enterMonths: 'أدخل عدد الأشهر',
        monthsPlaceholder: 'مثال: 3',
        calculate: 'احسب',
        trimester: 'الثلث',
        firstTrimester: 'الثلث الأول',
        secondTrimester: 'الثلث الثاني',
        thirdTrimester: 'الثلث الثالث',
        weeksPregnant: 'أسبوع من الحمل',
        daysRemaining: 'يوم متبقي',
        pregnant: 'حامل',
        daughtersCycleStatus: 'حالة الدورة للبنات',
        cycleDay: 'يوم الدورة',
        daysToNext: 'أيام للقادمة',
        noCycleData: 'لا توجد بيانات دورة',
        tracking: 'متابعة الحمل',
        tip: 'احرصي على الراحة وتناول الفيتامينات المهمة',
        viewDetails: 'عرض التفاصيل',
        calendar: 'تقويم الحمل',
        gestationalAge: 'العمر الحملي',
        daysUntilDue: 'أيام حتى الولادة',
        appointments: 'المواعيد',
        medicines: 'الأدوية',
        addAppointment: 'إضافة موعد',
        addMedicine: 'إضافة دواء',
        noAppointments: 'لا توجد مواعيد',
        noMedicines: 'لا توجد أدوية',
        appointmentTitle: 'عنوان الموعد',
        appointmentTitlePlaceholder: 'مثال: فحص الموجات الصوتية',
        appointmentType: 'نوع الموعد',
        doctorVisit: 'زيارة طبيب',
        ultrasound: 'موجات صوتية',
        vaccine: 'تطعيم',
        labTest: 'تحليل مخبري',
        other: 'أخرى',
        time: 'الوقت',
        noTime: 'لم يحدد الوقت',
        notes: 'ملاحظات',
        notesPlaceholder: 'أضف ملاحظات...',
        medicineName: 'اسم الدواء',
        medicineNamePlaceholder: 'مثال: فيتامين د',
        dosage: 'الجرعة',
        dosagePlaceholder: 'مثال: قرص واحد',
        frequency: 'عدد المرات',
        frequencyPlaceholder: 'مثال: مرتين يومياً',
        appointmentSaved: 'تم حفظ الموعد بنجاح',
        medicineSaved: 'تم حفظ الدواء بنجاح',
        deleted: 'تم الحذف بنجاح',
        errorAdding: 'حدث خطأ في الإضافة',
        errorUpdating: 'حدث خطأ في التحديث',
        fillRequired: 'الرجاء ملء الحقول المطلوبة',
        viewCalendar: 'عرض تقويم الحمل'
      },

      // Postpartum
      postpartum: {
        tracking: 'متابعة النفاس',
        daysPostpartum: 'أيام النفاس',
        tip: 'النفاس فترة تحتاج للراحة والرعاية الخاصة',
        calculator: 'حاسبة النفاس',
        birthDate: 'تاريخ الولادة',
        selectDate: 'اختر التاريخ',
        daysPassed: 'الأيام المنقضية',
        remainingDays: 'الأيام المتبقية',
        progress: 'التقدم',
        endDate: 'تاريخ نهاية النفاس',
        completed: 'اكتملت فترة النفاس',
      },

      // Breastfeeding
      breastfeeding: {
        tracking: 'متابعة الرضاعة',
        duration: 'مدة الرضاعة',
        months: 'أشهر',
        tip: 'الرضاعة الطبيعية مفيدة لك ولطفلك'
      },

      // Common
      common: {
        days: 'أيام',
        save: 'حفظ',
      },

      // Mother
      mother: {
        features: 'ميزات الأمهات',
        myInfo: 'معلوماتي',
        myDaughters: 'بناتي',
        addDaughter: 'إضافة ابنة',
        daughterName: 'اسم الابنة',
        birthDate: 'تاريخ الميلاد',
        cycleStartAge: 'عمر بداية الدورة',
        notes: 'ملاحظات',
        age: 'العمر',
        years: 'سنة',
        viewDetails: 'عرض التفاصيل',
        editDaughter: 'تعديل بيانات الابنة',
        deleteDaughter: 'حذف الابنة',
        confirmDelete: 'هل أنت متأكد من حذف هذه الابنة؟',
        deleteWarning: 'سيتم حذف جميع البيانات المرتبطة بها.',
        cycleTracking: 'متابعة الدورة',
        addCycle: 'إضافة دورة',
        fastingTracking: 'قضاء الصيام',
        totalDays: 'إجمالي الأيام',
        completedDays: 'الأيام المكتملة',
        addFastingDay: 'إضافة يوم صيام',
        markComplete: 'تعليم كمكتمل',
        lastCycle: 'آخر دورة',
        nextCycle: 'الدورة القادمة',
        day: 'اليوم',
        statusSettings: 'إعدادات الحالة',
        selectStatus: 'اختر حالتك الحالية',
        statusNone: 'لا شيء',
        statusPregnant: 'حامل',
        statusPostpartum: 'نفاس',
        statusBreastfeeding: 'رضاعة',
        breastfeedingStartDate: 'تاريخ بدء الرضاعة',
        selectDate: 'اختر التاريخ',
      },
      
      // Subscription
      subscription: {
        title: 'إدارة الاشتراك',
        premiumActive: 'وردية بلس',
        freePlan: 'الباقة المجانية',
        premiumDesc: 'أنتِ مشتركة في الباقة المميزة',
        freeDesc: 'قومي بالترقية للوصول لجميع الميزات',
        premium: 'بريميوم',
        startDate: 'تاريخ البداية',
        endDate: 'تاريخ الانتهاء',
        plan: 'الباقة',
        monthly: 'شهرية',
        yearly: 'سنوية',
        yourFeatures: 'ميزاتك المتاحة',
        availableFeatures: 'الميزات المتاحة في وردية بلس',
        enjoyFeatures: 'استمتعي بجميع الميزات المميزة',
        upgradeToAccess: 'قومي بالترقية للوصول لهذه الميزات',
        features: {
          beautyPlanner: 'مخطط الجمال',
          beautyPlannerDesc: 'خطط جمالية مخصصة حسب دورتك',
          fastingQada: 'تتبع القضاء',
          fastingQadaDesc: 'إدارة أيام الصيام الفائتة',
          partnerSharing: 'مشاركة الشريك',
          partnerSharingDesc: 'تزامن البيانات مع شريك حياتك',
          motherFeatures: 'ميزات الأم',
          motherFeaturesDesc: 'تتبع صحة بناتك',
          dataExport: 'تصدير البيانات',
          dataExportDesc: 'احفظي بياناتك بصيغة JSON',
          advancedStats: 'إحصائيات متقدمة',
          advancedStatsDesc: 'تحليلات شاملة وتقارير تفصيلية'
        },
        cancelWarning: 'تحذير هام',
        cancelWarningDesc: 'عند إلغاء الاشتراك، ستفقدين الوصول لجميع الميزات المميزة في نهاية الفترة الحالية',
        cancelButton: 'إلغاء الاشتراك',
        confirmCancel: 'تأكيد إلغاء الاشتراك',
        confirmCancelDesc: 'هل أنتِ متأكدة من إلغاء اشتراكك في وردية بلس؟ ستفقدين الوصول لجميع الميزات المميزة.',
        confirmCancelButton: 'نعم، قومي بالإلغاء',
        upgradeNow: 'ترقي الآن لوردية بلس',
        upgradeNowDesc: 'احصلي على وصول كامل لجميع الميزات المميزة واستمتعي بتجربة أفضل',
        upgradeButton: 'الترقية لوردية بلس',
        needHelp: 'هل تحتاجين مساعدة؟',
        needHelpDesc: 'تواصلي مع فريق الدعم للحصول على المساعدة في إدارة اشتراكك',
        cancelled: 'تم إلغاء الاشتراك',
        cancelSuccess: 'تم إلغاء اشتراكك بنجاح',
        cancelError: 'حدث خطأ في إلغاء الاشتراك',
        renewed: 'تم تجديد الاشتراك',
        renewSuccess: 'تم تجديد اشتراكك بنجاح',
        renewError: 'حدث خطأ في تجديد الاشتراك',
        error: 'خطأ'
      },
      
      // Cycle Phases
      cyclePhases: {
        menstrual: 'الحيض',
        follicular: 'المرحلة الجريبية',
        ovulation: 'الإباضة',
        luteal: 'المرحلة الصفراء',
        unknown: 'غير معروف'
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
      close: 'Close',
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
      homeNav: 'Home',
      calendar: 'Calendar',
      stats: 'Stats',
      articles: 'Articles',
      profile: 'Profile',
      
      profilePage: {
        statistics: 'Statistics',
        preferences: 'Preferences',
        dataPrivacy: 'Data & Privacy',
        moodsLogged: 'Moods Logged',
        beautyScheduled: 'Beauty Scheduled',
        darkMode: 'Dark Mode',
        manageSubscription: 'Manage Subscription',
        exportData: 'Export Data',
        deleteAccount: 'Delete Account',
        confirmDelete: 'Confirm Account Deletion',
        confirmDeleteDesc: 'Are you sure you want to delete your account? All your data will be permanently deleted and cannot be recovered.',
        updated: 'Profile updated successfully',
        updateError: 'Error updating profile',
        dataExported: 'Data exported successfully',
        exportError: 'Error exporting data',
        accountDeleted: 'Account deleted successfully',
        deleteError: 'Error deleting account',
        enterName: 'Enter your name',
        partnerSharing: 'Partner Sharing',
        premiumFeature: 'Premium Feature',
        partnerStats: 'Partner Stats',
        shareCode: 'Share Code',
        connected: 'Connected',
        pending: 'Pending',
        generateShareLink: 'Generate Share Link',
        connectWithPartner: 'Connect with Partner',
        revokeLink: 'Revoke Link',
        sharingDescription: 'Share your stats with your partner for better tracking',
        enterPartnerCode: 'Enter your partner\'s code to connect',
        connect: 'Connect',
        shareLinkCreated: 'Share link created successfully',
        shareLinkError: 'Error creating share link',
        invalidCode: 'Invalid code',
        connectedSuccess: 'Connected successfully',
        connectError: 'Error connecting',
        codeCopied: 'Code copied to clipboard',
        cycleSync: {
          title: 'Cycle Synchronization',
          status: 'Sync Status',
          synced: 'Perfectly Synced',
          close: 'Nearly Synced',
          different: 'Different Phases',
          you: 'You',
          partner: 'Your Partner',
          insights: 'Sync Insights'
        },
        insights: {
          perfectSync: 'You are perfectly synchronized in the same cycle phase! This is common among women who spend a lot of time together.',
          closeSync: 'You are nearly synchronized. You may notice similar effects on mood and energy.',
          differentPhases: 'You are in different cycle phases. This can be an opportunity to support each other.',
          menstrualTogether: 'Both in menstrual phase. Focus on rest and self-care together.',
          ovulationTogether: 'Both in ovulation phase. Your energy is high - great time for shared activities!',
          follicularTogether: 'Both in follicular phase. Use this positive energy for new plans.',
          lutealTogether: 'Both in luteal phase. Take it easy and be patient with each other.',
          considerTiming: 'Consider planning social activities when your energy levels align.',
          oppositePhases: 'You are in opposite phases. One may feel energetic while the other needs rest.'
        },
        shareLinkRevoked: 'Share link revoked',
        revokeError: 'Error revoking link',
        noPartnerConnected: 'No partner connected',
        loadPartnerError: 'Error loading partner data',
        backToProfile: 'Back to Profile',
        viewPartnerProfile: 'View Partner Profile',
        partnerSupport: 'Tips to Support Your Partner',
        supportTip1: 'Be understanding of mood changes during different cycle phases',
        supportTip2: 'Offer emotional support and comfort during difficult days',
        supportTip3: 'Help her remember beauty appointments and self-care',
        supportTip4: 'Respect her need for rest or activity based on cycle phase',
      },

      partnerView: {
        title: 'Partner Information',
        cyclePhase: 'Cycle Phase',
        currentDay: 'Current Day',
        cycleLength: 'Cycle Length',
        lastPeriod: 'Last Period',
        nextPeriod: 'Next Period',
        recentMood: 'Recent Mood',
        symptoms: 'Symptoms',
        noPartner: 'No partner connected yet',
        noData: 'No data available',
        error: 'Error loading data',
        support: 'Support Tips',
        supportTip: 'During this phase, your partner may need extra support and comfort',
        viewStats: 'View Shared Statistics'
      },

      sharedStats: {
        title: 'Shared Statistics',
        partner: 'Partner',
        noPartner: 'No partner connected yet',
        partnerInfo: 'Partner Information',
        analyzingDataFor: 'Analyzing data for',
        daysTracked: 'days tracked',
        sharedEvents: 'shared events',
        moodTrend: 'Mood Trend',
        moodScore: 'Mood Level',
        moodTrendDesc: 'Track mood changes over the last 30 days',
        energyByPhase: 'Energy by Phase',
        avgEnergy: 'Average Energy',
        energyByPhaseDesc: 'Average energy and mood levels in each cycle phase',
        eventsDistribution: 'Shared Events Distribution',
        eventsDistributionDesc: 'Types of events recorded in the shared calendar',
        commonSymptoms: 'Most Common Symptoms',
        commonSymptomsDesc: 'Symptoms that occur frequently during cycles',
        recommendations: 'Recommendations for Partner',
        bestTimes: 'Best Times',
        bestTimesDesc: 'This is the best period for activities and shared projects',
        supportNeeded: 'Support Needed',
        supportNeededDesc: 'During this period, your partner may need more support and understanding'
      },

      sharedCalendar: {
        title: 'Shared Calendar',
        description: 'Shared calendar with {{name}} showing cycle days and important events',
        addEvent: 'Add Event',
        addNewEvent: 'Add New Event',
        addEventDescription: 'Add a shared event or reminder to the calendar',
        eventTitle: 'Event Title',
        eventTitlePlaceholder: 'e.g., Doctor appointment',
        eventDescription: 'Event Description',
        eventDescriptionPlaceholder: 'Additional details (optional)',
        eventDate: 'Event Date',
        eventType: 'Event Type',
        eventTypes: {
          reminder: 'Reminder',
          appointment: 'Appointment',
          note: 'Note',
        },
        reminder: 'Reminder',
        appointment: 'Appointment',
        note: 'Note',
        add: 'Add',
        events: 'events',
        noEvents: 'No events on this day',
        sharedEvent: 'Shared Event',
        eventAdded: 'Event added successfully',
        addEventError: 'Error adding event',
        eventDeleted: 'Event deleted',
        deleteEventError: 'Error deleting event',
      },

      beautyRoutines: {
        categories: 'الفئات',
        addCategory: 'إضافة فئة',
        editCategory: 'تعديل فئة',
        categoryNameAr: 'اسم الفئة بالعربية',
        categoryNameEn: 'اسم الفئة بالإنجليزية',
        categoryNamePlaceholder: 'مثال: العناية بالشعر',
        icon: 'الأيقونة',
        color: 'اللون',
        categorySaved: 'تم حفظ الفئة بنجاح',
        deleted: 'تم الحذف بنجاح',
        errorAdding: 'حدث خطأ أثناء الإضافة',
        errorUpdating: 'حدث خطأ أثناء التحديث',
        errorDeleting: 'حدث خطأ أثناء الحذف',
        fillRequired: 'يرجى ملء الحقول المطلوبة',
        noCategories: 'لا توجد فئات بعد. قم بإضافة فئة جديدة',
        routines: 'الروتينات',
        addRoutine: 'إضافة روتين',
        editRoutine: 'تعديل روتين',
        title: 'العنوان',
        titlePlaceholder: 'مثال: روتين العناية بالبشرة الصباحي',
        description: 'الوصف',
        descriptionPlaceholder: 'اكتب وصف مختصر للروتين',
        category: 'الفئة',
        frequency: {
          label: 'التكرار',
          daily: 'يومي',
          weekly: 'أسبوعي',
          monthly: 'شهري',
        },
        time: {
          label: 'الوقت',
          morning: 'صباحي',
          evening: 'مسائي',
          both: 'صباحي ومسائي',
        },
        products: 'المنتجات',
        addProduct: 'إضافة منتج',
        productName: 'اسم المنتج',
        productNotes: 'ملاحظات عن المنتج',
        uploadImage: 'رفع صورة',
        imageUploaded: 'تم رفع الصورة بنجاح',
        uploading: 'جاري الرفع...',
        add: 'إضافة',
        routineSaved: 'تم حفظ الروتين بنجاح',
        noRoutines: 'لا توجد روتينات بعد. قم بإضافة روتين جديد',
        productNameRequired: 'يرجى إدخال اسم المنتج',
        reminder: 'التذكير',
        reminderTime: 'وقت التذكير',
        todayRoutines: 'روتينات اليوم',
        logUpdated: 'تم تحديث السجل بنجاح',
      },
      
      // Stats
      statsPage: {
        subtitle: 'A comprehensive view of your health',
        noData: 'Not enough data to display statistics',
        avgCycleLength: 'Average Cycle Length',
        avgPeriodDuration: 'Average Period Duration',
        totalCycles: 'Total Cycles',
        trackedDays: 'Tracked Days',
        moodsLogged: 'Moods Logged',
        beautyActions: 'Beauty Actions',
        days: 'days',
        cycleHistory: 'Cycle History',
        cycleLength: 'Cycle Length',
        periodDuration: 'Period Duration',
        symptomFrequency: 'Most Common Symptoms',
        moodDistribution: 'Mood Distribution',
        moodTrend: 'Mood Trend',
        health: 'Health',
        total: 'Total',
        completed: 'Completed',
        upcoming: 'Upcoming',
        remaining: 'Remaining',
        beautyByCategory: 'Beauty Actions by Category',
        healthSummary: 'Health Summary',
        symptomsTracked: 'Symptoms Tracked',
        progress: 'Progress',
      },
      
      // Home
      greeting: 'Hello, {{name}} 💕',
      welcomeMessage: 'We are here to help you every step of the way',
      currentPhase: 'Current Phase',
      daysToNextPeriod: 'Days to Next Period',
      logToday: 'Log Today',
      beautyPlanner: 'Beauty Planner',
      quickActions: 'Quick Actions',
      todayTracking: 'Today\'s Tracking',
      overview: 'Overview',
      
      home: {
        dailyInsights: 'Daily Insights',
        quickStats: 'Quick Stats',
        viewAll: 'View All',
        notifications: 'Notifications',
        notificationDesc: 'You have {{count}} notification(s)',
        noNotifications: 'No new notifications',
        howAreYouFeeling: 'How are you feeling today?',
        moodLogged: 'Mood Logged',
        moodLoggedDesc: 'Your mood has been saved for today',
        moodError: 'Error logging mood',
        viewMoodHistory: 'View Mood History',
        moodHistory: 'Mood History',
        moodLegend: 'Color Legend',
        trackSymptoms: 'Track Symptoms',
        symptomsUpdated: 'Symptoms Updated',
        symptomsUpdatedDesc: 'Your symptoms have been saved for today',
        symptomError: 'Error logging symptoms',
        symptomsSelected: '{{count}} symptoms selected',
        waterIntake: 'Water Intake',
        waterGoalReached: 'Great job! Goal reached',
        waterGoalDesc: 'You completed your daily water goal',
        waterError: 'Error logging water',
        addGlass: 'Add Glass',
        achievements: 'Achievements',
        dailyAffirmation: 'Daily Affirmation',
        pullToRefresh: 'Pull to Refresh',
        releaseToRefresh: 'Release to Refresh',
        dataRefreshed: 'Data Refreshed',
        partnerMode: 'Partner Mode',
        partnerModeDesc: 'You are in partner mode. You can track and support your partner\'s cycle.',
        viewPartnerCycle: 'View Partner\'s Cycle',
      },
      
      achievements: {
        firstCycle: 'First Cycle',
        firstCycleDesc: 'Tracked your first cycle',
        weekTracker: 'Week Tracker',
        weekTrackerDesc: 'Logged 7 days in a row',
        moodMaster: 'Mood Master',
        moodMasterDesc: 'Logged 30 moods',
        beautyGuru: 'Beauty Guru',
        beautyGuruDesc: 'Scheduled 10 beauty actions',
        consistencyQueen: 'Consistency Queen',
        consistencyQueenDesc: 'Tracked 3 complete cycles',
      },
      
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
      
      // Phase translations for components
      phases: {
        menstruation: 'Menstrual Phase',
        follicular: 'Follicular Phase',
        ovulation: 'Ovulation Phase',
        luteal: 'Luteal Phase'
      },
      
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
        missedDays: 'Missed Days',
        completed: 'Completed',
        remaining: 'Remaining',
        markCompleted: 'Mark Day Completed',
        selectDate: 'Select the date you completed this fast',
        markAsCompleted: 'Mark as Completed',
        completedDays: 'Completed Days',
        completedOn: 'Completed on',
        calculating: 'Calculating...',
        ramadanDays: 'Ramadan Days',
        periodDays: 'Period Days',
        error: 'Error',
        success: 'Success',
        dayMarked: 'Fasting day marked as completed',
        dayRemoved: 'Completed day removed',
        noCompletedDays: 'No completed days yet',
        duplicateDate: 'This date is already recorded',
        confirmDelete: 'Confirm Deletion',
        confirmDeleteDesc: 'Are you sure you want to delete this day?',
        clearAll: 'Clear All',
        allCleared: 'All days cleared',
        confirmClearAll: 'Clear All Days',
        confirmClearAllDesc: 'Are you sure you want to delete all recorded fasting days? This action cannot be undone.',
        reminderTitle: 'Fasting Reminder',
        reminderDesc: 'Get daily reminders to complete your fasting days',
        reminderBody: 'You have {{count}} fasting days remaining',
        enable: 'Enable',
        enabled: 'Enabled',
        notificationsEnabled: 'Reminders enabled successfully',
        calculationError: 'Error calculating days. Please try again.',
        manualAdjustmentTitle: 'Manual Adjustment',
        manualAdjustmentDesc: 'Add or subtract days for special cases or corrections not tracked in the app.',
        autoCalculated: 'Auto-calculated',
        manualAdjustment: 'Manual',
        total: 'Total',
        totalMissed: 'Total Missed',
        calculatedDays: 'Calculated',
        adjustCount: 'Adjust Count',
        adjustCountTitle: 'Adjust Missed Days Count',
        adjustCountDesc: 'Use this to add or subtract days for periods not tracked in the app.',
        adjustment: 'Adjustment',
        newTotal: 'New total',
        days: 'days',
        adjustmentSaved: 'Adjustment saved successfully',
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
        noMatchingActions: 'No actions matching the filters',
        fillTitle: 'Please enter a treatment type',
        actionAdded: 'Beauty action added successfully',
        actionDeleted: 'Beauty action deleted',
        filters: 'Filters',
        filterByPhase: 'Filter by Phase',
        filterByDate: 'Filter by Date',
        all: 'All',
        startDate: 'Start Date',
        endDate: 'End Date',
        clearDateFilter: 'Clear Date Filter',
        actions: 'actions',
        quickSelect: 'Quick Select',
        phaseStats: 'Phase Statistics',
        actionCompleted: 'Action marked as completed',
        actionUncompleted: 'Action marked as incomplete',
        add: 'Add',
        frequency: 'Frequency',
        timeOfDay: 'Time of Day',
        enableReminder: 'Enable Reminder',
        reminderHoursBefore: 'Remind me before',
        freq: {
          once: 'Once',
          daily: 'Daily',
          weekly: 'Weekly',
          monthly: 'Monthly'
        },
        time: {
          morning: 'Morning',
          afternoon: 'Afternoon',
          evening: 'Evening',
          night: 'Night'
        },
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
        bookmarked: 'Bookmarked',
        basics: 'Basics',
        wellness: 'Wellness',
        beauty: 'Beauty',
        fertility: 'Fertility',
        rulings: 'Islamic Rulings'
      },
      articlesPage: {
        search: 'Search articles...',
        noResults: 'No articles found',
        articlesFound: 'articles',
        featured: 'Featured',
        readMore: 'Read More',
        readTime: '5 min read',
        verified: 'Verified',
        source: 'Source',
        viewOriginal: 'View Original Reference',
        loginToBookmark: 'Please login to bookmark articles',
        bookmarkAdded: 'Article bookmarked',
        bookmarkRemoved: 'Bookmark removed'
      },
      
      // Pregnancy Mode
      pregnancy: {
        pregnancyMode: 'Pregnancy Mode',
        currentlyPregnant: 'I am currently pregnant',
        dueDate: 'Due Date',
        lmpMethod: 'Last Menstrual Period (LMP)',
        eddMethod: 'Expected Due Date (EDD)',
        selectLMP: 'Select your last period date',
        selectEDD: 'Select your expected due date',
        pickDate: 'Pick a date',
        enabledSuccess: 'Pregnancy mode enabled successfully',
        disabledSuccess: 'Pregnancy mode disabled',
        errorEnabling: 'Error enabling pregnancy mode',
        errorDisabling: 'Error disabling pregnancy mode',
        week: 'Week',
        weeks: 'weeks',
        calculator: 'Pregnancy Calculator',
        lastMenstrualPeriod: 'Last Menstrual Period',
        currentWeek: 'Current Week of Pregnancy',
        currentMonth: 'Current Month of Pregnancy',
        selectDate: 'Select Date',
        enterWeeks: 'Enter Number of Weeks',
        weeksPlaceholder: 'Example: 12',
        enterMonths: 'Enter Number of Months',
        monthsPlaceholder: 'Example: 3',
        calculate: 'Calculate',
        trimester: 'Trimester',
        firstTrimester: 'First Trimester',
        secondTrimester: 'Second Trimester',
        thirdTrimester: 'Third Trimester',
        weeksPregnant: 'weeks pregnant',
        daysRemaining: 'days remaining',
        pregnant: 'Pregnant',
        daughtersCycleStatus: 'Daughters Cycle Status',
        cycleDay: 'Cycle Day',
        daysToNext: 'Days to Next',
        noCycleData: 'No cycle data',
        tracking: 'Pregnancy Tracking',
        tip: 'Make sure to rest and take important vitamins',
        viewDetails: 'View Details',
        calendar: 'Pregnancy Calendar',
        gestationalAge: 'Gestational Age',
        daysUntilDue: 'Days Until Due',
        appointments: 'Appointments',
        medicines: 'Medicines',
        addAppointment: 'Add Appointment',
        addMedicine: 'Add Medicine',
        noAppointments: 'No appointments',
        noMedicines: 'No medicines',
        appointmentTitle: 'Appointment Title',
        appointmentTitlePlaceholder: 'e.g., Ultrasound Scan',
        appointmentType: 'Appointment Type',
        doctorVisit: 'Doctor Visit',
        ultrasound: 'Ultrasound',
        vaccine: 'Vaccine',
        labTest: 'Lab Test',
        other: 'Other',
        time: 'Time',
        noTime: 'No time set',
        notes: 'Notes',
        notesPlaceholder: 'Add notes...',
        medicineName: 'Medicine Name',
        medicineNamePlaceholder: 'e.g., Vitamin D',
        dosage: 'Dosage',
        dosagePlaceholder: 'e.g., One tablet',
        frequency: 'Frequency',
        frequencyPlaceholder: 'e.g., Twice daily',
        appointmentSaved: 'Appointment saved successfully',
        medicineSaved: 'Medicine saved successfully',
        deleted: 'Deleted successfully',
        errorAdding: 'Error adding',
        errorUpdating: 'Error updating',
        fillRequired: 'Please fill required fields',
        viewCalendar: 'View Pregnancy Calendar'
      },

      // Postpartum
      postpartum: {
        tracking: 'Postpartum Tracking',
        daysPostpartum: 'Days postpartum',
        tip: 'Postpartum period needs rest and special care',
        calculator: 'Postpartum Calculator',
        birthDate: 'Birth Date',
        selectDate: 'Select Date',
        daysPassed: 'Days Passed',
        remainingDays: 'Remaining Days',
        progress: 'Progress',
        endDate: 'Postpartum End Date',
        completed: 'Postpartum Period Completed',
      },

      // Breastfeeding
      breastfeeding: {
        tracking: 'Breastfeeding Tracking',
        duration: 'Breastfeeding duration',
        months: 'months',
        tip: 'Breastfeeding is beneficial for you and your baby'
      },

      // Common
      common: {
        days: 'days',
        save: 'Save',
      },

      // Mother
      mother: {
        features: 'Mother Features',
        myInfo: 'My Information',
        myDaughters: 'My Daughters',
        addDaughter: 'Add Daughter',
        daughterName: 'Daughter Name',
        birthDate: 'Birth Date',
        cycleStartAge: 'Cycle Start Age',
        notes: 'Notes',
        age: 'Age',
        years: 'Years',
        viewDetails: 'View Details',
        editDaughter: 'Edit Daughter',
        deleteDaughter: 'Delete Daughter',
        confirmDelete: 'Are you sure you want to delete this daughter?',
        deleteWarning: 'All related data will be deleted.',
        cycleTracking: 'Cycle Tracking',
        addCycle: 'Add Cycle',
        fastingTracking: 'Fasting Tracking',
        totalDays: 'Total Days',
        completedDays: 'Completed Days',
        addFastingDay: 'Add Fasting Day',
        markComplete: 'Mark as Complete',
        lastCycle: 'Last Cycle',
        nextCycle: 'Next Cycle',
        day: 'Day',
        statusSettings: 'Status Settings',
        selectStatus: 'Select Your Current Status',
        statusNone: 'None',
        statusPregnant: 'Pregnant',
        statusPostpartum: 'Postpartum',
        statusBreastfeeding: 'Breastfeeding',
        breastfeedingStartDate: 'Breastfeeding Start Date',
        selectDate: 'Select Date',
      },
      
      // Subscription
      subscription: {
        title: 'Manage Subscription',
        premiumActive: 'Wardiya Plus',
        freePlan: 'Free Plan',
        premiumDesc: 'You are subscribed to the premium plan',
        freeDesc: 'Upgrade to access all features',
        premium: 'Premium',
        startDate: 'Start Date',
        endDate: 'End Date',
        plan: 'Plan',
        monthly: 'Monthly',
        yearly: 'Yearly',
        yourFeatures: 'Your Features',
        availableFeatures: 'Available Features in Wardiya Plus',
        enjoyFeatures: 'Enjoy all premium features',
        upgradeToAccess: 'Upgrade to access these features',
        features: {
          beautyPlanner: 'Beauty Planner',
          beautyPlannerDesc: 'Customized beauty plans based on your cycle',
          fastingQada: 'Fasting Tracker',
          fastingQadaDesc: 'Manage missed fasting days',
          partnerSharing: 'Partner Sharing',
          partnerSharingDesc: 'Sync data with your partner',
          motherFeatures: 'Mother Features',
          motherFeaturesDesc: 'Track your daughters health',
          dataExport: 'Data Export',
          dataExportDesc: 'Save your data in JSON format',
          advancedStats: 'Advanced Stats',
          advancedStatsDesc: 'Comprehensive analytics and detailed reports'
        },
        cancelWarning: 'Important Warning',
        cancelWarningDesc: 'When you cancel your subscription, you will lose access to all premium features at the end of the current period',
        cancelButton: 'Cancel Subscription',
        confirmCancel: 'Confirm Cancellation',
        confirmCancelDesc: 'Are you sure you want to cancel your Wardiya Plus subscription? You will lose access to all premium features.',
        confirmCancelButton: 'Yes, Cancel',
        upgradeNow: 'Upgrade to Wardiya Plus Now',
        upgradeNowDesc: 'Get full access to all premium features and enjoy a better experience',
        upgradeButton: 'Upgrade to Wardiya Plus',
        needHelp: 'Need Help?',
        needHelpDesc: 'Contact our support team for help managing your subscription',
        cancelled: 'Subscription Cancelled',
        cancelSuccess: 'Your subscription has been cancelled successfully',
        cancelError: 'Error cancelling subscription',
        renewed: 'Subscription Renewed',
        renewSuccess: 'Your subscription has been renewed successfully',
        renewError: 'Error renewing subscription',
        error: 'Error'
      },
      
      // Cycle Phases
      cyclePhases: {
        menstrual: 'Menstrual',
        follicular: 'Follicular',
        ovulation: 'Ovulation',
        luteal: 'Luteal',
        unknown: 'Unknown'
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
