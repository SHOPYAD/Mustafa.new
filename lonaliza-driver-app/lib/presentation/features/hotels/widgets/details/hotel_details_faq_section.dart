import 'package:flutter/material.dart';

/// FAQ block (no tab bar). Safe inside [CustomScrollView] / [SliverToBoxAdapter]:
/// uses [Column] + a bounded-height horizontal [ListView].
class HotelDetailsFaqSection extends StatelessWidget {
  const HotelDetailsFaqSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'You might be wondering',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF111827),
                ),
          ),
          const SizedBox(height: 14),
          SizedBox(
            height: 172,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: 2,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                return SizedBox(
                  width: 286,
                  height: 172,
                  child: index == 0
                      ? const _QuestionCard(
                          question: 'How much does breakfast cost?',
                          answer:
                              'Breakfast policy info:\nBreakfast provided: Yes...',
                        )
                      : const _QuestionCard(
                          question: 'How can I get to the hotel?',
                          answer:
                              'Airport transfer and taxi options are available.',
                        ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () {},
            child: Text(
              'See All Questions',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontSize: 15,
                    decoration: TextDecoration.underline,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF111827),
                  ),
            ),
          ),
          const SizedBox(height: 22),
          Text(
            'Still have questions?',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF111827),
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Get speedy answers to anything you might want to know',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF6B7280),
                  fontSize: 14,
                  height: 1.35,
                ),
          ),
          const SizedBox(height: 14),
          const _AskQuestionButton(),
        ],
      ),
    );
  }
}

class _QuestionCard extends StatelessWidget {
  const _QuestionCard({
    required this.question,
    required this.answer,
  });

  final String question;
  final String answer;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            question,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF111827),
                ),
          ),
          const SizedBox(height: 8),
          Text(
            answer,
            maxLines: 4,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF4B5563),
                  height: 1.35,
                ),
          ),
          const Spacer(),
          Row(
            children: [
              const CircleAvatar(
                radius: 10,
                backgroundColor: Color(0xFFE0E7FF),
                child: Icon(Icons.support_agent_rounded,
                    size: 12, color: Color(0xFF2563EB)),
              ),
              const SizedBox(width: 8),
              Text(
                'Property manager',
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: const Color(0xFF6B7280),
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AskQuestionButton extends StatelessWidget {
  const _AskQuestionButton();

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: () {},
      icon: const Icon(Icons.forum_outlined, size: 20),
      label: const Text('Ask a question'),
      style: OutlinedButton.styleFrom(
        foregroundColor: const Color(0xFF111827),
        minimumSize: const Size.fromHeight(48),
        side: const BorderSide(color: Color(0xFFD1D5DB)),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }
}
