import 'package:flutter_test/flutter_test.dart';

import 'package:admin_mobile_shell/main.dart';

void main() {
  testWidgets('Admin shell app boots', (WidgetTester tester) async {
    await tester.pumpWidget(const AdminShellApp());
    expect(find.textContaining('لوناليزا'), findsWidgets);
  });
}
