import 'package:flutter/material.dart';

/// Notice tab content:
/// - Supplier contact section
/// - Booking notices (expandable rows)
/// - More recommendations (passed as child)
class PackageTourNoticeSection extends StatefulWidget {
  const PackageTourNoticeSection({super.key});

  @override
  State<PackageTourNoticeSection> createState() => _PackageTourNoticeSectionState();
}

class _PackageTourNoticeSectionState extends State<PackageTourNoticeSection> {
  static const _notices = [
    'Know before you book',
    'Know before you go',
    'Penalties',
    'Travel regulations',
    'Guarantee notice',
  ];
  final _expanded = <int, bool>{};

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Contact supplier section
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Please contact the supplier for more information',
                style: TextStyle(fontSize: 14, color: Color(0xFF374151), height: 1.5),
              ),
              const SizedBox(height: 14),
              GestureDetector(
                onTap: () {},
                child: Container(
                  width: double.infinity,
                  height: 46,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFD1D5DB)),
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'Contact supplier',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF2563EB)),
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),
        const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6)),

        // ── Booking notices section
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 20, 16, 8),
          child: Text(
            'Booking notices',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF111827)),
          ),
        ),

        ..._notices.asMap().entries.map((e) {
          final i = e.key;
          final isOpen = _expanded[i] ?? false;
          return Column(
            children: [
              const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6)),
              InkWell(
                onTap: () => setState(() => _expanded[i] = !isOpen),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              e.value,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF111827),
                              ),
                            ),
                          ),
                          Icon(
                            isOpen ? Icons.keyboard_arrow_up_rounded : Icons.chevron_right_rounded,
                            size: 20,
                            color: const Color(0xFF9CA3AF),
                          ),
                        ],
                      ),
                      if (isOpen) ...[
                        const SizedBox(height: 8),
                        Text(
                          _noticeBody(e.value),
                          style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280), height: 1.5),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          );
        }),
        const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6)),
        const SizedBox(height: 8),
      ],
    );
  }

  String _noticeBody(String title) {
    switch (title) {
      case 'Know before you book':
        return 'This tour requires a minimum number of participants. Please confirm availability before booking. Full payment is required at the time of booking.';
      case 'Know before you go':
        return 'Please bring valid travel ID/passport. Comfortable walking shoes are recommended. Dress appropriately for local culture and weather.';
      case 'Penalties':
        return 'Cancellations made 7+ days in advance: full refund.\nCancellations made 3–6 days in advance: 50% refund.\nCancellations made less than 3 days: no refund.';
      case 'Travel regulations':
        return 'All travelers must comply with local travel regulations and entry requirements. Please check visa requirements for your nationality.';
      case 'Guarantee notice':
        return 'This tour is covered by our Departure Guarantee. If the minimum group size is not met, your booking will be honored or fully refunded.';
      default:
        return '';
    }
  }
}
