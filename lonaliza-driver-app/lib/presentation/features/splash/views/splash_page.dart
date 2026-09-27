import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../providers/app_locale_provider.dart';
import '../../../providers/driver_session_provider.dart';

/// Professional interactive enterprise onboarding splash for Lonaliza VIP Captain & Fleet
class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _OnboardingFeature {
  final IconData icon;
  final String titleAr;
  final String titleEn;
  final String titleTr;
  final String descAr;
  final String descEn;
  final String descTr;
  final String badgeAr;
  final String badgeEn;
  final String badgeTr;
  final Color accentColor;

  const _OnboardingFeature({
    required this.icon,
    required this.titleAr,
    required this.titleEn,
    required this.titleTr,
    required this.descAr,
    required this.descEn,
    required this.descTr,
    required this.badgeAr,
    required this.badgeEn,
    required this.badgeTr,
    required this.accentColor,
  });
}

const List<_OnboardingFeature> _kFeatures = [
  _OnboardingFeature(
    icon: Icons.airport_shuttle_rounded,
    titleAr: 'شبكة كبار الشخصيات VIP',
    titleEn: 'VIP Chauffeur & Fleet Network',
    titleTr: 'VIP Şoför ve Filo Ağı',
    descAr:
        'استقبل طلبات النقل الفاخر والجولات السياحية لكبار الشخصيات مباشرة من مطارات إسطنبول، أنطاليا، طرابزون وبورصة بأعلى المعايير.',
    descEn:
        'Receive premium executive transfers and curated private daily tours across Istanbul, Antalya, Trabzon, and Bursa airports.',
    descTr:
        'İstanbul, Antalya, Trabzon ve Bursa havalimanlarından VIP transfer ve günlük tur taleplerini doğrudan alın.',
    badgeAr: 'أكثر من 15,000 رحلة شهرياً',
    badgeEn: '15,000+ Monthly VIP Rides',
    badgeTr: 'Aylık 15.000+ VIP Sefer',
    accentColor: Color(0xFFD97706),
  ),
  _OnboardingFeature(
    icon: Icons.auto_awesome_rounded,
    titleAr: 'وكيل الذكاء الاصطناعي للأسطول',
    titleEn: 'AI Fleet Copilot',
    titleTr: 'Yapay Zeka Filo Asistanı',
    descAr:
        'ارفع صور سيارتك أو اشرح مواصفاتها صوتياً، وسيقوم الذكاء الاصطناعي باستخراج المواصفات ونشرها في الكتالوج العالمي فوراً.',
    descEn:
        'Upload car photos or use voice description. Our AI extracts full specs, luxury amenities, and publishes to the global catalog.',
    descTr:
        'Araç fotoğraflarını yükleyin veya sesli anlatın; yapay zeka tüm donanımları çıkarıp küresel kataloğa anında eklesin.',
    badgeAr: 'فحص ونشر تلقائي بالذكاء الاصطناعي',
    badgeEn: 'Instant AI Vehicle Onboarding',
    badgeTr: 'Yapay Zeka ile Anında Araç Kaydı',
    accentColor: Color(0xFF7C3AED),
  ),
  _OnboardingFeature(
    icon: Icons.account_balance_wallet_rounded,
    titleAr: 'أعلى أرباح وسحب فوري',
    titleEn: 'Maximized Payouts & Fair Margins',
    titleTr: 'Yüksek Kazanç ve Hızlı Ödeme',
    descAr:
        'عمولة منصة منافسة، أرباح شفافة لكل رحلة مع تفاصيل الدخل، وتحويلات بنكية منتظمة وسريعة لحسابك البنكي أو الـ IBAN.',
    descEn:
        'Competitive platform commission, transparent net ride earnings, and automated weekly bank payouts directly to your IBAN.',
    descTr:
        'Rekabetçi komisyon oranları, şeffaf net kazanç dökümü ve IBAN hesabınıza düzenli haftalık ödemeler.',
    badgeAr: 'تحصيل فوري وأرباح أسبوعية',
    badgeEn: 'Weekly Guaranteed Payouts',
    badgeTr: 'Haftalık Garantili Ödeme',
    accentColor: Color(0xFF059669),
  ),
  _OnboardingFeature(
    icon: Icons.business_center_rounded,
    titleAr: 'إدارة أساطيل الشركات والسائقين',
    titleEn: 'Enterprise Fleet & Sub-Drivers',
    titleTr: 'Kurumsal Filo ve Sürücü Yönetimi',
    descAr:
        'لوحة متكاملة لشركات النقل: إضافة عدد غير محدود من السيارات، تعيين السائقين، وتتبع موقع المركبات اللحظي أثناء الرحلات.',
    descEn:
        'Complete corporate console: onboard multiple luxury vans, assign drivers, and monitor real-time telemetry dispatch.',
    descTr:
        'Taşıma şirketleri için tam kontrol paneli: sınırsız araç ekleme, şoför atama ve anlık canlı konum takibi.',
    badgeAr: 'منظومة متكاملة للشركات',
    badgeEn: 'Corporate Fleet Console',
    badgeTr: 'Kurumsal Filo Çözümü',
    accentColor: Color(0xFF2563EB),
  ),
];

