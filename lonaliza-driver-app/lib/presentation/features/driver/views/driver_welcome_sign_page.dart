import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../core/theme/app_theme.dart';

class DriverWelcomeSignPage extends StatefulWidget {
  const DriverWelcomeSignPage({
    super.key,
    required this.passengerName,
    this.flightNumber,
    this.companyName,
    this.hotelOrDestination,
  });

  final String passengerName;
  final String? flightNumber;
  final String? companyName;
  final String? hotelOrDestination;

  static void open(
    BuildContext context, {
    required String passengerName,
    String? flightNumber,
    String? companyName,
    String? hotelOrDestination,
  }) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => DriverWelcomeSignPage(
          passengerName: passengerName,
          flightNumber: flightNumber,
          companyName: companyName,
          hotelOrDestination: hotelOrDestination,
        ),
      ),
    );
  }

  @override
  State<DriverWelcomeSignPage> createState() => _DriverWelcomeSignPageState();
}

class _DriverWelcomeSignPageState extends State<DriverWelcomeSignPage> {
  bool _brightnessMax = false;

  @override
  void initState() {
    super.initState();
    // Rotate to landscape for airport greeting
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
      DeviceOrientation.portraitUp,
    ]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  }

  @override
  void dispose() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070414),
      body: Stack(
        children: [
          // Background Glow
          Center(
            child: Container(
              width: 500,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFFD97706).withValues(alpha: 0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Main Greeting Canvas
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Top VIP Crown Badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD97706).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFD97706), width: 1.5),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.workspace_premium_rounded, color: Color(0xFFD97706), size: 18),
                            SizedBox(width: 8),
                            Text(
                              'LONALIZA VIP GUEST',
                              style: TextStyle(
                                color: Color(0xFFD97706),
                                fontWeight: FontWeight.w900,
                                fontSize: 13,
                                letterSpacing: 2,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Passenger Name in Grand VIP Typography
                  Text(
                    widget.passengerName,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: 1.5,
                      shadows: [
                        Shadow(color: Color(0xFFD97706), blurRadius: 20),
                      ],
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 16),

                  // Flight, Partner and Destination Subtitle
                  if (widget.flightNumber != null || widget.companyName != null || widget.hotelOrDestination != null)
                    Wrap(
                      alignment: WrapAlignment.center,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 16,
                      children: [
                        if (widget.flightNumber != null && widget.flightNumber!.isNotEmpty) ...[
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.flight_land_rounded, color: Colors.white70, size: 20),
                              const SizedBox(width: 6),
                              Text(
                                widget.flightNumber!.toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white70,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                        ],
                        if (widget.hotelOrDestination != null && widget.hotelOrDestination!.isNotEmpty) ...[
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.hotel_rounded, color: AppColors.gold, size: 18),
                              const SizedBox(width: 6),
                              Text(
                                widget.hotelOrDestination!,
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white70),
                              ),
                            ],
                          ),
                        ],
                        if (widget.companyName != null)
                          Text(
                            widget.companyName!,
                            style: const TextStyle(fontSize: 14, color: Colors.white60),
                          ),
                      ],
                    ),
                ],
              ),
            ),
          ),

          // Exit Button
          Positioned(
            top: 20,
            right: 20,
            child: IconButton(
              icon: const Icon(Icons.close_fullscreen_rounded, color: Colors.white70),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
        ],
      ),
    );
  }
}
