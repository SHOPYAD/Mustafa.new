import 'package:flutter/material.dart';

/// Location block only (no tab bar). Safe inside [CustomScrollView].
class HotelDetailsLocationSection extends StatelessWidget {
  const HotelDetailsLocationSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Location',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontSize: 20,
                  color: const Color(0xFF111827),
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 10),
          const _LocationScoreRow(),
          const SizedBox(height: 12),
          const _MapCard(),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Expanded(
                child: Text(
                  'Aboualhol street, Qesm Al Wahat Al Kharqah, New Valley Governorate, Egypt',
                  style: TextStyle(
                    fontSize: 14,
                    height: 1.35,
                    color: Color(0xFF374151),
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ),
              IconButton(
                onPressed: () {},
                visualDensity: VisualDensity.compact,
                icon: const Icon(Icons.copy_outlined, size: 20, color: Color(0xFF6B7280)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Row(
            children: [
              _SmallChip(label: 'Transport', active: true),
              SizedBox(width: 8),
              _SmallChip(label: 'Dining'),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.flight_rounded, size: 18, color: Color(0xFF4B5563)),
              const SizedBox(width: 8),
              Expanded(
                child: Wrap(
                  spacing: 8,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Text(
                      'Assiut International Airport',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF111827),
                          ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'Airport',
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              fontSize: 11,
                              color: const Color(0xFF6B7280),
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '20.8 miles',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontSize: 14,
                      color: const Color(0xFF6B7280),
                    ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          GestureDetector(
            onTap: () {},
            child: Text(
              'Show all surroundings',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF2563EB),
                    decoration: TextDecoration.underline,
                    decorationColor: const Color(0xFF2563EB),
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LocationScoreRow extends StatelessWidget {
  const _LocationScoreRow();

  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontSize: 16,
              color: const Color(0xFF111827),
              fontWeight: FontWeight.w500,
            ),
        children: const [
          TextSpan(
            text: '9.5',
            style: TextStyle(
              color: Color(0xFF2563EB),
              fontWeight: FontWeight.w800,
            ),
          ),
          TextSpan(
            text: ' ',
          ),
          TextSpan(
            text: '/10',
            style: TextStyle(
              color: Color(0xFF6B7280),
              fontWeight: FontWeight.w600,
            ),
          ),
          TextSpan(
            text: '  Outstanding Location',
            style: TextStyle(
              color: Color(0xFF111827),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _MapCard extends StatelessWidget {
  const _MapCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: SizedBox(
          height: 176,
          child: Stack(
            fit: StackFit.expand,
            children: [
              ColoredBox(
                color: const Color(0xFFF3F0E4),
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: const BoxDecoration(
                      color: Color(0xFF2563EB),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.bed_outlined, color: Colors.white, size: 22),
                  ),
                ),
              ),
              Positioned(
                right: 8,
                bottom: 8,
                child: Material(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  elevation: 1,
                  child: InkWell(
                    onTap: () {},
                    borderRadius: BorderRadius.circular(8),
                    child: const Padding(
                      padding: EdgeInsets.all(6),
                      child: Icon(Icons.open_in_full_rounded, size: 16, color: Color(0xFF374151)),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SmallChip extends StatelessWidget {
  const _SmallChip({required this.label, this.active = false});

  final String label;
  final bool active;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: active ? const Color(0xFFEAF1FF) : const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: active ? const Color(0xFFB9D2FF) : const Color(0xFFD1D5DB),
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: active ? const Color(0xFF1D4ED8) : const Color(0xFF374151),
          fontWeight: FontWeight.w600,
          fontSize: 13,
        ),
      ),
    );
  }
}
