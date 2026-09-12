import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/lonaliza_theme.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _controller = PageController();
  int _index = 0;

  static const _slides = [
    (
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1400&q=80',
      'اسطنبول بانتظارك',
      'طيران، فنادق، سيارات وبرامج جاهزة — احجز رحلتك في دقائق بأسعار واضحة.',
    ),
    (
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
      'مستشارك الخاص',
      'صف وجهتك وتواريخك، ويقترح لك المساعد أفضل الخيارات ثم يفتح الحجز مباشرة.',
    ),
    (
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
      'عش الرحلة مع المسافرين',
      'ريلز، لحظات، ورفاق سفر يشاركونك الوجهة قبل أن تسافر.',
    ),
    (
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=80',
      'اربح وأهدِ بسهولة',
      'شارك رابطك واحصل على عمولة، أو أرسل بطاقة هدية لمن تحب.',
    ),
    (
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
      'كل شيء في حساب واحد',
      'حجوزاتك، رسائلك، محفظتك ومجتمعك — على الموقع والتطبيق معاً.',
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConstants.onboardingDoneKey, true);
    if (mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    final last = _index == _slides.length - 1;
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          PageView.builder(
            controller: _controller,
            itemCount: _slides.length,
            onPageChanged: (value) => setState(() => _index = value),
            itemBuilder: (context, i) {
              final slide = _slides[i];
              return Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(slide.$1, fit: BoxFit.cover, errorBuilder: (_, _, _) {
                    return const ColoredBox(color: LonalizaColors.royalPurple);
                  }),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.black26, Colors.black87],
                      ),
                    ),
                  ),
                  SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(28, 24, 28, 160),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Image.asset('assets/logo/logo.png', height: 36, errorBuilder: (_, _, _) {
                            return const Text('لوناليزا', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 22));
                          }),
                          const Spacer(),
                          Text(slide.$2, style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w900, height: 1.2)),
                          const SizedBox(height: 12),
                          Text(slide.$3, style: const TextStyle(color: Colors.white70, fontSize: 17, height: 1.55)),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
          SafeArea(
            child: Align(
              alignment: Alignment.topLeft,
              child: TextButton(
                onPressed: _finish,
                child: const Text('تخطي', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
              ),
            ),
          ),
          Positioned(
            left: 24,
            right: 24,
            bottom: 28,
            child: SafeArea(
              top: false,
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      for (var i = 0; i < _slides.length; i++)
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          width: i == _index ? 22 : 8,
                          height: 8,
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          decoration: BoxDecoration(
                            color: i == _index ? LonalizaColors.amber : Colors.white38,
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: LonalizaColors.amber,
                        foregroundColor: LonalizaColors.royalPurple,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                      ),
                      onPressed: () {
                        if (last) {
                          _finish();
                          return;
                        }
                        _controller.nextPage(duration: const Duration(milliseconds: 320), curve: Curves.easeOut);
                      },
                      child: Text(last ? 'ابدأ الاستكشاف' : 'التالي', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
