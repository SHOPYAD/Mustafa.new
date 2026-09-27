import 'package:flutter/material.dart';
import 'package:lonaliza_driver/core/extensions/context_l10n.dart';

class FlightAiAssistantCard extends StatelessWidget {
  const FlightAiAssistantCard({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Icon(Icons.auto_awesome, color: Color(0xFF2F60F5), size: 24),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  l10n.aiAssistantBaggageTitle,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1F2937),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildQuestionTile(l10n.aiQuestion1),
          _buildQuestionTile(l10n.aiQuestion2),
          _buildQuestionTile(l10n.aiQuestion3),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerLeft,
            child: Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF00A2FF), Color(0xFF6B42F6)],
                ),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {},
                  borderRadius: BorderRadius.circular(6),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Text(
                      l10n.askAiAssistant,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(width: 20, height: 4, decoration: BoxDecoration(color: const Color(0xFF2F60F5), borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 4),
              Container(width: 4, height: 4, decoration: const BoxDecoration(color: Color(0xFFD1D5DB), shape: BoxShape.circle)),
              const SizedBox(width: 4),
              Container(width: 4, height: 4, decoration: const BoxDecoration(color: Color(0xFFD1D5DB), shape: BoxShape.circle)),
            ],
          ),
          const SizedBox(height: 24),
          Text(
            l10n.bookWithConfidence,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.emoji_events, size: 16, color: Color(0xFF00A2FF)),
              const SizedBox(width: 4),
              Text(l10n.awardWinning, style: const TextStyle(fontSize: 13, color: Color(0xFF4B5563))),
              const SizedBox(width: 12),
              const Icon(Icons.verified, size: 16, color: Color(0xFF0E766E)),
              const SizedBox(width: 4),
              Text(l10n.supportApprox30s, style: const TextStyle(fontSize: 13, color: Color(0xFF4B5563))),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.monetization_on, size: 16, color: Color(0xFFF59E0B)),
              const SizedBox(width: 4),
              Text(l10n.rewardsForBooking, style: const TextStyle(fontSize: 13, color: Color(0xFF4B5563))),
            ],
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildQuestionTile(String text) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE5E7EB)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 15, color: Color(0xFF374151)),
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.keyboard_arrow_right_rounded, size: 20, color: Color(0xFF9CA3AF)),
        ],
      ),
    );
  }
}
