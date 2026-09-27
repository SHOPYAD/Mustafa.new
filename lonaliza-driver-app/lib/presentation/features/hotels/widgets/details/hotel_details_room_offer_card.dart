import 'package:flutter/material.dart';

/// One bookable room row/card (simplified room tile for hotel details).
class HotelDetailsRoomOfferCard extends StatelessWidget {
  const HotelDetailsRoomOfferCard({
    super.key,
    required this.title,
    required this.imageAsset,
    required this.bedLabel,
    required this.sizeLabel,
    required this.viewLabel,
    required this.smokingLabel,
    required this.price,
    required this.strikePrice,
    this.galleryCount = 9,
    this.onReserve,
  });

  final String title;
  final String imageAsset;
  final String bedLabel;
  final String sizeLabel;
  final String viewLabel;
  final String smokingLabel;
  final String price;
  final String strikePrice;
  final int galleryCount;
  final VoidCallback? onReserve;

  static const _blue = Color(0xFF2563EB);
  static const _muted = Color(0xFF6B7280);
  static const _teal = Color(0xFF0F766E);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            height: 152,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(imageAsset, fit: BoxFit.cover),
                Positioned(
                  right: 8,
                  bottom: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.55),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.photo_library_outlined, size: 13, color: Colors.white),
                        const SizedBox(width: 4),
                        Text(
                          '$galleryCount',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w800,
                              color: const Color(0xFF111827),
                            ),
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded, color: _muted),
                  ],
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 14,
                  runSpacing: 8,
                  children: [
                    _InlineFact(icon: Icons.bed_outlined, text: bedLabel),
                    _InlineFact(icon: Icons.straighten_outlined, text: sizeLabel),
                    _InlineFact(icon: Icons.crop_free_rounded, text: viewLabel),
                    _InlineFact(icon: Icons.smoke_free_outlined, text: smokingLabel),
                  ],
                ),
              ],
            ),
          ),
          Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Lowest price with meal(s)',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: _teal,
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 8),
                _BenefitLine(icon: Icons.restaurant_menu_outlined, text: 'Includes breakfast for 2 guests', color: _teal),
                _BenefitLine(icon: Icons.price_change_outlined, text: '$strikePrice cancellation fee'),
                _BenefitLine(icon: Icons.flash_on_outlined, text: 'Instant confirmation'),
                _BenefitLine(icon: Icons.credit_card_outlined, text: 'Prepay online'),
                _BenefitLine(icon: Icons.person_outline_rounded, text: 'Price for 2 adults'),
                const SizedBox(height: 6),
                Text(
                  'See details',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: _blue,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 10),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Spacer(),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'Special Discount',
                          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                color: const Color(0xFFEC4899),
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              strikePrice,
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: _muted,
                                    decoration: TextDecoration.lineThrough,
                                  ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              price,
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    color: _blue,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 34,
                                  ),
                            ),
                          ],
                        ),
                        Text(
                          'Total price: \$331',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: const Color(0xFF374151),
                                fontWeight: FontWeight.w500,
                              ),
                        ),
                        Text(
                          '1 room × 2 nights incl. taxes & fees',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: _muted),
                        ),
                        Text(
                          'Earn \$3.31 in Trip Coins',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: const Color(0xFFCA8A04),
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {},
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF374151),
                          side: const BorderSide(color: Color(0xFFD1D5DB)),
                          minimumSize: const Size.fromHeight(44),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Rooms', style: TextStyle(fontWeight: FontWeight.w600)),
                            Row(
                              children: [
                                Text('1', style: TextStyle(fontWeight: FontWeight.w700)),
                                SizedBox(width: 4),
                                Icon(Icons.keyboard_arrow_down_rounded),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton(
                        onPressed: onReserve,
                        style: FilledButton.styleFrom(
                          backgroundColor: _blue,
                          foregroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(44),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text(
                          'Reserve',
                          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InlineFact extends StatelessWidget {
  const _InlineFact({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: const Color(0xFF6B7280)),
        const SizedBox(width: 4),
        Text(
          text,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontSize: 12,
                color: const Color(0xFF4B5563),
                fontWeight: FontWeight.w500,
              ),
        ),
      ],
    );
  }
}

class _BenefitLine extends StatelessWidget {
  const _BenefitLine({
    required this.icon,
    required this.text,
    this.color = const Color(0xFF374151),
  });

  final IconData icon;
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: color,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
