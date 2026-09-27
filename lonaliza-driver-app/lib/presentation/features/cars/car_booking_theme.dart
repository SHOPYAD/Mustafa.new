import 'package:flutter/material.dart';

abstract final class CarBookingTheme {
  static const Color pageBg = Color(0xFFF5F7F9);
  static const Color primaryBlue = Color(0xFF2B65EC);
  static const Color titleDark = Color(0xFF111827);
  static const Color metaGrey = Color(0xFF6B7280);
  /// Slim strip (Trip cyan — matches reference ~`0xFFE0F7F9`).
  static const Color instantStripBg = Color(0xFFE0F7F9);
  static const Color instantStripText = Color(0xFF0F766E);
  static const Color instantStripIcon = Color(0xFF0F766E);
  static const Color fieldBorder = Color(0xFFD1D5DB);
  static const Color fieldBorderFocused = primaryBlue;
  static const Color promoStripBg = Color(0xFFFFF0F3);
  static const Color navyTitle = Color(0xFF1E3A5A);

  static const TextStyle cardTitle = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w900,
    color: titleDark,
    height: 1.2,
  );

  static const TextStyle sectionTitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w800,
    color: titleDark,
  );
}
