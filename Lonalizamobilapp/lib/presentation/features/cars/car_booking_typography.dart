import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'car_booking_theme.dart';

/// Trip-like **Inter** typography for the Book flow only.
abstract final class CarBookingTypography {
  static TextStyle inter({
    double fontSize = 14,
    FontWeight fontWeight = FontWeight.w500,
    Color? color,
    double height = 1.25,
    double letterSpacing = 0,
  }) {
    return GoogleFonts.inter(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color ?? CarBookingTheme.titleDark,
      height: height,
      letterSpacing: letterSpacing,
    );
  }

  static TextStyle sectionTitle() =>
      inter(fontSize: 17, fontWeight: FontWeight.w700, color: CarBookingTheme.titleDark, height: 1.2);

  static TextStyle chipSelected() => inter(
        fontSize: 12,
        fontWeight: FontWeight.w800,
        color: CarBookingTheme.primaryBlue,
        letterSpacing: 0.6,
      );

  static TextStyle chipUnselected() =>
      inter(fontSize: 12, fontWeight: FontWeight.w700, color: CarBookingTheme.metaGrey, letterSpacing: 0.3);

  static TextStyle addButton() =>
      inter(fontSize: 12, fontWeight: FontWeight.w800, color: CarBookingTheme.primaryBlue);

  static TextStyle instantBanner() => inter(
        fontSize: 13,
        fontWeight: FontWeight.w700,
        color: CarBookingTheme.instantStripText,
        height: 1.2,
      );

  static TextStyle fieldValue() =>
      inter(fontSize: 16, fontWeight: FontWeight.w500, color: CarBookingTheme.titleDark, height: 1.25);

  static TextStyle fieldLabel() =>
      inter(fontSize: 12, fontWeight: FontWeight.w500, color: CarBookingTheme.metaGrey);

  static TextStyle summaryTitle() =>
      inter(fontSize: 17, fontWeight: FontWeight.w800, color: CarBookingTheme.titleDark, height: 1.2);

  static TextStyle summaryRow() =>
      inter(fontSize: 13, fontWeight: FontWeight.w600, color: CarBookingTheme.titleDark, height: 1.35);

  static TextStyle appBarTitle() =>
      inter(fontSize: 18, fontWeight: FontWeight.w800, color: CarBookingTheme.titleDark);

  static TextStyle payTotal() =>
      inter(fontSize: 17, fontWeight: FontWeight.w800, color: CarBookingTheme.titleDark);

  static TextStyle paySub() => inter(fontSize: 12, fontWeight: FontWeight.w500, color: CarBookingTheme.metaGrey);

  static TextStyle payButton() => inter(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white);
}
