// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Turkish (`tr`).
class AppLocalizationsTr extends AppLocalizations {
  AppLocalizationsTr([String locale = 'tr']) : super(locale);

  @override
  String get appTitle => 'Lonaliza Kaptan';

  @override
  String get settingsTitle => 'Ayarlar';

  @override
  String get languageLabel => 'Dil';

  @override
  String get english => 'İngilizce';

  @override
  String get arabic => 'Arapça';

  @override
  String get countryLabel => 'Ülke veya Bölge';

  @override
  String get currencyLabel => 'Para Birimi';

  @override
  String get unitsLabel => 'Birimler';

  @override
  String get temperatureLabel => 'Sıcaklık Ölçeği';

  @override
  String get timeFormatLabel => 'Saat Formatı';

  @override
  String get manageAccountLabel => 'Hesabımı Yönet';

  @override
  String get scanQrLabel => 'QR Kodu Tara';

  @override
  String get darkThemeLabel => 'Karanlık Tema';

  @override
  String get notificationsLabel => 'Bildirimler';

  @override
  String get tripGenieLabel => 'TripGenie';

  @override
  String get accessibilityLabel => 'Erişilebilirlik';

  @override
  String get termsLabel => 'Kullanım Koşulları';

  @override
  String get privacyLabel => 'Gizlilik Bildirimi';

  @override
  String get flights => 'Uçuşlar';

  @override
  String get oneWay => 'Tek Yön';

  @override
  String get roundTrip => 'Gidiş-Dönüş';

  @override
  String get multiCity => 'Çoklu Şehir';

  @override
  String get whereFrom => 'Nereden?';

  @override
  String get whereTo => 'Nereye?';

  @override
  String get selectDate => 'Tarih Seçin';

  @override
  String get selectDates => 'Tarihleri Seçin';

  @override
  String get addAnotherFlight => 'Başka bir uçuş ekle';

  @override
  String get adults => 'Yetişkinler';

  @override
  String get children => 'Çocuklar';

  @override
  String get infants => 'Bebekler';

  @override
  String get cabinEconomy => 'Ekonomi';

  @override
  String get cabinPremiumEconomy => 'Premium Ekonomi';

  @override
  String get cabinBusiness => 'Business';

  @override
  String get cabinFirst => 'First Class';

  @override
  String get search => 'Ara';

  @override
  String get searchHint => 'Bir varış noktası veya tesis girin';

  @override
  String get currentLocation => 'Mevcut Konum';

  @override
  String get clear => 'Temizle';

  @override
  String get recentSearches => 'Son Aramalar';

  @override
  String get popularDestinations => 'Popüler Rotalar';

  @override
  String get typeMinChars => 'En az 3 karakter girin';

  @override
  String noMatches(Object query) {
    return '\"$query\" için sonuç bulunamadı';
  }

  @override
  String get searchFooter =>
      'Aradığınızı bulamadınız mı? Ülke veya bölge ekleyerek daha belirgin bir arama yapmayı deneyin.';

  @override
  String get passengersTitle => 'Yolcular';

  @override
  String get adultsSub => '12+ yaş';

  @override
  String get childrenSub => '2-11 yaş';

  @override
  String get infantsSub => '2 yaş altı';

  @override
  String get passengersNotice =>
      'Fiyatlar kişi başı ortalama (vergiler dahil) olarak gösterilmektedir. Yolcu türüne göre değişebilir';

  @override
  String get bookingInstructions => 'Çocuk ve bebek rezervasyon talimatları';

  @override
  String get confirm => 'Onayla';

  @override
  String get retry => 'Tekrar dene';

  @override
  String get errorNetwork =>
      'İnternet bağlantınızı kontrol edip tekrar deneyin.';

  @override
  String get errorServer => 'Arama servisi geçici olarak kullanılamıyor.';

  @override
  String get errorGeneric =>
      'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';

  @override
  String get errorNotFound => 'İstenen kaynak bulunamadı.';

  @override
  String get login => 'Giriş Yap';

  @override
  String get loginRequired => 'Devam etmek için lütfen giriş yapın.';

  @override
  String flightNumber(Object number) {
    return 'Uçuş $number';
  }

  @override
  String get pleaseSelectOrigin => 'Lütfen kalkış şehrini seçin';

  @override
  String get pleaseSelectDestination => 'Lütfen varış şehrini seçin';

