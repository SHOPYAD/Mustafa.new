import 'package:flutter/material.dart';

/// Trip-style supplier offer list (reference screenshots).
abstract final class CarOffersTheme {
  static const Color pageBg = Color(0xFFF2F4F8);
  static const Color cardBg = Colors.white;
  static const Color titleDark = Color(0xFF111827);
  static const Color metaGrey = Color(0xFF6B7280);
  static const Color primaryBlue = Color(0xFF2B64E3);
  static const Color ratingBadgeBlue = Color(0xFF2563EB);
  static const Color linkBlue = Color(0xFF2563EB);
  static const Color freeCancelTeal = Color(0xFF0D9488);
  static const Color preferredBannerBg = Color(0xFFFFE8D6);
  static const Color preferredBannerText = Color(0xFF9A3412);

  static const TextStyle appBarTitle = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w800,
    color: titleDark,
    height: 1.2,
  );

  static const TextStyle providerName = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w900,
    color: titleDark,
    letterSpacing: -0.5,
  );

  static const TextStyle offerHeading = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w800,
    color: titleDark,
    height: 1.25,
  );

  static const TextStyle offerHeadingTeal = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    color: freeCancelTeal,
    height: 1.35,
  );

  static const TextStyle bullet = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: titleDark,
    height: 1.35,
  );

  static const TextStyle priceDay = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w900,
    color: titleDark,
    height: 1.1,
  );

  static const TextStyle priceTotal = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: metaGrey,
    height: 1.2,
  );
}
