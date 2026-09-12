import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/lonaliza_theme.dart';

/// Horizontal destination chips for Lonaliza markets.
class HomeDestinationChips extends StatelessWidget {
  const HomeDestinationChips({super.key});

  static const _cities = [
    'إسطنبول',
    'أنطاليا',
    'طرابزون',
    'كابادوكيا',
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _cities.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final city = _cities[index];
          return ActionChip(
            label: Text(city),
            backgroundColor: Colors.white,
            side: const BorderSide(color: Color(0xFFE8E0F5)),
            onPressed: () => context.push('/hotels'),
          );
        },
      ),
    );
  }
}

class HomeReelsStrip extends StatelessWidget {
  const HomeReelsStrip({super.key, required this.posts, this.onOpenAll});

  final List<Map<String, dynamic>> posts;
  final VoidCallback? onOpenAll;

  @override
  Widget build(BuildContext context) {
    if (posts.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text('ريلز لوناليزا', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            const Spacer(),
            TextButton(onPressed: onOpenAll, child: const Text('الكل')),
          ],
        ),
        SizedBox(
          height: 168,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: posts.length,
            separatorBuilder: (_, _) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final post = posts[index];
              final images = post['images'] is List ? (post['images'] as List).map((e) => e.toString()).toList() : const <String>[];
              return InkWell(
                onTap: () => context.push('/community/reels'),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: SizedBox(
                    width: 118,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        if (images.isNotEmpty)
                          Image.network(images.first, fit: BoxFit.cover)
                        else
                          const ColoredBox(color: LonalizaColors.royalPurple),
                        const Align(
                          alignment: Alignment.center,
                          child: Icon(Icons.play_circle_fill, color: Colors.white, size: 34),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
