import 'package:flutter/material.dart';

import 'messages_category_bar.dart';

class MessagesHeader extends StatelessWidget {
  const MessagesHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFFE4E9FF),
            Color(0xFFEEF1F8),
            Color(0xFFF4F6FB),
          ],
          stops: [0.0, 0.45, 1.0],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 8, 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'Messages',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF111827),
                      letterSpacing: -0.6,
                      height: 1.05,
                    ),
                  ),
                  Container(
                    width: 7,
                    height: 7,
                    margin: const EdgeInsets.only(left: 4, bottom: 8),
                    decoration: const BoxDecoration(
                      color: Color(0xFFFFC107),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () {},
                    icon: Icon(Icons.cleaning_services_outlined, size: 24, color: Colors.grey.shade900),
                    visualDensity: VisualDensity.compact,
                  ),
                  IconButton(
                    onPressed: () {},
                    icon: Icon(Icons.headset_mic_outlined, size: 24, color: Colors.grey.shade900),
                    visualDensity: VisualDensity.compact,
                  ),
                ],
              ),
            ),
          ),
          const MessagesCategoryBar(),
        ],
      ),
    );
  }
}
