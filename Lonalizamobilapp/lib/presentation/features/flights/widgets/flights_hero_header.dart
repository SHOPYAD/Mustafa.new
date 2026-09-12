import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class FlightsHeroHeader extends StatelessWidget {
  const FlightsHeroHeader({super.key});

  static const _brandBlue = Color(0xFF7C3AED);
  static const _brandText = Color(0xFF1F2937);
  static const _yellow = Color(0xFFFFC83D);

  @override
  Widget build(BuildContext context) {
    final topInset = MediaQuery.paddingOf(context).top;

    return SizedBox(
      height: topInset + 178,
      child: Stack(
        fit: StackFit.expand,
        children: [
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xFFEAF3FF),
                  Color(0xFFF8FBFF),
                ],
              ),
            ),
          ),
          const Positioned(
            top: -28,
            right: -22,
            child: _SoftBubble(size: 146, color: Color(0xFFDCEBFF)),
          ),
          const Positioned(
            top: 34,
            right: 54,
            child: _PlaneBadge(),
          ),
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 30),
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
                      const SizedBox(width: 10),
                      Text(
                        'لوناليزا',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: _brandBlue,
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      const Spacer(),
                      Container(
                        width: 30,
                        height: 30,
                        decoration: const BoxDecoration(
                          color: _yellow,
                          shape: BoxShape.circle,
                        ),
                        alignment: Alignment.center,
                        child: const Text(
                          'T',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
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
      color: Colors.white.withValues(alpha: 0.92),
      shape: const CircleBorder(),
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: 36,
          height: 36,
          child: Icon(icon, color: const Color(0xFF374151)),
        ),
      ),
    );
  }
}

class _SoftBubble extends StatelessWidget {
  const _SoftBubble({
    required this.size,
    required this.color,
  });

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
      ),
    );
  }
}

class _PlaneBadge extends StatelessWidget {
  const _PlaneBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 112,
      height: 112,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: const Color(0xFFF6F9FF),
        border: Border.all(color: const Color(0xFFBFD3FF), width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.withValues(alpha: 0.12),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned(
            top: 22,
            child: Icon(
              Icons.flight_rounded,
              size: 30,
              color: Colors.indigo.shade300,
            ),
          ),
          Positioned(
            bottom: 23,
            child: Container(
              width: 54,
              height: 22,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(999),
                gradient: const LinearGradient(
                  colors: [Color(0xFF9ED7FF), Color(0xFF5D8CFF)],
                ),
              ),
            ),
          ),
          const Positioned(
            bottom: 22,
            left: 30,
            child: _MiniTower(height: 22),
          ),
          const Positioned(
            bottom: 22,
            left: 48,
            child: _MiniTower(height: 30),
          ),
          const Positioned(
            bottom: 22,
            left: 68,
            child: _MiniTower(height: 18),
          ),
        ],
      ),
    );
  }
}

class _MiniTower extends StatelessWidget {
  const _MiniTower({required this.height});

  final double height;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 8,
      height: height,
      decoration: BoxDecoration(
        color: const Color(0xFF7B88A8),
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}
