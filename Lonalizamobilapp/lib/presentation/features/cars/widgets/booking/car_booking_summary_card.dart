import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../car_booking_theme.dart';
import '../../car_booking_typography.dart';

/// Top white card: vehicle row, date / pickup / protection rows, supplier row.
class CarBookingSummaryCard extends StatefulWidget {
  const CarBookingSummaryCard({
    super.key,
    required this.vehicleTitle,
    required this.calendarLine,
    required this.pickupSummaryLine,
    required this.protectionLabel,
    required this.supplierName,
    required this.cancellationLine,
  });

  final String vehicleTitle;
  final String calendarLine;
  final String pickupSummaryLine;
  final String protectionLabel;
  final String supplierName;
  final String cancellationLine;

  @override
  State<CarBookingSummaryCard> createState() => _CarBookingSummaryCardState();
}

class _CarBookingSummaryCardState extends State<CarBookingSummaryCard> {
  bool _expanded = true;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(14, 14, 10, 12),
              child: Row(
                children: [
                  Expanded(child: Text(widget.vehicleTitle, style: CarBookingTypography.summaryTitle())),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      width: 56,
                      height: 40,
                      color: const Color(0xFFF3F4F6),
                      child: Icon(Icons.directions_car_filled_rounded, color: Colors.grey.shade400),
                    ),
                  ),
                  Icon(_expanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded),
                ],
              ),
            ),
          ),
          if (_expanded) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
              child: Column(
                children: [
                  _IconLine(icon: Icons.calendar_today_outlined, text: widget.calendarLine),
                  const SizedBox(height: 10),
                  _IconLine(icon: Icons.directions_car_outlined, text: widget.pickupSummaryLine),
                  const SizedBox(height: 10),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.verified_user_outlined, size: 20, color: Colors.grey.shade600),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Row(
                          children: [
                            Flexible(
                              child: Text(widget.protectionLabel, style: CarBookingTypography.summaryRow()),
                            ),
                            IconButton(
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                              onPressed: () {},
                              icon: Icon(Icons.info_outline_rounded, size: 18, color: Colors.grey.shade600),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
            InkWell(
              onTap: () {},
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                child: Row(
                  children: [
                    _SupplierMark(name: widget.supplierName),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(widget.cancellationLine, style: CarBookingTypography.summaryRow()),
                    ),
                    Icon(Icons.chevron_right_rounded, color: Colors.grey.shade500),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _IconLine extends StatelessWidget {
  const _IconLine({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: Colors.grey.shade600),
        const SizedBox(width: 10),
        Expanded(child: Text(text, style: CarBookingTypography.summaryRow())),
      ],
    );
  }
}

class _SupplierMark extends StatelessWidget {
  const _SupplierMark({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    if (name.toUpperCase() == 'SIXT') {
      final base = GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w900);
      return RichText(
        text: TextSpan(
          style: base,
          children: [
            TextSpan(text: 'S', style: base.copyWith(color: const Color(0xFFFF6B00))),
            TextSpan(text: 'IX', style: base.copyWith(color: CarBookingTheme.titleDark)),
            TextSpan(text: 'T', style: base.copyWith(color: const Color(0xFFFF6B00))),
          ],
        ),
      );
    }
    return Text(name, style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w900));
  }
}
