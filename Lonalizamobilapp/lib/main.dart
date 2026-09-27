import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'lonaliza_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Set immersive edge-to-edge transparent system bars
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const LonalizaApp());
}

class LonalizaApp extends StatelessWidget {
  const LonalizaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'لوناليزا للسياحة',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'sans-serif',
        scaffoldBackgroundColor: const Color(0xFF140522),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2E1065),
          primary: const Color(0xFF2E1065),
          secondary: const Color(0xFFF59E0B),
        ),
      ),
      locale: const Locale('ar'),
      supportedLocales: const [
        Locale('ar'),
        Locale('en'),
        Locale('tr'),
        Locale('fr'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: const LonalizaShellPage(),
    );
  }
}
