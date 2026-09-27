import 'package:flutter/material.dart';

class FlightBookingStepper extends StatelessWidget {
  const FlightBookingStepper({super.key, this.currentStep = 1, this.totalSteps = 4});

  final int currentStep;
  final int totalSteps;

  @override
  Widget build(BuildContext context) {
    List<Widget> children = [];
    for (int i = 1; i <= totalSteps; i++) {
      children.add(_buildStep(i, currentStep >= i, currentStep > i));
      if (i < totalSteps) {
        children.add(_buildLine());
      }
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: children,
    );
  }

  Widget _buildStep(int step, bool isActive, bool isCompleted) {
    return Container(
      width: 18,
      height: 18,
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFF1F2937) : const Color(0xFF9CA3AF),
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: isCompleted
          ? const Icon(Icons.check, size: 12, color: Colors.white)
          : Text(
              '$step',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
    );
  }

  Widget _buildLine() {
    return Container(
      width: 12,
      height: 1.5,
      color: const Color(0xFFD1D5DB),
    );
  }
}
