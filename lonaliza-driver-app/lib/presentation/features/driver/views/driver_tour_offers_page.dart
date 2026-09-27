import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/catalog_i18n.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverTourOffersPage extends ConsumerStatefulWidget {
  const DriverTourOffersPage({super.key});

  @override
  ConsumerState<DriverTourOffersPage> createState() =>
      _DriverTourOffersPageState();
}

class _DriverTourOffersPageState extends ConsumerState<DriverTourOffersPage> {
  List<dynamic> _offers = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    setState(() => _loading = true);
    try {
      final offers =
          await ref.read(driverApiProvider).fetchTourOffers(supplierId);
      if (!mounted) return;
      setState(() {
        _offers = offers;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _toggleOffer(
    Map<String, dynamic> tourRow,
    Map<String, dynamic> offer,
    bool active,
  ) async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    final tour = tourRow['tour'] as Map<String, dynamic>? ?? tourRow;
    final tourId = tour['_id']?.toString() ?? '';

    try {
      await ref.read(driverApiProvider).createTourOffer(supplierId, {
        'tourId': tourId,
        'vehicleClassId': offer['vehicleClassId'],
        'customPrice': offer['customPrice'] ?? offer['catalogPrice'],
        'currency': offer['customCurrency'] ?? offer['catalogCurrency'] ?? 'USD',
        'isActive': active,
      });
      if (!mounted) return;
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  Future<void> _editPrice(
    Map<String, dynamic> tourRow,
    Map<String, dynamic> offer,
  ) async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    final tour = tourRow['tour'] as Map<String, dynamic>? ?? tourRow;
    final tourId = tour['_id']?.toString() ?? '';
    final controller = TextEditingController(
      text: '${offer['customPrice'] ?? offer['catalogPrice'] ?? ''}',
    );
    final l10n = context.l10n;

    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.customPricing),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(labelText: l10n.tourPriceLabel),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(l10n.clear),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(l10n.savePricing),
          ),
        ],
      ),
    );

    if (saved != true) return;

    try {
      await ref.read(driverApiProvider).createTourOffer(supplierId, {
        'tourId': tourId,
        'vehicleClassId': offer['vehicleClassId'],
        'customPrice': double.tryParse(controller.text.trim()),
        'currency': offer['catalogCurrency'] ?? 'USD',
        'isActive': true,
      });
      if (!mounted) return;
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.tourOffersTitle)),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _offers.isEmpty
              ? Center(child: Text(l10n.errorNotFound))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _offers.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final row = _offers[index] as Map<String, dynamic>;
                    final tour = row['tour'] as Map<String, dynamic>? ?? row;
                    final tourName = catalogItemTitle(tour, context);
                    final offerRows =
                        (row['offers'] as List?)?.cast<Map<String, dynamic>>() ??
                            [];

                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(tourName,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 16,
                                )),
                            const SizedBox(height: 8),
                            ...offerRows.map((offer) {
                              final active = offer['isActive'] == true;
                              final vehicleClass =
                                  offer['vehicleClass'] as Map<String, dynamic>?;
                              final vehicleLabel = catalogVehicleClassLabel(
                                vehicleClass,
                                context,
                                vehicleClassId:
                                    offer['vehicleClassId']?.toString(),
                              );
                              return ListTile(
                                contentPadding: EdgeInsets.zero,
                                title: Text(
                                  '${l10n.vehiclesTab}: $vehicleLabel',
                                ),
                                subtitle: Text(
                                  '${offer['customPrice'] ?? offer['catalogPrice'] ?? '—'} ${offer['customCurrency'] ?? offer['catalogCurrency'] ?? ''}',
                                ),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Switch(
                                      value: active,
                                      activeColor: AppColors.gold,
                                      onChanged: (v) =>
                                          _toggleOffer(row, offer, v),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.edit_outlined),
                                      onPressed: () => _editPrice(row, offer),
                                    ),
                                  ],
                                ),
                              );
                            }),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
