import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../car_search_results_args.dart';
import '../car_search_results_theme.dart';

/// Search summary row: back, summary capsule, USD. Set [embedded] when inside [CarSearchResultsTopBlock].
class CarResultsHeaderBar extends StatelessWidget {
  const CarResultsHeaderBar({
    super.key,
    required this.args,
    this.onEditSearch,
    this.embedded = false,
  });

  final CarSearchResultsArgs args;
  final VoidCallback? onEditSearch;
  final bool embedded;

  @override
  Widget build(BuildContext context) {
    final inner = Padding(
      padding: EdgeInsets.fromLTRB(4, embedded ? 4 : 6, 12, 8),
      child: Row(
            children: [
              IconButton(
                onPressed: () => context.pop(),
                icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                color: CarSearchResultsTheme.titleDark,
              ),
              Expanded(
                child: InkWell(
                  onTap: onEditSearch ?? () {},
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      border: Border.all(color: CarSearchResultsTheme.chipBorder),
                      borderRadius: BorderRadius.circular(10),
                      color: Colors.white,
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                args.locationTitle,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: CarSearchResultsTheme.headerLocation,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                args.dateTimesPrimary,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: CarSearchResultsTheme.headerDates,
                              ),
                            ],
                          ),
                        ),
                        Icon(Icons.edit_outlined, size: 18, color: Colors.grey.shade700),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              InkWell(
                onTap: () {},
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.language_rounded, size: 18, color: Colors.grey.shade800),
                      const SizedBox(width: 4),
                      Text(
                        'USD',
                        style: CarSearchResultsTheme.headerLocation.copyWith(fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
    );

    if (embedded) {
      return SafeArea(bottom: false, top: true, child: inner);
    }

    return Material(
      color: Colors.white,
      elevation: 1,
      shadowColor: Colors.black12,
      child: SafeArea(
        bottom: false,
        child: inner,
      ),
    );
  }
}