  @override
  String get atLeastOneAdult => 'En az bir yetişkin seçilmelidir';

  @override
  String get dateMustBeAfterPrevious => 'Tarih önceki uçuştan sonra olmalıdır';

  @override
  String get noFlightsAvailable => 'Bu tarih için uçuş bulunamadı';

  @override
  String showMoreFlights(int count) {
    return 'Daha fazla göster ($count uçuş)';
  }

  @override
  String get flightOutbound => 'GİDİŞ';

  @override
  String get flightInbound => 'DÖNÜŞ';

  @override
  String get flightNonstop => 'Aktarmasız';

  @override
  String flightStop(int count) {
    return '$count aktarma';
  }

  @override
  String flightStops(int count) {
    return '$count aktarma';
  }

  @override
  String flightStopVia(int count, Object code) {
    return '$code üzerinden $count aktarma';
  }

  @override
  String flightLayover(Object duration, Object code) {
    return '$code havalimanında $duration bekleme';
  }

  @override
  String flightTerminal(Object terminal) {
    return 'Terminal $terminal';
  }

  @override
  String get flightEconomy => 'Ekonomi';

  @override
  String get farePackages => 'ÜCRET PAKETLERİ';

  @override
  String get compareInclusions => 'Dahil olan hizmetleri aşağıda karşılaştırın';

  @override
  String get continueWithThisFare => 'Bu ücretle devam et';

  @override
  String get baggage => 'BAGAJ';

  @override
  String get flexibility => 'ESNEKLİK';

  @override
  String get otherBenefits => 'DİĞER AVANTAJLAR';

  @override
  String get cabinBaggage => 'KABİN BAGAJI';

  @override
  String get checkedBaggage => 'KAYITLI BAGAJ';

  @override
  String get cancellation => 'İPTAL';

  @override
  String get changes => 'DEĞİŞİKLİK';

  @override
  String get seatSelection => 'KOLTUK SEÇİMİ';

  @override
  String get meals => 'YEMEK';

  @override
  String get fareRules => 'ÜCRET KURALLARI';

  @override
  String get nonRefundable => 'İade edilemez';

  @override
  String get refundableFeesApply => 'İade edilebilir (ücret kesilebilir)';

  @override
  String get freeCancellation => 'Ücretsiz iptal';

  @override
  String get nonExchangeable => 'Değiştirilemez';

  @override
  String get changesFeesApply => 'Değişiklik yapılabilir (ücret kesilebilir)';

  @override
  String get freeChanges => 'Ücretsiz değişiklik';

  @override
  String get seatSelectionIncluded => 'Koltuk seçimi dahil';

  @override
  String get paidSeatSelection => 'Ücretli / havayolu takdirine bağlı';

  @override
  String get mealsIncluded => 'Yemek dahil';

  @override
  String get mealsNotIncluded => 'Uçakta satın alınabilir / dahil değil';

  @override
  String get flexibleConditions => 'Esnek koşullar';

  @override
  String get viewRules => 'Kuralları görüntüle';

  @override
  String optionsAvailable(int count) {
    return '$count seçenek mevcut';
  }

  @override
  String get oneOptionAvailable => '1 seçenek mevcut';

  @override
  String get fallbackCabinBag1 => '1 parça';

  @override
  String get fallbackCabinBag2 => '2 parça';

  @override
  String get fallbackCheckedBag1 => '1 parça';

  @override
  String get fallbackCheckedBag2 => '2 parça';

  @override
  String get recommended => 'ÖNERİLEN';

  @override
  String get notIncluded => 'Dahil değil';

  @override
  String get searchingFaresTitle => 'Aranıyor...';

  @override
  String get searchingFaresSubtitle =>
      'Tarihleriniz için en uygun fiyatlar bulunuyor.';

  @override
  String get refreshSearchTitle => 'Aramayı Yenile';

  @override
  String get refreshSearchMessage =>
      'Fiyatlar değişmiş olabilir veya bu ücret paketi artık geçerli olmayabilir. Güncel teklifler için lütfen aramayı yenileyin.';

  @override
  String get refreshSearchButton => 'Aramayı Yenile';

  @override
  String get selectFare => 'Ücret Seç';

  @override
  String get details => 'Detaylar';

  @override
  String get cheapestDirectFlight => 'EN UCUZ DİREKT UÇUŞ';

