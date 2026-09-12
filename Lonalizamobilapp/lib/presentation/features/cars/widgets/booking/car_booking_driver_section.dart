import 'package:flutter/material.dart';

import '../../car_booking_typography.dart';
import 'car_booking_driver_outline_field.dart';
import 'car_booking_profile_selector.dart';

/// **White card**: driver title, saved profiles, outlined fields (Trip-style).
class CarBookingDriverSection extends StatefulWidget {
  const CarBookingDriverSection({
    super.key,
    required this.givenNamesController,
    required this.surnameController,
    required this.ageController,
    required this.licenseCountryController,
    this.profiles = const ['AHMED KEMOUKH'],
  });

  final TextEditingController givenNamesController;
  final TextEditingController surnameController;
  final TextEditingController ageController;
  final TextEditingController licenseCountryController;
  final List<String> profiles;

  @override
  State<CarBookingDriverSection> createState() => _CarBookingDriverSectionState();
}

class _CarBookingDriverSectionState extends State<CarBookingDriverSection> {
  int _profileIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 16),
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
          Row(
            children: [
              Expanded(child: Text('Driver details', style: CarBookingTypography.sectionTitle())),
              IconButton(
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                onPressed: () {},
                icon: Icon(Icons.info_outlined, size: 20, color: Colors.grey.shade500),
              ),
            ],
          ),
          const SizedBox(height: 12),
          CarBookingProfileSelector(
            profiles: widget.profiles,
            selectedIndex: _profileIndex,
            onSelected: (i) => setState(() => _profileIndex = i),
          ),
          const SizedBox(height: 14),
          CarBookingDriverOutlineField(
            controller: widget.givenNamesController,
            label: 'Given names',
          ),
          const SizedBox(height: 12),
          CarBookingDriverOutlineField(
            controller: widget.surnameController,
            label: 'Surname',
          ),
          const SizedBox(height: 12),
          CarBookingDriverOutlineField(
            controller: widget.ageController,
            label: "Driver's age",
            keyboardType: TextInputType.number,
            textCapitalization: TextCapitalization.none,
          ),
          const SizedBox(height: 12),
          CarBookingDriverOutlineField(
            controller: widget.licenseCountryController,
            label: "Driver's license issuing country/region",
            textCapitalization: TextCapitalization.words,
          ),
        ],
      ),
    );
  }
}
