import 'package:flutter/material.dart';

class FlightAirhelpCard extends StatelessWidget {
  const FlightAirhelpCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Banner area
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF0D9488), Color(0xFF14B8A6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Row(
              children: [
                const Expanded(
                  child: Text(
                    "Flight delayed or\ncanceled? We'll help you\nget compensation.",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      height: 1.2,
                    ),
                  ),
                ),
                // Emulating the illustration with an icon + shape since we don't have the exact image
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 80,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    const Icon(Icons.support_agent_rounded, size: 48, color: Colors.white),
                  ],
                ),
              ],
            ),
          ),
          
          // Content area
          Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                left: BorderSide(color: Color(0xFF0D9488), width: 3),
                right: BorderSide(color: Color(0xFF0D9488), width: 3),
              ),
            ),
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE6F4F1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.flight_takeoff, size: 16, color: Color(0xFF0D9488)),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'AirHelp',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1F2937)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Essential plan
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Essential plan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1F2937))),
                          Container(
                            width: 20,
                            height: 20,
                            decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0xFF9CA3AF), width: 1.5)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _buildFeatureRow('Up to €600.00 (approx. \$701.00) compensation for flight delays and cancellations – don\'t worry, AirHelp specialists will handle the entire process!'),
                      _buildFeatureRow('Up to €6,000.00 (approx. \$7,015.00) for additional expenses (lost baggage or missed hotel bookings)'),
                      _buildFeatureRow('24/7 live chat support from AirHelp'),
                      _buildFeatureRow('AirHelp\'s specialists handle the entire process of getting your compensation'),
                      const SizedBox(height: 12),
                      RichText(
                        text: const TextSpan(
                          children: [
                            TextSpan(text: '\$17.30', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF7C3AED))),
                            TextSpan(text: '/person', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 12),
                
                // Complete plan
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Complete plan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1F2937))),
                            const SizedBox(height: 4),
                            const Text('+ Includes 5 benefit', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                            const SizedBox(height: 12),
                            RichText(
                              text: const TextSpan(
                                children: [
                                  TextSpan(text: '\$28.90', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF7C3AED))),
                                  TextSpan(text: '/person', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        width: 20,
                        height: 20,
                        margin: const EdgeInsets.only(top: 2),
                        decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0xFF9CA3AF), width: 1.5)),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 12),
                
                // No flexibility
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('No flexibility', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1F2937))),
                      Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF7C3AED), width: 5),
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 16),
              ],
            ),
          ),
          
          // Footer
          Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                left: BorderSide(color: Color(0xFF0D9488), width: 3),
                right: BorderSide(color: Color(0xFF0D9488), width: 3),
                bottom: BorderSide(color: Color(0xFF0D9488), width: 3),
              ),
              borderRadius: BorderRadius.only(bottomLeft: Radius.circular(12), bottomRight: Radius.circular(12)),
            ),
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Text('Terms & Conditions', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                    Icon(Icons.keyboard_arrow_right_rounded, size: 16, color: Color(0xFF6B7280)),
                  ],
                ),
                Row(
                  children: [
                    const Text('Provided by ', style: TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
                    Text('AirHelp+', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: const Color(0xFF0D9488).withValues(alpha: 0.9))),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureRow(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 2),
            child: Icon(Icons.check, size: 16, color: Color(0xFF0D9488)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13, color: Color(0xFF4B5563), height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}
