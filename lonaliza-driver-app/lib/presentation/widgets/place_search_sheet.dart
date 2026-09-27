import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:lonaliza_driver/core/extensions/context_l10n.dart';
import 'app_error_view.dart';
import '../notifier/place_search_notifier.dart';



class PlaceSearchSheet extends ConsumerStatefulWidget {
  const PlaceSearchSheet({super.key, this.title = 'Search destination'});

  /// Optional title for the search sheet.
  final String title;

  static const _popularDestinations = [
    ('Shanghai', 'assets/images/1.jpg'),
    ('Tokyo', 'assets/images/2.jpg'),
    ('Bangkok', 'assets/images/3.jpg'),
    ('Guangzhou', 'assets/images/1.jpg'),
    ('Hong Kong', 'assets/images/2.jpg'),
    ('Beijing', 'assets/images/3.jpg'),
  ];

  @override
  ConsumerState<PlaceSearchSheet> createState() => _PlaceSearchSheetState();
}

/// [TextEditingController] في الواجهة؛ [placeSearchNotifierProvider] لنتائج البحث فقط.
/// النص يتدفّق من [TextField.onChanged] → debounce → المزود؛ لا مزامنة عكسية من المزود إلى الحقل.
class _PlaceSearchSheetState extends ConsumerState<PlaceSearchSheet> {
  late final TextEditingController _query;
  Timer? _debounce;

  static const _searchDebounce = Duration(milliseconds: 400);

  @override
  void initState() {
    super.initState();
    _query = TextEditingController();
  }

  /// Single entry from [TextField.onChanged] (avoids duplicate [TextEditingController] notifies from some IMEs).
  void _scheduleSearchFromInput(String text) {
    _debounce?.cancel();
    final trimmed = text.trim();
    if (trimmed.isEmpty) {
      ref.read(placeSearchNotifierProvider.notifier).search('');
      return;
    }
    _debounce = Timer(_searchDebounce, () {
      if (!mounted) return;
      ref.read(placeSearchNotifierProvider.notifier).search(text);
    });
  }

