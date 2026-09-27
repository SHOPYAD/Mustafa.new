import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HotelsHeroHeader extends StatelessWidget {
  const HotelsHeroHeader({
    super.key,
    this.onMoreTap,
  });

  static const _heroImage = 'assets/images/1.jpg';
  static const _brandBlue = Color(0xFF2563EB);
  static const _brandYellow = Color(0xFFFFC107);
  final VoidCallback? onMoreTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 210,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(_heroImage, fit: BoxFit.cover),
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.12),
                  Colors.black.withValues(alpha: 0.38),
                ],
              ),
            ),
          ),
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 22),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _CircleActionButton(
                        icon: Icons.arrow_back_rounded,
                        onTap: () {
                          if (context.canPop()) {
                            context.pop();
                          } else {
                            context.go('/');
                          }
                        },
                      ),
                      const Spacer(),
                      Container(
                        width: 28,
                        height: 28,
                        decoration: const BoxDecoration(
                          color: _brandYellow,
                          shape: BoxShape.circle,
                        ),
                        child: const Center(
                          child: Text(
                            'T',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      _CircleActionButton(
                        icon: Icons.more_horiz_rounded,
                        onTap: onMoreTap,
                      ),
                    ],
                  ),
                  const Spacer(),
                  Text(
                    'Hotels & Homes.',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      height: 1.0,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: _brandBlue,
                      borderRadius: BorderRadius.circular(999),
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

class _CircleActionButton extends StatelessWidget {
  const _CircleActionButton({
    required this.icon,
    this.onTap,
  });

  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black.withValues(alpha: 0.35),
      shape: const CircleBorder(),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: 36,
          height: 36,
          child: Icon(icon, color: Colors.white),
        ),
      ),
    );
  }
}
