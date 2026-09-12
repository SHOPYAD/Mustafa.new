import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

/// Light blue survey card ("Does the product information…").
class CarRentalFeedbackPromptCard extends StatefulWidget {
  const CarRentalFeedbackPromptCard({super.key});

  @override
  State<CarRentalFeedbackPromptCard> createState() => _CarRentalFeedbackPromptCardState();
}

class _CarRentalFeedbackPromptCardState extends State<CarRentalFeedbackPromptCard> {
  bool _visible = true;

  @override
  Widget build(BuildContext context) {
    if (!_visible) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      child: Material(
        color: const Color(0xFFE8F1FF),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(14, 12, 10, 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Expanded(
                    child: Text(
                      'Does the product information meet your expectations?',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: CarRentalProductTheme.titleDark,
                        height: 1.35,
                      ),
                    ),
                  ),
                  IconButton(
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                    onPressed: () => setState(() => _visible = false),
                    icon: const Icon(Icons.close_rounded, size: 20),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _AnswerChip('Yes, absolutely'),
                  _AnswerChip('Yes'),
                  _AnswerChip('Neutral'),
                  _AnswerChip('Not quite'),
                  _AnswerChip('Not at all'),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AnswerChip extends StatelessWidget {
  const _AnswerChip(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: Text(
            label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: CarRentalProductTheme.metaGrey),
          ),
        ),
      ),
    );
  }
}
