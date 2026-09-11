import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:liotrip/presentation/features/auth/widgets/email_auth_sheet.dart';
import 'package:liotrip/presentation/providers/auth_session_provider.dart';

class AuthPage extends ConsumerWidget {
  const AuthPage({super.key});

  Future<void> _emailAuth(BuildContext context, WidgetRef ref) async {
    await EmailAuthSheet.show(context, onSubmit: (credentials) async {
      final notifier = ref.read(authSessionProvider.notifier);
      if (credentials.register) {
        await notifier.register(
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
        );
      } else {
        await notifier.login(email: credentials.email, password: credentials.password);
      }
      if (context.mounted) context.go('/account');
    });
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Color(0xFF1F2937)),
          onPressed: () => context.pop(),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Text('Trip', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF2F60F5))),
            Text('.com', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF2F60F5))),
          ],
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Hero Illustration (Simulated)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              height: 200,
              decoration: BoxDecoration(
                color: const Color(0xFFEEF2FF),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Stack(
                children: [
                  // Placeholder for illustration
                  Center(
                    child: Icon(Icons.style, size: 100, color: const Color(0xFF2F60F5).withValues(alpha: 0.1)),
                  ),
                  Positioned(
                    bottom: 24,
                    left: 24,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E1E64),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text('REWARDS', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 18, letterSpacing: 1)),
                    ),
                  )
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Title
            const Text(
              'Sign in for member rewards',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: Color(0xFF111827),
              ),
            ),
            
            const SizedBox(height: 12),
            
            // Tags
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  children: const [
                    Icon(Icons.local_offer, size: 14, color: Color(0xFF0D9488)),
                    SizedBox(width: 4),
                    Text('Get Member Benefits', style: TextStyle(fontSize: 13, color: Color(0xFF4B5563))),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Container(width: 1, height: 12, color: const Color(0xFFD1D5DB)),
                ),
                Row(
                  children: const [
                    Icon(Icons.monetization_on, size: 14, color: Color(0xFFFBBF24)),
                    SizedBox(width: 4),
                    Text('Rewards for booking', style: TextStyle(fontSize: 13, color: Color(0xFF4B5563))),
                  ],
                ),
              ],
            ),
            
            const SizedBox(height: 32),
            
            // Auth Buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      _buildAuthButton(
                        text: 'Continue with Google',
                        iconData: Icons.g_mobiledata,
                        iconColor: Colors.white,
                        bgColor: const Color(0xFF4285F4),
                        isGoogle: true,
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Google opens in the system browser, not inside the app WebView.'),
                            ),
                          );
                        },
                      ),
                      Positioned(
                        top: -12,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            border: Border.all(color: const Color(0xFF0D9488)),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('Recently used', style: TextStyle(fontSize: 10, color: Color(0xFF0D9488))),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildAuthButton(
                    text: 'Continue with email',
                    iconData: Icons.email,
                    bgColor: const Color(0xFF2F60F5),
                    onTap: () => _emailAuth(context, ref),
                  ),
                  const SizedBox(height: 12),
                  _buildAuthButton(
                    text: 'Continue with Facebook',
                    iconData: Icons.facebook,
                    bgColor: const Color(0xFF1877F2),
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Use email or Google — Facebook is not linked.')),
                      );
                    },
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 60), // Spacer before footer
            
            // Footer
            InkWell(
              onTap: () => context.go('/account'),
              borderRadius: BorderRadius.circular(8),
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'I have a referral code for registration',
                      style: TextStyle(fontSize: 14, color: Color(0xFF2F60F5), fontWeight: FontWeight.w600),
                    ),
                    Icon(Icons.keyboard_arrow_right_rounded, size: 18, color: Color(0xFF2F60F5)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: RichText(
                textAlign: TextAlign.center,
                text: const TextSpan(
                  style: TextStyle(fontSize: 12, color: Color(0xFF6B7280), height: 1.5),
                  children: [
                    TextSpan(text: 'By proceeding, I acknowledge that I have read and agree to Lonaliza\'s '),
                    TextSpan(text: 'Terms & Conditions', style: TextStyle(decoration: TextDecoration.underline)),
                    TextSpan(text: ' and '),
                    TextSpan(text: 'Privacy Statement', style: TextStyle(decoration: TextDecoration.underline)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildAuthButton({
    required String text,
    required IconData iconData,
    required Color bgColor,
    Color iconColor = Colors.white,
    bool isGoogle = false,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        height: 50,
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isGoogle)
              Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: const Text('G', style: TextStyle(color: Color(0xFF4285F4), fontWeight: FontWeight.bold, fontSize: 16)),
              )
            else
              Icon(iconData, color: iconColor, size: 24),
            const SizedBox(width: 8),
            Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
          ],
        ),
      ),
    );
  }
}
