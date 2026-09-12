import 'package:flutter/material.dart';

const _flightClasses = <String>[
  'Economy',
  'Economy/premium economy',
  'Premium Economy',
  'Business/First',
  'Business',
  'First',
];

Future<String?> showFlightsClassSheet(
  BuildContext context, {
  required String initialValue,
}) {
  return showModalBottomSheet<String>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return FractionallySizedBox(
        heightFactor: 0.52,
        child: FlightsClassSheet(initialValue: initialValue),
      );
    },
  );
}

class FlightsClassSheet extends StatefulWidget {
  const FlightsClassSheet({
    super.key,
    required this.initialValue,
  });

  final String initialValue;

  @override
  State<FlightsClassSheet> createState() => _FlightsClassSheetState();
}

class _FlightsClassSheetState extends State<FlightsClassSheet> {
  late String _selectedClass;

  @override
  void initState() {
    super.initState();
    _selectedClass = widget.initialValue;
  }

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
              child: Row(
                children: [
                  const SizedBox(width: 48),
                  Expanded(
                    child: Text(
                      'Class',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: const Color(0xFF111827),
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ),
                  const SizedBox(width: 48),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFFE5E7EB)),
            Expanded(
              child: ListView.separated(
                itemCount: _flightClasses.length,
                separatorBuilder: (context, index) =>
                    const Divider(height: 1, color: Color(0xFFE5E7EB)),
                itemBuilder: (context, index) {
                  final flightClass = _flightClasses[index];
                  final isSelected = flightClass == _selectedClass;

                  return InkWell(
                    onTap: () {
                      setState(() => _selectedClass = flightClass);
                      Navigator.of(context).pop(flightClass);
                    },
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              flightClass,
                              style: Theme.of(context).textTheme.titleMedium
                                  ?.copyWith(
                                fontSize: 16,
                                color: isSelected
                                    ? const Color(0xFF3157C8)
                                    : const Color(0xFF111827),
                                fontWeight: isSelected
                                    ? FontWeight.w500
                                    : FontWeight.w400,
                              ),
                            ),
                          ),
                          if (isSelected)
                            const Icon(
                              Icons.check_rounded,
                              color: Color(0xFF3157C8),
                              size: 20,
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
