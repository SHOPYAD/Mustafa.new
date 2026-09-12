import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/navigation/native_href.dart';
import '../../../../core/network/mobile_json.dart';
import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/dio_provider.dart';

class AiChatPage extends ConsumerStatefulWidget {
  const AiChatPage({super.key});

  @override
  ConsumerState<AiChatPage> createState() => _AiChatPageState();
}

class _AiChatPageState extends ConsumerState<AiChatPage> {
  final _input = TextEditingController();
  final _messages = <_ChatTurn>[];
  bool _busy = false;

  static const _chips = [
    'طيران الرياض إسطنبول الأسبوع القادم',
    'فندق على البوسفور ليلتين',
    'باقة طرابزون 5 أيام',
    'سيارة من مطار إسطنبول',
  ];

  @override
  void initState() {
    super.initState();
    _messages.add(const _ChatTurn(
      role: 'assistant',
      text: 'مرحباً بك في مستشار لوناليزا. أخبرني بوجهتك وتواريخك لأجهّز خيارات الحجز بنفس محركات الموقع.',
    ));
    WidgetsBinding.instance.addPostFrameCallback((_) => _welcome());
  }

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  Future<void> _welcome() async {
    try {
      final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
        AppConstants.aiSalesChatUrl,
      );
      final welcome = asText(res.data?['welcomeAr'] ?? res.data?['welcomeEn']);
      if (!mounted || welcome.isEmpty) return;
      setState(() {
        _messages
          ..clear()
          ..add(_ChatTurn(role: 'assistant', text: welcome));
      });
    } catch (_) {}
  }

  Future<void> _send([String? preset]) async {
    final text = (preset ?? _input.text).trim();
    if (text.isEmpty || _busy) return;
    if (preset == null) _input.clear();
    setState(() {
      _messages.add(_ChatTurn(role: 'user', text: text));
      _busy = true;
    });
    try {
      final payload = _messages
          .where((m) => m.role == 'user' || m.role == 'assistant')
          .map((m) => {'role': m.role, 'content': m.text})
          .toList();
      final res = await ref.read(appDioClientProvider).post<Map<String, dynamic>>(
        AppConstants.aiSalesChatUrl,
        data: {'messages': payload, 'locale': 'ar'},
        receiveTimeout: const Duration(seconds: 90),
      );
      final data = res.data ?? const {};
      final cards = mapList(data['cards']).map(_OfferCard.fromJson).toList();
      setState(() {
        _messages.add(
          _ChatTurn(
            role: 'assistant',
            text: asText(data['reply'], 'تم تجهيز الخيارات.'),
            cards: cards,
          ),
        );
      });
    } catch (_) {
      setState(() {
        _messages.add(const _ChatTurn(role: 'assistant', text: 'تعذر الرد الآن. حاول مرة أخرى.'));
      });
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _book(_OfferCard card) {
    final href = card.href ?? nativePathFromIntent(card.type);
    context.push(nativePathFromHref(href));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F4FC),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: EdgeInsets.fromLTRB(16, MediaQuery.paddingOf(context).top + 12, 16, 18),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF1B0833), Color(0xFF2E1065), Color(0xFF6D28D9)],
              ),
            ),
            child: Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.of(context).maybePop(),
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                ),
                const CircleAvatar(
                  backgroundColor: Color(0xFFF59E0B),
                  child: Icon(Icons.auto_awesome, color: Color(0xFF1B0833)),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('مستشار لوناليزا', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18)),
                      Text('يقترح ويحجز بنفس منطق الموقع', style: TextStyle(color: Color(0xFFFDE68A), fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              itemCount: _messages.length + (_messages.length == 1 ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length) {
                  return Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final chip in _chips)
                        ActionChip(
                          label: Text(chip),
                          onPressed: () => _send(chip),
                        ),
                    ],
                  );
                }
                final message = _messages[index];
                final mine = message.role == 'user';
                return Align(
                  alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.86),
                    decoration: BoxDecoration(
                      color: mine ? LonalizaColors.royalPurple : Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF2E1065).withValues(alpha: 0.06),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          message.text,
                          style: TextStyle(color: mine ? Colors.white : LonalizaColors.ink, height: 1.45),
                        ),
                        for (final card in message.cards) ...[
                          const SizedBox(height: 10),
                          _CardTile(card: card, onBook: () => _book(card)),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _input,
                      decoration: InputDecoration(
                        hintText: 'اكتب وجهتك أو سؤالك',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(18),
                          borderSide: const BorderSide(color: Color(0xFFD8D0EE)),
                        ),
                      ),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _busy ? null : _send,
                    style: IconButton.styleFrom(backgroundColor: LonalizaColors.primary),
                    icon: _busy
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.send_rounded),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatTurn {
  const _ChatTurn({required this.role, required this.text, this.cards = const []});

  final String role;
  final String text;
  final List<_OfferCard> cards;
}

class _OfferCard {
  const _OfferCard({
    required this.type,
    required this.title,
    required this.price,
    required this.currency,
    this.image,
    this.href,
  });

  final String type;
  final String title;
  final double price;
  final String currency;
  final String? image;
  final String? href;

  factory _OfferCard.fromJson(Map<String, dynamic> json) {
    return _OfferCard(
      type: asText(json['type'], 'hotel'),
      title: asText(json['titleAr'] ?? json['titleEn'] ?? json['title'], 'عرض'),
      price: asDouble(json['clientPrice'] ?? json['price']) ?? 0,
      currency: asText(json['currency'], 'USD'),
      image: json['image']?.toString(),
      href: json['href']?.toString(),
    );
  }
}

class _CardTile extends StatelessWidget {
  const _CardTile({required this.card, required this.onBook});

  final _OfferCard card;
  final VoidCallback onBook;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF7F4FC),
        borderRadius: BorderRadius.circular(14),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (card.image != null && card.image!.isNotEmpty)
            Image.network(card.image!, height: 120, fit: BoxFit.cover),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(card.title, style: const TextStyle(fontWeight: FontWeight.w800)),
                const SizedBox(height: 4),
                Text(
                  card.price > 0 ? '${card.currency} ${card.price.toStringAsFixed(0)}' : 'يتحدد عند التأكيد',
                  style: const TextStyle(color: LonalizaColors.primary, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                FilledButton(
                  onPressed: onBook,
                  style: FilledButton.styleFrom(backgroundColor: LonalizaColors.royalPurple),
                  child: const Text('افتح الحجز'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
