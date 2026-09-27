import 'package:flutter/material.dart';

/// Hero image slider with photo count badge
class PackageTourImageSlider extends StatefulWidget {
  const PackageTourImageSlider({super.key, required this.images});
  final List<String> images;

  @override
  State<PackageTourImageSlider> createState() => _PackageTourImageSliderState();
}

class _PackageTourImageSliderState extends State<PackageTourImageSlider> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Page view of images
        SizedBox(
          height: 280,
          child: PageView.builder(
            itemCount: widget.images.length,
            onPageChanged: (i) => setState(() => _currentIndex = i),
            itemBuilder: (_, i) => Image.asset(widget.images[i], fit: BoxFit.cover, width: double.infinity),
          ),
        ),
        // Dot indicators at bottom
        Positioned(
          bottom: 4,
          left: 0,
          right: 0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(widget.images.length, (i) {
              return Container(
                width: i == _currentIndex ? 20 : 6,
                height: 4,
                margin: const EdgeInsets.symmetric(horizontal: 2),
                decoration: BoxDecoration(
                  color: i == _currentIndex ? Colors.white : Colors.white54,
                  borderRadius: BorderRadius.circular(2),
                ),
              );
            }),
          ),
        ),
        // Photo count badge bottom-right
        Positioned(
          bottom: 14,
          right: 12,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: Colors.black54,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.image_outlined, size: 12, color: Colors.white),
                const SizedBox(width: 4),
                Text(
                  '${widget.images.length * 6 + 1}',
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
