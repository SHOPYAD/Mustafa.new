import 'package:flutter/material.dart';

import '../car_search_results_args.dart';
import 'car_results_category_chips_row.dart';
import 'car_results_filter_dropdown_row.dart';
import 'car_results_header_bar.dart';

/// Pinned white block: search summary + filter row + category row (not scrollable list body).
class CarSearchResultsTopBlock extends StatelessWidget {
  const CarSearchResultsTopBlock({
    super.key,
    required this.args,
    this.onEditSearch,
  });

  final CarSearchResultsArgs args;
  final VoidCallback? onEditSearch;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      elevation: 1,
      shadowColor: Colors.black.withValues(alpha: 0.08),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          CarResultsHeaderBar(
            args: args,
            onEditSearch: onEditSearch,
            embedded: true,
          ),
          const CarResultsFilterDropdownRow(),
          const CarResultsCategoryChipsRow(),
          Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
        ],
      ),
    );
  }
}
