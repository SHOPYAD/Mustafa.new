import 'package:flutter/material.dart';

class HotelBookingGuestInfoSection extends StatelessWidget {
  const HotelBookingGuestInfoSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              'Guest info',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF111827),
                  ),
            ),
            const SizedBox(width: 6),
            Icon(Icons.info_outline_rounded, size: 18, color: Colors.grey.shade600),
            const Spacer(),
            OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(44, 36),
                padding: const EdgeInsets.symmetric(horizontal: 10),
                side: BorderSide(color: Colors.grey.shade300),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.door_front_door_outlined, size: 16, color: Colors.grey.shade700),
                  const SizedBox(width: 4),
                  Text('1', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.grey.shade800)),
                ],
              ),
            ),
            const SizedBox(width: 8),
            OutlinedButton.icon(
              onPressed: () {},
              icon: Icon(Icons.person_add_alt_1_outlined, size: 18, color: Colors.grey.shade800),
              label: const Text('Select'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(0, 36),
                padding: const EdgeInsets.symmetric(horizontal: 10),
                side: BorderSide(color: Colors.grey.shade300),
                foregroundColor: const Color(0xFF111827),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        const _LabeledField(
          label: 'First name*',
          value: 'AHMED',
          showCheck: true,
        ),
        const SizedBox(height: 10),
        const _LabeledField(
          label: 'Last name*',
          value: 'KEMOUKH',
          showCheck: true,
        ),
        const SizedBox(height: 10),
        const _LabeledField(
          label: 'Email*',
          value: 'ahmedkemoukh@gmail.com',
          showCheck: true,
        ),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.lightbulb_outline_rounded, size: 18, color: Colors.blue.shade600),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Check your email - the host will use it to send you info about your stay',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: const Color(0xFF1E40AF),
                        height: 1.35,
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        const _MobileField(),
      ],
    );
  }
}

class _LabeledField extends StatelessWidget {
  const _LabeledField({
    required this.label,
    required this.value,
    this.showCheck = false,
  });

  final String label;
  final String value;
  final bool showCheck;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      initialValue: value,
      readOnly: true,
      decoration: InputDecoration(
        labelText: label,
        floatingLabelBehavior: FloatingLabelBehavior.always,
        suffixIcon: showCheck
            ? const Icon(Icons.check_circle_rounded, color: Color(0xFF16A34A), size: 22)
            : null,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFF7C3AED)),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      ),
    );
  }
}

class _MobileField extends StatelessWidget {
  const _MobileField();

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      initialValue: '659393756',
      readOnly: true,
      decoration: InputDecoration(
        labelText: 'Mobile*',
        floatingLabelBehavior: FloatingLabelBehavior.always,
        prefixIcon: Padding(
          padding: const EdgeInsets.only(left: 8, right: 4),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '+1',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF111827),
                    ),
              ),
              Icon(Icons.keyboard_arrow_down_rounded, size: 18, color: Colors.grey.shade700),
            ],
          ),
        ),
        prefixIconConstraints: const BoxConstraints(minWidth: 56, minHeight: 0),
        suffixIcon: const Icon(Icons.check_circle_rounded, color: Color(0xFF16A34A), size: 22),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      ),
    );
  }
}
