class CommunityPost {
  const CommunityPost({
    required this.id,
    required this.content,
    required this.authorName,
    required this.authorAvatar,
    required this.images,
    required this.likesCount,
    required this.commentsCount,
    required this.liked,
    required this.isReel,
    this.videoUrl,
    this.destination,
    this.kind,
  });

  final String id;
  final String content;
  final String authorName;
  final String authorAvatar;
  final List<String> images;
  final int likesCount;
  final int commentsCount;
  final bool liked;
  final bool isReel;
  final String? videoUrl;
  final String? destination;
  final String? kind;

  factory CommunityPost.fromJson(Map<String, dynamic> json) {
    final author = json['author'] is Map ? Map<String, dynamic>.from(json['author'] as Map) : const <String, dynamic>{};
    final images = (json['images'] is List)
        ? (json['images'] as List).map((e) => e.toString()).where((e) => e.isNotEmpty).toList()
        : const <String>[];
    final videos = (json['videos'] is List)
        ? (json['videos'] as List).map((e) => e.toString()).where((e) => e.isNotEmpty).toList()
        : const <String>[];
    final videoUrl = json['videoUrl']?.toString().isNotEmpty == true
        ? json['videoUrl'].toString()
        : (videos.isNotEmpty ? videos.first : null);
    final isReel = json['isReel'] == true ||
        json['isVideo'] == true ||
        json['kind'] == 'reel' ||
        (videoUrl != null && videoUrl.isNotEmpty);
    return CommunityPost(
      id: '${json['id'] ?? ''}',
      content: '${json['content'] ?? ''}',
      authorName: '${author['name'] ?? json['authorName'] ?? 'مسافر'}',
      authorAvatar: '${author['avatar'] ?? json['authorAvatar'] ?? ''}',
      images: images,
      likesCount: (json['likesCount'] as num?)?.toInt() ?? 0,
      commentsCount: (json['commentsCount'] as num?)?.toInt() ?? 0,
      liked: json['userHasLiked'] == true || json['hasLiked'] == true,
      isReel: isReel,
      videoUrl: videoUrl,
      destination: json['destination']?.toString(),
      kind: json['kind']?.toString(),
    );
  }

  CommunityPost copyWith({int? likesCount, bool? liked, int? commentsCount}) {
    return CommunityPost(
      id: id,
      content: content,
      authorName: authorName,
      authorAvatar: authorAvatar,
      images: images,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      liked: liked ?? this.liked,
      isReel: isReel,
      videoUrl: videoUrl,
      destination: destination,
      kind: kind,
    );
  }
}
