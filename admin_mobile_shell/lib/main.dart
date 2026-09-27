import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'admin_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF2E1065),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const AdminShellApp());
}

class AdminShellApp extends StatelessWidget {
  const AdminShellApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'إدارة لوناليزا',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2E1065),
          primary: const Color(0xFF2E1065),
          secondary: const Color(0xFFF59E0B),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF140522),
      ),
      locale: const Locale('ar'),
      supportedLocales: const [Locale('ar'), Locale('en'), Locale('tr')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: const AdminShellPage(),
    );
  }
}
