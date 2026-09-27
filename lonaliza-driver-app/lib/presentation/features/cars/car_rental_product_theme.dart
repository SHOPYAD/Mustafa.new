import 'package:flutter/material.dart';

abstract final class CarRentalProductTheme {
  static const Color primaryBlue = Color(0xFF2A59FE);
  static const Color titleDark = Color(0xFF111827);
  static const Color metaGrey = Color(0xFF6B7280);
  static const Color pageBg = Color(0xFFF3F4F6);
  static const Color tealPositive = Color(0xFF0D9488);
  static const Color promoPink = Color(0xFFFF4D6A);
  static const Color promoBg = Color(0xFFFFF0F3);
  static const Color preferredStripBg = Color(0xFFFFF4E8);
  static const Color preferredStripText = Color(0xFF9A3412);
  static const Color sixtOrange = Color(0xFFFF6B00);

  static const TextStyle heroDisclaimer = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    color: metaGrey,
    height: 1.3,
  );

  static const TextStyle vehicleTitle = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w900,
    color: titleDark,
    height: 1.15,
  );

  static const TextStyle sectionTitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w800,
    color: titleDark,
    height: 1.2,
  );

  static const TextStyle appBarTitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w800,
    color: titleDark,
    height: 1.2,
  );

  static const TextStyle appBarSubtitle = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: metaGrey,
    height: 1.25,
  );
}
