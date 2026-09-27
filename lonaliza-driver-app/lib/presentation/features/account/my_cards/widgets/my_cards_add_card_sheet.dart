import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../checkout_payment/widgets/checkout_payment_card_logos_row.dart';
import '../my_cards_theme.dart';

/// Bottom sheet: add bank card (Trip-style layout from reference).
class MyCardsAddCardSheet extends StatelessWidget {
  const MyCardsAddCardSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const MyCardsAddCardSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.viewInsetsOf(context).bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottom),
      child: Container(
        constraints: BoxConstraints(maxHeight: MediaQuery.sizeOf(context).height * 0.92),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 10, 8, 10),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Align(
                    alignment: Alignment.centerLeft,
                    child: IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Color(0xFF111827)),
                    ),
                  ),
                  Text('Add Card', style: MyCardsTheme.sheetTitle),
                ],
              ),
            ),
            const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6)),
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Accepted cards:',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: const Color(0xFF374151),
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14,
                                    ),
                              ),
                              const SizedBox(height: 10),
                              const CheckoutPaymentCardLogosRow(),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.verified_user_rounded, color: MyCardsTheme.blue, size: 26),
                            const SizedBox(width: 6),
                            SizedBox(
                              width: 100,
                              child: Text(
                                '100% SECURITY GUARANTEED',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w900,
                                  color: MyCardsTheme.blue,
                                  height: 1.2,
                                  letterSpacing: 0.1,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 22),
                    _OutlinedField(
                      hint: 'Bank card no.',
                      keyboardType: TextInputType.number,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(19),
                        _CardSpacingFormatter(),
                      ],
                      suffix: Icon(Icons.credit_card_outlined, color: Colors.grey.shade500, size: 22),
                    ),
                    const SizedBox(height: 14),
                    _OutlinedField(
                      hint: 'Cardholder name',
                      keyboardType: TextInputType.name,
                    ),
                    const SizedBox(height: 14),
                    _OutlinedField(
                      hint: 'Expiration date',
                      keyboardType: TextInputType.datetime,
                      suffix: Container(
                        width: 40,
                        height: 26,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: MyCardsTheme.blue,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          '12/13',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(20, 8, 20, 12 + MediaQuery.paddingOf(context).bottom),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  SizedBox(
                    height: 50,
                    child: FilledButton(
                      onPressed: () {},
                      style: FilledButton.styleFrom(
                        backgroundColor: MyCardsTheme.nextGrey,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text(
                        'Next',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Add your bank card information (card number, expiration date, etc.) to your account for faster and easier payments.',
                    style: MyCardsTheme.sheetFooter,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OutlinedField extends StatelessWidget {
  const _OutlinedField({
    required this.hint,
    this.keyboardType,
    this.inputFormatters,
    this.suffix,
  });

  final String hint;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;
  final Widget? suffix;

  @override
  Widget build(BuildContext context) {
    return TextField(
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF111827)),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: MyCardsTheme.fieldHint,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
        suffixIcon: suffix != null
            ? Padding(
                padding: const EdgeInsets.only(right: 10),
                child: Align(widthFactor: 1, heightFactor: 1, alignment: Alignment.centerRight, child: suffix),
              )
            : null,
        suffixIconConstraints: const BoxConstraints(minWidth: 40, minHeight: 40),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: MyCardsTheme.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: MyCardsTheme.blue, width: 1.5),
        ),
      ),
    );
  }
}

class _CardSpacingFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    final buf = StringBuffer();
    for (var i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 == 0) buf.write(' ');
      buf.write(digits[i]);
    }
    final s = buf.toString();
    return TextEditingValue(text: s, selection: TextSelection.collapsed(offset: s.length));
  }
}