  @override
  String get bestValuedFlight => 'EN AVANTAJLI UÇUŞ';

  @override
  String get tenPercentOff => '%10 İndirim';

  @override
  String get selectFlight => 'UÇUŞ SEÇ';

  @override
  String layoverForIn(Object duration, Object city) {
    return '$city şehrinde $duration aktarma';
  }

  @override
  String stops(int count) {
    return '$count aktarma';
  }

  @override
  String get aiAssistantBaggageTitle =>
      'Bagajla ilgili sorunuz mu var? Bana sorun!';

  @override
  String get aiQuestion1 =>
      'El çantam ve laptop çantam iki kabin bagajı sayılır mı?';

  @override
  String get aiQuestion2 => 'Uçağa ne kadar kayıtlı bagaj verebilirim?';

  @override
  String get aiQuestion3 =>
      'Aktarma sırasında bagajımı tekrar teslim almam gerekecek mi?';

  @override
  String get askAiAssistant => 'Yapay Zeka Asistanına Sorun';

  @override
  String get bookWithConfidence => 'Lonaliza ile güvenle rezervasyon yapın';

  @override
  String get awardWinning => 'Ödüllü Hizmet';

  @override
  String get supportApprox30s => 'Yaklaşık 30 saniyede destek';

  @override
  String get rewardsForBooking => 'Rezervasyon ödülleri';

  @override
  String get totalTraveler => 'Toplam (1 yolcu)';

  @override
  String totalTravelers(int count) {
    return 'Toplam ($count yolcu)';
  }

  @override
  String savedAmount(Object amount) {
    return '$amount tasarruf ettiniz';
  }

  @override
  String get continueLabel => 'Devam Et';

  @override
  String get ticketUpgradedViewDetails => 'Detayları Görüntüle';

  @override
  String get turkish => 'Türkçe';

  @override
  String get logoutLabel => 'Çıkış yap';

  @override
  String get driverAppTitle => 'Lonaliza Kaptan — VIP Filo';

  @override
  String get driverWelcome => 'Tekrar hoş geldiniz';

  @override
  String get driverWorkspace => 'Transfer ve günlük tur alanı';

  @override
  String get splashHeadline => 'Lonaliza VIP Şoför ve Filo Platformu';

  @override
  String get splashTagline =>
      'Türkiye ve Körfez\'in lider VIP transfer ağına katılın — premium sürüşler, anında kazanç ve kurumsal iş ortaklığı.';

  @override
  String get startNow => 'Hemen başla';

  @override
  String get goToDashboard => 'Panele git';

  @override
  String get incomingOffers => 'Gelen teklifler';

  @override
  String get incomingOffersSub => 'Yanıt süresi içinde kabul veya red';

  @override
  String get activeTrips => 'Aktif yolculuklar';

  @override
  String get activeTripsSub => 'Devam eden transferler ve turlar';

  @override
  String get activeTrip => 'Aktif yolculuk';

  @override
  String get activeTripSub => 'Yoldayken konum paylaş';

  @override
  String get earnings => 'Kazançlar';

  @override
  String get earningsSub => 'Komisyon oranı ve haftalık ödeme';

  @override
  String get payouts => 'Ödemeler';

  @override
  String get payoutsSub => 'Haftalık alınan tutarlar ve makbuzlar';

  @override
  String get fleet => 'Filom';

  @override
  String get fleetSub => 'Araçlarınız ve fiyatlandırma';

  @override
  String get catalog => 'Katalog';

  @override
  String get catalogSub => 'Platform araç, transfer ve tur seçenekleri';

  @override
  String get profile => 'Profil';

  @override
  String get profileSub => 'Fotoğraf, belgeler ve onay durumu';

  @override
  String get settings => 'Ayarlar';

  @override
  String get settingsSub => 'Dil, bildirimler ve oturum';

  @override
  String get vehiclesTab => 'Araçlar';

  @override
  String get transfersTab => 'Transferler';

  @override
  String get toursTab => 'Turlar';

  @override
  String get addToFleet => 'Filoya ekle';

  @override
  String get addVehicle => 'Araç ekle';

  @override
  String get customPricing => 'Özel fiyat';

  @override
  String get savePricing => 'Fiyatı kaydet';

  @override
  String get fromCatalog => 'Katalogdan seç';

  @override
  String get newVehicleClass => 'Yeni araç sınıfı gönder';

