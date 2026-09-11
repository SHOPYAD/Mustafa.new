// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appTitle => 'لوناليزا';

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
  String get bookWithConfidence => 'احجز بثقة على لوناليزا';

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
}
