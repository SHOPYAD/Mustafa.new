import 'package:flutter/material.dart';

class MyTripsEmptyState extends StatelessWidget {
  const MyTripsEmptyState({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Reconstructed binocular/map illustration
          SizedBox(
            width: 80,
            height: 80,
            child: Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  width: 70,
                  height: 70,
                  decoration: const BoxDecoration(
                    color: Color(0xFFE0E7FF),
                    shape: BoxShape.circle,
                  ),
                ),
                Positioned(
                  bottom: 10,
                  child: Container(
                    width: 50,
                    height: 40,
                    decoration: const BoxDecoration(
                      color: Color(0xFFFFBBA6), // Skin tone
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(20),
                        topRight: Radius.circular(20),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 8,
                  child: Container(width: 40, height: 25, color: const Color(0xFF93C5FD)), // Map simulation
                ),
                Positioned(
                  top: 25,
                  child: Icon(Icons.travel_explore, color: const Color(0xFF3B82F6), size: 30),
                ),
                Positioned(
                  top: 15,
                  left: 20,
                  child: Container(
                    width: 15,
                    height: 15,
                    decoration: const BoxDecoration(color: Color(0xFFFCD34D), shape: BoxShape.circle), // Hair simulation
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 24),
          const Text(
            'No Upcoming Trips',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1F2937),
            ),
          ),
        ],
      ),
    );
  }
}