  void _clearQuery() {
    _debounce?.cancel();
    _query.clear();
    ref.read(placeSearchNotifierProvider.notifier).search('');
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _query.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final asyncHits = ref.watch(placeSearchNotifierProvider);
    final l10n = context.l10n;

    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: ListenableBuilder(
                      listenable: _query,
                      builder: (context, _) {
                        return _DestinationSearchBar(
                          controller: _query,
                          onClear: _clearQuery,
                          onChanged: _scheduleSearchFromInput,
                        );
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Expanded(
                child: ListenableBuilder(
                  listenable: _query,
                  builder: (context, _) {
                    final trimmed = _query.text.trim();
                    final hasQuery = trimmed.isNotEmpty;
                    final trimmedLen = trimmed.length;

                    if (!hasQuery) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          InkWell(
                            onTap: () {},
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.near_me_rounded,
                                  size: 18,
                                  color: Color(0xFF2563EB),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  context.l10n.currentLocation,
                                  style: Theme.of(context).textTheme.titleSmall
                                      ?.copyWith(
                                        color: const Color(0xFF2563EB),
                                        fontWeight: FontWeight.w700,
                                      ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 18),
                          _SectionTitle(
                            title: context.l10n.recentSearches,
                            trailing: TextButton(
                              onPressed: () {},
                              child: Text(context.l10n.clear),
                            ),
                          ),
                          const SizedBox(height: 10),
                          const _RecentSearchCard(),
                          const SizedBox(height: 20),
                          _SectionTitle(
                            title: context.l10n.popularDestinations,
                          ),
                          const SizedBox(height: 12),
                          Expanded(
                            child: GridView.builder(
                              padding: EdgeInsets.zero,
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 2,
                                    crossAxisSpacing: 10,
                                    mainAxisSpacing: 10,
                                    childAspectRatio: 1.08,
                                  ),
                              itemCount:
                                  PlaceSearchSheet._popularDestinations.length,
                              itemBuilder: (context, index) {
                                final destination = PlaceSearchSheet
                                    ._popularDestinations[index];
                                return _PopularDestinationCard(
                                  title: destination.$1,
                                  imageAsset: destination.$2,
                                );
                              },
                            ),
                          ),
                        ],
                      );
                    }

                    if (trimmedLen < 3) {
                      return Center(
                        child: Text(
                          l10n.typeMinChars,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(
                                color: const Color(0xFF6B7280),
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                      );
                    }

                    return asyncHits.when(
                      data: (hits) {
                        if (hits.isEmpty) {
                          final waitingForDebouncedSearch =
                              (_debounce?.isActive ?? false) && trimmedLen >= 3;
                          if (waitingForDebouncedSearch) {
                            return const Center(
                              child: Padding(
                                padding: EdgeInsets.all(24),
                                child: CircularProgressIndicator(),
                              ),
                            );
                          }
                          return Center(
                            child: Text(
                              l10n.noMatches(trimmed),
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodyMedium
                                  ?.copyWith(
                                    color: const Color(0xFF6B7280),
                                    fontWeight: FontWeight.w600,
                                  ),
                            ),
                          );
                        }
                        return ListView.separated(
                          padding: const EdgeInsets.only(top: 8),
                          itemCount: hits.length + 1,
                          separatorBuilder: (context, _) => Divider(
                            height: 1,
                            thickness: 1,
                            color: Colors.grey.shade200,
                          ),
                          itemBuilder: (context, index) {
                            if (index == hits.length) {
                              return const _SearchResultsFooter();
                            }
                            final hit = hits[index];
                            final subtitle = hit.location.isNotEmpty
                                ? hit.location
                                : hit.displayName;
                            return _PlaceSuggestionTile(
                              title: hit.name,
                              subtitle: subtitle,
                              onTap: () => Navigator.of(context).pop(hit),
                            );
                          },
                        );
                      },
                      error: (e, _) => AppErrorView(
                        error: e,
                        onRetry: () {
                          ref
                              .read(placeSearchNotifierProvider.notifier)
                              .search(_query.text);
                        },
                      ),
                      loading: () => const Center(
                        child: Padding(
                          padding: EdgeInsets.all(24),
                          child: CircularProgressIndicator(),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DestinationSearchBar extends StatelessWidget {
  const _DestinationSearchBar({
    required this.controller,
    required this.onClear,
    required this.onChanged,
  });

  final TextEditingController controller;
  final VoidCallback onClear;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final showClear = controller.text.isNotEmpty;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFD1D5DB)),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          const Icon(Icons.search_rounded, color: Color(0xFF6B7280)),
          const SizedBox(width: 6),
          Expanded(
            child: TextField(
              controller: controller,
              autofocus: true,
              onChanged: onChanged,
              textInputAction: TextInputAction.search,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: const Color(0xFF111827),
                fontWeight: FontWeight.w600,
              ),
              decoration: InputDecoration(
                hintText: context.l10n.searchHint,
                hintStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: const Color(0xFF9CA3AF),
                  fontWeight: FontWeight.w600,
                ),
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                suffixIcon: showClear
                    ? IconButton(
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(
                          minWidth: 36,
                          minHeight: 36,
                        ),
                        icon: Icon(
                          Icons.cancel_rounded,
                          size: 20,
                          color: Colors.grey.shade500,
                        ),
                        onPressed: onClear,
                      )
                    : null,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PlaceSuggestionTile extends StatelessWidget {
  const _PlaceSuggestionTile({
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final VoidCallback onTap;

  static const _titleBlue = Color(0xFF1E3A8A);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.location_on_outlined, size: 22, color: _titleBlue),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: _titleBlue,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF6B7280),
                      fontWeight: FontWeight.w600,
                      height: 1.3,
                    ),
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

class _SearchResultsFooter extends StatelessWidget {
  const _SearchResultsFooter();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 20, 8, 24),
      child: Text(
        context.l10n.searchFooter,
        textAlign: TextAlign.center,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
          color: const Color(0xFF9CA3AF),
          fontWeight: FontWeight.w500,
          height: 1.45,
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, this.trailing});

  final String title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF1F2937),
          ),
        ),
        const Spacer(),
        ?trailing,
      ],
    );
  }
}

class _RecentSearchCard extends StatelessWidget {
  const _RecentSearchCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        children: [
          const Icon(Icons.history_rounded, color: Color(0xFF111827)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'London',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Apr 21-Apr 22  |  2 adults',
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: const Color(0xFF6B7280),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: Color(0xFF6B7280)),
        ],
      ),
    );
  }
}

class _PopularDestinationCard extends StatelessWidget {
  const _PopularDestinationCard({
    required this.title,
    required this.imageAsset,
  });

  final String title;
  final String imageAsset;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(child: Image.asset(imageAsset, fit: BoxFit.cover)),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
              child: Row(
                children: [
                  const Icon(
                    Icons.location_on_outlined,
                    size: 18,
                    color: Color(0xFF111827),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      title,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: const Color(0xFF1F2937),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
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
