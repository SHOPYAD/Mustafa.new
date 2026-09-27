import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/app_locale_provider.dart';
import '../../../providers/driver_session_provider.dart';

class DriverLoginPage extends ConsumerStatefulWidget {
  const DriverLoginPage({super.key});

  @override
  ConsumerState<DriverLoginPage> createState() => _DriverLoginPageState();
}

class _DriverLoginPageState extends ConsumerState<DriverLoginPage> {
  static const _logoAsset = 'assets/logo/logo.png';
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;
  bool _obscure = true;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    try {
      final result = await ref.read(driverApiProvider).login(
            email: _email.text.trim(),
            password: _password.text,
          );

      if (result['ok'] != true || result['token'] == null) {
        throw Exception(result['message'] ?? 'Login failed');
      }

      final supplierId = result['supplierId'] as String;
      final token = result['token'] as String;

      final profileData =
          await ref.read(driverApiProvider).fetchProfile(supplierId);

      await ref.read(driverSessionProvider.notifier).setAuthSession(
            supplierId: supplierId,
            authToken: token,
            profile: DriverProfileSnapshot.fromJson(
              parseSupplierProfileMap(profileData),
            ),
          );

      if (!mounted) return;
      context.go('/');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error_outline, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  e.toString().replaceAll('Exception: ', ''),
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFFDC2626),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final locale = ref.watch(appLocaleNotifierProvider);
    final isAr = locale.languageCode == 'ar';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary),
          onPressed: () {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              context.go('/splash');
            }
          },
        ),
        title: Text(
          isAr ? 'تسجيل دخول الشركاء' : 'Partner Sign In',
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          children: [
            const SizedBox(height: 12),

            // Logo in clean executive badge
            Center(
              child: Container(
                width: 90,
                height: 90,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.border,
                    width: 1.5,
                  ),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Image.asset(
                  _logoAsset,
                  fit: BoxFit.contain,
                ),
              ),
            ),

            const SizedBox(height: 18),

            // Platform title & description
            Center(
              child: Column(
                children: [
                  Text(
                    isAr ? 'لوناليزا كابتن — أسطول الشركاء VIP' : 'Lonaliza Captain — VIP Fleet',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                      letterSpacing: 0.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppColors.gold.withValues(alpha: 0.25),
                      ),
                    ),
                    child: Text(
                      isAr
                          ? 'بوابة السائقين والشركات المعتمدة رسمياً — lonaliza.com'
                          : 'Official Licensed Fleet & Chauffeur Portal — lonaliza.com',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: AppColors.goldDark,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Form Container
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: AppColors.border,
                ),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.emailLabel,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
                      style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                      textInputAction: TextInputAction.next,
                      decoration: InputDecoration(
                        hintText: 'partner@example.com',
                        hintStyle: const TextStyle(color: AppColors.textHint),
                        prefixIcon: const Icon(Icons.email_outlined, color: AppColors.purple, size: 20),
                        filled: true,
                        fillColor: AppColors.surfaceLight,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.purple, width: 1.5),
                        ),
                      ),
                      validator: (v) =>
                          v == null || !v.contains('@') ? l10n.emailInvalid : null,
                    ),

                    const SizedBox(height: 18),

                    Text(
                      l10n.passwordLabel,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _password,
                      obscureText: _obscure,
                      style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: '••••••••',
                        hintStyle: const TextStyle(color: AppColors.textHint),
                        prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.purple, size: 20),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                            color: AppColors.textSecondary,
                            size: 20,
                          ),
                          onPressed: () => setState(() => _obscure = !_obscure),
                        ),
                        filled: true,
                        fillColor: AppColors.surfaceLight,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.purple, width: 1.5),
                        ),
                      ),
                      validator: (v) =>
                          v == null || v.length < 6 ? l10n.passwordMinLength : null,
                    ),

                    const SizedBox(height: 24),

                    // Login CTA Button
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: AppTheme.brandGradient,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.purple.withValues(alpha: 0.3),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: _loading ? null : _submit,
                            child: Center(
                              child: _loading
                                  ? const SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2.5,
                                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                      ),
                                    )
                                  : Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Icon(Icons.login_rounded, color: Colors.white, size: 20),
                                        const SizedBox(width: 8),
                                        Text(
                                          l10n.login,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 16,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                      ],
                                    ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Register New Partner Section
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.border,
                ),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Column(
                children: [
                  Text(
                    isAr
                        ? 'هل أنت شركة نقل سياحي أو كابتن VIP جديد؟'
                        : 'Are you a licensed fleet company or VIP driver?',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: OutlinedButton.icon(
                      onPressed: () => context.go('/register'),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.purple, width: 1.5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      icon: const Icon(Icons.business_center_outlined, color: AppColors.purple, size: 18),
                      label: Text(
                        l10n.registerNewSupplier,
                        style: const TextStyle(
                          color: AppColors.purple,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
