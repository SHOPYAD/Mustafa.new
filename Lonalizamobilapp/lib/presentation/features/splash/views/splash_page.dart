import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../../core/constants/app_constants.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  static const String _logoAsset = 'assets/logo/logo.png';

  @override
  void initState() {
    super.initState();
    Future<void>.delayed(const Duration(milliseconds: 1800), _continue);
  }

  Future<void> _continue() async {
    if (!mounted) return;
    final prefs = await SharedPreferences.getInstance();
    final done = prefs.getBool(AppConstants.onboardingDoneKey) ?? false;
    if (!mounted) return;
    context.go(done ? '/' : '/onboarding');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF14051F), Color(0xFF2E1065), Color(0xFF6D28D9)],
          ),
        ),
        child: SafeArea(
          child: Stack(
            children: [
              const Positioned(
                top: 28,
                right: 24,
                child: Text(
                  'LONALIZA',
                  style: TextStyle(
                    color: Color(0xFFFDE68A),
                    letterSpacing: 3,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 148,
                      height: 148,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(36),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFF59E0B).withValues(alpha: 0.35),
                            blurRadius: 28,
                          ),
                        ],
                      ),
                      child: Image.asset(
                        _logoAsset,
                        fit: BoxFit.contain,
                        filterQuality: FilterQuality.high,
                      ),
                    ),
                    const SizedBox(height: 22),
                    const Text(
                      'لوناليزا',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'سفر فاخر بأسعار واضحة',
                      style: TextStyle(color: Color(0xFFFDE68A), fontSize: 15),
                    ),
                  ],
                ),
              ),
              const Align(
                alignment: Alignment.bottomCenter,
                child: Padding(
                  padding: EdgeInsets.only(bottom: 28),
                  child: Text(
                    'نفس عروض الموقع على جوالك',
                    style: TextStyle(color: Colors.white70),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
