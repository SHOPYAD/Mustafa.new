import 'package:flutter/material.dart';

abstract final class CarDetailTheme {
  static const Color primaryBlue = Color(0xFF2563EB);
  static const Color titleDark = Color(0xFF111827);
  static const Color metaGrey = Color(0xFF6B7280);
  static const Color tealCheck = Color(0xFF0D9488);
  static const Color noticeBg = Color(0xFFF3F4F6);
  static const Color tabInactive = Color(0xFF6B7280);

  static const TextStyle appBarTitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w800,
    color: titleDark,
    height: 1.2,
  );

  static const TextStyle sectionTitle = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w800,
    color: titleDark,
    height: 1.2,
  );

  static const TextStyle accordionTitle = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w700,
    color: titleDark,
    height: 1.25,
  );

  static const TextStyle accordionBody = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: metaGrey,
    height: 1.45,
  );

  static const TextStyle bottomPrice = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w900,
    color: primaryBlue,
    height: 1.1,
  );
}
