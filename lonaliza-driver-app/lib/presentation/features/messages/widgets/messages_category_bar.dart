import 'package:flutter/material.dart';

/// Trip.com–style horizontal shortcuts: white rounded card, circular items, soft shadows.
class MessagesCategoryBar extends StatelessWidget {
  const MessagesCategoryBar({super.key});

  static const _itemGap = 14.0;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 4,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(2, 16, 2, 14), // further reduced padding
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Expanded(
                child: _CategoryItem(
                  icon: Icons.chat_bubble_outline_rounded,
                  iconColor: Color(0xFF0D9488),
                  washColor: Color(0xFFECFEFF),
                  label: 'Chats',
                ),
              ),
              const Expanded(
                child: _CategoryItem(
                  icon: Icons.edit_calendar_outlined,
                  iconColor: Color(0xFF2563EB),
                  washColor: Color(0xFFEFF6FF),
                  label: 'Bookings',
                ),
              ),
              const Expanded(
                child: _TripRewardsItem(),
              ),
              const Expanded(
                child: _CategoryItem(
                  icon: Icons.card_giftcard_outlined,
                  iconColor: Color(0xFFDB2777),
                  washColor: Color(0xFFFDF2F8),
                  label: 'Promotions',
                ),
              ),
              const Expanded(
                child: _CategoryItem(
                  icon: Icons.local_activity_outlined,
                  iconColor: Color(0xFF7C3AED),
                  washColor: Color(0xFFF5F3FF),
                  label: 'Activities',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CategoryItem extends StatelessWidget {
  const _CategoryItem({
    required this.icon,
    required this.iconColor,
    required this.washColor,
    required this.label,
  });

  final IconData icon;
  final Color iconColor;
  final Color washColor;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _IconDisc(
          child: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: washColor,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: iconColor, size: 16),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.visible,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            height: 1.1,
            color: Color(0xFF6B7280),
            letterSpacing: -0.4,
          ),
        ),
      ],
    );
  }
}

class _TripRewardsItem extends StatelessWidget {
  const _TripRewardsItem();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _IconDisc(
          child: Container(
            width: 32,
            height: 32,
            decoration: const BoxDecoration(
              color: Color(0xFFFF7A1A),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: const Text(
              'T',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 16,
                height: 1,
              ),
            ),
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Trip Rewards',
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.visible,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            height: 1.1,
            color: Color(0xFF6B7280),
            letterSpacing: -0.4,
          ),
        ),
      ],
    );
  }
}

/// White outer ring + soft lift (matches reference “white circle + subtle shadow”).
class _IconDisc extends StatelessWidget {
  const _IconDisc({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.07),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: child,
    );
  }
}
