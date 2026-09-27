# Keep Flutter classes and embedding
-keep class io.flutter.** { *; }
-keep class com.lonaliza.driver.** { *; }
-keep class * extends io.flutter.embedding.android.FlutterActivity { *; }
-keep class * implements io.flutter.plugin.common.PluginRegistry$PluginRegistrantCallback { *; }
-dontwarn io.flutter.**
