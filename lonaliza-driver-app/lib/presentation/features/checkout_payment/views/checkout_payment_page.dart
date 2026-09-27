import 'package:flutter/material.dart';

import '../checkout_payment_theme.dart';
import '../widgets/add_payment_card_sheet.dart';
import '../widgets/checkout_payment_bottom_bar.dart';
import '../widgets/checkout_payment_method_tile.dart';
import '../widgets/checkout_payment_summary_card.dart';

/// Shared checkout payment UI (flights, hotels, etc.).
class CheckoutPaymentPage extends StatefulWidget {
  const CheckoutPaymentPage({
    super.key,
    required this.totalAmountLabel,
  });

  /// e.g. `USD619.30` — shown in summary and passed to the add-card sheet button.
  final String totalAmountLabel;

  @override
  State<CheckoutPaymentPage> createState() => _CheckoutPaymentPageState();
}

class _CheckoutPaymentPageState extends State<CheckoutPaymentPage> {
  /// 0 = new card, 1 = PayPal
  int _methodIndex = 0;

  void _openCardSheet() {
    AddPaymentCardSheet.show(context, confirmAmountLabel: widget.totalAmountLabel);
  }

  String get _primaryLabel => _methodIndex == 1 ? 'Pay with PayPal' : 'Pay with new card';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CheckoutPaymentTheme.pageBg,
      appBar: AppBar(
        surfaceTintColor: Colors.transparent,
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: CheckoutPaymentTheme.textPrimary),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: FittedBox(
          fit: BoxFit.scaleDown,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('🔥', style: TextStyle(fontSize: 14)),
              const SizedBox(width: 6),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 260),
                child: Text(
                  "Departing soon - these prices won't last!",
                  style: CheckoutPaymentTheme.urgentBanner,
                  maxLines: 2,
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
        ),
      ),
      bottomNavigationBar: CheckoutPaymentBottomBar(
        buttonLabel: _primaryLabel,
        onPrimaryPressed: () {
          if (_methodIndex == 0) {
            _openCardSheet();
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('PayPal checkout would open here.')),
            );
          }
        },
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: CheckoutPaymentSummaryCard(
              totalAmountLabel: widget.totalAmountLabel,
              onDetailsTap: () {},
            ),
          ),
          SliverToBoxAdapter(
            child: CheckoutPaymentMethodTile(
              kind: CheckoutPaymentMethodTileKind.newCard,
              selected: _methodIndex == 0,
              onTap: () {
                setState(() => _methodIndex = 0);
                _openCardSheet();
              },
            ),
          ),
          SliverToBoxAdapter(
            child: CheckoutPaymentMethodTile(
              kind: CheckoutPaymentMethodTileKind.paypal,
              selected: _methodIndex == 1,
              onTap: () => setState(() => _methodIndex = 1),
            ),
          ),
          SliverToBoxAdapter(
            child: CheckoutPaymentMethodTile(
              kind: CheckoutPaymentMethodTileKind.giftCard,
              selected: false,
              onTap: () {},
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }
}
