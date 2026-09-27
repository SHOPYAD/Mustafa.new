import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class FlightsSearchAppBar extends StatelessWidget implements PreferredSizeWidget {
  const FlightsSearchAppBar({
    super.key,
    required this.originCity,
    required this.originCode,
    required this.destinationCity,
    required this.destinationCode,
  });

  final String originCity;
  final String originCode;
  final String destinationCity;
  final String destinationCode;

  @override
  Size get preferredSize => const Size.fromHeight(78);

  @override
  Widget build(BuildContext context) {
    final titleStyle = Theme.of(context).textTheme.titleMedium?.copyWith(
          color: const Color(0xFF111827),
          fontWeight: FontWeight.w700,
        );

    final destText = destinationCode.isNotEmpty && !destinationCode.contains(',')
        ? '$destinationCity ($destinationCode)'
        : destinationCity;

    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
        child: Row(
          children: [
            IconButton(
              onPressed: () {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go('/flights');
                }
              },
              icon: const Icon(Icons.arrow_back_rounded),
            ),
            Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('$originCity ($originCode)', style: titleStyle),
                  const SizedBox(width: 6),
                  const Icon(
                    Icons.arrow_forward_rounded,
                    size: 16,
                    color: Color(0xFF111827),
                  ),
                  const SizedBox(width: 6),
                  Flexible(
                    child: Text(
                      destText,
                      style: titleStyle,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 48),
          ],
        ),
      ),
    );
  }
}
