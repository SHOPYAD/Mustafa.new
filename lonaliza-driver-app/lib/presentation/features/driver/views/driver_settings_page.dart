import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/driver_platform_constants.dart';
import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../../data/services/driver_push_service.dart';
import '../../../providers/app_locale_provider.dart';
import '../../../providers/driver_session_provider.dart';

class DriverSettingsPage extends ConsumerStatefulWidget {
  const DriverSettingsPage({super.key});

  @override
  ConsumerState<DriverSettingsPage> createState() => _DriverSettingsPageState();
}

class _DriverSettingsPageState extends ConsumerState<DriverSettingsPage> {
  bool _pushBusy = false;

  Future<void> _togglePush(bool enabled) async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    setState(() => _pushBusy = true);
    try {
      await ref
          .read(driverPushServiceProvider)
          .setEnabled(enabled, supplierId: supplierId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            enabled
                ? context.l10n.pushNotificationsEnabled
                : context.l10n.pushNotificationsDisabled,
          ),
        ),
      );
      setState(() {});
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) setState(() => _pushBusy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final locale = ref.watch(appLocaleNotifierProvider);
    final pushEnabled = ref.watch(driverPushServiceProvider).isEnabled;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.settingsTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              leading: const Icon(Icons.public, color: AppColors.purple),
              title: Text(l10n.platformLabel),
              subtitle: Text(
                '${DriverPlatformConstants.apiBaseUrl}\n${l10n.platformDriverOnlyHint}',
              ),
              isThreeLine: true,
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.language, color: AppColors.purple),
                  title: Text(l10n.languageLabel),
                  subtitle: Text(_languageLabel(l10n, locale.languageCode)),
                ),
                const Divider(height: 1),
                _LanguageTile(
                  label: l10n.english,
                  code: 'en',
                  selected: locale.languageCode == 'en',
                ),
                _LanguageTile(
                  label: l10n.arabic,
                  code: 'ar',
                  selected: locale.languageCode == 'ar',
                ),
                _LanguageTile(
                  label: l10n.turkish,
                  code: 'tr',
                  selected: locale.languageCode == 'tr',
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.notifications_outlined,
                  color: AppColors.purple),
              title: Text(l10n.notificationsLabel),
              subtitle: Text(l10n.pushNotificationsHint),
              trailing: Switch(
                value: pushEnabled,
                onChanged: _pushBusy ? null : _togglePush,
              ),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: () async {
              await ref.read(driverSessionProvider.notifier).clear();
              if (context.mounted) context.go('/splash');
            },
            icon: const Icon(Icons.logout),
            label: Text(l10n.logoutLabel),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  String _languageLabel(AppLocalizations l10n, String code) {
    return switch (code) {
      'ar' => l10n.arabic,
      'tr' => l10n.turkish,
      _ => l10n.english,
    };
  }
}

class _LanguageTile extends ConsumerWidget {
  const _LanguageTile({
    required this.label,
    required this.code,
    required this.selected,
  });

  final String label;
  final String code;
  final bool selected;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListTile(
      title: Text(label),
      trailing: selected
          ? const Icon(Icons.check_circle, color: AppColors.gold)
          : null,
      onTap: () =>
          ref.read(appLocaleNotifierProvider.notifier).setLocale(Locale(code)),
    );
  }
}
