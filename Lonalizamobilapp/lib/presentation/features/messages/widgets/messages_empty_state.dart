import 'dart:ui' as ui;
import 'package:flutter/material.dart';

class MessagesEmptyState extends StatelessWidget {
  const MessagesEmptyState({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Beautiful reconstructed Mailbox Illustration
            SizedBox(
              width: 180,
              height: 180,
              child: FittedBox(
                child: SizedBox(
                  width: 240,
                  height: 240,
                  child: Stack(
                alignment: Alignment.center,
                children: [
                  // Circular background
                  Container(
                    width: 190,
                    height: 190,
                    decoration: const BoxDecoration(
                      color: Color(0xFFF8FAFC),
                      shape: BoxShape.circle,
                    ),
                  ),
                  
                  // Mailbox Post (Stand)
                  Positioned(
                    bottom: 25,
                    child: Container(
                      width: 24,
                      height: 80,
                      decoration: const BoxDecoration(
                        color: Color(0xFF93A5F5), // Post color
                      ),
                    ),
                  ),

                  // Mailbox Body (Main long part)
                  Positioned(
                    top: 85,
                    right: 40,
                    child: Container(
                      width: 90,
                      height: 60,
                      decoration: const BoxDecoration(
                        color: Color(0xFFA5B4F8),
                        borderRadius: BorderRadius.only(
                          topRight: Radius.circular(8),
                          bottomRight: Radius.circular(8),
                        ),
                      ),
                    ),
                  ),

                  // Mailbox Arch (Top curve)
                  Positioned(
                    top: 65,
                    right: 40,
                    child: Container(
                      width: 90,
                      height: 40,
                      decoration: const BoxDecoration(
                        color: Color(0xFFBAC4FA),
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(20),
                          topRight: Radius.circular(8),
                        ),
                      ),
                    ),
                  ),

                  // Mailbox Flag
                  Positioned(
                    top: 45,
                    right: 50,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(width: 4, height: 35, color: const Color(0xFF818CF8)),
                        Container(width: 20, height: 14, color: const Color(0xFF818CF8)),
                      ],
                    ),
                  ),

                  // Mailbox Opening (The ellipse at the front)
                  Positioned(
                    top: 65,
                    left: 55,
                    child: Container(
                      width: 55,
                      height: 80,
                      decoration: BoxDecoration(
                        color: const Color(0xFF818CF8),
                        borderRadius: BorderRadius.circular(28),
                      ),
                    ),
                  ),

                  // Mailbox Open Door (flap hanging down)
                  Positioned(
                    bottom: 60,
                    left: 45,
                    child: Transform.rotate(
                      angle: -0.3,
                      child: Container(
                        width: 45,
                        height: 50,
                        decoration: BoxDecoration(
                          color: const Color(0xFFBAC4FA),
                          borderRadius: BorderRadius.circular(25),
                        ),
                      ),
                    ),
                  ),
                  
                  // Dashed trail for the paper plane
                  Positioned(
                    top: 65,
                    left: 30,
                    child: CustomPaint(
                      size: const Size(60, 40),
                      painter: _DashedTrailPainter(),
                    ),
                  ),

                  // Paper Plane
                  Positioned(
                    top: 50,
                    left: 20,
                    child: Transform.rotate(
                      angle: -0.4,
                      child: const Icon(Icons.send_rounded, size: 36, color: Color(0xFFFBBF24)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          ),
          
          const SizedBox(height: 20),
          
          const Text(
            'No notifications',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 8),
          
          const Text(
            'You can find notifications from the past 6 months regarding bookings, member rewards, live chats, and much more!',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Color(0xFF6B7280),
              height: 1.5,
            ),
          ),
          
          const SizedBox(height: 24),
          
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF7C3AED),
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              elevation: 0,
            ),
            child: const Text('Find deals', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
          ),
            ],
          ),
        ),
    );
  }
}

class _DashedTrailPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    var paint = Paint()
      ..color = const Color(0xFFD1D5DB)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    
    var path = Path();
    path.moveTo(size.width, size.height);
    path.quadraticBezierTo(size.width * 0.3, size.height * 1.5, 0, 0);

    // Manual dashed line approx
    const dashWidth = 4.0;
    const dashSpace = 4.0;
    double distance = 0.0;
    
    for (ui.PathMetric pathMetric in path.computeMetrics()) {
      while (distance < pathMetric.length) {
        canvas.drawPath(
          pathMetric.extractPath(distance, distance + dashWidth),
          paint,
        );
        distance += dashWidth + dashSpace;
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
