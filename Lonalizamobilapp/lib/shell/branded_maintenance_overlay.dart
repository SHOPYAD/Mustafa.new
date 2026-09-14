import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'shell_brand.dart';
import 'shell_failure.dart';

/// Native branded stand-in for nginx 502/503/504 and network drops.
class BrandedMaintenanceOverlay extends StatelessWidget {
  const BrandedMaintenanceOverlay({
    super.key,
    required this.failure,
    required this.retrying,
    required this.onRetry,
  });

  final ShellFailure failure;
  final bool retrying;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(gradient: ShellBrand.nightSky),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
          child: Column(
            children: [
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: ShellBrand.amberGold.withValues(alpha: 0.16),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: ShellBrand.amberGold.withValues(alpha: 0.45),
                    ),
                  ),
                  child: const Text(
                    'LONALIZA',
                    style: TextStyle(
                      color: ShellBrand.amberGoldLight,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.6,
                    ),
                  ),
                ),
              ),
              const Spacer(),
              Container(
                width: 108,
                height: 108,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.08),
                  border: Border.all(
                    color: ShellBrand.amberGold.withValues(alpha: 0.5),
                    width: 1.6,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: ShellBrand.royalPurple.withValues(alpha: 0.45),
                      blurRadius: 36,
                      spreadRadius: 8,
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Image.asset(
                    'assets/logo/logo.png',
                    fit: BoxFit.contain,
                    errorBuilder: (_, _, _) => Icon(
                      failure.kind == ShellFailureKind.offline
                          ? Icons.wifi_off_rounded
                          : Icons.auto_awesome_rounded,
                      size: 46,
                      color: ShellBrand.amberGold,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 26),
              Text(
                failure.titleAr,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  height: 1.35,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                failure.messageAr,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.74),
                  fontSize: 14,
                  height: 1.55,
                ),
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: retrying
                      ? null
                      : () {
                          HapticFeedback.lightImpact();
                          onRetry();
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ShellBrand.amberGold,
                    foregroundColor: ShellBrand.royalPurpleDeep,
                    disabledBackgroundColor:
                        ShellBrand.amberGold.withValues(alpha: 0.45),
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: retrying
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.4,
                            color: ShellBrand.royalPurpleDeep,
                          ),
                        )
                      : const Text(
                          'إعادة التحميل',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'لن يتم إغلاق التطبيق. نتحقق من جاهزية الخادم ثم نعيد جلستك.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.48),
                  fontSize: 12,
                  height: 1.45,
                ),
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}
