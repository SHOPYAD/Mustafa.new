// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appTitle => 'لوناليزا كابتن';

  @override
  String get settingsTitle => 'الإعدادات';

  @override
  String get languageLabel => 'اللغة';

  @override
  String get english => 'الإنجليزية';

  @override
  String get arabic => 'العربية';

  @override
  String get countryLabel => 'البلد أو المنطقة';

  @override
  String get currencyLabel => 'العملة';

  @override
  String get unitsLabel => 'الوحدات';

  @override
  String get temperatureLabel => 'مقياس الحرارة';

  @override
  String get timeFormatLabel => 'تنسيق الوقت';

  @override
  String get manageAccountLabel => 'إدارة حسابي';

  @override
  String get scanQrLabel => 'مسح رمز QR';

  @override
  String get darkThemeLabel => 'المظهر الداكن';

  @override
  String get notificationsLabel => 'التنبيهات';

  @override
  String get tripGenieLabel => 'تريب جيني';

  @override
  String get accessibilityLabel => 'سهولة الوصول';

  @override
  String get termsLabel => 'الشروط والأحكام';

  @override
  String get privacyLabel => 'بيان الخصوصية';

  @override
  String get flights => 'رحلات الطيران';

  @override
  String get oneWay => 'ذهاب فقط';

  @override
  String get roundTrip => 'ذهاب وعودة';

  @override
  String get multiCity => 'وجهات متعددة';

  @override
  String get whereFrom => 'من أين؟';

  @override
  String get whereTo => 'إلى أين؟';

  @override
  String get selectDate => 'اختر التاريخ';

  @override
  String get selectDates => 'اختر التواريخ';

  @override
  String get addAnotherFlight => 'إضافة رحلة أخرى';

  @override
  String get adults => 'بالغون';

  @override
  String get children => 'أطفال';

  @override
  String get infants => 'رضع';

  @override
  String get cabinEconomy => 'سياحية';

  @override
  String get cabinPremiumEconomy => 'سياحية ممتازة';

  @override
  String get cabinBusiness => 'درجة الأعمال';

  @override
  String get cabinFirst => 'الدرجة الأولى';

  @override
  String get search => 'بحث';

  @override
  String get searchHint => 'أدخل وجهة أو اسم فندق';

  @override
  String get currentLocation => 'الموقع الحالي';

  @override
  String get clear => 'مسح';

  @override
  String get recentSearches => 'عمليات البحث الأخيرة';

  @override
  String get popularDestinations => 'الوجهات الشائعة';

  @override
  String get typeMinChars => 'اكتب 3 أحرف على الأقل';

  @override
  String noMatches(Object query) {
    return 'لا توجد نتائج لـ \"$query\"';
  }

  @override
  String get searchFooter =>
      'لا تجد ما تبحث عنه؟ جرب بحثاً أكثر تحديداً (مثلاً بإضافة اسم البلد أو المنطقة).';

  @override
  String get passengersTitle => 'الركاب';

  @override
  String get adultsSub => 'أكبر من 12 سنة';

  @override
  String get childrenSub => 'من 2 إلى 11 سنة';

  @override
  String get infantsSub => 'أقل من سنتين';

  @override
  String get passengersNotice =>
      'النتائج تعرض متوسط السعر للراكب (شامل الضرائب). الأسعار قد تختلف حسب نوع الراكب';

  @override
  String get bookingInstructions => 'تعليمات الحجز للأطفال/الرضع';

  @override
  String get confirm => 'تأكيد';

  @override
  String get retry => 'إعادة المحاولة';

  @override
  String get errorNetwork => 'تأكد من اتصالك بالإنترنت وحاول مرة أخرى.';

  @override
  String get errorServer => 'خدمة البحث غير متوفرة حالياً.';

  @override
  String get errorGeneric => 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';

  @override
  String get errorNotFound => 'العنصر المطلوب غير موجود.';

  @override
  String get login => 'تسجيل الدخول';

  @override
  String get loginRequired => 'يرجى تسجيل الدخول للمتابعة.';

  @override
  String flightNumber(Object number) {
    return 'الرحلة $number';
  }

  @override
  String get pleaseSelectOrigin => 'يرجى اختيار مدينة الإقلاع';

  @override
  String get pleaseSelectDestination => 'يرجى اختيار وجهة السفر';

  @override
  String get atLeastOneAdult => 'يجب وجود بالغ واحد على الأقل';

  @override
  String get dateMustBeAfterPrevious =>
      'التاريخ يجب أن يكون بعد الرحلة السابقة';

  @override
  String get noFlightsAvailable => 'لا توجد رحلات متاحة لهذا التاريخ';

  @override
  String showMoreFlights(int count) {
    return 'عرض المزيد ($count رحلة)';
  }

  @override
  String get flightOutbound => 'ذهاب';

  @override
  String get flightInbound => 'عودة';

  @override
  String get flightNonstop => 'بدون توقف';

  @override
  String flightStop(int count) {
    return 'توقف واحد';
  }

  @override
  String flightStops(int count) {
    return '$count توقفات';
  }

  @override
  String flightStopVia(int count, Object code) {
    return '$count توقف عبر $code';
  }

  @override
  String flightLayover(Object duration, Object code) {
    return 'توقف $duration في $code';
  }

  @override
  String flightTerminal(Object terminal) {
    return 'مبنى $terminal';
  }

  @override
  String get flightEconomy => 'اقتصادية';

  @override
  String get farePackages => 'باقات الأسعار';

  @override
  String get compareInclusions => 'قارن المزايا والمشمولات أدناه';

  @override
  String get continueWithThisFare => 'المتابعة بهذا السعر';

  @override
  String get baggage => 'الأمتعة والحقائب';

  @override
  String get flexibility => 'المرونة';

  @override
  String get otherBenefits => 'مزايا أخرى';

  @override
  String get cabinBaggage => 'حقيبة مقصورة الطائرة';

  @override
  String get checkedBaggage => 'الحقائب المشحونة';

  @override
  String get cancellation => 'الإلغاء والاسترداد';

  @override
  String get changes => 'التغيير والتعديل';

  @override
  String get seatSelection => 'اختيار المقاعد';

  @override
  String get meals => 'الوجبات';

  @override
  String get fareRules => 'قواعد وأحكام التذكرة';

  @override
  String get nonRefundable => 'غير قابلة للاسترداد';

  @override
  String get refundableFeesApply => 'قابلة للاسترداد (تطبق رسوم)';

  @override
  String get freeCancellation => 'استرداد مجاني';

  @override
  String get nonExchangeable => 'غير قابلة للتغيير';

  @override
  String get changesFeesApply => 'تغيير مسموح (تطبق رسوم)';

  @override
  String get freeChanges => 'تغيير مجاني';

  @override
  String get seatSelectionIncluded => 'اختيار المقعد مشمول';

  @override
  String get paidSeatSelection => 'مدفوع / حسب تقدير شركة الطيران';

  @override
  String get mealsIncluded => 'وجبات مشمولة';

  @override
  String get mealsNotIncluded => 'شراء على متن الطائرة / غير مشمولة';

  @override
  String get flexibleConditions => 'شروط مرنة';

  @override
  String get viewRules => 'عرض القواعد والسياسات';

  @override
  String optionsAvailable(int count) {
    return '$count باقات متاحة';
  }

  @override
  String get oneOptionAvailable => 'باقة واحدة متاحة';

  @override
  String get fallbackCabinBag1 => 'حقيبة مقصورة (1 قطعة)';

  @override
  String get fallbackCabinBag2 => 'حقيبة مقصورة (2 قطعة)';

  @override
  String get fallbackCheckedBag1 => 'حقيبة واحدة (1 قطعة)';

  @override
  String get fallbackCheckedBag2 => 'حقيبتين مشحونتين (2 قطعة)';

  @override
  String get recommended => 'موصى به';

  @override
  String get notIncluded => 'غير مشمولة';

  @override
  String get searchingFaresTitle => 'جاري البحث...';

  @override
  String get searchingFaresSubtitle => 'نبحث عن أفضل الأسعار لتواريخك.';

  @override
  String get refreshSearchTitle => 'تحديث البحث';

  @override
  String get refreshSearchMessage =>
      'قد تكون الأسعار قد تغيرت ارتفاعاً أو انخفاضاً، أو قد لا تكون هذه الباقة متاحة بعد الآن. أعد البحث للحصول على العروض الحالية.';

  @override
  String get refreshSearchButton => 'تحديث البحث';

  @override
  String get selectFare => 'اختر السعر';

  @override
  String get details => 'التفاصيل';

  @override
  String get cheapestDirectFlight => 'أرخص رحلة مباشرة';

  @override
  String get bestValuedFlight => 'أفضل قيمة للرحلة';

  @override
  String get tenPercentOff => 'خصم 10%';

  @override
  String get selectFlight => 'اختر الرحلة';

  @override
  String layoverForIn(Object duration, Object city) {
    return 'توقف لمدة $duration في $city';
  }

  @override
  String stops(int count) {
    return '$count توقف(ات)';
  }

  @override
  String get aiAssistantBaggageTitle => 'لديك أي أسئلة حول الأمتعة؟ اسألني!';

  @override
  String get aiQuestion1 =>
      'هل تحتسب حقيبة اليد وحقيبة الكمبيوتر المحمول كحقيبتين داخل المقصورة؟';

  @override
  String get aiQuestion2 => 'ما هو وزن الأمتعة التي يمكنني شحنها؟';

  @override
  String get aiQuestion3 => 'هل سأحتاج إلى إعادة شحن أمتعتي أثناء الانتقال؟';

  @override
  String get askAiAssistant => 'اسأل مساعد الذكاء الاصطناعي';

  @override
  String get bookWithConfidence => 'احجز بثقة مع لوناليزا VIP';

  @override
  String get awardWinning => 'حائز على جوائز';

  @override
  String get supportApprox30s => 'الدعم في حوالي 30 ثانية';

  @override
  String get rewardsForBooking => 'مكافآت على الحجز';

  @override
  String get totalTraveler => 'الإجمالي (مسافر واحد)';

  @override
  String totalTravelers(int count) {
    return 'الإجمالي ($count مسافرين)';
  }

  @override
  String savedAmount(Object amount) {
    return 'وفرت $amount';
  }

  @override
  String get continueLabel => 'متابعة';

  @override
  String get ticketUpgradedViewDetails => 'عرض التفاصيل';

  @override
  String get turkish => 'التركية';

  @override
  String get logoutLabel => 'تسجيل الخروج';

  @override
  String get driverAppTitle => 'لوناليزا كابتن — أسطول الشركاء VIP';

  @override
  String get driverWelcome => 'مرحباً بك';

  @override
  String get driverWorkspace => 'مساحة عمل النقل والجولات اليومية';

  @override
  String get splashHeadline => 'منظومة لوناليزا للنقل الفاخر والجولات السياحية';

  @override
  String get splashTagline =>
      'انضم لأكبر شبكة VIP للشركات والسائقين في تركيا والخليج — استقبال مباشر لرحلات كبار الشخصيات وعمولات مجزية وسحب أرباح فوري.';

  @override
  String get startNow => 'ابدأ الآن';

  @override
  String get goToDashboard => 'الانتقال إلى لوحة التحكم';

  @override
  String get incomingOffers => 'العروض الواردة';

  @override
  String get incomingOffersSub => 'قبول أو رفض خلال نافذة الاستجابة';

  @override
  String get activeTrips => 'الرحلات النشطة';

  @override
  String get activeTripsSub => 'النقل والجولات الجارية';

  @override
  String get activeTrip => 'الرحلة النشطة';

  @override
  String get activeTripSub => 'نشر الموقع أثناء التوجه / على متن المركبة';

  @override
  String get earnings => 'الأرباح';

  @override
  String get earningsSub => 'معدل العمولة والتسوية الأسبوعية';

  @override
  String get payouts => 'المدفوعات';

  @override
  String get payoutsSub => 'المبالغ الأسبوعية والإيصالات';

  @override
  String get fleet => 'أسطولي';

  @override
  String get fleetSub => 'مركباتك والتسعير المخصص';

  @override
  String get catalog => 'دليل الخدمات';

  @override
  String get catalogSub => 'مركبات ونقل وجولات المنصة';

  @override
  String get profile => 'الملف الشخصي';

  @override
  String get profileSub => 'الصورة والمستندات وحالة الموافقة';

  @override
  String get settings => 'الإعدادات';

  @override
  String get settingsSub => 'اللغة والتنبيهات والجلسة';

  @override
  String get vehiclesTab => 'المركبات';

  @override
  String get transfersTab => 'النقل';

  @override
  String get toursTab => 'الجولات';

  @override
  String get addToFleet => 'إضافة للأسطول';

  @override
  String get addVehicle => 'إضافة مركبة';

  @override
  String get customPricing => 'تسعير مخصص';

  @override
  String get savePricing => 'حفظ التسعير';

  @override
  String get fromCatalog => 'اختيار من الدليل';

  @override
  String get newVehicleClass => 'تقديم فئة مركبة جديدة';

  @override
  String get plateNumber => 'رقم اللوحة';

  @override
  String get uploadPhotos => 'رفع صور';

  @override
  String get pendingApproval => 'في انتظار الموافقة';

  @override
  String get pendingApprovalMsg =>
      'حسابك قيد المراجعة. لا يمكنك استلام العروض حتى الموافقة.';

  @override
  String get completeOnboarding => 'إكمال الإعداد';

  @override
  String get onboardingCatalog => 'اختر من دليل المنصة لإضافته لأسطولك';

  @override
  String get onboardingDocuments => 'ارفع مستنداتك للموافقة';

  @override
  String get documents => 'المستندات';

  @override
  String get uploadDocument => 'رفع مستند';

  @override
  String get approvalStatus => 'حالة الموافقة';

  @override
  String get approved => 'موافق عليه';

  @override
  String get pending => 'قيد الانتظار';

  @override
  String get rejected => 'مرفوض';

  @override
  String get completedTrips => 'الرحلات المكتملة';

  @override
  String get rating => 'التقييم';

  @override
  String get platformCommission => 'عمولة المنصة';

  @override
  String get dailyEarnings => 'يومي';

  @override
  String get weeklyEarnings => 'أسبوعي';

  @override
  String get monthlyEarnings => 'شهري';

  @override
  String get byServiceType => 'حسب نوع الخدمة';

  @override
  String get commissionBreakdown => 'تفصيل العمولة';

  @override
  String get downloadVoucher => 'تحميل الإيصال';

  @override
  String get noActiveTrips => 'لا توجد رحلات نشطة';

  @override
  String get noPayouts => 'لا توجد مدفوعات بعد';

  @override
  String get publishLocation => 'نشر الموقع';

  @override
  String get stopTracking => 'إيقاف التتبع';

  @override
  String get tripStatus => 'حالة الرحلة';

  @override
  String get enRoute => 'في الطريق';

  @override
  String get arrived => 'وصل';

  @override
  String get onboard => 'على متن المركبة';

  @override
  String get completed => 'مكتمل';

  @override
  String get registerTitle => 'تسجيل السائق';

  @override
  String get submitForApproval => 'إرسال للموافقة';

  @override
  String get accountDetails => 'معلومات الحساب';

  @override
  String get payoutDetails => 'تفاصيل الدفع';

  @override
  String get accountHolder => 'صاحب الحساب';

  @override
  String get bankName => 'اسم البنك';

  @override
  String get savePayout => 'حفظ تفاصيل الدفع';

  @override
  String get payoutSaved => 'تم حفظ تفاصيل الدفع';

  @override
  String get notificationsComingSoon => 'تفضيلات التنبيهات قريباً';

  @override
  String get tenantCodeLabel => 'كود الوكالة';

  @override
  String get tenantCodeHint => 'مثال: alrayyan';

  @override
  String get tenantCodeRequired => 'كود الوكالة مطلوب';

  @override
  String get emailLabel => 'البريد الإلكتروني';

  @override
  String get emailInvalid => 'أدخل بريداً إلكترونياً صالحاً';

  @override
  String get passwordLabel => 'كلمة المرور';

  @override
  String get passwordMinLength => 'كلمة المرور 8 أحرف على الأقل';

  @override
  String get registerNewSupplier => 'التسجيل كمورد جديد';

  @override
  String get selectVehicleClass => 'اختر فئة المركبة';

  @override
  String get vehicleCodeLabel => 'رمز المركبة';

  @override
  String get capacityLabel => 'سعة الركاب';

  @override
  String get routePricingHint => 'حدّد أسعار المسارات من تسعير المسارات';

  @override
  String get routePricingTitle => 'تسعير المسارات';

  @override
  String get tourOffersTitle => 'عروض الجولات';

  @override
  String get transferPriceLabel => 'سعر النقل';

  @override
  String get tourPriceLabel => 'سعر الجولة';

  @override
  String get continueWithLogin => 'مسجل مسبقاً؟ سجّل الدخول';

  @override
  String get pushNotificationsHint =>
      'استلم تنبيهات الرحلات والمدفوعات عند تفعيل الإشعارات';

  @override
  String get pushNotificationsEnabled => 'تم تفعيل الإشعارات';

  @override
  String get pushNotificationsDisabled => 'تم إيقاف الإشعارات';

  @override
  String get subDriversTitle => 'السائقون الفرعيون';

  @override
  String get subDriversSub => 'إدارة السائقين ضمن حساب الشركة';

  @override
  String get addSubDriver => 'إضافة سائق فرعي';

  @override
  String get subDriverName => 'اسم السائق';

  @override
  String get subDriverPhone => 'رقم الهاتف';

  @override
  String get subDriverLicense => 'رقم الرخصة';

  @override
  String get subDriversEmpty => 'لا يوجد سائقون فرعيون بعد';

  @override
  String get subDriversCompanyOnly =>
      'السائقون الفرعيون متاحون لحسابات الشركات فقط';

  @override
  String get registerStepAccount => 'الحساب';

  @override
  String get registerStepPayout => 'الدفع';

  @override
  String get registerStepDocuments => 'المستندات';

  @override
  String get registerStepReview => 'المراجعة';

  @override
  String get registerNext => 'التالي';

  @override
  String get registerBack => 'رجوع';

  @override
  String get registerDocumentsHint =>
      'ارفع الرخصة أو مستندات الشركة (اختياري — يمكنك الإضافة لاحقاً)';

  @override
  String get registerReviewHint => 'راجع بياناتك قبل إرسال طلب الموافقة';

  @override
  String get registerTradeName => 'الاسم التجاري';

  @override
  String get registerPhone => 'الهاتف';

  @override
  String get registerDriverCount => 'عدد السائقين';

  @override
  String get registerAcceptCommission => 'أوافق على عمولة المنصة';

  @override
  String get registerDocAdded => 'تمت إضافة المستند';

  @override
  String get registerPickDocument => 'إضافة مستند';

  @override
  String get offlineCatalogCache => 'عرض الكتالوج المخزّن — جاري التحديث…';

  @override
  String get platformLabel => 'منصة لوناليزا العالمية';

  @override
  String get platformDriverOnlyHint =>
      'بوابة الشركاء والسائقين المعتمدين — تدار عبر منصة لوناليزا الرسمية (lonaliza.com)';

  @override
  String get dashboardTitle => 'لوحة التحكم';

  @override
  String get menuTitle => 'القائمة';

  @override
  String get statActiveTrips => 'رحلات نشطة';

  @override
  String get statPendingOffers => 'عروض معلّقة';

  @override
  String get statFleet => 'مركبات الأسطول';

  @override
  String get statCompleted => 'مكتملة';

  @override
  String get statTotalBookings => 'إجمالي الحجوزات';

  @override
  String get statEarnings => 'صافي الأرباح';

  @override
  String get statDrivers => 'سائقو الشركة';

  @override
  String get nextBooking => 'أقرب حجز';

  @override
  String get liveBookings => 'حجوزات حية الآن';

  @override
  String get noUpcomingBooking => 'لا توجد حجوزات قادمة';

  @override
  String bookingReminder(int hours) {
    return 'رحلة قادمة خلال $hours ساعات';
  }

  @override
  String get vehicleNameEn => 'اسم المركبة (إنجليزي)';

  @override
  String get vehicleNameAr => 'اسم المركبة (عربي)';

  @override
  String get vehicleNameTr => 'اسم المركبة (تركي)';

  @override
  String get bookingReminderNotificationTitle => 'تذكير بحجز قادم';

  @override
  String bookingReminderNotificationBody(String reference, int hours) {
    return 'الحجز $reference يبدأ خلال $hours ساعات';
  }

  @override
  String get liveMap => 'الخريطة المباشرة للأسطول';

  @override
  String get liveMapSub => 'تتبع المركبات والسائقين على الخريطة بشكل حي';

  @override
  String get quoteRequests => 'طلبات عروض الأسعار';

  @override
  String get quoteRequestsSub => 'تقديم عروض الأسعار للعملاء والشركات';

  @override
  String get reviewsAndRatings => 'التقييمات والآراء';

  @override
  String get reviewsAndRatingsSub => 'تقييمات المسافرين وجودة الخدمة';

  @override
  String get aiTourCreator => 'تصميم جولة ذكية';

  @override
  String get aiTourCreatorSub => 'إنشاء برامج سياحية بالذكاء الاصطناعي';

  @override
  String get flightRadar => 'رادار الطيران الحي';

  @override
  String get welcomeSign => 'لوحة الاستقبال VIP';
}