class _SplashPageState extends ConsumerState<SplashPage>
    with SingleTickerProviderStateMixin {
  static const _logoAsset = 'assets/logo/logo.png';

  late final PageController _pageController;
  int _currentPage = 0;
  Timer? _autoSlideTimer;

  late final AnimationController _animController;
  late final Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _fade = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();

    _startAutoSlide();
  }

  void _startAutoSlide() {
    _autoSlideTimer?.cancel();
    _autoSlideTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (!mounted) return;
      final nextPage = (_currentPage + 1) % _kFeatures.length;
      _pageController.animateToPage(
        nextPage,
        duration: const Duration(milliseconds: 450),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _autoSlideTimer?.cancel();
    _pageController.dispose();
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final session = ref.watch(driverSessionProvider);
    final locale = ref.watch(appLocaleNotifierProvider);
    final langCode = locale.languageCode;
    final isAr = langCode == 'ar';
    final bottomInset = MediaQuery.paddingOf(context).bottom;

    return Scaffold(
      backgroundColor: const Color(0xFF0C071E),
      body: Stack(
        children: [
          // Ambient luxury background glows
          Positioned(
            top: -100,
            right: -80,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF7C3AED).withValues(alpha: 0.28),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 160,
            left: -80,
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFFD97706).withValues(alpha: 0.18),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          SafeArea(
            child: FadeTransition(
              opacity: _fade,
              child: Column(
                children: [
                  // Top Navigation Bar: Brand Badge & Language Selector
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Official platform pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.15),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 7,
                                height: 7,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF10B981),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                isAr ? 'منظومة لوناليزا VIP' : 'Lonaliza VIP Fleet',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Language Switcher
                        Container(
                          padding: const EdgeInsets.all(3),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.12),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              _LangChip(
                                label: 'EN',
                                selected: langCode == 'en',
                                onTap: () => ref
                                    .read(appLocaleNotifierProvider.notifier)
                                    .setLocale(const Locale('en')),
                              ),
                              _LangChip(
                                label: 'العربية',
                                selected: langCode == 'ar',
                                onTap: () => ref
                                    .read(appLocaleNotifierProvider.notifier)
                                    .setLocale(const Locale('ar')),
                              ),
                              _LangChip(
                                label: 'TR',
                                selected: langCode == 'tr',
                                onTap: () => ref
                                    .read(appLocaleNotifierProvider.notifier)
                                    .setLocale(const Locale('tr')),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 10),

                  // Brand Logo Showcase Card
                  Container(
                    width: 90,
                    height: 90,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(28),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF7C3AED).withValues(alpha: 0.35),
                          blurRadius: 30,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Image.asset(
                      _logoAsset,
                      fit: BoxFit.contain,
                    ),
                  ),

                  const SizedBox(height: 14),

                  // Main App Headline
                  Text(
                    l10n.driverAppTitle,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isAr
                        ? 'تطبيق الشركاء والشركات وأصحاب الأساطيل الفاخرة'
                        : 'Official Executive Chauffeur & Fleet Partner Network',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.65),
                      fontSize: 12,
                    ),
                  ),

                  // Interactive Feature Slider (PageView)
                  Expanded(
                    child: PageView.builder(
                      controller: _pageController,
                      onPageChanged: (idx) {
                        setState(() => _currentPage = idx);
                        _startAutoSlide();
                      },
                      itemCount: _kFeatures.length,
                      itemBuilder: (context, index) {
                        final feat = _kFeatures[index];
                        final title = isAr
                            ? feat.titleAr
                            : (langCode == 'tr' ? feat.titleTr : feat.titleEn);
                        final desc = isAr
                            ? feat.descAr
                            : (langCode == 'tr' ? feat.descTr : feat.descEn);
                        final badge = isAr
                            ? feat.badgeAr
                            : (langCode == 'tr' ? feat.badgeTr : feat.badgeEn);

                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          child: Container(
                            padding: const EdgeInsets.all(22),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.05),
                              borderRadius: BorderRadius.circular(30),
                              border: Border.all(
                                color: feat.accentColor.withValues(alpha: 0.4),
                                width: 1.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: feat.accentColor.withValues(alpha: 0.12),
                                  blurRadius: 24,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                // Feature Icon with glow
                                Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    color: feat.accentColor.withValues(alpha: 0.18),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(
                                      color: feat.accentColor.withValues(alpha: 0.5),
                                    ),
                                  ),
                                  child: Icon(
                                    feat.icon,
                                    size: 32,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 14),

                                // Badge
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: feat.accentColor.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: Text(
                                    badge,
                                    style: TextStyle(
                                      color: feat.accentColor,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),

                                // Title
                                Text(
                                  title,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                const SizedBox(height: 8),

                                // Description
                                Text(
                                  desc,
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.78),
                                    fontSize: 13,
                                    height: 1.45,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  // Carousel Indicators (Dots)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_kFeatures.length, (i) {
                      final isActive = i == _currentPage;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: isActive ? 24 : 8,
                        height: 7,
                        decoration: BoxDecoration(
                          color: isActive
                              ? const Color(0xFFD97706)
                              : Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                      );
                    }),
                  ),

                  const SizedBox(height: 20),

                  // Action Buttons (Gold Primary & Purple Secondary)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      children: [
                        // Primary CTA: Register
                        Container(
                          width: double.infinity,
                          height: 52,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFF59E0B), Color(0xFFD97706), Color(0xFFB45309)],
                            ),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFD97706).withValues(alpha: 0.45),
                                blurRadius: 18,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: () => context.go('/register'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.stars_rounded, color: Colors.black, size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  isAr ? 'انضم الآن كشريك أو سائق VIP' : l10n.startNow,
                                  style: const TextStyle(
                                    color: Colors.black,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Secondary CTA: Login
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: OutlinedButton(
                            onPressed: () => context.go('/login'),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(
                                color: Colors.white.withValues(alpha: 0.3),
                                width: 1.2,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                            ),
                            child: Text(
                              isAr ? 'تسجيل الدخول إلى حسابك' : l10n.login,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),

                        if (session.isRegistered) ...[
                          const SizedBox(height: 10),
                          TextButton(
                            onPressed: () => context.go('/'),
                            child: Text(
                              l10n.goToDashboard,
                              style: const TextStyle(
                                color: Color(0xFFFBBF24),
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  SizedBox(height: 16 + bottomInset),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LangChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _LangChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF7C3AED) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : Colors.white.withValues(alpha: 0.6),
            fontSize: 11,
            fontWeight: selected ? FontWeight.w900 : FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
