import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/mobile_json.dart';
import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/auth_session_provider.dart';
import '../../../providers/dio_provider.dart';
import '../../home/widgets/home_bottom_nav.dart';
import '../community_post.dart';

class CommunityPage extends ConsumerStatefulWidget {
  const CommunityPage({super.key});

  @override
  ConsumerState<CommunityPage> createState() => _CommunityPageState();
}

class _CommunityPageState extends ConsumerState<CommunityPage> with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  List<CommunityPost> _feed = const [];
  List<CommunityPost> _moments = const [];
  List<CommunityPost> _reels = const [];
  List<Map<String, dynamic>> _buddies = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 4, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final client = ref.read(appDioClientProvider);
      final results = await Future.wait([
        client.get<Map<String, dynamic>>(AppConstants.communityFeedUrl),
        client.get<Map<String, dynamic>>(
          AppConstants.communityFeedUrl,
          queryParameters: const {'kind': 'moment'},
        ),
        client.get<Map<String, dynamic>>(
          AppConstants.communityFeedUrl,
          queryParameters: const {'reels': '1'},
        ),
        client.get<Map<String, dynamic>>(AppConstants.communityBuddiesUrl),
      ]);
      if (!mounted) return;
      setState(() {
        _feed = mapList(results[0].data?['posts']).map(CommunityPost.fromJson).toList();
        _moments = mapList(results[1].data?['posts']).map(CommunityPost.fromJson).toList();
        _reels = mapList(results[2].data?['posts']).map(CommunityPost.fromJson).toList();
        _buddies = mapList(results[3].data?['buddies']);
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'تعذر تحميل المجتمع';
      });
    }
  }

  Future<void> _like(CommunityPost post) async {
    try {
      await ref.read(appDioClientProvider).post<Map<String, dynamic>>(
        AppConstants.communityRewardUrl,
        data: {'action': 'like', 'eventId': post.id},
      );
      CommunityPost toggle(CommunityPost item) {
        if (item.id != post.id) return item;
        final liked = !item.liked;
        return item.copyWith(
          liked: liked,
          likesCount: (item.likesCount + (liked ? 1 : -1)).clamp(0, 999999),
        );
      }
      setState(() {
        _feed = _feed.map(toggle).toList();
        _moments = _moments.map(toggle).toList();
        _reels = _reels.map(toggle).toList();
      });
    } catch (_) {}
  }

  Future<void> _comment(CommunityPost post) async {
    final controller = TextEditingController();
    final text = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: 16,
            bottom: MediaQuery.viewInsetsOf(context).bottom + 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: controller,
                autofocus: true,
                decoration: const InputDecoration(hintText: 'اكتب تعليقاً'),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => Navigator.pop(context, controller.text.trim()),
                child: const Text('إرسال'),
              ),
            ],
          ),
        );
      },
    );
    if (text == null || text.isEmpty) return;
    try {
      await ref.read(appDioClientProvider).post<Map<String, dynamic>>(
        AppConstants.communityCommentsUrl,
        data: {'postId': post.id, 'text': text},
      );
      CommunityPost bump(CommunityPost item) =>
          item.id == post.id ? item.copyWith(commentsCount: item.commentsCount + 1) : item;
      setState(() {
        _feed = _feed.map(bump).toList();
        _moments = _moments.map(bump).toList();
      });
    } catch (_) {}
  }

  Future<void> _publishMoment() async {
    final session = ref.read(authSessionProvider);
    if (session == null) {
      context.push('/auth');
      return;
    }
    final controller = TextEditingController();
    final text = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: 16,
            bottom: MediaQuery.viewInsetsOf(context).bottom + 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('نشر لحظة', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
              const SizedBox(height: 12),
              TextField(
                controller: controller,
                maxLines: 4,
                decoration: const InputDecoration(hintText: 'شارك لحظتك'),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => Navigator.pop(context, controller.text.trim()),
                child: const Text('نشر'),
              ),
            ],
          ),
        );
      },
    );
    if (text == null || text.isEmpty) return;
    await ref.read(appDioClientProvider).post<Map<String, dynamic>>(
      AppConstants.communityPublishUrl,
      data: {
        'content': text,
        'kind': 'moment',
        'authorName': session.user.name,
      },
    );
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LonalizaColors.page,
      appBar: AppBar(
        title: const Text('مجتمع لوناليزا'),
        bottom: TabBar(
          controller: _tabs,
          isScrollable: true,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: 'المنشورات'),
            Tab(text: 'لحظات'),
            Tab(text: 'ريلز'),
            Tab(text: 'رفاق'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _publishMoment,
        backgroundColor: LonalizaColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : TabBarView(
                  controller: _tabs,
                  children: [
                    _PostList(posts: _feed, onLike: _like, onComment: _comment),
                    _PostList(posts: _moments, onLike: _like, onComment: _comment),
                    _ReelGrid(posts: _reels),
                    _BuddyList(buddies: _buddies),
                  ],
                ),
      bottomNavigationBar: const HomeBottomNav(currentIndex: 2),
    );
  }
}

