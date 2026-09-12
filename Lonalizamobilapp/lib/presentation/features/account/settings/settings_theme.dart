import 'package:flutter/material.dart';

/// Trip-style settings list (reference: label ~16sp medium, value #9E9E9E).
abstract final class SettingsTheme {
  static const Color sectionLine = Color(0xFFF3F4F6); // Very faint line
  static const Color trackBlue = Color(0xFF7C3AED);

  static const TextStyle labelStyle = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    color: Color(0xFF1F2937),
    height: 1.2,
    letterSpacing: 0,
  );

  static const TextStyle valueStyle = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    color: Color(0xFF8B9CB6), // Muted grey-blue color in original
    height: 1.2,
    letterSpacing: 0,
  );

  static const TextStyle appBarTitle = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w500,
    color: Color(0xFF111827),
    letterSpacing: 0,
    height: 1.2,
  );
}
