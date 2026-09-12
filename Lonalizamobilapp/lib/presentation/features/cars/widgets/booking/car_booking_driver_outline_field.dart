import 'package:flutter/material.dart';

import '../../car_booking_theme.dart';
import '../../car_booking_typography.dart';

/// Outlined field with Trip-like label + **Inter** value style.
class CarBookingDriverOutlineField extends StatelessWidget {
  const CarBookingDriverOutlineField({
    super.key,
    required this.controller,
    required this.label,
    this.keyboardType,
    this.textCapitalization = TextCapitalization.characters,
  });

  final TextEditingController controller;
  final String label;
  final TextInputType? keyboardType;
  final TextCapitalization textCapitalization;

  static OutlineInputBorder _border(Color color, {double width = 1}) {
    return OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: color, width: width),
    );
  }

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      textCapitalization: textCapitalization,
      style: CarBookingTypography.fieldValue(),
      decoration: InputDecoration(
        labelText: label,
        floatingLabelBehavior: FloatingLabelBehavior.auto,
        labelStyle: CarBookingTypography.fieldLabel(),
        floatingLabelStyle: CarBookingTypography.fieldLabel().copyWith(
          backgroundColor: Colors.white,
          fontWeight: FontWeight.w600,
        ),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        enabledBorder: _border(CarBookingTheme.fieldBorder),
        focusedBorder: _border(CarBookingTheme.fieldBorderFocused, width: 1.5),
        errorBorder: _border(const Color(0xFFDC2626)),
        focusedErrorBorder: _border(const Color(0xFFDC2626), width: 1.5),
      ),
    );
  }
}
