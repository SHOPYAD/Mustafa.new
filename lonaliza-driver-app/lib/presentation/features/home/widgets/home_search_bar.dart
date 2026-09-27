import 'package:flutter/material.dart';

/// Search field with trailing search button (Trip.com–style).
class HomeSearchBar extends StatefulWidget {
  const HomeSearchBar({
    super.key,
    this.compact = false,
  });

  final bool compact;

  @override
  State<HomeSearchBar> createState() => _HomeSearchBarState();
}

class _HomeSearchBarState extends State<HomeSearchBar> {
  final _controller = TextEditingController(text: 'London');

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const blue = Color(0xFF0068E0);
    const borderBlue = Color(0xFF90CAF9);
    final leadingIconSize = widget.compact ? 20.0 : 22.0;
    final searchIconPadding = widget.compact ? 8.0 : 11.0;
    final searchIconSize = widget.compact ? 18.0 : 22.0;
    final verticalContentPadding = widget.compact ? 10.0 : 14.0;

    return Material(
      elevation: 0,
      color: Colors.white,
      shape: const StadiumBorder(
        side: BorderSide(color: borderBlue, width: 1),
      ),
      child: Row(
        children: [
          const SizedBox(width: 12),
          Icon(
            Icons.smart_toy_outlined,
            color: blue.withValues(alpha: 0.85),
            size: leadingIconSize,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: 'Where to?',
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.symmetric(
                  vertical: verticalContentPadding,
                ),
              ),
              style: Theme.of(context).textTheme.bodyLarge,
              onSubmitted: (_) {},
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 5),
            child: Material(
              color: blue,
              shape: const CircleBorder(),
              clipBehavior: Clip.antiAlias,
              child: InkWell(
                onTap: () {},
                customBorder: const CircleBorder(),
                child: Padding(
                  padding: EdgeInsets.all(searchIconPadding),
                  child: Icon(
                    Icons.search,
                    color: Colors.white,
                    size: searchIconSize,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
