import 'package:flutter/material.dart';

class FlightsInspirationSection extends StatelessWidget {
  const FlightsInspirationSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Text(
              'Travel inspiration',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: const Color(0xFF111827),
                fontWeight: FontWeight.w900,
              ),
            ),
            const Spacer(),
            const Icon(
              Icons.location_on_outlined,
              color: Color(0xFF111827),
              size: 22,
            ),
            const SizedBox(width: 4),
            Text(
              'Los Angeles',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: const Color(0xFF111827),
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Container(
          height: 228,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF2145E7),
                Color(0xFF171D9E),
              ],
            ),
          ),
          child: Stack(
            fit: StackFit.expand,
            children: [
              const Positioned(
                top: -10,
                right: -22,
                child: _GlowBubble(size: 130, color: Color(0x3358B6FF)),
              ),
              const Positioned(
                bottom: -26,
                left: -18,
                child: _GlowBubble(size: 108, color: Color(0x2247C8FF)),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 14, 14, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Explore the world',
                          style: Theme.of(context).textTheme.headlineSmall
                              ?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                        const Spacer(),
                        Container(
                          width: 34,
                          height: 34,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.arrow_forward_ios_rounded,
                            size: 18,
                            color: Color(0xFF1C3DE3),
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Align(
                      alignment: Alignment.center,
                      child: SizedBox(
                        height: 120,
                        child: Stack(
                          clipBehavior: Clip.none,
                          children: const [
                            Positioned(
                              left: 0,
                              bottom: 6,
                              child: _CityChip(
                                label: 'Vancouver',
                                subtitle: 'From \$238',
                              ),
                            ),
                            Positioned(
                              left: 116,
                              top: 0,
                              child: _CityChip(
                                label: 'Calgary',
                                subtitle: 'From \$287',
                                isFeatured: true,
                              ),
                            ),
                            Positioned(
                              left: 234,
                              bottom: 14,
                              child: _TriangleMarker(),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _GlowBubble extends StatelessWidget {
  const _GlowBubble({
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

class _CityChip extends StatelessWidget {
  const _CityChip({
    required this.label,
    required this.subtitle,
    this.isFeatured = false,
  });

  final String label;
  final String subtitle;
  final bool isFeatured;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 98,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: isFeatured
            ? Colors.white.withValues(alpha: 0.20)
            : Colors.white.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: Colors.white.withValues(alpha: isFeatured ? 0.48 : 0.28),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: Colors.white.withValues(alpha: 0.88),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _TriangleMarker extends StatelessWidget {
  const _TriangleMarker();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 24,
      height: 24,
      child: CustomPaint(
        size: const Size(24, 24),
        painter: _TrianglePainter(),
      ),
    );
  }
}

class _TrianglePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white.withValues(alpha: 0.18);
    final path = Path()
      ..moveTo(0, size.height / 2)
      ..lineTo(size.width, 0)
      ..lineTo(size.width, size.height)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
