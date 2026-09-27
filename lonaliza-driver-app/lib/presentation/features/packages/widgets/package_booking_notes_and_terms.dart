import 'package:flutter/material.dart';

/// "Add notes" textarea + terms checkbox + booking confirmation notice
class PackageBookingNotesAndTerms extends StatefulWidget {
  const PackageBookingNotesAndTerms({super.key});

  @override
  State<PackageBookingNotesAndTerms> createState() => _PackageBookingNotesAndTermsState();
}

class _PackageBookingNotesAndTermsState extends State<PackageBookingNotesAndTerms> {
  final _notesCtrl = TextEditingController();
  bool _agreed = false;
  static const int _maxChars = 200;

  @override
  void dispose() {
    _notesCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Add notes card
        Container(
          margin: const EdgeInsets.fromLTRB(16, 14, 16, 0),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6, offset: const Offset(0, 2))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Add notes',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
              const SizedBox(height: 12),
              TextField(
                controller: _notesCtrl,
                maxLines: 5,
                maxLength: _maxChars,
                onChanged: (_) => setState(() {}),
                style: const TextStyle(fontSize: 13, color: Color(0xFF374151)),
                decoration: InputDecoration(
                  hintText:
                      "We'll do our best to accommodate your special requests. However, if we're unable to fulfill them, we appreciate your understanding.",
                  hintStyle: const TextStyle(fontSize: 13, color: Color(0xFFD1D5DB), height: 1.5),
                  counterText: '${_notesCtrl.text.length}/$_maxChars',
                  counterStyle: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
                  contentPadding: const EdgeInsets.all(12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.5),
                  ),
                ),
              ),
            ],
          ),
        ),

        // ── Terms checkbox
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
          child: GestureDetector(
            onTap: () => setState(() => _agreed = !_agreed),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 2),
                  width: 18,
                  height: 18,
                  decoration: BoxDecoration(
                    border: Border.all(
                        color: _agreed ? const Color(0xFF2563EB) : const Color(0xFF9CA3AF), width: 1.5),
                    borderRadius: BorderRadius.circular(3),
                    color: _agreed ? const Color(0xFF2563EB) : Colors.white,
                  ),
                  child: _agreed
                      ? const Icon(Icons.check_rounded, size: 12, color: Colors.white)
                      : null,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text.rich(
                    TextSpan(
                      style: const TextStyle(fontSize: 12, color: Color(0xFF374151), height: 1.5),
                      children: [
                        const TextSpan(text: "Please read and agree to Trip.com's "),
                        _link('Terms of use'),
                        const TextSpan(text: ', '),
                        _link('Privacy statement'),
                        const TextSpan(text: ', '),
                        _link('Booking notices'),
                        const TextSpan(text: ', '),
                        _link('Terms and conditions'),
                        const TextSpan(text: ', and '),
                        _link('Travel declaration for seniors/pregnant women'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // ── Save contact note
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 10, 16, 0),
          child: Text(
            'Save contact information for more convenient booking and delivery next time. You may delete or edit the information anytime via "Account" > "Travelers & contacts".',
            style: TextStyle(fontSize: 12, color: Color(0xFF6B7280), height: 1.5),
          ),
        ),

        // ── Confirmation notice
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('• ', style: TextStyle(fontSize: 12, color: Color(0xFF374151))),
              Expanded(
                child: Text(
                  'Your booking will be confirmed by 4:00 AM, April 25 after payment is completed',
                  style: TextStyle(fontSize: 12, color: Color(0xFF374151), height: 1.5),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 8),
      ],
    );
  }

  TextSpan _link(String text) => TextSpan(
        text: text,
        style: const TextStyle(color: Color(0xFF2563EB), fontWeight: FontWeight.w500),
      );
}