  @override
  String get plateNumber => 'Plaka';

  @override
  String get uploadPhotos => 'Fotoğraf yükle';

  @override
  String get pendingApproval => 'Onay bekleniyor';

  @override
  String get pendingApprovalMsg =>
      'Hesabınız inceleniyor. Onaylanana kadar teklif alamazsınız.';

  @override
  String get completeOnboarding => 'Kurulumu tamamla';

  @override
  String get onboardingCatalog => 'Filoya eklemek için katalogdan seçin';

  @override
  String get onboardingDocuments => 'Onay için belgelerinizi yükleyin';

  @override
  String get documents => 'Belgeler';

  @override
  String get uploadDocument => 'Belge yükle';

  @override
  String get approvalStatus => 'Onay durumu';

  @override
  String get approved => 'Onaylandı';

  @override
  String get pending => 'Beklemede';

  @override
  String get rejected => 'Reddedildi';

  @override
  String get completedTrips => 'Tamamlanan yolculuklar';

  @override
  String get rating => 'Puan';

  @override
  String get platformCommission => 'Platform komisyonu';

  @override
  String get dailyEarnings => 'Günlük';

  @override
  String get weeklyEarnings => 'Haftalık';

  @override
  String get monthlyEarnings => 'Aylık';

  @override
  String get byServiceType => 'Hizmet türüne göre';

  @override
  String get commissionBreakdown => 'Komisyon dökümü';

  @override
  String get downloadVoucher => 'Makbuzu indir';

  @override
  String get noActiveTrips => 'Aktif yolculuk yok';

  @override
  String get noPayouts => 'Henüz ödeme yok';

  @override
  String get publishLocation => 'Konumu paylaş';

  @override
  String get stopTracking => 'Takibi durdur';

  @override
  String get tripStatus => 'Yolculuk durumu';

  @override
  String get enRoute => 'Yolda';

  @override
  String get arrived => 'Varıldı';

  @override
  String get onboard => 'Yolcu alındı';

  @override
  String get completed => 'Tamamlandı';

  @override
  String get registerTitle => 'Sürücü kaydı';

  @override
  String get submitForApproval => 'Onaya gönder';

  @override
  String get accountDetails => 'Hesap bilgileri';

  @override
  String get payoutDetails => 'Ödeme bilgileri';

  @override
  String get accountHolder => 'Hesap sahibi';

  @override
  String get bankName => 'Banka adı';

  @override
  String get savePayout => 'Ödeme bilgilerini kaydet';

  @override
  String get payoutSaved => 'Ödeme bilgileri kaydedildi';

  @override
  String get notificationsComingSoon => 'Bildirim tercihleri yakında eklenecek';

  @override
  String get tenantCodeLabel => 'Acente kodu';

  @override
  String get tenantCodeHint => 'örn. alrayyan';

  @override
  String get tenantCodeRequired => 'Acente kodu gerekli';

  @override
  String get emailLabel => 'E-posta';

  @override
  String get emailInvalid => 'Geçerli bir e-posta girin';

  @override
  String get passwordLabel => 'Şifre';

  @override
  String get passwordMinLength => 'Şifre en az 8 karakter olmalı';

  @override
  String get registerNewSupplier => 'Yeni tedarikçi olarak kaydol';

  @override
  String get selectVehicleClass => 'Araç sınıfı seçin';

  @override
  String get vehicleCodeLabel => 'Araç kodu';

  @override
  String get capacityLabel => 'Yolcu kapasitesi';

  @override
  String get routePricingHint =>
      'Rota fiyatlarını Rota fiyatlandırmasından ayarlayın';

  @override
  String get routePricingTitle => 'Rota fiyatlandırması';

  @override
  String get tourOffersTitle => 'Tur teklifleri';

  @override
  String get transferPriceLabel => 'Transfer fiyatı';

  @override
  String get tourPriceLabel => 'Tur fiyatı';

  @override
  String get continueWithLogin => 'Zaten kayıtlı mısınız? Giriş yapın';

  @override
  String get pushNotificationsHint =>
      'Seyahat ve ödeme uyarılarını almak için etkinleştirin';

  @override
  String get pushNotificationsEnabled => 'Anlık bildirimler etkin';

  @override
  String get pushNotificationsDisabled => 'Anlık bildirimler kapalı';

