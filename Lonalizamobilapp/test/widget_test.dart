import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:liotrip/core/bootstrap/app_bootstrap.dart';
import 'package:liotrip/presentation/features/home/views/home_page.dart';
import 'package:liotrip/presentation/features/home/widgets/home_header.dart';
import 'package:liotrip/presentation/providers/app_locale_provider.dart';
import 'package:liotrip/presentation/providers/bootstrap_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    HomePage.fetchRemote = false;
  });

  tearDown(() {
    HomePage.fetchRemote = true;
  });

  Future<Widget> homeApp() async {
    final prefs = await SharedPreferences.getInstance();
    return ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        bootstrapProvider.overrideWith((ref) async {
          return const AppBootstrap(
            services: ['flight', 'hotel'],
            locales: ['ar', 'en'],
            currencies: ['USD'],
          );
        }),
      ],
      child: const MaterialApp(home: HomePage(title: 'Lonaliza')),
    );
  }

  testWidgets('home page keeps the purple backdrop behind the white sheet', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(await homeApp());
    await tester.pump();

    final scaffold = tester.widget<Scaffold>(find.byType(Scaffold));

    expect(scaffold.backgroundColor, HomeHeader.brandBlue);
    expect(tester.widget<Text>(find.byKey(const ValueKey('home-title'))).data, 'Lonaliza');
    await tester.pumpWidget(const SizedBox.shrink());
  });

  testWidgets('header switches to the white style as soon as scrolling starts', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(await homeApp());
    await tester.pump();

    Text title = tester.widget<Text>(find.byKey(const ValueKey('home-title')));
    expect(title.data, 'Lonaliza');
    expect(title.style?.color, Colors.white);
    expect(find.byKey(const ValueKey('collapsed-header-search')), findsNothing);
    expect(find.byKey(const ValueKey('collapsed-header-actions')), findsNothing);

    final scrollable = tester.state<ScrollableState>(find.byType(Scrollable).first);
    scrollable.position.jumpTo(200);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 250));

    final scaffold = tester.widget<Scaffold>(find.byType(Scaffold));
    expect(scaffold.backgroundColor, Colors.white);
    final titleFinder = find.byKey(const ValueKey('home-title'));
    if (titleFinder.evaluate().isNotEmpty) {
      title = tester.widget<Text>(titleFinder);
      expect(title.style?.color, HomeHeader.brandBlue);
    }

    final sheetContainer = tester.widget<Container>(
      find.byWidgetPredicate((widget) {
        if (widget is! Container) return false;
        final decoration = widget.decoration;
        if (decoration is! BoxDecoration) return false;
        return decoration.borderRadius ==
            const BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            );
      }).first,
    );
    final sheetDecoration = sheetContainer.decoration! as BoxDecoration;
    expect(sheetDecoration.boxShadow, isEmpty);

    final navBar = tester.widget<NavigationBar>(find.byType(NavigationBar));
    expect(navBar.backgroundColor, Colors.white);
    expect(find.text('الرئيسية'), findsOneWidget);
    expect(find.text('حجوزاتي'), findsOneWidget);
    expect(find.text('مجتمع'), findsOneWidget);
    expect(find.text('رسائل'), findsOneWidget);
    expect(find.text('حسابي'), findsOneWidget);
    await tester.pumpWidget(const SizedBox.shrink());
  });
}
