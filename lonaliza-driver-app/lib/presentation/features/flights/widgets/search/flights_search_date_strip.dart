import 'package:flutter/material.dart';

class FlightsSearchDateStrip extends StatelessWidget {
  const FlightsSearchDateStrip({
    super.key,
    required this.days,
    required this.selectedIndex,
    required this.onSelected,
  });

  final List<FlightsSearchDay> days;
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 64,
      child: Row(
        children: [
          Expanded(
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: days.length,
              separatorBuilder: (context, index) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final day = days[index];
                final isSelected = index == selectedIndex;

                return _DateChip(
                  day: day,
                  isSelected: isSelected,
                  onTap: () => onSelected(index),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 12, left: 4),
            child: IconButton(
              onPressed: () {},
              icon: const Icon(Icons.calendar_month_outlined),
              color: const Color(0xFF111827),
            ),
          ),
        ],
      ),
    );
  }
}

class FlightsSearchDay {
  const FlightsSearchDay({
    required this.label,
    required this.price,
  });

  final String label;
  final String price;
}

class _DateChip extends StatelessWidget {
  const _DateChip({
    required this.day,
    required this.isSelected,
    required this.onTap,
  });

  final FlightsSearchDay day;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final labelStyle = Theme.of(context).textTheme.titleSmall?.copyWith(
          fontWeight: FontWeight.w600,
          color: isSelected ? Colors.white : const Color(0xFF111827),
        );
    final priceStyle = Theme.of(context).textTheme.bodySmall?.copyWith(
          color: isSelected ? Colors.white : const Color(0xFF4B5563),
          fontWeight: FontWeight.w500,
        );

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          width: isSelected ? 110 : 80,
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF2F60F5) : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                day.label,
                maxLines: 1,
                overflow: TextOverflow.clip,
                softWrap: false,
                style: labelStyle,
              ),
              const SizedBox(height: 2),
              Text(
                day.price,
                maxLines: 1,
                overflow: TextOverflow.clip,
                softWrap: false,
                style: priceStyle,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
