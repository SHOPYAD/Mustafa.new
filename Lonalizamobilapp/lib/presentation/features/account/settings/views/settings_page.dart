import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:liotrip/core/extensions/context_l10n.dart';
import 'package:liotrip/domain/repositories/navigation_repository.dart';
import 'package:liotrip/presentation/providers/app_locale_provider.dart';
import 'package:liotrip/presentation/providers/router_providers.dart';
import '../../account_theme.dart';
import '../settings_theme.dart';
import '../widgets/settings_navigation_row.dart';
import '../widgets/settings_section_divider.dart';
import '../widgets/settings_toggle_row.dart';
import '../widgets/settings_value_row.dart';

class SettingsPage extends ConsumerStatefulWidget {
  const SettingsPage({super.key});

  @override
  ConsumerState<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends ConsumerState<SettingsPage> {
  bool _darkTheme = false;
  bool _tripGenie = true;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final currentLocale = ref.watch(appLocaleNotifierProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        surfaceTintColor: Colors.transparent,
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleSpacing: 0,
        leadingWidth: 56,
        leading: IconButton(
          padding: EdgeInsets.zero,
          alignment: Alignment.center,
          icon: Icon(
            Icons.arrow_back_rounded,
            size: 24,
            color: AccountTheme.textBody,
          ),
          onPressed: () => context.pop(),
        ),
        title: Text(l10n.settingsTitle, style: SettingsTheme.appBarTitle),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(
            height: 1,
            thickness: 1,
            color: SettingsTheme.sectionLine,
          ),
        ),
      ),
      body: ListView(
        children: [
          SettingsValueRow(
            label: l10n.languageLabel,
            value: currentLocale.languageCode == 'ar'
                ? l10n.arabic
                : l10n.english,
            onTap: () => _showLanguagePicker(context),
          ),
          SettingsValueRow(label: l10n.countryLabel, value: 'United States'),
          SettingsValueRow(label: l10n.currencyLabel, value: 'USD'),
          SettingsValueRow(
            label: l10n.unitsLabel,
            value: 'Imperial (miles, ft², lb)',
          ),
          SettingsValueRow(
            label: l10n.temperatureLabel,
            value: 'Fahrenheit (°F)',
          ),
          SettingsValueRow(
            label: l10n.timeFormatLabel,
            value: '12-hour (am/pm)',
          ),
          const SettingsSectionDivider(),
          SettingsNavigationRow(
            label: l10n.manageAccountLabel,
            onTap: () =>
                ref.read(navigationRepositoryProvider).goAccountManage(),
          ),
          SettingsNavigationRow(label: l10n.scanQrLabel),
          const SettingsSectionDivider(),
          SettingsToggleRow(
            label: l10n.darkThemeLabel,
            value: _darkTheme,
            onChanged: (v) => setState(() => _darkTheme = v),
          ),
          SettingsNavigationRow(label: l10n.notificationsLabel),
          SettingsToggleRow(
            label: l10n.tripGenieLabel,
            value: _tripGenie,
            onChanged: (v) => setState(() => _tripGenie = v),
          ),
          SettingsNavigationRow(label: l10n.accessibilityLabel),
          const SettingsSectionDivider(),
          SettingsNavigationRow(label: l10n.termsLabel),
          SettingsNavigationRow(label: l10n.privacyLabel),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  void _showLanguagePicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        final l10n = context.l10n;
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 12),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                l10n.languageLabel,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),
              ListTile(
                title: Text(l10n.english),
                trailing:
                    ref.watch(appLocaleNotifierProvider).languageCode == 'en'
                    ? const Icon(Icons.check, color: Colors.blue)
                    : null,
                onTap: () {
                  ref
                      .read(appLocaleNotifierProvider.notifier)
                      .setLocale(const Locale('en'));
                  Navigator.pop(context);
                },
              ),
              ListTile(
                title: Text(l10n.arabic),
                trailing:
                    ref.watch(appLocaleNotifierProvider).languageCode == 'ar'
                    ? const Icon(Icons.check, color: Colors.blue)
                    : null,
                onTap: () {
                  ref
                      .read(appLocaleNotifierProvider.notifier)
                      .setLocale(const Locale('ar'));
                  Navigator.pop(context);
                },
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }
}
