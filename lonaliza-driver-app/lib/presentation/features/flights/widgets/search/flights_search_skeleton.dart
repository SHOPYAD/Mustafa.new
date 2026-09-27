import 'package:flutter/material.dart';

class FlightsSearchSkeletonList extends StatefulWidget {
  const FlightsSearchSkeletonList({super.key, this.itemCount = 5});

  final int itemCount;

  @override
  State<FlightsSearchSkeletonList> createState() => _FlightsSearchSkeletonListState();
}

class _FlightsSearchSkeletonListState extends State<FlightsSearchSkeletonList>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final opacity = 0.45 + (_controller.value * 0.45); // Pulses between 0.45 and 0.90
        return Opacity(
          opacity: opacity,
          child: ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: widget.itemCount,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) => const _SkeletonCard(),
          ),
        );
      },
    );
  }
}

class _SkeletonCard extends StatelessWidget {
  const _SkeletonCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Upper Section
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 16, 14, 14),
            child: Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      // Departure Airport
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _SkeletonBar(width: 55, height: 16),
                          const SizedBox(height: 6),
                          _SkeletonBar(width: 35, height: 11),
                        ],
                      ),
                      const SizedBox(width: 14),
                      // Duration Indicator Line
                      Expanded(
                        child: Column(
                          children: [
                            _SkeletonBar(width: 40, height: 10),
                            const SizedBox(height: 6),
                            Container(
                              height: 2,
                              color: const Color(0xFFE5E7EB),
                            ),
                            const SizedBox(height: 6),
                            _SkeletonBar(width: 30, height: 10),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14),
                      // Arrival Airport
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          _SkeletonBar(width: 55, height: 16),
                          const SizedBox(height: 6),
                          _SkeletonBar(width: 35, height: 11),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 24),
                // Price Column
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _SkeletonBar(width: 65, height: 16, color: const Color(0xFFDBE5FF)),
                    const SizedBox(height: 6),
                    _SkeletonBar(width: 40, height: 11),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          // Lower Section
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 16,
                      height: 16,
                      decoration: const BoxDecoration(
                        color: Color(0xFFE5E7EB),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    _SkeletonBar(width: 80, height: 12),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    _SkeletonBar(width: 70, height: 14, color: const Color(0xFFDEF7EC)),
                    const SizedBox(width: 8),
                    _SkeletonBar(width: 70, height: 14, color: const Color(0xFFDEF7EC)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SkeletonBar extends StatelessWidget {
  const _SkeletonBar({
    required this.width,
    required this.height,
    this.color,
  });

  final double width;
  final double height;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: color ?? const Color(0xFFE5E7EB),
        borderRadius: BorderRadius.circular(height / 2),
      ),
    );
  }
}