  @override
  String get subDriversTitle => 'Alt sürücüler';

  @override
  String get subDriversSub => 'Şirket hesabınızdaki sürücüleri yönetin';

  @override
  String get addSubDriver => 'Alt sürücü ekle';

  @override
  String get subDriverName => 'Sürücü adı';

  @override
  String get subDriverPhone => 'Telefon';

  @override
  String get subDriverLicense => 'Ehliyet numarası';

  @override
  String get subDriversEmpty => 'Henüz alt sürücü yok';

  @override
  String get subDriversCompanyOnly =>
      'Alt sürücüler yalnızca şirket hesapları için';

  @override
  String get registerStepAccount => 'Hesap';

  @override
  String get registerStepPayout => 'Ödeme';

  @override
  String get registerStepDocuments => 'Belgeler';

  @override
  String get registerStepReview => 'Özet';

  @override
  String get registerNext => 'İleri';

  @override
  String get registerBack => 'Geri';

  @override
  String get registerDocumentsHint =>
      'Ehliyet veya şirket belgelerini yükleyin (isteğe bağlı)';

  @override
  String get registerReviewHint =>
      'Onaya göndermeden önce bilgilerinizi kontrol edin';

  @override
  String get registerTradeName => 'Ticari unvan';

  @override
  String get registerPhone => 'Telefon';

  @override
  String get registerDriverCount => 'Sürücü sayısı';

  @override
  String get registerAcceptCommission => 'Platform komisyonunu kabul ediyorum';

  @override
  String get registerDocAdded => 'Belge eklendi';

  @override
  String get registerPickDocument => 'Belge ekle';

  @override
  String get offlineCatalogCache =>
      'Önbellekteki katalog gösteriliyor — yenileniyor…';

  @override
  String get platformLabel => 'Lonaliza Küresel Platformu';

  @override
  String get platformDriverOnlyHint =>
      'Yalnızca resmi Lonaliza sürücüleri ve lisanslı iş ortakları — lonaliza.com';

  @override
  String get dashboardTitle => 'Kontrol paneli';

  @override
  String get menuTitle => 'Menü';

  @override
  String get statActiveTrips => 'Aktif seferler';

  @override
  String get statPendingOffers => 'Bekleyen teklifler';

  @override
  String get statFleet => 'Filo araçları';

  @override
  String get statCompleted => 'Tamamlanan';

  @override
  String get statTotalBookings => 'Toplam rezervasyon';

  @override
  String get statEarnings => 'Net kazanç';

  @override
  String get statDrivers => 'Şirket sürücüleri';

  @override
  String get nextBooking => 'Sonraki rezervasyon';

  @override
  String get liveBookings => 'Canlı rezervasyonlar';

  @override
  String get noUpcomingBooking => 'Yaklaşan rezervasyon yok';

  @override
  String bookingReminder(int hours) {
    return 'Yaklaşan sefer $hours saat içinde';
  }

  @override
  String get vehicleNameEn => 'Araç adı (İngilizce)';

  @override
  String get vehicleNameAr => 'Araç adı (Arapça)';

  @override
  String get vehicleNameTr => 'Araç adı (Türkçe)';

  @override
  String get bookingReminderNotificationTitle => 'Yaklaşan sefer hatırlatması';

  @override
  String bookingReminderNotificationBody(String reference, int hours) {
    return '$reference rezervasyonu $hours saat içinde başlıyor';
  }

  @override
  String get liveMap => 'Canlı Filo Haritası';

  @override
  String get liveMapSub =>
      'Araçları ve sürücüleri harita üzerinde canlı takip edin';

  @override
  String get quoteRequests => 'Teklif Talepleri';

  @override
  String get quoteRequestsSub =>
      'Müşterilere ve acentelere fiyat teklifleri verin';

  @override
  String get reviewsAndRatings => 'Değerlendirmeler ve Yorumlar';

  @override
  String get reviewsAndRatingsSub =>
      'Yolcu puanları ve hizmet kalitesi değerlendirmeleri';

  @override
  String get aiTourCreator => 'Yapay Zeka Tur Tasarımı';

  @override
  String get aiTourCreatorSub =>
      'Yapay zeka desteğiyle tam tur programı oluşturun';

  @override
  String get flightRadar => 'Canlı Uçuş Radarı';

  @override
  String get welcomeSign => 'VIP Karşılama Tabelası';
}
