import 'package:flutter/material.dart';

class HomeGalleryCard extends StatefulWidget {
  const HomeGalleryCard({
    super.key,
    required this.height,
    required this.imageAssets,
    this.startImageIndex = 0,
    this.imageHeightFactor = 0.62,
    this.imageOverlayGradient,
    this.badge,
    this.title,
    this.subtitle,
    this.description,
    this.footerText,
    this.footerMeta,
    this.metaLeadingText,
    this.metaTrailingText,
    this.buttonLabel,
    this.bottomRibbonText,
    this.topRightBadge,
    this.leadingDecoration,
    this.contentAlignment = Alignment.bottomLeft,
    this.titleColor = const Color(0xFF111827),
    this.badgeColor = const Color(0xFF2563EB),
    this.descriptionColor = const Color(0xFF1F2937),
  });

  final double height;
  final List<String> imageAssets;
  final int startImageIndex;
  final double imageHeightFactor;
  final Gradient? imageOverlayGradient;
  final String? badge;
  final String? title;
  final String? subtitle;
  final String? description;
  final String? footerText;
  final String? footerMeta;
  final String? metaLeadingText;
  final String? metaTrailingText;
  final String? buttonLabel;
  final String? bottomRibbonText;
  final String? topRightBadge;
  final Widget? leadingDecoration;
  final Alignment contentAlignment;
  final Color titleColor;
  final Color badgeColor;
  final Color descriptionColor;

  @override
  State<HomeGalleryCard> createState() => _HomeGalleryCardState();
}

class _HomeGalleryCardState extends State<HomeGalleryCard> {
  late final PageController _pageController;
  late int _currentPage;

  Future<void> _animateToPage(int page) {
    return _pageController.animateToPage(
      page,
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeInOutCubic,
    );
  }

  Future<void> _goToPreviousImage() {
    if (widget.imageAssets.length <= 1) return Future<void>.value();
    final previousPage =
        _currentPage == 0 ? widget.imageAssets.length - 1 : _currentPage - 1;
    return _animateToPage(previousPage);
  }

  Future<void> _goToNextImage() {
    if (widget.imageAssets.length <= 1) return Future<void>.value();
    final nextPage =
        _currentPage == widget.imageAssets.length - 1 ? 0 : _currentPage + 1;
    return _animateToPage(nextPage);
  }

  @override
  void initState() {
    super.initState();
    final count = widget.imageAssets.isEmpty ? 1 : widget.imageAssets.length;
    _currentPage = widget.startImageIndex % count;
    _pageController = PageController(initialPage: _currentPage);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final imageHeight = widget.height * widget.imageHeightFactor.clamp(0.35, 0.82);
    final titleStyle = Theme.of(context).textTheme.titleMedium?.copyWith(
      color: widget.titleColor,
      fontWeight: FontWeight.w800,
      height: 1.08,
    );
    final bodyTitleStyle = Theme.of(context).textTheme.titleSmall?.copyWith(
      color: const Color(0xFF111827),
      fontWeight: FontWeight.w800,
      height: 1.1,
    );
    final descriptionStyle = Theme.of(context).textTheme.bodyMedium?.copyWith(
      color: widget.descriptionColor,
      fontWeight: FontWeight.w700,
      height: 1.2,
    );
    final metaStyle = Theme.of(context).textTheme.labelMedium?.copyWith(
      color: const Color(0xFF6B7280),
      fontWeight: FontWeight.w600,
    );

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            height: imageHeight,
            child: Stack(
              children: [
                if (widget.imageAssets.isEmpty)
                  const Positioned.fill(
                    child: ColoredBox(color: Color(0xFFE5E7EB)),
                  )
                else
                  Positioned.fill(
                    child: PageView.builder(
                      controller: _pageController,
                      physics: widget.imageAssets.length > 1
                          ? const BouncingScrollPhysics()
                          : const NeverScrollableScrollPhysics(),
                      itemCount: widget.imageAssets.length,
                      onPageChanged: (index) {
                        setState(() => _currentPage = index);
                      },
                      itemBuilder: (context, index) {
                        return Image.asset(
                          widget.imageAssets[index],
                          fit: BoxFit.cover,
                        );
                      },
                    ),
                  ),
                if (widget.imageAssets.length > 1)
                  Positioned.fill(
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            behavior: HitTestBehavior.translucent,
                            onTap: _goToPreviousImage,
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            behavior: HitTestBehavior.translucent,
                            onTap: _goToNextImage,
                          ),
                        ),
                      ],
                    ),
                  ),
                if (widget.imageOverlayGradient != null)
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: widget.imageOverlayGradient,
                      ),
                    ),
                  ),
                if (widget.leadingDecoration != null)
                  Positioned.fill(
                    child: IgnorePointer(child: widget.leadingDecoration!),
                  ),
                Positioned(
                  left: 12,
                  right: 12,
                  bottom: 10,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      for (int index = 0; index < widget.imageAssets.length; index++)
                        GestureDetector(
                          onTap: () => _animateToPage(index),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            margin: const EdgeInsets.symmetric(horizontal: 2),
                            width: _currentPage == index ? 14 : 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: _currentPage == index
                                  ? Colors.white
                                  : Colors.white.withValues(alpha: 0.55),
                              borderRadius: BorderRadius.circular(999),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (widget.bottomRibbonText != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              color: const Color(0xFF2563EB),
              child: Text(
                widget.bottomRibbonText!,
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (widget.badge != null) ...[
                            Text(
                              widget.badge!,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                color: widget.badgeColor,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 4),
                          ],
                          if (widget.title != null) ...[
                            Text(
                              widget.title!,
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                              style: titleStyle,
                            ),
                            const SizedBox(height: 6),
                          ],
                        ],
                      ),
                    ),
                    if (widget.topRightBadge != null) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          widget.topRightBadge!,
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: const Color(0xFF374151),
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                if (widget.subtitle != null) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      widget.subtitle!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: const Color(0xFF374151),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
                if (widget.description != null) ...[
                  Text(
                    widget.description!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: descriptionStyle,
                  ),
                  const SizedBox(height: 8),
                ],
                if (widget.footerText != null) ...[
                  Text(
                    widget.footerText!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: bodyTitleStyle,
                  ),
                  const SizedBox(height: 6),
                ],
                if (widget.footerMeta != null)
                  Text(
                    widget.footerMeta!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: metaStyle,
                  ),
                if (widget.metaLeadingText != null ||
                    widget.metaTrailingText != null) ...[
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      if (widget.metaLeadingText != null) ...[
                        const Icon(
                          Icons.account_circle_rounded,
                          size: 16,
                          color: Color(0xFF9CA3AF),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            widget.metaLeadingText!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: metaStyle,
                          ),
                        ),
                      ],
                      if (widget.metaTrailingText != null) ...[
                        const SizedBox(width: 8),
                        const Icon(
                          Icons.visibility_outlined,
                          size: 16,
                          color: Color(0xFF9CA3AF),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          widget.metaTrailingText!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: metaStyle,
                        ),
                      ],
                    ],
                  ),
                ],
                if (widget.buttonLabel != null) ...[
                  const SizedBox(height: 10),
                  FilledButton(
                    onPressed: () {},
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(0, 32),
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      visualDensity: VisualDensity.compact,
                    ),
                    child: Text(widget.buttonLabel!),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
