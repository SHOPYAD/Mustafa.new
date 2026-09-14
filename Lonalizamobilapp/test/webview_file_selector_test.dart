import 'package:flutter_test/flutter_test.dart';
import 'package:lonaliza/shell/webview_file_selector.dart';

void main() {
  group('classifyWebViewAcceptTypes', () {
    test('maps photo accept filters to images', () {
      expect(
        classifyWebViewAcceptTypes(['image/jpeg', 'image/png', 'image/*']),
        WebViewMediaAccept.image,
      );
    });

    test('maps reel accept filters to video', () {
      expect(
        classifyWebViewAcceptTypes(['video/mp4', 'video/*', '.mov']),
        WebViewMediaAccept.video,
      );
    });

    test('maps mixed accept lists to media', () {
      expect(
        classifyWebViewAcceptTypes(['image/*', 'video/mp4']),
        WebViewMediaAccept.media,
      );
    });

    test('treats empty accept as any file', () {
      expect(classifyWebViewAcceptTypes(const []), WebViewMediaAccept.any);
    });
  });

  test('fileSelectorErrorJs emits a custom event the composer can hear', () {
    final js = fileSelectorErrorJs('تعذر الوصول إلى المعرض');
    expect(js, contains("lonaliza-file-picker-error"));
    expect(js, contains('تعذر الوصول إلى المعرض'));
  });
}