class _PostList extends StatelessWidget {
  const _PostList({required this.posts, required this.onLike, required this.onComment});

  final List<CommunityPost> posts;
  final ValueChanged<CommunityPost> onLike;
  final ValueChanged<CommunityPost> onComment;

  @override
  Widget build(BuildContext context) {
    if (posts.isEmpty) {
      return const Center(child: Text('لا منشورات بعد'));
    }
    return RefreshIndicator(
      onRefresh: () async {},
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: posts.length,
        separatorBuilder: (_, _) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final post = posts[index];
          return Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF2E1065).withValues(alpha: 0.08),
                  blurRadius: 18,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (post.images.isNotEmpty)
                  Stack(
                    children: [
                      Image.network(post.images.first, height: 220, width: double.infinity, fit: BoxFit.cover),
                      if (post.destination != null)
                        Positioned(
                          top: 12,
                          right: 12,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: LonalizaColors.amber,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(post.destination!, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 11)),
                          ),
                        ),
                    ],
                  ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: LonalizaColors.royalPurple,
                        backgroundImage: post.authorAvatar.isEmpty ? null : NetworkImage(post.authorAvatar),
                        child: post.authorAvatar.isEmpty ? Text(post.authorName.characters.first, style: const TextStyle(color: Colors.white)) : null,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(post.authorName, style: const TextStyle(fontWeight: FontWeight.w800)),
                            Text(post.kind == 'moment' ? 'لحظة سفر' : 'منشور المسافرين', style: const TextStyle(color: LonalizaColors.muted, fontSize: 11)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                if (post.content.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 0, 14, 8),
                    child: Text(post.content, style: const TextStyle(height: 1.45)),
                  ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(4, 0, 8, 8),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () => onLike(post),
                        icon: Icon(post.liked ? Icons.favorite : Icons.favorite_border, color: LonalizaColors.primary),
                      ),
                      Text('${post.likesCount}'),
                      IconButton(
                        onPressed: () => onComment(post),
                        icon: const Icon(Icons.mode_comment_outlined),
                      ),
                      Text('${post.commentsCount}'),
                      const Spacer(),
                      if (post.images.isNotEmpty || post.isReel)
                        TextButton(
                          onPressed: () => context.push('/community/reels'),
                          child: const Text('شاهد الريلز'),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _ReelGrid extends StatelessWidget {
  const _ReelGrid({required this.posts});

  final List<CommunityPost> posts;

  @override
  Widget build(BuildContext context) {
    if (posts.isEmpty) return const Center(child: Text('لا ريلز بعد'));
    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 0.72,
      ),
      itemCount: posts.length,
      itemBuilder: (context, index) {
        final post = posts[index];
        return InkWell(
          onTap: () => context.push('/community/reels'),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (post.images.isNotEmpty)
                  Image.network(post.images.first, fit: BoxFit.cover)
                else
                  const ColoredBox(color: LonalizaColors.royalPurple),
                const Align(
                  alignment: Alignment.center,
                  child: Icon(Icons.play_circle_fill, color: Colors.white, size: 42),
                ),
                Positioned(
                  left: 8,
                  right: 8,
                  bottom: 8,
                  child: Text(
                    post.authorName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _BuddyList extends StatelessWidget {
  const _BuddyList({required this.buddies});

  final List<Map<String, dynamic>> buddies;

  @override
  Widget build(BuildContext context) {
    if (buddies.isEmpty) return const Center(child: Text('لا رفاق سفر بعد'));
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: buddies.length,
      separatorBuilder: (_, _) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final buddy = buddies[index];
        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
          ),
          child: ListTile(
            leading: const CircleAvatar(
              backgroundColor: LonalizaColors.royalPurple,
              child: Icon(Icons.person, color: Colors.white),
            ),
            title: Text(asText(buddy['name'] ?? buddy['title'], 'مسافر'), style: const TextStyle(fontWeight: FontWeight.w800)),
            subtitle: Text(asText(buddy['destination'] ?? buddy['bio'] ?? buddy['city'], 'يبحث عن رفيق سفر')),
            trailing: const Icon(Icons.chevron_left),
          ),
        );
      },
    );
  }
}
