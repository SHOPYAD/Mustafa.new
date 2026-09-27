import 'package:flutter/material.dart';

/// ~8–10dp grey band between major sections (Trip-style).
class CarRentalThickSectionDivider extends StatelessWidget {
  const CarRentalThickSectionDivider({super.key, this.height = 10});

  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      width: double.infinity,
      child: ColoredBox(color: const Color(0xFFEFF2F6)),
    );
  }
}
