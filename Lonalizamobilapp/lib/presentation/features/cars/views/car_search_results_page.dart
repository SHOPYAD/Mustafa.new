import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/mobile_json.dart';
import '../../../providers/dio_provider.dart';
import '../car_detail_args.dart';
import '../car_search_results_args.dart';
import '../car_search_results_theme.dart';
import '../widgets/car_result_vehicle_card.dart';
import '../widgets/car_results_promo_strip.dart';
import '../widgets/car_search_results_top_block.dart';

class CarSearchResultsPage extends ConsumerStatefulWidget {
  const CarSearchResultsPage({
    super.key,
    required this.args,
  });

  final CarSearchResultsArgs args;

  @override
  ConsumerState<CarSearchResultsPage> createState() => _CarSearchResultsPageState();
}

class _CarSearchResultsPageState extends ConsumerState<CarSearchResultsPage> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _cars = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
        AppConstants.carsCatalogUrl,
        queryParameters: {
          'pickup': widget.args.pickup,
          if ((widget.args.dropoff ?? '').isNotEmpty) 'dropoff': widget.args.dropoff,
          if ((widget.args.date ?? '').isNotEmpty) 'date': widget.args.date,
          if ((widget.args.returnDate ?? '').isNotEmpty) 'returnDate': widget.args.returnDate,
        },
        receiveTimeout: const Duration(seconds: 60),
      );
      if (!mounted) return;
      setState(() {
        _cars = mapList(res.data?['cars']);
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'تعذر تحميل أسطول السيارات الحي';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CarSearchResultsTheme.pageBg,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          CarSearchResultsTopBlock(
            args: widget.args,
            onEditSearch: () => Navigator.of(context).maybePop(),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(child: Text(_error!))
                    : _cars.isEmpty
                        ? const Center(child: Text('لا توجد سيارات متاحة لهذه الوجهة'))
                        : ListView.builder(
                            padding: const EdgeInsets.only(top: 8, bottom: 24),
                            itemCount: _cars.length + 1,
                            itemBuilder: (context, index) {
                              if (index == 0) return const CarResultsPromoStrip();
                              final car = _cars[index - 1];
                              final name = asText(car['nameAr'] ?? car['name'], 'سيارة');
                              final category = asText(car['category'], 'سيدان');
                              final price = asDouble(car['pricePerDay']) ?? 0;
                              final currency = asText(car['currency'], 'USD');
                              final days = widget.args.days;
                              final passengers = (car['passengers'] as num?)?.toInt() ?? 5;
                              final bags = (car['luggage'] as num?)?.toInt() ?? 2;
                              final doors = (car['doors'] as num?)?.toInt() ?? 4;
                              final transmission = asText(car['transmission'], 'automatic') == 'manual'
                                  ? 'عادي'
                                  : 'أوتوماتيك';
                              return CarResultVehicleCard(
                                onTap: () => context.push(
                                  '/cars/detail',
                                  extra: CarDetailArgs.fromSearchCard(
                                    title: name,
                                    subtitle: category,
                                    pricePerDay: '$currency ${price.toStringAsFixed(0)}',
                                    totalLabel: '$currency ${(price * days).toStringAsFixed(0)} الإجمالي',
                                  ),
                                ),
                                title: name,
                                subtitle: category,
                                passengers: passengers,
                                bags: bags,
                                doors: doors,
                                transmission: transmission,
                                shuttleLabel: 'توصيل من المطار',
                                brandsLine: asText(car['name'], 'Lonaliza Cars'),
                                pricePerDay: '$currency ${price.toStringAsFixed(0)}',
                                totalLabel: '$currency ${(price * days).toStringAsFixed(0)} الإجمالي',
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
