import 'package:flutter/material.dart';

class HomePromoCouponCard extends StatelessWidget {
  const HomePromoCouponCard({
    required this.title,
    required this.subtitle,
    required this.isTrailingCut,
    this.icon = Icons.train_rounded,
    super.key,
  });

  final String title;
  final String subtitle;
  final bool isTrailingCut;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 122,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF4F7),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFFFD4E0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  children: [
                    Icon(
                      icon,
                      size: 14,
                      color: Colors.pink.shade300,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.labelMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF6B7280),
                            ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  subtitle,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: const Color(0xFFE11D74),
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ],
            ),
          ),
          if (isTrailingCut) ...[
            const Positioned(
              right: -7,
              top: 31,
              child: _CouponCutout(
                borderColor: Color(0xFFFFD4E0),
              ),
            ),
            const Positioned(
              right: -7,
              bottom: -7,
              child: _CouponCutout(
                borderColor: Color(0xFFFFD4E0),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _CouponCutout extends StatelessWidget {
  const _CouponCutout({required this.borderColor});

  final Color borderColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 14,
      height: 14,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        border: Border.all(color: borderColor),
      ),
    );
  }
}
