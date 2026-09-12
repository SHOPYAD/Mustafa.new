import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/mobile_json.dart';
import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/auth_session_provider.dart';
import '../../../providers/dio_provider.dart';
import '../../home/widgets/home_bottom_nav.dart';

class InboxPage extends ConsumerStatefulWidget {
  const InboxPage({super.key});

  @override
  ConsumerState<InboxPage> createState() => _InboxPageState();
}

class _InboxPageState extends ConsumerState<InboxPage> {
  List<Map<String, dynamic>> _threads = const [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (ref.read(authSessionProvider) == null) {
      setState(() => _loading = false);
      return;
    }
    try {
      final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
        AppConstants.accountInboxUrl,
      );
      if (!mounted) return;
      setState(() {
        _threads = mapList(res.data?['threads']);
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _compose() async {
    if (ref.read(authSessionProvider) == null) {
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
            children: [
              TextField(controller: controller, maxLines: 4, decoration: const InputDecoration(hintText: 'رسالتك')),
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
    await ref.read(appDioClientProvider).post<Map<String, dynamic>>(
      AppConstants.accountInboxUrl,
      data: {'text': text, 'title': 'رسالة دعم', 'type': 'support'},
    );
    await _load();
  }

  Future<void> _open(Map<String, dynamic> thread) async {
    final id = asText(thread['id']);
    if (id.isEmpty) return;
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => InboxThreadPage(threadId: id, title: asText(thread['title'], 'محادثة'))),
    );
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(authSessionProvider);
    return Scaffold(
      backgroundColor: LonalizaColors.page,
      appBar: AppBar(title: const Text('رسائل')),
      floatingActionButton: FloatingActionButton(
        onPressed: _compose,
        backgroundColor: LonalizaColors.primary,
        child: const Icon(Icons.edit, color: Colors.white),
      ),
      body: session == null
          ? Center(
              child: TextButton(
                onPressed: () => context.push('/auth'),
                child: const Text('سجّل الدخول لعرض الرسائل'),
              ),
            )
          : _loading
              ? const Center(child: CircularProgressIndicator())
              : _threads.isEmpty
                  ? const Center(child: Text('لا رسائل بعد'))
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _threads.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final thread = _threads[index];
                        return Card(
                          child: ListTile(
                            title: Text(asText(thread['title'], 'محادثة')),
                            subtitle: Text(asText(thread['preview'] ?? thread['lastMessage'] ?? thread['type'])),
                            onTap: () => _open(thread),
                          ),
                        );
                      },
                    ),
      bottomNavigationBar: const HomeBottomNav(currentIndex: 3),
    );
  }
}

class InboxThreadPage extends ConsumerStatefulWidget {
  const InboxThreadPage({super.key, required this.threadId, required this.title});

  final String threadId;
  final String title;

  @override
  ConsumerState<InboxThreadPage> createState() => _InboxThreadPageState();
}

class _InboxThreadPageState extends ConsumerState<InboxThreadPage> {
  final _input = TextEditingController();
  List<Map<String, dynamic>> _messages = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
      AppConstants.accountInboxThreadUrl(widget.threadId),
    );
    final thread = res.data?['thread'];
    final raw = thread is Map ? thread['messages'] ?? thread['replies'] : res.data?['messages'];
    if (!mounted) return;
    setState(() => _messages = mapList(raw));
  }

  Future<void> _reply() async {
    final text = _input.text.trim();
    if (text.isEmpty) return;
    _input.clear();
    await ref.read(appDioClientProvider).post<Map<String, dynamic>>(
      AppConstants.accountInboxThreadUrl(widget.threadId),
      data: {'text': text},
    );
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return ListTile(
                  title: Text(asText(message['text'] ?? message['body'] ?? message['content'])),
                  subtitle: Text(asText(message['from'] ?? message['role'] ?? message['author'])),
                );
              },
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(child: TextField(controller: _input, decoration: const InputDecoration(hintText: 'رد'))),
                  IconButton(onPressed: _reply, icon: const Icon(Icons.send_rounded, color: LonalizaColors.primary)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
