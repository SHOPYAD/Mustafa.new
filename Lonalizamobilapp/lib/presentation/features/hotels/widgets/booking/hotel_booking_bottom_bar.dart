import 'package:flutter/material.dart';

class HotelBookingBottomBar extends StatelessWidget {
  const HotelBookingBottomBar({super.key, this.onBook});

  final VoidCallback? onBook;

  static const _blue = Color(0xFF7C3AED);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Material(
        elevation: 8,
        color: Colors.white,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Prepay Online (total price)',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: const Color(0xFF374151),
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          '\$105.12',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: _blue,
                                fontWeight: FontWeight.w800,
                                fontSize: 26,
                              ),
                        ),
                        const SizedBox(width: 6),
                        Icon(Icons.info_outline_rounded, size: 18, color: _blue),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              FilledButton(
                onPressed: onBook,
                style: FilledButton.styleFrom(
                  backgroundColor: _blue,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(120, 48),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Book',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
