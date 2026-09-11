import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../core/constants/app_constants.dart';
import '../../providers/auth_session_provider.dart';
import '../../providers/dio_provider.dart';

const _allowed = {'/ai-chat', '/community', '/community/reels'};

class SiteWebViewPage extends ConsumerStatefulWidget {
  const SiteWebViewPage({super.key, required this.path});

  final String path;

  @override
  ConsumerState<SiteWebViewPage> createState() => _SiteWebViewPageState();
}

class _SiteWebViewPageState extends ConsumerState<SiteWebViewPage> {
  WebViewController? _controller;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _open());
  }

  String get _safePath {
    final path = widget.path.split('?').first;
    return _allowed.contains(path) ? path : '/ai-chat';
  }

  Future<void> _open() async {
    try {
      var url = Uri.parse('${AppConstants.mobileApiBase}$_safePath?mobileBridge=1');
      final session = ref.read(authSessionProvider);
      if (session != null) {
        final client = ref.read(appDioClientProvider);
        final ticket = await client.post<Map<String, dynamic>>(
          '${AppConstants.mobileApiBase}/api/mobile/v1/session/handoff',
          data: {'path': _safePath},
          includeAuth: true,
        );
        final handoff = ticket.data?['url']?.toString();
        if (handoff != null && handoff.isNotEmpty) {
          url = Uri.parse('${AppConstants.mobileApiBase}$handoff');
        }
      }
      final controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..addJavaScriptChannel(
          'LonalizaBridge',
          onMessageReceived: (message) {
            final data = jsonDecode(message.message);
            if (data is! Map) return;
            final type = data['type']?.toString();
            final href = data['href']?.toString() ?? '';
            if (type == 'book' || href.contains('/flights')) {
              if (mounted) context.push('/flights');
            } else if (href.contains('/hotels')) {
              if (mounted) context.push('/hotels');
            }
          },
        )
        ..setNavigationDelegate(
          NavigationDelegate(
            onNavigationRequest: (request) {
              final uri = Uri.tryParse(request.url);
              if (uri == null) return NavigationDecision.prevent;
              final origin = Uri.parse(AppConstants.mobileApiBase);
              if (uri.host != origin.host) return NavigationDecision.prevent;
              final path = uri.path;
              final allowed =
                  _allowed.contains(path) ||
                  path.startsWith('/api/mobile/v1/session/handoff');
              return allowed ? NavigationDecision.navigate : NavigationDecision.prevent;
            },
          ),
        )
        ..loadRequest(url);
      setState(() => _controller = controller);
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_safePath == '/ai-chat' ? 'AI' : 'Community')),
      body: _error != null
          ? Center(child: Text(_error!))
          : _controller == null
          ? const Center(child: CircularProgressIndicator())
          : WebViewWidget(controller: _controller!),
    );
  }
}
