import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/mobile_json.dart';
import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/dio_provider.dart';
import '../community_post.dart';

class ReelsPage extends ConsumerStatefulWidget {
  const ReelsPage({super.key});

  @override
  ConsumerState<ReelsPage> createState() => _ReelsPageState();
}

class _ReelsPageState extends ConsumerState<ReelsPage> {
  List<CommunityPost> _reels = const [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
        AppConstants.communityFeedUrl,
        queryParameters: const {'reels': '1'},
      );
      final posts = mapList(res.data?['posts'])
          .map(CommunityPost.fromJson)
          .where((post) =>
              post.isReel ||
              (post.videoUrl?.isNotEmpty ?? false) ||
              post.images.isNotEmpty)
          .toList();
      if (!mounted) return;
      setState(() {
        _reels = posts;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Colors.white))
          : _reels.isEmpty
              ? const Center(child: Text('لا ريلز متاحة', style: TextStyle(color: Colors.white)))
              : PageView.builder(
                  scrollDirection: Axis.vertical,
                  itemCount: _reels.length,
                  itemBuilder: (context, index) => _ReelSlide(post: _reels[index]),
                ),
    );
  }
}

class _ReelSlide extends StatefulWidget {
  const _ReelSlide({required this.post});

  final CommunityPost post;

  @override
  State<_ReelSlide> createState() => _ReelSlideState();
}

class _ReelSlideState extends State<_ReelSlide> {
  VideoPlayerController? _controller;

  @override
  void initState() {
    super.initState();
    final url = widget.post.videoUrl;
    if (url != null && url.isNotEmpty) {
      _controller = VideoPlayerController.networkUrl(Uri.parse(url))
        ..initialize().then((_) {
          if (!mounted) return;
          _controller?.setLooping(true);
          _controller?.play();
          setState(() {});
        });
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ready = _controller?.value.isInitialized ?? false;
    return Stack(
      fit: StackFit.expand,
      children: [
        if (ready)
          FittedBox(
            fit: BoxFit.cover,
            child: SizedBox(
              width: _controller!.value.size.width,
              height: _controller!.value.size.height,
              child: VideoPlayer(_controller!),
            ),
          )
        else if (widget.post.images.isNotEmpty)
          Image.network(widget.post.images.first, fit: BoxFit.cover)
        else
          const ColoredBox(color: LonalizaColors.royalPurple),
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Colors.transparent, Colors.black54],
            ),
          ),
        ),
        SafeArea(
          child: Align(
            alignment: Alignment.topLeft,
            child: IconButton(
              onPressed: () => Navigator.of(context).maybePop(),
              icon: const Icon(Icons.close, color: Colors.white),
            ),
          ),
        ),
        Positioned(
          left: 16,
          right: 16,
          bottom: 32,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(widget.post.authorName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              Text(widget.post.content, maxLines: 3, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white)),
            ],
          ),
        ),
      ],
    );
  }
}
