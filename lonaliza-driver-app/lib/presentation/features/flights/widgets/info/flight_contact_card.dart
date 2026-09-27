import 'package:flutter/material.dart';

class FlightContactCard extends StatelessWidget {
  const FlightContactCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Contact',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF1F2937),
                ),
              ),
              Text(
                'Done',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF2F60F5).withValues(alpha: 0.9),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          _buildTextField(
            label: 'Contact name',
            initialValue: 'AHMED KEMOUKH',
          ),
          const SizedBox(height: 16),
          
          Row(
            children: [
              Container(
                width: 70,
                height: 54,
                decoration: BoxDecoration(
                  border: Border.all(color: const Color(0xFFD1D5DB)),
                  borderRadius: const BorderRadius.horizontal(left: Radius.circular(4)),
                ),
                alignment: Alignment.center,
                child: const Text('+1', style: TextStyle(fontSize: 16, color: Color(0xFF1F2937))),
              ),
              Expanded(
                child: Container(
                  height: 54,
                  decoration: const BoxDecoration(
                    border: Border(
                      top: BorderSide(color: Color(0xFFD1D5DB)),
                      bottom: BorderSide(color: Color(0xFFD1D5DB)),
                      right: BorderSide(color: Color(0xFFD1D5DB)),
                    ),
                    borderRadius: BorderRadius.horizontal(right: Radius.circular(4)),
                  ),
                  alignment: Alignment.centerLeft,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: const Text('Phone number', style: TextStyle(fontSize: 16, color: Color(0xFF9CA3AF))),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          _buildTextField(
            label: 'Email',
            initialValue: 'ahmedkemoukh@gmail.com',
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({required String label, String? initialValue}) {
    return Container(
      height: 54,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFD1D5DB)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            top: -10,
            left: -4,
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Text(
                label,
                style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
              ),
            ),
          ),
          Center(
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    initialValue ?? '',
                    style: const TextStyle(fontSize: 16, color: Color(0xFF1F2937)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
