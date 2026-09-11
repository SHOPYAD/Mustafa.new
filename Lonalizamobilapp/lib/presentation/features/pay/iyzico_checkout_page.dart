import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../core/constants/app_constants.dart';
import '../../providers/auth_session_provider.dart';
import '../../providers/dio_provider.dart';
import 'iyzico_checkout_args.dart';

/// Isolated 3DS WebView. Paid state comes from the BFF status route, never from URL changes.
class IyzicoCheckoutPage extends ConsumerStatefulWidget {
  const IyzicoCheckoutPage({super.key, required this.args});

  final IyzicoCheckoutArgs args;

  @override
  ConsumerState<IyzicoCheckoutPage> createState() => _IyzicoCheckoutPageState();
}

class _IyzicoCheckoutPageState extends ConsumerState<IyzicoCheckoutPage> {
  WebViewController? _controller;
  String? _error;
  bool _paid = false;
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _start());
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> _start() async {
    final session = ref.read(authSessionProvider);
    if (session == null) {
      setState(() => _error = 'login_required');
      return;
    }
    try {
      final client = ref.read(appDioClientProvider);
      final res = await client.post<Map<String, dynamic>>(
        AppConstants.iyzicoInitUrl,
        data: {'bookingId': widget.args.bookingId},
        includeAuth: true,
      );
      final url = res.data?['paymentPageUrl']?.toString() ?? '';
      if (url.isEmpty) {
        setState(() => _error = 'checkout_unavailable');
        return;
      }
      final controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setNavigationDelegate(
          NavigationDelegate(
            onNavigationRequest: (request) {
              // Never treat a redirect as paid.
              return NavigationDecision.navigate;
            },
          ),
        )
        ..loadRequest(Uri.parse(url));
      setState(() => _controller = controller);
      _poll = Timer.periodic(const Duration(seconds: 4), (_) => _checkPaid());
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  Future<void> _checkPaid() async {
    try {
      final client = ref.read(appDioClientProvider);
      final res = await client.get<Map<String, dynamic>>(
        AppConstants.iyzicoStatusUrl,
        queryParameters: {'bookingId': widget.args.bookingId},
        includeAuth: true,
      );
      if (res.data?['paid'] == true && mounted) {
        _poll?.cancel();
        setState(() => _paid = true);
      }
    } catch (_) {
      /* webhook may still be in flight */
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.args.title)),
      body: _paid
          ? const Center(child: Text('تم تسجيل الدفع من الخادم'))
          : _error != null
          ? Center(child: Text(_error!))
          : _controller == null
          ? const Center(child: CircularProgressIndicator())
          : WebViewWidget(controller: _controller!),
    );
  }
}
