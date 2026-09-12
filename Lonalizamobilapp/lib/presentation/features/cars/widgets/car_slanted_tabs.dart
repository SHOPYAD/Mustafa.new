import 'package:flutter/material.dart';

import '../car_rentals_theme.dart';

/// Two tabs with a diagonal seam (Car Rentals | Airport transfers).
class CarSlantedTabs extends StatelessWidget {
  const CarSlantedTabs({
    super.key,
    required this.leftSelected,
    required this.onLeftTap,
    required this.onRightTap,
  });

  final bool leftSelected;
  final VoidCallback onLeftTap;
  final VoidCallback onRightTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      child: Row(
        children: [
          Expanded(
            child: _SlantedTabSide(
              selected: leftSelected,
              isLeft: true,
              label: 'Car Rentals',
              onTap: onLeftTap,
            ),
          ),
          Expanded(
            child: _SlantedTabSide(
              selected: !leftSelected,
              isLeft: false,
              label: 'Airport transfers',
              onTap: onRightTap,
            ),
          ),
        ],
      ),
    );
  }
}

class _SlantedTabSide extends StatelessWidget {
  const _SlantedTabSide({
    required this.selected,
    required this.isLeft,
    required this.label,
    required this.onTap,
  });

  final bool selected;
  final bool isLeft;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final bg = selected ? Colors.white : CarRentalsTheme.tabInactiveBg;
    final style = selected ? CarRentalsTheme.cardTabActive : CarRentalsTheme.cardTabInactive;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: ClipPath(
          clipper: _TabSlantClipper(isLeft: isLeft),
          child: Container(
            color: bg,
            alignment: Alignment.center,
            child: Padding(
              padding: EdgeInsets.only(left: isLeft ? 12 : 4, right: isLeft ? 4 : 12),
              child: Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: style,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _TabSlantClipper extends CustomClipper<Path> {
  _TabSlantClipper({required this.isLeft});

  final bool isLeft;

  @override
  Path getClip(Size size) {
    final path = Path();
    const skew = 0.07;
    if (isLeft) {
      path.moveTo(0, 0);
      path.lineTo(size.width, 0);
      path.lineTo(size.width * (1 - skew), size.height);
      path.lineTo(0, size.height);
    } else {
      path.moveTo(size.width * skew, 0);
      path.lineTo(size.width, 0);
      path.lineTo(size.width, size.height);
      path.lineTo(0, size.height);
      path.lineTo(0, 0);
    }
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant _TabSlantClipper oldClipper) => oldClipper.isLeft != isLeft;
}
