import 'package:flutter/material.dart';

import '../../car_booking_theme.dart';

/// White card: Contact list link, phone (+prefix), email, save default checkbox.
class CarBookingContactSection extends StatelessWidget {
  const CarBookingContactSection({
    super.key,
    required this.phoneController,
    required this.emailController,
    required this.saveDefault,
    required this.onSaveDefaultChanged,
    this.countryCodeLabel = '+86',
  });

  final TextEditingController phoneController;
  final TextEditingController emailController;
  final bool saveDefault;
  final ValueChanged<bool> onSaveDefaultChanged;
  final String countryCodeLabel;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Expanded(child: Text('Contact info', style: CarBookingTheme.sectionTitle)),
              TextButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.person_outline_rounded, size: 18),
                label: const Text('Contact list'),
                style: TextButton.styleFrom(
                  foregroundColor: CarBookingTheme.primaryBlue,
                  textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: phoneController,
            keyboardType: TextInputType.phone,
            decoration: InputDecoration(
              labelText: 'Mobile phone number',
              floatingLabelBehavior: FloatingLabelBehavior.always,
              border: const OutlineInputBorder(),
              prefixIcon: Padding(
                padding: const EdgeInsets.only(left: 8, right: 4),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(countryCodeLabel, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    const Icon(Icons.keyboard_arrow_down_rounded, size: 20),
                  ],
                ),
              ),
              prefixIconConstraints: const BoxConstraints(minWidth: 72),
            ),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'Email',
              floatingLabelBehavior: FloatingLabelBehavior.always,
              border: OutlineInputBorder(),
            ),
          ),
          CheckboxListTile(
            contentPadding: EdgeInsets.zero,
            controlAffinity: ListTileControlAffinity.leading,
            title: const Text('Save as default', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            value: saveDefault,
            onChanged: (v) => onSaveDefaultChanged(v ?? false),
            fillColor: WidgetStateProperty.resolveWith(
              (states) => states.contains(WidgetState.selected) ? CarBookingTheme.primaryBlue : null,
            ),
          ),
        ],
      ),
    );
  }
}
