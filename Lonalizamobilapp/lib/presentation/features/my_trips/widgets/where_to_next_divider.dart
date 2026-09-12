import 'package:flutter/material.dart';

class WhereToNextDivider extends StatelessWidget {
  const WhereToNextDivider({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: Row(
        children: [
          const Expanded(child: Divider(color: Color(0xFFE5E7EB), thickness: 1)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Where to Next?',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.grey.shade500,
              ),
            ),
          ),
          const Expanded(child: Divider(color: Color(0xFFE5E7EB), thickness: 1)),
        ],
      ),
    );
  }
}
