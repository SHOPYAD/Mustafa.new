import 'package:flutter/material.dart';

class HotelsSearchMapPreview extends StatelessWidget {
  const HotelsSearchMapPreview({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      margin: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: const Color(0xFFEAF4EA),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        fit: StackFit.expand,
        children: [
          CustomPaint(painter: _MapBackgroundPainter()),
          Positioned(
            left: 16,
            top: 24,
            child: _MapLabel(text: 'Egypt', color: Color(0xFF1F2937)),
          ),
          const Positioned(
            left: 60,
            top: 52,
            child: Icon(
              Icons.hotel_rounded,
              size: 26,
              color: Color(0xFF7C3AED),
            ),
          ),
          const Positioned(
            left: 48,
            top: 90,
            child: Icon(
              Icons.hotel_rounded,
              size: 22,
              color: Color(0xFF7C3AED),
            ),
          ),
          const Positioned(
            left: 80,
            top: 100,
            child: Icon(
              Icons.location_on_rounded,
              size: 30,
              color: Color(0xFFEF4444),
            ),
          ),
          const Positioned(
            left: 12,
            bottom: 12,
            child: Text(
              '200 km',
              style: TextStyle(
                color: Color(0xFF374151),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Positioned(
            right: 12,
            bottom: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFDBEAFE),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.map_outlined, size: 16, color: Color(0xFF7C3AED)),
                  SizedBox(width: 4),
                  Text(
                    'Map',
                    style: TextStyle(
                      color: Color(0xFF7C3AED),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const Positioned(
            top: 8,
            right: 8,
            child: Icon(
              Icons.cancel_rounded,
              color: Color(0xFF6B7280),
            ),
          ),
        ],
      ),
    );
  }
}

class _MapLabel extends StatelessWidget {
  const _MapLabel({required this.text, required this.color});

  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 16),
    );
  }
}

class _MapBackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final background = Paint()..color = const Color(0xFFD8ECD7);
    canvas.drawRect(Offset.zero & size, background);

    final sea = Paint()..color = const Color(0xFFBFD8F2);
    final seaPath = Path()
      ..moveTo(size.width * 0.68, 0)
      ..quadraticBezierTo(
        size.width * 0.52, size.height * 0.4,
        size.width * 0.66, size.height,
      )
      ..lineTo(size.width, size.height)
      ..lineTo(size.width, 0)
      ..close();
    canvas.drawPath(seaPath, sea);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
