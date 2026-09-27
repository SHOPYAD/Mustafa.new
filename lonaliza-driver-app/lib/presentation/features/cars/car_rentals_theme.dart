import 'package:flutter/material.dart';

/// Car rentals / search cars (Trip-style references).
abstract final class CarRentalsTheme {
  static const Color heroBlue = Color(0xFF1E3A5F);
  static const Color heroOrange = Color(0xFFFF8A4C);
  static const Color heroGradientEnd = Color(0xFF4A6FA5);
  static const Color titleWhite = Color(0xFFFFFFFF);
  static const Color dotOrange = Color(0xFFFF9800);
  static const Color toolbarCircleFill = Color(0x59FFFFFF);
  static const Color tabInactiveBg = Color(0xFFF1F3F6);
  static const Color primaryBlue = Color(0xFF2B64E3);
  static const Color primaryText = Color(0xFF1F2937);
  static const Color secondaryText = Color(0xFF6B7280);
  static const Color rowDivider = Color(0xFFE5E7EB);
  static const Color pageBg = Color(0xFFF2F4F8);
  static const Color supportCaption = Color(0xFF7C9BD6);
  static const Color promoPink = Color(0xFFFF4D6A);
  static const Color promoBannerStart = Color(0xFFFFE8EC);
  static const Color promoBannerEnd = Color(0xFFFFFFFF);
  static const Color linkBlue = Color(0xFF3264FF);
  static const Color brandGridBorder = Color(0xFFE5E7EB);
  static const Color whyTitle = Color(0xFF0F172A);

  static const TextStyle heroTitle = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w800,
    color: titleWhite,
    letterSpacing: -0.5,
    height: 1.1,
  );

  static const TextStyle cardTabActive = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w800,
    color: primaryText,
    height: 1.2,
  );

  static const TextStyle cardTabInactive = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w500,
    color: primaryText,
    height: 1.2,
  );

  static const TextStyle inputPrimary = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w700,
    color: primaryText,
    height: 1.25,
  );

  static const TextStyle inputSecondary = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: secondaryText,
    height: 1.25,
  );

  static const TextStyle sectionHeader = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w800,
    color: whyTitle,
    height: 1.2,
  );

  static const TextStyle whyFeatureTitle = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w700,
    color: Color(0xFF1E3A5F),
    height: 1.25,
  );

  static const TextStyle whyFeatureBody = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: secondaryText,
    height: 1.45,
  );
}
