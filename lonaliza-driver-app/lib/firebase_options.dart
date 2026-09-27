import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;

class DefaultFirebaseOptions {
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDqZD0xZJ7Xzs_E_9oeuCKlsSw5AiQlEgU',
    appId: '1:463962875808:android:d07d37ff7492e610bb66c5',
    messagingSenderId: '463962875808',
    projectId: 'liotrip',
    storageBucket: 'liotrip.firebasestorage.app',
  );

  static const FirebaseOptions currentPlatform = android;
}
