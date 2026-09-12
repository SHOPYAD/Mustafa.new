import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class PackageActionButtons extends StatelessWidget {
  const PackageActionButtons({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // Customize my trip – outlined button with travel experts avatars
          Expanded(
            child: GestureDetector(
              onTap: () {},
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF3B82F6), width: 1.5),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Avatars label row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Stacked mini avatars
                        SizedBox(
                          width: 36,
                          height: 14,
                          child: Stack(
                            children: [
                              Positioned(
                                left: 0,
                                child: _MiniAvatar(color: Colors.brown.shade300),
                              ),
                              Positioned(
                                left: 12,
                                child: _MiniAvatar(color: Colors.blue.shade300),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 2),
                        const Text(
                          'Travel experts',
                          style: TextStyle(fontSize: 9, color: Color(0xFF6B7280)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 1),
                    const Text(
                      'Customize my trip',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF3B82F6),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          // Search – solid blue button
          Expanded(
            child: GestureDetector(
              onTap: () => context.push('/packages/search?q=Beijing'),
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFF7C3AED),
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: const Text(
                  'Search',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniAvatar extends StatelessWidget {
  const _MiniAvatar({required this.color});
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 16,
      height: 16,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
        border: Border.all(color: Colors.white, width: 1),
      ),
      child: const Icon(Icons.person_rounded, size: 10, color: Colors.white),
    );
  }
}
