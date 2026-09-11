import 'package:flutter/material.dart';

/// Trip.com–style service shortcut.
///
/// - **Primary row** ([isFeatured]: `true`): light-blue disc, blue icon, **blue label** + yellow dot.
/// - **Secondary grid row** ([isFeatured]: `false`): blue icon only, dark label.
/// - [showCircularIconBackdrop]: e.g. quick-actions row — compact disc, dark label (not primary Trip labels).
class HomeServiceCategoryTile extends StatelessWidget {
  const HomeServiceCategoryTile({
    super.key,
    required this.icon,
    required this.label,
    this.onTap,
    this.isFeatured = true,
    this.showCircularIconBackdrop,
    this.compactChipStyle = false,
    /// Tighter disc + icon for five-across primary rows on narrow screens.
    this.denseFeatured = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  /// `true` = primary row sizing. `false` = secondary row sizing.
  final bool isFeatured;

  /// When `null`, disc on primary row only; second grid row has no disc.
  final bool? showCircularIconBackdrop;
  final bool compactChipStyle;

  /// Smaller featured circle (e.g. five primary tiles in one row).
  final bool denseFeatured;

  static const Color _iconBlue = Color(0xFF7C3AED);

  /// Lonaliza primary chips: light violet disc.
  static const Color _circleFill = Color(0xFFECE4F7);

  static const double _featuredDiameter = 68;
  static const double _featuredDiameterDense = 56;
  static const double _secondaryDiameter = 54;
  static const double _featuredIcon = 30;
  static const double _featuredIconDense = 24;
  static const double _secondaryIcon = 22;

  @override
  Widget build(BuildContext context) {
    if (compactChipStyle) {
      final chipLabelStyle = Theme.of(context).textTheme.bodyMedium?.copyWith(
        color: const Color(0xFF4B5563),
        fontWeight: FontWeight.w600,
      );

      return GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: const Color(0xFFF5F7FB),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 15, color: const Color(0xFF6B7280)),
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: chipLabelStyle,
                ),
              ),
            ],
          ),
        ),
      );
    }

    final useDenseFeatured = isFeatured && denseFeatured;
    final diameter = isFeatured
        ? (useDenseFeatured ? _featuredDiameterDense : _featuredDiameter)
        : _secondaryDiameter;
    final iconSize = isFeatured
        ? (useDenseFeatured ? _featuredIconDense : _featuredIcon)
        : _secondaryIcon;
    final gap = isFeatured ? 6.0 : 5.0;

    final showDisc = showCircularIconBackdrop ?? isFeatured;
    final primaryTripLabels = isFeatured && showDisc;

    final baseLabel = Theme.of(context).textTheme.labelSmall?.copyWith(
          height: 1.15,
          fontSize: isFeatured ? (useDenseFeatured ? 10.5 : 11.5) : 10,
          fontWeight: FontWeight.w600,
        );

    final labelStyle = baseLabel?.copyWith(
      color: primaryTripLabels ? _iconBlue : const Color(0xFF333333),
    );

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: isFeatured ? 6 : 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (showDisc)
              Center(
                child: SizedBox(
                  width: diameter,
                  height: diameter,
                  child: Material(
                    color: _circleFill,
                    elevation: isFeatured ? 4 : 3,
                    shadowColor: Colors.black.withValues(alpha: 0.22),
                    surfaceTintColor: Colors.transparent,
                    shape: const CircleBorder(),
                    clipBehavior: Clip.antiAlias,
                    child: Center(
                      child: Icon(
                        icon,
                        color: _iconBlue,
                        size: iconSize,
                      ),
                    ),
                  ),
                ),
              )
            else
              Center(
                child: Icon(
                  icon,
                  color: _iconBlue,
                  size: iconSize,
                ),
              ),
            SizedBox(height: gap),
            if (primaryTripLabels)
              _TripPrimaryLabel(text: label, style: labelStyle)
            else
              Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: labelStyle,
              ),
          ],
        ),
      ),
    );
  }
}

/// Trip: blue caption + tiny yellow square to the right of the text.
class _TripPrimaryLabel extends StatelessWidget {
  const _TripPrimaryLabel({
    required this.text,
    required this.style,
  });

  final String text;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      alignment: WrapAlignment.center,
      crossAxisAlignment: WrapCrossAlignment.end,
      spacing: 4,
      runSpacing: 2,
      children: [
        Text(
          text,
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: style,
        ),
        Padding(
          padding: const EdgeInsets.only(bottom: 2),
          child: Container(
            width: 5,
            height: 5,
            decoration: BoxDecoration(
              color: const Color(0xFFFFC107),
              borderRadius: BorderRadius.circular(1.5),
            ),
          ),
        ),
      ],
    );
  }
}
