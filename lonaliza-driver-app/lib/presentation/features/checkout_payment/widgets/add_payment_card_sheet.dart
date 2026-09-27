import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../checkout_payment_theme.dart';
import 'checkout_payment_card_logos_row.dart';

/// Bottom sheet for entering a new card (matches “Add New Card” reference).
class AddPaymentCardSheet extends StatelessWidget {
  const AddPaymentCardSheet({super.key, required this.confirmAmountLabel});

  final String confirmAmountLabel;

  static Future<void> show(BuildContext context, {required String confirmAmountLabel}) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => AddPaymentCardSheet(confirmAmountLabel: confirmAmountLabel),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * 0.92,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _SheetHeader(onBack: () => Navigator.of(context).pop()),
            const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6)),
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 18, 16, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const _AcceptedCardsSecurityRow(),
                    const SizedBox(height: 22),
                    _CardNumberField(),
                    const SizedBox(height: 14),
                    TextFormField(
                      initialValue: 'AHMED KEMOUKH',
                      decoration: InputDecoration(
                        labelText: 'Cardholder name',
                        labelStyle: const TextStyle(color: CheckoutPaymentTheme.textMuted, fontSize: 13),
                        floatingLabelBehavior: FloatingLabelBehavior.always,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: const BorderSide(color: CheckoutPaymentTheme.blue, width: 1.5),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      ),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: CheckoutPaymentTheme.textPrimary,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            keyboardType: TextInputType.number,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                              LengthLimitingTextInputFormatter(4),
                              _MmYyExpiryInputFormatter(),
                            ],
                            decoration: InputDecoration(
                              hintText: 'MM/YY',
                              hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 16),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
                              ),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            obscureText: true,
                            keyboardType: TextInputType.number,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                              LengthLimitingTextInputFormatter(4),
                            ],
                            decoration: InputDecoration(
                              hintText: 'CVV/CVC',
                              hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 16),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
                              ),
                              contentPadding: const EdgeInsets.fromLTRB(14, 14, 10, 14),
                              suffixIcon: Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: Center(
                                  widthFactor: 1,
                                  child: Container(
                                    width: 30,
                                    height: 20,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFE5E7EB),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    alignment: Alignment.center,
                                    child: const Text(
                                      '123',
                                      style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: Color(0xFF9CA3AF)),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(16, 8, 16, 16 + MediaQuery.paddingOf(context).bottom),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: FilledButton(
                      onPressed: () {},
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF94A3B8),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text(
                        'Confirm and Pay $confirmAmountLabel',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.shield_outlined, size: 16, color: Colors.teal.shade600),
                      const SizedBox(width: 6),
                      Text(
                        'Your payment information is protected',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.teal.shade700,
                        ),
                      ),
                    ],
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

class _SheetHeader extends StatelessWidget {
  const _SheetHeader({required this.onBack});

  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 12, 16, 12),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: IconButton(
              onPressed: onBack,
              icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: CheckoutPaymentTheme.textPrimary),
            ),
          ),
          const Text(
            'Add New Card',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w800,
              color: CheckoutPaymentTheme.textPrimary,
              letterSpacing: -0.2,
            ),
          ),
        ],
      ),
    );
  }
}

class _AcceptedCardsSecurityRow extends StatelessWidget {
  const _AcceptedCardsSecurityRow();

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Accepted cards:',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: CheckoutPaymentTheme.textSecondary,
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                    ),
              ),
              const SizedBox(height: 8),
              const CheckoutPaymentCardLogosRow(),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.verified_user_outlined, color: CheckoutPaymentTheme.blueAlt, size: 26),
            const SizedBox(width: 6),
            SizedBox(
              width: 108,
              child: Text(
                '100% SECURITY GUARANTEED',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w900,
                  color: CheckoutPaymentTheme.blueAlt,
                  height: 1.2,
                  letterSpacing: 0.15,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _CardNumberField extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return TextFormField(
      keyboardType: TextInputType.number,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        LengthLimitingTextInputFormatter(19),
        _CardSpacingFormatter(),
      ],
      decoration: InputDecoration(
        hintText: 'Bank card no.',
        hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 16),
        prefixIcon: const Icon(Icons.credit_card_outlined, color: Color(0xFF9CA3AF)),
        suffixIcon: const Icon(Icons.document_scanner_outlined, color: Color(0xFF6B7280)),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: CheckoutPaymentTheme.blue, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 14),
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
    return TextEditingValue(
      text: s,
      selection: TextSelection.collapsed(offset: s.length),
    );
  }
}

class _MmYyExpiryInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final d = newValue.text.replaceAll(RegExp(r'\D'), '');
    if (d.isEmpty) {
      return const TextEditingValue();
    }
    var t = d;
    if (t.length > 4) t = t.substring(0, 4);
    final mm = t.length >= 2 ? t.substring(0, 2) : t;
    final yy = t.length > 2 ? t.substring(2) : '';
    final out = yy.isEmpty ? mm : '$mm/$yy';
    return TextEditingValue(
      text: out,
      selection: TextSelection.collapsed(offset: out.length),
    );
  }
}
