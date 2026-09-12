import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/navigation/native_href.dart';
import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/dio_provider.dart';

/// Smart search that calls the live search-agent then opens a native route.
class HomeSearchBar extends ConsumerStatefulWidget {
  const HomeSearchBar({
    super.key,
    this.compact = false,
    this.agentTab = 'flight',
  });

  final bool compact;
  final String agentTab;

  @override
  ConsumerState<HomeSearchBar> createState() => _HomeSearchBarState();
}

class _HomeSearchBarState extends ConsumerState<HomeSearchBar> {
  final _controller = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    final query = _controller.text.trim();
    if (query.isEmpty || _busy) return;
    setState(() => _busy = true);
    try {
      final res = await ref.read(appDioClientProvider).post<Map<String, dynamic>>(
        AppConstants.aiSearchAgentUrl,
        data: {
          'messages': [
            {'role': 'user', 'content': query},
          ],
          'locale': 'ar',
          'tab': widget.agentTab,
        },
        receiveTimeout: const Duration(seconds: 60),
      );
      final data = res.data ?? const {};
      final href = data['href']?.toString();
      final intent = data['intent']?.toString();
      if (!mounted) return;
      context.push(href != null && href.isNotEmpty ? nativePathFromHref(href) : nativePathFromIntent(intent));
    } catch (_) {
      if (!mounted) return;
      context.push('/ai');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const purple = LonalizaColors.primary;
    final leadingIconSize = widget.compact ? 20.0 : 22.0;
    final searchIconPadding = widget.compact ? 8.0 : 11.0;
    final searchIconSize = widget.compact ? 18.0 : 22.0;
    final verticalContentPadding = widget.compact ? 10.0 : 14.0;

    return Material(
      elevation: 0,
      color: Colors.white,
      shape: const StadiumBorder(
        side: BorderSide(color: Color(0xFFD8D0EE), width: 1),
      ),
      child: Row(
        children: [
          const SizedBox(width: 12),
          Icon(Icons.smart_toy_outlined, color: purple.withValues(alpha: 0.85), size: leadingIconSize),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: 'ابحث كما في الموقع: وجهة، تاريخ، أو عرض',
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.symmetric(vertical: verticalContentPadding),
              ),
              style: Theme.of(context).textTheme.bodyLarge,
              onSubmitted: (_) => _search(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 5),
            child: Material(
              color: purple,
              shape: const CircleBorder(),
              clipBehavior: Clip.antiAlias,
              child: InkWell(
                onTap: _busy ? null : _search,
                customBorder: const CircleBorder(),
                child: Padding(
                  padding: EdgeInsets.all(searchIconPadding),
                  child: _busy
                      ? SizedBox(
                          width: searchIconSize,
                          height: searchIconSize,
                          child: const CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Icon(Icons.search, color: Colors.white, size: searchIconSize),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
