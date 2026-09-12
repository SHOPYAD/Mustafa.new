import 'package:flutter/material.dart';

/// Contact info form: name, phone, email
class PackageBookingContactInfo extends StatefulWidget {
  const PackageBookingContactInfo({super.key});

  @override
  State<PackageBookingContactInfo> createState() => _PackageBookingContactInfoState();
}

class _PackageBookingContactInfoState extends State<PackageBookingContactInfo> {
  final _nameCtrl = TextEditingController(text: 'AHMED KEMOUKH');
  final _phoneCtrl = TextEditingController(text: '659393756');
  final _emailCtrl = TextEditingController(text: 'ahmedkemoukh@gmail.com');

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Contact info',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
          const SizedBox(height: 14),
          _FloatingField(label: 'Name', controller: _nameCtrl, keyboardType: TextInputType.name),
          const SizedBox(height: 10),
          // Phone with country code
          _PhoneField(controller: _phoneCtrl),
          const SizedBox(height: 10),
          _FloatingField(label: 'Contact email', controller: _emailCtrl, keyboardType: TextInputType.emailAddress),
        ],
      ),
    );
  }
}

// ── Text field with floating label border
class _FloatingField extends StatelessWidget {
  const _FloatingField({required this.label, required this.controller, this.keyboardType});
  final String label;
  final TextEditingController controller;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      style: const TextStyle(fontSize: 14, color: Color(0xFF111827)),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(fontSize: 13, color: Color(0xFF9CA3AF)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFF7C3AED), width: 1.5),
        ),
      ),
    );
  }
}

// ── Phone field with country code prefix
class _PhoneField extends StatelessWidget {
  const _PhoneField({required this.controller});
  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: TextInputType.phone,
      style: const TextStyle(fontSize: 14, color: Color(0xFF111827)),
      decoration: InputDecoration(
        labelText: 'Contact mobile number',
        labelStyle: const TextStyle(fontSize: 13, color: Color(0xFF9CA3AF)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        prefixIcon: GestureDetector(
          onTap: () {},
          child: const Padding(
            padding: EdgeInsets.symmetric(horizontal: 10, vertical: 14),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('+213', style: TextStyle(fontSize: 14, color: Color(0xFF111827), fontWeight: FontWeight.w500)),
                SizedBox(width: 4),
                Icon(Icons.chevron_right_rounded, size: 16, color: Color(0xFF6B7280)),
              ],
            ),
          ),
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFF7C3AED), width: 1.5),
        ),
      ),
    );
  }
}
