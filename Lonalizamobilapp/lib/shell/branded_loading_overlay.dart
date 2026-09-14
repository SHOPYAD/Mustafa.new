import 'package:flutter/material.dart';

import 'shell_brand.dart';

/// Lightweight branded interstitial. Visual only — never absorbs pointers.
class BrandedLoadingOverlay extends StatefulWidget {
  const BrandedLoadingOverlay({super.key, this.caption});

  final String? caption;

  @override
  State<BrandedLoadingOverlay> createState() => _BrandedLoadingOverlayState();
}

class _BrandedLoadingOverlayState extends State<BrandedLoadingOverlay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: DecoratedBox(
        decoration: const BoxDecoration(gradient: ShellBrand.nightSky),
        child: Center(
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, _) {
              final t = _controller.value;
              final pulse = 0.97 + (0.06 * (1 - (2 * t - 1).abs()));
              final glow = 0.18 + (0.22 * (1 - (2 * t - 1).abs()));
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Transform.scale(
                    scale: pulse,
                    child: Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.08),
                        border: Border.all(
                          color: ShellBrand.amberGold.withValues(alpha: 0.5 + glow * 0.4),
                          width: 1.4,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: ShellBrand.amberGold.withValues(alpha: glow),
                            blurRadius: 28,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Image.asset(
                          'assets/logo/logo.png',
                          fit: BoxFit.contain,
                          errorBuilder: (_, _, _) => const Icon(
                            Icons.travel_explore_rounded,
                            size: 42,
                            color: ShellBrand.amberGold,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'LONALIZA',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 3.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.caption ?? 'جارٍ تجهيز تجربتك…',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.72),
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 18),
                  _BrandShimmerBar(progress: t),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _BrandShimmerBar extends StatelessWidget {
  const _BrandShimmerBar({required this.progress});

  final double progress;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 128,
      height: 3,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(99),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.10),
          ),
          child: FractionallySizedBox(
            alignment: Alignment(-1.2 + (progress * 2.4), 0),
            widthFactor: 0.38,
            heightFactor: 1,
            child: const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color(0x00F59E0B),
                    ShellBrand.amberGoldLight,
                    ShellBrand.amberGold,
                    Color(0x00F59E0B),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
