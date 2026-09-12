import 'package:flutter/material.dart';

class FlightInsuranceCard extends StatelessWidget {
  const FlightInsuranceCard({super.key});

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
                'Add Insurance',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF1F2937),
                ),
              ),
              Row(
                children: [
                  const Text('Provided by ', style: TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
                  // Dummy AXA logo box
                  Container(
                    width: 20,
                    height: 14,
                    color: const Color(0xFF1B1464),
                    alignment: Alignment.center,
                    child: const Text('AXA', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Option 1: Unchecked
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF9FAFB),
              border: Border.all(color: const Color(0xFFE5E7EB)),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.warning_amber_rounded, color: Color(0xFFD97706), size: 20),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    "I don't want to protect my trip",
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFFD97706)),
                  ),
                ),
                Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF9CA3AF), width: 1.5),
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 12),
          
          // Option 2: Checked
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDFB),
              border: Border.all(color: const Color(0xFF0E766E).withValues(alpha: 0.3)),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      const Icon(Icons.shield, color: Color(0xFF0E766E), size: 16),
                      const SizedBox(width: 6),
                      const Text(
                        'Protection Plans',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF0E766E)),
                      ),
                      const Spacer(),
                    ],
                  ),
                ),
                Container(height: 1, color: Colors.white),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Travel Insurance',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1F2937)),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Text('Policy of Insurance by State', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                                const Icon(Icons.keyboard_arrow_right_rounded, size: 14, color: Color(0xFF6B7280)),
                              ],
                            ),
                            const SizedBox(height: 12),
                            _buildCheckRow('Trip Cancellation and Interruption Coverage - up to ', '100% of trip cost (max. \$10,000 per person)'),
                            _buildCheckRow('Trip Delay Coverage - max. ', '\$2,000 per person'),
                            _buildCheckRow('Emergency Accident and Sickness Medical Expenses - max. ', '\$50,000 per person'),
                            _buildCheckRow('Baggage/Personal Effects Coverage - max. ', '\$1,000 per person'),
                            const SizedBox(height: 12),
                            RichText(
                              text: const TextSpan(
                                children: [
                                  TextSpan(text: '\$45.81', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF7C3AED))),
                                  TextSpan(text: '/adult', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        width: 20,
                        height: 20,
                        margin: const EdgeInsets.only(top: 2),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF9CA3AF), width: 1.5),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          const Text(
            'By selecting travel insurance you are confirming that everyone on the booking is a US resident and that you have read and accept the Purchase Terms and Conditions of the Travel Protection Plan...',
            style: TextStyle(fontSize: 12, color: Color(0xFF7C3AED), height: 1.4),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckRow(String text1, String text2) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 2),
            child: Icon(Icons.check, size: 14, color: Color(0xFF0E766E)),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: const TextStyle(fontSize: 13, color: Color(0xFF374151), height: 1.3),
                children: [
                  TextSpan(text: text1),
                  TextSpan(text: text2, style: const TextStyle(color: Color(0xFF0E766E))),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
