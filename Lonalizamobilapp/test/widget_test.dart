import 'package:flutter_test/flutter_test.dart';
import 'package:lonaliza/main.dart';

void main() {
  test('Lonaliza native app instantiates cleanly', () {
    const app = LonalizaApp();
    expect(app, isNotNull);
  });
}
